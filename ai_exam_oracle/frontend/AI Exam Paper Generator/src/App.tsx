import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from './routes';
import { PhoneFrame } from './components/PhoneFrame';
import { useEffect, useState } from 'react';
import { discoverConnectivity } from './services/api';

export default function App() {
  const [backendReady, setBackendReady] = useState(false);

  useEffect(() => {
    // Await backend discovery before rendering any routes
    // This ensures no API calls happen before the correct URL is locked in
    discoverConnectivity().then((found) => {
      if (!found) {
        console.warn('[App] Backend not found — running in offline mode');
      }
      setBackendReady(true); // Render app regardless (offline fallbacks exist)
    }).catch(err => {
      console.error("FATAL DISCOVERY ERROR", err);
      setBackendReady(true);
    });
  }, []);

  if (!backendReady) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0D1A1A', // Matches capacitor config background
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        gap: '16px'
      }}>
        <div style={{
          width: '48px', height: '48px',
          border: '3px solid #333',
          borderTop: '3px solid #00e5ff',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>Connecting to AI Engine...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0a0a0f] via-[#16161f] to-[#1a1a2e]">
      <Toaster theme="dark" position="top-center" richColors />
      <PhoneFrame>
        <RouterProvider router={router} />
      </PhoneFrame>
    </div>
  );
}
