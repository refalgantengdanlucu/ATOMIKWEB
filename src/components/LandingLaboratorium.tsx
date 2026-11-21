import { Link } from 'react-router-dom';
import { Atom, Calculator, Zap, ArrowRight, FlaskConical, Check } from 'lucide-react';

const LAB_FEATURES = [
  {
    mode: 'partikel',
    path: '/laboratorium/partikel',
    icon: Atom,
    badge: 'Mode 01 • Eksplorasi Partikel',
    title: 'Lab Partikel Subatom',
    desc: 'Ubah jumlah proton, neutron, dan elektron secara visual. Amati bagaimana penambahan proton menentukan nomor atom dan identitas unsur serta susunan elektron pada kulit Bohr.',
    points: [
      'Eksplorasi dinamis proton, neutron, dan elektron',
      'Identifikasi otomatis unsur dari nomor atom',
      'Visualisasi pembagian elektron pada kulit atom Bohr',
    ],
  },
  {
    mode: 'kalkulator',
    path: '/laboratorium/kalkulator',
    icon: Calculator,
    badge: 'Mode 02 • Kalkulator Notasi',
    title: 'Kalkulator Partikel & Nuklida',
    desc: 'Hitung partikel subatom dari nomor massa (A) dan nomor atom (Z). Bandingkan dua nuklida berdampingan untuk mengidentifikasi pasangan isotop, isobar, atau isoton secara akurat.',
    points: [
      'Input notasi atom standar format AZX',
      'Perhitungan otomatis jumlah neutron dan elektron',
      'Pembanding dua nuklida (Isotop, Isobar, Isoton)',
    ],
  },
  {
    mode: 'ion',
    path: '/laboratorium/ion',
    icon: Zap,
    badge: 'Mode 03 • Simulasi Muatan',
    title: 'Simulator Pembentukan Ion',
    desc: 'Simulasikan pelepasan atau penangkapan elektron pada atom netral. Pahami secara intuitif terbentuknya kation positif dan anion negatif dengan muatan inti yang tetap stabil.',
    points: [
      'Simulasi pelepasan elektron menjadi kation (+)',
      'Simulasi penangkapan elektron menjadi anion (−)',
      'Visualisasi muatan bersih dan kestabilan inti',
    ],
  },
];

export function LandingLaboratorium() {
  return (
    <section className="space-y-6 mb-16">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFEDD5] text-[#C2410C] border border-[#F97316]/20">
          <FlaskConical className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
          <span>Laboratorium Interaktif</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
          Belajar Melalui Eksplorasi
        </h2>
        <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
          Amati partikel penyusun atom, eksplorasi perubahan jumlah partikel, dan pahami bagaimana struktur atom memengaruhi identitas serta muatan suatu atom.
        </p>
      </div>

      {/* Lab Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {LAB_FEATURES.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.mode}
              className="flex flex-col justify-between rounded-2xl bg-white border border-[#F1E5D8] p-6 shadow-xs hover:border-[#F97316]/40 hover:shadow-md transition-all duration-200 group"
            >
              <div className="space-y-4">
                {/* Header Icon & Mode Tag */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#FFF8F0] border border-[#F1E5D8] flex items-center justify-center text-[#C2410C] group-hover:bg-[#FFEDD5] group-hover:scale-105 transition-all">
                    <Icon className="w-6 h-6 text-[#F97316]" aria-hidden="true" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#C2410C] bg-[#FFEDD5] px-2.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-[#172033] group-hover:text-[#C2410C] transition-colors">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  {item.desc}
                </p>

                {/* Bullet Points */}
                <ul className="space-y-2 pt-2 border-t border-[#F1E5D8]/70">
                  {item.points.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#475569]">
                      <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-[#F1E5D8]">
                <Link
                  to={item.path}
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#FFF8F0] hover:bg-[#FFEDD5] text-[#C2410C] font-semibold text-xs border border-[#F1E5D8] transition-colors"
                >
                  <span>Buka {item.title}</span>
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
