import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Atom, HelpCircle, Award } from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Beranda', icon: Home },
  { to: '/materi', label: 'Materi', icon: BookOpen },
  { to: '/lab/partikel', label: 'Laboratorium', icon: Atom },
  { to: '/kuis', label: 'Kuis', icon: HelpCircle },
  { to: '/progres', label: 'Progres', icon: Award },
];

export function MainNavigation() {
  return (
    <>
      {/* Desktop Navigation */}
      <nav
        aria-label="Navigasi Utama Desktop"
        className="hidden md:flex items-center gap-1"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                  isActive
                    ? 'bg-[#FFEDD5] text-[#C2410C] font-semibold'
                    : 'text-[#475569] hover:text-[#172033] hover:bg-orange-50'
                }`
              }
            >
              <Icon className="w-4 h-4 text-[#F97316]" aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Navigasi Utama Ponsel"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-[#F1E5D8] px-2 py-1 shadow-lg"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center flex-1 py-1.5 px-1 min-h-[48px] rounded-lg text-[11px] font-medium transition-colors ${
                    isActive
                      ? 'text-[#C2410C] font-bold bg-[#FFEDD5]/60'
                      : 'text-[#475569] hover:text-[#172033]'
                  }`
                }
              >
                <Icon
                  className="w-5 h-5 mb-0.5 text-[#F97316]"
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}

