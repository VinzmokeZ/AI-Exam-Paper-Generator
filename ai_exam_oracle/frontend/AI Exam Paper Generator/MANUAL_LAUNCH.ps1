# ═══════════════════════════════════════════════════════════════════════════════
# AI EXAM ORACLE - WORKING MANUAL LAUNCHER (ALL BUGS FIXED)
# Usage: powershell -ExecutionPolicy Bypass -File .\MANUAL_LAUNCH.ps1
# ═══════════════════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Continue"
Clear-Host
$host.ui.RawUI.WindowTitle = "AI EXAM ORACLE - MANUAL LAUNCHER"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "     AI EXAM ORACLE - MANUAL LAUNCHER (DEBUG MODE)       " -ForegroundColor White -BackgroundColor DarkCyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory properly
if ($PSScriptRoot) {
    $ProjectRoot = $PSScriptRoot
}
else {
    $ProjectRoot = Get-Location
}

Write-Host "📁 Project Root: $ProjectRoot" -ForegroundColor Cyan
Write-Host ""

# --- 1. CLEANUP OLD PROCESSES ---
Write-Host "[1/8] 🧹 Cleaning up existing processes..." -ForegroundColor Yellow
$processes = @("node", "python", "uvicorn")
foreach ($proc in $processes) {
    $count = (Get-Process $proc -ErrorAction SilentlyContinue | Measure-Object).Count
    if ($count -gt 0) {
        Write-Host "  └─ Killing $count $proc process(es)..." -ForegroundColor Gray
        Get-Process $proc -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    }
}
Start-Sleep -Seconds 2
Write-Host "  ✅ Cleanup complete" -ForegroundColor Green
Write-Host ""

# --- 2. PYTHON VENV SETUP ---
Write-Host "[2/8] � Setting up Python environment..." -ForegroundColor Yellow
Set-Location "$ProjectRoot\backend"

