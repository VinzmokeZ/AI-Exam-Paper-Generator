@echo off
echo ================================================
echo  AI EXAM ORACLE - DOCUMENT UPLOAD TEST
echo  Per-Topic Upload + RAG System
echo ================================================
echo.

echo [Step 1] Checking Ollama...
ollama --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Ollama not found! Please install from https://ollama.ai
    pause
    exit /b 1
)
echo [OK] Ollama installed

echo.
echo [Step 2] Checking Model...
ollama list | findstr "phi3:mini" >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] phi3:mini model not found
    echo Installing phi3:mini model now...
    ollama pull phi3:mini
) else (
    echo [OK] phi3:mini model ready
)

echo.
echo [Step 3] Checking Backend Config...
if exist "backend\.env" (
    findstr "phi3:mini" backend\.env >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] Backend configured correctly
    ) else (
        echo [WARNING] Backend .env needs update
    )
) else (
    echo [ERROR] backend\.env not found!
)

echo.
echo [Step 4] Checking Upload Component...
if exist "src\components\DocumentUpload.tsx" (
    echo [OK] DocumentUpload component exists
) else (
    echo [ERROR] DocumentUpload.tsx not found!
)

echo.
echo [Step 5] Checking Subject Detail Integration...
findstr "DocumentUpload" src\components\SubjectDetail.tsx >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Per-topic upload integrated
) else (
    echo [ERROR] Integration missing!
)

echo.
echo ================================================
echo  DOCUMENT UPLOAD FEATURES
echo ================================================
echo.
echo [x] Subject-Level Upload: Upload textbooks for entire subject
echo [x] Topic-Level Upload: Upload chapter PDFs per topic (NEW!)
echo [x] Supported Formats: PDF, DOC, DOCX, XLS, XLSX, TXT, PPT, PPTX
echo [x] Max File Size: 10MB
echo [x] RAG Integration: AI uses your documents
echo [x] Progress Tracking: Visual upload feedback
echo.

echo ================================================
echo  QUICK START GUIDE
echo ================================================
echo.
echo Open 3 terminals and run:
echo.
echo Terminal 1: ollama serve
echo Terminal 2: cd backend ^&^& python -m uvicorn app.main:app --reload
echo Terminal 3: npm run dev
echo.
echo Then test:
echo 1. Navigate to any subject
echo 2. Find a topic
echo 3. Click orange Upload button
echo 4. Select PDF file
echo 5. Upload and watch progress!
echo.

echo ================================================
echo  TESTING CHECKLIST
echo ================================================
echo.
echo [ ] 1. Subject-level upload works
echo [ ] 2. Topic-level upload works (orange button)
echo [ ] 3. Upload modal appears correctly
echo [ ] 4. Progress bar animates
echo [ ] 5. Success message shows
echo [ ] 6. File appears in backend/knowledge_base/
echo [ ] 7. Generate questions uses uploaded docs
echo [ ] 8. Questions are more relevant/accurate
echo.

echo ================================================
echo  DOCUMENTATION
echo ================================================
echo.
echo Full guides available:
echo  - DOCUMENT_UPLOAD_AND_RAG_GUIDE.md
echo  - MODELS_AND_UPLOAD_STATUS.md
echo  - COMPLETE_INTEGRATION_FINAL.md
echo.

echo ================================================
pause
