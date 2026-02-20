from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ExamHistory
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class ExamHistoryBase(BaseModel):
    subject_name: str
    topic_name: str
    questions_count: Optional[int] = None
    question_count: Optional[int] = None  # Accept both field names
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
    # Handle both field names
    history_dict = history.dict()
    if history_dict.get('question_count') and not history_dict.get('questions_count'):
        history_dict['questions_count'] = history_dict['question_count']
    
    # Remove the extra field to avoid database errors
    history_dict.pop('question_count', None)
    
    db_history = ExamHistory(**history_dict)
    db.add(db_history)
    db.commit()
    db.refresh(db_history)
    return db_history

@router.delete("/history/{history_id}")
def delete_history(history_id: int, db: Session = Depends(get_db)):
    history = db.query(ExamHistory).filter(ExamHistory.id == history_id).first()
    if not history:
        raise HTTPException(status_code=404, detail="History not found")
    
    db.delete(history)
    db.commit()
    return {"message": "History deleted successfully"}
