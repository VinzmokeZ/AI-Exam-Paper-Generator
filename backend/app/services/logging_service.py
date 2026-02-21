from sqlalchemy.orm import Session
from ..models import ActivityLog
import json
from datetime import datetime

class LoggingService:
    def log_activity(self, db: Session, action: str, details: dict = None, description: str = None, user_id: int = None):
        try:
            log_entry = ActivityLog(
                user_id=user_id,
                activity_type=action,
                description=description if description else action,
                details=details if details else {},
                timestamp=datetime.utcnow()
            )
            db.add(log_entry)
            db.commit()
            db.refresh(log_entry)
            return log_entry
        except Exception as e:
            print(f"Failed to log activity: {e}")
            return None

    def get_recent_logs(self, db: Session, limit: int = 50):
        return db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(limit).all()

logging_service = LoggingService()
