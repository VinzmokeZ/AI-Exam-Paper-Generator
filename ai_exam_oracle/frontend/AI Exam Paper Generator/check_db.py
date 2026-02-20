import sqlite3
import os

db_path = "backend/exam_oracle.db"
if not os.path.exists(db_path):
    # Try alternate path
    db_path = "exam_oracle.db"

if os.path.exists(db_path):
    print(f"Checking database at: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT user_id, username, xp, level FROM user_stats")
        rows = cursor.fetchall()
        print(f"\nFound {len(rows)} user records in DB:")
        for row in rows:
            print(f"UID: {row[0]} | Name: {row[1]} | XP: {row[2]} | Level: {row[3]}")
    except sqlite3.OperationalError as e:
        print(f"Error reading user_stats: {e}")

    try:
        cursor.execute("SELECT id, name, code, color FROM subjects")
        rows = cursor.fetchall()
        print(f"\nFound {len(rows)} subjects in DB:")
        for row in rows:
            print(f"ID: {row[0]} | Name: {row[1]} | Code: {row[2]} | Color: {row[3]}")
    except sqlite3.OperationalError as e:
        print(f"Error reading subjects: {e}")
        
    try:
        cursor.execute("SELECT count(*) FROM questions")
        count = cursor.fetchone()[0]
        print(f"\nTotal questions: {count}")
    except sqlite3.OperationalError:
        pass
        
    conn.close()
else:
    print(f"Database not found at {db_path}")
