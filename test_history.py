import sys
import os
import json

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
from app.models import ExamHistory, Subject, Topic
from app.database import SessionLocal

db = SessionLocal()

try:
    print("Testing History Creation...")
    new_history = ExamHistory(
        subject_name="Test Subject",
        topic_name="Test Topic",
        questions_count=5,
        marks=25,
        duration=60,
        questions=["Q1", "Q2", "Q3"]
    )
    db.add(new_history)
    db.commit()
    print("History Creation Successful!")
except Exception as e:
    print(f"FAILED TO CREATE HISTORY: {e}")
    db.rollback()
finally:
    db.close()
