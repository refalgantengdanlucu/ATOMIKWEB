import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Atom, CheckCircle2, ShieldCheck, Layers, BookOpen, HelpCircle } from 'lucide-react';
import { AtomCanvas } from './AtomCanvas';

interface PreviewAtom {
  symbol: string;
  name: string;
  protons: number;
  neutrons: number;
  electrons: number;
  shells: number[];
}

const PREVIEW_ATOMS: PreviewAtom[] = [
  {
    symbol: 'Li',
    name: 'Litium',
    protons: 3,
    neutrons: 4,
    electrons: 3,
    shells: [2, 1],
  },
  {
    symbol: 'C',
    name: 'Karbon',
    protons: 6,
    neutrons: 6,
    electrons: 6,
    shells: [2, 4],
  },
  {
    symbol: 'O',
    name: 'Oksigen',
    protons: 8,
    neutrons: 8,
    electrons: 8,
    shells: [2, 6],
  },
];

export function HomeHero() {
  const [selectedAtomIndex, setSelectedAtomIndex] = useState(0);
  const activeAtom = PREVIEW_ATOMS[selectedAtomIndex];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white border border-[#F1E5D8] p-6 sm:p-10 lg:p-12 shadow-sm mb-12">
      {/* Background warm gradient glows */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#FFEDD5]/60 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-orange-100/40 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Main Two-Column Hero Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Kolom Kiri: pengantar materi */}
        <div className="lg:col-span-7 space-y-5">
          {/* Badge Kurikulum */}
          <div data-scroll-reveal className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FFEDD5] text-[#C2410C] border border-[#F97316]/20">
            <span className="w-2 h-2 rounded-full bg-[#F97316] animate-pulse" />
            <span>Media Pembelajaran Kimia Fase E • Kelas X</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#172033] tracking-tight leading-[1.18]">
            Memahami Struktur Atom{' '}
            <span className="block sm:inline text-[#C2410C] underline decoration-[#FFEDD5] decoration-4 underline-offset-4">
              Melalui Simulasi & Visual
            </span>
          </h1>

          {/* Deskripsi */}
          <p data-scroll-reveal className="text-base sm:text-lg text-[#475569] leading-relaxed max-w-xl">
            Bukan sekadar menghafal rumus. Eksplorasi proton, neutron, dan elektron secara visual, pahami notasi atom, serta amati pembentukan ion melalui laboratorium interaktif.
          </p>

          {/* Value Badges */}
          <div data-scroll-stagger className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-[#475569]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#15803D]" aria-hidden="true" />
              <span>Sesuai Alur Tujuan Pembelajaran</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C2410C]" aria-hidden="true" />
              <span>Progres belajar tersimpan per akun</span>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Card Visual Laboratorium Atom */}
        <div className="lg:col-span-5 flex justify-center">
          <div data-scroll-reveal className="w-full max-w-md rounded-2xl bg-[#FFF8F0] border border-[#F1E5D8] p-5 sm:p-6 shadow-inner text-center">
            {/* Header Card Simulasi */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F1E5D8] text-xs">
              <div className="flex items-center gap-2 font-bold text-[#172033]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
                <span>Laboratorium Atom</span>
              </div>
              <span className="text-[11px] font-medium text-[#C2410C] bg-[#FFEDD5] px-2 py-0.5 rounded-full">
                Pratinjau Interaktif
              </span>
            </div>

            {/* Selector Unsur / Mode Tab (mirip IMF Explorer switcher) */}
            <div className="mt-3 flex items-center justify-center gap-1.5 p-1 rounded-xl bg-white/80 border border-[#F1E5D8]">
              {PREVIEW_ATOMS.map((atom, idx) => (
                <button
                  key={atom.symbol}
                  type="button"
                  onClick={() => setSelectedAtomIndex(idx)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    selectedAtomIndex === idx
                      ? 'bg-[#C2410C] text-white shadow-xs'
                      : 'text-[#475569] hover:text-[#172033] hover:bg-orange-50'
                  }`}
                  aria-label={`Lihat atom ${atom.name}`}
                >
                  {atom.name} ({atom.symbol})
                </button>
              ))}
            </div>

            <AtomCanvas atom={activeAtom} />

            {/* Info Atom Aktif */}
            <div className="text-xs font-bold text-[#172033]">
              Atom {activeAtom.name} ({activeAtom.symbol}: {activeAtom.protons}p, {activeAtom.neutrons}n, {activeAtom.electrons}e)
            </div>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Model 3D interaktif — seret untuk memutar
            </p>

            {/* Particle Legend */}
            <div className="mt-3 flex items-center justify-center gap-3 text-[11px] pt-2.5 border-t border-[#F1E5D8]">
              <span className="flex items-center gap-1 font-semibold text-[#C2410C]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" /> Proton (+)
              </span>
              <span className="flex items-center gap-1 font-semibold text-[#475569]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#64748B]" /> Neutron (0)
              </span>
              <span className="flex items-center gap-1 font-semibold text-[#2563EB]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" /> Elektron (−)
              </span>
            </div>

            {/* Direct Link to Full Lab */}
            <Link
              to="/laboratorium/partikel"
              className="mt-3 inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-white hover:bg-orange-50 border border-[#F1E5D8] text-xs font-semibold text-[#C2410C] transition-colors"
            >
              <span>Eksplorasi di Lab Atom</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      {/* Micro-Stats Bar di Bawah Hero (Persis seperti layout IMF Explorer) */}
      <div data-scroll-stagger className="mt-10 pt-6 border-t border-[#F1E5D8] grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-3 rounded-xl bg-[#FFF8F0]/70 border border-[#F1E5D8]/80">
          <div className="flex items-center justify-center gap-1.5 text-[#C2410C] font-extrabold text-lg sm:text-xl">
            <BookOpen className="w-5 h-5 text-[#F97316]" aria-hidden="true" />
            <span>3 Topik Utama</span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">Kurikulum Merdeka Fase E</p>
        </div>

        <div className="p-3 rounded-xl bg-[#FFF8F0]/70 border border-[#F1E5D8]/80">
          <div className="flex items-center justify-center gap-1.5 text-[#C2410C] font-extrabold text-lg sm:text-xl">
            <Layers className="w-5 h-5 text-[#F97316]" aria-hidden="true" />
            <span>17 Bagian Materi</span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">Modul Belajar Bertahap</p>
        </div>

        <div className="p-3 rounded-xl bg-[#FFF8F0]/70 border border-[#F1E5D8]/80">
          <div className="flex items-center justify-center gap-1.5 text-[#C2410C] font-extrabold text-lg sm:text-xl">
            <Atom className="w-5 h-5 text-[#F97316]" aria-hidden="true" />
            <span>3 Mode Lab Atom</span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">Simulasi & Notasi Partikel</p>
        </div>

        <div className="p-3 rounded-xl bg-[#FFF8F0]/70 border border-[#F1E5D8]/80">
          <div className="flex items-center justify-center gap-1.5 text-[#C2410C] font-extrabold text-lg sm:text-xl">
            <HelpCircle className="w-5 h-5 text-[#F97316]" aria-hidden="true" />
            <span>3 Sesi Kuis</span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">Evaluasi & Pembahasan</p>
        </div>
      </div>
    </section>
  );
}
