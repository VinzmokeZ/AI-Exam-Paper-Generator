from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Topic
from pydantic import BaseModel
from typing import List
from datetime import datetime

router = APIRouter()

class TopicBase(BaseModel):
    name: str
    subject_id: int

class TopicCreate(TopicBase):
    pass

class TopicUpdate(BaseModel):
    name: str

class TopicResponse(TopicBase):
    id: int
    has_syllabus: bool
    created_at: datetime
    question_count: int = 0
    class Config:
        from_attributes = True

@router.get("/subjects/{subject_id}/topics", response_model=List[TopicResponse])
def get_topics(subject_id: int, db: Session = Depends(get_db)):
    topics = db.query(Topic).filter(Topic.subject_id == subject_id).all()
    # Populate question_count
    for t in topics:
        t.question_count = len(t.questions)
    return topics

@router.post("/subjects/{subject_id}/topics", response_model=TopicResponse)
def create_topic(subject_id: int, topic: TopicCreate, db: Session = Depends(get_db)):
    db_topic = Topic(**topic.dict())
    db.add(db_topic)
    db.commit()
    db.refresh(db_topic)
    return db_topic

@router.put("/topics/{topic_id}", response_model=TopicResponse)
def update_topic(topic_id: int, topic: TopicUpdate, db: Session = Depends(get_db)):
    db_topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not db_topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    db_topic.name = topic.name
    db.commit()
    db.refresh(db_topic)
    return db_topic

@router.delete("/topics/{topic_id}")
def delete_topic(topic_id: int, db: Session = Depends(get_db)):
    db_topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not db_topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    db.delete(db_topic)
    db.commit()
    return {"message": "Topic deleted"}
