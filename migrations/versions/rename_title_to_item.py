"""rename title to item

Revision ID: rename_title_to_item
Revises: 
Create Date: 2025-07-23 20:15:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'rename_title_to_item'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Rename title column to item in snippets table
    op.alter_column('snippets', 'title', new_column_name='item')
    
    # Update search query in routes.py
    # Note: This is just a comment as we need to manually update routes.py


def downgrade():
    # Rename item column back to title in snippets table
    op.alter_column('snippets', 'item', new_column_name='title')