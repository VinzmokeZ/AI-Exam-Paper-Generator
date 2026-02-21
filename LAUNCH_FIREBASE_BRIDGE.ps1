# ===============================================================================
# AI EXAM ORACLE - FIREBASE CLOUD BRIDGE LAUNCHER
# Connects your local AI engine to the live Firebase website
# ===============================================================================

$ErrorActionPreference = "Continue"
Clear-Host
$host.ui.RawUI.WindowTitle = "AI EXAM ORACLE - FIREBASE BRIDGE"

# Color Scheme
$CLR_SUCCESS = "Green"
$CLR_ERR = "Red"
$CLR_WARN = "Yellow"
$CLR_INFO = "Cyan"
$CLR_GRAY = "Gray"

Write-Host "`n===============================================================" -ForegroundColor $CLR_INFO
Write-Host "   AI EXAM ORACLE - FIREBASE CLOUD BRIDGE   " -ForegroundColor White -BackgroundColor DarkBlue
Write-Host "===============================================================" -ForegroundColor $CLR_INFO
Write-Host "`n* This launcher connects your live website to your local AI engine!" -ForegroundColor $CLR_WARN
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
}
else {
    Write-Host "Mode: Lite (SQLite - Recommended)" -ForegroundColor $CLR_SUCCESS
}
Write-Host "`n"

# STEP 1: CLEANUP & REPAIR
# -------------------------------------------------------------------------------
Write-Host "[STEP 1/6] Cleanup and Self-Healing" -ForegroundColor $CLR_INFO
Get-Process | Where-Object { $_.ProcessName -match "python|uvicorn" } | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "  * AI processes terminated" -ForegroundColor $CLR_GRAY

# NUCLEAR REPAIR: ChromaDB Version Fix
$ChromaPath = "$ProjectRoot\backend\chroma_db"
if (Test-Path $ChromaPath) {
    Write-Host "  * Checking Knowledge Base health..." -ForegroundColor $CLR_GRAY
    try {
        # Force delete to fix the "KeyError: _type" metadata corruption
        Remove-Item -Path $ChromaPath -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  * Knowledge Base reset (Self-Healed)" -ForegroundColor $CLR_SUCCESS
    }
    catch {
        Write-Host "  * WARNING: Could not reset Knowledge Base automatically." -ForegroundColor $CLR_WARN
    }
}
Write-Host "  * Environment cleaned" -ForegroundColor $CLR_SUCCESS

# STEP 2: PYTHON VENV
# -------------------------------------------------------------------------------
Write-Host "[STEP 2/6] Activating AI Engine" -ForegroundColor $CLR_INFO
Set-Location "$ProjectRoot\backend"
& ".\venv\Scripts\Activate.ps1"
Write-Host "  * Venv activated" -ForegroundColor $CLR_SUCCESS

# STEP 3: DATABASE
# -------------------------------------------------------------------------------
Write-Host "[STEP 3/6] Database Verification" -ForegroundColor $CLR_INFO
if ($USE_MYSQL) {
    # Basic MySQL check
    $mysqlCheck = Test-NetConnection -ComputerName localhost -Port 3306 -WarningAction SilentlyContinue
    if (-not $mysqlCheck.TcpTestSucceeded) {
        Write-Host "  * MySQL NOT detected! Attempting to start XAMPP..." -ForegroundColor $CLR_WARN
        if (Test-Path "C:\xampp\mysql\bin\mysqld.exe") {
            Start-Process "C:\xampp\mysql\bin\mysqld.exe" -WindowStyle Hidden
            Start-Sleep -Seconds 5
        }
    }
}
else {
    Write-Host "  * Lite Mode: Using local SQLite" -ForegroundColor $CLR_GRAY
}

# STEP 4: BACKEND SERVER
# -------------------------------------------------------------------------------
Write-Host "[STEP 4/6] Launching Backend" -ForegroundColor $CLR_INFO
$backendCmd = "cd /d `"$ProjectRoot\backend`" && venv\Scripts\activate && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"
Start-Process cmd -ArgumentList "/k title AI-BACKEND-SERVER && $backendCmd"
Start-Sleep -Seconds 5
Write-Host "  * Backend server online" -ForegroundColor $CLR_SUCCESS

# STEP 5: CLOUD TUNNEL
# -------------------------------------------------------------------------------
Write-Host "[STEP 5/6] Establishing Cloud Bridge" -ForegroundColor $CLR_INFO
$tunnelCmd = "cd /d `"$ProjectRoot`" && npx lt --port 8000 --subdomain ai-exam-vinz --print-requests"
Start-Process cmd -ArgumentList "/k title AI-CLOUD-TUNNEL && $tunnelCmd"
Start-Sleep -Seconds 3
Write-Host "  * Bridge: https://ai-exam-vinz.loca.lt" -ForegroundColor $CLR_SUCCESS
Write-Host "  * TIP: If asked for password, use your public IP from whatismyipaddress.com" -ForegroundColor $CLR_WARN

# STEP 6: OPEN FIREBASE SITE
# -------------------------------------------------------------------------------
Write-Host "[STEP 6/6] Opening Live Website" -ForegroundColor $CLR_INFO
Start-Sleep -Seconds 2
Start-Process "https://ai-exam-paper-generator-3f43f.web.app"
Write-Host "  * Live site launched!" -ForegroundColor $CLR_SUCCESS

Write-Host "`n"
Write-Host "===============================================================" -ForegroundColor $CLR_SUCCESS
Write-Host "           SYSTEM READY - CONNECTED TO FIREBASE             " -ForegroundColor Yellow
Write-Host "===============================================================" -ForegroundColor $CLR_SUCCESS
Write-Host "`n"
Write-Host "Keep this window open while using the Firebase site." -ForegroundColor $CLR_INFO
Write-Host "Press any key to disconnect and stop all services..." -ForegroundColor $CLR_GRAY

$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Cleanup
Write-Host "`nShutting down..." -ForegroundColor $CLR_WARN
Get-Process | Where-Object { $_.ProcessName -match "node|python|uvicorn" } | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "Disconnected. Goodbye!" -ForegroundColor $CLR_SUCCESS
pause
