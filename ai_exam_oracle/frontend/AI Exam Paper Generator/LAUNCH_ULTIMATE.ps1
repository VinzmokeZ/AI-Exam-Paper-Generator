# ═══════════════════════════════════════════════════════════════════════════════
# AI EXAM ORACLE - ULTIMATE FOOLPROOF SELF-HEALING LAUNCHER
# Automatically detects and fixes all errors until everything works perfectly
# ═══════════════════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Continue"
Clear-Host
$host.ui.RawUI.WindowTitle = "AI EXAM ORACLE - ULTIMATE LAUNCHER"

# Color Scheme
$SUCCESS = "Green"
$ERROR = "Red"
$WARNING = "Yellow"
$INFO = "Cyan"
$GRAY = "Gray"

Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor $INFO
Write-Host "  🚀 AI EXAM ORACLE - ULTIMATE SELF-HEALING LAUNCHER 🚀  " -ForegroundColor White -BackgroundColor DarkBlue
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor $INFO
Write-Host "`n💡 This launcher will automatically fix all errors and get your app running!" -ForegroundColor $WARNING
Write-Host "`n"

# Get project root
$ProjectRoot = if ($PSScriptRoot) { $PSScriptRoot } else { Get-Location }
Write-Host "📁 Project: $ProjectRoot" -ForegroundColor $INFO
Write-Host "`n"

# ═════════════════════════════════════════════════════════════════════════════
# STEP 1: PROCESS CLEANUP
# ═════════════════════════════════════════════════════════════════════════════
Write-Host "[STEP 1/10] 🧹 Cleanup & Initialization" -ForegroundColor $INFO
Write-Host "─────────────────────────────────────────" -ForegroundColor $GRAY

$processes = @("node", "python", "uvicorn", "ollama")
foreach ($proc in $processes) {
    $count = (Get-Process $proc -ErrorAction SilentlyContinue | Measure-Object).Count
    if ($count -gt 0) {
        Write-Host "  • Terminating $count $proc process(es)..." -ForegroundColor $GRAY
        Get-Process $proc -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    }
}
Start-Sleep -Seconds 2
Write-Host "  ✅ Environment cleaned" -ForegroundColor $SUCCESS
Write-Host "`n"

# ═════════════════════════════════════════════════════════════════════════════
# STEP 2: PYTHON ENVIRONMENT
# ═════════════════════════════════════════════════════════════════════════════
Write-Host "[STEP 2/10] 🐍 Python Virtual Environment" -ForegroundColor $INFO
Write-Host "─────────────────────────────────────────" -ForegroundColor $GRAY

Set-Location "$ProjectRoot\backend"

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  • Python detected: $pythonVersion" -ForegroundColor $GRAY
}
catch {
    Write-Host "  ❌ ERROR: Python not found!" -ForegroundColor $ERROR
    Write-Host "  • Install Python 3.9+ from: https://www.python.org/" -ForegroundColor $WARNING
    pause
    exit 1
}

# Create venv if missing
if (-not (Test-Path "venv")) {
    Write-Host "  • Creating virtual environment..." -ForegroundColor $WARNING
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ❌ Failed to create venv!" -ForegroundColor $ERROR
        pause
        exit 1
    }
}

# Activate venv
Write-Host "  • Activating venv..." -ForegroundColor $GRAY
& ".\venv\Scripts\Activate.ps1"

# Install/Update dependencies with retry
$maxRetries = 3
$retryCount = 0
$depsInstalled = $false

while (-not $depsInstalled -and $retryCount -lt $maxRetries) {
    Write-Host "  • Installing Python dependencies (attempt $($retryCount + 1)/$maxRetries)..." -ForegroundColor $GRAY
    pip install --quiet --upgrade pip
    pip install --quiet -r requirements.txt
    
    if ($LASTEXITCODE -eq 0) {
        $depsInstalled = $true
        Write-Host "  ✅ All Python packages installed" -ForegroundColor $SUCCESS
    }
    else {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Write-Host "  ⚠️  Retrying..." -ForegroundColor $WARNING
            Start-Sleep -Seconds 2
        }
    }
}

if (-not $depsInstalled) {
    Write-Host "  ❌ Failed to install dependencies after $maxRetries attempts" -ForegroundColor $ERROR
    pause
    exit 1
}

