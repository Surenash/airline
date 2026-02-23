# SkyLux Airlines 

A full-stack airline booking and management platform built with **React** (frontend) and **FastAPI + MySQL** (backend).

---

## Features

### Passenger Portal
- Search flights (one-way & round-trip) with real-time pricing per class
- Book flights with class selection (Economy / Premium Economy / Business / First Class)
- Manage profile and view booking history
- Dynamic pricing: prices displayed per class in search results and booking flow

### Admin Dashboard
- Live operational metrics: OTP, active flights, grounded aircraft
- Revenue analytics: daily revenue, load factor, WoW comparisons
- Hub traffic: departures and arrivals per airport
- Recent bookings and user activity

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, TailwindCSS, shadcn/ui    |
| Backend   | FastAPI, SQLAlchemy, Python 3.11+   |
| Database  | MySQL 8 (via Docker)                |
| Auth      | JWT (admin), localStorage (users)   |

---

## Getting Started

### Prerequisites
- Docker Desktop
- Python 3.11+
- Node.js 18+

### 1. Start the Database

```bash
docker-compose up -d
```

### 2. Set Up Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:
```
DATABASE_URL="mysql+pymysql://root:password@localhost/airline_db"
CORS_ORIGINS="http://localhost:3000"
ADMIN_SECRET_KEY="skylux-super-secret-jwt-key"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
ADMIN_TOKEN_EXPIRE_MINUTES=60
```

### 3. Seed the Database

```bash
cd backend
python production_seed.py
```

This generates ~6,000 flights, 500 users, and 70,000+ bookings over 3 months.

### 4. Start the Backend

```bash
python server.py
```
Backend runs at **http://localhost:8000**

### 5. Start the Frontend

```bash
cd frontend
npm install
npm start
```
Frontend runs at **http://localhost:3000**

---

## Default Credentials

| Role  | Email / Username     | Password    |
|-------|----------------------|-------------|
| Admin | `admin` (username)   | `admin123`  |
| User  | `admin@skylux.com`   | `admin123`  |
| Users | any seeded email     | `password123` |

Admin portal: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## Project Structure

```
airline/
├── backend/
│   ├── database/          # SQLAlchemy models, schema, connection
│   ├── admin_auth.py      # JWT admin authentication
│   ├── admin_metrics.py   # Admin dashboard API endpoints
│   ├── server.py          # Main FastAPI application
│   ├── production_seed.py # Production data seeder
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # FlightSearch, BookingFlow, Navbar, etc.
│   │   ├── pages/         # AdminDashboard, ProfilePage, etc.
│   │   └── api/           # Axios client
│   └── package.json
└── docker-compose.yml     # MySQL + database setup
```
