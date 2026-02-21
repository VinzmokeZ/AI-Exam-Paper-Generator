@echo off
setlocal enabledelayedexpansion
title 🎓 AI Exam Oracle - Master Coordinator

:: Color setup: 0A = Green on Black, 0B = Cyan on Black, 0E = Yellow on Black, 0F = White on Black
color 0B

echo.
echo    ============================================================
echo               🎓 AI EXAM ORACLE - PRO COORDINATOR
echo    ============================================================
echo.

:: --- CONFIGURATION ---
set XAMPP_PATH=C:\xampp
if not exist "%XAMPP_PATH%" set XAMPP_PATH=D:\xampp
if not exist "%XAMPP_PATH%" set XAMPP_PATH=E:\xampp

:: --- STEP 1: CLEANUP ---
echo [1/6] 🧹 Deep cleaning stale processes and lock files...
taskkill /F /IM node.exe /IM python.exe /IM uvicorn.exe /IM mysqld.exe /IM httpd.exe >nul 2>&1

:: Find and kill whatever is on Port 3306 (MySQL default)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3306') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: Delete MySQL lock files (common cause of startup failure)
if exist "%XAMPP_PATH%\mysql\data\mysql.pid" del /f /q "%XAMPP_PATH%\mysql\data\mysql.pid"
if exist "%XAMPP_PATH%\mysql\data\aria_log_control" del /f /q "%XAMPP_PATH%\mysql\data\aria_log_control"
if exist "%XAMPP_PATH%\mysql\data\ib_logfile0" del /f /q "%XAMPP_PATH%\mysql\data\ib_logfile0"
if exist "%XAMPP_PATH%\mysql\data\ib_logfile1" del /f /q "%XAMPP_PATH%\mysql\data\ib_logfile1"

echo.
:: --- STEP 2: DEPENDENCIES ---
echo [2/6] 📦 Repairing AI Dependencies...
python -m pip install --upgrade pip >nul 2>&1
python -m pip install pymysql wikipedia-api datasets huggingface-hub sentence-transformers chromadb openai pypdf2 python-docx >nul 2>&1

echo.
:: --- STEP 3: DATABASE STARTUP ---
echo [3/6] 🧰 Starting Database Services...
if exist "%XAMPP_PATH%" (
    echo [INFO] XAMPP located at %XAMPP_PATH%. Force starting MySQL...
    
    :: Attempt to clean the control file if MySQL is stuck
    if exist "%XAMPP_PATH%\mysql\data\mysql-bin.index" del /f /q "%XAMPP_PATH%\mysql\data\mysql-bin.index"
    
    start "MySQL" /min "%XAMPP_PATH%\mysql\bin\mysqld.exe" --defaults-file="%XAMPP_PATH%\mysql\bin\my.ini" --standalone
    start "Apache" /min "%XAMPP_PATH%\apache\bin\httpd.exe"
    
    echo [WAIT] Waiting for database to stabilize (10s)...
    timeout /t 10 /nobreak >nul
) else (
    echo [CRITICAL] XAMPP not found. Please start MySQL manually!
    pause
)

:: Verify MySQL is actually running
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe" >NUL
if "%ERRORLEVEL%" neq "0" (
    echo [WARNING] MySQL failed to auto-start. 
    echo [LOG] Last few lines of MySQL error log:
    if exist "%XAMPP_PATH%\mysql\data\mysql_error.log" (
        powershell -Command "Get-Content '%XAMPP_PATH%\mysql\data\mysql_error.log' -Tail 10"
    )
    
    echo.
    echo Searching for Port 3306 status...
    netstat -ano | findstr :3306 >nul
    if "!ERRORLEVEL!"=="0" (
        echo [OK] Port 3306 is active. Continuing...
    ) else (
        echo [ERROR] MySQL is NOT running and Port 3306 is empty.
        echo Try running this script as ADMINISTRATOR.
        pause
    )
)

echo.
:: --- STEP 4: SEEDING ^& RESET ---
echo [4/6] 🏗️ Resetting Engine ^& Seeding Data...
python -c "import pymysql; from backend.app.database import DB_HOST, DB_USER, DB_PASSWORD, DB_NAME; conn = pymysql.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD); conn.cursor().execute(f'DROP DATABASE IF EXISTS {DB_NAME}'); conn.commit(); conn.close()" >nul 2>&1
cd backend
python seed_db.py
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Reset failed. Ensure MySQL is running and VARCHAR fix is applied.
    pause
    exit /b 1
)
cd ..

echo.
:: --- STEP 5: KNOWLEDGE SYNC ---
echo [5/6] 🧠 Syncing Global Pedagogy ^& Knowledge...
python sync_external_knowledge.py
python train_kb.py

echo.
:: --- STEP 6: LAUNCH ---
echo [6/6] 🚀 Launching AI Exam Oracle Ecosystem...
start "AI Engine (Ollama)" /min cmd /c "ollama serve"
timeout /t 2 /nobreak >nul
start "Backend API" cmd /k "cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
timeout /t 3 /nobreak >nul
start "Frontend UI" cmd /k "npm run dev -- --host"

echo.
echo    ============================================================
echo    ✅ SYSTEMS ONLINE! Your portal is ready at:
echo       http://localhost:5173
echo    ============================================================
echo.

echo Opening dashboard in 5 seconds...
timeout /t 5 /nobreak >nul
start http://localhost:5173
pause
