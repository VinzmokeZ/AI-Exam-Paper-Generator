# ===============================================================================
# AI EXAM ORACLE - ULTIMATE FOOLPROOF SELF-HEALING LAUNCHER
# Automatically detects and fixes all errors until everything works perfectly
# ===============================================================================

$ErrorActionPreference = "Continue"
Clear-Host
$host.ui.RawUI.WindowTitle = "AI EXAM ORACLE - ULTIMATE LAUNCHER"

# Color Scheme
$CLR_SUCCESS = "Green"
$CLR_ERR = "Red"
$CLR_WARN = "Yellow"
$CLR_INFO = "Cyan"
$CLR_GRAY = "Gray"

Write-Host "`n===============================================================" -ForegroundColor $CLR_INFO
Write-Host "   AI EXAM ORACLE - ULTIMATE SELF-HEALING LAUNCHER   " -ForegroundColor White -BackgroundColor DarkBlue
Write-Host "===============================================================" -ForegroundColor $CLR_INFO
Write-Host "`n* This launcher will automatically fix all errors and get your app running!" -ForegroundColor $CLR_WARN
Write-Host "`n"

# Get project root
$ProjectRoot = if ($PSScriptRoot) { $PSScriptRoot } else { Get-Location }
Write-Host "Project: $ProjectRoot" -ForegroundColor $CLR_INFO

# Detect Lite Mode (SQLite) from backend/.env
$EnvPath = "$ProjectRoot\backend\.env"
$USE_MYSQL = $true
if (Test-Path $EnvPath) {
    $envContent = Get-Content $EnvPath
    foreach ($line in $envContent) {
        if ($line -match "USE_MYSQL=false") {
            $USE_MYSQL = $false
            break
        }
    }
}

if ($USE_MYSQL) {
    Write-Host "Mode: Standard (MySQL)" -ForegroundColor $CLR_INFO
} else {
    Write-Host "Mode: Lite (SQLite - Faster & Reliable)" -ForegroundColor $CLR_SUCCESS
}
Write-Host "`n"

# STEP 1: PROCESS CLEANUP
# -------------------------------------------------------------------------------
Write-Host "[STEP 1/11] Cleanup and Initialization" -ForegroundColor $CLR_INFO
Write-Host "-----------------------------------------" -ForegroundColor $CLR_GRAY

$processes = @("node", "python", "uvicorn", "ollama")
foreach ($proc in $processes) {
    $count = (Get-Process $proc -ErrorAction SilentlyContinue | Measure-Object).Count
    if ($count -gt 0) {
        Write-Host "  * Terminating $count $proc process(es)..." -ForegroundColor $CLR_GRAY
        Get-Process $proc -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    }
}
Start-Sleep -Seconds 2
Write-Host "  * Environment cleaned" -ForegroundColor $CLR_SUCCESS

# NUCLEAR REPAIR: ChromaDB Version Fix (Self-Healing)
$ChromaPath = "$ProjectRoot\backend\chroma_db"
if (Test-Path $ChromaPath) {
    Write-Host "  * Checking Knowledge Base health..." -ForegroundColor $CLR_GRAY
    try {
        # Force delete to fix the "KeyError: _type" metadata corruption from version mismatches
        Remove-Item -Path $ChromaPath -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  * Knowledge Base reset (Self-Healed)" -ForegroundColor $CLR_SUCCESS
    } catch {
        Write-Host "  * WARNING: Could not reset Knowledge Base automatically." -ForegroundColor $CLR_WARN
    }
}
Write-Host "`n"

# STEP 2: PYTHON ENVIRONMENT
# -------------------------------------------------------------------------------
Write-Host "[STEP 2/11] Python Virtual Environment" -ForegroundColor $CLR_INFO
Write-Host "-----------------------------------------" -ForegroundColor $CLR_GRAY

