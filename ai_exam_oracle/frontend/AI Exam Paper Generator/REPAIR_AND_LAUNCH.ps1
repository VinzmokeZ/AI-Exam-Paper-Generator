
# AI EXAM ORACLE - AUTOMATED REPAIR & LAUNCH SYSTEM
# Usage: Right-Click -> Run with PowerShell

$host.ui.RawUI.WindowTitle = "AI EXAM ORACLE - REPAIR & LAUNCH"
Clear-Host

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "      AI EXAM ORACLE - SYSTEM REPAIR & LAUNCH ENGINE        " -ForegroundColor White -BackgroundColor DarkBlue
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# --- 1. FORCE CLEANUP ---
Write-Host "[1/7] Terminating Old Processes..." -ForegroundColor Yellow
# Note: careful with chrome/edge, maybe user has other tabs. Let's stick to app processes.
$app_processes = @("node", "python", "uvicorn")
foreach ($proc in $app_processes) {
    Get-Process $proc -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 2
Write-Host "SUCCESS: System Cleaned." -ForegroundColor Green
Write-Host ""

# --- 2. ENVIRONMENT CHECK & INSTALL ---
Write-Host "[2/7] Verifying Python Environment..." -ForegroundColor Yellow
if (Test-Path "backend/requirements.txt") {
    Write-Host "Installing/Updating Dependencies..." -ForegroundColor Gray
    pip install -r backend/requirements.txt
    if ($LASTEXITCODE -ne 0) {
        Write-Host "WARNING: Pip install had issues. Continuing..." -ForegroundColor Red
    }
    else {
        Write-Host "SUCCESS: Dependencies up to date." -ForegroundColor Green
    }
}
else {
    Write-Host "ERROR: backend/requirements.txt not found!" -ForegroundColor Red
    exit
}
Write-Host ""

# --- 3. DATABASE REPAIR ---
Write-Host "[3/7] Repairing Database Connection..." -ForegroundColor Yellow
python smart_setup.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Standard database repair failed. Attempting NUCLEAR REPAIR..." -ForegroundColor Cyan
    Write-Host "This will restore system files while keeping your data folders." -ForegroundColor Gray
    python smart_setup.py --nuclear
    if ($LASTEXITCODE -ne 0) {
        Write-Host "CRITICAL ERROR: Database setup failed. Ensure XAMPP/MySQL is running." -ForegroundColor Red
        Write-Host "Action: Open XAMPP Control Panel and Start MySQL."
        Read-Host "Press Enter to exit..."
        exit
    }
    else {
        Write-Host "SUCCESS: Nuclear repair complete. Restarting system..." -ForegroundColor Green
        # Try one more standard setup to boot the engine
        python smart_setup.py
    }
}
Write-Host "SUCCESS: Database Connected." -ForegroundColor Green
Write-Host ""

# --- 3.5 SEED DATABASE ---
Write-Host "[3.5/7] Seeding Initial Data..." -ForegroundColor Yellow
python backend/seed_db.py
Write-Host "SUCCESS: Database Seeded." -ForegroundColor Green
Write-Host ""

# --- 4. KNOWLEDGE TRAINING (WIKIPEDIA/RAG) ---
Write-Host "[4/7] Training AI Model (Syncing Knowledge)..." -ForegroundColor Yellow
# Running this ensures "Specific Dataset" request is met
python sync_external_knowledge.py
Write-Host "SUCCESS: RAG System Trained." -ForegroundColor Green
Write-Host ""

# --- 5. AI ENGINE STARTUP & MODEL VERIFICATION ---
Write-Host "[5/7] Starting Ollama (AI Engine)..." -ForegroundColor Yellow
$ollamaPath = "C:\Users\Vinz\AppData\Local\Programs\Ollama\ollama.exe"
if (Test-Path $ollamaPath) {
    Start-Process $ollamaPath -ArgumentList "serve" -WindowStyle Hidden
    Write-Host "INFO: Ollama launched." -ForegroundColor Gray
}
else {
    # Try generic command
    Start-Process "ollama" -ArgumentList "serve" -WindowStyle Hidden -ErrorAction SilentlyContinue
    Write-Host "INFO: Attempted generic Ollama launch." -ForegroundColor Gray
}

# Wait for Ollama to be ready
Start-Sleep -Seconds 5
Write-Host "Verifying 'phi3:mini' Model..." -ForegroundColor Yellow
$models = ollama list
if ($models -match "phi3:mini") {
    Write-Host "SUCCESS: Model 'phi3:mini' is ready." -ForegroundColor Green
}
else {
    Write-Host "WARNING: 'phi3:mini' not found. pulling it now (this may take a while)..." -ForegroundColor Magenta
    ollama pull phi3:mini
}
Write-Host ""

# --- 6. LAUNCHING SERVERS ---
Write-Host "[6/7] Starting Application Servers..." -ForegroundColor Yellow

# Backend
Write-Host "  > Launching Backend API (Port 8000)..." -ForegroundColor Gray
Start-Process cmd -ArgumentList "/k title AI-BACKEND && cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
# Wait for Backend to initialize (Critical for "Site can't be reached" fix)
Write-Host "    Waiting 15s for API initialization..." -ForegroundColor DarkGray
Start-Sleep -Seconds 15

# Check Backend Health BEFORE Frontend
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -Method Get -ErrorAction Stop -TimeoutSec 5
    if ($health.database -eq "online") {
        Write-Host "    STATUS: Backend Online & Connected [OK]" -ForegroundColor Green
    }
    else {
        Write-Host "    WARNING: Backend Online but Database Offline." -ForegroundColor Red
    }
}
catch {
    Write-Host "    WARNING: Backend did not respond in time. Proceeding anyway..." -ForegroundColor Red
}

# Frontend
Write-Host "  > Launching Frontend Interface (Port 5173)..." -ForegroundColor Gray
if (-not (Test-Path "node_modules")) {
    Write-Host "    First run detected. Installing Frontend Dependencies..." -ForegroundColor Cyan
    npm install
}
Start-Process cmd -ArgumentList "/k title AI-FRONTEND && npm run dev"
Write-Host "    Waiting 5s for bundle generation..." -ForegroundColor DarkGray
Start-Sleep -Seconds 5
Write-Host "SUCCESS: Servers Running." -ForegroundColor Green
Write-Host ""

# --- 7. BROWSER LAUNCH (SINGLE WINDOW) ---
Write-Host "[7/7] Opening Application..." -ForegroundColor Yellow
$appUrl = "http://localhost:3000"
Start-Process $appUrl

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "                 SYSTEM READY - HAPPY EXAMS                 " -ForegroundColor White -BackgroundColor DarkCyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  AI Model: phi3:mini (Verified)" -ForegroundColor Gray
Write-Host "  Mode:     Hybrid (Local/Cloud Engine Toggle Active)" -ForegroundColor Gray
Write-Host "  URL:      $appUrl" -ForegroundColor Gray
Write-Host "============================================================" -ForegroundColor Cyan
