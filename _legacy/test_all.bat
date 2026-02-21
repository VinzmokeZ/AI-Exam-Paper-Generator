@echo off
echo ============================================================
echo 🧪 AI Exam Oracle - System Integrity Test
echo ============================================================

echo [1/4] Checking Backend Dependencies...
python -c "import fastapi; import uvicorn; print('✅ Backend deps ok')"

echo [2/4] Checking Frontend Build...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend build failed!
    exit /b 1
) else (
    echo [SUCCESS] Frontend build passed.
)

echo [3/4] Checking Local LLM (Ollama)...
curl -s http://localhost:11434/api/tags >nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Ollama is NOT running. Run 'run_model.bat' first.
) else (
    echo [SUCCESS] Ollama is running.
)

echo [4/4] Checking Database...
if exist "backend/exam_oracle.db" (
    echo [SUCCESS] Database exists.
) else (
    echo [WARNING] Database not found. It will be created on first run.
)

echo.
echo ✅ System Test Complete.
pause
