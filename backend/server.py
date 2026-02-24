from fastapi import FastAPI, APIRouter, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from sqlalchemy.orm import Session
from sqlalchemy import text
import os
import logging
from database.connection import get_db, engine
from database import models
from admin_metrics import admin_router, admin_public_router
import uvicorn
from datetime import datetime, timedelta

# Configure logging FIRST
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create tables (if they don't exist)
try:
    models.Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified/created.")
except Exception as e:
    logger.error(f"Failed to create tables: {e}")

app = FastAPI()

# Configure CORS BEFORE including routers
origins = [o.strip() for o in os.environ.get('CORS_ORIGINS', 'http://localhost:3000, http://127.0.0.1:3000').split(',')]
if '*' in origins and os.environ.get('ALLOW_CREDENTIALS', 'true').lower() == 'true':
    # If using '*' with credentials, browsers will block. Default to specific locals if none provided.
    logger.warning("Wildcard CORS with credentials detected. Ensuring safety.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

@api_router.get("/")
async def root():
    return {"message": "SkyLux Airlines API"}

@api_router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    try:
        # Try to execute a simple query to check DB connection
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        raise HTTPException(status_code=500, detail="Database connection failed")

@api_router.get("/airports")
def get_airports(db: Session = Depends(get_db)):
    """Fetch all airports."""
    return db.query(models.Airport).all()

@api_router.get("/flights/search")
def search_flights(
    origin: str,
    destination: str,
    date: str,
    passengers: int = 1,
    db: Session = Depends(get_db)
):
    """Search for flights based on criteria."""
    if origin.upper() == destination.upper():
        raise HTTPException(status_code=400, detail="Origin and destination cannot be the same.")
        
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
        current_time = datetime.utcnow()

        # Helper function to query flights for a specific date range
        def get_flights(start_dt, end_dt):
            return db.query(models.Flight).filter(
                models.Flight.departure_airport_code == origin.upper(),
                models.Flight.arrival_airport_code == destination.upper(),
                models.Flight.departure_time >= max(current_time, start_dt), # No ghost flights
                models.Flight.departure_time <= end_dt
            ).all()

        # 1. Try exact day search
        start_of_day = datetime.combine(target_date, datetime.min.time())
        end_of_day = datetime.combine(target_date, datetime.max.time())
        flights = get_flights(start_of_day, end_of_day)

        # 2. Advanced Suggestions: Find at least 3 nearest flights if exact is empty
        if not flights:
            # First look in a wider window (+/- 3 days)
            start_window = datetime.combine(target_date - timedelta(days=3), datetime.min.time())
            end_window = datetime.combine(target_date + timedelta(days=3), datetime.max.time())
            flights = get_flights(start_window, end_window)
            
            # If still empty, find the first 5 upcoming flights regardless of date
            if not flights:
                flights = db.query(models.Flight).filter(
                    models.Flight.departure_airport_code == origin.upper(),
                    models.Flight.arrival_airport_code == destination.upper(),
                    models.Flight.departure_time >= current_time
                ).order_by(models.Flight.departure_time.asc()).limit(5).all()

        return flights
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")
    except Exception as e:
        logger.error(f"Error searching flights: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.post("/bookings")
def create_booking(booking_data: dict, db: Session = Depends(get_db)):
    """Create a new booking."""
    try:
        # Validate required fields
        flight_id = booking_data.get('flight_id')
        user_id = booking_data.get('user_id')
        if not flight_id or not user_id:
            raise HTTPException(status_code=400, detail="Missing flight_id or user_id")

        flight = db.query(models.Flight).filter(models.Flight.id == flight_id).first()
        if not flight:
            raise HTTPException(status_code=404, detail="Flight not found")

        # Create new booking with realistic fields
        new_booking = models.Booking(
            user_id=user_id,
            flight_id=flight_id,
            status=models.BookingStatus.confirmed,
            seat_class=booking_data.get('seat_class', 'economy'),
            passenger_count=booking_data.get('passengers', 1),
            total_price=booking_data.get('total_price', 0),
            passenger_name=booking_data.get('passenger_name'),
            passenger_phone=booking_data.get('passenger_phone'),
            meal_preference=booking_data.get('meal_preference'),
            seat_number=booking_data.get('seat_number'),
            wheelchair_service=booking_data.get('wheelchair_service', 0),
            insurance=booking_data.get('insurance', 0),
            priority_boarding=booking_data.get('priority_boarding', 0),
            extra_baggage=booking_data.get('extra_baggage', 0)
        )
        db.add(new_booking)
        db.commit()
        db.refresh(new_booking)
        
        return {
            "id": new_booking.id,
            "status": "confirmed",
            "message": f"Booking for {new_booking.passenger_name} confirmed!",
            "seat_number": new_booking.seat_number
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error creating booking: {e}")
        raise HTTPException(status_code=500, detail="Booking failed")

import re
import bcrypt

@api_router.post("/users")
def create_user(user_data: dict, db: Session = Depends(get_db)):
    """Create a new user."""
    try:
        email = user_data.get('email', '').strip().lower()
        name = user_data.get('name', '').strip()
        password = user_data.get('password', '')

        if not email or not name or not password:
            raise HTTPException(status_code=400, detail="Name, email, and password are required.")

        email_regex = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(email_regex, email):
            raise HTTPException(status_code=400, detail="Invalid email format.")

        # Check if user already exists
        existing_user = db.query(models.User).filter(models.User.email == email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered.")

        # Hash the password securely
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        new_user = models.User(
            name=name,
            email=email,
            password_hash=hashed,
            phone=user_data.get('phone')
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"id": new_user.id, "name": new_user.name, "email": new_user.email, "message": "Account created successfully!"}
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/users/login")
def login_user(user_data: dict, db: Session = Depends(get_db)):
    """Login a user."""
    try:
        email = user_data.get('email', '').strip().lower()
        password = user_data.get('password', '')

        if not email or not password:
            raise HTTPException(status_code=400, detail="Email and password are required.")

        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        # Verify password (supports both bcrypt hashed and legacy plain-text)
        is_valid = False
        try:
            is_valid = bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8'))
        except Exception:
            # Fallback for any legacy plain-text stored passwords
            is_valid = (user.password_hash == password)

        if not is_valid:
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        return {"id": user.id, "name": user.name, "email": user.email, "phone": user.phone or "", "message": "Login successful"}
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error logging in user: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
@api_router.get("/users/{user_id}")
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    """Fetch user profile."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }

@api_router.patch("/users/{user_id}")
def update_user_profile(user_id: int, user_data: dict, db: Session = Depends(get_db)):
    """Update user profile."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if 'name' in user_data:
        user.name = user_data['name']
    if 'phone' in user_data:
        user.phone = user_data['phone']
    if 'email' in user_data:
        # Check if email is already taken
        existing = db.query(models.User).filter(models.User.email == user_data['email'], models.User.id != user_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = user_data['email']
        
    db.commit()
    db.refresh(user)
    return {"id": user.id, "name": user.name, "email": user.email, "phone": user.phone, "message": "Profile updated successfully"}

@api_router.get("/users/{user_id}/bookings")
def get_user_bookings(user_id: int, db: Session = Depends(get_db)):
    """Fetch all bookings for a specific user, including flight details."""
    try:
        # Helper to safely get enum value or string
        def get_val(attr):
            if attr is None: return "unknown"
            return attr.value if hasattr(attr, 'value') else str(attr)

        bookings = db.query(models.Booking)\
                     .filter(models.Booking.user_id == user_id)\
                     .order_by(models.Booking.booking_date.desc())\
                     .all()
        
        result = []
        for b in bookings:
            flight = b.flight
            result.append({
                "id": b.id,
                "booking_date": b.booking_date.isoformat() if b.booking_date else None,
                "status": get_val(b.status),
                "seat_class": get_val(b.seat_class),
                "passenger_count": b.passenger_count or 1,
                "total_price": float(b.total_price) if b.total_price is not None else 0.0,
                "passenger_name": b.passenger_name or "Unknown",
                "passenger_phone": b.passenger_phone or "",
                "meal_preference": b.meal_preference or "standard",
                "seat_number": b.seat_number or "TBA",
                "flight": {
                    "id": flight.id,
                    "flight_number": flight.flight_number,
                    "airline": flight.airline,
                    "departure_airport_code": flight.departure_airport_code,
                    "arrival_airport_code": flight.arrival_airport_code,
                    "departure_time": flight.departure_time.isoformat() if flight.departure_time else None,
                    "arrival_time": flight.arrival_time.isoformat() if flight.arrival_time else None,
                    "status": get_val(flight.status)
                } if flight else None
            })
            
        return result
    except Exception as e:
        logger.error(f"Error fetching bookings for user {user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

# Include the routers in the main app
app.include_router(api_router)
app.include_router(admin_public_router)   # login (no auth)
app.include_router(admin_router, prefix="/api/admin", tags=["Admin Metrics"])

# AWS Lambda Handler
handler = Mangum(app)

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)