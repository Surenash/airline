"""
production_seed.py — SkyLux Airlines Production Data Seeder
============================================================
Generates:
  - 10 international hub airports
  - 25-aircraft fleet (4 realistic types)
  - ~6,000 flights over next 3 months (paired outbound + return per aircraft)
  - 500 users (1 admin + 499 passengers)
  - ~50,000+ bookings with 55-90% load factors per class
All FK/PK integrity maintained via ORM. No per-flight DB re-queries.
"""

import random
import bcrypt
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy import text
from database.connection import SessionLocal, engine
from database import models

random.seed(42)
NOW = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
END = NOW + timedelta(days=91)

# ─── Route graph (origin, dest) → flight_hours ────────────────────────────────
ROUTES = {
    ("JFK","LHR"): 7.5, ("LHR","JFK"): 8.0,
    ("LHR","FRA"): 2.0, ("FRA","LHR"): 2.0,
    ("LHR","CDG"): 1.5, ("CDG","LHR"): 1.5,
    ("CDG","FRA"): 1.5, ("FRA","CDG"): 1.5,
    ("JFK","SFO"): 6.0, ("SFO","JFK"): 5.5,
    ("DXB","LHR"): 7.0, ("LHR","DXB"): 7.0,
    ("DXB","CDG"): 6.5, ("CDG","DXB"): 6.5,
    ("DXB","FRA"): 6.0, ("FRA","DXB"): 6.0,
    ("SIN","HKG"): 3.5, ("HKG","SIN"): 3.5,
    ("SIN","NRT"): 7.0, ("NRT","SIN"): 7.0,
    ("HKG","NRT"): 4.0, ("NRT","HKG"): 4.5,
    ("SYD","SIN"): 8.0, ("SIN","SYD"): 8.0,
    ("SYD","HKG"): 9.0, ("HKG","SYD"): 9.5,
    ("JFK","DXB"):12.0, ("DXB","JFK"):13.0,
    ("JFK","SIN"):18.5, ("SIN","JFK"):17.5,
    ("JFK","HKG"):16.0, ("HKG","JFK"):16.5,
    ("JFK","NRT"):14.0, ("NRT","JFK"):13.5,
    ("LHR","SIN"):13.0, ("SIN","LHR"):13.5,
    ("LHR","SYD"):21.0, ("SYD","LHR"):21.5,
    ("LHR","NRT"):11.5, ("NRT","LHR"):12.5,
    ("LHR","HKG"):12.0, ("HKG","LHR"):12.5,
    ("SFO","SIN"):17.0, ("SIN","SFO"):15.5,
    ("SFO","NRT"):10.5, ("NRT","SFO"):11.0,
    ("SFO","HKG"):14.0, ("HKG","SFO"):13.5,
    ("SFO","SYD"):17.0, ("SYD","SFO"):16.0,
    ("DXB","SIN"): 7.0, ("SIN","DXB"): 7.0,
    ("DXB","SYD"):14.0, ("SYD","DXB"):14.5,
    ("DXB","NRT"):10.0, ("NRT","DXB"):10.5,
    ("DXB","HKG"): 8.0, ("HKG","DXB"): 8.0,
    ("FRA","SIN"):12.5, ("SIN","FRA"):12.0,
    ("FRA","HKG"):11.5, ("HKG","FRA"):12.0,
    ("FRA","JFK"): 9.0, ("JFK","FRA"): 8.5,
    ("FRA","NRT"):12.0, ("NRT","FRA"):12.5,
    ("CDG","SIN"):12.5, ("SIN","CDG"):12.0,
    ("CDG","JFK"): 8.5, ("JFK","CDG"): 7.5,
    ("CDG","NRT"):12.0, ("NRT","CDG"):12.5,
    ("CDG","HKG"):12.0, ("HKG","CDG"):12.5,
    ("CDG","SYD"):21.5, ("SYD","CDG"):22.0,
}

LONGHAUL = {"Boeing 787-9", "Airbus A350-1000"}

FIRST_NAMES = ["James","Mary","John","Patricia","Robert","Jennifer","Michael","Linda",
               "William","Barbara","David","Elizabeth","Richard","Susan","Joseph","Jessica",
               "Amir","Fatima","Wei","Mei","Raj","Priya","Omar","Layla","Yuki","Hana",
               "Luca","Sofia","Mateo","Valentina","Ahmed","Nour","Chen","Ivan","Ana","Chloe",
               "Ethan","Emma","Noah","Olivia","Ava","Isabella","Lucas","Mason","Logan"]
