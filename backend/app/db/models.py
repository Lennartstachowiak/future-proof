from uuid import uuid4
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, Float, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import relationship
from app.db.base_class import Base


def get_uuid():
    return uuid4().hex


class Restaurant(Base):
    id = Column(String(32), primary_key=True, unique=True, default=get_uuid)
    name = Column(String(255), nullable=False)

    inventories = relationship("Inventory", back_populates="restaurant")
    campaigns = relationship("Campaign", back_populates="restaurant")


class Inventory(Base):
    id = Column(String(32), primary_key=True, unique=True, default=get_uuid)
    restaurant_id = Column(String(32), ForeignKey("restaurant.id"), nullable=False, index=True)
    item = Column(String(255), nullable=False)
    amount = Column(Integer, nullable=False)

    restaurant = relationship("Restaurant", back_populates="inventories")


class Campaign(Base):
    id = Column(String(32), primary_key=True, unique=True, default=get_uuid)
    restaurant_id = Column(String(32), ForeignKey("restaurant.id"), nullable=False, index=True)

    restaurant = relationship("Restaurant", back_populates="campaigns")
    conversations = relationship("Conversation", back_populates="campaign")


class Customer(Base):
    id = Column(String(32), primary_key=True, unique=True, default=get_uuid)
    name = Column(String(255), nullable=False)

    conversations = relationship("Conversation", back_populates="customer")


class Conversation(Base):
    id = Column(String(32), primary_key=True, unique=True, default=get_uuid)
    campaign_id = Column(String(32), ForeignKey("campaign.id"), nullable=False, index=True)
    customer_id = Column(String(32), ForeignKey("customer.id"), nullable=False, index=True)

    campaign = relationship("Campaign", back_populates="conversations")
    customer = relationship("Customer", back_populates="conversations")
    messages = relationship("Messages", back_populates="conversation")


class Messages(Base):
    id = Column(String(32), primary_key=True, unique=True, default=get_uuid)
    conversation_id = Column(String(32), ForeignKey("conversation.id"), nullable=False, index=True)
    role = Column(String(50), nullable=False)  # e.g., 'user', 'system', 'assistant'
    message = Column(Text, nullable=False)

    conversation = relationship("Conversation", back_populates="messages")
