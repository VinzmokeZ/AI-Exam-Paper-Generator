@echo off
setlocal
echo ============================================================
echo 🚀 AI EXAM ORACLE - FULL PROJECT SYNC (ANDROID STUDIO)
echo ============================================================
echo [INFO] This script will:
echo        1. Build the Latest Web Code (React)
echo        2. Sync and Copy Assets to Android Studio
echo        3. Regenerate Icons and Solve Conflicts
echo ============================================================

:: 1. Clean Build
echo [PROGRESS] Pre-build Cleanup (Anti-Conflict)...
:: System Purge: Kill any hung node processes that could block the build
taskkill /F /IM node.exe /T >nul 2>&1
if %ERRORLEVEL% EQU 0 (echo [FIX] Purged hung node processes...)

echo [PROGRESS] Building optimized web assets...
call npm run build || (echo [ERROR] Web Build Failed! && pause && exit /b 1)

:: 2. Capacitor Sync
echo [PROGRESS] Syncing assets to Android folder...
call npx cap sync android || (echo [ERROR] Sync Failed! && pause && exit /b 1)
call npx cap copy android || (echo [ERROR] Copy Failed! && pause && exit /b 1)

:: 3. Icon Regeneration & Conflict Fix
echo [PROGRESS] Updating Icons and Cleaning Conflicts...
call npx @capacitor/assets generate --android
:: Permanent Fix: Remove problematic adaptive icon folder that causes Linking Errors
powershell -Command "Remove-Item -Path 'android\app\src\main\res\mipmap-anydpi-v26' -Recurse -Force -ErrorAction SilentlyContinue"
:: Clean up Gradle cache to force Android Studio to see the changes
cd android
call .\gradlew.bat clean || (echo [ERROR] Gradle Clean Failed! && cd .. && pause && exit /b 1)
cd ..

echo ============================================================
echo ✅ SYNC COMPLETE!
echo ============================================================
echo [ACTION] Now switch to Android Studio and:
echo        1. Click the "Elephant Icon" (Sync)
echo        2. Click "Build > Build APK(s)"
echo ============================================================
pause
