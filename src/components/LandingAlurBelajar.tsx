import { Link } from 'react-router-dom';
import { Atom, Calculator, Zap, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { TOPICS } from '../data/topics';

const TOPIC_ICONS = [Atom, Calculator, Zap];
const TOPIC_BADGES = ['Partikel & Model Atom', 'Notasi & Massa', 'Ion & Kation-Anion'];

export function LandingAlurBelajar() {
  return (
    <section className="space-y-6 mb-16">
      {/* Section Header */}
      <div data-scroll-reveal className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFEDD5] text-[#C2410C] border border-[#F97316]/20">
          <BookOpen className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
          <span>Alur Belajar Bertahap</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
          Jelajahi Struktur Atom
        </h2>
        <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
          Pelajari konsep struktur atom secara bertahap melalui materi, visualisasi, dan aktivitas interaktif.
        </p>
      </div>

      {/* Topics Grid */}
      <div data-scroll-stagger className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TOPICS.map((topic, index) => {
          const Icon = TOPIC_ICONS[index] || Atom;
          const badge = TOPIC_BADGES[index] || `Topik ${index + 1}`;

          return (
            <div
              key={topic.id}
              data-card-hover
              className="flex flex-col justify-between rounded-2xl bg-white border border-[#F1E5D8] p-6 shadow-xs hover:border-[#F97316]/40 hover:shadow-md transition-all duration-200 group"
            >
              <div className="space-y-4">
                {/* Header Card: Icon & Tag */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#FFF8F0] border border-[#F1E5D8] flex items-center justify-center text-[#C2410C] group-hover:bg-[#FFEDD5] group-hover:scale-105 transition-all">
                    <Icon className="w-6 h-6 text-[#F97316]" aria-hidden="true" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#C2410C] bg-[#FFEDD5] px-2.5 py-0.5 rounded-full">
                    {badge}
                  </span>
                </div>

                {/* Topic Title */}
                <div>
                  <span className="text-xs font-bold text-[#F97316] uppercase tracking-wider">
                    Modul 0{index + 1} • {topic.sectionIds.length} Bagian
                  </span>
                  <h3 className="text-lg font-bold text-[#172033] mt-1 group-hover:text-[#C2410C] transition-colors leading-snug">
                    {topic.title}
                  </h3>
                </div>

                {/* Topic Description */}
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  {topic.description}
                </p>

                {/* Learning Objectives Pills */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {topic.learningObjectives.map((tp) => (
                    <span
                      key={tp}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#64748B] bg-[#FFF8F0] border border-[#F1E5D8] px-2 py-0.5 rounded-md"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-[#F97316]" aria-hidden="true" />
                      {tp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-6 mt-6 border-t border-[#F1E5D8]">
                <Link
                  to={`/materi/${topic.id}`}
                  className="inline-flex items-center justify-between w-full text-xs sm:text-sm font-semibold text-[#C2410C] hover:text-[#9A3412] group-hover:translate-x-0.5 transition-all"
                >
                  <span>Mulai Pelajari Topik</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
