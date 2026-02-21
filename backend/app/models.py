from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, JSON
from sqlalchemy.orm import DeclarativeBase, relationship
from datetime import datetime

class Base(DeclarativeBase):
    pass

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True)
    name = Column(String(255))
    color = Column(String(50))
    gradient = Column(String(255))
    introduction = Column(String(1000))
    created_at = Column(DateTime, default=datetime.utcnow)

    topics = relationship("Topic", back_populates="subject", cascade="all, delete-orphan")

    @property
    def chapters(self):
        return len(self.topics)

    @property
    def questions(self):
        return sum(len(t.questions) for t in self.topics)

class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    name = Column(String(255))
    description = Column(String(1000), nullable=True)
    has_syllabus = Column(Boolean, default=False)
    has_textbook = Column(Boolean, default=False)
    textbook_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    subject = relationship("Subject", back_populates="topics")
    questions = relationship("Question", back_populates="topic", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"))
    rubric_id = Column(Integer, ForeignKey("rubrics.id"), nullable=True)
    question_text = Column(String(2000))
    question_type = Column(String(50))  # MCQ, Short, Essay
    options = Column(JSON, nullable=True)
    correct_answer = Column(String(1000))
    explanation = Column(String(2000), nullable=True)
    marks = Column(Integer)
    bloom_level = Column(String(50), nullable=True)
    course_outcome = Column(String(50), nullable=True)
    learning_outcome = Column(String(50), nullable=True)  # LO1, LO2, LO3, LO4, LO5
    course_outcomes = Column(JSON, nullable=True) # Granular levels {co1: 1, co2: 3...}
    status = Column(String(50), default="draft")  # draft, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow)

    topic = relationship("Topic", back_populates="questions")
    rubric = relationship("Rubric", back_populates="questions")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
    filename = Column(String(255))
    content = Column(String(5000))
    embedding_id = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    message = Column(String(1000))
    type = Column(String(50)) # success, info, warning, error
    unread = Column(Boolean, default=True)
    color = Column(String(50))
    icon_name = Column(String(50))
    link = Column(String(255), nullable=True) # e.g., "/vetting", "/subjects"
    timestamp = Column(DateTime, default=datetime.utcnow)

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    description = Column(String(1000))
    badge_icon = Column(String(50))
    unlocked = Column(Boolean, default=False)
    unlocked_at = Column(DateTime, nullable=True)

class UserStats(Base):
    __tablename__ = "user_stats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True) # Mock user ID for now
    username = Column(String(255), default="Professor Vinz") 
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    coins = Column(Integer, default=0)
    badges = Column(JSON, default=[])
    streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    total_days_active = Column(Integer, default=0)
    last_activity = Column(DateTime, nullable=True)

class ExamHistory(Base):
    __tablename__ = "exam_history"
    # ... (remaining lines)

    id = Column(Integer, primary_key=True, index=True)
    subject_name = Column(String(255))
    topic_name = Column(String(255))
    questions_count = Column(Integer)
    marks = Column(Integer)
    duration = Column(Integer)
    questions = Column(JSON) # JSON dump of the generated exam
    created_at = Column(DateTime, default=datetime.utcnow)

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    activity_type = Column(String(100))  # e.g., "question_generated", "exam_created", "question_vetted"
    description = Column(String(500))
    details = Column(JSON, nullable=True)  # Additional contextual data
    timestamp = Column(DateTime, default=datetime.utcnow)

# Rubric System Models
class Rubric(Base):
    __tablename__ = "rubrics"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    exam_type = Column(String(50))  # Final, Midterm, Quiz, Assignment
    duration_minutes = Column(Integer)
    total_marks = Column(Integer)
    ai_instructions = Column(String(2000), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    subject = relationship("Subject")
    question_distributions = relationship("RubricQuestionDistribution", back_populates="rubric", cascade="all, delete-orphan")
    lo_distributions = relationship("RubricLODistribution", back_populates="rubric", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="rubric")

class RubricQuestionDistribution(Base):
    __tablename__ = "rubric_question_distributions"
    
    id = Column(Integer, primary_key=True, index=True)
    rubric_id = Column(Integer, ForeignKey("rubrics.id"))
    question_type = Column(String(50))  # MCQ, Short, Essay
    count = Column(Integer)
    marks_each = Column(Integer)
    
    rubric = relationship("Rubric", back_populates="question_distributions")

class RubricLODistribution(Base):
    __tablename__ = "rubric_lo_distributions"
    
    id = Column(Integer, primary_key=True, index=True)
    rubric_id = Column(Integer, ForeignKey("rubrics.id"))
    learning_outcome = Column(String(10))  # LO1, LO2, LO3, LO4, LO5
    percentage = Column(Integer)  # 0-100
    
    rubric = relationship("Rubric", back_populates="lo_distributions")

class CourseOutcome(Base):
    __tablename__ = "course_outcomes"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(10), unique=True)  # CO1, CO2, CO3
    label = Column(String(255))
    bloom_level = Column(Integer)  # 1-6 (Remember, Understand, Apply, Analyze, Evaluate, Create)
    description = Column(String(1000), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
