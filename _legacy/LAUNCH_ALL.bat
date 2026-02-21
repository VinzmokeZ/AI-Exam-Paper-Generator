@echo off
title AI Exam Oracle - Complete System Launch
color 0A

echo ==========================================
echo    AI EXAM ORACLE - UNIFIED LAUNCH
echo ==========================================
echo.
echo This script launches ALL components:
echo  [1] MySQL Database (XAMPP)
echo  [2] Ollama AI Engine
echo  [3] Python Backend (Port 8000)
echo  [4] React Frontend (Port 3000)
echo.
echo Keep ALL windows OPEN while using the app.
echo ==========================================
echo.

REM Kill any existing Node processes
echo [CLEANUP] Killing any existing Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Navigate to project directory
cd /d "%~dp0"

REM Step 1: Database & Auto-Repair
echo [1/4] Checking Database ^& Auto-Repairing...
echo.
python backend/smart_setup.py
if errorlevel 1 (
    echo [ERROR] Database setup failed!
    pause
    exit /b 1
)
echo.

REM Step 2: Start Ollama
echo [2/4] Starting AI Engine (Ollama)...
start "Ollama AI Engine" cmd /k "ollama serve"
timeout /t 3 /nobreak >nul
echo.

REM Step 3: Start Backend
echo [3/4] Starting Backend Server (Port 8000)...
start "AI Exam Oracle - Backend" cmd /k "cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
timeout /t 3 /nobreak >nul
echo.

REM Step 4: Start Frontend
echo [4/4] Starting Frontend Website (Port 3000)...
start "AI Exam Oracle - Frontend" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul
echo.

REM Open browser
echo All systems launched! Opening browser...
start http://localhost:3000

echo.
echo ==========================================
echo    LAUNCH COMPLETE!
echo ==========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo.
echo Keep ALL windows OPEN.
echo Press any key to exit this launcher...
pause >nul
