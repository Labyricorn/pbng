#!/usr/bin/env python3
"""Initialize the database tables"""

from app import create_app
from models import db

def init_database():
    app = create_app()
    with app.app_context():
        # Create all tables
        db.create_all()
        print("Database tables created successfully!")

if __name__ == '__main__':
    init_database()