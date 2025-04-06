from uuid import uuid4
import datetime
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, Float, UniqueConstraint, CheckConstraint, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


def get_uuid():
    return uuid4().hex


class Restaurant(Base):
    id = Column(String(32), primary_key=True, unique=True, default=get_uuid)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    inventories = relationship("Inventory", back_populates="restaurant")
    campaigns = relationship("Campaign", back_populates="restaurant")
    customer_associations = relationship("RestaurantCustomer", back_populates="restaurant")
    restaurant_orders = relationship("RestaurantOrder", back_populates="restaurant")


class Inventory(Base):
    id = Column(String(32), primary_key=True, unique=True, default=get_uuid)
    restaurant_id = Column(String(32), ForeignKey("restaurant.id"), nullable=False, index=True)
    item = Column(String(255), nullable=False)
    amount = Column(Integer, nullable=False)
    unit = Column(String(20), default="units", nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    restaurant = relationship("Restaurant", back_populates="inventories")


class Campaign(Base):
    id = Column(String(32), primary_key=True, unique=True, default=get_uuid)
    restaurant_id = Column(String(32), ForeignKey("restaurant.id"), nullable=False, index=True)
    name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    restaurant = relationship("Restaurant", back_populates="campaigns")
    conversations = relationship("Conversation", back_populates="campaign")


class RestaurantCustomer(Base):
    id = Column(String(32), primary_key=True, unique=True, default=get_uuid)
    restaurant_id = Column(String(32), ForeignKey("restaurant.id"), nullable=False, index=True)
    customer_id = Column(String(32), ForeignKey("customer.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Define a unique constraint to prevent duplicate associations
    __table_args__ = (UniqueConstraint('restaurant_id', 'customer_id', name='uix_restaurant_customer'),)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="customer_associations")
    customer = relationship("Customer", back_populates="restaurant_associations")


class Order(Base):
    id = Column(String(32), primary_key=True, unique=True, default=get_uuid)
    inventory_id = Column(String(32), ForeignKey("inventory.id"), nullable=False, index=True)
    order_amount = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    inventory = relationship("Inventory", backref="orders")
    restaurant_orders = relationship("RestaurantOrder", back_populates="order")


class RestaurantOrder(Base):
    id = Column(String(32), primary_key=True, unique=True, default=get_uuid)
    restaurant_id = Column(String(32), ForeignKey("restaurant.id"), nullable=False, index=True)
    order_id = Column(String(32), ForeignKey("order.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Define a unique constraint to prevent duplicate associations
    __table_args__ = (UniqueConstraint('restaurant_id', 'order_id', name='uix_restaurant_order'),)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="restaurant_orders")
    order = relationship("Order", back_populates="restaurant_orders")


class Customer(Base):
    id = Column(String(32), primary_key=True, unique=True, default=get_uuid)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    conversations = relationship("Conversation", back_populates="customer")
    restaurant_associations = relationship("RestaurantCustomer", back_populates="customer")


class Conversation(Base):
    id = Column(String(32), primary_key=True, unique=True, default=get_uuid)
    campaign_id = Column(String(32), ForeignKey("campaign.id"), nullable=False, index=True)
    customer_id = Column(String(32), ForeignKey("customer.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    campaign = relationship("Campaign", back_populates="conversations")
    customer = relationship("Customer", back_populates="conversations")
    messages = relationship("Messages", back_populates="conversation")


class Messages(Base):
    id = Column(String(32), primary_key=True, unique=True, default=get_uuid)
    conversation_id = Column(String(32), ForeignKey("conversation.id"), nullable=False, index=True)
    role = Column(String(50), nullable=False)  # e.g., 'user', 'system', 'assistant'
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    conversation = relationship("Conversation", back_populates="messages")