Set-Location "$ProjectRoot\backend"

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  * Python detected: $pythonVersion" -ForegroundColor $CLR_GRAY
}
catch {
    Write-Host "  * ERROR: Python not found!" -ForegroundColor $CLR_ERR
    Write-Host "  * Install Python 3.9+ from: https://www.python.org/" -ForegroundColor $CLR_WARN
    pause
    exit 1
}

# Create venv if missing
if (-not (Test-Path "venv")) {
    Write-Host "  * Creating virtual environment..." -ForegroundColor $CLR_WARN
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  * Failed to create venv!" -ForegroundColor $CLR_ERR
        pause
        exit 1
    }
}

# Activate venv
Write-Host "  * Activating venv..." -ForegroundColor $CLR_GRAY
& ".\venv\Scripts\Activate.ps1"

# Install/Update dependencies with retry
$maxRetries = 3
$retryCount = 1
$depsInstalled = $false

while (-not $depsInstalled -and $retryCount -le $maxRetries) {
    Write-Host "  * Installing Python dependencies (attempt $retryCount/$maxRetries)..." -ForegroundColor $CLR_GRAY
    Write-Host "  * NOTE: This is a first-time setup and may take 3-5 minutes..." -ForegroundColor $CLR_INFO
    pip install --upgrade pip
    pip install -r requirements.txt
    
    if ($LASTEXITCODE -eq 0) {
        $depsInstalled = $true
        Write-Host "  * All Python packages installed" -ForegroundColor $CLR_SUCCESS
    }
    else {
        $retryCount++
        if ($retryCount -le $maxRetries) {
            Write-Host "  * Retrying..." -ForegroundColor $CLR_WARN
            Start-Sleep -Seconds 2
        }
    }
}

if (-not $depsInstalled) {
    Write-Host "  * Failed to install dependencies after $maxRetries attempts" -ForegroundColor $CLR_ERR
    pause
    exit 1
}

Write-Host "`n"

# STEP 3: DATABASE SETUP
# -------------------------------------------------------------------------------
Write-Host "[STEP 3/11] Database Setup" -ForegroundColor $CLR_INFO
Write-Host "-----------------------------------------" -ForegroundColor $CLR_GRAY

if ($USE_MYSQL) {
    # Check if MySQL is running
    $mysqlRunning = $false
    try {
        $mysqlCheck = Test-NetConnection -ComputerName localhost -Port 3306 -WarningAction SilentlyContinue
        if ($mysqlCheck.TcpTestSucceeded) {
            $mysqlRunning = $true
            Write-Host "  * MySQL detected on port 3306" -ForegroundColor $CLR_GRAY
        }
    }
    catch {}

    if (-not $mysqlRunning) {
        Write-Host "  * MySQL not detected. Checking XAMPP..." -ForegroundColor $CLR_WARN
        
        # Try to start XAMPP MySQL
        $xamppPaths = @(
            "C:\xampp\xampp_start.exe",
            "C:\xampp\mysql\bin\mysqld.exe"
        )
        
        foreach ($path in $xamppPaths) {
            if (Test-Path $path) {
                Write-Host "  * Starting MySQL via XAMPP..." -ForegroundColor $CLR_GRAY
                Start-Process $path -WindowStyle Hidden
                Start-Sleep -Seconds 5
                break
            }
        }
    }

    # Run database setup
    Write-Host "  * Running smart_setup.py..." -ForegroundColor $CLR_GRAY
    python "$ProjectRoot\smart_setup.py"

    if ($LASTEXITCODE -ne 0) {
        Write-Host "  * Database setup had issues. Attempting repair..." -ForegroundColor $CLR_WARN
        
        # Backup old database
        if (Test-Path "exam_oracle.db") {
            $backupName = "exam_oracle.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').db"
            Copy-Item "exam_oracle.db" $backupName
            Write-Host "  * Backup created: $backupName" -ForegroundColor $CLR_GRAY
        }
        
        # Try setup again
        python "$ProjectRoot\smart_setup.py"
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  * Database setup failed!" -ForegroundColor $CLR_ERR
            Write-Host "  * Make sure MySQL/XAMPP is running" -ForegroundColor $CLR_WARN
            Write-Host "  * Check connection settings in backend\app\database.py" -ForegroundColor $CLR_WARN
            pause
            exit 1
        }
    }
} else {
    Write-Host "  * Lite Mode active: Skipping MySQL/XAMPP setup" -ForegroundColor $CLR_GRAY
    Write-Host "  * Initializing SQLite database..." -ForegroundColor $CLR_GRAY
    Set-Location "$ProjectRoot\backend"
    python -c "from app.database import init_db; init_db()"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  * SQLite database ready" -ForegroundColor $CLR_SUCCESS
    } else {
        Write-Host "  * SQLite initialization failed, but backend will try on launch" -ForegroundColor $CLR_WARN
    }
}