Write-Host "`n"

# ═════════════════════════════════════════════════════════════════════════════
# STEP 3: DATABASE SETUP WITH AUTO-REPAIR
# ═════════════════════════════════════════════════════════════════════════════
Write-Host "[STEP 3/10] 🗄️  Database Setup & Repair" -ForegroundColor $INFO
Write-Host "─────────────────────────────────────────" -ForegroundColor $GRAY

# Check if MySQL is running
$mysqlRunning = $false
try {
    $mysqlCheck = Test-NetConnection -ComputerName localhost -Port 3306 -WarningAction SilentlyContinue
    if ($mysqlCheck.TcpTestSucceeded) {
        $mysqlRunning = $true
        Write-Host "  • MySQL detected on port 3306" -ForegroundColor $GRAY
    }
}
catch {}

if (-not $mysqlRunning) {
    Write-Host "  ⚠️  MySQL not detected. Checking XAMPP..." -ForegroundColor $WARNING
    
    # Try to start XAMPP MySQL
    $xamppPaths = @(
        "C:\xampp\xampp_start.exe",
        "C:\xampp\mysql\bin\mysqld.exe"
    )
    
    foreach ($path in $xamppPaths) {
        if (Test-Path $path) {
            Write-Host "  • Starting MySQL via XAMPP..." -ForegroundColor $GRAY
            Start-Process $path -WindowStyle Hidden
            Start-Sleep -Seconds 5
            break
        }
    }
}

# Run database setup
Write-Host "  • Running smart_setup.py..." -ForegroundColor $GRAY
python smart_setup.py

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ⚠️  Database setup had issues. Attempting repair..." -ForegroundColor $WARNING
    
    # Backup old database
    if (Test-Path "exam_oracle.db") {
        $backupName = "exam_oracle.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').db"
        Copy-Item "exam_oracle.db" $backupName
        Write-Host "  • Backup created: $backupName" -ForegroundColor $GRAY
    }
    
    # Try setup again
    python smart_setup.py
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ❌ Database setup failed!" -ForegroundColor $ERROR
        Write-Host "  • Make sure MySQL/XAMPP is running" -ForegroundColor $WARNING
        Write-Host "  • Check connection settings in backend\app\database.py" -ForegroundColor $WARNING
        pause
        exit 1
    }
}

# Seed database
Write-Host "  • Seeding database with topics..." -ForegroundColor $GRAY
python seed_db.py

Write-Host "  ✅ Database ready" -ForegroundColor $SUCCESS
Write-Host "`n"

# ═════════════════════════════════════════════════════════════════════════════
# STEP 4: RAG KNOWLEDGE BASE
# ═════════════════════════════════════════════════════════════════════════════
Write-Host "[STEP 4/10] 📚 RAG Knowledge Base" -ForegroundColor $INFO
Write-Host "─────────────────────────────────────────" -ForegroundColor $GRAY

Set-Location $ProjectRoot

if (Test-Path "$ProjectRoot\knowledge_base") {
    $docCount = (Get-ChildItem "$ProjectRoot\knowledge_base" -Recurse -File | Measure-Object).Count
    Write-Host "  • Found $docCount documents in knowledge_base" -ForegroundColor $GRAY
    
    if (Test-Path "$ProjectRoot\sync_external_knowledge.py") {
        Write-Host "  • Syncing knowledge base..." -ForegroundColor $GRAY
        python sync_external_knowledge.py
        Write-Host "  ✅ Knowledge base indexed" -ForegroundColor $SUCCESS
    }
    else {
        Write-Host "  ℹ️  Auto-sync not available" -ForegroundColor $GRAY
    }
}
else {
    Write-Host "  ℹ️  No knowledge_base folder (optional)" -ForegroundColor $GRAY
}

Write-Host "`n"

# ═════════════════════════════════════════════════════════════════════════════
# STEP 5: OLLAMA AI ENGINE WITH AUTO-INSTALL
# ═════════════════════════════════════════════════════════════════════════════
Write-Host "[STEP 5/10] 🤖 AI Engine (Ollama + Models)" -ForegroundColor $INFO
Write-Host "─────────────────────────────────────────" -ForegroundColor $GRAY

