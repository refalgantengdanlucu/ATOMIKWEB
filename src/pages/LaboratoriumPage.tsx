import { useParams, Link, Navigate, useLocation } from 'react-router-dom';
import { Atom, Calculator, Zap, Sparkles, Lock, ArrowRight } from 'lucide-react';
import { IonSimulator, NuclideCalculator, ParticleExplorer } from '../components/lab/LabSimulators';
import { useProgress } from '../lib/progress';
import { useAccess } from '../lib/access-context';

type LabMode = 'partikel' | 'kalkulator' | 'ion';

const LAB_TABS: { id: LabMode; label: string; desc: string; icon: typeof Atom; requiredTopic: string; topicId: string }[] = [
  {
    id: 'partikel',
    label: 'Lab Partikel',
    desc: 'Eksplorasi Proton, Neutron, Elektron',
    icon: Atom,
    requiredTopic: 'Topik 1',
    topicId: 't1',
  },
  {
    id: 'kalkulator',
    label: 'Kalkulator Partikel',
    desc: 'Hitung Notasi & Bandingkan Nuklida',
    icon: Calculator,
    requiredTopic: 'Topik 2',
    topicId: 't2',
  },
  {
    id: 'ion',
    label: 'Simulator Ion',
    desc: 'Simulasi Kation & Anion',
    icon: Zap,
    requiredTopic: 'Topik 3',
    topicId: 't3',
  },
];

export function LaboratoriumPage() {
  const { mode } = useParams<{ mode: string }>();
  const location = useLocation();
  const { isLabModeUnlocked } = useProgress();
  const { profile } = useAccess();
  const isTeacher = profile?.role === 'teacher';

  // Tentukan path basis rute (/laboratorium atau /lab)
  const basePath = location.pathname.startsWith('/lab') ? '/lab' : '/laboratorium';

  // Validasi mode rute
  if (!mode || !['partikel', 'kalkulator', 'ion'].includes(mode)) {
    return <Navigate to={`${basePath}/partikel`} replace />;
  }

  const activeMode = mode as LabMode;
  const currentTab = LAB_TABS.find((t) => t.id === activeMode)!;
  const isCurrentModeUnlocked = isTeacher || isLabModeUnlocked(activeMode);

  return (
    <div className="space-y-8 pb-16">
      {/* Header Halaman Laboratorium */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFEDD5] text-[#C2410C] mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
          <span>Laboratorium Atom Interaktif</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#172033] tracking-tight">
          Laboratorium Kimia Virtual
        </h1>
        <p className="mt-2 text-[#475569] text-base max-w-2xl">
          Eksplorasi struktur atom melalui tiga mode simulasi mandiri: amati sifat partikel subatom secara visual, hitung notasi secara akurat, dan pelajari pembentukan ion.
        </p>
      </div>

      {/* Mode Tabs Navigasi Sub-Fitur */}
      <nav aria-label="Tab Mode Laboratorium" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {LAB_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeMode;
          const isUnlocked = isTeacher || isLabModeUnlocked(tab.id);

          return (
            <Link
              key={tab.id}
              to={`${basePath}/${tab.id}`}
              className={`p-4 rounded-2xl border text-left transition-all relative ${
                isActive
                  ? 'bg-white border-[#C2410C] ring-2 ring-[#C2410C]/10 shadow-sm'
                  : isUnlocked
                  ? 'bg-white/60 border-[#F1E5D8] hover:bg-white text-[#475569]'
                  : 'bg-slate-50 border-slate-200 text-slate-400 opacity-80 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isActive
                      ? 'bg-[#FFEDD5] text-[#C2410C]'
                      : isUnlocked
                      ? 'bg-[#FFF8F0] text-[#64748B]'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <div className={`font-bold text-sm flex items-center gap-1.5 ${isActive ? 'text-[#172033]' : isUnlocked ? 'text-[#475569]' : 'text-slate-500'}`}>
                    <span>{tab.label}</span>
                    {!isUnlocked && <Lock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />}
                  </div>
                  <div className="text-xs text-[#64748B] mt-0.5">
                    {isUnlocked ? tab.desc : `Buka setelah materi ${tab.requiredTopic}`}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Workspace untuk setiap mode laboratorium */}
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

          {!isCurrentModeUnlocked ? (
            <div className="py-12 text-center max-w-md mx-auto">
              <div className="w-14 h-14 rounded-full bg-amber-100 text-[#C2410C] flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-[#172033] mb-2">
                Simulasi {currentTab.label} Masih Terkunci
              </h3>
              <p className="text-sm text-[#475569] leading-relaxed mb-6">
                Selesaikan membaca seluruh bagian materi <strong>{currentTab.requiredTopic}</strong> terlebih dahulu untuk membuka dan menggunakan simulasi laboratorium ini.
              </p>
              <Link
                to={`/materi/${currentTab.topicId}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold text-sm shadow-sm transition-colors"
              >
                <span>Buka Materi {currentTab.requiredTopic}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <>
              {activeMode === 'partikel' && <ParticleExplorer />}
              {activeMode === 'kalkulator' && <NuclideCalculator />}
              {activeMode === 'ion' && <IonSimulator />}
            </>
          )}
        </div>

        <div className="text-xs text-[#64748B] pt-4 border-t border-[#F1E5D8] flex flex-wrap items-center justify-between gap-2">
          <span>Model visual: Bohr disederhanakan (ukuran tidak berskala)</span>
          <span>Perhitungan partikel mengikuti p = Z, n = A − Z, e = Z − q</span>
        </div>
      </div>
    </div>
  );
}

// Alias untuk kompatibilitas
export const LabPage = LaboratoriumPage;
