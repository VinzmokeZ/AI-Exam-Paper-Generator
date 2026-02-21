import { NavLink } from 'react-router';
import { Home, BookOpen, Sparkles, CheckSquare, BarChart3 } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/subjects', label: 'Library', icon: BookOpen },
  { path: '/generate', label: 'Generate', icon: Sparkles },
  { path: '/vetting', label: 'Vetting', icon: CheckSquare },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
];

export function MobileNav() {
  return (
    <nav className="bg-[#0D2626] border-t-4 border-[#0A1F1F] pb-6">
      <div className="flex items-center justify-around px-4 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-all ${
                  isActive ? 'text-[#C5B3E6]' : 'text-[#8B9E9E]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute inset-0 bg-[#C5B3E6]/20 rounded-2xl" />
                  )}
                  <Icon className="w-6 h-6 relative z-10" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[9px] font-bold uppercase tracking-wider relative z-10">
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