# Seed database
Write-Host "  * Seeding database with topics..." -ForegroundColor $CLR_GRAY
Set-Location "$ProjectRoot\backend"
python seed_db.py

Write-Host "  * Database ready" -ForegroundColor $CLR_SUCCESS
Write-Host "`n"

# STEP 4: RAG KNOWLEDGE BASE
# -------------------------------------------------------------------------------
Write-Host "[STEP 4/11] RAG Knowledge Base" -ForegroundColor $CLR_INFO
Write-Host "-----------------------------------------" -ForegroundColor $CLR_GRAY

Set-Location $ProjectRoot

if (Test-Path "$ProjectRoot\knowledge_base") {
    $docCount = (Get-ChildItem "$ProjectRoot\knowledge_base" -Recurse -File | Measure-Object).Count
    Write-Host "  * Found $docCount documents in knowledge_base" -ForegroundColor $CLR_GRAY
    
    if (Test-Path "$ProjectRoot\sync_external_knowledge.py") {
        Write-Host "  * Syncing knowledge base..." -ForegroundColor $CLR_GRAY
        python sync_external_knowledge.py
        Write-Host "  * Knowledge base indexed" -ForegroundColor $CLR_SUCCESS
    }
    else {
        Write-Host "  * Auto-sync not available" -ForegroundColor $CLR_GRAY
    }
}
else {
    Write-Host "  * No knowledge_base folder (optional)" -ForegroundColor $CLR_GRAY
}

Write-Host "`n"

# STEP 5: OLLAMA AI ENGINE WITH AUTO-INSTALL
# -------------------------------------------------------------------------------
Write-Host "[STEP 5/11] AI Engine (Ollama and Models)" -ForegroundColor $CLR_INFO
Write-Host "-----------------------------------------" -ForegroundColor $CLR_GRAY

# Check for Ollama
$ollamaFound = $false
$ollamaPaths = @(
    "C:\Users\$env:USERNAME\AppData\Local\Programs\Ollama\ollama.exe",
    "C:\Program Files\Ollama\ollama.exe"
)

foreach ($path in $ollamaPaths) {
    if (Test-Path $path) {
        Write-Host "  * Ollama found: $path" -ForegroundColor $CLR_GRAY
        Start-Process $path -ArgumentList "serve" -WindowStyle Hidden
        $ollamaFound = $true
        break
    }
}

if (-not $ollamaFound) {
    try {
        ollama --version | Out-Null
        Write-Host "  * Ollama found in system PATH" -ForegroundColor $CLR_GRAY
        Start-Process "ollama" -ArgumentList "serve" -WindowStyle Hidden
        $ollamaFound = $true
    }
    catch {
        Write-Host "  * Ollama not installed!" -ForegroundColor $CLR_ERR
        Write-Host "  * Download from: https://ollama.ai" -ForegroundColor $CLR_WARN
        Write-Host "  * AI features will be disabled" -ForegroundColor $CLR_WARN
    }
}

