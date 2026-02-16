"""
Rubric routes for creating, managing, and using exam rubrics
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel, Field
from ..database import get_db
from ..models import Rubric, RubricQuestionDistribution, RubricLODistribution, Subject
from ..services.rubric_service import validate_rubric, duplicate_rubric_logic

router = APIRouter(prefix="/api/rubrics", tags=["rubrics"])

# Pydantic schemas
class QuestionDistributionCreate(BaseModel):
    question_type: str = Field(..., description="MCQ, Short, or Essay")
    count: int = Field(..., ge=0)
    marks_each: int = Field(..., ge=1)

class LODistributionCreate(BaseModel):
    learning_outcome: str = Field(..., description="LO1-LO5")
    percentage: int = Field(..., ge=0, le=100)

class RubricCreate(BaseModel):
    name: str
    subject_id: int
    exam_type: str = Field(..., description="Final, Midterm, Quiz, Assignment")
    duration_minutes: int = Field(..., ge=1)
    ai_instructions: str | None = None
    question_distributions: List[QuestionDistributionCreate]
    lo_distributions: List[LODistributionCreate]

class RubricResponse(BaseModel):
    id: int
    name: str
    subject_id: int
    subject_name: str | None = None
    exam_type: str
    duration_minutes: int
    total_marks: int
    ai_instructions: str | None
    question_distributions: List[dict]
    lo_distributions: List[dict]
    
    class Config:
        from_attributes = True

@router.post("/", response_model=RubricResponse)
def create_rubric(rubric: RubricCreate, db: Session = Depends(get_db)):
    """
    Create a new exam rubric with question type and LO distributions
    """
    # Validate LO distribution totals 100%
    validation_error = validate_rubric(rubric.dict())
    if validation_error:
        raise HTTPException(status_code=400, detail=validation_error)
    
    # Check if subject exists
    subject = db.query(Subject).filter(Subject.id == rubric.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    # Calculate total marks
    total_marks = sum(
        qd.count * qd.marks_each for qd in rubric.question_distributions
    )
    
    # Create rubric
    db_rubric = Rubric(
        name=rubric.name,
        subject_id=rubric.subject_id,
        exam_type=rubric.exam_type,
        duration_minutes=rubric.duration_minutes,
        total_marks=total_marks,
        ai_instructions=rubric.ai_instructions
    )
    db.add(db_rubric)
    db.flush()  # Get rubric ID
    
    # Add question distributions
    for qd in rubric.question_distributions:
        db_qd = RubricQuestionDistribution(
            rubric_id=db_rubric.id,
            question_type=qd.question_type,
            count=qd.count,
            marks_each=qd.marks_each
        )
        db.add(db_qd)
    
    # Add LO distributions
    for lo in rubric.lo_distributions:
        db_lo = RubricLODistribution(
            rubric_id=db_rubric.id,
            learning_outcome=lo.learning_outcome,
            percentage=lo.percentage
        )
        db.add(db_lo)
    
    db.commit()
    db.refresh(db_rubric)
    
    # Build response
    return build_rubric_response(db_rubric, subject.name, db)

@router.get("/", response_model=List[RubricResponse])
def list_rubrics(db: Session = Depends(get_db)):
    """
    Get all saved rubrics
    """
    rubrics = db.query(Rubric).all()
    return [
        build_rubric_response(
            rubric,
            db.query(Subject).filter(Subject.id == rubric.subject_id).first().name,
            db
        )
        for rubric in rubrics
    ]

@router.get("/{rubric_id}", response_model=RubricResponse)
def get_rubric(rubric_id: int, db: Session = Depends(get_db)):
    """
    Get a specific rubric by ID
    """
    rubric = db.query(Rubric).filter(Rubric.id == rubric_id).first()
    if not rubric:
        raise HTTPException(status_code=404, detail="Rubric not found")
    
    subject = db.query(Subject).filter(Subject.id == rubric.subject_id).first()
    return build_rubric_response(rubric, subject.name if subject else None, db)

@router.post("/{rubric_id}/duplicate", response_model=RubricResponse)
def duplicate_rubric(rubric_id: int, db: Session = Depends(get_db)):
    """
    Duplicate an existing rubric
    """
    original = db.query(Rubric).filter(Rubric.id == rubric_id).first()
    if not original:
        raise HTTPException(status_code=404, detail="Rubric not found")
    
    new_rubric = duplicate_rubric_logic(original, db)
    subject = db.query(Subject).filter(Subject.id == new_rubric.subject_id).first()
    
    return build_rubric_response(new_rubric, subject.name if subject else None, db)

@router.delete("/{rubric_id}")
def delete_rubric(rubric_id: int, db: Session = Depends(get_db)):
    """
    Delete a rubric
    """
    rubric = db.query(Rubric).filter(Rubric.id == rubric_id).first()
    if not rubric:
        raise HTTPException(status_code=404, detail="Rubric not found")
    
    db.delete(rubric)
    db.commit()
    
    return {"message": "Rubric deleted successfully", "id": rubric_id}

@router.put("/{rubric_id}", response_model=RubricResponse)
def update_rubric(rubric_id: int, rubric: RubricCreate, db: Session = Depends(get_db)):
    """
    Update an existing rubric
    """
    db_rubric = db.query(Rubric).filter(Rubric.id == rubric_id).first()
    if not db_rubric:
        raise HTTPException(status_code=404, detail="Rubric not found")
    
    # Validate LO distribution
    validation_error = validate_rubric(rubric.dict())
    if validation_error:
        raise HTTPException(status_code=400, detail=validation_error)
    
    # Calculate total marks
    total_marks = sum(
        qd.count * qd.marks_each for qd in rubric.question_distributions
    )
    
    # Update rubric fields
    db_rubric.name = rubric.name
    db_rubric.subject_id = rubric.subject_id
    db_rubric.exam_type = rubric.exam_type
    db_rubric.duration_minutes = rubric.duration_minutes
    db_rubric.total_marks = total_marks
    db_rubric.ai_instructions = rubric.ai_instructions
    
    # Delete old distributions
    db.query(RubricQuestionDistribution).filter(
        RubricQuestionDistribution.rubric_id == rubric_id
    ).delete()
    db.query(RubricLODistribution).filter(
        RubricLODistribution.rubric_id == rubric_id
    ).delete()
    
    # Add new distributions
    for qd in rubric.question_distributions:
        db_qd = RubricQuestionDistribution(
            rubric_id=rubric_id,
            question_type=qd.question_type,
            count=qd.count,
            marks_each=qd.marks_each
        )
        db.add(db_qd)
    
    for lo in rubric.lo_distributions:
        db_lo = RubricLODistribution(
            rubric_id=rubric_id,
            learning_outcome=lo.learning_outcome,
            percentage=lo.percentage
        )
        db.add(db_lo)
    
    db.commit()
    db.refresh(db_rubric)
    
    subject = db.query(Subject).filter(Subject.id == db_rubric.subject_id).first()
    return build_rubric_response(db_rubric, subject.name if subject else None, db)

def build_rubric_response(rubric: Rubric, subject_name: str | None, db: Session) -> dict:
    """Helper to build rubric response with distributions"""
    question_dists = db.query(RubricQuestionDistribution).filter(
        RubricQuestionDistribution.rubric_id == rubric.id
    ).all()
    
    lo_dists = db.query(RubricLODistribution).filter(
        RubricLODistribution.rubric_id == rubric.id
    ).all()
    
    return {
        "id": rubric.id,
        "name": rubric.name,
        "subject_id": rubric.subject_id,
        "subject_name": subject_name,
        "exam_type": rubric.exam_type,
        "duration_minutes": rubric.duration_minutes,
        "total_marks": rubric.total_marks,
        "ai_instructions": rubric.ai_instructions,
        "question_distributions": [
            {
                "question_type": qd.question_type,
                "count": qd.count,
                "marks_each": qd.marks_each
            }
            for qd in question_dists
        ],
        "lo_distributions": [
            {
                "learning_outcome": lo.learning_outcome,
                "percentage": lo.percentage
            }
            for lo in lo_dists
        ]
    }
