from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.logging_service import logging_service
from pydantic import BaseModel
from typing import Dict, Any, List
from datetime import datetime

router = APIRouter()

class LogCreate(BaseModel):
    activity_type: str
    details: Dict[str, Any] = {}

class LogResponse(BaseModel):
    id: int
    activity_type: str
    description: str = None
    details: Any
    timestamp: datetime
    class Config:
        from_attributes = True

@router.post("/", response_model=LogResponse)
def create_log(log: LogCreate, db: Session = Depends(get_db)):
    return logging_service.log_activity(db, log.activity_type, log.details)

@router.get("/monitor", response_model=List[LogResponse])
def get_recent_logs(limit: int = 50, db: Session = Depends(get_db)):
    return logging_service.get_recent_logs(db, limit)
