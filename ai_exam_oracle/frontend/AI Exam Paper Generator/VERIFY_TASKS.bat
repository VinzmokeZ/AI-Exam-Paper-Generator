@echo off
echo ================================================
echo  AI EXAM ORACLE - QUICK START
echo  Tasks 1, 2, 3 Complete!
echo ================================================
echo.

echo [STEP 1] Testing Backend Fix...
cd backend
python -c "import sys; sys.path.insert(0, '.'); from app.services.generation_service import generation_service; print('✓ generation_service imports successfully!')"
if errorlevel 1 (
    echo [WARNING] Backend has import issues - check dependencies
    pause
)

echo.
echo [STEP 2] Checking Frontend Services...
if exist "..\src\services\rubricService.ts" (
    echo ✓ rubricService.ts created
) else (
    echo ✗ rubricService.ts missing
)
if exist "..\src\services\courseOutcomeService.ts" (
    echo ✓ courseOutcomeService.ts created
) else (
    echo ✗ courseOutcomeService.ts missing
)

echo.
echo [STEP 3] Documentation Files...
if exist "..\FRONTEND_INTEGRATION_GUIDE.md" (
    echo ✓ Integration guide ready
) else (
    echo ✗ Integration guide missing
)
if exist "..\TASKS_COMPLETE.md" (
    echo ✓ Task report ready
) else (
    echo ✗ Task report missing
)

cd..

echo.
echo ================================================
echo  ✅ SETUP VERIFICATION COMPLETE
echo ================================================
echo.
echo NEXT STEPS:
echo 1. Run: SETUP_MYSQL.bat (if not done)
echo 2. Start backend: cd backend ^&^& python -m uvicorn app.main:app --reload
echo 3. Open: FRONTEND_INTEGRATION_GUIDE.md
echo 4. Follow integration steps to connect components
echo.
echo DOCUMENTATION:
echo - TASKS_COMPLETE.md - What was done in Tasks 1, 2, 3
echo - FRONTEND_INTEGRATION_GUIDE.md - How to integrate
echo - IMPLEMENTATION_SUMMARY.md - Full Phase 1-4 details
echo.
pause
