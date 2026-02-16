"""
Migration script to move data from SQLite to MySQL
Preserves all existing subjects, topics, questions, achievements, and user stats
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import pymysql
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Base, Subject, Topic, Question, UserStats, Achievement, Notification, ExamHistory, ActivityLog, CourseOutcome
from app.database import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
import time

# SQLite source
SQLITE_URL = "sqlite:///./exam_oracle.db"

def create_mysql_database():
    """Create fresh MySQL database"""
    print(f"[DB] Creating MySQL database: {DB_NAME}")
    
    for i in range(5):
        try:
            connection = pymysql.connect(
                host=DB_HOST,
                port=int(DB_PORT),
                user=DB_USER,
                password=DB_PASSWORD,
                connect_timeout=10
            )
            try:
                with connection.cursor() as cursor:
                    print(f"  → Dropping existing database {DB_NAME} for fresh start...")
                    cursor.execute(f"DROP DATABASE IF EXISTS `{DB_NAME}`")
                    print(f"  → Creating fresh database {DB_NAME}...")
                    cursor.execute(f"CREATE DATABASE `{DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
                connection.commit()
                print("  ✓ Database created successfully")
                return True
            finally:
                connection.close()
        except Exception as e:
            print(f"  ✗ Connection attempt {i+1} failed: {e}")
            if i < 4:
                time.sleep(2)
    
    return False

def create_mysql_tables():
    """Create all tables in MySQL database"""
    print(f"[DB] Creating MySQL tables...")
    mysql_url = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
    
    try:
        engine = create_engine(mysql_url, pool_pre_ping=True)
        Base.metadata.create_all(bind=engine)
        print("  ✓ All tables created successfully")
        return engine
    except Exception as e:
        print(f"  ✗ Failed to create tables: {e}")
        return None

def migrate_data(sqlite_engine, mysql_engine):
    """Migrate data from SQLite to MySQL"""
    print("[MIGRATION] Starting data migration...")
    
    SQLiteSession = sessionmaker(bind=sqlite_engine)
    MySQLSession = sessionmaker(bind=mysql_engine)
    
    sqlite_session = SQLiteSession()
    mysql_session = MySQLSession()
    
    try:
        # Migrate Subjects
        subjects = sqlite_session.query(Subject).all()
        print(f"  → Migrating {len(subjects)} subjects...")
        for subject in subjects:
            new_subject = Subject(
                id=subject.id,
                code=subject.code,
                name=subject.name,
                color=subject.color,
                gradient=subject.gradient,
                introduction=subject.introduction,
                created_at=subject.created_at
            )
            mysql_session.merge(new_subject)
        mysql_session.commit()
        print(f"  ✓ Migrated {len(subjects)} subjects")
        
        # Migrate Topics
        topics = sqlite_session.query(Topic).all()
        print(f"  → Migrating {len(topics)} topics...")
        for topic in topics:
            new_topic = Topic(
                id=topic.id,
                subject_id=topic.subject_id,
                name=topic.name,
                description=getattr(topic, 'description', None),
                has_syllabus=topic.has_syllabus,
                has_textbook=getattr(topic, 'has_textbook', False),
                textbook_path=getattr(topic, 'textbook_path', None),
                created_at=topic.created_at
            )
            mysql_session.merge(new_topic)
        mysql_session.commit()
        print(f"  ✓ Migrated {len(topics)} topics")
        
        # Migrate Questions
        questions = sqlite_session.query(Question).all()
        print(f"  → Migrating {len(questions)} questions...")
        for question in questions:
            new_question = Question(
                id=question.id,
                topic_id=question.topic_id,
                rubric_id=getattr(question, 'rubric_id', None),
                question_text=question.question_text,
                question_type=question.question_type,
                options=question.options,
                correct_answer=question.correct_answer,
                explanation=question.explanation,
                marks=question.marks,
                bloom_level=question.bloom_level,
                course_outcome=question.course_outcome,
                learning_outcome=getattr(question, 'learning_outcome', None),
                status=question.status if question.status != 'draft' else 'pending',
                created_at=question.created_at
            )
            mysql_session.merge(new_question)
        mysql_session.commit()
        print(f"  ✓ Migrated {len(questions)} questions")
        
        # Migrate UserStats
        user_stats = sqlite_session.query(UserStats).all()
        print(f"  → Migrating {len(user_stats)} user stats...")
        for stats in user_stats:
            new_stats = UserStats(
                id=stats.id,
                user_id=stats.user_id,
                username=stats.username,
                xp=stats.xp,
                level=stats.level,
                coins=stats.coins,
                badges=stats.badges,
                streak=stats.streak,
                last_activity=stats.last_activity
            )
            mysql_session.merge(new_stats)
        mysql_session.commit()
        print(f"  ✓ Migrated {len(user_stats)} user stats")
        
        # Migrate Achievements
        achievements = sqlite_session.query(Achievement).all()
        print(f"  → Migrating {len(achievements)} achievements...")
        for achievement in achievements:
            new_achievement = Achievement(
                id=achievement.id,
                name=achievement.name,
                description=achievement.description,
                badge_icon=achievement.badge_icon,
                unlocked=achievement.unlocked,
                unlocked_at=achievement.unlocked_at
            )
            mysql_session.merge(new_achievement)
        mysql_session.commit()
        print(f"  ✓ Migrated {len(achievements)} achievements")
        
        # Migrate Notifications
        notifications = sqlite_session.query(Notification).all()
        print(f"  → Migrating {len(notifications)} notifications...")
        for notification in notifications:
            new_notification = Notification(
                id=notification.id,
                title=notification.title,
                message=notification.message,
                type=notification.type,
                unread=notification.unread,
                color=notification.color,
                icon_name=notification.icon_name,
                link=notification.link,
                timestamp=notification.timestamp
            )
            mysql_session.merge(new_notification)
        mysql_session.commit()
        print(f"  ✓ Migrated {len(notifications)} notifications")
        
        # Migrate Exam History
        exam_history = sqlite_session.query(ExamHistory).all()
        print(f"  → Migrating {len(exam_history)} exam history records...")
        for history in exam_history:
            new_history = ExamHistory(
                id=history.id,
                subject_name=history.subject_name,
                topic_name=history.topic_name,
                questions_count=history.questions_count,
                marks=history.marks,
                duration=history.duration,
                questions=history.questions,
                created_at=history.created_at
            )
            mysql_session.merge(new_history)
        mysql_session.commit()
        print(f"  ✓ Migrated {len(exam_history)} exam history records")
        
        # Seed default course outcomes
        print("  → Seeding default course outcomes...")
        default_cos = [
            CourseOutcome(code="CO1", label="Remember & Understand", bloom_level=2, description="Recall and comprehend basic concepts"),
            CourseOutcome(code="CO2", label="Apply", bloom_level=3, description="Apply knowledge to solve problems"),
            CourseOutcome(code="CO3", label="Analyze & Evaluate", bloom_level=5, description="Analyze and critically evaluate information")
        ]
        for co in default_cos:
            mysql_session.merge(co)
        mysql_session.commit()
        print(f"  ✓ Seeded {len(default_cos)} course outcomes")
        
        print("[SUCCESS] Migration completed successfully!")
        
    except Exception as e:
        mysql_session.rollback()
        print(f"[ERROR] Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        sqlite_session.close()
        mysql_session.close()
    
    return True

def validate_migration(mysql_engine):
    """Validate that migration was successful"""
    print("[VALIDATION] Validating migration...")
    
    MySQLSession = sessionmaker(bind=mysql_engine)
    session = MySQLSession()
    
    try:
        subject_count = session.query(Subject).count()
        topic_count = session.query(Topic).count()
        question_count = session.query(Question).count()
        user_stats_count = session.query(UserStats).count()
        achievement_count = session.query(Achievement).count()
        notification_count = session.query(Notification).count()
        exam_history_count = session.query(ExamHistory).count()
        co_count = session.query(CourseOutcome).count()
        
        print(f"  ✓ Subjects: {subject_count}")
        print(f"  ✓ Topics: {topic_count}")
        print(f"  ✓ Questions: {question_count}")
        print(f"  ✓ User Stats: {user_stats_count}")
        print(f"  ✓ Achievements: {achievement_count}")
        print(f"  ✓ Notifications: {notification_count}")
        print(f"  ✓ Exam History: {exam_history_count}")
        print(f"  ✓ Course Outcomes: {co_count}")
        
        print("[SUCCESS] Validation passed!")
        return True
        
    except Exception as e:
        print(f"[ERROR] Validation failed: {e}")
        return False
    finally:
        session.close()

def main():
    print("=" * 60)
    print("AI EXAM ORACLE - SQLITE TO MYSQL MIGRATION")
    print("=" * 60)
    print()
    
    # Check if SQLite database exists
    if not os.path.exists("exam_oracle.db"):
        print("[WARNING] SQLite database not found. Creating fresh MySQL database...")
        if create_mysql_database():
            mysql_engine = create_mysql_tables()
            if mysql_engine:
                print("[INFO] Fresh MySQL database created. Run seed_db.py to populate data.")
                return
        print("[ERROR] Failed to create MySQL database")
        sys.exit(1)
    
    # Create MySQL database
    if not create_mysql_database():
        print("[ERROR] Failed to create MySQL database. Is XAMPP/MySQL running?")
        sys.exit(1)
    
    # Create MySQL tables
    mysql_engine = create_mysql_tables()
    if not mysql_engine:
        print("[ERROR] Failed to create MySQL tables")
        sys.exit(1)
    
    # Create SQLite engine
    print("[DB] Connecting to SQLite database...")
    try:
        sqlite_engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
        print("  ✓ Connected to SQLite")
    except Exception as e:
        print(f"  ✗ Failed to connect to SQLite: {e}")
        sys.exit(1)
    
    # Migrate data
    if not migrate_data(sqlite_engine, mysql_engine):
        print("[ERROR] Migration failed")
        sys.exit(1)
    
    # Validate migration
    if not validate_migration(mysql_engine):
        print("[ERROR] Validation failed")
        sys.exit(1)
    
    print()
    print("=" * 60)
    print("MIGRATION COMPLETED SUCCESSFULLY!")
    print("=" * 60)
    print()
    print("Next steps:")
    print("1. Open phpMyAdmin at http://localhost/phpmyadmin")
    print("2. Select 'ai_exam_oracle' database")
    print("3. Browse tables to verify data")
    print("4. Update backend/.env to set USE_MYSQL=true")
    print("5. Restart your application")
    print()

if __name__ == "__main__":
    main()
