
import sqlite3
import os

db_path = "exam_oracle.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE user_stats ADD COLUMN longest_streak INTEGER DEFAULT 0")
        print("Successfully added column longest_streak to user_stats")
    except sqlite3.OperationalError as e:
        print(f"Column might already exist or error: {e}")
    
    conn.commit()
    conn.close()
else:
    print(f"Database not found at {db_path}")
