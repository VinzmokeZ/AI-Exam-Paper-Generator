@echo off
echo ===================================================
echo   🚀 AI EXAM ORACLE - MASTER LAUNCH SYSTEM 🚀
echo ===================================================

:: 1. Start MySQL
echo [1/4] Starting MySQL Database...
net start MySQL80 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] MySQL might already be running or needs admin rights.
) else (
    echo [V] MySQL started.
)

:: 2. Start Ollama
echo [2/4] Starting Ollama AI Engine...
start /min "" ollama serve
timeout /t 3 /nobreak >nul

:: 3. Start Python Backend
echo [3/4] Starting Python Backend Server...
cd "..\..\backend"
start /min cmd /k "python -m uvicorn app.main:app --reload --port 8000"
timeout /t 3 /nobreak >nul

:: 4. Start Vite Frontend
echo [4/4] Starting Figma Optimized Frontend...
cd "..\frontend\AI Exam Paper Generator"
start cmd /k "npm run dev"

echo.
echo ===================================================
echo   ✨ ALL SYSTEMS ONLINE! ✨
echo   - Frontend: http://localhost:3000
echo   - Backend:  http://localhost:8000
echo ===================================================
pause
