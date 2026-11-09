import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0] text-[#172033]">
      {/* 1. Navbar Utama di Posisi Atas Layar */}
      <Navbar />

      {/* 2. Area Konten Dinamis (Children / Pages) */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* 3. Footer Global di Bagian Bawah */}
      <Footer />
    </div>
  );
}

