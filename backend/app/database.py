from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "ai_exam_oracle")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
USE_MYSQL = os.getenv("USE_MYSQL", "true").lower() == "true"
RENDER_DB_URL = os.getenv("DATABASE_URL") # Render provides this automatically

# Build database URL
if RENDER_DB_URL and "postgres" in RENDER_DB_URL:
    # Render/Heroku sometimes use 'postgres://' which SQLAlchemy deprecated in favor of 'postgresql://'
    if RENDER_DB_URL.startswith("postgres://"):
        RENDER_DB_URL = RENDER_DB_URL.replace("postgres://", "postgresql://", 1)
    
    DATABASE_URL = RENDER_DB_URL
    try:
        engine = create_engine(
            DATABASE_URL,
            pool_size=10,
            max_overflow=20
        )
        print(f"[DB] ✅ Connected to Render PostgreSQL")
    except Exception as e:
        print(f"[DB] ⚠️ PostgreSQL connection failed: {e}")
        # Fallback to SQLite
        DATABASE_URL = "sqlite:///./exam_oracle.db"
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

elif USE_MYSQL:
    DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
    try:
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=3600,
            pool_size=10,
            max_overflow=20
        )
        # Test connection immediately
        with engine.connect() as conn:
            pass
        print(f"[DB] ✅ Connected to MySQL at {DB_HOST}:{DB_PORT}/{DB_NAME}")
    except Exception as e:
        print(f"[DB] ⚠️ MySQL unavailable ({e}). Falling back to SQLite.")
        DATABASE_URL = "sqlite:///./exam_oracle.db"
        engine = create_engine(
            DATABASE_URL,
            connect_args={"check_same_thread": False}
        )
else:
    # Fallback to SQLite for development
    DATABASE_URL = "sqlite:///./exam_oracle.db"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )

    from sqlalchemy import event
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
    ensure_schema_sync()
    seed_defaults()

def ensure_schema_sync():
    """
    Schema sync disabled to prevent deployment race conditions with Render.
    Reverted to stable db schema.
    """
    pass

def seed_defaults():
    from .models import Subject, Topic, Achievement
    db = SessionLocal()
    try:
        if db.query(Subject).count() == 0:
            print("[DB] No subjects found. Seeding defaults...")
            subjects_data = [
                { "code": "CS301", "name": "Computer Science", "color": "#C5B3E6", "gradient": "from-[#C5B3E6] to-[#9B86C5]", "introduction": "Core fundamentals of modern computer science." },
                { "code": "MATH101", "name": "Mathematics", "color": "#8BE9FD", "gradient": "from-[#8BE9FD] to-[#6FEDD6]", "introduction": "Foundational mathematical principles." },
                { "code": "PHYS202", "name": "Physics", "color": "#FFB86C", "gradient": "from-[#FFB86C] to-[#FF6AC1]", "introduction": "Exploration of physical laws and mechanics." },
                { "code": "CHEM201", "name": "Chemistry", "color": "#50FA7B", "gradient": "from-[#50FA7B] to-[#6FEDD6]", "introduction": "Analysis of chemical structures and reactions." },
                { "code": "ENG101", "name": "English Literature", "color": "#FF6AC1", "gradient": "from-[#FF6AC1] to-[#C5B3E6]", "introduction": "Study of classical and contemporary literature." },
                { "code": "BIO301", "name": "Biology", "color": "#F1FA8C", "gradient": "from-[#F1FA8C] to-[#50FA7B]", "introduction": "Life sciences and biological systems." },
            ]
            
            db_subjects = {}
            for s in subjects_data:
                db_subject = Subject(**s)
                db.add(db_subject)
                db.flush() # Get ID
                db_subjects[s["code"]] = db_subject.id
            
            topics_data = [
                # Biology (BIO301)
                {"subject_id": db_subjects.get("BIO301"), "name": "Cell Biology", "description": "Cell Structure, Membrane Transport, Cell Cycle"},
                {"subject_id": db_subjects.get("BIO301"), "name": "Genetics", "description": "DNA Structure, Inheritance, Gene Expression"},
                {"subject_id": db_subjects.get("BIO301"), "name": "Ecology", "description": "Ecosystems, Populations, Conservation"},
                {"subject_id": db_subjects.get("BIO301"), "name": "Evolution", "description": "Natural Selection, Speciation, Phylogenetics"},
                
                # CS301
                {"subject_id": db_subjects.get("CS301"), "name": "Data Structures", "description": "Arrays, Linked Lists, Trees, Graphs"},
                {"subject_id": db_subjects.get("CS301"), "name": "Algorithms", "description": "Sorting, Searching, Complexity"},
                
                # Math
                {"subject_id": db_subjects.get("MATH101"), "name": "Calculus", "description": "Limits, Derivatives, Integrals"},
                {"subject_id": db_subjects.get("MATH101"), "name": "Linear Algebra", "description": "Vectors, Matrices, Eigenvalues"},
            ]
            
            for t in topics_data:
                if t["subject_id"]:
                    db.add(Topic(**t))
            
            db.commit()
            print(f"[DB] Successfully seeded {len(subjects_data)} subjects and {len(topics_data)} topics.")

        if db.query(Achievement).count() == 0:
            print("[DB] No achievements found. Seeding defaults...")
            ach_data = [
                {"name": "First Steps", "description": "Generate your first AI exam.", "badge_icon": "Zap", "unlocked": False},
                {"name": "Question Master", "description": "Generate over 1000 questions in total.", "badge_icon": "Trophy", "unlocked": False},
                {"name": "Streak Keeper", "description": "Maintain a 7-day learning streak.", "badge_icon": "Flame", "unlocked": False},
                {"name": "Vetting Pro", "description": "Approve 50 questions in the vetting center.", "badge_icon": "CheckCircle", "unlocked": False},
                {"name": "Subject Expert", "description": "Complete exams for 5 different subjects.", "badge_icon": "Award", "unlocked": False},
            ]
            for ach in ach_data:
                db.add(Achievement(**ach))
            db.commit()
            print(f"[DB] Successfully seeded {len(ach_data)} achievements.")
    except Exception as e:
        print(f"[ERROR] Seeding failed: {e}")
        db.rollback()
    finally:
        db.close()
