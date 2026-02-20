@echo off
setlocal enabledelayedexpansion
title AI-BRIDGE-DEBUGGER
echo ============================================================
echo 🔍 DEEP DIAGNOSTIC: ANDROID MOBILE BRIDGE
echo ============================================================
echo [1] Checking Environment...
where python || (echo ❌ PYTHON NOT FOUND! && pause && exit /b 1)
where npx || (echo ❌ NPX NOT FOUND! && pause && exit /b 1)
echo ✅ Environment looks okay.
pause

echo [2] Checking Port 8000...
netstat -ano | findstr :8000
if %ERRORLEVEL% EQU 0 (
    echo ⚠️ Port 8000 is BUSY. Attempting to clear...
    powershell -Command "$p = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue; if($p){ Stop-Process -Id $p.OwningProcess -Force -ErrorAction SilentlyContinue; echo '✅ Port Cleared.' } else { echo '❌ Port Busy but Process not found via PowerShell.' }"
) else (
    echo ✅ Port 8000 is FREE.
)
pause

echo [3] Starting Backend (AI Engine)...
if not exist "backend\venv\Scripts\activate.bat" (
    echo ❌ VENV NOT FOUND at backend\venv!
    pause
    exit /b 1
)
:: Start backend in a new window so it can pull the model freely
echo [DIAGNOSTIC] Starting backend...
start cmd /k "title AI-ENGINE-DIAGNOSTIC && cd backend && venv\Scripts\activate && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

echo [DIAGNOSTIC] Waiting for Port 8000 (up to 30s)...
set /a count=0
:wait_loop
netstat -ano | findstr :8000 >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Backend is ONLINE on Port 8000.
    goto check_health
)
set /a count+=1
if %count% GTR 30 (
    echo ❌ BACKEND FAILED TO BIND TO PORT 8000!
    echo Check the new 'AI-ENGINE-DIAGNOSTIC' window for Errors.
    pause
    exit /b 1
)
timeout /t 1 >nul
goto wait_loop

:check_health
echo [DIAGNOSTIC] Checking API Health...
powershell -Command "$r = Invoke-RestMethod -Uri 'http://localhost:8000/api/health' -ErrorAction SilentlyContinue; if($r){ if($r.is_pulling){ echo '⏳ AI Engine is BUSY pulling the model. This is OK!' } else { echo '✅ AI Engine is READY.' } } else { echo '❌ Health Check Failed.' }"
pause

echo [4] Starting Final Parallel Bridge...
echo [PROGRESS] Opening AI Engine Window...
start cmd /k "title AI-ENGINE && cd backend && venv\Scripts\activate && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"
echo [PROGRESS] Opening Cloud Tunnel Window...
start cmd /k "title AI-MOBILE-BRIDGE && npx lt --port 8000 --subdomain ai-exam-vinz"
echo [PROGRESS] Opening Android Studio...
call npx cap open android || (echo ❌ npx cap open failed! && pause)

echo ============================================================
echo ✅ DIAGNOSTIC COMPLETE
echo ============================================================
echo If the windows closed, tell me which STEP they closed at.
pause
