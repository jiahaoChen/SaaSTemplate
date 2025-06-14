"""add_is_public_to_mindmap

Revision ID: 35cb01f3940c
Revises: 8ca98d3fe097
Create Date: 2025-05-16 09:28:52.999328

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '35cb01f3940c'
down_revision = '8ca98d3fe097'
branch_labels = None
depends_on = None


def upgrade():
    # Add is_public column to mindmap table with default value False
    op.add_column('mindmap', sa.Column('is_public', sa.Boolean(), nullable=False, server_default=sa.text('false')))


def downgrade():
    # Remove is_public column from mindmap table
    op.drop_column('mindmap', 'is_public')
