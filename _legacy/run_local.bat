@echo off
echo ============================================================
echo 🚀 AI Exam Oracle - Launching Application
echo ============================================================

:: Start Backend
echo [INFO] Starting FastAPI Backend on http://localhost:8000
start /b cmd /c "cd backend && uvicorn app.main:app --reload --port 8000"

:: Start Frontend
echo [INFO] Starting React Frontend on http://localhost:3000
start /b cmd /c "npm run dev"

:: Open Browser
echo [INFO] Opening browser...
timeout /t 5 /nobreak
explorer "http://localhost:3000"

echo [INFO] Application is running!
echo Press Ctrl+C in the terminal to stop.
pause
