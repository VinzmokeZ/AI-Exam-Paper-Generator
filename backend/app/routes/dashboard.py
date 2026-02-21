from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import Subject, Question, UserStats, ActivityLog, ExamHistory
from ..services.gamification_service import gamification_service
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    # 1. Get User Stats (mocking user_id=1)
    user_stats = gamification_service.get_user_stats(db, 1)
    
    # 2. Count Subjects
    subject_count = db.query(Subject).count()
    
    # 3. Counts by status
    pending_count = db.query(Question).filter(Question.status == "draft").count()
    approved_count = db.query(Question).filter(Question.status == "approved").count()
    rejected_count = db.query(Question).filter(Question.status == "rejected").count()
    total_q = db.query(Question).count()
    
    # 4. Activity this week (last 7 days)
    activity_week = []
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    today_idx = datetime.utcnow().weekday() # 0 is Monday
    
    for i in range(7):
        target_date = datetime.utcnow().date() - timedelta(days=(today_idx - i) % 7)
        if (today_idx - i) % 7 > today_idx: # Date is from previous week
             target_date = datetime.utcnow().date() - timedelta(days=(today_idx - i) % 7 + 7)
        
        # Count questions created on this specific day
        count = db.query(Question).filter(func.date(Question.created_at) == target_date).count()
        activity_week.append({
            "day": days[i],
            "active": count > 0,
            "count": count
        })

    # 5. Overall Performance
    performance = int((approved_count / total_q * 100)) if total_q > 0 else 0

    return {
        "username": user_stats.username,
        "xp": user_stats.xp,
        "level": user_stats.level,
        "streak": 0,
        "longestStreak": 0,
        "totalDaysActive": 0,
        "coins": user_stats.coins,
        "subjectCount": subject_count,
        "pendingVetting": pending_count,
        "approvedQuestions": approved_count,
        "rejectedQuestions": rejected_count,
        "totalQuestions": total_q,
        "performance": performance,
        "approvalRate": performance,
        "activityWeek": activity_week
    }

@router.get("/reports")
def get_report_data(db: Session = Depends(get_db)):
    # Total counts
    total_q = db.query(Question).count()
    approved_q = db.query(Question).filter(Question.status == "approved").count()
    rejected_q = db.query(Question).filter(Question.status == "rejected").count()
    pending_q = db.query(Question).filter(Question.status == "draft").count()
    
    # LO Distribution (Mocked for dashboard since column removed)
    lo_stats = [
        {"code": "LO1", "current": 20, "target": 50, "percent": 40},
        {"code": "LO2", "current": 15, "target": 50, "percent": 30},
        {"code": "LO3", "current": 35, "target": 50, "percent": 70},
        {"code": "LO4", "current": 10, "target": 50, "percent": 20},
        {"code": "LO5", "current": 5, "target": 50, "percent": 10}
    ]
        
    # Bloom's Distribution (Mocked for dashboard since column removed)
    bloom_stats = [
        {"level": "Knowledge", "count": int(total_q * 0.1), "percent": 10},
        {"level": "Comprehension", "count": int(total_q * 0.2), "percent": 20},
        {"level": "Application", "count": int(total_q * 0.4), "percent": 40},
        {"level": "Analysis", "count": int(total_q * 0.15), "percent": 15},
        {"level": "Synthesis", "count": int(total_q * 0.1), "percent": 10},
        {"level": "Evaluation", "count": int(total_q * 0.05), "percent": 5}
    ]

    return {
        "overview": {
            "generated": total_q,
            "approved": approved_q,
            "rejected": rejected_q,
            "pending": pending_q,
            "approvalRate": int((approved_q / total_q * 100)) if total_q > 0 else 0
        },
        "learningOutcomes": lo_stats,
        "blooms": bloom_stats
    }

@router.get("/activity")
def get_recent_activity(db: Session = Depends(get_db)):
    logs = db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(5).all()
    
    # Map logs to a frontend-friendly format
    activities = []
    for log in logs:
        color = "#C5B3E6"
        if "generate" in log.activity_type.lower(): color = "#C5B3E6"
        elif "vet" in log.activity_type.lower(): color = "#8BE9FD"
        elif "subject" in log.activity_type.lower(): color = "#FFB86C"
        
        activities.append({
            "action": log.activity_type.replace("_", " ").title(),
            "subject": log.details.get("subject", "General") if log.details else "General", # Added safety check
            "time": log.timestamp.strftime("%H:%M ago"), # Simplified for now
            "color": color
        })
    
    return activities
