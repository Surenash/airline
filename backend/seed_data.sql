USE airline_db;

-- 1. Insert Airports
INSERT IGNORE INTO airports (code, city, country, name) VALUES
('JFK', 'New York', 'USA', 'John F. Kennedy International Airport'),
('LHR', 'London', 'UK', 'Heathrow Airport'),
('SFO', 'San Francisco', 'USA', 'San Francisco International Airport'),
('DXB', 'Dubai', 'UAE', 'Dubai International Airport'),
('CDG', 'Paris', 'France', 'Charles de Gaulle Airport');

-- 2. Insert Users
-- WARNING: In a real app password_hash should be a real hash. Here we use a dummy hash for sample data.
INSERT IGNORE INTO users (id, name, email, password_hash, phone, created_at) VALUES
(1, 'John Doe', 'john@example.com', 'hashed_pwd_123', '+1234567890', NOW()),
(2, 'Jane Smith', 'jane@example.com', 'hashed_pwd_456', '+0987654321', NOW());

-- 3. Insert Flights
INSERT IGNORE INTO flights (id, flight_number, airline, departure_airport_code, arrival_airport_code, departure_time, arrival_time, base_price, status) VALUES
(1, 'SL101', 'SkyLux Airlines', 'JFK', 'LHR', '2024-12-01 18:00:00', '2024-12-02 06:00:00', 450.00, 'scheduled'),
(2, 'SL202', 'SkyLux Airlines', 'LHR', 'DXB', '2024-12-05 10:00:00', '2024-12-05 20:00:00', 550.00, 'scheduled'),
(3, 'SL303', 'SkyLux Airlines', 'SFO', 'JFK', '2024-12-10 08:00:00', '2024-12-10 16:30:00', 300.00, 'scheduled'),
(4, 'SL404', 'SkyLux Airlines', 'DXB', 'CDG', '2024-12-15 14:00:00', '2024-12-15 19:00:00', 400.00, 'scheduled');

-- 4. Insert Flight Classes
INSERT IGNORE INTO flight_classes (id, flight_id, class_type, price_multiplier, seats_available) VALUES
(1, 1, 'economy', 1.00, 150),
(2, 1, 'business', 2.50, 30),
(3, 1, 'first', 4.00, 10),
(4, 2, 'economy', 1.00, 200),
(5, 2, 'business', 2.50, 40),
(6, 3, 'economy', 1.00, 180),
(7, 3, 'premium-economy', 1.50, 40),
(8, 4, 'economy', 1.00, 160),
(9, 4, 'business', 2.50, 20);

-- 5. Insert Bookings
INSERT IGNORE INTO bookings (id, user_id, flight_id, booking_date, status, seat_class, passenger_count, total_price) VALUES
(1, 1, 1, NOW(), 'confirmed', 'economy', 1, 450.00),
(2, 2, 3, NOW(), 'confirmed', 'premium-economy', 2, 900.00);
