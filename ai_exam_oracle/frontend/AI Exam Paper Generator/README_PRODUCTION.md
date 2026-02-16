# 🚀 AI Exam Oracle - Production Guide

## Quick Start (One-Click Launch)

### Windows Users:
1. **Double-click `LAUNCH.bat`** or **Right-click `LAUNCH.ps1` → Run with PowerShell**
2. Wait for automatic setup (first run: 5-10 minutes for AI model download)
3. Browser will open automatically to `http://localhost:5173`

That's it! Everything is automated.

---

## What Happens Automatically?

The launcher performs **8 intelligent steps**:

1. **🔧 Environment Init** - Cleans up existing processes
2. **🐍 Python Setup** - Creates venv, installs backend dependencies
3. **🗄️ Database Init** - Creates/repairs SQLite database, seeds with topics
4. **📚 RAG Training** - Indexes knowledge base documents (if present)
5. **🤖 AI Engine** - Starts Ollama, **auto-installs `phi3:mini` model** if missing
6. **⚛️ Frontend Setup** - Installs npm dependencies (first run only)
7. **🏥 Health Check** - Verifies all systems operational
8. **🌐 Launch** - Starts backend (`:8000`) and frontend (`:5173`)

---

## System Requirements

- **Windows 10/11** (PowerShell 5.1+)
- **Python 3.9+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Ollama** - [Download](https://ollama.ai/) ← **Required for AI features**

---

## First-Time Setup

### Install Ollama (One-Time)
1. Download from: https://ollama.ai
2. Run the installer
3. Ollama will start automatically

**The launcher will download `phi3:mini` (~2.3GB) on first run.**

---

## URLs & Endpoints

| Service | URL |
|---------|-----|
| **Frontend (Main App)** | http://localhost:5173 |
| **Backend API** | http://localhost:8000 |
| **API Documentation** | http://localhost:8000/docs |
| **Health Check** | http://localhost:8000/api/health |

---

## Features

### ✅ Fully Automated
- Zero manual configuration
- Automatic dependency installation
- Self-healing database
- Dynamic model downloading

### 🎯 Mobile-Optimized UI
- Phone frame visualization
- Swipe-based vetting
- Progress indicators
- Touch-friendly buttons

### 🤖 AI-Powered
- Local `phi3:mini` model (offline-capable)
- RAG-enhanced generation
- Strict model verification before generation
- Automatic model fallback

### 🔒 Safety Features
- Database backups before repairs
- Process cleanup on startup
- Health checks before launch
- Model availability verification

---

## Project Structure

```
AI Exam Paper Generator/
├── LAUNCH.bat              ← Double-click this
├── LAUNCH.ps1              ← Or this (PowerShell)
├── backend/
│   ├── app/                ← FastAPI application
│   ├── exam_oracle.db      ← SQLite database
│   ├── seed_db.py          ← Database seeding
│   └── smart_setup.py      ← Database repair tool
├── src/
│   ├── components/         ← React components
│   ├── services/           ← API services
│   └── App.tsx             ← Main app
├── knowledge_base/         ← RAG documents (optional)
└── chroma_db/              ← Vector embeddings
```

---

## Troubleshooting

### "Ollama not found"
- Install Ollama from https://ollama.ai
- Restart the launcher

### "Port already in use"
- The launcher auto-kills existing processes
- If issue persists, manually run: `taskkill /F /IM node.exe /IM uvicorn.exe`

### "Model download stuck"
- Check internet connection
- Manually run: `ollama pull phi3:mini`

### "Database errors"
- The launcher auto-backs up and repairs
- If issues persist, delete `exam_oracle.db` and re-launch

---

## Manual Commands (Advanced)

If you need to run components separately:

```powershell
# Backend only
cd backend
python -m uvicorn app.main:app --reload

# Frontend only
npm run dev

# Database reset
cd backend
python smart_setup.py
python seed_db.py

# Pull AI model
ollama pull phi3:mini
```

---

## Stopping the Application

Simply **close the terminal windows** or press any key in the main launcher window.

---

## Updates & Development

```powershell
# Update Python dependencies
cd backend
pip install -r requirements.txt

# Update frontend dependencies
npm install

# Rebuild frontend
npm run build
```

---

## Support

For issues or questions, check:
- Database logs in `backend/`
- Browser console (F12) for frontend errors
- Health check endpoint: http://localhost:8000/api/health

---

**🎉 Enjoy using AI Exam Oracle!**
