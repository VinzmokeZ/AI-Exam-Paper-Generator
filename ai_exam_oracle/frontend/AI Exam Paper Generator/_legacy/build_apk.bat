@echo off
echo ============================================================
echo 📱 AI Exam Oracle - Android APK Builder
echo ============================================================

:: Check for Capacitor config
if not exist "capacitor.config.ts" (
    echo [INFO] Initializing Capacitor...
    call npx cap init "AI Exam Oracle" io.vinz.aiexam --web-dir dist
)

:: Install Android Platform if missing
if not exist "android" (
    echo [INFO] Adding Android Platform...
    call npx cap add android
)

echo [INFO] Building Frontend (Vite)...
call npm run build

echo [INFO] Syncing to Android...
call npx cap sync android

echo [SUCCESS] Project synced.
echo [INFO] Opening Android Studio...
echo        Please wait for Gradle sync to finish, then click 'Run' or 'Build Bundle'.
call npx cap open android
pause
