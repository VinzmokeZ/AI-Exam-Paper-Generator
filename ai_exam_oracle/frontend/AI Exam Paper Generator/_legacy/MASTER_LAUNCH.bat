@echo off
title AI EXAM ORACLE - MASTER LAUNCH
color 0B

echo ============================================================
echo      AI EXAM ORACLE - STABLE UNIFIED LAUNCHER
echo ============================================================
echo.

REM --- 1. ENVIRONMENT CHECK ---
echo [1/8] Verifying Python ^& Node environment...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please install Python.
    pause
    exit /b 1
)

node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Please install Node.js.
    pause
    exit /b 1
)
echo SUCCESS: Dependencies verified.
echo.

REM --- 2. CLEANUP ---
echo [2/8] Cleaning up existing processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo.

REM --- 3. SYNC CODE ^& BUILD ---
echo [3/8] Syncing with latest code (Building)...
call npm run package-build
if errorlevel 1 (
    echo [ERROR] Build failed. Check your JS/TS code for errors.
    pause
    exit /b 1
)
echo SUCCESS: Build synchronized in PRODUCTION_PACKAGE.
echo.

REM --- 4. KNOWLEDGE SYNC ---
echo [4/8] Updating AI Knowledge Base (HuggingFace/Wiki)...
python sync_external_knowledge.py
if errorlevel 1 (
    echo [WARNING] Knowledge sync had issues. Continuing with old data.
)
echo SUCCESS: Knowledge sync complete.
echo.

REM --- 5. DATABASE SETUP ---
echo [5/8] Checking Database ^& Auto-Repairing...
set SETUP_PATH=smart_setup.py
if not exist "%SETUP_PATH%" set SETUP_PATH=backend\smart_setup.py

if exist "%SETUP_PATH%" (
    python "%SETUP_PATH%"
) else (
    echo [WARNING] smart_setup.py not found. Skipping.
)

if errorlevel 1 (
    echo [ERROR] Database setup failed. Make sure MySQL is running.
    pause
    exit /b 1
)
echo SUCCESS: Database ready.
echo.

REM --- 6. OLLAMA ENGINE ---
echo [6/8] Checking AI Engine (Ollama)...
netstat -ano | findstr :11434 >nul
if errorlevel 1 (
    echo [INFO] Starting Ollama AI Engine...
    start "Ollama AI Engine" cmd /k "ollama serve"
    timeout /t 5 /nobreak >nul
) else (
    echo [INFO] Ollama already running.
)
echo SUCCESS: AI Engine active.
echo.

REM --- 7. BACKEND ^& FRONTEND ---
echo [7/8] Launching API ^& Frontend Servers...
if exist backend (
    start "AI Exam Oracle - Backend" cmd /k "cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
) else (
    echo [ERROR] Backend folder missing.
    pause
    exit /b 1
)

start "AI Exam Oracle - Frontend" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul
echo SUCCESS: Servers started.
echo.

REM --- 8. BROWSER ---
echo [8/8] Opening Application...
start http://localhost:3000

echo ============================================================
echo      SYSTEM READY! Access at http://localhost:3000
echo ============================================================
echo.
echo NOTE: Keep all opened terminal windows active.
echo Press any key to close this primary launcher...
pause >nul
