import { useParams, Link, Navigate } from 'react-router-dom';
import { Atom, Calculator, Zap, Sparkles } from 'lucide-react';

type LabMode = 'partikel' | 'kalkulator' | 'ion';

const LAB_TABS: { id: LabMode; label: string; desc: string; icon: typeof Atom }[] = [
  {
    id: 'partikel',
    label: 'Lab Partikel',
    desc: 'Eksplorasi Proton, Neutron, Elektron',
    icon: Atom,
  },
  {
    id: 'kalkulator',
    label: 'Kalkulator Partikel',
    desc: 'Hitung Notasi & Bandingkan Nuklida',
    icon: Calculator,
  },
  {
    id: 'ion',
    label: 'Simulator Ion',
    desc: 'Simulasi Kation & Anion',
    icon: Zap,
  },
];

export function LabPage() {
  const { mode } = useParams<{ mode: string }>();

  // Validasi mode rute
  if (!mode || !['partikel', 'kalkulator', 'ion'].includes(mode)) {
    return <Navigate to="/lab/partikel" replace />;
  }

  const activeMode = mode as LabMode;
  const currentTab = LAB_TABS.find((t) => t.id === activeMode)!;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFEDD5] text-[#C2410C] mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
          <span>Laboratorium Atom Interaktif</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#172033] tracking-tight">
          Laboratorium Kimia Virtual
        </h1>
        <p className="mt-2 text-[#475569] text-base max-w-2xl">
          Eksplorasi struktur atom melalui tiga mode simulasi: amati sifat partikel subatom, hitung notasi secara akurat, dan pelajari pembentukan ion.
        </p>
      </div>

      {/* Mode Tabs */}
      <nav aria-label="Tab Mode Laboratorium" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {LAB_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeMode;
          return (
            <Link
              key={tab.id}
              to={`/lab/${tab.id}`}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isActive
                  ? 'bg-white border-[#C2410C] ring-2 ring-[#C2410C]/10 shadow-sm'
                  : 'bg-white/60 border-[#F1E5D8] hover:bg-white text-[#475569]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isActive ? 'bg-[#FFEDD5] text-[#C2410C]' : 'bg-[#FFF8F0] text-[#64748B]'
                  }`}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <div className={`font-bold text-sm ${isActive ? 'text-[#172033]' : 'text-[#475569]'}`}>
                    {tab.label}
                  </div>
                  <div className="text-xs text-[#64748B] mt-0.5">{tab.desc}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Lab Mode Workspace Shell (Placeholder Milestone M1) */}
      <div className="rounded-3xl bg-white border border-[#F1E5D8] p-6 sm:p-10 shadow-xs min-h-[400px] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-[#F1E5D8] pb-4 mb-6">
            <div>
              <span className="text-xs font-bold text-[#C2410C] uppercase tracking-wider">
                Mode Aktif
              </span>
              <h2 className="text-xl font-bold text-[#172033] mt-0.5">
                {currentTab.label}
              </h2>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-[#FFF8F0] border border-[#F1E5D8] text-[#475569]">
              Cakupan Z = 1–20
            </span>
          </div>

          <div className="bg-[#FFF8F0] rounded-2xl p-8 border border-[#F1E5D8] text-center max-w-xl mx-auto my-6">
            <div className="w-12 h-12 rounded-2xl bg-[#FFEDD5] text-[#C2410C] flex items-center justify-center mx-auto mb-3">
              <currentTab.icon className="w-6 h-6 text-[#F97316]" aria-hidden="true" />
            </div>
            <h3 className="font-bold text-base text-[#172033]">
              Workspace {currentTab.label}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-[#475569] leading-relaxed">
              Logika murni kalkulasi atom akan diimplementasikan dan diuji di <strong>Milestone M2</strong>, kemudian antarmuka interaktif SVG dan simulator penuh akan dihubungkan di <strong>Milestone M4</strong>.
            </p>
          </div>
        </div>

        <div className="text-xs text-[#64748B] pt-4 border-t border-[#F1E5D8] flex flex-wrap items-center justify-between gap-2">
          <span>Model visual: Bohr disederhanakan (ukuran tidak berskala)</span>
          <span>Sesuai Batasan PRD Bagian 7.2</span>
        </div>
      </div>
    </div>
  );
}

