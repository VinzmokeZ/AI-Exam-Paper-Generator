import { Outlet } from 'react-router';
import { MobileNav } from './MobileNav';

export function Layout() {
  return (
    <div className="h-full flex flex-col">
      {/* Status Bar */}
      <div className="pt-12 px-6 pb-2 flex items-center justify-between text-[#F5F1ED] text-xs">
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

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
