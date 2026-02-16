@echo off
title AI EXAM ORACLE - ULTIMATE LAUNCHER
color 0A

echo.
echo ========================================
echo   AI EXAM ORACLE - FULL SYSTEM START
echo ========================================
echo.

REM 1. Database Fix & Seed (Backend)
echo [SYSTEM] Checking Database Health...
cd backend
.\venv\Scripts\python fix_sqlite_schema.py
.\venv\Scripts\python seed_db.py
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Database setup failed.
    pause
    exit /b %ERRORLEVEL%
)
cd ..

REM 2. Start AI Service (Ollama)
echo [SYSTEM] Checking AI Service (Ollama)...
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I /N "ollama.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] Ollama already running
) else (
    echo [STARTING] Ollama...
    start "OLLAMA SERVICE" cmd /k "ollama serve"
    echo Waiting for Ollama to warm up...
    timeout /t 5 /nobreak >nul
)

REM 3. Start Backend API
echo [STARTING] Backend API (Port 8000)...
start "BACKEND SERVICE" cmd /k "cd backend && .\venv\Scripts\Activate.ps1 && python -m uvicorn app.main:app --reload"
timeout /t 5 /nobreak >nul

REM 4. Start Frontend Web App
echo [STARTING] Frontend UI (Port 5173)...
start "FRONTEND SERVICE" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

REM 5. Finalize
echo.
echo ========================================
echo   ALL SYSTEMS ONLINE!
echo ========================================
echo.
echo App:  http://localhost:5173
echo API:  http://localhost:8000
echo Docs: http://localhost:8000/docs
echo.
echo [OPENING] Browser...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo Keep all terminal windows open while using the app.
echo To stop, close the terminal windows.
echo.
echo Press any key to finish this script (services will keep running).
pause >nul
