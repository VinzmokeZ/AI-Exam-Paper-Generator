from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time
from .routes import (
    subjects, topics, generate, training, logging, gamification, 
    questions, history, leaderboard, dashboard, notifications, 
    achievements, rubrics, course_outcomes
)

app = FastAPI(title="AI Exam Oracle API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(subjects.router, prefix="/api/subjects", tags=["Subjects"])
app.include_router(topics.router, prefix="/api", tags=["Topics"])
app.include_router(generate.router, prefix="/api/generate", tags=["Generation"])
app.include_router(training.router, prefix="/api/training", tags=["Training"])
app.include_router(logging.router, prefix="/api/logs", tags=["Logging"])
app.include_router(gamification.router, prefix="/api/gamification", tags=["Gamification"])
app.include_router(questions.router, prefix="/api/questions", tags=["Vetting"])
app.include_router(history.router, prefix="/api", tags=["History"])
app.include_router(leaderboard.router, prefix="/api", tags=["Leaderboard"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(achievements.router, prefix="/api/achievements", tags=["Achievements"])
app.include_router(rubrics.router, tags=["Rubrics"])
app.include_router(course_outcomes.router, tags=["Course Outcomes"])

@app.on_event("startup")
def startup_event():
    print("[SERVER] App starting up...")
    from .services.rag_service import rag_service
    from .services.health_service import health_service
    from .services.llm_service import initialize_ollama, test_llm_connection
    from .database import init_db
    
    # 0. Initialize Database Tables
    print("[DB] Initializing database...")
    init_db()
    
    # 1. System Audit
    health_service.run_full_audit()
    
    # 2. Knowledge Indexing
    rag_service.auto_index_kb()
    
    # 3. Initialize LLM
    print("[LLM] Initializing Ollama...")
    llm_status = test_llm_connection()
    print(f"[LLM] Status: {llm_status['message']}")
    if llm_status['ollama_running']:
        # Attempt to initialize (will pull model if needed)
        initialize_ollama()

@app.get("/api/health")
async def health_check():
    from .services.health_service import health_service
    return {
        "database": "online" if health_service.check_database() else "offline",
        "ollama": "online" if health_service.check_ollama() else "offline",
        "models": health_service.get_available_models(),
        "timestamp": time.time()
    }

@app.get("/")
async def root():
    return {"message": "Welcome to AI Exam Oracle API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
