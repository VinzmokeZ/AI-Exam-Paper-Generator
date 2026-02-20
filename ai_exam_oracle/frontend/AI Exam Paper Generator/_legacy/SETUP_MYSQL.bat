@echo off
REM Setup MySQL Database and Migrate Data from SQLite to MySQL

echo ================================================
echo  AI EXAM ORACLE - MySQL Database Setup
echo ================================================
echo.

REM Check if MySQL is running
echo [1/4] Checking MySQL status...
netstat -ano | findstr ":3306" > nul
if errorlevel 1 (
    echo [ERROR] MySQL is not running!
    echo Please start XAMPP MySQL service first.
    pause
    exit /b 1
)
echo [OK] MySQL is running on port 3306

REM Check Python virtual environment
echo.
echo [2/4] Activating Python environment...
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    echo [OK] Virtual environment activated
) else (
    echo [OK] Using system Python
)

REM Install dependencies
echo.
echo [3/4] Installing required packages...
cd backend
pip install -q pymysql python-dotenv ollama aiofiles
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed

REM Run migration
echo.
echo [4/4] Running database migration...
python migration_script.py
if errorlevel 1 (
    echo [ERROR] Migration failed!
    pause
    exit /b 1
)

cd ..

echo.
echo ================================================
echo  Setup Complete!
echo ================================================
echo.
echo Next steps:
echo 1. Open phpMyAdmin: http://localhost/phpmyadmin
echo 2. Select 'ai_exam_oracle' database
echo 3. Browse tables to verify migration
echo 4. Run LAUNCH.bat to start the application
echo.
pause
