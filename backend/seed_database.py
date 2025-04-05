#!/usr/bin/env python
import logging
from app.db.init_db import init_db

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    
    # Initialize database with dummy data
    print("Initializing database with dummy data...")
    success = init_db(seed_with_dummy_data=True)
    
    if success:
        print("Database initialized and seeded successfully!")
    else:
        print("Failed to initialize or seed database.")