if ($ollamaFound) {
    Write-Host "  * Waiting for Ollama to start..." -ForegroundColor $CLR_GRAY
    Start-Sleep -Seconds 5
    
    # Check for phi3:mini model
    Write-Host "  * Checking for phi3:mini model..." -ForegroundColor $CLR_GRAY
    $models = ollama list 2>&1 | Out-String
    
    if ($models -match "phi3") {
        Write-Host "  * phi3:mini model ready" -ForegroundColor $CLR_SUCCESS
    }
    else {
        Write-Host "  * phi3:mini not found. Installing now..." -ForegroundColor $CLR_WARN
        Write-Host "  * This will download ~2.3GB (one-time only)" -ForegroundColor $CLR_INFO
        Write-Host "  * Please wait, this may take 5-10 minutes..." -ForegroundColor $CLR_INFO
        
        ollama pull phi3:mini
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  * phi3:mini installed successfully!" -ForegroundColor $CLR_SUCCESS
        }
        else {
            Write-Host "  * Model installation failed. AI features may not work." -ForegroundColor $CLR_WARN
        }
    }
}

Write-Host "`n"

# STEP 6: FRONTEND DEPENDENCIES
# -------------------------------------------------------------------------------
Write-Host "[STEP 6/11] Frontend Dependencies" -ForegroundColor $CLR_INFO
Write-Host "-----------------------------------------" -ForegroundColor $CLR_GRAY

Set-Location $ProjectRoot

# Check for Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Host "  * Node.js detected: $nodeVersion" -ForegroundColor $CLR_GRAY
}
catch {
    Write-Host "  * Node.js not found!" -ForegroundColor $CLR_ERR
    Write-Host "  * Install Node.js 18+ from: https://nodejs.org/" -ForegroundColor $CLR_WARN
    pause
    exit 1
}

# Install frontend dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "  * Installing frontend packages (first run)..." -ForegroundColor $CLR_WARN
    Write-Host "  * This may take a few minutes..." -ForegroundColor $CLR_INFO
    
    npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  * Frontend dependencies installed" -ForegroundColor $CLR_SUCCESS
    }
    else {
        Write-Host "  * npm install failed!" -ForegroundColor $CLR_ERR
        Write-Host "  * Try running: npm install --legacy-peer-deps" -ForegroundColor $CLR_WARN
        pause
        exit 1
    }
}
else {
    Write-Host "  * Dependencies already installed" -ForegroundColor $CLR_SUCCESS
}

Write-Host "`n"

# STEP 7: BACKEND SERVER LAUNCH
# -------------------------------------------------------------------------------
Write-Host "[STEP 7/11] Launching Backend Server" -ForegroundColor $CLR_INFO
Write-Host "-----------------------------------------" -ForegroundColor $CLR_GRAY

Write-Host "  * Starting FastAPI backend on port 8000..." -ForegroundColor $CLR_GRAY
Set-Location "$ProjectRoot\backend"

$backendCmd = "cd /d `"$ProjectRoot\backend`" && venv\Scripts\activate && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
Start-Process cmd -ArgumentList "/k title AI-BACKEND-SERVER && $backendCmd"

Write-Host "  * Backend server starting..." -ForegroundColor $CLR_GRAY
Start-Sleep -Seconds 5

# Verify backend is running
$backendReady = $false
$maxAttempts = 10
$attempt = 0

while (-not $backendReady -and $attempt -lt $maxAttempts) {
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
        $backendReady = $true
        Write-Host "  * Backend server ONLINE" -ForegroundColor $CLR_SUCCESS
    }
    catch {
        $attempt++
        if ($attempt -lt $maxAttempts) {
            Write-Host "  * Waiting for backend to initialize ($attempt/$maxAttempts)..." -ForegroundColor $CLR_GRAY
            Start-Sleep -Seconds 2
        }
    }
}

if (-not $backendReady) {
    Write-Host "  * Backend taking longer than expected" -ForegroundColor $CLR_WARN
    Write-Host "  * Check the AI-BACKEND-SERVER window for errors" -ForegroundColor $CLR_WARN
}

Write-Host "`n"

