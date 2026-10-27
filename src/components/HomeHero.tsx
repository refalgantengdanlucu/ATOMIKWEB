import { Link } from 'react-router-dom';
import { ArrowRight, Atom, CheckCircle2, ShieldCheck } from 'lucide-react';

export function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-white border border-[#F1E5D8] p-6 sm:p-10 lg:p-12 shadow-sm mb-10">
      {/* Background soft warmth gradient */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#FFEDD5]/60 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-orange-100/40 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left copy */}
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFEDD5] text-[#C2410C] border border-[#F97316]/20 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#F97316] animate-pulse" />
            Media Pembelajaran Kimia Fase E (Kelas X)
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#172033] tracking-tight leading-[1.15]">
            Pahami Struktur Atom Lewat{' '}
            <span className="text-[#C2410C] underline decoration-[#FFEDD5] decoration-4 underline-offset-4">
              Simulasi & Visual
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-[#475569] leading-relaxed max-w-xl">
            Bukan sekadar menghafal rumus. Eksplorasi proton, neutron, dan elektron secara visual, hitung notasi atom, dan amati pembentukan ion di Laboratorium Interaktif.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/materi"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] active:scale-98 text-white font-semibold text-base shadow-md shadow-orange-900/15 transition-all min-h-[44px]"
            >
              <span>Mulai Belajar</span>
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>

            <Link
              to="/lab/partikel"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#FFF8F0] hover:bg-[#FFEDD5] text-[#C2410C] font-semibold text-base border border-[#F1E5D8] transition-colors min-h-[44px]"
            >
              <Atom className="w-5 h-5 text-[#F97316]" aria-hidden="true" />
              <span>Laboratorium Atom</span>
            </Link>
          </div>

          {/* Value Badges */}
          <div className="mt-8 pt-6 border-t border-[#F1E5D8] flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-[#475569]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#15803D]" aria-hidden="true" />
              <span>Sesuai Alur Tujuan Pembelajaran</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C2410C]" aria-hidden="true" />
              <span>Privat & Bebas Akun (Anonim)</span>
            </div>
          </div>
        </div>

        {/* Right illustration / Schematic Preview */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-xs sm:max-w-sm p-6 rounded-2xl bg-[#FFF8F0] border border-[#F1E5D8] shadow-inner text-center">
            {/* Bohr simplified schematic SVG */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto flex items-center justify-center">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full"
                aria-label="Ilustrasi skematis atom Litium"
              >
                <title>Skema Model Atom Bohr Disederhanakan</title>
                {/* Orbit 1 */}
                <circle
                  cx="100"
                  cy="100"
                  r="50"
                  fill="none"
                  stroke="#F1E5D8"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                {/* Orbit 2 */}
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke="#F1E5D8"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />

                {/* Nucleus Glow & Core */}
                <circle cx="100" cy="100" r="24" fill="#FFEDD5" />
                
                {/* Nucleons */}
                {/* Protons: Orange #F97316 */}
                <circle cx="94" cy="94" r="8" fill="#F97316" />
                <text x="94" y="97" fontSize="9" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">+</text>

                <circle cx="106" cy="95" r="8" fill="#F97316" />
                <text x="106" y="98" fontSize="9" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">+</text>

                <circle cx="97" cy="107" r="8" fill="#F97316" />
                <text x="97" y="110" fontSize="9" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">+</text>

                {/* Neutrons: Slate #64748B */}
                <circle cx="107" cy="107" r="8" fill="#64748B" />
                <text x="107" y="110" fontSize="8" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">n</text>

                {/* Electrons: Blue #2563EB */}
                {/* Shell 1: 2 electrons */}
                <circle cx="100" cy="50" r="6" fill="#2563EB" />
                <text x="100" y="53" fontSize="8" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">−</text>

                <circle cx="100" cy="150" r="6" fill="#2563EB" />
                <text x="100" y="153" fontSize="8" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">−</text>

                {/* Shell 2: 1 electron */}
                <circle cx="185" cy="100" r="6" fill="#2563EB" />
                <text x="185" y="103" fontSize="8" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">−</text>
              </svg>
            </div>

            <div className="mt-3 text-xs font-semibold text-[#172033]">
              Atom Litium (Li: 3p, 4n, 3e)
            </div>
            <p className="text-[11px] text-[#475569] mt-0.5">
              Model Bohr disederhanakan — ukuran tidak berskala
            </p>

            {/* Particle legend */}
            <div className="mt-4 flex items-center justify-center gap-3 text-[11px] pt-3 border-t border-[#F1E5D8]">
              <span className="flex items-center gap-1 font-medium text-[#C2410C]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" /> Proton (+)
              </span>
              <span className="flex items-center gap-1 font-medium text-[#475569]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#64748B]" /> Neutron (n)
              </span>
              <span className="flex items-center gap-1 font-medium text-[#2563EB]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" /> Elektron (−)
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

