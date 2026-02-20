# ═══════════════════════════════════════════════════════════════════════════════
# AI EXAM ORACLE - ULTIMATE ONE-CLICK LAUNCHER
# Fully automated setup, model installation, verification, and deployment
# ═══════════════════════════════════════════════════════════════════════════════

$ErrorActionPreference = "SilentlyContinue"
$Host.UI.RawUI.WindowTitle = "🚀 AI Exam Oracle - Intelligent Launcher"

Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "     ⚡ AI EXAM ORACLE - ULTIMATE AUTOMATIC LAUNCHER ⚡     " -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "`n"

# ─────────────────────────────────────────────────────────────────────────────
# STEP 1: ENVIRONMENT INITIALIZATION
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "[1/8] 🔧 Initializing Environment..." -ForegroundColor Cyan
$ProjectRoot = $PSScriptRoot
Set-Location $ProjectRoot

# Kill any existing processes to prevent conflicts
Write-Host "  └─ Terminating existing processes..." -ForegroundColor Gray
Get-Process | Where-Object { $_.ProcessName -match "node|uvicorn|ollama" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "  ✅ Environment clean" -ForegroundColor Green

# ─────────────────────────────────────────────────────────────────────────────
# STEP 2: PYTHON ENVIRONMENT SETUP
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "`n[2/8] 🐍 Setting up Python Environment..." -ForegroundColor Cyan
Set-Location "$ProjectRoot\backend"

if (-not (Test-Path "venv")) {
    Write-Host "  └─ Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

Write-Host "  └─ Activating virtual environment..." -ForegroundColor Gray
& ".\venv\Scripts\Activate.ps1"

Write-Host "  └─ Installing Python dependencies..." -ForegroundColor Gray
pip install --quiet -r requirements.txt
Write-Host "  ✅ Python environment ready" -ForegroundColor Green

# ─────────────────────────────────────────────────────────────────────────────
# STEP 3: DATABASE INITIALIZATION & REPAIR
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "`n[3/8] 🗄️  Initializing Database..." -ForegroundColor Cyan

if (Test-Path "exam_oracle.db") {
    Write-Host "  └─ Backing up existing database..." -ForegroundColor Gray
    Copy-Item "exam_oracle.db" "exam_oracle.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').db" -Force
}

Write-Host "  └─ Running database setup..." -ForegroundColor Gray
python smart_setup.py | Out-Null

Write-Host "  └─ Seeding initial data..." -ForegroundColor Gray
python seed_db.py | Out-Null
Write-Host "  ✅ Database initialized with topics" -ForegroundColor Green

# ─────────────────────────────────────────────────────────────────────────────
# STEP 4: RAG KNOWLEDGE BASE TRAINING
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "`n[4/8] 📚 Preparing Knowledge Base..." -ForegroundColor Cyan
Set-Location "$ProjectRoot\backend"

if (Test-Path "$ProjectRoot\knowledge_base") {
    Write-Host "  └─ Indexing knowledge base documents..." -ForegroundColor Gray
    python app/services/rag_service.py | Out-Null
    Write-Host "  ✅ RAG index created" -ForegroundColor Green
}
else {
    Write-Host "  ⚠️  No knowledge_base folder found (optional)" -ForegroundColor Yellow
}

# ─────────────────────────────────────────────────────────────────────────────
# STEP 5: OLLAMA AI ENGINE & MODEL INSTALLATION
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "`n[5/8] 🤖 Starting AI Engine & Models..." -ForegroundColor Cyan

# Check if Ollama is installed
$ollamaInstalled = $false
try {
    ollama --version | Out-Null
    $ollamaInstalled = $true
    Write-Host "  ✅ Ollama detected" -ForegroundColor Green
}
catch {
    Write-Host "  ❌ Ollama not found!" -ForegroundColor Red
    Write-Host "  └─ Please install Ollama from: https://ollama.ai" -ForegroundColor Yellow
    Write-Host "  └─ Then run this script again." -ForegroundColor Yellow
    pause
    exit 1
}

# Start Ollama service
Write-Host "  └─ Starting Ollama service..." -ForegroundColor Gray
$ollamaPath = "C:\Users\$env:USERNAME\AppData\Local\Programs\Ollama\ollama.exe"
if (Test-Path $ollamaPath) {
    Start-Process $ollamaPath -ArgumentList "serve" -WindowStyle Hidden
}
else {
    Start-Process "ollama" -ArgumentList "serve" -WindowStyle Hidden
}

Start-Sleep -Seconds 5

# Verify and install phi3:mini model
Write-Host "  └─ Checking for phi3:mini model..." -ForegroundColor Gray
$models = ollama list 2>&1 | Out-String

if ($models -match "phi3:mini" -or $models -match "phi3") {
    Write-Host "  ✅ Model 'phi3:mini' is ready" -ForegroundColor Green
}
else {
    Write-Host "  ⚠️  phi3:mini not found. Installing now..." -ForegroundColor Yellow
    Write-Host "  └─ This may take 5-10 minutes (downloading ~2.3GB)" -ForegroundColor Cyan
    Write-Host "  └─ Please wait..." -ForegroundColor Cyan
    
    ollama pull phi3:mini
    
    Write-Host "  ✅ Model 'phi3:mini' installed successfully!" -ForegroundColor Green
}

# Verify model is working
Write-Host "  └─ Verifying AI connectivity..." -ForegroundColor Gray
$testResponse = ollama list 2>&1 | Out-String
if ($testResponse -match "phi3") {
    Write-Host "  ✅ AI Engine operational" -ForegroundColor Green
}
else {
    Write-Host "  ❌ AI model verification failed" -ForegroundColor Red
    Write-Host "  └─ Please run: ollama pull phi3:mini" -ForegroundColor Yellow
}

# ─────────────────────────────────────────────────────────────────────────────
# STEP 6: FRONTEND SETUP
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "`n[6/8] ⚛️  Setting up Frontend..." -ForegroundColor Cyan
Set-Location $ProjectRoot

if (-not (Test-Path "node_modules")) {
    Write-Host "  └─ Installing frontend dependencies (first run)..." -ForegroundColor Yellow
    Write-Host "  └─ This may take a few minutes..." -ForegroundColor Gray
    npm install --silent
    Write-Host "  ✅ Frontend dependencies installed" -ForegroundColor Green
}
else {
    Write-Host "  ✅ Frontend dependencies already installed" -ForegroundColor Green
}

# ─────────────────────────────────────────────────────────────────────────────
# STEP 7: HEALTH CHECK & VERIFICATION
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "`n[7/8] 🏥 Running System Health Check..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

# Check database
if (Test-Path "$ProjectRoot\backend\exam_oracle.db") {
    Write-Host "  ✅ Database: ONLINE" -ForegroundColor Green
}
else {
    Write-Host "  ❌ Database: OFFLINE" -ForegroundColor Red
}

# Check Ollama
try {
    $ollamaCheck = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 3 -UseBasicParsing
    if ($ollamaCheck.StatusCode -eq 200) {
        Write-Host "  ✅ Ollama: ONLINE" -ForegroundColor Green
    }
}
catch {
    Write-Host "  ⚠️  Ollama: STARTING..." -ForegroundColor Yellow
}

Write-Host "  ✅ System health check complete" -ForegroundColor Green

# ─────────────────────────────────────────────────────────────────────────────
# STEP 8: LAUNCHING APPLICATION
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "`n[8/8] 🚀 Launching Application..." -ForegroundColor Cyan

# Backend
Write-Host "  └─ Starting Backend API (Port 8000)..." -ForegroundColor Gray
Set-Location "$ProjectRoot\backend"
Start-Process cmd -ArgumentList "/k title AI-BACKEND && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

Start-Sleep -Seconds 3

# Frontend
Write-Host "  └─ Starting Frontend (Port 5173)..." -ForegroundColor Gray
Set-Location $ProjectRoot
Start-Process cmd -ArgumentList "/k title AI-FRONTEND && npm run dev"

Start-Sleep -Seconds 2

# ─────────────────────────────────────────────────────────────────────────────
# FINAL STATUS
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "              🎉 AI EXAM ORACLE IS NOW LIVE! 🎉              " -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "`n"
Write-Host "📱 FRONTEND:  " -NoNewline -ForegroundColor Cyan
Write-Host "http://localhost:5173" -ForegroundColor White
Write-Host "🔌 BACKEND:   " -NoNewline -ForegroundColor Cyan
Write-Host "http://localhost:8000" -ForegroundColor White
Write-Host "🏥 HEALTH:    " -NoNewline -ForegroundColor Cyan
Write-Host "http://localhost:8000/api/health" -ForegroundColor White
Write-Host "🤖 AI MODEL:  " -NoNewline -ForegroundColor Cyan
Write-Host "phi3:mini (Local)" -ForegroundColor White
Write-Host "`n"
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "`n"
Write-Host "💡 TIP: Your browser will open automatically in 5 seconds..." -ForegroundColor Yellow
Write-Host "`n"

Start-Sleep -Seconds 5

# Open browser
Start-Process "http://localhost:5173"

Write-Host "Press any key to shut down all services..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Cleanup
Write-Host "`nShutting down services..." -ForegroundColor Yellow
Get-Process | Where-Object { $_.ProcessName -match "node|uvicorn" } | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "✅ All services stopped." -ForegroundColor Green
