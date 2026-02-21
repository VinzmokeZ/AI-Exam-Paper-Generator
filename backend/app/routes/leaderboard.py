from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import UserStats
from pydantic import BaseModel
from typing import List

router = APIRouter()

class LeaderboardEntry(BaseModel):
    user_id: int
    xp: int
    level: int
    coins: int
    streak: int

@router.get("/leaderboard", response_model=List[LeaderboardEntry])
def get_leaderboard(db: Session = Depends(get_db)):
    # Return top 10 players based on XP
    return db.query(UserStats).order_by(UserStats.xp.desc()).limit(10).all()

@router.get("/leaderboard/local")
def get_local_ranking(user_id: int = 1, db: Session = Depends(get_db)):
    # Mock local ranking for now
    return {"rank": 4, "total_players": 150, "percentile": "96%"}
