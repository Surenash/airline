from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from database.connection import get_db
from database import models
from admin_auth import require_admin, create_admin_token, ADMIN_USERNAME, ADMIN_PASSWORD
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


def _val(v):
    """Return the string value of an enum or a plain string (DB may return either)."""
    if v is None:
        return "unknown"
    return v.value if hasattr(v, "value") else str(v)


# All routes in this router require a valid admin JWT
admin_router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
    dependencies=[Depends(require_admin)],
)

# Public login router (no auth dependency)
admin_public_router = APIRouter(prefix="/api/admin", tags=["admin-auth"])


@admin_public_router.post("/login")
def admin_login(credentials: dict):
    """Validate admin credentials and return a JWT access token."""
    username = credentials.get("username", "").strip()
    password = credentials.get("password", "")

    if username != ADMIN_USERNAME or password != ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials.",
        )

    token = create_admin_token()
    return {"access_token": token, "token_type": "bearer"}


@admin_router.get("/verify")
def verify_token():
    """Returns 200 if the token is valid — used by the frontend to check sessions."""
    return {"status": "ok", "message": "Token is valid"}


@admin_router.get("/stats")
def get_overview_stats(db: Session = Depends(get_db)):
    """Return high-level KPI statistics for the management dashboard."""
    try:
        total_bookings = db.query(func.count(models.Booking.id)).scalar() or 0
        total_revenue = db.query(func.sum(models.Booking.total_price)).scalar() or 0
        total_users = db.query(func.count(models.User.id)).scalar() or 0
        total_flights = db.query(func.count(models.Flight.id)).scalar() or 0

        confirmed_bookings = (
            db.query(func.count(models.Booking.id))
            .filter(models.Booking.status == models.BookingStatus.confirmed)
            .scalar()
            or 0
        )
        cancelled_bookings = (
            db.query(func.count(models.Booking.id))
            .filter(models.Booking.status == models.BookingStatus.cancelled)
            .scalar()
            or 0
        )
        pending_bookings = (
            db.query(func.count(models.Booking.id))
            .filter(models.Booking.status == models.BookingStatus.pending)
            .scalar()
            or 0
        )

        avg_booking_value = float(total_revenue) / total_bookings if total_bookings > 0 else 0

        return {
            "total_bookings": total_bookings,
            "total_revenue": float(total_revenue),
            "total_users": total_users,
            "total_flights": total_flights,
            "avg_booking_value": round(avg_booking_value, 2),
            "booking_status": {
                "confirmed": confirmed_bookings,
                "cancelled": cancelled_bookings,
                "pending": pending_bookings,
            },
        }
    except Exception as e:
        logger.error(f"Error fetching overview stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch stats")


@admin_router.get("/flights/status")
def get_flight_status_overview(db: Session = Depends(get_db)):
    """Return flight counts grouped by status."""
    try:
        results = (
            db.query(models.Flight.status, func.count(models.Flight.id).label("count"))
            .group_by(models.Flight.status)
            .all()
        )
        return [{"status": _val(r.status), "count": r.count} for r in results]
    except Exception as e:
        logger.error(f"Error fetching flight status overview: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch flight status")


@admin_router.get("/revenue/by-class")
def get_revenue_by_class(db: Session = Depends(get_db)):
    """Return total revenue breakdown by seat class."""
    try:
        results = (
            db.query(
                models.Booking.seat_class,
                func.sum(models.Booking.total_price).label("revenue"),
                func.count(models.Booking.id).label("count"),
            )
            .group_by(models.Booking.seat_class)
            .all()
        )
        return [
            {
                "seat_class": _val(r.seat_class),
                "revenue": float(r.revenue),
                "count": r.count,
            }
            for r in results
        ]
    except Exception as e:
        logger.error(f"Error fetching revenue by class: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch revenue breakdown")


@admin_router.get("/routes/top")
def get_top_routes(db: Session = Depends(get_db)):
    """Return the top 8 most booked routes."""
    try:
        results = (
            db.query(
                models.Flight.departure_airport_code,
                models.Flight.arrival_airport_code,
                func.count(models.Booking.id).label("bookings"),
                func.sum(models.Booking.total_price).label("revenue"),
            )
            .join(models.Booking, models.Flight.id == models.Booking.flight_id)
            .group_by(
                models.Flight.departure_airport_code,
                models.Flight.arrival_airport_code,
            )
            .order_by(func.count(models.Booking.id).desc())
            .limit(8)
            .all()
        )
        return [
            {
                "route": f"{r.departure_airport_code} → {r.arrival_airport_code}",
                "bookings": r.bookings,
                "revenue": float(r.revenue),
            }
            for r in results
        ]
    except Exception as e:
        logger.error(f"Error fetching top routes: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch top routes")


