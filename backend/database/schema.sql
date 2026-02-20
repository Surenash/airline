-- Airline Reservation System Schema

CREATE DATABASE IF NOT EXISTS airline_db;
USE airline_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Airports Table
CREATE TABLE IF NOT EXISTS airports (
    code CHAR(3) PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL
);

-- 3. Flights Table
CREATE TABLE IF NOT EXISTS flights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    flight_number VARCHAR(20) NOT NULL,
    airline VARCHAR(100) DEFAULT 'SkyLux Airlines',
    departure_airport_code CHAR(3) NOT NULL,
    arrival_airport_code CHAR(3) NOT NULL,
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    status ENUM('scheduled', 'delayed', 'cancelled') DEFAULT 'scheduled',
    FOREIGN KEY (departure_airport_code) REFERENCES airports(code),
    FOREIGN KEY (arrival_airport_code) REFERENCES airports(code)
);

-- 4. FlightClasses Table (Inventory)
CREATE TABLE IF NOT EXISTS flight_classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    flight_id INT NOT NULL,
    class_type ENUM('economy', 'premium-economy', 'business', 'first') NOT NULL,
    price_multiplier DECIMAL(3, 2) DEFAULT 1.00,
    seats_available INT NOT NULL,
    FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE CASCADE
);

-- 5. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    flight_id INT NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('confirmed', 'cancelled', 'pending') DEFAULT 'confirmed',
    seat_class ENUM('economy', 'premium-economy', 'business', 'first') NOT NULL,
    passenger_count INT DEFAULT 1,
    total_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (flight_id) REFERENCES flights(id)
);

-- Internal: Seed Data (Optional - specific to SkyLux Airlines mock data)
INSERT IGNORE INTO airports (code, city, country, name) VALUES
('JFK', 'New York', 'USA', 'John F. Kennedy International Airport'),
('LHR', 'London', 'UK', 'Heathrow Airport'),
('CDG', 'Paris', 'France', 'Charles de Gaulle Airport'),
('DXB', 'Dubai', 'UAE', 'Dubai International Airport'),
('HND', 'Tokyo', 'Japan', 'Haneda Airport'),
('SIN', 'Singapore', 'Singapore', 'Changi Airport'),
('MLE', 'Male', 'Maldives', 'Velana International Airport');
