import { useRef } from 'react';
import { HomeHero } from '../components/HomeHero';
import { LandingAlurBelajar } from '../components/LandingAlurBelajar';
import { LandingLaboratorium } from '../components/LandingLaboratorium';
import { LandingKeunggulan } from '../components/LandingKeunggulan';
import { LandingCta } from '../components/LandingCta';
import { useAccess } from '../lib/access-context';
import { StudentActivityReporter } from '../components/AccessGate';
import { useHomepageScrollAnimations } from '../lib/useHomepageScrollAnimations';

export function HomePage() {
  const { profile } = useAccess();
  const pageRef = useRef<HTMLDivElement>(null);
  useHomepageScrollAnimations(pageRef);

  return (
    <div ref={pageRef} className="pb-12 space-y-12">
      {/* Jika siswa sudah login membuka beranda, laporkan aktivitasnya */}
      {profile && <StudentActivityReporter profile={profile} />}

      {/* 1. Hero Section 2 Kolom dengan Pratinjau Model Bohr & Micro-stats */}
      <HomeHero />

      {/* 2. Section Alur Belajar: Jelajahi Struktur Atom */}
      <LandingAlurBelajar />

      {/* 3. Section Laboratorium Interaktif: Belajar Melalui Eksplorasi */}
      <LandingLaboratorium />

      {/* 4. Section Keunggulan ATOMIKAWEB */}
      <LandingKeunggulan />

      {/* 5. Section CTA: Mulai Eksplorasi Dunia Atom */}
      <LandingCta />
    </div>
  );
}
