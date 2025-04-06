#!/usr/bin/env python

"""
Database reset utility script.

This script provides options to:
1. Drop all tables in the database
2. Truncate all tables (keeping the schema intact)
3. Optionally run the seed script after reset

Usage:
    python reset_db.py --drop  # Drop all tables and recreate schema
    python reset_db.py --truncate  # Empty all tables but keep schema
    python reset_db.py --drop --seed  # Drop tables and seed with dummy data
"""

import argparse
import logging
import os
import sys
import time
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError

# Add the parent directory to the path so we can import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.db.base_class import Base
from app.db.seed_db import seed_db
import app.db.models  # Import models to register them with SQLAlchemy

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def create_db_connection():
    """Create a custom database connection for seeding the database."""
    # Database connection parameters
    POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_SERVER = os.getenv("POSTGRES_SERVER", "localhost")  # Use localhost for direct connection
    POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB = os.getenv("POSTGRES_DB", "restaurant_app")
    
    # Create database URL
    SQLALCHEMY_DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"
    
    # Create engine
    return create_engine(SQLALCHEMY_DATABASE_URL)


def wait_for_db(max_retries=10, retry_interval=1):
    """Wait for database to be available."""
    for attempt in range(max_retries):
        try:
            # Try to connect to the database using our custom connection function
            engine = create_db_connection()
            with engine.connect() as conn:
                logger.info("Successfully connected to the database")
                return engine
        except OperationalError as e:
            logger.warning(f"Database connection failed (attempt {attempt+1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                logger.info(f"Retrying in {retry_interval} seconds...")
                time.sleep(retry_interval)
            else:
                logger.error(f"Failed to connect to database after {max_retries} attempts")
                return None
    return None


def drop_all_tables(engine):
    """Drop all tables in the database."""
    try:
        logger.info("Dropping all tables...")
        Base.metadata.drop_all(bind=engine)
        logger.info("All tables dropped successfully")
        return True
    except Exception as e:
        logger.error(f"Error dropping tables: {e}")
        return False


def truncate_all_tables(engine):
    """Truncate all tables in the database."""
    try:
        inspector = inspect(engine)
        table_names = inspector.get_table_names()

        with engine.begin() as conn:
            # Disable foreign key constraints temporarily
            conn.execute(text("SET CONSTRAINTS ALL DEFERRED"))

            for table in table_names:
                logger.info(f"Truncating table: {table}")
                conn.execute(text(f'TRUNCATE TABLE "{table}" CASCADE'))

            # Re-enable foreign key constraints
            conn.execute(text("SET CONSTRAINTS ALL IMMEDIATE"))

        logger.info("All tables truncated successfully")
        return True
    except Exception as e:
        logger.error(f"Error truncating tables: {e}")
        return False


def recreate_schema(engine):
    """Recreate the database schema."""
    try:
        logger.info("Creating database schema...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema created successfully")
        return True
    except Exception as e:
        logger.error(f"Error creating database schema: {e}")
        return False


def main():
    """Main function to handle command line arguments and execute requested actions."""
    parser = argparse.ArgumentParser(description="Reset the database and optionally seed it with dummy data")
    parser.add_argument("--drop", action="store_true", help="Drop all tables and recreate schema")
    parser.add_argument("--truncate", action="store_true", help="Truncate all tables but keep schema")
    parser.add_argument("--seed", action="store_true", help="Seed the database with dummy data after reset")
    args = parser.parse_args()

    # Validate arguments
    if not (args.drop or args.truncate):
        logger.error("You must specify either --drop or --truncate")
        parser.print_help()
        return False

    if args.drop and args.truncate:
        logger.error("You cannot specify both --drop and --truncate")
        parser.print_help()
        return False

    # Wait for database connection and get engine
    engine = wait_for_db()
    if not engine:
        return False

    success = False

    # Perform the requested reset action
    if args.drop:
        if drop_all_tables(engine):
            success = recreate_schema(engine)
    elif args.truncate:
        success = truncate_all_tables(engine)

    # Seed the database if requested and reset was successful
    if success and args.seed:
        logger.info("Seeding database with dummy data...")
        if seed_db():
            logger.info("Database seeded successfully")
        else:
            logger.error("Failed to seed database")
            success = False

    if success:
        logger.info("Database reset completed successfully")
    else:
        logger.error("Database reset failed")

    return success


if __name__ == "__main__":
    sys.exit(0 if main() else 1)