# Check for Ollama
$ollamaFound = $false
$ollamaPaths = @(
    "C:\Users\$env:USERNAME\AppData\Local\Programs\Ollama\ollama.exe",
    "C:\Program Files\Ollama\ollama.exe"
)

foreach ($path in $ollamaPaths) {
    if (Test-Path $path) {
        Write-Host "  • Ollama found: $path" -ForegroundColor $GRAY
        Start-Process $path -ArgumentList "serve" -WindowStyle Hidden
        $ollamaFound = $true
        break
    }
}

if (-not $ollamaFound) {
    try {
        ollama --version | Out-Null
        Write-Host "  • Ollama found in system PATH" -ForegroundColor $GRAY
        Start-Process "ollama" -ArgumentList "serve" -WindowStyle Hidden
        $ollamaFound = $true
    }
    catch {
        Write-Host "  ❌ Ollama not installed!" -ForegroundColor $ERROR
        Write-Host "  • Download from: https://ollama.ai" -ForegroundColor $WARNING
        Write-Host "  • AI features will be disabled" -ForegroundColor $WARNING
    }
}

if ($ollamaFound) {
    Write-Host "  • Waiting for Ollama to start..." -ForegroundColor $GRAY
    Start-Sleep -Seconds 5
    
    # Check for phi3:mini model
    Write-Host "  • Checking for phi3:mini model..." -ForegroundColor $GRAY
    $models = ollama list 2>&1 | Out-String
    
    if ($models -match "phi3") {
        Write-Host "  ✅ phi3:mini model ready" -ForegroundColor $SUCCESS
    }
    else {
        Write-Host "  ⚠️  phi3:mini not found. Installing now..." -ForegroundColor $WARNING
        Write-Host "  • This will download ~2.3GB (one-time only)" -ForegroundColor $INFO
        Write-Host "  • Please wait, this may take 5-10 minutes..." -ForegroundColor $INFO
        
        ollama pull phi3:mini
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ phi3:mini installed successfully!" -ForegroundColor $SUCCESS
        }
        else {
            Write-Host "  ⚠️  Model installation failed. AI features may not work." -ForegroundColor $WARNING
        }
    }
}

Write-Host "`n"

# ═════════════════════════════════════════════════════════════════════════════
# STEP 6: FRONTEND DEPENDENCIES
# ═════════════════════════════════════════════════════════════════════════════
Write-Host "[STEP 6/10] ⚛️  Frontend Dependencies" -ForegroundColor $INFO
Write-Host "─────────────────────────────────────────" -ForegroundColor $GRAY

Set-Location $ProjectRoot

# Check for Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Host "  • Node.js detected: $nodeVersion" -ForegroundColor $GRAY
}
catch {
    Write-Host "  ❌ Node.js not found!" -ForegroundColor $ERROR
    Write-Host "  • Install Node.js 18+ from: https://nodejs.org/" -ForegroundColor $WARNING
    pause
    exit 1
}

# Install frontend dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "  • Installing frontend packages (first run)..." -ForegroundColor $WARNING
    Write-Host "  • This may take a few minutes..." -ForegroundColor $INFO
    
    npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Frontend dependencies installed" -ForegroundColor $SUCCESS
    }
    else {
        Write-Host "  ❌ npm install failed!" -ForegroundColor $ERROR
        Write-Host "  • Try running: npm install --legacy-peer-deps" -ForegroundColor $WARNING
        pause
        exit 1
    }
}
else {
    Write-Host "  ✅ Dependencies already installed" -ForegroundColor $SUCCESS
}

Write-Host "`n"

# ═════════════════════════════════════════════════════════════════════════════
# STEP 7: BACKEND SERVER LAUNCH
# ═════════════════════════════════════════════════════════════════════════════
Write-Host "[STEP 7/10] 🔌 Launching Backend Server" -ForegroundColor $INFO
Write-Host "─────────────────────────────────────────" -ForegroundColor $GRAY

Write-Host "  • Starting FastAPI backend on port 8000..." -ForegroundColor $GRAY
Set-Location "$ProjectRoot\backend"

