import pymysql
import time
import sys
from app.database import init_db, SessionLocal, DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, USE_MYSQL
from app.models import Subject, UserStats

def initialize_database():
    print(f"[DB] Initializing {DB_NAME} on {DB_HOST}...")
    
    # Retry loop for connection
    for i in range(5):
        try:
            connection = pymysql.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD, connect_timeout=5)
            try:
                with connection.cursor() as cursor:
                    # print(f"  > Dropping existing database {DB_NAME} for fresh start...")
                    # cursor.execute(f"DROP DATABASE IF EXISTS {DB_NAME}")
                    print(f"  > Creating fresh database {DB_NAME}...")
                    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
                connection.commit()
                return True
            finally:
                connection.close()
        except Exception as e:
            print(f"  > Connection attempt {i+1} failed: {e}")
            time.sleep(2)
    return False

def seed_subjects():
    db = SessionLocal()
    try:
        if db.query(Subject).count() > 0:
            print("  > Subjects already exist. Skipping seed.")
        else:
            subjects = [
                { "code": "CS301", "name": "Computer Science", "color": "#C5B3E6", "gradient": "from-[#C5B3E6] to-[#9B86C5]", "introduction": "Introduction to Computer Science" },
                { "code": "MATH101", "name": "Mathematics", "color": "#8BE9FD", "gradient": "from-[#8BE9FD] to-[#6FEDD6]", "introduction": "Fundamentals of Mathematics" },
                { "code": "PHYS202", "name": "Physics", "color": "#FFB86C", "gradient": "from-[#FFB86C] to-[#FF6AC1]", "introduction": "Principles of Physics" },
                { "code": "CHEM201", "name": "Chemistry", "color": "#50FA7B", "gradient": "from-[#50FA7B] to-[#6FEDD6]", "introduction": "General Chemistry I" },
                { "code": "ENG101", "name": "English Literature", "color": "#FF6AC1", "gradient": "from-[#FF6AC1] to-[#C5B3E6]", "introduction": "Literature & Composition" },
                { "code": "BIO301", "name": "Biology", "color": "#F1FA8C", "gradient": "from-[#F1FA8C] to-[#50FA7B]", "introduction": "Biological Sciences" },
            ]
            for s in subjects:
                db_subject = Subject(**s)
                db.add(db_subject)
            db.commit()
            print("  > Seeded subjects.")
    finally:
        db.close()

def seed_user_stats():
    db = SessionLocal()
    try:
        if db.query(UserStats).count() == 0:
            stats = UserStats(
                user_id=1, 
                username="Professor Vinz",
                xp=2450, 
                level=3, 
                coins=150, 
                streak=5
            )
            db.add(stats)
            db.commit()
            print("  > Seeded user stats (Professor Vinz).")
    finally:
        db.close()

def seed_notifications():
    db = SessionLocal()
    from app.models import Notification
    try:
        if db.query(Notification).count() == 0:
            notes = [
                Notification(
                    title="Welcome to AI Exam Oracle",
                    message="Your system is ready. Try generating your first exam!",
                    type="success",
                    color="#50FA7B",
                    icon_name="Sparkles",
                    link="/generate",
                    unread=True
                ),
                Notification(
                    title="System Update",
                    message="New features added: Profile Editing & Real-time Analytics.",
                    type="info",
                    color="#8BE9FD",
                    icon_name="Info",
                    link="/settings",
                    unread=True
                ),
                Notification(
                    title="Vetting Required",
                    message="You have pending questions to review.",
                    type="warning",
                    color="#FFB86C",
                    icon_name="AlertCircle",
                    link="/vetting",
                    unread=True
                )
            ]
            for n in notes:
                db.add(n)
            db.commit()
            print("  > Seeded default notifications.")
    finally:
        db.close()

def seed_achievements():
    db = SessionLocal()
    from app.models import Achievement
    try:
        if db.query(Achievement).count() == 0:
            achievements = [
                Achievement(name="First Steps", description="Generate your first exam", badge_icon="Sparkles", unlocked=True),
                Achievement(name="Question Master", description="Generate 1000+ questions", badge_icon="Zap", unlocked=False),
                Achievement(name="Streak Keeper", description="Maintain a 7-day streak", badge_icon="Flame", unlocked=False),
                Achievement(name="Vetting Pro", description="Approve 50 questions", badge_icon="CheckCircle", unlocked=False),
            ]
            for a in achievements:
                db.add(a)
            db.commit()
            print("  > Seeded default achievements.")
    finally:
        db.close()

