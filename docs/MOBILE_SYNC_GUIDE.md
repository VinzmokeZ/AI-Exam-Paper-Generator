# 📱 Android Mobile Bridge & Cloud Connection Guide

This guide explains how to connect your Android phone to the AI Exam Oracle backend — both via USB (local PC) and via the Render cloud deployment.

---

## 🏗️ Option A: USB ADB Bridge (Local PC Mode)

When working locally, your phone connects to your laptop's AI engine via ADB.

### How It Works
1. Run `LAUNCH.bat` on your PC. This executes:
   - `adb reverse tcp:8000 tcp:8000` — maps the phone's `localhost:8000` directly to your PC's Python API.
2. The Android APK communicates with the backend via `http://localhost:8000`.
3. No internet is required. All AI runs locally via Ollama.

### Status Indicators
- **Cyan Pulse (Active)**: ADB bridge is live; the backend is responding.
- **Dim/Gray**: ADB connection is broken — replug the USB cable.
- **Flashing**: AI is actively generating or pulling a model.

---

## ☁️ Option B: Render Cloud Mode (No Cable Needed!)

Your app is permanently deployed at:
> **https://ai-exam-paper-generator-i6iz.onrender.com**

To switch your phone to the cloud:
1. Open the app.
2. Go to the **Diagnostic Console** (tap the connection status icon).
3. Paste the Render URL and tap **"Probe / Discovery"**.
4. The app will lock onto the cloud backend and show `✅ SUCCESS`.

### What Works on Cloud
- Question Generation (via Google Gemini API)
- Vetting Center (save/reject questions to cloud DB)
- Exam History
- Dashboard Stats
- Knowledge Library (read-only — no new PDF indexing)

---

## 🔄 Syncing Local Progress to Cloud

When you've been working locally and want to push your progress to the cloud:

1. Make sure your local database (`exam_oracle.db`) is committed to GitHub.
2. Visit: **https://ai-exam-paper-generator-i6iz.onrender.com/api/sync-cloud**
3. Wait for: `Cloud Sync Complete!`

This will securely copy all your local Subjects, Topics, Questions, PDFs, Rubrics, XP, and History to the live PostgreSQL database on Render.

> **Note**: Run `/api/fix-seq` immediately after a sync if you encounter any `duplicate key` errors when saving new questions.

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---|---|
| Generation fails: "Quota exceeded" | Switch Render `GOOGLE_API_KEY` to a fresh key in the Render dashboard |
| Can't save vetted questions (500 error) | Visit `/api/fix-seq` to reset PostgreSQL auto-increment counters |
| Phone shows "Network Error" on local mode | Replug USB cable → re-run `LAUNCH.bat` |
| Cloud app slow to respond | Normal — Render free tier "sleeps" after 15 min of inactivity |
| RAG doesn't read PDFs on cloud | Expected — index locally first, then sync via `/api/sync-cloud` |
