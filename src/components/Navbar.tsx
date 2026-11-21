import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Atom, HelpCircle, Award, Sparkles, Users, LogOut, LogIn, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useAccess } from '../lib/access-context';
interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
  aliases?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Beranda', icon: Home },
  { to: '/materi', label: 'Materi', icon: BookOpen },
  {
    to: '/laboratorium',
    label: 'Laboratorium',
    icon: Atom,
    aliases: ['/lab'],
  },
  { to: '/kuis', label: 'Kuis', icon: HelpCircle },
  { to: '/progres', label: 'Progres', icon: Award },
  {
    to: '/kelas',
    label: 'Kegiatan Kelas',
    icon: Users,
    aliases: ['/guru', '/dashboard'],
  },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, exit } = useAccess();
  const [logoutError, setLogoutError] = useState('');

  const handleExit = async () => {
    setLogoutError('');
    try {
      await exit();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Gagal mengakhiri sesi:', error);
      setLogoutError('Sesi belum dapat diakhiri. Silakan coba lagi.');
    }
  };

  // Memeriksa status aktif rute saat ini
  const checkIsActive = (item: NavItem) => {
    const current = location.pathname;
    if (item.to === '/') {
      return current === '/' || current === '';
    }
    if (current.startsWith(item.to)) {
      return true;
    }
    if (item.aliases) {
      return item.aliases.some((alias) => current.startsWith(alias));
    }
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#F1E5D8] shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Baris Utama Header */}
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Logo Brand */}
          <Link
            to="/"
            className="flex items-center gap-3 shrink-0 group focus:outline-hidden focus:ring-2 focus:ring-[#C2410C] rounded-lg p-1"
            aria-label="ATOMIKA Beranda"
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

          {/* Desktop Nav Items (Layar md ke atas) */}
          <nav
            aria-label="Navigasi Utama Desktop"
            className="hidden md:flex items-center gap-1.5"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = checkIsActive(item);
              const label =
                item.to === '/kelas' && profile?.role === 'teacher'
                  ? 'Dashboard Guru'
                  : item.label;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
                    active
                      ? 'bg-[#FFEDD5] text-[#C2410C] border border-[#F97316]/40 shadow-xs'
                      : 'text-[#475569] hover:text-[#172033] hover:bg-orange-50/70 border border-transparent'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      active ? 'text-[#C2410C]' : 'text-[#F97316]'
                    }`}
                    aria-hidden="true"
                  />
                  <span>{label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Action: User profile if logged in, or Masuk & Mulai Belajar if guest */}
          {profile ? (
            <div className="hidden sm:flex items-center gap-2">
              <div className="text-right">
                <p className="text-xs font-bold text-[#172033]">{profile.name}</p>
                <p className="text-[10px] text-[#64748B]">
                  {profile.role === 'teacher' ? 'Guru' : `Siswa · ${profile.className}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleExit()}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-[#F1E5D8] px-3 text-xs font-semibold text-[#475569] hover:bg-orange-50 transition-colors"
                title="Keluar dari akun"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Keluar
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[#F1E5D8] bg-white px-3.5 py-2 text-xs font-semibold text-[#172033] hover:bg-orange-50/80 hover:border-[#F97316]/40 transition-colors shadow-2xs"
                title="Masuk ke Akun ATOMIKA"
              >
                <LogIn className="h-3.5 w-3.5 text-[#F97316]" aria-hidden="true" />
                <span>Masuk</span>
              </Link>
              <Link
                to="/materi"
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
              >
                <span>Mulai Belajar</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          )}

          {/* Badge Kurikulum */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#475569] bg-[#FFF8F0] px-3 py-1.5 rounded-full border border-[#F1E5D8]">
            <Sparkles className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
            <span>Kimia SMA/MA</span>
          </div>
        </div>

        {logoutError && <p role="alert" className="pb-2 text-right text-xs font-semibold text-red-700">{logoutError}</p>}

        {/* Mobile Nav Bar (TETAP DI ATAS LAYAR, tidak disembunyikan, scrollable horizontal) */}
        <nav
          aria-label="Navigasi Utama Ponsel Atas"
          className="md:hidden flex items-center gap-1.5 overflow-x-auto py-2 border-t border-[#F1E5D8]/60 no-scrollbar"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = checkIsActive(item);
            const label =
              item.to === '/kelas' && profile?.role === 'teacher'
                ? 'Dashboard Guru'
                : item.label;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all min-h-[36px] ${
                  active
                    ? 'bg-[#FFEDD5] text-[#C2410C] border border-[#F97316]/40 shadow-xs'
                    : 'text-[#475569] hover:text-[#172033] hover:bg-orange-50/70 border border-transparent'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    active ? 'text-[#C2410C]' : 'text-[#F97316]'
                  }`}
                  aria-hidden="true"
                />
                <span>{label}</span>
              </NavLink>
            );
          })}
          {profile ? (
            <button
              type="button"
              onClick={() => void handleExit()}
              className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#475569] hover:bg-orange-50"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Keluar
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-lg bg-[#C2410C] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#9A3412]"
            >
              <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
              Masuk
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
