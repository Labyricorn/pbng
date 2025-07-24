"""Refactor tags and snippet_ids to relationships

Revision ID: 20240723_relationship_refactor
Revises: rename_title_to_item
Create Date: 2025-07-23 21:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20240723_relationship_refactor'
down_revision = 'rename_title_to_item'
branch_labels = None
depends_on = None

def upgrade():
    # Create tags table
    op.create_table(
        'tags',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(length=50), nullable=False, unique=True)
    )
    # Create snippet_tags association table
    op.create_table(
        'snippet_tags',
        sa.Column('snippet_id', sa.Integer(), sa.ForeignKey('snippets.id'), primary_key=True),
        sa.Column('tag_id', sa.Integer(), sa.ForeignKey('tags.id'), primary_key=True)
    )
    # Create prompt_snippets association table
    op.create_table(
        'prompt_snippets',
        sa.Column('prompt_id', sa.Integer(), sa.ForeignKey('prompts.id'), primary_key=True),
        sa.Column('snippet_id', sa.Integer(), sa.ForeignKey('snippets.id'), primary_key=True)
    )
    # Remove tags and snippet_ids columns
    op.drop_column('snippets', 'tags')
    op.drop_column('prompts', 'snippet_ids')

def downgrade():
    # Add tags and snippet_ids columns back
    op.add_column('snippets', sa.Column('tags', sa.Text(), nullable=True))
    op.add_column('prompts', sa.Column('snippet_ids', sa.Text(), nullable=True))
    # Drop association tables and tags
    op.drop_table('prompt_snippets')
    op.drop_table('snippet_tags')
    op.drop_table('tags') 