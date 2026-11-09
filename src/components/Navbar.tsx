import { NavLink, useLocation, Link } from 'react-router-dom';
import { Home, BookOpen, Atom, HelpCircle, Award, Sparkles } from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
  matchPrefix?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Beranda', icon: Home },
  { to: '/materi', label: 'Materi', icon: BookOpen, matchPrefix: ['/materi'] },
  {
    to: '/laboratorium',
    label: 'Laboratorium',
    icon: Atom,
    matchPrefix: ['/laboratorium', '/lab'],
  },
  { to: '/kuis', label: 'Kuis', icon: HelpCircle, matchPrefix: ['/kuis'] },
  { to: '/progres', label: 'Progres', icon: Award, matchPrefix: ['/progres'] },
];

export function Navbar() {
  const location = useLocation();

  // Helper untuk menentukan apakah link navigasi sedang aktif
  const isItemActive = (item: NavItem) => {
    if (item.to === '/') {
      return location.pathname === '/';
    }
    if (item.matchPrefix) {
      return item.matchPrefix.some((prefix) =>
        location.pathname.startsWith(prefix)
      );
    }
    return location.pathname.startsWith(item.to);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-[#F1E5D8] shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 group focus:outline-hidden focus:ring-2 focus:ring-[#C2410C] rounded-lg p-1"
          aria-label="ATOMIKA — Halaman Beranda"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F97316] to-[#C2410C] flex items-center justify-center text-white shadow-sm shadow-orange-950/15 group-hover:scale-105 transition-transform">
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3" fill="#FFF8F0" />
              <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(30 12 12)" />
              <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-30 12 12)" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-[#172033]">
                ATOMIKA
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFEDD5] text-[#C2410C]">
                Fase E
              </span>
            </div>
            <p className="text-[11px] text-[#475569] leading-none hidden sm:block">
              Struktur Atom Interaktif SMA/MA
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Bar (Top) */}
        <nav
          aria-label="Navigasi Utama Layar Lebar"
          className="hidden md:flex items-center gap-1.5"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 min-h-[44px] ${
                  active
                    ? 'bg-[#FFEDD5] text-[#C2410C] font-bold border border-[#F97316]/30 shadow-xs'
                    : 'text-[#475569] hover:text-[#172033] hover:bg-orange-50/70 border border-transparent'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    active ? 'text-[#C2410C]' : 'text-[#F97316]'
                  }`}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Quick Badge */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#475569] bg-[#FFF8F0] px-3 py-1.5 rounded-full border border-[#F1E5D8]">
          <Sparkles className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
          <span>Kimia Kelas X</span>
        </div>
      </div>

      {/* Mobile Navigation Bar (Sleek Bottom Floating Bar for Mobile) */}
      <nav
        aria-label="Navigasi Utama Ponsel"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-[#F1E5D8] px-2 py-1 shadow-lg"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center flex-1 py-1 px-1 min-h-[48px] rounded-xl text-[11px] transition-all ${
                  active
                    ? 'text-[#C2410C] font-bold bg-[#FFEDD5]/70'
                    : 'text-[#475569] hover:text-[#172033]'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon
                  className={`w-5 h-5 mb-0.5 ${
                    active ? 'text-[#C2410C]' : 'text-[#F97316]'
                  }`}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

