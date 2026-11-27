import React from 'react';
import { useEffect, useState } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import {
  getLastStorageStatus,
  isPersistentStorageAvailable,
  STORAGE_STATUS_EVENT,
} from '../lib/safe-storage';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [storageAvailable, setStorageAvailable] = useState(isPersistentStorageAvailable);
  const [navExpanded, setNavExpanded] = useState(false);

  useEffect(() => {
    const handleStorageStatus = (event: Event) => {
      const detail = (event as CustomEvent<{ persistent: boolean }>).detail;
      setStorageAvailable(detail?.persistent ?? getLastStorageStatus());
    };
    window.addEventListener(STORAGE_STATUS_EVENT, handleStorageStatus);
    return () => window.removeEventListener(STORAGE_STATUS_EVENT, handleStorageStatus);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0] text-[#172033]">
      <Navbar expanded={navExpanded} onToggle={() => setNavExpanded((expanded) => !expanded)} />

      <div className={`flex min-w-0 flex-1 flex-col pb-3 transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:pb-20 lg:pb-0 ${
        navExpanded ? 'lg:pl-[264px]' : 'lg:pl-[88px]'
      }`}>
        {!storageAvailable && (
          <div
            className="mx-auto mt-3 w-full max-w-6xl px-4 sm:px-6"
            role="status"
            aria-live="polite"
          >
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              Penyimpanan browser tidak tersedia. Progres dan data lokal hanya tersimpan sementara di memori aplikasi dan akan hilang saat halaman ditutup.
            </p>
          </div>
        )}

        <main className="max-w-6xl w-full flex-1 mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
}

