# Import all models here to ensure they are registered with SQLAlchemy
from app.db.base_class import Base
from app.db.models import Restaurant, Inventory, Campaign, Customer, Conversation, Messages