LAST_NAMES  = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis",
               "Wilson","Anderson","Thomas","Jackson","White","Harris","Martin","Thompson",
               "Al-Farsi","Nakamura","Zhang","Patel","Mueller","Rossi","Kowalski","Dubois",
               "Santos","Nguyen","Kim","Okonkwo","Petrov","Fernandez","Khan","Ibrahim",
               "Yamamoto","Singh","Ali","Ramos","Torres","Reyes","Cruz","Taylor","Moore"]
DOMAINS = ["gmail.com","yahoo.com","outlook.com","hotmail.com","icloud.com"]
PHONES  = ["+1","+44","+971","+65","+49","+33","+81","+61","+852","+91"]
MEALS   = ["standard","vegetarian","vegan","halal","kosher","gluten-free","child-meal"]

FILL_RATES = {
    models.FlightClassType.economy:         (0.60, 0.90),
    models.FlightClassType.premium_economy: (0.40, 0.75),
    models.FlightClassType.business:        (0.30, 0.65),
    models.FlightClassType.first:           (0.20, 0.55),
}
CLASS_MULT = {
    models.FlightClassType.economy:         Decimal("1.00"),
    models.FlightClassType.premium_economy: Decimal("1.50"),
    models.FlightClassType.business:        Decimal("2.50"),
    models.FlightClassType.first:           Decimal("4.00"),
}

def seat_id(cls, n):
    if cls == models.FlightClassType.first:
        return f"{n//2+1}{chr(65+n%2)}"
    if cls == models.FlightClassType.business:
        return f"{n//4+10}{chr(65+n%4)}"
    if cls == models.FlightClassType.premium_economy:
        return f"{n//6+20}{chr(65+n%6)}"
    return f"{n//6+30}{chr(65+n%6)}"

def available_routes(loc, longhaul_ok):
    return [(d, h) for (o, d), h in ROUTES.items()
            if o == loc and (h <= 9 or longhaul_ok)]

