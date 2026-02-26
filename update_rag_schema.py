
import sqlite3
import os

db_path = "exam_oracle.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE knowledge_bases ADD COLUMN status TEXT DEFAULT 'pending'")
        cursor.execute("ALTER TABLE knowledge_bases ADD COLUMN error_message TEXT")
        print("Successfully updated knowledge_bases table")
    except sqlite3.OperationalError as e:
        print(f"Error: {e}")
    
    conn.commit()
    conn.close()
else:
    print(f"Database not found at {db_path}")