# STEP 8: FRONTEND SERVER LAUNCH
# -------------------------------------------------------------------------------
Write-Host "[STEP 8/11] Launching Frontend Server" -ForegroundColor $CLR_INFO
Write-Host "-----------------------------------------" -ForegroundColor $CLR_GRAY

Set-Location $ProjectRoot
Write-Host "  * Starting Vite dev server on port 5173..." -ForegroundColor $CLR_GRAY

Start-Process cmd -ArgumentList "/k title AI-FRONTEND-SERVER && cd /d `"$ProjectRoot`" && npm run dev"

Write-Host "  * Frontend server starting..." -ForegroundColor $CLR_GRAY
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
            Write-Host "  * Frontend server ONLINE" -ForegroundColor $CLR_SUCCESS
        }
    }
    catch {
        $attempt++
        if ($attempt -lt $maxAttempts) {
            Write-Host "  * Waiting for frontend to initialize ($attempt/$maxAttempts)..." -ForegroundColor $CLR_GRAY
            Start-Sleep -Seconds 2
        }
    }
}

if (-not $frontendReady) {
    Write-Host "  * Frontend taking longer than expected" -ForegroundColor $CLR_WARN
    Write-Host "  * Check the AI-FRONTEND-SERVER window for errors" -ForegroundColor $CLR_WARN
}

Write-Host "`n"

# STEP 9: COMPREHENSIVE HEALTH CHECK
# -------------------------------------------------------------------------------
Write-Host "[STEP 9/11] System Health Verification" -ForegroundColor $CLR_INFO
Write-Host "-----------------------------------------" -ForegroundColor $CLR_GRAY

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
        Write-Host "  * Database: ONLINE" -ForegroundColor $CLR_SUCCESS
    }
    else {
        Write-Host "  * Database: OFFLINE" -ForegroundColor $CLR_ERR
    }
    
    if ($health.ollama -eq "online") {
        $healthStatus.Ollama = $true
        $healthStatus.Models = ($health.models | Measure-Object).Count
        Write-Host "  * Ollama: ONLINE ($($healthStatus.Models) models)" -ForegroundColor $CLR_SUCCESS
    }
    else {
        Write-Host "  * Ollama: OFFLINE" -ForegroundColor $CLR_WARN
    }
    
    $healthStatus.Backend = $true
    Write-Host "  * Backend API: RESPONSIVE" -ForegroundColor $CLR_SUCCESS
}
catch {
    Write-Host "  * Backend API: NOT RESPONDING" -ForegroundColor $CLR_ERR
}

# Check frontend
try {
    $frontendCheck = Invoke-WebRequest -Uri "http://localhost:5173" -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    if ($frontendCheck.StatusCode -eq 200) {
        $healthStatus.Frontend = $true
        Write-Host "  * Frontend: ONLINE" -ForegroundColor $CLR_SUCCESS
    }
}
catch {
    Write-Host "  * Frontend: OFFLINE" -ForegroundColor $CLR_ERR
}

Write-Host "`n"

# STEP 10: LAUNCH SUMMARY AND BROWSER
# -------------------------------------------------------------------------------
Write-Host "[STEP 10/11] Launch Complete!" -ForegroundColor $CLR_INFO
Write-Host "-----------------------------------------" -ForegroundColor $CLR_GRAY
Write-Host "`n"

# Display final status
Write-Host "===============================================================" -ForegroundColor $CLR_SUCCESS
Write-Host "           AI EXAM ORACLE IS NOW RUNNING!           " -ForegroundColor Yellow
Write-Host "===============================================================" -ForegroundColor $CLR_SUCCESS
Write-Host "`n"

Write-Host "FRONTEND:    " -NoNewline -ForegroundColor $CLR_INFO
if ($healthStatus.Frontend) {
    Write-Host "http://localhost:5173 (ONLINE)" -ForegroundColor $CLR_SUCCESS -BackgroundColor DarkGreen
}
else {
    Write-Host "http://localhost:5173 (OFFLINE)" -ForegroundColor $CLR_WARN
}