def run():
    db = SessionLocal()
    try:
        print("=" * 60)
        print("  SkyLux Airlines — Production Data Seeder")
        print("=" * 60)

        # 0. Wipe
        print("\n[1/7] Clearing all tables...")
        db.execute(text("SET FOREIGN_KEY_CHECKS=0;"))
        for t in ["bookings","flight_classes","flights","planes","users","airports"]:
            db.execute(text(f"TRUNCATE TABLE {t};"))
        db.execute(text("SET FOREIGN_KEY_CHECKS=1;"))
        db.commit()
        print("      ✓ Cleared.")

        # 1. Airports
        print("\n[2/7] Seeding airports...")
        ap_data = [
            ("JFK","New York","USA","John F. Kennedy International"),
            ("LHR","London","UK","Heathrow Airport"),
            ("DXB","Dubai","UAE","Dubai International"),
            ("SFO","San Francisco","USA","San Francisco International"),
            ("CDG","Paris","France","Charles de Gaulle"),
            ("SIN","Singapore","Singapore","Changi Airport"),
            ("NRT","Tokyo","Japan","Narita International"),
            ("SYD","Sydney","Australia","Kingsford Smith"),
            ("FRA","Frankfurt","Germany","Frankfurt Airport"),
            ("HKG","Hong Kong","China","Hong Kong International"),
        ]
        for code, city, country, name in ap_data:
            db.add(models.Airport(code=code, city=city, country=country, name=name))
        db.commit()
        print(f"      ✓ {len(ap_data)} airports.")

        # 2. Fleet
        print("\n[3/7] Seeding fleet...")
        specs = [
            ("Boeing 737-800",   144,12,0,  10,"B73",["JFK","LHR","FRA","CDG","SFO"]),
            ("Airbus A320neo",   120,16,0,   8,"A32",["DXB","SIN","HKG","NRT","SYD"]),
            ("Boeing 787-9",     198,30,8,   4,"B78",["JFK","LHR","DXB","SIN"]),
            ("Airbus A350-1000", 232,44,12,  3,"A35",["LHR","DXB","SIN","JFK"]),
        ]
        planes, plane_hubs = [], []
        ctr = 100
        for model, econ, bus, first, n, pfx, hubs in specs:
            for i in range(n):
                p = models.Plane(model=model, registration=f"SL-{pfx}{ctr}",
                                 capacity_economy=econ, capacity_business=bus,
                                 capacity_first=first, status="active")
                db.add(p); planes.append(p)
                plane_hubs.append(hubs[i % len(hubs)])
                ctr += 1
        db.commit()
        print(f"      ✓ {len(planes)} aircraft.")

        # 3. Flights + FlightClass (entirely in-memory, one commit at end)
        print("\n[4/7] Generating paired outbound+return flights...")
        fnum = 1001
        sched = {p.id: {"loc": plane_hubs[i], "free_at": NOW} for i, p in enumerate(planes)}
        longhaul_ok = {p.id: p.model in LONGHAUL for p in planes}

        # Build flat lists; flush only to get IDs
        flight_objs = []          # list of (Flight, Plane)
        for day in range(91):
            day_start = NOW + timedelta(days=day)
            for plane in planes:
                st = sched[plane.id]
                loc, free_at = st["loc"], st["free_at"]
                legs = random.randint(1, 2)
                legs_done = 0
                while legs_done < legs:
                    routes = available_routes(loc, longhaul_ok[plane.id])
                    if not routes:
                        break
                    dest, hrs = random.choice(routes)
                    gap = timedelta(hours=random.uniform(0.5, 2.5))
                    dept = max(free_at, day_start) + gap
                    if dept >= END:
                        break
                    arr = dept + timedelta(hours=hrs)
                    if arr >= END:
                        break

                    price = round(max(99.0, 80 * hrs + random.uniform(-30, 60)), 2)
                    f = models.Flight(
                        flight_number=f"SL{fnum}",
                        airline="SkyLux Airlines",
                        departure_airport_code=loc,
                        arrival_airport_code=dest,
                        departure_time=dept,
                        arrival_time=arr,
                        base_price=Decimal(str(price)),
                        status=models.FlightStatus.scheduled,
                        plane_id=plane.id,
                    )
                    db.add(f)
                    flight_objs.append((f, plane))
                    fnum += 1

                    # Return leg
                    ta = timedelta(hours=2.5 if hrs >= 12 else (1.5 if hrs >= 5 else 1.0))
                    ret_dept = arr + ta + timedelta(hours=random.uniform(0.5, 1.5))
                    ret_hrs  = ROUTES.get((dest, loc), hrs)
                    ret_arr  = ret_dept + timedelta(hours=ret_hrs)
                    if ret_dept < END:
                        price_r = round(max(99.0, 80 * ret_hrs + random.uniform(-30, 60)), 2)
                        fr = models.Flight(
                            flight_number=f"SL{fnum}",
                            airline="SkyLux Airlines",
                            departure_airport_code=dest,
                            arrival_airport_code=loc,
                            departure_time=ret_dept,
                            arrival_time=ret_arr,
                            base_price=Decimal(str(price_r)),
                            status=models.FlightStatus.scheduled,
                            plane_id=plane.id,
                        )
                        db.add(fr)
                        flight_objs.append((fr, plane))
                        fnum += 1
                        loc, free_at = loc, ret_arr
                    else:
                        loc, free_at = dest, arr
                    legs_done += 1
                sched[plane.id] = {"loc": loc, "free_at": free_at}

        db.flush()  # assign IDs to all Flight rows
        print(f"      → {len(flight_objs)} flights created — adding class seats...")

        # Build FlightClass rows from in-memory data (no DB queries)
        fc_rows = []
        # Map: flight_id → [(class_type, seats_available, price_multiplier)]
        flight_classes_map = {}  # flight_id → list of (class_type, seats, mult)
        for f_obj, plane in flight_objs:
            fid = f_obj.id
            rows = [
                (models.FlightClassType.economy,         plane.capacity_economy,  CLASS_MULT[models.FlightClassType.economy]),
                (models.FlightClassType.premium_economy, max(12, int((plane.capacity_economy+plane.capacity_business)*0.09)),
                                                         CLASS_MULT[models.FlightClassType.premium_economy]),
                (models.FlightClassType.business,        plane.capacity_business, CLASS_MULT[models.FlightClassType.business]),
            ]
            if plane.capacity_first > 0:
                rows.append((models.FlightClassType.first, plane.capacity_first, CLASS_MULT[models.FlightClassType.first]))
            flight_classes_map[fid] = rows
            for cls, seats, mult in rows:
                fc_rows.append(models.FlightClass(
                    flight_id=fid, class_type=cls,
                    price_multiplier=mult, seats_available=seats,
                ))

        db.add_all(fc_rows)
        db.commit()
        print(f"      ✓ {len(flight_objs)} flights, {len(fc_rows)} class entries.")

        # 4. Users
        print("\n[5/7] Seeding 500 users...")
        admin_pw = bcrypt.hashpw(b"admin123", bcrypt.gensalt()).decode()
        user_pw  = bcrypt.hashpw(b"password123", bcrypt.gensalt()).decode()
        db.add(models.User(name="SkyLux Admin", email="admin@skylux.com",
                           password_hash=admin_pw, phone="+1-800-SKYLUX",
                           created_at=NOW - timedelta(days=365)))
        passenger_users = []
        seen_emails = {"admin@skylux.com"}
        for i in range(499):
            fn, ln = random.choice(FIRST_NAMES), random.choice(LAST_NAMES)
            em = f"{fn.lower()}.{ln.lower()}{random.randint(1,9999)}@{random.choice(DOMAINS)}"
            if em in seen_emails:
                em = f"user{i}@{random.choice(DOMAINS)}"
            seen_emails.add(em)
            ph = f"{random.choice(PHONES)} {random.randint(100,999)}-{random.randint(1000,9999)}"
            u = models.User(name=f"{fn} {ln}", email=em, password_hash=user_pw,
                            phone=ph, created_at=NOW - timedelta(days=random.randint(1, 730)))
            db.add(u); passenger_users.append(u)
        db.commit()
        print(f"      ✓ 500 users (admin@skylux.com / admin123).")

        # 5. Bookings — fully in-memory, no per-flight DB queries
        print("\n[6/7] Generating bookings (in-memory, batched inserts)...")
        BATCH = 1000
        booking_batch = []
        total_bk = 0

        for f_obj, plane in flight_objs:
            fid = f_obj.id
            classes = flight_classes_map.get(fid, [])
            for cls, seats, mult in classes:
                lo, hi = FILL_RATES[cls]
                n_bk = max(1, int(seats * random.uniform(lo, hi)))
                for s in range(n_bk):
                    user = random.choice(passenger_users)
                    pax  = random.choices([1,2,3], weights=[.6,.3,.1])[0]
                    days_before = random.randint(1, 90)
                    bk_date = f_obj.departure_time - timedelta(days=days_before)
                    status = random.choices(
                        [models.BookingStatus.confirmed, models.BookingStatus.pending, models.BookingStatus.cancelled],
                        weights=[.70, .20, .10]
                    )[0]
                    base_p  = float(f_obj.base_price)
                    ticket  = round(base_p * float(mult) * pax, 2)
                    ins     = Decimal(str(round(random.uniform(15,45),2))) if random.random()<.35 else Decimal("0")
                    prio    = Decimal("12.00") if random.random()<.40 else Decimal("0")
                    bag     = Decimal(str(round(random.uniform(20,60),2))) if random.random()<.25 else Decimal("0")
                    wheel   = Decimal("30.00") if random.random()<.02 else Decimal("0")

                    booking_batch.append(models.Booking(
                        user_id=user.id, flight_id=fid,
                        booking_date=bk_date, status=status,
                        seat_class=cls, passenger_count=pax,
                        total_price=Decimal(str(ticket))+ins+prio+bag+wheel,
                        passenger_name=user.name, passenger_phone=user.phone,
                        meal_preference=random.choice(MEALS),
                        seat_number=seat_id(cls, s),
                        wheelchair_service=wheel, insurance=ins,
                        priority_boarding=prio, extra_baggage=bag,
                    ))
                    if len(booking_batch) >= BATCH:
                        db.add_all(booking_batch)
                        db.commit()
                        total_bk += len(booking_batch)
                        booking_batch = []
                        print(f"      → {total_bk:,} bookings committed...", end="\r")

        if booking_batch:
            db.add_all(booking_batch)
            db.commit()
            total_bk += len(booking_batch)
        print(f"      ✓ {total_bk:,} bookings seeded.             ")

        # 6. Realistic flight statuses
        print("\n[7/7] Applying flight status distribution...")
        near = db.query(models.Flight).filter(
            models.Flight.departure_time >= NOW,
            models.Flight.departure_time <= NOW + timedelta(days=3)
        ).all()
        delayed = cancelled = 0
        for f in near:
            r = random.random()
            if r < 0.04:
                f.status = models.FlightStatus.cancelled; cancelled += 1
            elif r < 0.18:
                f.status = models.FlightStatus.delayed;   delayed   += 1
        db.commit()
        print(f"      ✓ {delayed} delayed, {cancelled} cancelled.")

        print("\n" + "=" * 60)
        print("  ✅  Production Dataset Complete!")
        print("=" * 60)
        print(f"  Airports : {len(ap_data)}")
        print(f"  Aircraft : {len(planes)}")
        print(f"  Flights  : {len(flight_objs)}")
        print(f"  Users    : 500  (1 admin + 499 passengers)")
        print(f"  Bookings : {total_bk:,}")
        print(f"  Period   : {NOW.date()} → {END.date()}")
        print()
        print("  Admin  : admin@skylux.com  /  admin123")
        print("  Users  : password123  (all passenger accounts)")
        print("=" * 60)

    except Exception as e:
        import traceback
        print(f"\n❌ Error:\n{traceback.format_exc()}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run()
