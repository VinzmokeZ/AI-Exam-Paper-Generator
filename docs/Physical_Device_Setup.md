# Connecting a Physical Android Device to the Local AI Backend

This guide explains how your Android phone connects to the AI Engine on your PC and how to verify everything is running correctly.

## 🧠 Architecture Overview: What is happening?

Your AI Exam Generator runs in three parts:

1.  **Frontend (Android App)**: Running on your physical phone.
2.  **Backend (API Server)**: Running on your PC (Python/FastAPI).
3.  **AI Model (LLM)**: Running on your PC (Ollama/Phi-3), controlled by the Backend.

**The Challenge**: Your phone cannot use "localhost" to find your PC. It needs your PC's **Wi-Fi IP Address**.
**The Solution**: We updated the app to automatically look for your PC at `192.168.29.122:8000`.

---

## 🚀 Step-by-Step Setup Guide

### Step 1: Ensure PC & Phone are on the SAME Wi-Fi
*   Your PC and Android phone must be connected to the **same Wi-Fi network**.
*   If your PC is on Ethernet and phone on Wi-Fi, ensure they are on the same router subnet.

### Step 2: Start the Backend & AI Engine
1.  On your PC, go to the project folder.
2.  Double-click **`START_BACKEND_NOW.bat`** (or `MANUAL_LAUNCH.ps1`).
3.  **Keep this window OPEN!** This is your server.

### Step 3: Verify Backend is Running
How do you know it's working?
1.  **Look at the Console Window**: You should see:
    ```
    INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
    ```
2.  **Test from PC Browser**: Open `http://localhost:8000/docs`. If you see the API documentation (Swagger UI), the backend is ALIVE.

### Step 4: Run the App on Your Phone
1.  Connect your phone to the PC via USB.
2.  Open **Android Studio**.
3.  Select your physical phone in the device dropdown (top bar).
4.  Press the **Green Play Button (▶)**.

### Step 5: Verify Connection on Phone
1.  When the app opens, look at the **bottom of the login screen**.
2.  You should see a **Cyan (Blue) Spinner** saying "Connecting to AI Engine...".
3.  If successful, it will disappear or show a success toast.
4.  **Troubleshooting**: Tap the **Clock (9:41)** at the top left of the screen 5 times to open the **Diagnostic Overlay**. It will show exactly which URL it is trying to connect to.

---

## 🤖 The AI Language Model (LLM)
*   The LLM (Phi-3) is **embedded inside the Backend**.
*   You do **NOT** need to start a separate app for the AI.
*   When you run `START_BACKEND_NOW.bat`, it initializes the AI service automatically.
*   **Verification**: If the Backend is running, the AI is ready.

## 📋 Summary Checklist
- [ ] Phone & PC on same Wi-Fi?
- [ ] Backend Window (`START_BACKEND_NOW.bat`) is Open?
- [ ] App rebuilt & relaunched via Android Studio?
