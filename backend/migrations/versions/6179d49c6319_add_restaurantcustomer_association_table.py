"""Add RestaurantCustomer association table

Revision ID: 6179d49c6319
Revises: aa85f10c4424
Create Date: 2025-04-05 20:32:56.294806

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6179d49c6319'
down_revision: Union[str, None] = 'aa85f10c4424'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create RestaurantCustomer table
    op.create_table(
        'restaurantcustomer',
        sa.Column('id', sa.String(32), primary_key=True, unique=True),
        sa.Column('restaurant_id', sa.String(32), sa.ForeignKey('restaurant.id'), nullable=False, index=True),
        sa.Column('customer_id', sa.String(32), sa.ForeignKey('customer.id'), nullable=False, index=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.UniqueConstraint('restaurant_id', 'customer_id', name='uix_restaurant_customer')
    )
    
    # Create trigger for automatic update of updated_at column
    op.execute(
        '''
        CREATE TRIGGER update_restaurantcustomer_updated_at BEFORE UPDATE
        ON restaurantcustomer FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        '''
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop trigger
    op.execute('DROP TRIGGER IF EXISTS update_restaurantcustomer_updated_at ON restaurantcustomer')
    
    # Indexes are dropped automatically with the table
    
    # Drop table
    op.drop_table('restaurantcustomer')
