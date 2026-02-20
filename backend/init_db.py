import pymysql
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from database.models import Base

load_dotenv()

# Parse DATABASE_URL to get host, user, password
db_url = os.getenv("DATABASE_URL")
# Example: mysql+pymysql://root:password@localhost/airline_db

try:
    # Extract credentials (basic parsing)
    # Assumes format: mysql+pymysql://user:password@host/dbname
    from urllib.parse import urlparse
    parsed = urlparse(db_url)
    username = parsed.username
    password = parsed.password
    host = parsed.hostname
    port = parsed.port or 3306
    dbname = parsed.path[1:] # remove leading /

    print(f"Connecting to MySQL at {host}...")
    
    # Connect to MySQL server (no database selected)
    conn = pymysql.connect(
        host=host,
        user=username,
        password=password,
        port=port
    )
    cursor = conn.cursor()
    
    # Create database if not exists
    print(f"Creating database '{dbname}' if not exists...")
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {dbname}")
    conn.commit()
    conn.close()
    
    print("Database created/verified.")
    
    # Now create tables using SQLAlchemy
    from database.connection import engine
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

except Exception as e:
    print(f"Error initializing database: {e}")
