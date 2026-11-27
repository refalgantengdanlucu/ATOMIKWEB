import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Atom, HelpCircle, Award, Sparkles, ClipboardCheck, LogOut, GraduationCap, LogIn, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAccess } from '../lib/access-context';
import { useTeacherAccess } from '../panel-guru/useTeacherAccess';

interface NavbarProps {
  expanded: boolean;
  onToggle: () => void;
}

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
    to: '/presensi',
    label: 'Presensi',
    icon: ClipboardCheck,
  },
];

export function Navbar({ expanded, onToggle }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, exit } = useAccess();
  const teacherAccess = useTeacherAccess();
  const [logoutError, setLogoutError] = useState('');
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const logoutCancelRef = useRef<HTMLButtonElement>(null);
  const logoutDialogRef = useRef<HTMLDivElement>(null);
  const navigationRef = useRef<HTMLElement | null>(null);
  const activeLinkRef = useRef<HTMLAnchorElement | null>(null);
  const activeIndicatorRef = useRef<HTMLSpanElement | null>(null);
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

  useLayoutEffect(() => {
    const navigation = navigationRef.current;
    const indicator = activeIndicatorRef.current;
    if (!navigation || !indicator) return;

    const updateIndicator = () => {
      const activeLink = activeLinkRef.current;
      if (!activeLink) {
        indicator.style.opacity = '0';
        return;
      }

      const navigationBounds = navigation.getBoundingClientRect();
      const activeLinkBounds = activeLink.getBoundingClientRect();
      const left = activeLinkBounds.left - navigationBounds.left + navigation.scrollLeft;
      const top = activeLinkBounds.top - navigationBounds.top + navigation.scrollTop;

      indicator.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      indicator.style.width = `${activeLinkBounds.width}px`;
      indicator.style.height = `${activeLinkBounds.height}px`;
      indicator.style.borderRadius = expanded ? '9999px' : '50%';
      indicator.style.opacity = '1';
    };

    updateIndicator();
    const resizeObserver = new ResizeObserver(updateIndicator);
    resizeObserver.observe(navigation);
    if (activeLinkRef.current) resizeObserver.observe(activeLinkRef.current);
    navigation.addEventListener('scroll', updateIndicator, { passive: true });
    window.addEventListener('resize', updateIndicator);

    return () => {
      resizeObserver.disconnect();
      navigation.removeEventListener('scroll', updateIndicator);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [expanded, location.pathname, navItems.length]);

  return (
      <header
        aria-label="Navigasi ATOMIKA"
        className={`fixed left-3 top-3 z-50 flex flex-col rounded-[2rem] border border-white/15 bg-gradient-to-b from-[#C2410C] via-[#B63B0B] to-[#9A3412] p-2 text-white shadow-[0_16px_48px_rgba(87,35,13,0.28)] transition-[width,height,border-radius] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] max-lg:w-auto lg:bottom-3 lg:left-3 lg:top-3 ${
          expanded
            ? 'w-[248px] max-lg:bottom-3 max-lg:right-3 max-lg:top-auto max-lg:h-[min(70vh,560px)] max-lg:flex-col max-lg:items-stretch'
            : 'w-[72px] max-lg:bottom-3 max-lg:right-3 max-lg:top-auto max-lg:h-16 max-lg:flex-row max-lg:items-center max-lg:rounded-full'
        }`}
      >
        <div className={`flex min-h-0 w-full min-w-0 flex-1 flex-col items-stretch gap-3 px-1.5 ${
          expanded
            ? 'max-lg:min-h-12 max-lg:flex-col max-lg:items-stretch max-lg:gap-2'
            : 'max-lg:flex-row max-lg:items-center max-lg:justify-center'
        }`}>
        <Link
          to="/"
            className="group flex min-w-0 shrink-0 items-center gap-3 rounded-xl p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFF8F0]"
          aria-label="ATOMIKA Beranda"
        >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-white shadow-inner shadow-white/10 transition-transform duration-200 group-hover:scale-105">
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
          <div className={`min-w-0 transition-[opacity,width] duration-200 ${expanded ? 'w-auto opacity-100' : 'w-0 overflow-hidden opacity-0'}`}>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white">ATOMIKA</span>
              <span className="inline-flex items-center rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-[#FFF8F0]">
                Fase E
              </span>
            </div>
            <p className="mt-0.5 whitespace-nowrap text-[10px] leading-none text-orange-100">
              Struktur Atom Interaktif SMA/MA
            </p>
          </div>
        </Link>

        <nav
          ref={navigationRef}
          aria-label="Navigasi Utama"
          className={`relative flex min-h-0 w-full min-w-0 flex-1 flex-col gap-1 overflow-y-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-lg:overflow-x-auto max-lg:overflow-y-hidden ${
            expanded
              ? 'max-lg:flex-col max-lg:items-stretch'
              : 'max-lg:flex-row max-lg:items-center max-lg:py-0'
          }`}
        >
          <span
            ref={activeIndicatorRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-0 rounded-full bg-[#FFF1E2] opacity-0 shadow-[0_5px_18px_rgba(255,237,213,0.22)] transition-[transform,width,height,border-radius,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          />
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = checkIsActive(item);
            const label = item.label;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                ref={active ? activeLinkRef : undefined}
                title={expanded ? undefined : label}
                aria-label={label}
                className={`group relative z-10 flex min-h-11 shrink-0 items-center gap-3 rounded-full px-3 text-sm font-semibold transition-[background-color,color,transform,box-shadow] duration-[250ms] ease-out ${
                  expanded ? 'w-full' : 'justify-center lg:w-11 lg:px-0'
                } max-lg:w-11 max-lg:justify-center max-lg:px-0 ${
                  expanded ? 'max-lg:w-full max-lg:justify-start max-lg:px-3' : ''
                } ${
                  active
                    ? 'text-[#9A3412]'
                    : 'text-orange-50/85 hover:bg-white/12 hover:text-white'
                } hover:scale-[1.03]`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon
                  className={`h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    active ? 'text-[#C2410C]' : 'text-orange-100'
                  }`}
                  aria-hidden="true"
                />
                <span className={`min-w-0 truncate transition-[opacity,width] duration-200 ${
                  expanded ? 'w-auto opacity-100' : 'w-0 overflow-hidden opacity-0'
                }`}>
                  {label}
                </span>
                {!expanded && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-[calc(100%+0.75rem)] top-1/2 z-[60] -translate-x-1 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#172033] px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 max-lg:hidden"
                  >
                    {label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className={`flex w-full shrink-0 flex-col gap-2 border-t border-white/15 pt-3 ${
          expanded
            ? 'max-lg:flex-col max-lg:items-stretch max-lg:border-l-0 max-lg:border-t max-lg:pl-0 max-lg:pt-3'
            : 'items-center max-lg:flex-row max-lg:items-center max-lg:gap-1 max-lg:border-l max-lg:border-t-0 max-lg:pl-1 max-lg:pt-0'
        }`}>
          {profile ? (
            <>
              <div className={`min-w-0 px-2 text-left transition-[opacity,width] duration-200 ${
                expanded ? 'w-auto opacity-100' : 'w-0 overflow-hidden px-0 opacity-0'
              }`}>
                <p className="truncate text-xs font-bold text-white">{profile.name}</p>
                <p className="truncate text-[10px] text-orange-100">
                  {profile.role === 'teacher' ? 'Guru' : `Siswa · ${profile.className}`}
                </p>
              </div>
            <button
              type="button"
              onClick={() => setLogoutDialogOpen(true)}
              className={`inline-flex min-h-11 shrink-0 items-center gap-3 rounded-2xl border border-white/15 px-3 text-sm font-semibold text-orange-50 transition-colors hover:bg-white/12 ${
                expanded ? 'w-full justify-start' : 'w-11 justify-center px-0'
              } max-lg:min-h-10 ${
                expanded
                  ? 'max-lg:w-full max-lg:justify-start max-lg:px-3'
                  : 'max-lg:w-10 max-lg:justify-center max-lg:px-0'
              }`}
              title="Keluar dari akun"
              aria-label="Keluar dari akun"
              aria-haspopup="dialog"
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              <span className={`transition-[opacity,width] duration-200 ${
                expanded ? 'w-auto opacity-100' : 'w-0 overflow-hidden opacity-0'
              }`}>Keluar</span>
            </button>
            </>
          ) : (
            <Link
              to="/login"
              aria-label="Masuk ke akun ATOMIKA"
              title="Masuk ke akun ATOMIKA"
              className={`inline-flex min-h-11 shrink-0 items-center gap-3 rounded-2xl bg-[#FFF1E2] px-3 text-sm font-bold text-[#9A3412] shadow-sm transition-colors hover:bg-white ${
                expanded ? 'w-full justify-start' : 'w-11 justify-center px-0'
              } max-lg:min-h-10 ${
                expanded
                  ? 'max-lg:w-full max-lg:justify-start max-lg:px-3'
                  : 'max-lg:w-10 max-lg:justify-center max-lg:px-0'
              }`}
            >
              <LogIn className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              <span className={`transition-[opacity,width] duration-200 ${
                expanded ? 'w-auto opacity-100' : 'w-0 overflow-hidden opacity-0'
              }`}>Masuk</span>
            </Link>
          )}

          <div className={`hidden items-center gap-2 px-2 text-[11px] text-orange-100/85 ${
            expanded ? '2xl:flex' : ''
          }`}>
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-orange-200" aria-hidden="true" />
            <span>Kimia SMA/MA</span>
          </div>

          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-orange-50/85 transition-colors hover:bg-white/12 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFF8F0] max-lg:h-10 max-lg:w-10"
            aria-label={expanded ? 'Perkecil navigasi' : 'Perluas navigasi'}
            aria-expanded={expanded}
            title={expanded ? 'Perkecil navigasi' : 'Perluas navigasi'}
          >
            {expanded
              ? <PanelLeftClose className="h-[18px] w-[18px]" aria-hidden="true" />
              : <PanelLeftOpen className="h-[18px] w-[18px]" aria-hidden="true" />}
          </button>
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
