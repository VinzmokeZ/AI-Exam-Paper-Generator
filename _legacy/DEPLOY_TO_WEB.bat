@echo off
setlocal

echo ============================================================
echo 🚀 AI Exam Oracle - Web Deployment Assistant
echo ============================================================

:: Check for build folder
if exist "dist" (
    echo [INFO] Cleaning old build...
    rmdir /s /q dist
)

echo [INFO] Building Frontend...
call npm run build

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Frontend build failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ============================================================
echo [SUCCESS] Build completed in 'dist/' folder.
echo ============================================================
echo.
echo Choose deployment target:
echo 1. Firebase (Requires Firebase CLI)
echo 2. Netlify (Requires Netlify CLI)
echo 3. Manual Upload (Just open 'dist/' and drag-drop)
echo.

set /p choice="Enter choice (1-3): "

if "%choice%"=="1" (
    echo [INFO] Deploying to Firebase...
    call firebase deploy
) else if "%choice%"=="2" (
    echo [INFO] Deploying to Netlify...
    call netlify deploy --prod --dir=dist
) else (
    echo [INFO] Opening build folder for manual upload...
    start explorer dist
)

echo.
echo ============================================================
echo ✅ Done! Your app is ready for the world.
echo ============================================================
pause
