from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time
import threading
from dotenv import load_dotenv

# Load environment variables immediately
load_dotenv()

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
    from .database import init_db
    
    # 0. Initialize Database Tables (fast, keep synchronous)
    print("[DB] Initializing database...")
    try:
        init_db()
        print("[DB] ✅ Database ready.")
    except Exception as e:
        print(f"[DB] ⚠️ Database init failed (non-fatal): {e}")
        print("[DB] Server will start anyway. Check your MySQL connection.")
    
    # ALL other heavy operations go to background thread
    # This prevents asyncio.CancelledError from blocking HTTP requests
    def background_startup():
        import time as _time
        _time.sleep(1)  # Let server fully bind to port first
        
        try:
            from .services.health_service import health_service
            health_service.run_full_audit()
        except Exception as e:
            print(f"[HEALTH] Audit failed (non-fatal): {e}")
        
        try:
            from .services.llm_service import initialize_ollama, test_llm_connection
            print("[LLM] Initializing Ollama...")
            llm_status = test_llm_connection()
            print(f"[LLM] Status: {llm_status['message']}")
            if llm_status['ollama_running']:
                initialize_ollama()
        except Exception as e:
            print(f"[LLM] Init failed (non-fatal): {e}")
        
        try:
            _time.sleep(1)  # Extra buffer before RAG
            from .services.rag_service import get_rag_service
            print("[SERVER] Starting RAG Initialization in background...")
            service = get_rag_service()
            service.auto_index_kb()
        except Exception as e:
            print(f"[SERVER] ❌ RAG Initialization Failed in background: {e}")
            print("[SERVER] Background indexing will be skipped. Core API is still functional.")
    
    startup_thread = threading.Thread(target=background_startup)
    startup_thread.daemon = True
    startup_thread.start()
    print("[SERVER] ✅ Server ready! Background services initializing...")

@app.get("/api/health")
async def health_check():
    from .services.health_service import health_service
    from .services.llm_service import get_ollama_status, get_cloud_status
    
    llm_status = get_ollama_status()
    cloud_info = get_cloud_status()
    
    return {
        "database": "online" if health_service.check_database() else "offline",
        "ollama": "online" if llm_status['ollama_running'] else "offline",
        "cloud": "online" if cloud_info.get("cloud_available") else "offline",
        "cloud_provider": cloud_info.get("provider", "none"),
        "model_available": llm_status['model_available'],
        "is_pulling": llm_status.get('is_pulling', False),
        "message": llm_status['message'],
        "models": health_service.get_available_models(),
        "timestamp": time.time()
    }

@app.get("/")
async def root():
    return {"message": "Welcome to AI Exam Oracle API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
