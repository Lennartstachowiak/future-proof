#!/usr/bin/env python
import os
import sys
import subprocess
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def main():
    # Get database connection details from environment
    db_user = os.getenv("POSTGRES_USER", "postgres")
    db_password = os.getenv("POSTGRES_PASSWORD", "postgres")
    # Always use localhost when running locally
    db_host = "localhost"  # Hardcoded to localhost for local development
    db_port = os.getenv("POSTGRES_PORT", "5432")
    db_name = os.getenv("POSTGRES_DB", "restaurant_app")
    
    # Create database URL
    db_url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    
    # Set environment variable for Alembic
    os.environ["DATABASE_URL"] = db_url
    
    # Run Alembic migration
    try:
        print(f"Running migration with database URL: {db_url}")
        subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], check=True)
        print("Migration completed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
