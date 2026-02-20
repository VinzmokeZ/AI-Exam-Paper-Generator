@echo off
setlocal enabledelayedexpansion
title AI Exam Oracle - Ultimate Startup

:: 1. Setup Paths
pushd "%~dp0"
set "BASE_DIR=%CD%\"
set "BACKEND_PATH=%BASE_DIR%ai_exam_oracle\frontend\AI Exam Paper Generator\backend"
set "FRONTEND_PATH=%BASE_DIR%ai_exam_oracle\frontend\AI Exam Paper Generator"

echo ==========================================
echo    AI EXAM ORACLE - ULTIMATE STARTUP
echo ==========================================
echo.
echo [1/5] Validating Environment...

:: Check Ollama
where ollama >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Ollama not found in PATH.
    pause
    exit /b
)

:: Ensure Ollama is running
start /min "Ollama Service" ollama serve
timeout /t 5 >nul

:: Check AI model
echo [SYSTEM] Verifying AI Model (phi3:mini)...
ollama list > "%TEMP%\ol_check.txt" 2>&1
findstr /i "phi3" "%TEMP%\ol_check.txt" >nul
if errorlevel 1 (
    echo [WARNING] phi3 model not found. Pulling now...
    ollama pull phi3:mini
) else (
    echo [SUCCESS] AI Model ready.
)
del "%TEMP%\ol_check.txt" >nul 2>&1

:: 2. Port Check (Socket Cleanser)
echo [2/5] Ensuring Port 8000 is clear...
:: Aggressive Kill: Find all processes on 8000 and terminate them
powershell -Command "Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"
:: Mandatory Cooling Period for OS to release the socket
timeout /t 3 >nul
echo [SUCCESS] Port 8000 cleared and cooled.

:: 3. Start Backend
echo [3/5] Launching Python Backend...
if exist "%BACKEND_PATH%" (
    echo [SYSTEM] Launching from: "%BACKEND_PATH%"
    start "Backend Server" /d "%BACKEND_PATH%" cmd /k "echo Starting Backend... && if exist venv\Scripts\activate.bat ( call venv\Scripts\activate.bat ) && python -m app.main"
) else (
    echo.
    echo [ERROR] CRITICAL: Backend folder not found!
    echo Looked in: "%BACKEND_PATH%"
    echo.
    pause
    exit /b
)

:: 4. Start Localtunnel
echo [4/5] Enabling Live Tunnel...
if exist "%FRONTEND_PATH%" (
    echo [SYSTEM] Found Frontend at: %FRONTEND_PATH%
    start "Localtunnel" /d "%FRONTEND_PATH%" cmd /k "echo Connecting... && npx lt --port 8000 --subdomain ai-exam-vinz"
) else (
    echo [ERROR] Frontend folder not found at: "%FRONTEND_PATH%"
    pause
)

:: 5. Done
echo.
echo [5/5] Opening UI...
start https://ai-exam-paper-generator-3f43f.web.app

echo.
echo =========================================
echo    ALL SYSTEMS DEPLOYED AND ACTIVE
echo =========================================
echo.
echo Check the NEW windows for detailed logs.
echo.
pause
popd
