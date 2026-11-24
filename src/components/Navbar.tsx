import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Atom, HelpCircle, Award, Sparkles, Users, LockKeyhole, LogOut, GraduationCap, LogIn } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const logoutCancelRef = useRef<HTMLButtonElement>(null);
  const logoutDialogRef = useRef<HTMLDivElement>(null);
  const navItems = teacherAccess === 'allowed'
    ? [...NAV_ITEMS, { to: '/panel-guru', label: 'Panel Guru', icon: GraduationCap }]
    : NAV_ITEMS;

  useEffect(() => {
    if (!logoutDialogOpen) return;

    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    logoutCancelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setLogoutDialogOpen(false);
        return;
      }

      if (event.key !== 'Tab') return;

      const buttons = logoutDialogRef.current?.querySelectorAll<HTMLButtonElement>(
        'button:not(:disabled)',
      );
      if (!buttons?.length) return;

      const firstButton = buttons[0];
      const lastButton = buttons[buttons.length - 1];
      if (!logoutDialogRef.current?.contains(document.activeElement)) {
        event.preventDefault();
        firstButton.focus();
      } else if (event.shiftKey && document.activeElement === firstButton) {
        event.preventDefault();
        lastButton.focus();
      } else if (!event.shiftKey && document.activeElement === lastButton) {
        event.preventDefault();
        firstButton.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [logoutDialogOpen]);

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

        {profile ? (
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <div className="hidden text-right lg:block">
              <p className="max-w-36 truncate text-xs font-bold text-[#172033]">{profile.name}</p>
              <p className="text-[10px] text-[#64748B]">
                {profile.role === 'teacher' ? 'Guru' : `Siswa · ${profile.className}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLogoutDialogOpen(true)}
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[#F1E5D8] px-2.5 text-xs font-semibold text-[#475569] transition-colors hover:bg-orange-50 sm:px-3"
              title="Keluar dari akun"
              aria-label="Keluar dari akun"
              aria-haspopup="dialog"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link
              to="/login"
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#C2410C] px-3.5 text-xs font-bold text-white transition-colors hover:bg-[#9A3412] shadow-xs sm:px-4 sm:text-sm"
              title="Masuk ke akun ATOMIKA"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              <span>Masuk</span>
            </Link>
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
      {logoutDialogOpen && createPortal(
        <div
          className="fixed inset-0 z-[9998] bg-slate-950/50 backdrop-blur-[2px]"
          onClick={() => setLogoutDialogOpen(false)}
          role="presentation"
        >
          <div
            ref={logoutDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-dialog-title"
            aria-describedby="logout-dialog-description"
            className="fixed left-1/2 top-1/2 z-[9999] max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[#F1E5D8] bg-white p-5 shadow-2xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFEDD5] text-[#C2410C]">
                <LogOut className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 id="logout-dialog-title" className="text-lg font-bold text-[#172033] sm:text-xl">
                  Yakin Ingin Keluar?
                </h2>
                <p id="logout-dialog-description" className="mt-2 text-sm leading-6 text-[#475569]">
                  Apakah kamu yakin ingin keluar dari akunmu? Pastikan pekerjaan atau aktivitasmu sudah tersimpan.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                ref={logoutCancelRef}
                type="button"
                onClick={() => setLogoutDialogOpen(false)}
                className="min-h-11 rounded-lg border border-[#E2E8F0] bg-white px-5 text-sm font-semibold text-[#475569] transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#64748B]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setLogoutDialogOpen(false);
                  void handleExit();
                }}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#C2410C] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#9A3412] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C]"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </header>
  );
}
