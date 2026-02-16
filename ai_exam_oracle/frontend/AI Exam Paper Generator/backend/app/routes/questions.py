from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Question
from pydantic import BaseModel

router = APIRouter()

class QuestionStatusUpdate(BaseModel):
    status: str

@router.get("/vetting")
def get_vetting_questions(db: Session = Depends(get_db)):
    return db.query(Question).filter(Question.status == "draft").all()

@router.post("/{question_id}/status")
def update_question_status(question_id: int, status_update: QuestionStatusUpdate, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    if status_update.status not in ["approved", "rejected", "draft"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    question.status = status_update.status
    db.commit()
    
    from ..services.logging_service import logging_service
    logging_service.log_activity(db, f"Question {status_update.status.capitalize()}", details={"id": question.id})
    
    return {"message": f"Question status updated to {status_update.status}"}

@router.put("/{question_id}")
def update_question(question_id: int, updates: dict, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    for key, value in updates.items():
        if hasattr(question, key):
            setattr(question, key, value)
            
    db.commit()
    db.refresh(question)
    return question

@router.delete("/{question_id}")
def delete_question(question_id: int, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(question)
    db.commit()
    return {"message": "Question deleted"}
