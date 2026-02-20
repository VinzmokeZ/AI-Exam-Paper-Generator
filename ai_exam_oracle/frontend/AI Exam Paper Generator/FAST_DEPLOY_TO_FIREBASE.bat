@echo off
title AI EXAM ORACLE - FAST DEPLOY
color 0E

echo ===============================================================
echo    AI EXAM ORACLE - PRODUCTION DEPLOYMENT
echo ===============================================================
echo.
echo * This script will:
echo   1. Build your frontend for production (optimizing performance)
echo   2. Deploy the new UI to Firebase Hosting
echo.
echo ===============================================================
echo.
pause

echo [BUILDING] Generating production files...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Build failed! Check for code errors.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [DEPLOYING] Pushing to Firebase...
call npx firebase deploy --only hosting

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Deployment failed! Ensure you are logged in.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ===============================================================
echo   SUCCESS! Your changes are now LIVE on Firebase.
echo   URL: https://ai-exam-paper-generator-3f43f.web.app
echo ===============================================================
echo.
pause
exit
