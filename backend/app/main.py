from app.api.api_v1.api import api_router
import logging
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.db.init_db import init_db
from app.db.session import get_db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Restaurant Inventory Prediction API",
    description="API for predicting restaurant inventory needs",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, this should be restricted to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup


@app.on_event("startup")
def on_startup():
    logger.info("Initializing database...")
    success = init_db(max_retries=30, retry_interval=2)  # More retries with longer interval
    if success:
        logger.info("Database initialized successfully!")
    else:
        logger.error("Failed to initialize database after multiple attempts")


@app.get("/")
async def root():
    return {"message": "healthy"}

# Health check endpoint that tests database connection


@app.get("/health")
async def health(db=Depends(get_db)):
    return {"status": "healthy", "database": "connected"}

# Import and include routes
app.include_router(api_router, prefix="/api/v1")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
