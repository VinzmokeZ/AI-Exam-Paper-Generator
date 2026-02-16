@echo off
echo ============================================================
echo ☁️ AI Exam Oracle - Firebase Deployer
echo ============================================================

echo [INFO] Building Frontend (Production)...
call npm run build

echo [INFO] Deploying to Firebase Hosting...
:: Check if firebase-tools is installed
call npm list -g firebase-tools >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Firebase CLI not found globally. Trying npx...
    call npx firebase deploy
) else (
    firebase deploy
)

pause
