@echo off
setlocal
title AI EXAM ORACLE - ANDROID BRIDGE
echo ============================================================
echo  AI EXAM ORACLE - ANDROID MOBILE BRIDGE v3.0
echo ============================================================
echo  This will start the AI Backend + Tunnel for your APK
echo ============================================================

:: ── STEP 1: NUCLEAR PORT CLEAR ──────────────────────────────
echo [1/4] Clearing Port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000 "') do (
    taskkill /F /PID %%a >nul 2>&1
)
:: Also kill any leftover python/uvicorn processes
taskkill /F /IM uvicorn.exe /T >nul 2>&1
ping -n 2 127.0.0.1 >nul

echo [1/4] Port 8000 is clear.

:: ── STEP 2: START BACKEND ────────────────────────────────────
echo [2/4] Starting AI Engine (Backend)...
if not exist "backend\venv\Scripts\activate.bat" (
    echo [ERROR] Virtual environment not found at backend\venv!
    echo [FIX]   Run: cd backend ^&^& python -m venv venv ^&^& venv\Scripts\activate ^&^& pip install -r requirements.txt
    pause
    exit /b 1
)

start "AI-ENGINE" cmd /k "title AI-ENGINE ^&^& cd /d "%~dp0backend" ^&^& venv\Scripts\activate ^&^& python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

:: Wait for backend to bind to port (up to 30 seconds)
echo [2/4] Waiting for backend to start...
set /a tries=0
:wait_loop
    ping -n 2 127.0.0.1 >nul
    netstat -aon | findstr ":8000 " >nul
    if %ERRORLEVEL% EQU 0 goto backend_ready
    set /a tries+=1
    if %tries% GEQ 15 (
        echo [ERROR] Backend did not start after 30 seconds!
        echo [FIX]   Check the AI-ENGINE window for error messages.
        pause
        exit /b 1
    )
    goto wait_loop

:backend_ready
echo [2/4] AI Engine is ONLINE on Port 8000!

:: ── STEP 3: START TUNNEL ─────────────────────────────────────
echo [3/4] Opening Cloud Tunnel for Android APK...
echo [INFO] Your APK will connect via: https://ai-exam-vinz.loca.lt
start "AI-TUNNEL" cmd /k "title AI-TUNNEL ^&^& npx lt --port 8000 --subdomain ai-exam-vinz"

:: ── STEP 4: OPEN ANDROID STUDIO ──────────────────────────────
echo [4/4] Opening Android Studio...
call npx cap open android >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Could not auto-open Android Studio.
    echo [INFO] Open Android Studio manually and press Play.
)

:: ── DONE ─────────────────────────────────────────────────────
echo.
echo ============================================================
echo  ALL SYSTEMS ONLINE!
echo ============================================================
echo  Backend:  http://localhost:8000
echo  Tunnel:   https://ai-exam-vinz.loca.lt
echo.
echo  In Android Studio (Medium Phone Emulator):
echo    1. Press the GREEN PLAY button to run the APK
echo    2. The app will auto-connect to your AI engine
echo    3. Look for the CYAN status light = Connected!
echo ============================================================
echo  Keep this window and the AI-ENGINE window OPEN.
echo ============================================================
pause
