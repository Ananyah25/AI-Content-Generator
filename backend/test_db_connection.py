# test_db_connection.py
from database import engine
from models import Conversation, Message
from sqlalchemy.orm import sessionmaker

def test_connection():
    try:
        SessionLocal = sessionmaker(bind=engine)
        db = SessionLocal()
        
        # Test query
        count = db.query(Conversation).count()
        print(f"✅ Database connection successful!")
        print(f"✅ Current conversations in database: {count}")
        
        db.close()
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

if __name__ == "__main__":
    test_connection()
