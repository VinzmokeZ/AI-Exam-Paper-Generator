from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Notification
from pydantic import BaseModel
from typing import List

router = APIRouter()

class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    type: str
    unread: bool
    color: str
    icon_name: str
    link: str | None
    timestamp: str

    class Config:
        orm_mode = True

@router.get("/", response_model=List[NotificationOut])
def get_notifications(db: Session = Depends(get_db)):
    # In a real app, filter by current user. For now, get all.
    return db.query(Notification).order_by(Notification.timestamp.desc()).limit(20).all()

@router.put("/{id}/read")
def mark_as_read(id: int, db: Session = Depends(get_db)):
    note = db.query(Notification).filter(Notification.id == id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Notification not found")
    note.unread = False
    db.commit()
    return {"status": "success"}

@router.put("/read-all")
def mark_all_read(db: Session = Depends(get_db)):
    db.query(Notification).update({Notification.unread: False})
    db.commit()
    return {"status": "success"}
