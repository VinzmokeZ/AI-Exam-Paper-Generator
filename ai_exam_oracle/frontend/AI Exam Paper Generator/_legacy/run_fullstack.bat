@echo off
title AI Exam Oracle - Linear Launcher
echo ============================================================
echo AI Exam Oracle - Launch Sequence (Fast & Robust)
echo ============================================================

:: 1. Cleanup
echo [1/6] Cleaning up ports...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM uvicorn.exe >nul 2>&1
taskkill /F /IM ollama_app_v2.exe >nul 2>&1

:: 2. Start Ollama
echo [2/6] Starting AI Engine...
start "AI Service" /min cmd /c "ollama serve"
echo Waiting 5 seconds for AI to wake up...
timeout /t 5 /nobreak >nul

:: 3. Prepare Models (Unconditional to avoid crashes)
echo [3/6] Ensuring AI Model is ready...
echo (If model exists, this will be instant. If not, it will download.)
call ollama pull phi3:mini
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Could not pull model. Is Ollama running?
    echo Attempting to proceed anyway...
)

echo [4/6] Creating Custom Personality...
call ollama create ai-exam-oracle -f backend/Modelfile

:: 4. Start Backend
echo [5/6] Starting Backend...
start "Backend API" cmd /k "cd backend && python seed_db.py && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

:: 5. Start Frontend
echo [6/6] Starting Frontend...
echo Waiting 5 seconds for backend...
timeout /t 5 /nobreak >nul
start "Frontend UI" cmd /k "npm run dev -- --host"

:: 6. Launch Browser
echo.
echo [SUCCESS] Launch initiated!
echo ------------------------------------------------------------
echo Local:   http://localhost:5173
echo Network: http://(your-ip-address):5173
echo ------------------------------------------------------------
echo Opening browser in 3 seconds...
timeout /t 3 >nul
start http://localhost:5173

echo.
echo Script finished. Window will stay open for diagnostics.
pause
