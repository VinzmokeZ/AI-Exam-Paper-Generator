@echo off
title AI EXAM ORACLE - FIREBASE ONE-CLICK
color 0B

echo ===============================================================
echo    AI EXAM ORACLE - FIREBASE ONE-CLICK CLOUD BRIDGE
echo ===============================================================
echo.
echo * This script will:
echo   1. Start your local AI engine (FastAPI)
echo   2. Establish a secure Cloud Bridge (Localtunnel)
echo   3. Launch your live Firebase website
echo.
echo * Use this when you want to use the app on the live web!
echo.
echo ===============================================================
echo.
pause

echo [LAUNCHING] Starting Cloud Bridge...
powershell -ExecutionPolicy Bypass -File ".\LAUNCH_FIREBASE_BRIDGE.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] The launcher encountered a problem.
    echo Check if any other windows are using Port 8000.
    pause
)

exit
