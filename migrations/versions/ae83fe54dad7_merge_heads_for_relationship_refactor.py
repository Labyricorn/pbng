"""merge heads for relationship refactor

Revision ID: ae83fe54dad7
Revises: 20240723_relationship_refactor, c00de7a521cb
Create Date: 2025-07-23 21:01:41.291973

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ae83fe54dad7'
down_revision = ('20240723_relationship_refactor', 'c00de7a521cb')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
