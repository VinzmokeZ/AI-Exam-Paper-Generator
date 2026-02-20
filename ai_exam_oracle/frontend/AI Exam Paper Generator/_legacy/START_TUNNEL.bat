@echo off
title AI Exam Oracle - Live Tunnel
echo ==========================================
echo    AI EXAM ORACLE - LIVE BACKEND TUNNEL
echo ==========================================
echo.
echo 1. Your local backend MUST be running on port 8000.
echo 2. Your live site is at: https://ai-exam-paper-generator-3f43f.web.app
echo 3. Keep this window OPEN while using the live site.
echo.
echo Connecting to tunnel...
echo.
npx lt --port 8000 --subdomain ai-exam-vinz
pause
