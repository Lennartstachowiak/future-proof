import logging
import time
from sqlalchemy.exc import ProgrammingError, OperationalError
from app.db.base_class import Base
from app.db.session import engine
import app.db.models  # Import models to register them with SQLAlchemy

logger = logging.getLogger(__name__)


def init_db(max_retries=10, retry_interval=1):
    """Initialize database, creating tables if they don't exist.
    
    Args:
        max_retries: Maximum number of connection attempts
        retry_interval: Time in seconds between retries
    """
    for attempt in range(max_retries):
        try:
            # Create all tables
            logger.info(f"Creating database tables (attempt {attempt+1}/{max_retries})...")
            Base.metadata.create_all(bind=engine)
            logger.info("Database tables created successfully!")
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
