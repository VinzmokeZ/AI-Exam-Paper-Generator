from sqlalchemy.orm import Session
from ..models import UserStats
from datetime import datetime, timedelta

class GamificationService:
    def get_user_stats(self, db: Session, user_id: int):
        stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
        if not stats:
            stats = UserStats(user_id=user_id, username="Professor Vinz", xp=0, level=1)
            db.add(stats)
            db.commit()
            db.refresh(stats)
        return stats

    def add_xp(self, db: Session, user_id: int, amount: int):
        stats = self.get_user_stats(db, user_id)
        stats.xp += amount
        
        # Level up logic (Simple: Level * 1000 XP)
        next_level_xp = stats.level * 1000
        if stats.xp >= next_level_xp:
            stats.level += 1
        # Removed streak logic to match reverted schema
        
        db.commit()
        db.refresh(stats)
        return stats

    def add_coins(self, db: Session, user_id: int, amount: int):
        stats = self.get_user_stats(db, user_id)
        stats.coins += amount
        db.commit()
        db.refresh(stats)
        return stats

    def add_badge(self, db: Session, user_id: int, badge: str):
        stats = self.get_user_stats(db, user_id)
        if not stats.badges:
            stats.badges = []
        if badge not in stats.badges:
            stats.badges.append(badge)
            db.commit()
            db.refresh(stats)
        return stats

    def update_profile(self, db: Session, user_id: int, username: str):
        stats = self.get_user_stats(db, user_id)
        stats.username = username
        db.commit()
        db.refresh(stats)
        return stats

gamification_service = GamificationService()
