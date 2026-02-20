@echo off
title AI EXAM ORACLE - FULL SYSTEM LAUNCHER
color 0B

echo.
echo ========================================================
echo   AI EXAM ORACLE - COMPLETE ONE-CLICK LAUNCHER
echo ========================================================
echo.
echo This launcher will start:
echo  1. Backend API Server (Port 8000)
echo  2. AI Engine (Ollama + phi3:mini)
echo  3. Frontend Dev Server (Port 5173)
echo  4. LIVE CLOUD TUNNEL (for Firebase connection)
echo.
echo TIP: Keep all windows open while using the app!
echo.
pause

cls
powershell.exe -ExecutionPolicy Bypass -File "%~dp0LAUNCH_ULTIMATE.ps1"
echo.
echo Script finished or failed.
pause
exit
