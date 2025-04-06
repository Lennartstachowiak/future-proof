"""add_campaign_started_id_to_campaign

Revision ID: 8782240cd1cb
Revises: da18c14e3006
Create Date: 2025-04-06 12:39:53.667631

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8782240cd1cb'
down_revision: Union[str, None] = 'da18c14e3006'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('campaign', sa.Column('campaign_started_id', sa.String(length=255), nullable=True))
    op.create_index(op.f('ix_campaign_campaign_started_id'), 'campaign', ['campaign_started_id'], unique=True)
    op.create_unique_constraint(None, 'campaign', ['id'])
    op.create_unique_constraint(None, 'conversation', ['id'])
    op.create_unique_constraint(None, 'customer', ['id'])
    op.create_unique_constraint(None, 'inventory', ['id'])
    op.create_unique_constraint(None, 'messages', ['id'])
    op.create_unique_constraint(None, 'order', ['id'])
    op.create_unique_constraint(None, 'restaurant', ['id'])
    op.create_unique_constraint(None, 'restaurantcustomer', ['id'])
    op.create_unique_constraint(None, 'restaurantorder', ['id'])
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'restaurantorder', type_='unique')
    op.drop_constraint(None, 'restaurantcustomer', type_='unique')
    op.drop_constraint(None, 'restaurant', type_='unique')
    op.drop_constraint(None, 'order', type_='unique')
    op.drop_constraint(None, 'messages', type_='unique')
    op.drop_constraint(None, 'inventory', type_='unique')
    op.drop_constraint(None, 'customer', type_='unique')
    op.drop_constraint(None, 'conversation', type_='unique')
    op.drop_constraint(None, 'campaign', type_='unique')
    op.drop_index(op.f('ix_campaign_campaign_started_id'), table_name='campaign')
    op.drop_column('campaign', 'campaign_started_id')
    # ### end Alembic commands ###
