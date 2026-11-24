import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Atom, HelpCircle, Award, Sparkles, Users, LockKeyhole, LogOut, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { useAccess } from '../lib/access-context';
import { useProgress } from '../lib/progress';
import { useTeacherAccess } from '../panel-guru/useTeacherAccess';
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
  const { isLaboratoryUnlocked, areQuizzesUnlocked } = useProgress();
  const teacherAccess = useTeacherAccess();
  const [logoutError, setLogoutError] = useState('');
  const navItems = teacherAccess === 'allowed'
    ? [...NAV_ITEMS, { to: '/panel-guru', label: 'Panel Guru', icon: GraduationCap }]
    : NAV_ITEMS;

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
    <header className="sticky top-0 z-50 w-full border-b border-[#F1E5D8] bg-white/95 shadow-xs backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-3 sm:gap-3 sm:px-6">
        <Link
          to="/"
          className="group flex shrink-0 items-center gap-2 rounded-lg p-1 focus:outline-hidden focus:ring-2 focus:ring-[#C2410C] sm:gap-3"
          aria-label="ATOMIKA Beranda"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F97316] to-[#C2410C] text-white shadow-sm shadow-orange-950/15 transition-transform group-hover:scale-105">
            <svg
              className="h-6 w-6"
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
          <div className="hidden min-w-0 sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-[#172033]">ATOMIKA</span>
              <span className="hidden 2xl:inline-flex items-center rounded-full bg-[#FFEDD5] px-2 py-0.5 text-[10px] font-semibold text-[#C2410C]">
                Fase E
              </span>
            </div>
            <p className="hidden text-[11px] leading-none text-[#475569] lg:block">
              Struktur Atom Interaktif SMA/MA
            </p>
          </div>
        </Link>

        <nav
          aria-label="Navigasi Utama"
          className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto whitespace-nowrap py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = checkIsActive(item);
            const isLocked = profile?.role === 'student' && (
              (item.to === '/laboratorium' && !isLaboratoryUnlocked()) ||
              (item.to === '/kuis' && !areQuizzesUnlocked())
            );
            const label = item.to === '/kelas' && profile?.role === 'teacher'
              ? 'Dashboard Guru'
              : item.label;

            if (isLocked) {
              return (
                <span
                  key={item.to}
                  aria-disabled="true"
                  title={item.to === '/laboratorium'
                    ? 'Selesaikan semua materi Topik 1–3 untuk membuka laboratorium'
                    : 'Selesaikan semua mode laboratorium untuk membuka kuis'}
                  className="flex min-h-10 shrink-0 cursor-not-allowed items-center gap-1.5 rounded-lg border border-transparent px-2.5 text-xs font-semibold text-slate-400 sm:px-3 sm:text-sm"
                >
                  <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                  <span>{label}</span>
                </span>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-all sm:px-3 sm:text-sm ${
                  active
                    ? 'border-[#F97316]/40 bg-[#FFEDD5] text-[#C2410C] shadow-xs'
                    : 'border-transparent text-[#475569] hover:bg-orange-50/70 hover:text-[#172033]'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${active ? 'text-[#C2410C]' : 'text-[#F97316]'}`}
                  aria-hidden="true"
                />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        {profile && (
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <div className="hidden text-right lg:block">
              <p className="max-w-36 truncate text-xs font-bold text-[#172033]">{profile.name}</p>
              <p className="text-[10px] text-[#64748B]">
                {profile.role === 'teacher' ? 'Guru' : `Siswa · ${profile.className}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleExit()}
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[#F1E5D8] px-2.5 text-xs font-semibold text-[#475569] transition-colors hover:bg-orange-50 sm:px-3"
              title="Keluar dari akun"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        )}

        <div className="hidden shrink-0 items-center gap-1.5 rounded-full border border-[#F1E5D8] bg-[#FFF8F0] px-3 py-1.5 text-xs text-[#475569] 2xl:flex">
          <Sparkles className="h-3.5 w-3.5 text-[#F97316]" aria-hidden="true" />
          <span>Kimia SMA/MA</span>
        </div>
      </div>
      {logoutError && (
        <p role="alert" className="absolute right-4 top-full rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 shadow-sm">
          {logoutError}
        </p>
      )}
    </header>
  );
}