if (-not (Test-Path "venv")) {
    Write-Host "  └─ Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

Write-Host "  └─ Activating venv and installing dependencies..." -ForegroundColor Gray
& ".\venv\Scripts\Activate.ps1"
pip install --quiet -r requirements.txt
Write-Host "  ✅ Python environment ready" -ForegroundColor Green
Write-Host ""

# --- 3. DATABASE SETUP ---
Write-Host "[3/8] 🗄️  Setting up database..." -ForegroundColor Yellow

Write-Host "  └─ Running smart_setup.py..." -ForegroundColor Gray
python smart_setup.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Database setup failed!" -ForegroundColor Red
    Write-Host "  └─ Make sure MySQL/XAMPP is running" -ForegroundColor Yellow
    Write-Host "  └─ Check if MySQL is on port 3306" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "  └─ Running seed_db.py..." -ForegroundColor Gray
python seed_db.py
Write-Host "  ✅ Database ready with topics" -ForegroundColor Green
Write-Host ""

# --- 4. KNOWLEDGE BASE (OPTIONAL) ---
Write-Host "[4/8] 📚 Checking knowledge base..." -ForegroundColor Yellow
Set-Location $ProjectRoot
if (Test-Path "$ProjectRoot\knowledge_base") {
    if (Test-Path "$ProjectRoot\sync_external_knowledge.py") {
        Write-Host "  └─ Syncing external knowledge..." -ForegroundColor Gray
        python sync_external_knowledge.py
        Write-Host "  ✅ Knowledge synced" -ForegroundColor Green
    }
    else {
        Write-Host "  ℹ️  sync_external_knowledge.py not found (skipping)" -ForegroundColor Gray
    }
}
else {
    Write-Host "  ℹ️  No knowledge_base folder (optional)" -ForegroundColor Gray
}
Write-Host ""

# --- 5. OLLAMA AI ENGINE ---
Write-Host "[5/8] 🤖 Starting Ollama AI Engine..." -ForegroundColor Yellow
$ollamaPath = "C:\Users\$env:USERNAME\AppData\Local\Programs\Ollama\ollama.exe"

# Try multiple Ollama locations
$ollamaFound = $false
if (Test-Path $ollamaPath) {
    Write-Host "  └─ Starting Ollama from: $ollamaPath" -ForegroundColor Gray
    Start-Process $ollamaPath -ArgumentList "serve" -WindowStyle Hidden
    $ollamaFound = $true
}
else {
    # Try generic ollama command
    try {
        ollama --version | Out-Null
        Write-Host "  └─ Starting Ollama (system PATH)..." -ForegroundColor Gray
        Start-Process "ollama" -ArgumentList "serve" -WindowStyle Hidden
        $ollamaFound = $true
    }
    catch {
        Write-Host "  ❌ Ollama not found!" -ForegroundColor Red
        Write-Host "  └─ Install from: https://ollama.ai" -ForegroundColor Yellow
        Write-Host "  └─ AI features will not work without it" -ForegroundColor Yellow
    }
}

if ($ollamaFound) {
    Start-Sleep -Seconds 3
    Write-Host "  └─ Checking for phi3:mini model..." -ForegroundColor Gray
    $models = ollama list 2>&1 | Out-String
    if ($models -match "phi3") {
        Write-Host "  ✅ Ollama + phi3:mini ready" -ForegroundColor Green
    }
    else {
        Write-Host "  ⚠️  phi3:mini not found" -ForegroundColor Yellow
        Write-Host "  └─ Run: ollama pull phi3:mini" -ForegroundColor Yellow
    }
}
Write-Host ""

# --- 6. FRONTEND DEPENDENCIES ---
Write-Host "[6/8] ⚛️  Checking frontend dependencies..." -ForegroundColor Yellow
Set-Location $ProjectRoot

if (-not (Test-Path "node_modules")) {
    Write-Host "  └─ Installing frontend dependencies..." -ForegroundColor Yellow
    Write-Host "  └─ This may take a few minutes on first run..." -ForegroundColor Gray
    npm install
    Write-Host "  ✅ Dependencies installed" -ForegroundColor Green
}
else {
    Write-Host "  ✅ Dependencies OK" -ForegroundColor Green
}
Write-Host ""

# --- 7. LAUNCHING SERVERS ---
Write-Host "[7/8] 🚀 Launching servers..." -ForegroundColor Yellow

# Backend
Write-Host "  └─ Starting Backend API (Port 8000)..." -ForegroundColor Gray
Set-Location "$ProjectRoot\backend"
Start-Process cmd -ArgumentList "/k title AI-BACKEND && cd `"$ProjectRoot\backend`" && venv\Scripts\activate && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

Start-Sleep -Seconds 3

# Frontend
Write-Host "  └─ Starting Frontend Dev Server (Port 5173)..." -ForegroundColor Gray
Set-Location $ProjectRoot
Start-Process cmd -ArgumentList "/k title AI-FRONTEND && cd `"$ProjectRoot`" && npm run dev"

Write-Host "  └─ Waiting for servers to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 10
Write-Host "  ✅ Servers launched" -ForegroundColor Green
Write-Host ""

# --- 8. HEALTH CHECK ---
Write-Host "[8/8] 🏥 Running health check..." -ForegroundColor Yellow

# Check Backend
try {
    Write-Host "  └─ Checking backend API..." -ForegroundColor Gray
    $health = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
    
    if ($health.database -eq "online") {
        Write-Host "  ✅ Database: ONLINE" -ForegroundColor Green
    }
    else {
        Write-Host "  ❌ Database: OFFLINE" -ForegroundColor Red
    }
    
    if ($health.ollama -eq "online") {
        $modelCount = ($health.models | Measure-Object).Count
        Write-Host "  ✅ Ollama: ONLINE ($modelCount models)" -ForegroundColor Green
    }
    else {
        Write-Host "  ⚠️  Ollama: OFFLINE" -ForegroundColor Yellow
    }
    
    Write-Host "  ✅ Backend API: RESPONSIVE" -ForegroundColor Green
}
catch {
    Write-Host "  ❌ Backend API: NOT RESPONDING" -ForegroundColor Red
    Write-Host "  └─ Check the AI-BACKEND window for errors" -ForegroundColor Yellow
}

# Check Frontend
try {
    Write-Host "  └─ Checking frontend server..." -ForegroundColor Gray
    $frontendCheck = Invoke-WebRequest -Uri "http://localhost:5173" -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    if ($frontendCheck.StatusCode -eq 200) {
        Write-Host "  ✅ Frontend: ONLINE" -ForegroundColor Green
    }
}
catch {
    Write-Host "  ⚠️  Frontend: STARTING (wait a moment)" -ForegroundColor Yellow
}

Write-Host ""

# --- FINAL OUTPUT ---
Write-Host "============================================================" -ForegroundColor Green
Write-Host "          🎉 AI EXAM ORACLE IS NOW RUNNING! 🎉          " -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "📱 FRONTEND:    " -NoNewline -ForegroundColor Cyan
Write-Host "http://localhost:5173" -ForegroundColor White -BackgroundColor Blue
Write-Host "🔌 BACKEND:     " -NoNewline -ForegroundColor Cyan
Write-Host "http://localhost:8000" -ForegroundColor White -BackgroundColor Blue
Write-Host "📖 API DOCS:    " -NoNewline -ForegroundColor Cyan
Write-Host "http://localhost:8000/docs" -ForegroundColor White -BackgroundColor Blue
Write-Host "🏥 HEALTH:      " -NoNewline -ForegroundColor Cyan
Write-Host "http://localhost:8000/api/health" -ForegroundColor White -BackgroundColor Blue
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Opening browser in 3 seconds..." -ForegroundColor Yellow
Write-Host "💡 Keep both console windows (AI-BACKEND and AI-FRONTEND) open!" -ForegroundColor Yellow
Write-Host ""

Start-Sleep -Seconds 3

# Auto-open browser
Start-Process "http://localhost:5173"

Write-Host "✅ Browser opened! Your app should be loading now." -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to shut down all services..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Cleanup on exit
Write-Host "`nShutting down..." -ForegroundColor Yellow
Get-Process | Where-Object { $_.ProcessName -match "node|python|uvicorn" } | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "✅ All services stopped. Goodbye!" -ForegroundColor Green
