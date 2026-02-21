from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Subject
from pydantic import BaseModel
from typing import List
from datetime import datetime

router = APIRouter()

class SubjectBase(BaseModel):
    name: str
    code: str
    color: str
    gradient: str
    introduction: str

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(SubjectBase):
    pass

class SubjectResponse(SubjectBase):
    id: int
    chapters: int = 0
    questions: int = 0
    created_at: datetime
    class Config:
        from_attributes = True

@router.get("/", response_model=List[SubjectResponse])
def get_subjects(db: Session = Depends(get_db)):
    subjects = db.query(Subject).all()
    # Calculate counts dynamically
    response = []
    for s in subjects:
        chapter_count = len(s.topics)
        question_count = sum(len(t.questions) for t in s.topics)
        resp = SubjectResponse(
            id=s.id,
            name=s.name,
            code=s.code,
            color=s.color,
            gradient=s.gradient,
            introduction=s.introduction,
            chapters=chapter_count,
            questions=question_count,
            created_at=s.created_at
        )
        response.append(resp)
    return response

@router.post("/", response_model=SubjectResponse)
def create_subject(subject: SubjectCreate, db: Session = Depends(get_db)):
    db_subject = Subject(**subject.dict())
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    
    from ..services.logging_service import logging_service
    logging_service.log_activity(db, "Subject Created", details={"name": db_subject.name, "code": db_subject.code})
    
    return db_subject # chapters=0, questions=0 by default

@router.get("/{subject_id}", response_model=SubjectResponse)
def get_subject(subject_id: int, db: Session = Depends(get_db)):
    db_subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not db_subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    chapter_count = len(db_subject.topics)
    question_count = sum(len(t.questions) for t in db_subject.topics)
    
    # Manually construct response to ensure counts are included
    return SubjectResponse(
        id=db_subject.id,
        name=db_subject.name,
        code=db_subject.code,
        color=db_subject.color,
        gradient=db_subject.gradient,
        introduction=db_subject.introduction,
        chapters=chapter_count,
        questions=question_count,
        created_at=db_subject.created_at
    )

@router.put("/{subject_id}", response_model=SubjectResponse)
def update_subject(subject_id: int, subject: SubjectUpdate, db: Session = Depends(get_db)):
    db_subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not db_subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    for var, value in subject.dict().items():
        setattr(db_subject, var, value)
    db.commit()
    db.refresh(db_subject)
    
    chapter_count = len(db_subject.topics)
    question_count = sum(len(t.questions) for t in db_subject.topics)
    
    return SubjectResponse(
        id=db_subject.id,
        name=db_subject.name,
        code=db_subject.code,
        color=db_subject.color,
        gradient=db_subject.gradient,
        introduction=db_subject.introduction,
        chapters=chapter_count,
        questions=question_count,
        created_at=db_subject.created_at
    )

@router.delete("/{subject_id}")
def delete_subject(subject_id: int, db: Session = Depends(get_db)):
    db_subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not db_subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    db.delete(db_subject)
    db.commit()
    return {"message": "Subject deleted"}
