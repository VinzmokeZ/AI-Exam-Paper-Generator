import sqlite3
import os

db_path = "exam_oracle.db"

def fix_schema():
    if not os.path.exists(db_path):
        print(f"[FIX] {db_path} not found, skip migration.")
        return

    print(f"[FIX] Checking schema for {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # 1. Update Topics Table
        cursor.execute("PRAGMA table_info(topics)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'description' not in columns:
            print("[FIX] Adding 'description' column to topics table...")
            cursor.execute("ALTER TABLE topics ADD COLUMN description VARCHAR(1000)")
            conn.commit()

        if 'has_syllabus' not in columns:
            print("[FIX] Adding 'has_syllabus' column to topics table...")
            cursor.execute("ALTER TABLE topics ADD COLUMN has_syllabus BOOLEAN DEFAULT 0")
            conn.commit()

        if 'has_textbook' not in columns:
            print("[FIX] Adding 'has_textbook' column to topics table...")
            cursor.execute("ALTER TABLE topics ADD COLUMN has_textbook BOOLEAN DEFAULT 0")
            conn.commit()

        if 'textbook_path' not in columns:
            print("[FIX] Adding 'textbook_path' column to topics table...")
            cursor.execute("ALTER TABLE topics ADD COLUMN textbook_path VARCHAR(500)")
            conn.commit()
            
        # 2. Update Question Table for new vetting fields
        cursor.execute("PRAGMA table_info(questions)")
        q_columns = [column[1] for column in cursor.fetchall()]
        
        if 'bloom_level' not in q_columns:
            print("[FIX] Adding 'bloom_level' column to questions table...")
            cursor.execute("ALTER TABLE questions ADD COLUMN bloom_level VARCHAR(50)")
            conn.commit()
            
        if 'course_outcome' not in q_columns:
            print("[FIX] Adding 'course_outcome' column to questions table...")
            cursor.execute("ALTER TABLE questions ADD COLUMN course_outcome VARCHAR(50)")
            conn.commit()

        if 'explanation' not in q_columns:
            print("[FIX] Adding 'explanation' column to questions table...")
            cursor.execute("ALTER TABLE questions ADD COLUMN explanation VARCHAR(2000)")
            conn.commit()

        # 3. Update UserStats Table
        cursor.execute("PRAGMA table_info(user_stats)")
        us_columns = [column[1] for column in cursor.fetchall()]

        if 'username' not in us_columns:
            print("[FIX] Adding 'username' column to user_stats table...")
            cursor.execute("ALTER TABLE user_stats ADD COLUMN username VARCHAR(255) DEFAULT 'Professor Vinz'")
            conn.commit()

        if 'xp' not in us_columns:
            print("[FIX] Adding 'xp' column to user_stats table...")
            cursor.execute("ALTER TABLE user_stats ADD COLUMN xp INTEGER DEFAULT 0")
            conn.commit()

        if 'level' not in us_columns:
            print("[FIX] Adding 'level' column to user_stats table...")
            cursor.execute("ALTER TABLE user_stats ADD COLUMN level INTEGER DEFAULT 1")
            conn.commit()

        if 'coins' not in us_columns:
            print("[FIX] Adding 'coins' column to user_stats table...")
            cursor.execute("ALTER TABLE user_stats ADD COLUMN coins INTEGER DEFAULT 0")
            conn.commit()

        if 'badges' not in us_columns:
            print("[FIX] Adding 'badges' column to user_stats table...")
            cursor.execute("ALTER TABLE user_stats ADD COLUMN badges JSON")
            conn.commit()

        if 'streak' not in us_columns:
            print("[FIX] Adding 'streak' column to user_stats table...")
            cursor.execute("ALTER TABLE user_stats ADD COLUMN streak INTEGER DEFAULT 0")
            conn.commit()

        if 'last_activity' not in us_columns:
            print("[FIX] Adding 'last_activity' column to user_stats table...")
            cursor.execute("ALTER TABLE user_stats ADD COLUMN last_activity DATETIME")
            conn.commit()

        print("[FIX] Schema check complete.")

    except Exception as e:
        print(f"[FIX] Error during migration: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    fix_schema()