@admin_router.get("/revenue/monthly")
def get_monthly_revenue(db: Session = Depends(get_db)):
    """Return monthly revenue for the last 12 months."""
    try:
        results = db.execute(
            text(
                """
                SELECT
                    DATE_FORMAT(booking_date, '%Y-%m') AS month,
                    SUM(total_price) AS revenue,
                    COUNT(*) AS bookings
                FROM bookings
                WHERE booking_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                GROUP BY month
                ORDER BY month ASC
                """
            )
        ).fetchall()
        return [
            {"month": r[0], "revenue": float(r[1]), "bookings": r[2]}
            for r in results
        ]
    except Exception as e:
        logger.error(f"Error fetching monthly revenue: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch monthly revenue")


@admin_router.get("/users/recent")
def get_recent_users(limit: int = 10, db: Session = Depends(get_db)):
    """Return the most recently registered users."""
    try:
        users = (
            db.query(models.User)
            .order_by(models.User.created_at.desc())
            .limit(limit)
            .all()
        )
        return [
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "phone": u.phone,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ]
    except Exception as e:
        logger.error(f"Error fetching recent users: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch users")


@admin_router.get("/bookings/recent")
def get_recent_bookings(limit: int = 20, db: Session = Depends(get_db)):
    """Return the most recent bookings with user and flight details."""
    try:
        bookings = (
            db.query(models.Booking)
            .order_by(models.Booking.booking_date.desc())
            .limit(limit)
            .all()
        )
        result = []
        for b in bookings:
            flight = b.flight
            user = b.user
            result.append(
                {
                    "id": b.id,
                    "booking_date": b.booking_date.isoformat() if b.booking_date else None,
                    "status": _val(b.status),
                    "seat_class": _val(b.seat_class),
                    "passenger_count": b.passenger_count,
                    "total_price": float(b.total_price),
                    "passenger_name": b.passenger_name or (user.name if user else "Unknown"),
                    "user": {"id": user.id, "name": user.name, "email": user.email} if user else None,
                    "flight": {
                        "flight_number": flight.flight_number,
                        "departure_airport_code": flight.departure_airport_code,
                        "arrival_airport_code": flight.arrival_airport_code,
                    }
                    if flight
                    else None,
                }
            )
        return result
    except Exception as e:
        logger.error(f"Error fetching recent bookings: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch recent bookings")

# ── Fleet & Scheduling Management ───────────────────────────────────────────

@admin_router.get("/planes")
def list_planes(db: Session = Depends(get_db)):
    """List all aircraft in the fleet."""
    planes = db.query(models.Plane).all()
    result = []
    for p in planes:
        # Get next flight for this plane
        next_flight = db.query(models.Flight).filter(
            models.Flight.plane_id == p.id,
            models.Flight.departure_time >= datetime.utcnow()
        ).order_by(models.Flight.departure_time.asc()).first()

        result.append({
            "id": p.id,
            "model": p.model,
            "registration": p.registration,
            "capacity": {
                "economy": p.capacity_economy,
                "business": p.capacity_business,
                "first": p.capacity_first,
                "total": p.capacity_economy + p.capacity_business + p.capacity_first
            },
            "status": p.status,
            "next_flight": {
                "flight_number": next_flight.flight_number,
                "route": f"{next_flight.departure_airport_code}→{next_flight.arrival_airport_code}",
                "departure": next_flight.departure_time.isoformat()
            } if next_flight else None
        })
    return result

@admin_router.get("/flights")
def list_all_flights(limit: int = 100, db: Session = Depends(get_db)):
    """List all flights with plane and capacity details."""
    flights = db.query(models.Flight).order_by(models.Flight.departure_time.desc()).limit(limit).all()
    result = []
    for f in flights:
        plane = f.plane
        result.append({
            "id": f.id,
            "flight_number": f.flight_number,
            "route": f"{f.departure_airport_code}→{f.arrival_airport_code}",
            "departure_time": f.departure_time.isoformat(),
            "arrival_time": f.arrival_time.isoformat(),
            "base_price": float(f.base_price),
            "status": _val(f.status),
            "plane": {
                "model": plane.model,
                "registration": plane.registration
            } if plane else None
        })
    return result

@admin_router.patch("/planes/{plane_id}")
def update_plane_status(plane_id: int, data: dict, db: Session = Depends(get_db)):
    plane = db.query(models.Plane).filter(models.Plane.id == plane_id).first()
    if not plane: raise HTTPException(status_code=404, detail="Plane not found")
    if 'status' in data: plane.status = data['status']
    db.commit()
    return {"message": "Plane updated"}


# ── Executive Ops Dashboard ──────────────────────────────────────────────────

