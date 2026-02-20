@echo off
setlocal
title AI EXAM ORACLE - ROAMING BRIDGE
color 0B
echo.
echo ============================================================
echo   AI EXAM ORACLE - UNIVERSAL ROAMING BRIDGE v1.0
echo ============================================================
echo   This script starts your AI Engine and puts it on the 
echo   Global Internet so your APK works ANYWHERE.
echo ============================================================
echo.

:: ── STEP 1: PORT CLEAR ──────────────────────────────────────
echo [1/3] Clearing Port 8000 (Cleanup)...
:: Kill uvicorn specifically first
taskkill /F /IM uvicorn.exe /T >nul 2>&1
:: Then kill whatever is on port 8000
for /f "tokens=5" %%i in ('netstat -aon 2^>nul ^| findstr ":8000 "') do (
    echo [OK] Found PID %%i on 8000. Terminating...
    taskkill /F /PID %%i >nul 2>&1
)
timeout /t 1 >nul
echo [OK] Port 8000 is ready.

:: ── STEP 2: START BACKEND ────────────────────────────────────
echo [2/3] Starting AI Engine (Backend)...
if not exist "backend\venv\Scripts\activate.bat" (
    echo [ERROR] Virtual environment not found at backend\venv!
    pause
    exit /b 1
)

:: Start backend in a NEW window
:: Using /D to set the working directory avoiding nested quote issues with 'cd'
start "AI-ENGINE" /D "%~dp0backend" cmd /k "title AI-ENGINE & call venv\Scripts\activate & python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

:: Wait for backend to bind (max 30s)
set /a tries=0
:wait_loop
    timeout /t 2 >nul
    netstat -aon | findstr ":8000 " >nul
    if %ERRORLEVEL% EQU 0 goto backend_ready
    set /a tries+=1
    if %tries% GEQ 15 (
        echo [ERROR] Backend failed to start on Port 8000.
        echo [FIX]   Check the "AI-ENGINE" window for errors.
        echo [FIX]   If the window is missing, try running START_BACKEND_NOW.bat first.
        pause
        exit /b 1
    )
    goto wait_loop

:backend_ready
echo [OK] AI Engine is ONLINE.

:: ── STEP 3: START GLOBAL TUNNEL ──────────────────────────────
echo [3/3] Opening Global Internet Tunnel...
echo [INFO] Your Tunnel Domain: https://ai-exam-vinz.loca.lt
echo [INFO] IMPORTANT: If asked for an IP, use your Public IP (from whatsmyip.com).
echo.

:: ADB Reverse for Physical Devices (USB Fallback)
where adb >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    adb reverse tcp:8000 tcp:8000
    echo [OK] USB Link Active (for direct cable connection^).
)

:: Start Tunnel in a NEW window
start "AI-TUNNEL" cmd /k "title AI-TUNNEL ^&^& npx lt --port 8000 --subdomain ai-exam-vinz"

echo.
echo ============================================================
echo   ROAMING READY! 🚀
echo ============================================================
echo   1. Your APK will now connect from ANY Wi-Fi or Data.
echo   2. Keep the NEW windows (Engine and Tunnel) OPEN.
echo   3. If the Tunnel closes, RE-RUN this script.
echo ============================================================
echo.
pause
