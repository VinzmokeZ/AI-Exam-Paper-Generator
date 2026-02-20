@echo off
echo ==========================================
echo 🔥 FIREBASE LIVE DEPLOYER - AI EXAM ORACLE
echo ==========================================
echo.

echo [1/2] 🟦 Building Frontend for Production...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ BUILD FAILED! Deployment aborted.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/2] 🚀 Deploying to Firebase Hosting...
call npx firebase deploy --only hosting

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ DEPLOY FAILED!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ==========================================
echo ✅ LIVE UPDATE COMPLETE! 
echo Check your Firebase URL to see the changes.
echo ==========================================
pause
