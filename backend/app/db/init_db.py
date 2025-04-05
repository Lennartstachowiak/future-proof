import logging
import time
from sqlalchemy.exc import ProgrammingError, OperationalError
from app.db.base_class import Base
from app.db.session import engine
import app.db.models  # Import models to register them with SQLAlchemy
from app.db.seed_db import seed_db

logger = logging.getLogger(__name__)


def init_db(max_retries=10, retry_interval=1, seed_with_dummy_data=False):
    """Initialize database, creating tables if they don't exist.
    
    Args:
        max_retries: Maximum number of connection attempts
        retry_interval: Time in seconds between retries
        seed_with_dummy_data: If True, seed the database with dummy data after initialization
    """
    for attempt in range(max_retries):
        try:
            # Create all tables
            logger.info(f"Creating database tables (attempt {attempt+1}/{max_retries})...")
            Base.metadata.create_all(bind=engine)
            logger.info("Database tables created successfully!")
            
            # Seed the database with dummy data if requested
            if seed_with_dummy_data:
                logger.info("Seeding database with dummy data...")
                if seed_db():
                    logger.info("Database seeded successfully!")
                else:
                    logger.warning("Failed to seed database with dummy data.")
            
            return True
        except OperationalError as e:
            logger.warning(f"Database connection failed (attempt {attempt+1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                logger.info(f"Retrying in {retry_interval} seconds...")
                time.sleep(retry_interval)
            else:
                logger.error(f"Failed to connect to database after {max_retries} attempts")
                return False
        except Exception as e:
            logger.error(f"Error creating database tables: {e}")
            return False
