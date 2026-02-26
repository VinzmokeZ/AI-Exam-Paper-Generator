# AI Exam Oracle - Deep-Dive Technical Overview

This document provides a high-level technical breakdown of the **AI Exam Paper Generator** project. It covers the dual-environment architecture, database sync pipeline, intelligent generation engine, and cloud deployment infrastructure.

---

## 🏗️ 1. Dual-Environment Architecture

The project runs seamlessly in **two independent environments**:

| Feature | Local (PC) | Cloud (Render) |
|---|---|---|
| **Database** | SQLite (`exam_oracle.db`) | PostgreSQL (Render managed) |
| **AI Engine** | Ollama (Phi3, Mistral) | Google Gemini API (Direct) |
| **RAG indexing** | Full (ChromaDB + Sentences) | Query-Only (disabled for RAM) |
| **Launch Method** | `LAUNCH.bat` | Always-on at Render URL |

Both environments share the same codebase. The backend auto-detects which mode it's in via the `RENDER=true` environment variable.

---

## 🔄 2. Cloud Data Sync Pipeline (`run_internal_sync.py`)

A dedicated internal sync script handles migrating all local progress to the Render PostgreSQL cloud database.

### How It Works
1. **GitHub Download**: The script downloads the latest `exam_oracle.db` SQLite binary directly from the GitHub repository.
2. **Schema Upgrade**: It runs `ALTER TABLE` commands to upgrade text columns (`question_text`, `correct_answer`, `explanation`) from `VARCHAR(2000)` to `TEXT` to support long essay answers.
3. **Smart Merge**: For each of 14 tables, it performs an **UPSERT** (insert if new, update if exists), preserving all original IDs.
4. **Data Sanitization**: NUL bytes (`\x00`) from PDF text are stripped before insertion, since PostgreSQL rejects them.
5. **Sequence Reset**: After migration, PostgreSQL auto-increment sequences are reset via `setval()` so new records don't conflict with imported IDs.

### Trigger
The sync is triggered via a secure internal endpoint: `GET /api/sync-cloud`.

### Tables Migrated
`subjects`, `topics`, `knowledge_bases`, `knowledge_chunks`, `documents`, `rubrics`, `rubric_question_distributions`, `rubric_lo_distributions`, `questions`, `user_stats`, `exam_history`, `activity_logs`, `notifications`, `achievements`

---

## 🧠 3. AI Generation Engine

### Multi-Model Fallback Chain
The generation service (`generation_service.py`) uses a cascading fallback strategy:

1. `gemini-2.0-flash-lite` (Primary — fastest, free tier)
2. `gemini-2.5-flash-lite` (Secondary fallback)
3. `gemini-2.0-flash` (Tertiary fallback)
4. Local Ollama models (if available)

If a model hits a `429 Rate Limit` error, the service gracefully catches it and tries the next model in the chain without crashing the server.

### Multi-Chunk PDF Sampling
Implemented in `generate.py`, the `extract_pdf_smart_chunks` function divides a PDF into three equal sections (Beginning, Middle, End), randomly picks pages from each section, and combines them into a diverse context snippet. This ensures every generation produces unique, non-repetitive questions even from the same document.

### Knowledge Base RAG (Local + Cloud)
- **Local**: Full ChromaDB vector search using `sentence-transformers` embedding model (`all-MiniLM-L6-v2`).
- **Cloud (Render)**: Query-only mode using `KnowledgeChunk` database rows. Since embedding models require too much RAM on the free tier, chunks are randomly shuffled and sampled from the PostgreSQL database for variety.

---

## 🔍 4. System Health & Background Audits

On every startup, `main.py` triggers a background thread (`health_service.py`) that performs a Full Audit:
- **DB Connectivity**: Checks if PostgreSQL/SQLite is responding.
- **Ollama Status**: Verifies if the local AI model is pulled and accessible.
- **Cloud API Status**: Pings Google Gemini to verify the API key and quota.
- **Logging**: All system states are recorded in `system_health.log`.

---

## 📊 5. Intelligent Analytics & Dashboard

The Dashboard (`dashboard.py`) is a data-driven command center:
- **Performance Metric**: Dynamic `Approved / Total Questions` ratio.
- **Daily Goal Ring**: Tracks vetting activity against a configurable daily target.
- **LO Coverage Chart**: Aggregates `course_outcomes` JSON from all questions to show which Learning Outcomes are under-represented.
- **Bloom's Balance**: Maps question complexity tags to a percentage distribution, alerting if an exam is too "Remember-heavy."

---

## 📝 Technical Data Lifecycle

1. **Startup**: Backend purges `backend_cache/` → Starts Health Audit → Connects to DB.
2. **Input**: Professor selects a Subject/Topic + uploads a document or picks a Rubric.
3. **Generation**: AI Fallback chain picks the best available model → Multi-Chunk PDF sampler grabs varied context → RAG shuffles Knowledge Chunks.
4. **Vetting**: Questions flow into the Vetting Center → Professor approves/rejects.
5. **Save**: Approved questions saved to `questions` and `exam_history` tables.
6. **Analytics**: Vetting results instantly update `ActivityLog` and `UserStats`.
