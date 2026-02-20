@echo off
TITLE AI Exam Paper Generator - Production Launcher
COLOR 0A

echo ======================================================
echo   AI EXAM PAPER GENERATOR - LAUNCHER
echo ======================================================
echo.
echo Launching Production Build with Neural Repair...
echo.

:: Check for Admin Privileges (Optional but good for repair)
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Success: Administrative permissions confirmed.
) else (
    echo Note: Running without Admin privileges. Repairs might be limited.
)

:: Execute the main PowerShell engine
powershell -ExecutionPolicy Bypass -File "REPAIR_AND_LAUNCH.ps1"

pause
