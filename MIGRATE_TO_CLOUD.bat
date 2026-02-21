@echo off
echo ==========================================
echo    AI Exam Oracle - Cloud Data Sync
echo ==========================================
echo.
echo This tool will copy your LOCAL data (subjects, history, streak)
echo to your RENDER Cloud database.
echo.
echo [1/2] Checking dependencies...
pip install psycopg2-binary sqlalchemy --quiet
echo [2/2] Starting sync...
python MIGRATE_TO_CLOUD.py
echo.
pause
