# Feature Status - AI Exam Oracle
> Last Updated: February 2026

---

## ✅ Fully Working (Frontend)
- Subject Library with color pickers & gradient theming
- Subject/Topic inline editing & deletion with confirmations
- Training Lab UI
- Rubric Engine UI (create, edit, generate from rubric)
- Analytics Dashboard (LO Coverage, Bloom's Balance, daily goals)
- Vetting Center (approve/reject questions, bulk save to history)
- Exam History page
- Notification Center
- Gamification Panel (XP, Level, Streak, Achievements)
- Document Upload AI Prompt Box (attach PDFs to generation prompts)

---

## ✅ Fully Working (Backend - Local)
- FastAPI Framework with full CORS support
- Subject/Topic/Rubric CRUD API
- SQLite persistence (`exam_oracle.db`)
- Full RAG pipeline (ChromaDB + SentenceTransformer embeddings)
- AI Question Generation — Local Ollama (Phi3, Mistral)
- AI Question Generation — Cloud Gemini API (Direct, no OpenRouter)
- Multi-model fallback chain (flash-lite → flash → local Ollama)
- 429 Rate Limit graceful error handling
- Multi-Chunk PDF Sampling (Beginning/Middle/End variety)
- Background Health Audit (DB, LLM, Cloud API status)
- Gamification tracking (XP, Coins, Streaks, Achievements)
- Course Outcome auto-mapping in question generation

---

## ✅ Fully Working (Backend - Cloud / Render)
- PostgreSQL database (Render managed, free tier)
- Render deployment via Blueprint (`render.yaml`)
- Cloud sync via `/api/sync-cloud` endpoint (GitHub → PostgreSQL merge)
- RAG Query-Only mode (chunks from DB, no indexing to save RAM)
- PostgreSQL sequence auto-repair via `/api/fix-seq` endpoint
- Bulk vetted question saving (UniqueViolation resolved)
- Exam history saving from cloud-generated questions
- Multi-model Gemini fallback (stable on free tier)

---

## ⚠️ Partial / Limited on Cloud (Render Free Tier)
- **RAG Indexing**: Disabled on cloud (insufficient RAM for `sentence_transformers`)
  - *Workaround*: Index PDFs locally, sync via `/api/sync-cloud`
- **Local Ollama**: Not available on cloud (no GPU/Ollama install)
  - *Workaround*: Cloud engine uses Google Gemini API automatically

---

## 🚀 Future / Planned
- Multi-format export (DOCX, Excel, PDF paper layout)
- Advanced OBE auto-mapping analytics
- Student-facing answer sheet mode
- Scheduled timed sync (auto-push local → cloud on git push)
