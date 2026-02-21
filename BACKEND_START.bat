@echo off
setlocal enabledelayedexpansion
title AI EXAM ORACLE - BACKEND START (GOLDEN)
color 0A
echo.
echo ============================================================
echo   AI EXAM ORACLE - BACKEND ENGINE (LIVE LOGS)
echo ============================================================
echo.

:: 1. Clear Port 8000
echo [..] Clearing port 8000...
for /f "tokens=5" %%i in ('netstat -aon 2^>nul ^| findstr ":8000 "') do (
    taskkill /F /PID %%i >nul 2>&1
)
timeout /t 1 >nul

:: 2. Detect Local IP (for Wi-Fi Fallback)
echo [..] Detecting Local Network...
echo ============================================================
echo   AVAILABLE IP ADDRESSES (Use one of these):
set count=0
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr IPv4') do (
    set "IP=%%a"
    set "IP=!IP: =!"
    echo   - !IP!
    set "LAST_IP=!IP!"
)
echo ============================================================
:found_ip

:: 3. ADB Reverse (Crucial for Physical Phone via USB)
echo [..] Linking USB Physical Device...
where adb >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    adb devices > temp_devices.txt
    findstr /r "\<device\>" temp_devices.txt > nul
    if !ERRORLEVEL! EQU 0 (
        adb reverse tcp:8000 tcp:8000
        echo [OK] USB Link Active (http://localhost:8000^).
    ) else (
        echo [!] WARNING: No device found via USB. 
        echo     Please check: 1. Cable plugged in? 2. USB Debugging ON?
    )
    del temp_devices.txt
) else (
    echo [SKIP] ADB not found in PATH.
)

:: 4. Start Tunnel in Background
echo [..] Starting Global Bridge (Roaming)...
start /min "AI-TUNNEL" cmd /c "npx lt --port 8000 --subdomain ai-exam-vinz"

:: 5. Start Backend in CURRENT WINDOW
echo ============================================================
echo   STARTING AI ENGINE... (Watching for requests)
echo   WI-FI FALLBACK: http://!IP!:8000
echo ============================================================
echo.

cd backend
call venv\Scripts\activate.bat
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

pause
