from sqlalchemy import inspect, text
from .models import Question

def ensure_schema_sync(engine):
    """
    Safely adds missing columns to the database.
    This is a lightweight alternative to Alembic for critical columns.
    """
    inspector = inspect(engine)
    
    # Check 'questions' table
    if 'questions' in inspector.get_table_names():
        columns = [c['name'] for c in inspector.get_columns('questions')]
        
        # Add 'course_outcomes' if missing
        if 'course_outcomes' not in columns:
            print("[DB] 🔄 Column 'course_outcomes' missing in 'questions'. Patching...")
            try:
                # Use JSON for SQLite/MySQL/Postgres
                # SQLite: JSON is just text but and sqlite3 >= 3.38 supports -> operators
                # PostgreSQL: JSON type exists
                # MySQL: JSON type exists
                with engine.begin() as conn:
                    conn.execute(text("ALTER TABLE questions ADD COLUMN course_outcomes JSON"))
                print("[DB] ✅ Successfully added 'course_outcomes' column.")
            except Exception as e:
                print(f"[DB] ❌ Failed to add 'course_outcomes': {e}")
                
        # Add 'course_outcome' (singular) if missing (compatibility)
        if 'course_outcome' not in columns:
            print("[DB] 🔄 Column 'course_outcome' missing in 'questions'. Patching...")
            try:
                with engine.begin() as conn:
                    conn.execute(text("ALTER TABLE questions ADD COLUMN course_outcome VARCHAR(50)"))
                print("[DB] ✅ Successfully added 'course_outcome' column.")
            except Exception as e:
                print(f"[DB] ❌ Failed to add 'course_outcome': {e}")

    # Add other critical check here if needed
