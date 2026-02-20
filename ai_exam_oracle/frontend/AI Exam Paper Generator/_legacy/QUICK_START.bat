@echo off
title AI EXAM ORACLE - QUICK LAUNCHER
color 0B

echo.
echo ========================================
echo   AI EXAM ORACLE - QUICK START
echo ========================================
echo.

echo This will open 3 windows:
echo   1. Ollama (AI Service)
echo   2. Backend API (Port 8000)
echo   3. Frontend (Port 5173)
echo.
echo Plus your browser at: http://localhost:5173
echo.
pause

REM Check if Ollama is already running
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I /N "ollama.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] Ollama already running
) else (
    echo [STARTING] Ollama...
    start "OLLAMA" cmd /k "ollama serve"
    timeout /t 3 /nobreak >nul
)

REM Start Backend
echo [STARTING] Backend API...
start "BACKEND API" cmd /k "cd backend && .\venv\Scripts\Activate.ps1 && python -m uvicorn app.main:app --reload"
timeout /t 5 /nobreak >nul

REM Start Frontend
echo [STARTING] Frontend...
start "FRONTEND" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

REM Wait for services
echo.
echo [WAITING] Services starting...
timeout /t 10 /nobreak

REM Open browser
echo.
echo [OPENING] Browser...
start http://localhost:5173

echo.
echo ========================================
echo   READY! 
echo ========================================
echo.
echo App:  http://localhost:5173
echo API:  http://localhost:8000
echo Docs: http://localhost:8000/docs
echo.
echo Keep all terminal windows open!
echo.
echo ========================================
echo   TEST THE NEW FEATURES:
echo ========================================
echo.
echo 1. Navigate to any Subject
echo 2. Find a Topic
echo 3. Look for ORANGE UPLOAD BUTTON
echo 4. Click it - beautiful modal appears!
echo 5. Upload a PDF file
echo 6. Watch progress animation
echo.
echo See MANUAL_START_AND_TEST.md for full guide
echo.
pause
