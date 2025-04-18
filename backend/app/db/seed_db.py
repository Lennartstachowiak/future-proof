import json
import logging
import os
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from app.db.models import Restaurant, Inventory, Campaign, Customer, Conversation, Messages, RestaurantCustomer
from app.db.base_class import Base

logger = logging.getLogger(__name__)

# Create a custom database connection


def create_db_connection():
    """Create a custom database connection for seeding the database."""
    # Database connection parameters
    POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_SERVER = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB = os.getenv("POSTGRES_DB", "restaurant_app")

    # Create database URL
    SQLALCHEMY_DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"

    # Create engine and session
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)

    return SessionLocal()


def load_dummy_data(db: Session, json_file_path: str):
    """Load dummy data from a JSON file into the database.

    Args:
        db: Database session
        json_file_path: Path to the JSON file containing dummy data
    """
    try:
        # Load data from JSON file
        with open(json_file_path, 'r') as file:
            data = json.load(file)

        # Dictionary to store created objects by name for reference
        restaurants_dict = {}
        campaigns_dict = {}
        customers_dict = {}

        # Create restaurants
        logger.info("Creating restaurants...")
        for restaurant_data in data.get('restaurants', []):
            restaurant = Restaurant(name=restaurant_data['name'])
            db.add(restaurant)
            db.flush()  # Flush to get the ID
            restaurants_dict[restaurant.name] = restaurant
            logger.info(f"Created restaurant: {restaurant.name}")

        # Create inventory items
        if data.get('inventory'):
            logger.info("Creating inventory items...")
            # Assuming we're using the first restaurant for all inventory items
            restaurant = list(restaurants_dict.values())[0]
            for inventory_data in data.get('inventory', []):
                # Get the unit from the inventory data, default to 'units' if not specified
                unit = inventory_data.get('unit', 'units')

                inventory = Inventory(
                    restaurant_id=restaurant.id,
                    item=inventory_data['item'],
                    amount=inventory_data['amount'],
                    unit=unit
                )
                db.add(inventory)
                logger.info(f"Created inventory item: {inventory.item}")

        # Create campaigns
        logger.info("Creating campaigns...")
        for campaign_data in data.get('campaigns', []):
            # Assuming we're using the first restaurant for all campaigns
            restaurant = list(restaurants_dict.values())[0]
            # Parse timestamps if provided
            created_at = None
            updated_at = None
            if 'created_at' in campaign_data:
                created_at = datetime.fromisoformat(campaign_data['created_at'].replace('Z', '+00:00'))
            if 'updated_at' in campaign_data:
                updated_at = datetime.fromisoformat(campaign_data['updated_at'].replace('Z', '+00:00'))
            if 'name' in campaign_data:
                name = campaign_data['name']

            campaign = Campaign(
                restaurant_id=restaurant.id,
                created_at=created_at,
                updated_at=updated_at,
                name=name
            )
            db.add(campaign)
            db.flush()  # Flush to get the ID
            campaigns_dict[campaign_data['name']] = campaign
            logger.info(f"Created campaign: {campaign_data['name']}")

        # Create customers
        logger.info("Creating customers...")
        for customer_data in data.get('customers', []):
            customer = Customer(name=customer_data['name'])
            db.add(customer)
            db.flush()  # Flush to get the ID
            customers_dict[customer.name] = customer
            logger.info(f"Created customer: {customer.name}")

        # Create restaurant-customer associations
        logger.info("Creating restaurant-customer associations...")
        for association_data in data.get('restaurant_customers', []):
            restaurant = restaurants_dict[association_data['restaurant_name']]
            customer = customers_dict[association_data['customer_name']]

            # Parse timestamps if provided
            created_at = None
            updated_at = None
            if 'created_at' in association_data:
                created_at = datetime.fromisoformat(association_data['created_at'].replace('Z', '+00:00'))
            if 'updated_at' in association_data:
                updated_at = datetime.fromisoformat(association_data['updated_at'].replace('Z', '+00:00'))

            association = RestaurantCustomer(
                restaurant_id=restaurant.id,
                customer_id=customer.id,
                created_at=created_at,
                updated_at=updated_at
            )
            db.add(association)
            logger.info(f"Created association between restaurant {restaurant.name} and customer {customer.name}")

        # Create conversations and messages
        logger.info("Creating conversations and messages...")
        for conversation_data in data.get('conversations', []):
            campaign = campaigns_dict[conversation_data['campaign_name']]
            customer = customers_dict[conversation_data['customer_name']]

            # Parse timestamps if provided
            created_at = None
            updated_at = None
            if 'created_at' in conversation_data:
                created_at = datetime.fromisoformat(conversation_data['created_at'].replace('Z', '+00:00'))
            if 'updated_at' in conversation_data:
                updated_at = datetime.fromisoformat(conversation_data['updated_at'].replace('Z', '+00:00'))

            conversation = Conversation(
                campaign_id=campaign.id,
                customer_id=customer.id,
                created_at=created_at,
                updated_at=updated_at
            )
            db.add(conversation)
            db.flush()  # Flush to get the ID

            logger.info(
                f"Created conversation between {customer.name} and campaign {conversation_data['campaign_name']}")

            # Create messages for this conversation
            for message_data in conversation_data.get('messages', []):
                # Parse timestamps if provided
                created_at = None
                updated_at = None
                if 'created_at' in message_data:
                    created_at = datetime.fromisoformat(message_data['created_at'].replace('Z', '+00:00'))
                if 'updated_at' in message_data:
                    updated_at = datetime.fromisoformat(message_data['updated_at'].replace('Z', '+00:00'))

                message = Messages(
                    conversation_id=conversation.id,
                    role=message_data['role'],
                    message=message_data['message'],
                    created_at=created_at,
                    updated_at=updated_at
                )
                db.add(message)
                logger.info(f"Created message: {message.message[:30]}...")

        # Commit all changes
        db.commit()
        logger.info("All dummy data loaded successfully!")
        return True

    except Exception as e:
        db.rollback()
        logger.error(f"Error loading dummy data: {e}")
        return False


def seed_db(json_file_path=None):
    """Seed the database with dummy data.

    Args:
        json_file_path: Path to the JSON file containing dummy data
    """
    # If no path is provided, use the path relative to this file
    if json_file_path is None:
        import os
        # Get the directory where this script is located
        current_dir = os.path.dirname(os.path.abspath(__file__))
        json_file_path = os.path.join(current_dir, "dummy_data.json")
        print(f"Using JSON file at: {json_file_path}")

    # Create a custom database connection
    db = create_db_connection()
    try:
        result = load_dummy_data(db, json_file_path)
        return result
    finally:
        db.close()


if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)

    # Seed the database
    success = seed_db()
    if success:
        print("Database seeded successfully!")
    else:
        print("Failed to seed database.")
