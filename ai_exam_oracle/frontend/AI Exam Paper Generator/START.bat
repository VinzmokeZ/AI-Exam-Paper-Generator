@echo off
title AI Exam Oracle Launcher
color 0B

cls
echo ================================================
echo    AI EXAM ORACLE - QUICK LAUNCHER
echo ================================================
echo.
echo Starting application...
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0START.ps1"

exit
