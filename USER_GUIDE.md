# AI Exam Oracle - Expert Operational Guide

This guide is for power users who want to dive deep into the advanced settings, analytics, and infrastructure of the platform.

---

## 💾 1. Database Migration (Moving to MySQL)
If you have been using the app in "Portable Mode" (SQLite) and want to move to the robust "Server Mode" (MySQL), follow these steps:

1.  **Launch XAMPP**: Ensure Apache and MySQL are running in your XAMPP Control Panel.
2.  **Open Terminal**: Navigate to the `backend/` directory.
3.  **Run Migration**:
    ```bash
    python migration_script.py
    ```
4.  **Verify**: Open `http://localhost/phpmyadmin` and check for the `ai_exam_oracle` database.
5.  **Enable MySQL**: Open `backend/.env` and set `USE_MYSQL=true`. Restart the app to reflect changes.

---

## 📈 2. Interpreting Advanced Analytics
The **Reports & Analytics** tab provides academic insights into your question banks.

### Bloom's Taxonomy Balance
- **What to look for**: A healthy exam library should have a "Pyramid" shape (more Knowledge/Comprehension, fewer but high-impact Synthesis/Evaluation).
- **Alert Flags**: If your chart shows 90% "Knowledge", the AI will warn you to "Increase Complexity" in the Prompt Box.

### Learning Outcome (LO) Coverage
- **The Target**: Every course has specific Learning Outcomes (LO1-LO5). 
- **The Logic**: The system looks at the `course_outcomes` meta-tag on every approved question. If LO4 (Analyze) has 0 questions, you'll see a **Critical Alert**.
- **Action**: Use the **Rubric Engine** to specifically request questions for the missing LO.

---

## 🔗 3. Advanced Knowledge Base Management
Beyond simple PDF uploads, the system supports cloud-linked knowledge.

### Google Drive Integration
1.  **Preparation**: Upload your textbook to Google Drive.
2.  **Sharing**: Set the file permissions to **"Anyone with the link"**.
3.  **The Link**: Copy the link and paste it into the **RAG/Knowledge Base** section.
4.  **The Process**: The backend will download the PDF, chunk it into 1500-character segments, and store them for Randomized Retrieval.

### Randomized Context Variety (Power Tip)
When generating questions from a large Knowledge Base, the system uses a **Variety Shuffle**. Even with the same prompt, the AI-curated context changes slightly every time you click "Generate". This prevents repetitive questions and ensures full textbook coverage over time.

---

## 🛠️ 4. System Health Checks
If the app feels slow or generation fails:
- **Check the Light**: If the header light is **Dim Gray**, the backend is offline.
- **Check the Logs**: Open `backend/system_health.log` to see if the AI engine (Ollama) or the DB connection has failed.
- **Cache Purge**: If you see weird results, simply restart the backend. The system automatically purges the `backend_cache/` folder on every startup to ensure data integrity.