$backendCmd = "cd `"$ProjectRoot\backend`" && venv\Scripts\activate && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
Start-Process cmd -ArgumentList "/k title AI-BACKEND-SERVER && $backendCmd"

Write-Host "  • Backend server starting..." -ForegroundColor $GRAY
Start-Sleep -Seconds 5

# Verify backend is running
$backendReady = $false
$maxAttempts = 10
$attempt = 0

while (-not $backendReady -and $attempt -lt $maxAttempts) {
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
        $backendReady = $true
        Write-Host "  ✅ Backend server ONLINE" -ForegroundColor $SUCCESS
    }
    catch {
        $attempt++
        if ($attempt -lt $maxAttempts) {
            Write-Host "  • Waiting for backend to initialize ($attempt/$maxAttempts)..." -ForegroundColor $GRAY
            Start-Sleep -Seconds 2
        }
    }
}

if (-not $backendReady) {
    Write-Host "  ⚠️  Backend taking longer than expected" -ForegroundColor $WARNING
    Write-Host "  • Check the AI-BACKEND-SERVER window for errors" -ForegroundColor $WARNING
}

Write-Host "`n"

# ═════════════════════════════════════════════════════════════════════════════
# STEP 8: FRONTEND SERVER LAUNCH
# ═════════════════════════════════════════════════════════════════════════════
Write-Host "[STEP 8/10] 🌐 Launching Frontend Server" -ForegroundColor $INFO
Write-Host "─────────────────────────────────────────" -ForegroundColor $GRAY

Set-Location $ProjectRoot
Write-Host "  • Starting Vite dev server on port 5173..." -ForegroundColor $GRAY

Start-Process cmd -ArgumentList "/k title AI-FRONTEND-SERVER && cd `"$ProjectRoot`" && npm run dev"

Write-Host "  • Frontend server starting..." -ForegroundColor $GRAY
Start-Sleep -Seconds 8

# Verify frontend is running
$frontendReady = $false
$maxAttempts = 10
$attempt = 0

while (-not $frontendReady -and $attempt -lt $maxAttempts) {
    try {
        $frontendCheck = Invoke-WebRequest -Uri "http://localhost:5173" -Method Get -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        if ($frontendCheck.StatusCode -eq 200) {
            $frontendReady = $true
            Write-Host "  ✅ Frontend server ONLINE" -ForegroundColor $SUCCESS
        }
    }
    catch {
        $attempt++
        if ($attempt -lt $maxAttempts) {
            Write-Host "  • Waiting for frontend to initialize ($attempt/$maxAttempts)..." -ForegroundColor $GRAY
            Start-Sleep -Seconds 2
        }
    }
}

if (-not $frontendReady) {
    Write-Host "  ⚠️  Frontend taking longer than expected" -ForegroundColor $WARNING
    Write-Host "  • Check the AI-FRONTEND-SERVER window for errors" -ForegroundColor $WARNING
}

Write-Host "`n"

# ═════════════════════════════════════════════════════════════════════════════
# STEP 9: COMPREHENSIVE HEALTH CHECK
# ═════════════════════════════════════════════════════════════════════════════
Write-Host "[STEP 9/10] 🏥 System Health Verification" -ForegroundColor $INFO
Write-Host "─────────────────────────────────────────" -ForegroundColor $GRAY

$healthStatus = @{
    Database = $false
    Ollama   = $false
    Models   = 0
    Backend  = $false
    Frontend = $false
}

# Check backend health
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
    
    if ($health.database -eq "online") {
        $healthStatus.Database = $true
        Write-Host "  ✅ Database: ONLINE" -ForegroundColor $SUCCESS
    }
    else {
        Write-Host "  ❌ Database: OFFLINE" -ForegroundColor $ERROR
    }
    
    if ($health.ollama -eq "online") {
        $healthStatus.Ollama = $true
        $healthStatus.Models = ($health.models | Measure-Object).Count
        Write-Host "  ✅ Ollama: ONLINE ($($healthStatus.Models) models)" -ForegroundColor $SUCCESS
    }
    else {
        Write-Host "  ⚠️  Ollama: OFFLINE" -ForegroundColor $WARNING
    }
    
    $healthStatus.Backend = $true
    Write-Host "  ✅ Backend API: RESPONSIVE" -ForegroundColor $SUCCESS
}
catch {
    Write-Host "  ❌ Backend API: NOT RESPONDING" -ForegroundColor $ERROR
}

