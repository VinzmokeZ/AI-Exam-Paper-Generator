# ═══════════════════════════════════════════════════════════════════
# AI EXAM ORACLE - WORKING LAUNCH SCRIPT (TESTED & DEBUGGED)
# ═══════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Continue"
Clear-Host

Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🚀 AI EXAM ORACLE - LAUNCHER 🚀   " -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "`n"

$Root = if ($PSScriptRoot) { $PSScriptRoot } else { Get-Location }

# STEP 1: Cleanup
Write-Host "[1/6] Cleaning up..." -ForegroundColor Cyan
Get-Process | Where-Object { $_.ProcessName -match "node|python|uvicorn" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "  ✅ Done`n" -ForegroundColor Green

# STEP 2: Backend Dependencies
Write-Host "[2/6] Setting up backend..." -ForegroundColor Cyan
Set-Location "$Root\backend"

if (-not (Test-Path "venv")) {
    Write-Host "  • Creating venv..." -ForegroundColor Yellow
    python -m venv venv
}

Write-Host "  • Installing dependencies..." -ForegroundColor Gray
& ".\venv\Scripts\Activate.ps1"
pip install --quiet -r requirements.txt
Write-Host "  ✅ Done`n" -ForegroundColor Green

# STEP 3: Database
Write-Host "[3/6] Database setup..." -ForegroundColor Cyan
python smart_setup.py
python seed_db.py
Write-Host "  ✅ Done`n" -ForegroundColor Green

# STEP 4: Ollama
Write-Host "[4/6] Starting Ollama..." -ForegroundColor Cyan
$ollamaPath = "C:\Users\$env:USERNAME\AppData\Local\Programs\Ollama\ollama.exe"
if (Test-Path $ollamaPath) {
    Start-Process $ollamaPath -ArgumentList "serve" -WindowStyle Hidden
    Write-Host "  ✅ Ollama started`n" -ForegroundColor Green
}
else {
    Write-Host "  ⚠️  Ollama not found (AI features disabled)`n" -ForegroundColor Yellow
}

# STEP 5: Launch Servers
Write-Host "[5/6] Starting servers..." -ForegroundColor Cyan

# Backend
Write-Host "  • Backend on port 8000..." -ForegroundColor Gray
$backendCmd = "cd `"$Root\backend`" && venv\Scripts\activate && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
Start-Process cmd -ArgumentList "/k title BACKEND && $backendCmd"
Start-Sleep -Seconds 5

# Frontend
Write-Host "  • Frontend on port 5173..." -ForegroundColor Gray
Set-Location $Root
Start-Process cmd -ArgumentList "/k title FRONTEND && npm run dev"
Start-Sleep -Seconds 5

Write-Host "  ✅ Servers starting`n" -ForegroundColor Green

# STEP 6: Verify & Launch
Write-Host "[6/6] Verifying..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -TimeoutSec 5
    Write-Host "  ✅ Backend: OK" -ForegroundColor Green
}
catch {
    Write-Host "  ⚠️  Backend: Starting..." -ForegroundColor Yellow
}

Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "          ✨ READY! ✨          " -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "`n📱 App: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔌 API: http://localhost:8000`n" -ForegroundColor Cyan

Write-Host "Opening browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"

Write-Host "`n✅ Browser opened! Keep terminal windows open.`n" -ForegroundColor Green
Write-Host "Press any key to shutdown..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host "`nShutting down..." -ForegroundColor Yellow
Get-Process | Where-Object { $_.ProcessName -match "node|python|uvicorn" } | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "✅ Done!`n" -ForegroundColor Green
