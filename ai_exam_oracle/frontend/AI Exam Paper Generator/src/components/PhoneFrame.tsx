import { ReactNode } from 'react';

interface PhoneFrameProps {
  children: ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="relative mx-auto" style={{ width: '390px', height: '844px' }}>
      {/* Phone Frame */}
      <div className="absolute inset-0 rounded-[60px] bg-gradient-to-b from-gray-900 to-black p-3 shadow-2xl">
        {/* Inner bezel */}
        <div className="relative w-full h-full rounded-[48px] overflow-hidden bg-black" style={{ transform: 'translateZ(0)' }}>
          {/* Dynamic Island */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[37px] bg-black rounded-b-[20px] z-[10001] flex items-center justify-center">
            <div className="w-[90px] h-[8px] bg-gray-950 rounded-full" />
          </div>

          {/* Screen Content */}
          <div className="w-full h-full gradient-bg overflow-hidden relative z-0">
            {children}
          </div>

          {/* Modal Portal Root - Absolute Top Layer */}
          <div id="modal-root" className="absolute inset-0 z-[10000]" />
        </div>
      </div>

      {/* Phone buttons */}
      <div className="absolute right-0 top-[140px] w-1 h-[60px] bg-gray-800 rounded-l" />
      <div className="absolute right-0 top-[220px] w-1 h-[60px] bg-gray-800 rounded-l" />
      <div className="absolute right-0 top-[290px] w-1 h-[60px] bg-gray-800 rounded-l" />
      <div className="absolute left-0 top-[200px] w-1 h-[80px] bg-gray-800 rounded-r" />
    </div>
  );
}
