@echo off
setlocal enabledelayedexpansion

:: ============================================================
:: SELF ELEVATE (Simple method, handles spaces in path)
:: ============================================================
IF NOT "%1"=="ADMIN" (
    powershell -windowstyle hidden -command "Start-Process -FilePath '%~f0' -ArgumentList 'ADMIN' -Verb RunAs"
    exit /b
)

:: Now running as Admin — restore original directory
cd /d "%~dp0"

title AI EXAM ORACLE - MASTER LAUNCH
color 0A
cls

echo.
echo  ==========================================================
echo    AI EXAM ORACLE - MASTER LAUNCH
echo    USB Phone + Backend + DB + AI in ONE CLICK
echo  ==========================================================
echo.

:: ============================================================
:: STEP 1: FIX FIREWALL
:: ============================================================
echo [1/6] Fixing Windows Firewall for Port 8000...
netsh advfirewall firewall delete rule name="AI Exam Oracle Port 8000" >nul 2>&1
netsh advfirewall firewall add rule name="AI Exam Oracle Port 8000" dir=in action=allow protocol=TCP localport=8000 profile=any >nul 2>&1
echo [OK] Firewall rule applied.

:: ============================================================
:: STEP 2: KILL OLD BACKEND ON PORT 8000
:: ============================================================
echo [2/6] Clearing port 8000...
for /f "tokens=5" %%i in ('netstat -aon 2^>nul ^| findstr ":8000 "') do (
    taskkill /F /PID %%i >nul 2>&1
)
timeout /t 1 >nul
echo [OK] Port 8000 free.

:: ============================================================
:: STEP 3: DETECT ALL IPs
:: ============================================================
echo [3/6] Your PC IP Addresses:
echo  ----------------------------------------------------------
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr IPv4') do (
    set "IP=%%a"
    set "IP=!IP: =!"
    echo    !IP!
    set "WIFI_IP=!IP!"
)
echo  ----------------------------------------------------------

:: ============================================================
:: STEP 4: USB ADB SETUP (auto-finds ADB even if not in PATH)
:: ============================================================
echo [4/6] Setting up USB Phone Link (ADB)...

:: Try to find ADB — check PATH first, then Android Studio default location
set "ADB_EXE="
where adb >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    set "ADB_EXE=adb"
) else if exist "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" (
    set "ADB_EXE=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"
    echo [INFO] Found ADB at Android Studio SDK location.
) else (
    echo [!!] ADB not found. Install Android SDK Platform Tools.
    echo      OR open Android Studio once to install it automatically.
    set "USB_CONNECTED=NO"
    goto :adb_done
)

"!ADB_EXE!" devices > "%TEMP%\adb_check.txt" 2>&1
findstr /r "\<device\>" "%TEMP%\adb_check.txt" >nul
if !ERRORLEVEL! EQU 0 (
    "!ADB_EXE!" reverse tcp:8000 tcp:8000 >nul 2>&1
    echo [OK] USB PHONE CONNECTED. ADB reverse active.
    echo      Phone reaches backend at: http://localhost:8000
    set "USB_CONNECTED=YES"
) else (
    echo [!!] Phone not found via USB. Check:
    echo      1. USB cable plugged in?
    echo      2. USB Debugging ON? (Settings - Developer Options)
    echo      3. Set USB mode to File Transfer (not Charging only)
    set "USB_CONNECTED=NO"
)
del "%TEMP%\adb_check.txt" >nul 2>&1
:adb_done
echo.

:: ============================================================
:: STEP 5: STATUS CHECK
:: ============================================================
echo [5/6] System Status:
echo  ----------------------------------------------------------
echo   DB       : SQLite (always works, no setup needed)
echo   Local AI : phi3:mini via Ollama (localhost:11434)
echo   Cloud AI : OpenRouter Gemini 2.0 Flash
echo   Phone    : !USB_CONNECTED!
echo   Backend  : http://!WIFI_IP!:8000
echo  ----------------------------------------------------------

curl -s --max-time 2 http://localhost:11434/api/tags >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo   Ollama   : RUNNING
) else (
    echo   Ollama   : OFF (start Ollama for local AI)
)
echo.

:: ============================================================
:: STEP 6: START BACKEND WITH LIVE REQUEST LOG
:: ============================================================
echo [6/6] Starting AI Engine...
echo  ==========================================================
echo    LIVE LOG  - All HTTP requests appear below
echo    192.168.x.x:PORT - GET /api/health 200 OK
echo    Press Ctrl+C to stop
echo  ==========================================================
echo.

cd /d "%~dp0backend"
call venv\Scripts\activate.bat

python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --log-level info --access-log

echo.
echo [STOPPED] Backend shut down.
pause
