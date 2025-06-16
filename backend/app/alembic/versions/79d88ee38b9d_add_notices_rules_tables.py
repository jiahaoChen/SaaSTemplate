"""Add notices rules tables

Revision ID: 79d88ee38b9d
Revises: a30716af77b5
Create Date: 2025-06-16 09:07:56.250211

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '79d88ee38b9d'
down_revision = 'a30716af77b5'
branch_labels = None
depends_on = None


def upgrade():
    # Create user table with enhanced profile fields
    op.create_table('user',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('is_superuser', sa.Boolean(), nullable=True),
        sa.Column('full_name', sa.String(length=255), nullable=True),
        sa.Column('avatar', sa.String(length=500), nullable=True),
        sa.Column('signature', sa.String(length=255), nullable=True),
        sa.Column('title', sa.String(length=255), nullable=True),
        sa.Column('group', sa.String(length=255), nullable=True),
        sa.Column('notify_count', sa.Integer(), nullable=True),
        sa.Column('unread_count', sa.Integer(), nullable=True),
        sa.Column('country', sa.String(length=100), nullable=True),
        sa.Column('address', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_email'), 'user', ['email'], unique=True)

    # Create item table
    op.create_table('item',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.String(length=255), nullable=True),
        sa.Column('owner_id', sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(['owner_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create notice table
    op.create_table('notice',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.String(length=500), nullable=True),
        sa.Column('avatar', sa.String(length=500), nullable=True),
        sa.Column('notice_type', sa.String(length=50), nullable=False),
        sa.Column('read', sa.Boolean(), nullable=True),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create rule table
    op.create_table('rule',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('owner', sa.String(length=255), nullable=False),
        sa.Column('desc', sa.String(length=500), nullable=True),
        sa.Column('call_no', sa.Integer(), nullable=True),
        sa.Column('status', sa.Integer(), nullable=True),
        sa.Column('progress', sa.Integer(), nullable=True),
        sa.Column('owner_id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['owner_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    op.drop_table('rule')
    op.drop_table('notice')
    op.drop_table('item')
    op.drop_index(op.f('ix_user_email'), table_name='user')
    op.drop_table('user')
