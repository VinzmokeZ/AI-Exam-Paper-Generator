import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
from app.models import Question
from app.database import SessionLocal

db = SessionLocal()

print("Clearing draft questions...")
deleted = db.query(Question).filter(Question.status == "draft").delete()
db.commit()
print(f"Deleted {deleted} draft questions.")
db.close()
