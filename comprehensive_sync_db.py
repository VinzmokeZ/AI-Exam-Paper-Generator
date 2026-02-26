
import sqlite3
import os

db_path = "backend/exam_oracle.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # List of columns that might be missing in user_stats
    user_stats_cols = [
        ("longest_streak", "INTEGER DEFAULT 0"),
        ("total_days_active", "INTEGER DEFAULT 0"),
        ("coins", "INTEGER DEFAULT 0"),
        ("badges", "TEXT DEFAULT '[]'"),
        ("last_activity", "DATETIME")
    ]
    
    for col_name, col_type in user_stats_cols:
        try:
            cursor.execute(f"ALTER TABLE user_stats ADD COLUMN {col_name} {col_type}")
            print(f"Added {col_name} to user_stats")
        except sqlite3.OperationalError:
            print(f"Column {col_name} already exists or error.")

    # Also ensure knowledge_bases has the new columns from previous step just in case
    kb_cols = [
        ("status", "TEXT DEFAULT 'pending'"),
        ("error_message", "TEXT")
    ]
    for col_name, col_type in kb_cols:
        try:
            cursor.execute(f"ALTER TABLE knowledge_bases ADD COLUMN {col_name} {col_type}")
            print(f"Added {col_name} to knowledge_bases")
        except sqlite3.OperationalError:
            print(f"Column {col_name} in knowledge_bases already exists or error.")
            
    conn.commit()
    conn.close()
    print("Database sync complete")
else:
    print(f"Database not found at {db_path}")
