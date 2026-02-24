/**
 * Keep-Alive Service
 * Pings the backend every 10 minutes while the user has the app open.
 * Prevents Render's free tier from spinning down after 15 min inactivity,
 * which causes a slow cold start (20-40s) on the next request.
 */

import { api } from './api';

let intervalId: ReturnType<typeof setInterval> | null = null;
const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Start the keep-alive background ping.
 * Safe to call multiple times — won't create duplicate intervals.
 */
export function startKeepAlive(): void {
    if (intervalId !== null) return; // Already running

    // Ping once immediately on start to warm up the server
    pingBackend();

    // Then every 10 minutes
    intervalId = setInterval(pingBackend, PING_INTERVAL_MS);
    console.log('[KeepAlive] 🟢 Started — pinging backend every 10 minutes to prevent cold start.');
}

/**
 * Stop the keep-alive ping (called on app unmount).
 */
export function stopKeepAlive(): void {
    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
        console.log('[KeepAlive] 🔴 Stopped.');
    }
}

async function pingBackend(): Promise<void> {
    try {
        // Use the same axios instance as the rest of the app — it already knows the correct URL
        await api.get('/ping', { timeout: 8000 });
        console.log('[KeepAlive] ✅ Ping successful — backend is awake.');
    } catch {
        // Silent fail — server may be waking up, which is exactly what we want
    }
}
