from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Achievement
from pydantic import BaseModel
from typing import List

router = APIRouter()

class AchievementOut(BaseModel):
    id: int
    name: str
    description: str
    badge_icon: str
    unlocked: bool
    unlocked_at: str | None

    class Config:
        orm_mode = True

@router.get("/", response_model=List[AchievementOut])
def get_achievements(db: Session = Depends(get_db)):
    return db.query(Achievement).all()