@admin_router.get("/ops")
def get_ops_summary(db: Session = Depends(get_db)):
    """On-Time Performance, active/grounded/delayed flight counts."""
    try:
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0)
        today_end = today_start + timedelta(days=1)

        total_today = db.query(func.count(models.Flight.id)).filter(
            models.Flight.departure_time >= today_start,
            models.Flight.departure_time < today_end
        ).scalar() or 1
        
        scheduled = (
            db.query(func.count(models.Flight.id))
            .filter(
                models.Flight.status == models.FlightStatus.scheduled,
                models.Flight.departure_time >= today_start,
                models.Flight.departure_time < today_end
            ).scalar() or 0
        )
        delayed = (
            db.query(func.count(models.Flight.id))
            .filter(
                models.Flight.status == models.FlightStatus.delayed,
                models.Flight.departure_time >= today_start,
                models.Flight.departure_time < today_end
            ).scalar() or 0
        )
        
        # Real fleet stats from Plane model
        total_fleet = db.query(func.count(models.Plane.id)).scalar() or 0
        grounded_planes = db.query(func.count(models.Plane.id)).filter(models.Plane.status != "active").scalar() or 0
        
        otp = round((scheduled / total_today) * 100, 1)
        delay_pct = round((delayed / total_today) * 100, 1) if total_today > 0 else 0
        
        return {
            "otp": otp,
            "active_flights": scheduled,
            "grounded_aircraft": grounded_planes,
            "weather_delays": delayed,
            "weather_delay_pct": delay_pct,
            "total_in_fleet": total_fleet,
        }
    except Exception as e:
        logger.error(f"Error fetching ops summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch ops summary")


@admin_router.get("/hubs")
def get_hub_traffic(db: Session = Depends(get_db)):
    """Top-10 hubs by departures and arrivals."""
    try:
        departures = (
            db.query(
                models.Flight.departure_airport_code.label("hub"),
                func.count(models.Flight.id).label("count"),
            )
            .group_by(models.Flight.departure_airport_code)
            .order_by(func.count(models.Flight.id).desc())
            .limit(10)
            .all()
        )
        arrivals = (
            db.query(
                models.Flight.arrival_airport_code.label("hub"),
                func.count(models.Flight.id).label("count"),
            )
            .group_by(models.Flight.arrival_airport_code)
            .order_by(func.count(models.Flight.id).desc())
            .limit(10)
            .all()
        )
        return {
            "departures": [{"hub": r.hub, "count": r.count} for r in departures],
            "arrivals":   [{"hub": r.hub, "count": r.count} for r in arrivals],
        }
    except Exception as e:
        logger.error(f"Error fetching hub traffic: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch hub data")


@admin_router.get("/financials")
def get_financials(db: Session = Depends(get_db)):
    """Daily passenger revenue with week-over-week comparison, plus derived metrics."""
    try:
        today_results = db.execute(text("""
            SELECT COALESCE(SUM(total_price),0), COALESCE(SUM(passenger_count),0)
            FROM bookings
            WHERE DATE(booking_date) = CURDATE()
        """)).fetchone()
        today_rev = float(today_results[0])
        today_pax = int(today_results[1])

        last_week_results = db.execute(text("""
            SELECT COALESCE(SUM(total_price),0), COALESCE(SUM(passenger_count),0)
            FROM bookings
            WHERE DATE(booking_date) = CURDATE() - INTERVAL 7 DAY
        """)).fetchone()
        last_week_rev = float(last_week_results[0])

        # Daily trend — last 7 days
        trend = db.execute(text("""
            SELECT DATE(booking_date) AS day,
                   COALESCE(SUM(total_price),0) AS revenue,
                   COALESCE(SUM(passenger_count),0) AS passengers
            FROM bookings
            WHERE booking_date >= CURDATE() - INTERVAL 6 DAY
            GROUP BY day
            ORDER BY day ASC
        """)).fetchall()

        # WoW change %
        wow_pct = None
        if last_week_rev > 0:
            wow_pct = round(((today_rev - last_week_rev) / last_week_rev) * 100, 1)

        # Derived proxies (typical airline ratios)
        total_rev = float(db.query(func.sum(models.Booking.total_price)).scalar() or 0)
        cargo_rev = round(total_rev * 0.12, 2)   # ~12% of pax rev is cargo
        fuel_cost = round(total_rev * 0.28, 2)    # ~28% of rev goes to fuel

        # Load factor: pax boarded / (active flights * avg capacity 180)
        total_pax = int(db.query(func.sum(models.Booking.passenger_count)).scalar() or 0)
        active_flights = (
            db.query(func.count(models.Flight.id))
            .filter(models.Flight.status == models.FlightStatus.scheduled)
            .scalar() or 1
        )
        load_factor = min(round((total_pax / (active_flights * 180)) * 100, 1), 99.9)

        return {
            "daily_revenue": today_rev,
            "daily_passengers": today_pax,
            "wow_pct": wow_pct,
            "cargo_revenue": cargo_rev,
            "fuel_cost": fuel_cost,
            "total_passengers": total_pax,
            "load_factor": load_factor,
            "daily_trend": [
                {"day": str(r[0]), "revenue": float(r[1]), "passengers": int(r[2])}
                for r in trend
            ],
        }
    except Exception as e:
        logger.error(f"Error fetching financials: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch financials")
