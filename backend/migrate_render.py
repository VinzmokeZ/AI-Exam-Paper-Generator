import psycopg2
import sys
import logging

# Configure basic logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

def migrate_database():
    db_url = "postgresql://vinz:SwQ0B2gOncAuA6R6VYBxXhrohHKD65yj@dpg-d6cgk6vgi27c73e9hqp0-a.singapore-postgres.render.com/ai_exam_oracle"
    print("Connecting to live Render Database...")
    
    try:
        # Connect to your postgres DB
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cursor = conn.cursor()
        print("✅ Connection Successful!")

        # The raw SQL commands to add columns without deleting data
        # We use 'IF NOT EXISTS' so this script is safe to run multiple times
        print("\nApplying Schema Updates (Zero Downtime)...")
        
        # 1. Update questions table
        queries = [
            "ALTER TABLE questions ADD COLUMN IF NOT EXISTS marks INTEGER DEFAULT 5;",
            "ALTER TABLE questions ADD COLUMN IF NOT EXISTS bloom_level VARCHAR(50) DEFAULT 'Application';",
            "ALTER TABLE questions ADD COLUMN IF NOT EXISTS learning_outcome VARCHAR(50) DEFAULT 'LO1';",
            "ALTER TABLE questions ADD COLUMN IF NOT EXISTS course_outcomes JSON;",
            "ALTER TABLE questions ADD COLUMN IF NOT EXISTS course_outcome VARCHAR(50);"
        ]
        
        for query in queries:
            try:
                cursor.execute(query)
                logging.info(f"Executed: {query}")
            except Exception as e:
                logging.error(f"Failed to execute query '{query}': {e}")
                
        # 2. Update user_stats table (Since we temporarily reverted gamification too)
        stats_queries = [
            "ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;",
            "ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;",
            "ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS total_days_active INTEGER DEFAULT 0;",
            "ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP;"
        ]
        
        for query in stats_queries:
            try:
                cursor.execute(query)
                logging.info(f"Executed: {query}")
            except Exception as e:
                logging.error(f"Failed to execute query '{query}': {e}")

        cursor.close()
        conn.close()
        print("\n✅ Migration Complete! The database is now ready for dynamic Analytics.")
        
    except Exception as e:
        print(f"❌ Connection or Execution Failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    migrate_database()