def seed_topics():
    db = SessionLocal()
    from app.models import Topic
    try:
        if db.query(Topic).count() > 0:
            print("  > Topics already exist. Skipping seed.")
        else:
            # Map subjects by code for easier referencing
            subjects = {s.code: s.id for s in db.query(Subject).all()}
            
            topics_data = [
                # Computer Science (CS301)
                {"subject_id": subjects.get("CS301"), "name": "Data Structures", "description": "Arrays, Linked Lists, Trees, Graphs"},
                {"subject_id": subjects.get("CS301"), "name": "Algorithms", "description": "Sorting, Searching, Dynamic Programming, Complexity"},
                {"subject_id": subjects.get("CS301"), "name": "Operating Systems", "description": "Processes, Threads, Memory Management, File Systems"},
                {"subject_id": subjects.get("CS301"), "name": "Computer Architecture", "description": "CPU Design, Pipelining, Memory Hierarchy, Instruction Sets"},
                {"subject_id": subjects.get("CS301"), "name": "Database Management Systems", "description": "SQL, Normalization, Indexing, Transactions"},
                {"subject_id": subjects.get("CS301"), "name": "Software Engineering", "description": "SDLC, Agile, Testing, Maintenance"},
                {"subject_id": subjects.get("CS301"), "name": "Computer Networks", "description": "OSI Model, TCP/IP, Routing, Security"},
                {"subject_id": subjects.get("CS301"), "name": "Artificial Intelligence", "description": "Search, Logic, ML Basics, Neural Networks"},
                
                # Mathematics (MATH101)
                {"subject_id": subjects.get("MATH101"), "name": "Calculus", "description": "Limits, Derivatives, Integrals"},
                {"subject_id": subjects.get("MATH101"), "name": "Linear Algebra", "description": "Vectors, Matrices, Eigenvalues"},
                {"subject_id": subjects.get("MATH101"), "name": "Probability", "description": "Distributions, Bayes Theorem"},
                {"subject_id": subjects.get("MATH101"), "name": "Statistics", "description": "Hypothesis Testing, Regression"},
                {"subject_id": subjects.get("MATH101"), "name": "Discrete Mathematics", "description": "Sets, Logic, Graph Theory"},

                # Physics (PHYS202)
                {"subject_id": subjects.get("PHYS202"), "name": "Thermodynamics", "description": "Heat, Entropy, Laws of Thermodynamics"},
                {"subject_id": subjects.get("PHYS202"), "name": "Electromagnetism", "description": "Maxwell's Equations, Circuits"},
                {"subject_id": subjects.get("PHYS202"), "name": "Optics", "description": "Reflection, Refraction, Interference"},
                {"subject_id": subjects.get("PHYS202"), "name": "Quantum Physics", "description": "Wave-Particle Duality, Schrödinger Equation"},
                {"subject_id": subjects.get("PHYS202"), "name": "Nuclear Physics", "description": "Radioactivity, Fission, Fusion"},

                # Chemistry (CHEM201)
                {"subject_id": subjects.get("CHEM201"), "name": "Organic Chemistry", "description": "Hydrocarbons, Functional Groups"},
                {"subject_id": subjects.get("CHEM201"), "name": "Inorganic Chemistry", "description": "Periodic Table, Chemical Bonding"},
                {"subject_id": subjects.get("CHEM201"), "name": "Physical Chemistry", "description": "Kinetics, Thermodynamics, Quantum Chem"},
                {"subject_id": subjects.get("CHEM201"), "name": "Analytical Chemistry", "description": "Spectroscopy, Chromatography"},

                # English Literature (ENG101)
                {"subject_id": subjects.get("ENG101"), "name": "Grammar", "description": "Syntax, Punctuation, Parts of Speech"},
                {"subject_id": subjects.get("ENG101"), "name": "Literature", "description": "Prose, Poetry, Drama Analysis"},
                {"subject_id": subjects.get("ENG101"), "name": "Communication Skills", "description": "Verbal, Non-Verbal, Presentation"},
                {"subject_id": subjects.get("ENG101"), "name": "Writing Skills", "description": "Essays, Reports, Creative Writing"},

                # Biology (BIO301)
                {"subject_id": subjects.get("BIO301"), "name": "Cell Biology", "description": "Cell Structure, Membrane Transport, Cell Cycle"},
                {"subject_id": subjects.get("BIO301"), "name": "Genetics", "description": "DNA Structure, Inheritance, Gene Expression"},
                {"subject_id": subjects.get("BIO301"), "name": "Ecology", "description": "Ecosystems, Populations, Conservation"},
                {"subject_id": subjects.get("BIO301"), "name": "Evolution", "description": "Natural Selection, Speciation, Phylogenetics"},
            ]
            
            for t in topics_data:
                if t["subject_id"]: # Only add if subject exists
                    db.add(Topic(**t))
            
            db.commit()
            print("  > Seeded default topics.")
    finally:
        db.close()

if __name__ == "__main__":
    if not USE_MYSQL or initialize_database():
        try:
            init_db()
            seed_subjects()
            seed_topics()
            seed_user_stats()
            seed_notifications()
            seed_achievements()
            print("[SUCCESS] Database is fully ready.")
        except Exception as e:
            print(f"[ERROR] Seeding failed: {e}")
            sys.exit(1)
    else:
        print("[CRITICAL] Could not connect to MySQL even after retries.")
        sys.exit(1)
