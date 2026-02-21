@echo off
title AI Exam Oracle - One-Click Launcher
color 0B

echo.
echo ========================================
echo    AI EXAM ORACLE - SMART LAUNCHER
echo ========================================
echo.

:: Check if PowerShell is available
where powershell >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PowerShell is not available!
    echo Please run LAUNCH.ps1 manually.
    pause
    exit /b 1
)

:: Run the PowerShell script
powershell.exe -ExecutionPolicy Bypass -File "%~dp0LAUNCH.ps1"

exit
