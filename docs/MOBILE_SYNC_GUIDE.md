# 📱 Android Mobile Bridge & Sync Guide

This guide explains the underlying synchronization and monitoring bridge that connects your Laptop's AI power to your physical Android Phone.

---

## 🏗️ 1. The USB ADB Bridge Logic
The application uses **ADB Reverse** to create a secure, low-latency data tunnel over your USB cable.

### The Backend Connection
1.  When you run `LAUNCH.bat`, the command `adb reverse tcp:8000 tcp:8000` is executed.
2.  This maps the phone's `localhost:8000` directly to your laptop's Python API.
3.  **Encrypted Tunneling**: In some modes (like `FIREBASE_ONE_CLICK.bat`), we also start a Localtunnel, allowing you to access the AI over 5G/WiFi without a cable.

---

## 🚦 2. Mobile Health Status Indicators
We've implemented a real-time monitor on the mobile UI to help you debug connectivity.

### The Cyan Pulse (The "Heartbeat")
- **Active Cyan**: Means the background **System Audit** (`health_service.py`) successfully talked to the phone. 
- **Dim/Gray**: Means the ADB Reverse connection is broken.
- **Flashing**: Means the AI is currently pulling a model or processing a large Knowledge Base.

### Why does it matter?
Because the Android APK is a hybrid app (Capacitor), it relies on the laptop being "Online" for any AI generation. If the light is off, the **Vetting Center** and **History** will show "Network Error."

---

## 🔄 3. Using `ANDROID_FULL_SYNC.bat`
This script is your "One-Click Deploy" for code changes.

### What it updates:
1.  **Frontend Logic**: Moves updated TSX/JSX logic into the APK.
2.  **UI Adjustments**: Pushes new CSS, animations (Framer Motion), and responsive layouts.
3.  **Knowledge Base Links**: Synchronizes the list of active Google Drive links to the phone.

---

## 🛠️ 4. Mobile Troubleshooting
If generation fails on the phone but works on the PC:
1.  **Check Developer Options**: Ensure "USB Debugging" is still ON.
2.  **Toggle the Engine**: Try switching from **Local** to **Cloud** on the Dashboard; sometimes the phone's RAM cannot handle local LLM overhead if the bridge is unstable.
3.  **Clean Cache**: Run the sync script to purge stale Android build assets.
