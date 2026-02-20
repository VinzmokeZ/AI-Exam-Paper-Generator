@echo off
title AI BRIDGE LAUNCHER
color 0B
echo.
echo ============================================================
echo   AI EXAM ORACLE - FULL ANDROID BRIDGE
echo   Step 1: Run START_BACKEND_NOW.bat FIRST
echo   Step 2: Then run THIS file
echo ============================================================
echo.

cd /d "%~dp0"

:: Check backend is actually running
echo [..] Checking if backend is running on port 8000...
netstat -aon | findstr ":8000 " >nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend is NOT running on port 8000!
    echo [FIX]   Run START_BACKEND_NOW.bat first, then run this.
    pause
    exit /b 1
)
echo [OK] Backend is running on port 8000.
echo.

:: Start tunnel
echo [..] Starting Cloud Tunnel...
echo [INFO] Your APK will connect via: https://ai-exam-vinz.loca.lt
start "AI-TUNNEL" cmd /k "title AI-TUNNEL && npx lt --port 8000 --subdomain ai-exam-vinz"
echo [OK] Tunnel window opened.
echo.

:: Open Android Studio
echo [..] Opening Android Studio...
call npx cap open android >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Could not auto-open Android Studio.
    echo [INFO] Open Android Studio manually and press the Play button.
) else (
    echo [OK] Android Studio opened.
)
echo.

echo ============================================================
echo   ALL SYSTEMS ONLINE!
echo ============================================================
echo.
echo   Backend:  http://localhost:8000
echo   Tunnel:   https://ai-exam-vinz.loca.lt
echo.
echo   In Android Studio (Medium Phone Emulator):
echo     - Press the GREEN PLAY button to run the APK
echo     - Look for the CYAN status light = Connected!
echo.
echo   KEEP the START_BACKEND_NOW window OPEN!
echo ============================================================
pause
