@echo off
setlocal enabledelayedexpansion
title AI Exam Oracle - Infinite Master Launcher

:: --- ADMIN ELEVATION ---
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Requesting Administrative Access...
    powershell -Command "Start-Process -FilePath '%0' -Verb RunAs"
    exit /b
)

pushd "%~dp0"

:setup_start
cls
color 0B
echo.
echo    ============================================================
echo             AI EXAM ORACLE - INFINITE SHIELD SYSTEM
echo    ============================================================
echo.

:: STEP 1: CLEANUP
echo [1/6] Cleaning up stale processes and port conflicts...
taskkill /F /IM node.exe /IM python.exe /IM uvicorn.exe /IM mysqld.exe /IM httpd.exe >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3306') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: STEP 2: DEPENDENCIES
echo [2/6] Verifying system libraries...
python -m pip install --upgrade pip >nul 2>&1
python -m pip install pymysql wikipedia-api datasets huggingface-hub sentence-transformers chromadb openai pypdf2 python-docx >nul 2>&1

:: STEP 3: ENVIRONMENT REPAIR
echo [3/6] Running System Diagnostics Helper (127.0.0.1 Mode)...
python smart_setup.py
if %ERRORLEVEL% neq 0 (
    echo.
    echo [WARNING] Standard startup failed.
    echo [AUTO-REPAIR] Initiating NUCLEAR REPAIR sequence automatically...
    echo ------------------------------------------------------------
    
    :: Run Nuclear Repair (Structural Reset)
    python smart_setup.py --nuclear
    
    echo [INFO] Repair applied. Retrying startup...
    timeout /t 3 >nul
    
    :: Retry Startup
    python smart_setup.py
    if !ERRORLEVEL! neq 0 (
        echo.
        echo [CRITICAL] Auto-repair failed to start MySQL.
        echo [INFO] Proceeding to launch attempt anyway (User requested force-start)...
    ) else (
        echo [SUCCESS] Auto-repair was successful!
    )
)

:: STEP 4: DATABASE SETUP
echo [4/6] Initializing Database (Drop/Create) and Seeding...
cd backend
python seed_db.py
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Seeding failed. Retrying in 3 seconds...
    timeout /t 3 >nul
    python seed_db.py
    if !ERRORLEVEL! neq 0 (
        echo [CRITICAL] Database setup keeps failing. Check for port blocks.
        pause
        goto setup_start
    )
)
cd ..

:: STEP 5: KNOWLEDGE SYNC
echo [5/6] Training AI Model with Global Pedagogy...
python sync_external_knowledge.py
python train_kb.py

:: STEP 6: ORCHESTRATED LAUNCH
echo [6/6] Launching all platforms...

:: --- OLLAMA PATH FIX ---
set "OLLAMA_PATH=C:\Users\Vinz\AppData\Local\Programs\Ollama"
if exist "!OLLAMA_PATH!\ollama.exe" (
    echo [INFO] Found Ollama at !OLLAMA_PATH!
    set "PATH=!PATH!;!OLLAMA_PATH!"
) else (
    echo [WARNING] Could not find Ollama at default location.
)

echo [INFO] Starting AI Engine...
start "AI Engine" /min cmd /c "ollama serve"

echo [INFO] Starting Backend API...
start "Backend API" /min cmd /k "cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000"

echo [INFO] Starting Frontend UI...
start "Frontend UI" /min cmd /k "npm run dev -- --host"

echo.
echo    ============================================================
echo    SYSTEMS COORDINATED SUCCESSFULLY
echo    ============================================================
echo.
echo Dashboard: http://localhost:5173
echo.
echo Opening browser in 10 seconds (waiting for backend)...
timeout /t 10 /nobreak >nul
start http://localhost:5173
echo [DONE] You can close this window now.
pause
