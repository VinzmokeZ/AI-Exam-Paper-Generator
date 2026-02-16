import sys
import os
# Add current directory to path to allow imports from app
sys.path.append(os.getcwd())

from app.database import engine
from app.models import Base, ActivityLog
from sqlalchemy import text

def fix_schema():
    print("Fixing database schema for renamed column...")
    try:
        with engine.connect() as conn:
            # Drop the old table that has 'metadata' column
            print("Dropping 'activity_logs' table...")
            conn.execute(text("DROP TABLE IF EXISTS activity_logs"))
            conn.commit()
            
        # Recreate table with 'details' column
        print("Recreating 'activity_logs' table...")
        Base.metadata.create_all(bind=engine)
        print("Schema fixed successfully!")
        
    except Exception as e:
        print(f"Error fixing schema: {e}")

if __name__ == "__main__":
    fix_schema()
