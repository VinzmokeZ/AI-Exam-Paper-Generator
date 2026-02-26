from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import KnowledgeBase, KnowledgeChunk
from ..services.rag_service import get_rag_service
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class KnowledgeBaseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    source_url: str
    source_type: str = "drive" # "drive", "upload"
    color: Optional[str] = "#C5B3E6"
    gradient: Optional[str] = "from-[#C5B3E6] to-[#9B86C5]"

class KnowledgeBaseResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    source_url: Optional[str]
    source_type: str
    is_processed: bool
    status: str = "pending"
    error_message: Optional[str] = None
    color: Optional[str]
    gradient: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("/process-link", response_model=KnowledgeBaseResponse)
async def process_link(
    kb_data: KnowledgeBaseCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # 1. Create entry in DB
    db_kb = KnowledgeBase(
        title=kb_data.title,
        description=kb_data.description,
        source_url=kb_data.source_url,
        source_type=kb_data.source_type,
        color=kb_data.color,
        gradient=kb_data.gradient,
        is_processed=False
    )
    db.add(db_kb)
    db.commit()
    db.refresh(db_kb)

    # 2. Trigger background processing
    background_tasks.add_task(process_kb_background, db_kb.id)

    return db_kb

@router.get("/documents", response_model=List[KnowledgeBaseResponse])
async def get_documents(db: Session = Depends(get_db)):
    return db.query(KnowledgeBase).all()

@router.delete("/documents/{kb_id}")
async def delete_document(kb_id: int, db: Session = Depends(get_db)):
    db_kb = db.query(KnowledgeBase).filter(KnowledgeBase.id == kb_id).first()
    if not db_kb:
        raise HTTPException(status_code=404, detail="Document not found")
    
    db.delete(db_kb)
    db.commit()
    return {"message": "Document deleted successfully"}

@router.put("/documents/{kb_id}", response_model=KnowledgeBaseResponse)
async def update_document(
    kb_id: int,
    kb_data: KnowledgeBaseCreate,
    db: Session = Depends(get_db)
):
    db_kb = db.query(KnowledgeBase).filter(KnowledgeBase.id == kb_id).first()
    if not db_kb:
        raise HTTPException(status_code=404, detail="Document not found")
    
    db_kb.title = kb_data.title
    db_kb.source_url = kb_data.source_url
    db_kb.color = kb_data.color
    db_kb.gradient = kb_data.gradient
    
    db.commit()
    db.refresh(db_kb)
    return db_kb

async def process_kb_background(kb_id: int):
    """Background task to download, chunk, and embed."""
    # This will be implemented in rag_service later
    # For now, it's a bridge to the service
    from ..database import SessionLocal
    from ..services.rag_service import get_rag_service
    
    db = SessionLocal()
    try:
        service = get_rag_service()
        kb = db.query(KnowledgeBase).filter(KnowledgeBase.id == kb_id).first()
        if kb:
            print(f"[RAG] Starting background processing for KB: {kb.title}")
            await service.process_knowledge_base(kb, db)
            kb.is_processed = True
            db.commit()
            print(f"[RAG] Successfully processed KB: {kb.title}")
    except Exception as e:
        print(f"[RAG] Error processing KB {kb_id}: {e}")
    finally:
        db.close()
