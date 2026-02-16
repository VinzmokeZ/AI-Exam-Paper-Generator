@echo off
setlocal enabledelayedexpansion

echo ============================================================
echo 🎓 AI Exam Oracle - One-Click Setup
echo ============================================================

:: 1. Check for Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Please install Python 3.9+ and add it to PATH.
    pause
    exit /b 1
)

:: 2. Check for Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js and add it to PATH.
    pause
    exit /b 1
)

:: 3. Create Backend structure
echo [INFO] Creating backend directory structure...
if not exist "backend\app\routes" mkdir "backend\app\routes"
if not exist "backend\app\services" mkdir "backend\app\services"
if not exist "backend\app\models" mkdir "backend\app\models"
if not exist "backend\app\utils" mkdir "backend\app\utils"
if not exist "backend\models" mkdir "backend\models"

:: 4. Install Python dependencies
echo [INFO] Installing Python dependencies...
if not exist "backend\requirements.txt" (
    echo fastapi > "backend\requirements.txt"
    echo uvicorn >> "backend\requirements.txt"
    echo sqlalchemy >> "backend\requirements.txt"
    echo pydantic >> "backend\requirements.txt"
    echo python-multipart >> "backend\requirements.txt"
    echo sentence-transformers >> "backend\requirements.txt"
    echo chromadb >> "backend\requirements.txt"
    echo PyPDF2 >> "backend\requirements.txt"
    echo python-docx >> "backend\requirements.txt"
    echo python-dotenv >> "backend\requirements.txt"
    echo openai >> "backend\requirements.txt"
)
pip install -r backend\requirements.txt

:: 5. Install Node.js dependencies
echo [INFO] Installing Frontend dependencies...
if exist "package.json" (
    npm install
) else (
    echo [WARNING] package.json not found in root. Skipping npm install.
)

:: 6. Initialize Database (placeholder for now)
echo [INFO] Initializing SQLite database...
:: python backend/app/init_db.py

:: 7. Documentation
if not exist "docs" mkdir "docs"
echo [INFO] Setup complete!

echo ============================================================
echo ✅ Setup Finished Successfully!
echo ============================================================
echo Run 'run_local.bat' to start the application.
pause
