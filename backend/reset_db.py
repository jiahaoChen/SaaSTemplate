#!/usr/bin/env python3

import asyncio
from sqlmodel import SQLModel, create_engine, Session, text
from app.core.config import settings
from app.core.security import get_password_hash
from app.models import User, Item, Notice, Rule
import uuid
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def reset_database():
    """Reset the database and create all tables."""
    engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))
    
    # Drop all tables with CASCADE
    with engine.connect() as conn:
        logger.info("Dropping all tables with CASCADE...")
        result = conn.execute(text("""
            SELECT tablename FROM pg_tables 
            WHERE schemaname = 'public'
        """))
        tables = result.fetchall()
        
        for (table_name,) in tables:
            conn.execute(text(f'DROP TABLE IF EXISTS "{table_name}" CASCADE'))
        
        # Also drop the alembic_version table if it exists
        conn.execute(text('DROP TABLE IF EXISTS "alembic_version" CASCADE'))
        conn.commit()
    
    logger.info("Creating all tables...")
    SQLModel.metadata.create_all(engine)
    
    logger.info("Database schema created successfully!")
    
    # Create sample data
    with Session(engine) as session:
        logger.info("Creating sample user...")
        user = User(
            email=settings.FIRST_SUPERUSER,
            hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
            full_name="Admin User",
            is_active=True,
            is_superuser=True,
            avatar="https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png",
            signature="Full-stack developer",
            title="Technical Lead",
            group="Engineering Team",
            notify_count=5,
            unread_count=3,
            country="China",
            address="Beijing, China",
            phone="+86-138-0013-8000"
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        
        logger.info("Creating sample notices...")
        notices = [
            Notice(
                title="Welcome to the system",
                description="This is your first notification",
                avatar="https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/MSbDR4FR2MUAAAAAAAAAAAAAFl94AQBr",
                notice_type="notification",
                read=False,
                user_id=user.id
            ),
            Notice(
                title="New message received",
                description="You have a new message from the team",
                avatar="https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/hX-PTavYIq4AAAAAAAAAAAAAFl94AQBr",
                notice_type="message",
                read=False,
                user_id=user.id
            ),
            Notice(
                title="System maintenance",
                description="Scheduled maintenance tonight",
                avatar="https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/jHX5R5l3QjQAAAAAAAAAAAAAFl94AQBr",
                notice_type="event",
                read=True,
                user_id=user.id
            )
        ]
        session.add_all(notices)
        
        logger.info("Creating sample rules...")
        rules = [
            Rule(
                name="TradeCode 001",
                owner="Admin User",
                desc="This is a sample rule for demonstration",
                call_no=150,
                status=1,
                progress=80,
                owner_id=user.id
            ),
            Rule(
                name="TradeCode 002",
                owner="Admin User",
                desc="Another sample rule with different progress",
                call_no=89,
                status=2,
                progress=45,
                owner_id=user.id
            ),
            Rule(
                name="TradeCode 003",
                owner="Admin User",
                desc="Third sample rule for testing",
                call_no=234,
                status=1,
                progress=100,
                owner_id=user.id
            )
        ]
        session.add_all(rules)
        
        logger.info("Creating sample items...")
        items = [
            Item(
                title="Sample Item 1",
                description="This is a sample item for testing",
                owner_id=user.id
            ),
            Item(
                title="Sample Item 2",
                description="Another sample item",
                owner_id=user.id
            )
        ]
        session.add_all(items)
        
        session.commit()
        logger.info("Sample data created successfully!")

if __name__ == "__main__":
    reset_database() 