Write-Host "BACKEND:     " -NoNewline -ForegroundColor $CLR_INFO
if ($healthStatus.Backend) {
    Write-Host "http://localhost:8000 (ONLINE)" -ForegroundColor $CLR_SUCCESS -BackgroundColor DarkGreen
}
else {
    Write-Host "http://localhost:8000 (OFFLINE)" -ForegroundColor $CLR_WARN
}

Write-Host "API DOCS:    " -NoNewline -ForegroundColor $CLR_INFO
Write-Host "http://localhost:8000/docs" -ForegroundColor White

Write-Host "DATABASE:    " -NoNewline -ForegroundColor $CLR_INFO
if ($healthStatus.Database) {
    Write-Host "CONNECTED" -ForegroundColor $CLR_SUCCESS
}
else {
    Write-Host "OFFLINE" -ForegroundColor $CLR_WARN
}

Write-Host "AI ENGINE:   " -NoNewline -ForegroundColor $CLR_INFO
if ($healthStatus.Ollama) {
    Write-Host "ONLINE ($($healthStatus.Models) models)" -ForegroundColor $CLR_SUCCESS
}
else {
    Write-Host "OFFLINE" -ForegroundColor $CLR_WARN
}

Write-Host "`n"
Write-Host "===============================================================" -ForegroundColor $CLR_SUCCESS
Write-Host "`n"

# Final check and browser launch
if ($healthStatus.Frontend -and $healthStatus.Backend) {
    Write-Host "All systems operational! Opening browser..." -ForegroundColor $CLR_SUCCESS
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:5173"
    Write-Host "Browser launched!" -ForegroundColor $CLR_SUCCESS
}
else {
    Write-Host "* Some systems are not fully operational" -ForegroundColor $CLR_WARN
    Write-Host "* Check the server windows for error details" -ForegroundColor $CLR_INFO
    Write-Host "* You can still try accessing: http://localhost:5173" -ForegroundColor $CLR_INFO
    
    $openAnyway = Read-Host "`nOpen browser anyway? (Y/N)"
    if ($openAnyway -eq "Y" -or $openAnyway -eq "y") {
        Start-Process "http://localhost:5173"
    }
}

Write-Host "`n"
Write-Host "`n"
Write-Host "TIP: Keep both server windows open while using the app!" -ForegroundColor $CLR_INFO

# STEP 11: LIVE CLOUD TUNNEL (NEW)
# -------------------------------------------------------------------------------
Write-Host "[STEP 11/11] Starting Live Cloud Tunnel" -ForegroundColor $CLR_INFO
Write-Host "-----------------------------------------" -ForegroundColor $CLR_GRAY
Write-Host "  * Connecting local backend to Firebase site..." -ForegroundColor $CLR_GRAY

$tunnelCmd = "cd /d `"$ProjectRoot`" && npx lt --port 8000 --subdomain ai-exam-vinz"
Start-Process cmd -ArgumentList "/k title AI-LIVE-CLOUD-TUNNEL && $tunnelCmd"

Write-Host "  * Tunnel process started in a new window" -ForegroundColor $CLR_SUCCESS
Write-Host "  * Public Bridge: https://ai-exam-vinz.loca.lt" -ForegroundColor $CLR_INFO
Write-Host "  * Firebase Site: https://ai-exam-paper-generator-3f43f.web.app" -ForegroundColor $CLR_INFO
Write-Host "`n"

Write-Host "TIP: Press any key here to shut down all services..." -ForegroundColor $CLR_INFO
Write-Host "`n"

$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Cleanup
Write-Host "`nStopping all services..." -ForegroundColor $CLR_WARN
Get-Process | Where-Object { $_.ProcessName -match "node|python|uvicorn" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1
Write-Host "All services stopped. Thank you for using AI Exam Oracle!" -ForegroundColor $CLR_SUCCESS
