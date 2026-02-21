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
    try:
        # 1. Generate via Unified AI Service (handles Local/Cloud/Fallback automatically)
        generated_data = generation_service.generate_questions(
            request.subject_name,
            request.topic_name,
            request.blooms_level,
            request.count,
            request.subject_id,
            request.rubric,
            request.engine
        )

        # 2. Resolve Subject & Topic for DB Association
        # Try to find subject by ID or Code
        subject = None
        if request.subject_id and str(request.subject_id).isdigit():
             subject = db.query(Subject).filter(Subject.id == int(request.subject_id)).first()
        elif request.subject_id:
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
                # Ensure we have a valid bloom_level
                b_level = q_data.get('bloom_level', request.blooms_level)
                if isinstance(b_level, dict): b_level = "Mixed"
                
                new_q = Question(
                    topic_id=topic.id,
                    question_text=q_data.get('question_text') or q_data.get('question', ''),
                    question_type=q_data.get('question_type') or q_data.get('type') or 'MCQ',
                    options=q_data.get('options', []),
                    correct_answer=str(q_data.get('correct_answer', '')), # Ensure string
                    explanation=q_data.get('explanation', ''),
                    marks=q_data.get('marks', 5),
                    bloom_level=str(b_level),
                    course_outcome=str(q_data.get('course_outcome', 'CO1')),
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
                subject_name=subject.name,
                topic_name=request.topic_name,
                questions_count=len(stored_questions),
                marks=sum(q.marks for q in stored_questions),
                duration=60, # Default
                questions=[q.question_text for q in stored_questions] # Store just text or full dict? Model says JSON.
            )
            db.add(new_history)
            
            from ..services.logging_service import logging_service
            logging_service.log_activity(db, "Exam Generated", details={"subject": subject.name, "count": len(stored_questions)})
            
            db.commit()

        return generated_data

    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        print(f"Server Error: {error_msg}")
        # Return error as response for debugging (in prod setup this is bad, but fine for local debugging)
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=500, content={"error": "Internal Server Error", "traceback": error_msg})


@router.post("/rubric/{rubric_id}")
def generate_from_rubric(rubric_id: int, engine: str = "local", db: Session = Depends(get_db)):
    """
    Generate exam questions based on a saved rubric
    Applies all rubric constraints including question types and LO distribution
    """
    from ..services.generation_service import generation_service
    
    try:
        result = generation_service.generate_from_rubric(rubric_id, db, engine=engine)
        
        return {
            "success": result["success"],
            "questions_generated": result["questions_generated"],
            "questions": result.get("questions", []),  # Ensure questions are passed to frontend
            "log":  result["log"],
            "message": f"Successfully generated {result['questions_generated']} questions"
        }
    except ValueError as e:
        return {"success": False, "error": str(e)}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"success": False, "error": f"Generation failed: {str(e)}"}

from fastapi import UploadFile, File, Form
import shutil
import os

@router.post("/from-file")
async def generate_from_file(
    file: UploadFile = File(...),
    count: int = Form(5),
    complexity: str = Form("Balanced"),
    engine: str = Form("local"),
    db: Session = Depends(get_db)
):
    """
    Generate questions directly from an uploaded file context
    """
    try:
        # Save file temporarily
        os.makedirs("temp", exist_ok=True)
        file_path = f"temp/adhoc_{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Extract text
        text = ""
        _, ext = os.path.splitext(file_path)
        if ext.lower() == '.pdf':
            from PyPDF2 import PdfReader
            reader = PdfReader(file_path)
            for page in reader.pages:
                text += page.extract_text() or ""
        elif ext.lower() == '.docx':
            from docx import Document
            doc = Document(file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
        else:
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
        
        # Cleanup temp file
        os.remove(file_path)
        
        if not text.strip():
            return {"error": "Could not extract text from file"}

        # Use Unified Generation Service
        generated_data = generation_service.generate_questions_from_text(
            context_text=text[:15000],  # Increased context limit
            subject_name="Uploaded Content",
            topic_name=f"Analysis: {file.filename}",
            count=count,
            complexity=complexity,
            engine=engine
        )
        
        # --- SAVE TO DATABASE ---
        # 1. Get/Create "Uploaded Content" Subject
        subject_name = "Uploaded Content"
        subject = db.query(Subject).filter(Subject.name == subject_name).first()
        if not subject:
            subject = Subject(
                name=subject_name, 
                code="FILE", 
                color="#50FA7B", 
                gradient="from-[#50FA7B] to-[#0A1F1F]",
                introduction="Content generated from uploaded files"
            )
            db.add(subject)
            db.commit()
            db.refresh(subject)
            
        # 2. Create Topic for this file
        topic_name = f"File: {file.filename}"
        topic = db.query(Topic).filter(Topic.subject_id == subject.id, Topic.name == topic_name).first()
        if not topic:
            topic = Topic(subject_id=subject.id, name=topic_name, has_syllabus=False)
            db.add(topic)
            db.commit()
            db.refresh(topic)
            
        # 3. Save Questions
        stored_questions = []
        for q_data in generated_data:
            # Ensure proper casting
            b_level = q_data.get('bloom_level', complexity)
            if isinstance(b_level, dict): b_level = "Mixed"
            
            new_q = Question(
                topic_id=topic.id,
                question_text=q_data.get('question_text') or q_data.get('question', ''),
                question_type=q_data.get('question_type') or q_data.get('type') or 'MCQ',
                options=q_data.get('options', []),
                correct_answer=str(q_data.get('correct_answer', '')),
                explanation=q_data.get('explanation', ''),
                marks=q_data.get('marks', 5),
                bloom_level=str(b_level),
                course_outcome=str(q_data.get('course_outcome', 'CO1')),
                status="draft"
            )
            db.add(new_q)
            stored_questions.append(new_q)
        
        db.commit()
        
        # 4. Attach IDs to return data
        for i, q in enumerate(stored_questions):
            db.refresh(q)
            generated_data[i]['id'] = q.id
            
        # 5. Log History
        from ..models import ExamHistory
        new_history = ExamHistory(
            subject_id=subject.id,
            exam_type="File Analysis",
            question_count=len(stored_questions),
            duration_minutes=60,
        )
        db.add(new_history)
        db.commit()

        return generated_data

    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        print(f"File Generation Error: {error_msg}")
        # Return DB-saved questions if we have them, even if logging failed? 
        # For now, standard error response
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=500, content={"error": str(e), "trace": error_msg})
