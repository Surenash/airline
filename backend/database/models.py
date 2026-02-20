from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum, DECIMAL
from sqlalchemy.orm import relationship
from .connection import Base
from datetime import datetime
import enum

class FlightStatus(enum.Enum):
    scheduled = "scheduled"
    delayed = "delayed"
    cancelled = "cancelled"

class FlightClassType(enum.Enum):
    economy = "economy"
    premium_economy = "premium-economy"
    business = "business"
    first = "first"

class BookingStatus(enum.Enum):
    confirmed = "confirmed"
    cancelled = "cancelled"
    pending = "pending"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow)

    bookings = relationship("Booking", back_populates="user")

class Airport(Base):
    __tablename__ = "airports"

    code = Column(String(3), primary_key=True, index=True)
    city = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    name = Column(String(255), nullable=False)

class Flight(Base):
    __tablename__ = "flights"

    id = Column(Integer, primary_key=True, index=True)
    flight_number = Column(String(20), nullable=False)
    airline = Column(String(100), default="SkyLux Airlines")
    departure_airport_code = Column(String(3), ForeignKey("airports.code"), nullable=False)
    arrival_airport_code = Column(String(3), ForeignKey("airports.code"), nullable=False)
    departure_time = Column(DateTime, nullable=False)
    arrival_time = Column(DateTime, nullable=False)
    base_price = Column(DECIMAL(10, 2), nullable=False)
    status = Column(Enum(FlightStatus), default=FlightStatus.scheduled)

    departure_airport = relationship("Airport", foreign_keys=[departure_airport_code])
    arrival_airport = relationship("Airport", foreign_keys=[arrival_airport_code])
    classes = relationship("FlightClass", back_populates="flight")
    bookings = relationship("Booking", back_populates="flight")

class FlightClass(Base):
    __tablename__ = "flight_classes"

    id = Column(Integer, primary_key=True, index=True)
    flight_id = Column(Integer, ForeignKey("flights.id"), nullable=False)
    class_type = Column(Enum(FlightClassType), nullable=False)
    price_multiplier = Column(DECIMAL(3, 2), default=1.00)
    seats_available = Column(Integer, nullable=False)

    flight = relationship("Flight", back_populates="classes")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    flight_id = Column(Integer, ForeignKey("flights.id"), nullable=False)
    booking_date = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(BookingStatus), default=BookingStatus.confirmed)
    seat_class = Column(Enum(FlightClassType), nullable=False)
    passenger_count = Column(Integer, default=1)
    total_price = Column(DECIMAL(10, 2), nullable=False)

    user = relationship("User", back_populates="bookings")
    flight = relationship("Flight", back_populates="bookings")
