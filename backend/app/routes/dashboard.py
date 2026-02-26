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
    
    # 2. Count Knowledge Contexts (formerly Subjects)
    from ..models import KnowledgeBase
    subject_count = db.query(KnowledgeBase).count()
    
    # 3. Counts by status
    pending_count = db.query(Question).filter(Question.status == "draft").count()
    approved_count = db.query(Question).filter(Question.status == "approved").count()
    rejected_count = db.query(Question).filter(Question.status == "rejected").count()
    total_q = db.query(Question).count()
    
    # 4. Activity this week (last 7 days)
    activity_week = []
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    today_idx = datetime.utcnow().weekday() 
    
    for i in range(7):
        target_date = datetime.utcnow().date() - timedelta(days=(today_idx - i) % 7)
        if (today_idx - i) % 7 > today_idx: 
             target_date = datetime.utcnow().date() - timedelta(days=(today_idx - i) % 7 + 7)
        
        count = db.query(Question).filter(func.date(Question.created_at) == target_date).count()
        activity_week.append({
            "day": days[i],
            "active": count > 0,
            "count": count
        })

    # 5. Today's Progress Logic (Goal: Vet/Approve 5 questions today)
    today = datetime.utcnow().date()
    vetted_today = db.query(Question).filter(
        Question.status == "approved", 
        func.date(Question.created_at) == today
    ).count()
    daily_goal = 5
    today_progress = int((vetted_today / daily_goal) * 100) if daily_goal > 0 else 0
    if today_progress > 100: today_progress = 100

    performance = int((approved_count / total_q * 100)) if total_q > 0 else 0

    # 6. Exams this week
    one_week_ago = datetime.utcnow() - timedelta(days=7)
    exams_this_week = db.query(ExamHistory).filter(ExamHistory.created_at >= one_week_ago).count()

    return {
        "username": user_stats.username,
        "xp": user_stats.xp,
        "level": user_stats.level,
        "streak": user_stats.streak,
        "longestStreak": user_stats.longest_streak,
        "totalDaysActive": user_stats.total_days_active,
        "coins": user_stats.coins,
        "subjectCount": subject_count,
        "pendingVetting": pending_count,
        "approvedQuestions": approved_count,
        "rejectedQuestions": rejected_count,
        "totalQuestions": total_q,
        "performance": performance, # Mapping this to Overall Performance
        "approvalRate": today_progress, # Mapping this to Today's Goal
        "examsThisWeek": exams_this_week,
        "activityWeek": activity_week
    }

@router.get("/reports")
def get_report_data(db: Session = Depends(get_db)):
    # Total counts
    total_q = db.query(Question).count()
    approved_q = db.query(Question).filter(Question.status == "approved").count()
    rejected_q = db.query(Question).filter(Question.status == "rejected").count()
    pending_q = db.query(Question).filter(Question.status == "draft").count()
    
    # Mapping for Bloom's Taxonomy (Backend -> Frontend Labels)
    BLOOM_MAP = {
        "Knowledge": ["Knowledge", "Remember"],
        "Comprehension": ["Comprehension", "Understand"],
        "Application": ["Application", "Apply"],
        "Analysis": ["Analysis", "Analyze"],
        "Synthesis": ["Synthesis", "Create"],
        "Evaluation": ["Evaluation", "Evaluate"]
    }

    # LO Distribution (Actual data from course_outcomes JSON)
    lo_counts = {"LO1": 0, "LO2": 0, "LO3": 0, "LO4": 0, "LO5": 0}
    questions = db.query(Question).all()
    for q in questions:
        if q.course_outcomes:
            for lo_key in lo_counts.keys():
                # Some questions use co1-co5, others LO1-LO5
                val = q.course_outcomes.get(lo_key) or q.course_outcomes.get(lo_key.lower().replace("lo", "co"), 0)
                if isinstance(val, (int, float)) and val > 0:
                    lo_counts[lo_key] += 1

    lo_stats = []
    target = 50 # Base target for balanced coverage
    total_lo_coverage_points = 0
    for lo, count in lo_counts.items():
        percent = int((count / target * 100)) if target > 0 else 0
        total_lo_coverage_points += min(percent, 100)
        lo_stats.append({
            "code": lo,
            "current": count,
            "target": target,
            "percent": percent
        })
    
    overall_lo_coverage = int(total_lo_coverage_points / 5)

    # Bloom's Distribution
    bloom_stats = []
    for display_label, backend_levels in BLOOM_MAP.items():
        count = db.query(Question).filter(Question.bloom_level.in_(backend_levels)).count()
        bloom_stats.append({
            "level": display_label,
            "count": count,
            "percent": int((count / total_q * 100)) if total_q > 0 else 0
        })

    # Topic (Syllabus) Coverage from ExamHistory
    syllabus_stats = []
    
    # Get total sum of questions across all history
    total_historical = db.query(func.sum(ExamHistory.questions_count)).scalar() or 0
    total_historical = int(total_historical)
    
    # Group by topic_name and sum the questions_count
    if total_historical > 0:
        topic_counts = db.query(
            ExamHistory.topic_name,
            func.sum(ExamHistory.questions_count).label('total_questions')
        ).group_by(ExamHistory.topic_name).order_by(func.sum(ExamHistory.questions_count).desc()).limit(6).all()
        
        colors = ["#50FA7B", "#8BE9FD", "#FFB86C", "#C5B3E6", "#FF6AC1", "#F1FA8C"]
        
        for idx, (topic_name, count) in enumerate(topic_counts):
            if not topic_name:
                continue
            
            count = int(count)
            percent = int((count / total_historical) * 100)
            
            syllabus_stats.append({
                "name": topic_name,
                "questions": count,
                "percentage": percent,
                "color": colors[idx % len(colors)]
            })

    return {
        "overview": {
            "generated": total_q,
            "approved": approved_q,
            "rejected": rejected_q,
            "pending": pending_q,
            "approvalRate": int((approved_q / total_q * 100)) if total_q > 0 else 0,
            "loCoverage": overall_lo_coverage
        },
        "learningOutcomes": lo_stats,
        "blooms": bloom_stats,
        "syllabus": syllabus_stats
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
