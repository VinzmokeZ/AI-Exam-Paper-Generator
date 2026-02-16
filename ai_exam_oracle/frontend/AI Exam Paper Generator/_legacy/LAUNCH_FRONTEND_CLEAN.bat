@echo off
title AI Exam Oracle - Clean Frontend Launch
color 0A

echo ==========================================
echo    AI EXAM ORACLE - CLEAN FRONTEND LAUNCH
echo ==========================================
echo.

REM Kill all Node processes
echo [1/3] Killing any existing Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Navigate to project directory
cd /d "%~dp0"

REM Start fresh dev server
echo [2/3] Starting development server...
echo.
start "AI Exam Oracle - Dev Server" cmd /k "npm run dev"

REM Wait for server to start
echo [3/3] Waiting for server to initialize...
timeout /t 5 /nobreak >nul

REM Open browser
echo.
echo Opening browser at http://localhost:3000...
start http://localhost:3000

echo.
echo ==========================================
echo    LAUNCH COMPLETE!
echo ==========================================
echo.
echo Server is running on: http://localhost:3000
echo.
echo Keep the "Dev Server" window OPEN.
echo Press any key to exit this window...
pause >nul
