# AI Exam Oracle - Technical Project Overview

This document provides a comprehensive technical explanation of your **AI Exam Paper Generator** project. It is written from your perspective as the developer/owner, detailing how every component works, interactions, and advanced features like Cloud API integration and RAG.

---

## 🏗️ High-Level Architecture

Your project is a **Full-Stack AI Application** designed to generate academic exam papers using local Large Language Models (LLMs) or Cloud APIs. It follows a modern client-server architecture:

1.  **Frontend (The Face):** A React-based web application (built with Vite) that provides the user interface for teachers to create exams, manage subjects, and vet questions.
2.  **Backend (The Brain):** A Python-based FastAPI server that handles logic, connects to the AI engine, manages the database, and serves data to the frontend.
3.  **Database (The Memory):** A structured storage system (MySQL for production, SQLite for dev) that saves subjects, topics, rubrics, questions, and user progress.
4.  **AI Engine (The Intelligence):** A hybrid system using **Ollama** (Local) or **OpenAI/Gemini** (Cloud) to generate intelligent questions.
5.  **RAG System (The Context):** A Retrieval-Augmented Generation system using **ChromaDB** to let the AI "read" your textbooks (PDFs/Docs) and ask questions based on *your* specific material.

---

## 🚀 Key Advanced Features (How It Works)

### 1. ☁️ Cloud API Integration (The "Fast Lane")
You added support for **OpenAI (GPT-4o)** and **Google Gemini** to make generation blazingly fast when internet is available.

*   **How it works:** In `generation_service.py`, the code checks for `OPENAI_API_KEY` or `GOOGLE_API_KEY` in your `.env` file.
*   **Smart Switching:**
    *   If you select "Cloud" in the UI, the backend bypasses the local Ollama server.
    *   It sends the prompt to OpenAI/Google servers via HTTP request.
    *   **Result:** Generation takes ~3-5 seconds (Cloud) vs. 30-60 seconds (Local).
*   **Efficiency:** This offloads the heavy math from your laptop's GPU to Google/OpenAI's massive data centers.

### 2. ⚡ High-Speed MCQ Generation
To generate multiple-choice questions quickly, you optimized the prompt engineering.

*   **Structured JSON Prompts:** You don't just ask for "questions". You ask for a specific **JSON Array** format.
    *   *Prompt:* "Generate 5 MCQs in this exact JSON format: `[{'question': '...', 'options': [...]}]`".
*   **Why it's fast:** The AI doesn't waste tokens chatting ("Sure! Here are your questions..."). It strictly outputs raw data.
*   **The "Vetting" Trick:** The AI generates the raw data, but the *Frontend* renders it beautifully. This split (Backend=Raw Data, Frontend=UI) makes the app feel instant once data arrives.

### 3. 🧠 RAG System (Retrieval-Augmented Generation)
**"How does it know *my* textbook?"**

This is the most advanced part of your project. **RAG** allows the AI to peek at your PDF textbooks before writing a question.

#### The Workflow (Step-by-Step):
1.  **Ingestion (Upload):** When you upload `Biology_Chapter1.pdf`, the backend reads the file.
2.  **Chunking:** It splits the book into small paragraphs (chunks like "Mitochondria is the powerhouse...").
3.  **Embedding (The Math Magic):** It uses a special small AI model (`all-MiniLM-L6-v2`) to turn these text chunks into **Number Lists (Vectors)**.
    *   *Example:* "Cell" might become `[0.1, 0.5, -0.2]`.
4.  **Vector Storage (ChromaDB):** These number lists are saved in a hidden folder `backend/app/chroma_db`.
5.  **Retrieval (The Query):**
    *   When you ask for "Cell Questions", the system coverts "Cell Questions" into numbers `[0.1, 0.5, -0.1]`.
    *   It searches ChromaDB for numbers *closest* to this query.
    *   It finds the "Mitochondria" chunk from your PDF!
6.  **Augmentation:** The backend rewrites your prompt to the AI:
    *   *Original:* "Write a question about Cells."
    *   *RAG Version:* "Using this context: 'Mitochondria is the powerhouse...', write a question about Cells."
7.  **Wikipedia Fallback:** If you haven't uploaded a book, the `rag_service.py` is smart enough to quickly fetch a summary from **Wikipedia** so the AI isn't clueless.

---

## 🎨 Frontend (The User Interface)
**Location:** `src/` (React Code)

*   **`GenerateExam.tsx`:** The wizard that calls the Cloud or Local API.
*   **`VettingCenter.tsx`:** A Tinder-like swipe interface to approve/reject questions.
*   **`RubricEngine.tsx`:** Defines strict exam rules (e.g., "Hard Difficulty, 10 Marks").

---

## � Backend & Database (The Logic)
**Location:** `backend/app/`

*   **`main.py`:** The traffic controller (API Routes).
*   **`llm_service.py`:** The translator that talks to Ollama or OpenAI.
*   **`models.py`:** Defines your Database Schema (Users, Subjects, Questions).

---

## 📝 Summary of Data Flow

1.  **User** clicks "Generate 5 MCQs on Java" (Cloud Mode).
2.  **Frontend** sends request to **Backend API**.
3.  **Backend** checks **RAG Service** -> finds local PDF chunk about "Java Loops".
4.  **Backend** sends prompt + PDF chunk to **OpenAI/Gemini** (Cloud).
5.  **Cloud AI** replies in 2 seconds with JSON.
6.  **Backend** saves draft questions to **Database**.
7.  **Frontend** displays questions instantly.
