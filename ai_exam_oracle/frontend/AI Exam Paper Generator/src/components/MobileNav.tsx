import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Sparkles, CheckSquare, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';

const navItems = [
  { path: '/', label: 'HOME', icon: Home },
  { path: '/subjects', label: 'LIBRARY', icon: BookOpen },
  { path: '/generate', label: 'GENERATE', icon: Sparkles },
  { path: '/vetting', label: 'VETTING', icon: CheckSquare },
  { path: '/reports', label: 'REPORTS', icon: BarChart3 },
];

export function MobileNav() {
  return (
    <nav className="bg-[#0D2626]/80 backdrop-blur-xl border-t border-white/5 pb-8 pt-4 px-2">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isGenerate = item.label === 'GENERATE';

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-1.5 py-2 px-1 transition-all duration-300 ${isActive ? 'text-white' : 'text-[#8B9E9E]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && !isGenerate && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute -top-1 w-1 h-1 bg-[#C5B3E6] rounded-full shadow-[0_0_8px_#C5B3E6]"
                    />
                  )}

                  <div className={`
                    relative flex items-center justify-center
                    ${isGenerate && isActive ? 'w-14 h-14 bg-[#4D4D5C] rounded-2xl -translate-y-4 shadow-2xl border-2 border-white/10' : 'w-10 h-10'}
                    ${isGenerate && !isActive ? 'w-14 h-14 rounded-2xl -translate-y-4' : ''}
                    transition-all duration-500
                  `}>
                    {isGenerate && isActive && (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#C5B3E6]/20 to-transparent rounded-2xl blur-sm" />
                    )}
                    <Icon
                      className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}
                      size={isGenerate ? 28 : 24}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </div>

                  <span className={`
                    text-[9px] font-black uppercase tracking-[0.15em] transition-colors duration-300
                    ${isGenerate && isActive ? 'mt-[-12px] text-[#C5B3E6]' : ''}
                    ${isActive ? 'text-white' : 'text-[#8B9E9E]'}
                  `}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

