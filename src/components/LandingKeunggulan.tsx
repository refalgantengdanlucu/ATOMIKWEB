import { Eye, Sliders, BookOpen, Award, Sparkles } from 'lucide-react';

const ADVANTAGES = [
  {
    icon: Eye,
    title: 'Visualisasi Konsep',
    desc: 'Memahami struktur atom dan susunan partikel subatom melalui representasi visual mikroskopik dan diagram Bohr interaktif.',
  },
  {
    icon: Sliders,
    title: 'Eksplorasi Interaktif',
    desc: 'Mengamati secara langsung perubahan jumlah proton, neutron, dan elektron serta pengaruhnya terhadap identitas dan muatan atom.',
  },
  {
    icon: BookOpen,
    title: 'Materi Terstruktur',
    desc: 'Mempelajari konsep secara bertahap sesuai Alur Tujuan Pembelajaran (ATP) Kimia Fase E dari konsep dasar hingga pembentukan ion.',
  },
  {
    icon: Award,
    title: 'Evaluasi Pemahaman',
    desc: 'Mengukur pemahaman melalui aktivitas interaktif, kalkulasi latihan, dan kuis adaptif yang dilengkapi pembahasan komprehensif.',
  },
];

export function LandingKeunggulan() {
  return (
    <section className="space-y-6 mb-16">
      {/* Section Header */}
      <div data-scroll-reveal className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFEDD5] text-[#C2410C] border border-[#F97316]/20">
          <Sparkles className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
          <span>Keunggulan Media</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
          Mengapa Belajar dengan ATOMIKA?
        </h2>
        <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
          Dirancang untuk memfasilitasi pemahaman representasi kimia submikroskopik secara mudah, menyenangkan, dan efektif.
        </p>
      </div>

      {/* 4 Cards Grid */}
      <div data-scroll-stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {ADVANTAGES.map((adv, idx) => {
          const Icon = adv.icon;
          return (
            <div
              key={idx}
              data-card-hover
              className="rounded-2xl bg-white border border-[#F1E5D8] p-5 sm:p-6 shadow-xs hover:border-[#F97316]/40 hover:shadow-md transition-all space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FFF8F0] border border-[#F1E5D8] flex items-center justify-center text-[#C2410C] group-hover:bg-[#FFEDD5] group-hover:scale-105 transition-all">
                <Icon className="w-5 h-5 text-[#F97316]" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-base text-[#172033] group-hover:text-[#C2410C] transition-colors">
                {adv.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                {adv.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
