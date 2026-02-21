import sys
import os

# Add the current directory to path so we can import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import init_db, SessionLocal
from app.models import Subject

def seed_data():
    db = SessionLocal()
    # Check if we already have data
    if db.query(Subject).count() == 0:
        sample_subject = Subject(
            name="Computer Science",
            code="CS101",
            color="teal",
            gradient="linear-gradient(135deg, #008080 0%, #004d4d 100%)",
            introduction="Introduction to Computer Science fundamentals."
        )
        db.add(sample_subject)
        db.commit()
        print("Database seeded with sample subject.")
    db.close()

if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    seed_data()
    print("Done.")
