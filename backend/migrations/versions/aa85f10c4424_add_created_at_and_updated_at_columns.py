"""Add created_at and updated_at columns

Revision ID: aa85f10c4424
Revises: 
Create Date: 2025-04-05 20:16:25.315613

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'aa85f10c4424'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add created_at and updated_at columns to restaurant table
    op.add_column('restaurant', sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')))
    op.add_column('restaurant', sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')))
    
    # Add created_at and updated_at columns to inventory table
    op.add_column('inventory', sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')))
    op.add_column('inventory', sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')))
    
    # Add created_at and updated_at columns to campaign table
    op.add_column('campaign', sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')))
    op.add_column('campaign', sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')))
    
    # Add created_at and updated_at columns to customer table
    op.add_column('customer', sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')))
    op.add_column('customer', sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')))
    
    # Add created_at and updated_at columns to conversation table
    op.add_column('conversation', sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')))
    op.add_column('conversation', sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')))
    
    # Add created_at and updated_at columns to messages table
    op.add_column('messages', sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')))
    op.add_column('messages', sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')))
    
    # Create a trigger function to automatically update updated_at column
    op.execute(
        '''
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
        '''
    )
    
    # Create triggers for each table
    op.execute(
        '''
        CREATE TRIGGER update_restaurant_updated_at BEFORE UPDATE
        ON restaurant FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        '''
    )
    
    op.execute(
        '''
        CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE
        ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        '''
    )
    
    op.execute(
        '''
        CREATE TRIGGER update_campaign_updated_at BEFORE UPDATE
        ON campaign FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        '''
    )
    
    op.execute(
        '''
        CREATE TRIGGER update_customer_updated_at BEFORE UPDATE
        ON customer FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        '''
    )
    
    op.execute(
        '''
        CREATE TRIGGER update_conversation_updated_at BEFORE UPDATE
        ON conversation FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        '''
    )
    
    op.execute(
        '''
        CREATE TRIGGER update_messages_updated_at BEFORE UPDATE
        ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        '''
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop triggers
    op.execute('DROP TRIGGER IF EXISTS update_restaurant_updated_at ON restaurant')
    op.execute('DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory')
    op.execute('DROP TRIGGER IF EXISTS update_campaign_updated_at ON campaign')
    op.execute('DROP TRIGGER IF EXISTS update_customer_updated_at ON customer')
    op.execute('DROP TRIGGER IF EXISTS update_conversation_updated_at ON conversation')
    op.execute('DROP TRIGGER IF EXISTS update_messages_updated_at ON messages')
    
    # Drop trigger function
    op.execute('DROP FUNCTION IF EXISTS update_updated_at_column()')
    
    # Drop columns from messages table
    op.drop_column('messages', 'updated_at')
    op.drop_column('messages', 'created_at')
    
    # Drop columns from conversation table
    op.drop_column('conversation', 'updated_at')
    op.drop_column('conversation', 'created_at')
    
    # Drop columns from customer table
    op.drop_column('customer', 'updated_at')
    op.drop_column('customer', 'created_at')
    
    # Drop columns from campaign table
    op.drop_column('campaign', 'updated_at')
    op.drop_column('campaign', 'created_at')
    
    # Drop columns from inventory table
    op.drop_column('inventory', 'updated_at')
    op.drop_column('inventory', 'created_at')
    
    # Drop columns from restaurant table
    op.drop_column('restaurant', 'updated_at')
    op.drop_column('restaurant', 'created_at')
