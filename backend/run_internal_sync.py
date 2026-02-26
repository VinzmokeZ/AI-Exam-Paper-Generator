import os
import requests
import sqlite3
from sqlalchemy import create_engine, MetaData, Table, select
from sqlalchemy.orm import sessionmaker

def merge_db():
    print("starting internal cloud sync...")
    
    # 1. Download the latest local SQLite DB from GitHub Raw
    github_raw_url = "https://raw.githubusercontent.com/VinzmokeZ/AI-Exam-Paper-Generator/main/backend/exam_oracle.db"
    local_db_path = "downloaded_local.db"
    
    try:
        print("Downloading local database from GitHub...")
        response = requests.get(github_raw_url)
        response.raise_for_status()
        with open(local_db_path, "wb") as f:
            f.write(response.content)
        print("Download complete.")
    except Exception as e:
        print(f"Failed to download DB: {e}")
        return

    # 2. Get Cloud URL from environment
    cloud_url = os.getenv("DATABASE_URL")
    if not cloud_url:
        print("No DATABASE_URL found. Are we on Render?")
        return

    if cloud_url.startswith("postgres://"):
        cloud_url = cloud_url.replace("postgres://", "postgresql://", 1)

    try:
        print("Connecting to databases...")
        # Source (SQLite)
        source_engine = create_engine(f"sqlite:///{local_db_path}")
        source_metadata = MetaData()
        source_metadata.reflect(bind=source_engine)
        
        # Destination (PostgreSQL)
        dest_engine = create_engine(cloud_url)
        
        from sqlalchemy import text
        try:
            print("Upgrading cloud database schema for large text...")
            with dest_engine.begin() as conn:
                conn.execute(text("ALTER TABLE questions ALTER COLUMN question_text TYPE TEXT;"))
                conn.execute(text("ALTER TABLE questions ALTER COLUMN correct_answer TYPE TEXT;"))
                conn.execute(text("ALTER TABLE questions ALTER COLUMN explanation TYPE TEXT;"))
            print("Schema upgrade successful.")
        except Exception as e:
            print(f"Schema upgrade note (might already be TEXT): {e}")

        dest_metadata = MetaData()
        dest_metadata.reflect(bind=dest_engine)
        
        Session = sessionmaker(bind=dest_engine)
        session = Session()

        tables_to_migrate = [
            "subjects", "topics", "knowledge_bases", "documents", "rubrics", "rubric_question_distributions", 
            "rubric_lo_distributions", "questions", "user_stats", 
            "exam_history", "activity_logs", "notifications", "achievements"
        ]

        print("Starting merge...")
        for table_name in tables_to_migrate:
            if table_name not in source_metadata.tables:
                continue
                
            print(f"  > Merging {table_name}...", end="", flush=True)
            source_table = source_metadata.tables[table_name]
            dest_table = dest_metadata.tables[table_name]
            
            with source_engine.connect() as conn:
                rows = conn.execute(source_table.select()).fetchall()
            
            if not rows:
                print(" (Empty, skipping)")
                continue
            
            count = 0
            dest_columns = [col.name for col in dest_table.columns]
            for row in rows:
                data = dict(row._mapping)
                # Filter out columns that exist in local but not in cloud
                filtered_data = {k: v for k, v in data.items() if k in dest_columns}
                
                stmt = select(dest_table).where(dest_table.c.id == filtered_data['id'])
                exists = session.execute(stmt).first()
                
                if exists:
                    session.execute(dest_table.update().where(dest_table.c.id == filtered_data['id']).values(**filtered_data))
                else:
                    session.execute(dest_table.insert().values(**filtered_data))
                count += 1
            
            session.commit()
            print(f" OK ({count} records)")

        print("Cloud Sync Complete!")
        
    except Exception as e:
        print(f"Merge Failed: {e}")
        if 'session' in locals():
            session.rollback()
    finally:
        if os.path.exists(local_db_path):
            os.remove(local_db_path)

if __name__ == "__main__":
    merge_db()
