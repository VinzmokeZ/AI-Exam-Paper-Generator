# AI Exam Oracle - Deep-Dive Technical Overview

This document provides a high-level technical breakdown of the **AI Exam Paper Generator** project. It details the scalable architecture, background system optimizations, and intelligent logic that powers the platform.

---

## 🏗️ 1. Scalable SQL Architecture (Migration)
Originally started on SQLite, the project has evolved into a production-ready **MySQL** architecture managed via XAMPP.

*   **The Database Shift**: In `migration_script.py`, we implemented a robust ETL (Extract, Transform, Load) process to move data from local SQLite files to a centralized MySQL instance (`ai_exam_oracle`).
*   **Database Schema**:
    *   **Subject/Topic/Question**: The core of the academic knowledge.
    *   **Rubric & Course Outcomes**: Detailed academic constraints for generation.
    - **User Stats & Activity Logs**: Tracking gamification (XP, Coins, Streaks) and system usage.
*   **Production Advantage**: Switching to MySQL allows for better concurrency, handled by SQLAlchemy with `pool_pre_ping=True` to prevent connection timeouts.

---

## 🔍 2. System Health & Background Audits
To maintain 100% uptime, the backend includes an automated **Health Service** (`health_service.py`).

*   **Background Audit**: On every startup, `main.py` triggers a background thread that performs a "Full Audit":
    *   **DB Connectivity**: Checks if the MySQL server is responding.
    *   **Ollama Status**: Verifies if the local AI engine is running and which models are pulled.
    *   **Cloud API Status**: Rapidly pings Google Gemini to check for direct API health.
*   **Detailed Logging**: All system states are recorded in `system_health.log`, allowing developers to trace "degraded" states without crashing the main application.

---

## 🧠 3. Advanced AI Logic & RAG Variety
The generation engine doesn't just ask questions—it intelligently picks context.

### The "Never Fail" Fallback (Round 2)
In addition to model switching, we've optimized the **Prompt Integrity**:
- **Cache Purge**: On startup, the `backend_cache/` folder is automatically purged. This prevents "stale" questions from previous failed runs from being re-presented to the user.
- **Model Selection**: The system defaults to `gemini-2.0-flash-lite` but intelligently falls back to `gemini-1.5-flash` or Local Ollama models based on environmental flags (e.g., Render environment detection).

### Knowledge Base Variety
In `rag_service.py`, the new `get_context_from_kb` function introduces **Randomized Context Selection**:
- Instead of always picking the first 5 paragraphs of a book, the system shuffles the knowledge chunks.
- **Result**: Even if you ask for "Mitochondria" 10 times, the AI receives slightly different paragraphs each time, resulting in a more diverse and exhaustive question set.

---

## 📊 4. Intelligent Analytics & Dashboard Logic
The Dashboard is now a data-driven command center, with logic residing in `dashboard.py`.

*   **Performance Tracking**: The "Overall Performance" metric is a dynamic calculation of your `Approved / Total` questions ratio.
*   **Daily Goals**: The "Today's Progress" ring measures your vetting activity against a daily target (Goal: 5 Approved Questions/Day).
*   **Analytical Reports**: 
    *   **LO Coverage**: Aggregates `course_outcomes` data from all questions to show a radar/bar chart of which Learning Outcomes are under-represented.
    *   **Bloom's Taxonomy Balance**: Maps question tags (Apply, Analyze, etc.) to a percentage distribution, flagging if the exam is too "Remember-heavy."

---

## 📝 Technical Data Lifecycle

1.  **Startup**: Backend purges cache -> Starts Health Audit -> Connects to MySQL.
2.  **Input**: Professor uploads a Google Drive link or PDF.
3.  **RAG**: `KnowledgeBase` entry created -> Background task downloads/chunks -> Embedding vectors saved.
4.  **Generation**: AI Fallback chain picks the best model -> RAG Variety shuffles context.
5.  **Analytics**: Vetting results update the `ActivityLog` and `UserStats` tables instantly.
