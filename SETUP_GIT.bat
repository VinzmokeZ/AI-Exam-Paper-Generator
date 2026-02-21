@echo off
echo ===================================================
echo     AI EXAM ORACLE - GITHUB SETUP HELPER
echo ===================================================
echo.
echo This script will help you push your code to GitHub
echo so you can deploy it to Render.com.
echo.

if exist .git (
    echo [INFO] Existing Git repository detected.
) else (
    echo [1] Initializing Git Repository...
    git init
)

echo.
echo [2] Adding all project files (this may take a moment)...
git add .

echo.
echo [3] Committing files...
git commit -m "Upload latest changes for Render deployment" 2>nul || echo [INFO] No new changes to commit.

echo.
echo ===================================================
echo GITHUB REPOSITORY URL:
echo If you already have a repo, paste the URL below.
echo Example: https://github.com/YourName/ai-exam-oracle.git
echo ===================================================
echo.
set /p REPO_URL="Paste your GitHub Repository URL here: "

echo.
echo [4] Linking to GitHub...
git remote add origin %REPO_URL% 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Remote origin already exists. Updating URL...
    git remote set-url origin %REPO_URL%
)

git branch -M main

echo.
echo [5] Pushing to GitHub...
echo (You may be asked to log in to GitHub)
git push -u origin main

echo.
echo ===================================================
echo SUCCESS! Your code is now on GitHub.
echo Now go to Render.com and select this repository.
echo ===================================================
pause

