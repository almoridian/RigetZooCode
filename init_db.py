"""
Database setup script - Creates tables and sample data
Run this instead of: mysql -u root -p < database\schema.sql
"""

import os
from dotenv import load_dotenv
from app import create_app, db
from app.models.models import User, Rewards

load_dotenv()

def init_database():
    """Initialize database with schema and sample data"""
    app = create_app('development')
    
    with app.app_context():
        print("Creating database tables...")
        db.create_all()
        print("✓ Tables created successfully")
        
        # Check if sample user exists
        if not User.query.filter_by(email='john.doe@example.com').first():
            print("Adding sample user...")
            user = User(
                email='john.doe@example.com',
                password_hash=User.hash_password('password123'),
                first_name='John',
                last_name='Doe'
            )
            db.session.add(user)
            db.session.flush()
            
            # Add rewards for sample user
            rewards = Rewards(user_id=user.user_id)
            db.session.add(rewards)
            db.session.commit()
            
            print("✓ Sample user created: john.doe@example.com / password123")
        else:
            print("✓ Sample user already exists")
        
        print("\n✅ Database setup complete!")
        print("You can now run: python run.py")

if __name__ == '__main__':
    try:
        init_database()
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nMake sure:")
        print("1. MySQL is running")
        print("2. .env file exists with correct DATABASE_URL")
        print("3. Virtual environment is activated")
