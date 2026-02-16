import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MobileNav } from './MobileNav';

export function Layout() {
  const location = useLocation();

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {/* Status Bar */}
      <div className="pt-12 px-6 pb-2 flex items-center justify-between text-[#F5F1ED] text-xs relative z-50">
        <span className="font-semibold">9:41</span>
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

      {/* Main Content with Transitions */}
      <div className="flex-1 relative overflow-hidden z-10">
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
            className="absolute inset-0 overflow-y-auto custom-scrollbar"
          >
            <Outlet />
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
