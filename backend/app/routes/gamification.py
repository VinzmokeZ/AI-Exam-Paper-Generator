from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.gamification_service import gamification_service
from pydantic import BaseModel

router = APIRouter()

class ItemUpdate(BaseModel):
    user_id: int
    amount: int

class BadgeUpdate(BaseModel):
    user_id: int
    badge: str

@router.get("/{user_id}")
def get_stats(user_id: int, db: Session = Depends(get_db)):
    return gamification_service.get_user_stats(db, user_id)

@router.post("/xp")
def add_xp(update: ItemUpdate, db: Session = Depends(get_db)):
    return gamification_service.add_xp(db, update.user_id, update.amount)

@router.post("/coins")
def add_coins(update: ItemUpdate, db: Session = Depends(get_db)):
    return gamification_service.add_coins(db, update.user_id, update.amount)

@router.post("/badge")
def add_badge(update: BadgeUpdate, db: Session = Depends(get_db)):
    return gamification_service.add_badge(db, update.user_id, update.badge)

class ProfileUpdate(BaseModel):
    user_id: int
    username: str

@router.put("/profile")
def update_profile(update: ProfileUpdate, db: Session = Depends(get_db)):
    return gamification_service.update_profile(db, update.user_id, update.username)
