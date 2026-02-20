from fastapi import FastAPI, APIRouter, Depends, HTTPException
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
import os
import logging
from database.connection import get_db, engine
from database import models
import uvicorn

# Create tables (if they don't exist - usually better to use migrations in prod)
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

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
    # Basic implementation - can be expanded with more filters
    try:
        # Parse date if strictly needed, or rely on string comparison for MVP
        flights = db.query(models.Flight).filter(
            models.Flight.departure_airport_code == origin.upper(),
            models.Flight.arrival_airport_code == destination.upper(),
            # For simplicity in MVP, we might filter by date more loosely or exact match
            # models.Flight.departure_time >= date_start, ...
        ).all()
        return flights
    except Exception as e:
        logger.error(f"Error searching flights: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.post("/bookings")
def create_booking(booking_data: dict, db: Session = Depends(get_db)):
    """Create a new booking."""
    # TODO: Use Pydantic schema for validation
    try:
        # Placeholder logic
        # user = db.query(models.User).filter(models.User.email == booking_data['email']).first()
        # if not user: create user...
        # new_booking = models.Booking(...)
        # db.add(new_booking)
        # db.commit()
        return {"id": 123, "status": "confirmed", "message": "Booking created (mock)"}
    except Exception as e:
        logger.error(f"Error creating booking: {e}")
        raise HTTPException(status_code=500, detail="Booking failed")

@api_router.post("/users")
def create_user(user_data: dict, db: Session = Depends(get_db)):
    """Create a new user."""
    try:
        # Check if user exists
        existing_user = db.query(models.User).filter(models.User.email == user_data['email']).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
            
        new_user = models.User(
            name=user_data['name'],
            email=user_data['email'],
            password_hash=user_data['password'], # In prod, hash this!
            phone=user_data.get('phone')
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"id": new_user.id, "name": new_user.name, "email": new_user.email, "message": "User created successfully"}
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8002, reload=True)