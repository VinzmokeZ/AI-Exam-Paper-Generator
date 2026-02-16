from fastapi import APIRouter, Depends
from ..services.generation_service import generation_service
from pydantic import BaseModel
from typing import List

router = APIRouter()

class GenerateRequest(BaseModel):
    subject_name: str
    topic_name: str
    blooms_level: str
    subject_id: str = None
    count: int = 5
    rubric: dict = None
    engine: str = "local"

from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Question, Topic, Subject

@router.post("/questions")
def generate_questions(request: GenerateRequest, db: Session = Depends(get_db)):
    # 1. Generate via AI Service
    generated_data = generation_service.generate_questions(
        request.subject_name,
        request.topic_name,
        request.blooms_level,
        request.subject_id,
        request.count,
        request.rubric,
        request.engine
    )

    # 2. Resolve Subject & Topic for DB Association
    # Try to find subject by ID or Code
    subject = None
    if request.subject_id:
        if request.subject_id.isdigit():
             subject = db.query(Subject).filter(Subject.id == int(request.subject_id)).first()
        else:
             subject = db.query(Subject).filter(Subject.code == request.subject_id).first()
    
    if not subject:
        # Fallback: Find by name or create default? 
        # For now, let's try to find by name strictly
        subject = db.query(Subject).filter(Subject.name == request.subject_name).first()
    
    if subject:
        # Resolve Topic
        topic = db.query(Topic).filter(Topic.subject_id == subject.id, Topic.name == request.topic_name).first()
        if not topic:
            # Create Topic if it doesn't exist (e.g. "General Topic")
            topic = Topic(subject_id=subject.id, name=request.topic_name, has_syllabus=False)
            db.add(topic)
            db.commit()
            db.refresh(topic)
            
        # 3. Save Questions to DB
        stored_questions = []
        for q_data in generated_data:
            new_q = Question(
                topic_id=topic.id,
                question_text=q_data.get('question_text') or q_data.get('question', ''),
                question_type=q_data.get('question_type') or q_data.get('type') or 'MCQ',
                options=q_data.get('options', []),
                correct_answer=q_data.get('correct_answer', ''),
                explanation=q_data.get('explanation', ''),
                marks=q_data.get('marks', 5),
                bloom_level=q_data.get('bloom_level', request.blooms_level),
                course_outcome=q_data.get('course_outcome', 'CO1'),
                status="draft"
            )
            db.add(new_q)
            stored_questions.append(new_q)
        
        db.commit()
        
        # Return the stored objects (with IDs) converted to dicts/schema if needed
        # Or just return the generated data with IDs appended?
        for i, q in enumerate(stored_questions):
            db.refresh(q)
            generated_data[i]['id'] = q.id
        
        # 4. Log to Exam History and Activity
        from ..models import ExamHistory
        new_history = ExamHistory(
            subject_id=subject.id,
            exam_type="AI Generated",
            question_count=len(stored_questions),
            duration_minutes=60, # Default
        )
        db.add(new_history)
        
        from ..services.logging_service import logging_service
        logging_service.log_activity(db, "Exam Generated", details={"subject": subject.name, "count": len(stored_questions)})
        
        db.commit()

    return generated_data

@router.post("/rubric/{rubric_id}")
def generate_from_rubric(rubric_id: int, db: Session = Depends(get_db)):
    """
    Generate exam questions based on a saved rubric
    Applies all rubric constraints including question types and LO distribution
    """
    from ..services.generation_service import generation_service
    
    try:
        result = generation_service.generate_from_rubric(rubric_id, db)
        
        return {
            "success": result["success"],
            "questions_generated": result["questions_generated"],
            "log":  result["log"],
            "message": f"Successfully generated {result['questions_generated']} questions"
        }
    except ValueError as e:
        return {"success": False, "error": str(e)}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"success": False, "error": f"Generation failed: {str(e)}"}
