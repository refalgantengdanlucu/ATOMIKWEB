import { Link } from 'react-router-dom';
import { MainNavigation } from './MainNavigation';
import { Sparkles } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur border-b border-[#F1E5D8] shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 group focus:outline-hidden focus:ring-2 focus:ring-[#C2410C] rounded-lg p-1"
          aria-label="ATOMIKA Beranda"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F97316] to-[#C2410C] flex items-center justify-center text-white shadow-sm shadow-orange-950/10 group-hover:scale-105 transition-transform">
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

        {/* Navigation */}
        <MainNavigation />

        {/* Mini quick badge */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#475569] bg-[#FFF8F0] px-3 py-1.5 rounded-full border border-[#F1E5D8]">
          <Sparkles className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
          <span>Warm Science UI</span>
        </div>
      </div>
    </header>
  );
}

