import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Atom } from 'lucide-react';

export function LandingCta() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#FFF8F0] to-[#FFEDD5] border border-[#F97316]/30 p-8 sm:p-12 text-center shadow-sm mb-6">
      {/* Decorative blurred background shapes */}
      <div
        className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-orange-200/50 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[#FFEDD5] blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div data-scroll-stagger className="relative z-10 max-w-2xl mx-auto space-y-5">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-[#C2410C] border border-[#F97316]/20 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
          <span>Siap Memulai Belajar?</span>
        </div>

        {/* Title */}
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
          Mulai Eksplorasi Dunia Atom
        </h2>

        {/* Description */}
        <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
          Kenali partikel penyusun atom, pahami konsepnya, dan jelajahi kimia melalui pengalaman belajar interaktif.
        </p>

        {/* Action Button */}
        <div className="pt-3 flex justify-center">
          <Link
            to="/materi"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold text-base shadow-lg shadow-orange-950/20 transition-all min-h-[48px]"
          >
            <span>Mulai Belajar Sekarang</span>
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>

        {/* Badges footer */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-[#64748B]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#15803D]" aria-hidden="true" />
            <span>Kurikulum Merdeka Fase E</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Atom className="w-4 h-4 text-[#F97316]" aria-hidden="true" />
            <span>Laboratorium Simulasi Partikel</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#C2410C]" aria-hidden="true" />
            <span>Privat & Bebas Akun</span>
          </div>
        </div>
      </div>
    </section>
  );
}