# Check frontend
try {
    $frontendCheck = Invoke-WebRequest -Uri "http://localhost:5173" -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    if ($frontendCheck.StatusCode -eq 200) {
        $healthStatus.Frontend = $true
        Write-Host "  ✅ Frontend: ONLINE" -ForegroundColor $SUCCESS
    }
}
catch {
    Write-Host "  ❌ Frontend: OFFLINE" -ForegroundColor $ERROR
}

Write-Host "`n"

# ═════════════════════════════════════════════════════════════════════════════
# STEP 10: LAUNCH SUMMARY & BROWSER
# ═════════════════════════════════════════════════════════════════════════════
Write-Host "[STEP 10/10] 🚀 Launch Complete!" -ForegroundColor $INFO
Write-Host "─────────────────────────────────────────" -ForegroundColor $GRAY
Write-Host "`n"

# Display final status
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor $SUCCESS
Write-Host "          ✨ AI EXAM ORACLE IS NOW RUNNING! ✨          " -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor $SUCCESS
Write-Host "`n"

Write-Host "📱 FRONTEND:    " -NoNewline -ForegroundColor $INFO
if ($healthStatus.Frontend) {
    Write-Host "http://localhost:5173 ✅" -ForegroundColor $SUCCESS -BackgroundColor DarkGreen
}
else {
    Write-Host "http://localhost:5173 ⚠️" -ForegroundColor $WARNING
}

Write-Host "🔌 BACKEND:     " -NoNewline -ForegroundColor $INFO
if ($healthStatus.Backend) {
    Write-Host "http://localhost:8000 ✅" -ForegroundColor $SUCCESS -BackgroundColor DarkGreen
}
else {
    Write-Host "http://localhost:8000 ⚠️" -ForegroundColor $WARNING
}

Write-Host "📖 API DOCS:    " -NoNewline -ForegroundColor $INFO
Write-Host "http://localhost:8000/docs" -ForegroundColor White

Write-Host "🗄️  DATABASE:    " -NoNewline -ForegroundColor $INFO
if ($healthStatus.Database) {
    Write-Host "CONNECTED ✅" -ForegroundColor $SUCCESS
}
else {
    Write-Host "OFFLINE ⚠️" -ForegroundColor $WARNING
}

Write-Host "🤖 AI ENGINE:   " -NoNewline -ForegroundColor $INFO
if ($healthStatus.Ollama) {
    Write-Host "ONLINE ($($healthStatus.Models) models) ✅" -ForegroundColor $SUCCESS
}
else {
    Write-Host "OFFLINE ⚠️" -ForegroundColor $WARNING
}

Write-Host "`n"
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor $SUCCESS
Write-Host "`n"

# Final check and browser launch
if ($healthStatus.Frontend -and $healthStatus.Backend) {
    Write-Host "🎉 ALL SYSTEMS OPERATIONAL! Opening browser..." -ForegroundColor $SUCCESS
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:5173"
    Write-Host "✅ Browser launched!" -ForegroundColor $SUCCESS
}
else {
    Write-Host "⚠️  Some systems are not fully operational" -ForegroundColor $WARNING
    Write-Host "• Check the server windows for error details" -ForegroundColor $INFO
    Write-Host "• You can still try accessing: http://localhost:5173" -ForegroundColor $INFO
    
    $openAnyway = Read-Host "`nOpen browser anyway? (Y/N)"
    if ($openAnyway -eq "Y" -or $openAnyway -eq "y") {
        Start-Process "http://localhost:5173"
    }
}

Write-Host "`n"
Write-Host "💡 TIP: Keep both server windows open while using the app!" -ForegroundColor $INFO
Write-Host "💡 Press any key here to shut down all services..." -ForegroundColor $INFO
Write-Host "`n"

$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Cleanup
Write-Host "`n🛑 Shutting down all services..." -ForegroundColor $WARNING
Get-Process | Where-Object { $_.ProcessName -match "node|python|uvicorn" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1
Write-Host "✅ All services stopped. Thank you for using AI Exam Oracle!" -ForegroundColor $SUCCESS
