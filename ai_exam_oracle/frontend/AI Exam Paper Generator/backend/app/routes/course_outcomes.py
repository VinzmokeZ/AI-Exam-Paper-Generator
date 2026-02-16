"""
Course Outcomes routes for vetting workflow
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from ..database import get_db
from ..models import CourseOutcome

router = APIRouter(prefix="/api/course-outcomes", tags=["course-outcomes"])

class CourseOutcomeCreate(BaseModel):
    code: str
    label: str
    bloom_level: int
    description: str | None = None

class CourseOutcomeResponse(BaseModel):
    id: int
    code: str
    label: str
    bloom_level: int
    description: str | None
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[CourseOutcomeResponse])
def list_course_outcomes(db: Session = Depends(get_db)):
    """Get all course outcomes"""
    outcomes = db.query(CourseOutcome).all()
    return outcomes

@router.post("/", response_model=CourseOutcomeResponse)
def create_course_outcome(outcome: CourseOutcomeCreate, db: Session = Depends(get_db)):
    """Create a new course outcome"""
    # Check if code already exists
    existing = db.query(CourseOutcome).filter(CourseOutcome.code == outcome.code).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Course outcome with code {outcome.code} already exists")
    
    db_outcome = CourseOutcome(**outcome.dict())
    db.add(db_outcome)
    db.commit()
    db.refresh(db_outcome)
    
    return db_outcome

@router.put("/{outcome_id}", response_model=CourseOutcomeResponse)
def update_course_outcome(outcome_id: int, outcome: CourseOutcomeCreate, db: Session = Depends(get_db)):
    """Update a course outcome"""
    db_outcome = db.query(CourseOutcome).filter(CourseOutcome.id == outcome_id).first()
    if not db_outcome:
        raise HTTPException(status_code=404, detail="Course outcome not found")
    
    db_outcome.code = outcome.code
    db_outcome.label = outcome.label
    db_outcome.bloom_level = outcome.bloom_level
    db_outcome.description = outcome.description
    
    db.commit()
    db.refresh(db_outcome)
    
    return db_outcome

@router.delete("/{outcome_id}")
def delete_course_outcome(outcome_id: int, db: Session = Depends(get_db)):
    """Delete a course outcome"""
    db_outcome = db.query(CourseOutcome).filter(CourseOutcome.id == outcome_id).first()
    if not db_outcome:
        raise HTTPException(status_code=404, detail="Course outcome not found")
    
    db.delete(db_outcome)
    db.commit()
    
    return {"message": "Course outcome deleted successfully", "id": outcome_id}
