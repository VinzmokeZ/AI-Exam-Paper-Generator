# AI Exam Paper Generator

An AI-powered exam paper generation system for professors and educators, built with FastAPI, React (TypeScript), and deployed on Render.

## 🚀 Live Cloud Deployment

**Backend API**: https://ai-exam-paper-generator-i6iz.onrender.com

The application runs fully in the cloud with a PostgreSQL database and Google Gemini AI engine. No local setup required to use the app.

---

## ✨ Features

- **AI Question Generation**: Generate MCQs, Short Answer, and Essay questions from uploaded PDFs or typed prompts using Google Gemini or local Ollama models.
- **Rubric-Based Generation**: Define exam rubrics (question type distribution, marks, LO weightings) and auto-generate full exam papers.
- **Vetting Center**: Review, approve, or reject AI-generated questions before they are saved.
- **Knowledge Base**: Index PDFs via Google Drive links. On the cloud, use synced chunks from the database.
- **Analytics Dashboard**: Track XP, streaks, Bloom's taxonomy balance, and LO coverage.
- **Gamification**: XP system, levels, coins, streaks, and achievement badges.
- **Dual Environment**: Runs locally (SQLite + Ollama) or on the cloud (PostgreSQL + Gemini).

---

## 🛠️ Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 16+
- (Optional) Ollama for local AI

### Install & Run
```bash
# Backend
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
npm install
npm run dev
```

Or simply double-click **`LAUNCH.bat`** to start everything at once.

### Environment Variables (`.env`)
```env
GOOGLE_API_KEY=your_gemini_key_here
USE_MYSQL=false
RENDER=false
```

---

## ☁️ Cloud Sync

To push your local database to the Render cloud:

1. Commit your `backend/exam_oracle.db` to GitHub.
2. Visit: https://ai-exam-paper-generator-i6iz.onrender.com/api/sync-cloud
3. Done! All subjects, questions, PDFs, and stats will sync to the cloud.

---

## 🔑 API Key Management

The app uses the **Google Gemini API** (free tier) for cloud generation.
- **Local**: Set `GOOGLE_API_KEY` in `backend/.env`
- **Cloud**: Set `GOOGLE_API_KEY` in the Render Dashboard → Environment

Free tier limits: `1,500 requests/day` or `1,000,000 tokens/day`. If quota is exhausted, the fallback chain will try alternative models automatically.

---

## 📁 Project Structure

```
├── backend/                # FastAPI Python backend
│   ├── app/
│   │   ├── routes/         # API endpoints (subjects, topics, generate, etc.)
│   │   ├── services/       # AI generation, RAG, health monitoring
│   │   └── models.py       # SQLAlchemy database models
│   ├── run_internal_sync.py # Cloud sync script
│   └── exam_oracle.db      # Local SQLite database
├── src/                    # React TypeScript frontend
├── docs/                   # Project documentation
│   ├── PROJECT_OVERVIEW.md
│   ├── FEATURE_STATUS.md
│   └── MOBILE_SYNC_GUIDE.md
└── render.yaml             # Render deployment blueprint
```