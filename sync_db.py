
import sqlite3
import os

db_path = "backend/exam_oracle.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 1. Update user_stats schema
    try:
        cursor.execute("ALTER TABLE user_stats ADD COLUMN longest_streak INTEGER DEFAULT 0")
        print("Added longest_streak to user_stats")
    except sqlite3.OperationalError:
        print("longest_streak already exists")
        
    # 2. Update knowledge_bases schema
    try:
        cursor.execute("ALTER TABLE knowledge_bases ADD COLUMN status TEXT DEFAULT 'pending'")
        cursor.execute("ALTER TABLE knowledge_bases ADD COLUMN error_message TEXT")
        print("Updated knowledge_bases table")
    except sqlite3.OperationalError:
        print("RAG columns already exist")
    
    conn.commit()
    conn.close()
    print("Database sync complete")
else:
    print(f"Database not found at {db_path}")
