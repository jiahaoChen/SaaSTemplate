#!/usr/bin/env python3
"""
Test script to verify the is_public field in the mindmap table.
This will get the first mindmap from the database and print its is_public status.
Then it will toggle the is_public status and print it again.
"""

import sys
import os
from pathlib import Path

# Add the parent directory to the path so we can import from app
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlmodel import Session, select
from app.core.db import engine
from app.models import MindMap

def main():
    """Test the is_public field in the mindmap table."""
    print("Testing is_public field in mindmap table")
    
    with Session(engine) as session:
        # Get the first mindmap
        statement = select(MindMap).limit(1)
        result = session.exec(statement).first()
        
        if not result:
            print("No mindmaps found in the database")
            return
        
        print(f"Found mindmap with ID: {result.id}")
        print(f"Current is_public status: {result.is_public}")
        
        # Toggle the is_public status
        result.is_public = not result.is_public
        session.add(result)
        session.commit()
        session.refresh(result)
        
        print(f"Updated is_public status: {result.is_public}")
        print("Test completed successfully")

if __name__ == "__main__":
    main() 