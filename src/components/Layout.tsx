import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MobileNav } from './MobileNav';
import { useState, useEffect } from 'react';
import { api, discoverConnectivity, connectionLogs } from '../services/api';
import { Modal } from './Modal';

export function Layout() {
  const location = useLocation();
  const [debugInfo, setDebugInfo] = useState<{ url: string; status: string }>({ url: api.defaults.baseURL || '?', status: 'Idle' });
  const [showDebug, setShowDebug] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, []);

  // Format time as HH:mm
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Auto-refresh debug info
  useEffect(() => {
    const interval = setInterval(() => {
      setDebugInfo(prev => ({ ...prev, url: api.defaults.baseURL || '?' }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const runDiagnostics = async () => {
    setDebugInfo(prev => ({ ...prev, status: 'Testing...' }));
    try {
      const start = Date.now();
      await api.get('/health');
      const latency = Date.now() - start;
      setDebugInfo(prev => ({ ...prev, status: `✅ OK (${latency}ms)` }));
      alert(`Connected to ${api.defaults.baseURL} in ${latency}ms`);
    } catch (err: any) {
      setDebugInfo(prev => ({ ...prev, status: `❌ ${err.message}` }));
      alert(`Failed: ${err.message}\nURL: ${api.defaults.baseURL}`);
    }
  };

  const runRescan = async () => {
    setIsScanning(true);
    setLogLines([]);
    await discoverConnectivity();
    setLogLines([...connectionLogs].slice(0, 6));
    setDebugInfo(prev => ({ ...prev, url: api.defaults.baseURL || '?' }));
    setIsScanning(false);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {/* Status Bar */}
      <div className="pt-14 px-6 pb-2 flex items-center justify-between text-[#F5F1ED] text-xs relative z-50">
        <div
          className="flex items-center gap-1.5 cursor-pointer active:opacity-50 transition-opacity pr-4 py-1"
          onClick={() => setShowDebug(!showDebug)}
        >
          <span className="font-bold tracking-tight">
            {formatTime(time)}
          </span>
          <span className="text-[10px] opacity-40">🔍</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-3" viewBox="0 0 16 12" fill="currentColor">
            <path d="M1 4h2v4H1V4zm4-2h2v8H5V2zm4 3h2v5H9V5zm4-3h2v8h-2V2z" />
          </svg>
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 4h12v6H2z" />
            <path d="M14 5h1v4h-1z" fillOpacity="0.4" />
          </svg>
        </div>
      </div>

      {/* Debug Overlay - Using Standard Modal for Maximum Z-Index Stability */}
      <Modal
        isOpen={showDebug}
        onClose={() => setShowDebug(false)}
        title="Diagnostic Console"
        subtitle="NETWORK & CONNECTION TOOLS"
        variant="dark"
      >
        <div className="space-y-4">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Connection Status</span>
              <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${debugInfo.status.includes('✅') ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {debugInfo.status}
              </div>
            </div>
            <p className="text-blue-400 font-mono text-xs truncate">{debugInfo.url}</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Manual Override</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="192.168.x.x"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 text-sm font-mono"
                id="manual-ip-input"
              />
              <button
                onClick={() => {
                  const input = document.getElementById('manual-ip-input') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    let val = input.value.trim().replace(/\/+$/, ''); // Remove trailing slashes

                    // Remove protocol for clean parsing
                    let cleanIp = val.replace(/^https?:\/\//, '');

                    // Remove /api if user added it
                    cleanIp = cleanIp.replace(/\/api$/, '');

                    // Check for port
                    if (!cleanIp.includes(':')) {
                      cleanIp = `${cleanIp}:8000`;
                    }

                    const finalUrl = `http://${cleanIp}`;

                    localStorage.setItem('active_discovered_url', finalUrl);
                    localStorage.setItem('last_local_ip', cleanIp.split(':')[0]);
                    window.location.reload();
                  }
                }}
                className="px-4 bg-blue-600 active:bg-blue-700 rounded-xl text-white font-bold text-xs shadow-lg shadow-blue-600/20"
              >
                LINK
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={runDiagnostics}
              className="py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold rounded-xl transition-all text-xs"
            >
              Test Signal
            </button>
            <button
              onClick={runRescan}
              disabled={isScanning}
              className="py-3 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 font-bold rounded-xl transition-all text-xs disabled:opacity-50"
            >
              {isScanning ? '⏳ Scanning...' : '🔄 RE-SCAN'}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('active_discovered_url');
                localStorage.removeItem('last_local_ip');
                window.location.reload();
              }}
              className="py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold rounded-xl transition-all text-xs col-span-2"
            >
              UNLINK / RESET
            </button>
          </div>

          {/* Live connection log */}
          {logLines.length > 0 && (
            <div className="bg-black/30 rounded-xl p-3 border border-white/5">
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-2">Scan Log</p>
              {logLines.map((line, i) => (
                <p key={i} className={`text-[10px] font-mono leading-relaxed ${line.includes('✅') ? 'text-green-400' :
                  line.includes('❌') ? 'text-red-400/70' :
                    'text-white/40'
                  }`}>{line}</p>
              ))}
            </div>
          )}

          <div className="text-[10px] text-white/20 text-center font-mono pt-1 pb-1">
            <div className="flex flex-col gap-1">
              <span>LINKED TO:</span>
              <span className="text-cyan-400 font-bold text-xs">
                {localStorage.getItem('active_discovered_url') || 'SEARCHING...'}
              </span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Main Content with Transitions */}
      <div className="flex-1 relative z-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className="absolute inset-0"
          >
            <div className="h-full w-full overflow-y-auto custom-scrollbar">
              <Outlet />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="relative z-50">
        <MobileNav />
      </div>
    </div>
  );
}
