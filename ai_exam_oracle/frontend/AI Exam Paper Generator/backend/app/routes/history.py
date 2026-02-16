from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ExamHistory
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class ExamHistoryBase(BaseModel):
    subject_name: str
    topic_name: str
    questions_count: int
    marks: int
    duration: int
    questions: list

class ExamHistoryResponse(ExamHistoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("/history", response_model=List[ExamHistoryResponse])
def get_history(db: Session = Depends(get_db)):
    return db.query(ExamHistory).order_by(ExamHistory.created_at.desc()).all()

@router.post("/history", response_model=ExamHistoryResponse)
def save_history(history: ExamHistoryBase, db: Session = Depends(get_db)):
    db_history = ExamHistory(**history.dict())
    db.add(db_history)
    db.commit()
    db.refresh(db_history)
    return db_history
