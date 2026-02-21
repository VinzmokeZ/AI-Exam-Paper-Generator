import os
import sqlite3
from sqlalchemy import create_engine, MetaData, Table, select
from sqlalchemy.orm import sessionmaker
import sys

# Configuration
LOCAL_DB = "backend/exam_oracle.db"
# The Render URL should be copied from your Render Dashboard -> Connect -> External Connection String
RENDER_URL = os.getenv("DATABASE_URL")

def migrate():
    print("🚀 AI Exam Oracle - Database Migration Tool")
    print("------------------------------------------")
    
    # 1. Check local DB
    if not os.path.exists(LOCAL_DB):
        # Check if we are inside backend folder
        if os.path.exists("exam_oracle.db"):
            local_path = "exam_oracle.db"
        else:
            print(f"❌ Error: Local database not found at {LOCAL_DB}")
            return
    else:
        local_path = LOCAL_DB

    # 2. Get Cloud URL
    cloud_url = RENDER_URL
    if not cloud_url:
        print("\nNote: No DATABASE_URL found in environment.")
        cloud_url = input("👉 Please paste your Render External Connection String: ").strip()
    
    if not cloud_url:
        print("❌ Error: No Cloud URL provided.")
        return

    # Fix postgres prefix for SQLAlchemy
    if cloud_url.startswith("postgres://"):
        cloud_url = cloud_url.replace("postgres://", "postgresql://", 1)

    try:
        # Source (SQLite)
        source_engine = create_engine(f"sqlite:///{local_path}")
        source_metadata = MetaData()
        source_metadata.reflect(bind=source_engine)
        
        # Destination (PostgreSQL)
        dest_engine = create_engine(cloud_url)
        dest_metadata = MetaData()
        dest_metadata.reflect(bind=dest_engine)
        
        Session = sessionmaker(bind=dest_engine)
        session = Session()

        tables_to_migrate = [
            "subjects", "topics", "rubrics", "rubric_question_distributions", 
            "rubric_lo_distributions", "questions", "user_stats", 
            "exam_history", "activity_logs", "notifications", "achievements"
        ]

        print(f"\n📦 Starting migration to: {cloud_url.split('@')[-1]}")
        
        for table_name in tables_to_migrate:
            if table_name not in source_metadata.tables:
                continue
                
            print(f"  > Migrating {table_name}...", end="", flush=True)
            
            source_table = source_metadata.tables[table_name]
            dest_table = dest_metadata.tables[table_name]
            
            # Fetch all from source
            with source_engine.connect() as conn:
                rows = conn.execute(source_table.select()).fetchall()
            
            if not rows:
                print(" (Empty, skipping)")
                continue

            # Clear destination table for fresh sync (Optional, but safer for consistency)
            # session.execute(dest_table.delete())
            
            count = 0
            for row in rows:
                # Convert row to dict
                data = dict(row._mapping)
                
                # Check if record exists (by ID)
                stmt = select(dest_table).where(dest_table.c.id == data['id'])
                exists = session.execute(stmt).first()
                
                if exists:
                    # Update
                    session.execute(dest_table.update().where(dest_table.c.id == data['id']).values(**data))
                else:
                    # Insert
                    session.execute(dest_table.insert().values(**data))
                count += 1
            
            session.commit()
            print(f" ✅ {count} records synced.")

        print("\n✨ Migration Complete! Your Cloud database is now in sync with local.")
        
    except Exception as e:
        print(f"\n❌ Migration Failed: {e}")
        if 'session' in locals():
            session.rollback()

if __name__ == "__main__":
    migrate()
