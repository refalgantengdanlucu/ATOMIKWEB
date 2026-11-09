import { useState } from 'react';
import { ArrowDown, ArrowLeftRight, ArrowUp, Minus, Plus, RotateCcw, Sparkles } from 'lucide-react';
import {
  compareNuclides,
  ELEMENTS,
  formatNuclide,
  getBohrShells,
  getElement,
  getElectronCount,
  getNeutronCount,
} from '../../lib/chemistry';

const cardClass = 'rounded-2xl border border-[#F1E5D8] bg-white p-5 shadow-sm sm:p-6';
const selectClass = 'min-h-11 w-full rounded-xl border border-[#E8D8C8] bg-white px-3 text-sm font-medium text-[#172033] outline-none focus:border-[#C2410C] focus:ring-2 focus:ring-orange-100';
const numberClass = `${selectClass} text-base`;

function AtomDiagram({
  protons,
  neutrons,
  electrons,
  caption,
}: {
  protons: number;
  neutrons: number;
  electrons: number;
  caption: string;
}) {
  const shellCounts = getBohrShells(electrons);
  const shellRadii = [32, 54, 76, 98];
  const center = 120;
  return (
    <figure className="rounded-2xl border border-[#F1E5D8] bg-[#FFF8F0] p-4">
      <svg viewBox="0 0 240 240" className="mx-auto block w-full max-w-[280px]" role="img" aria-label={`${caption}: ${protons} proton, ${neutrons} neutron, ${electrons} elektron`}>
        {shellRadii.map((radius) => (
          <circle key={radius} cx={center} cy={center} r={radius} fill="none" stroke="#E8D8C8" strokeWidth="1.5" strokeDasharray="4 4" />
        ))}
        {shellCounts.flatMap((count, shellIndex) =>
          Array.from({ length: count }, (_, electronIndex) => {
            const angle = (2 * Math.PI * electronIndex) / Math.max(count, 1) - Math.PI / 2;
            const radius = shellRadii[shellIndex];
            return (
              <g key={`e-${shellIndex}-${electronIndex}`}>
                <circle cx={center + radius * Math.cos(angle)} cy={center + radius * Math.sin(angle)} r="7" fill="#2563EB" stroke="white" strokeWidth="2" />
                <text x={center + radius * Math.cos(angle)} y={center + radius * Math.sin(angle) + 3} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">−</text>
              </g>
            );
          }),
        )}
        <circle cx={center} cy={center} r="25" fill="#FFEDD5" stroke="#F97316" strokeWidth="1.5" />
        <text x={center} y={center - 3} textAnchor="middle" fill="#9A3412" fontSize="11" fontWeight="bold">{protons} p⁺</text>
        <text x={center} y={center + 11} textAnchor="middle" fill="#475569" fontSize="10" fontWeight="bold">{neutrons} n⁰</text>
      </svg>
      <figcaption className="mt-2 text-center text-xs leading-5 text-[#64748B]">
        {caption}. Model Bohr disederhanakan; jarak dan ukuran partikel tidak berskala.
      </figcaption>
      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] font-semibold">
        <span className="text-[#C2410C]">● Proton (+)</span>
        <span className="text-slate-600">● Neutron (0)</span>
        <span className="text-blue-700">● Elektron (−)</span>
      </div>
    </figure>
  );
}

function ElementPicker({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (atomicNumber: number) => void;
  label: string;
}) {
  return (
    <label className="block space-y-1.5 text-xs font-bold text-[#475569]">
      {label}
      <select className={selectClass} value={value} onChange={(event) => onChange(Number(event.target.value))}>
        {ELEMENTS.map((element) => (
          <option key={element.atomicNumber} value={element.atomicNumber}>
            {element.atomicNumber} · {element.symbol} — {element.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ParticleExplorer() {
  const [atomicNumber, setAtomicNumber] = useState(11);
  const [massNumber, setMassNumber] = useState(23);
  const [focusedParticle, setFocusedParticle] = useState<'proton' | 'neutron' | 'electron'>('proton');
  const element = getElement(atomicNumber)!;
  const neutronCount = getNeutronCount(massNumber, atomicNumber);
  const shellCounts = getBohrShells(atomicNumber);
  const particleDetails = {
    proton: {
      title: 'Proton · muatan +1',
      description: 'Proton berada di inti atom. Jumlah proton menentukan nomor atom (Z) sekaligus identitas unsur.',
      count: atomicNumber,
      color: 'text-[#C2410C]',
    },
    neutron: {
      title: 'Neutron · muatan 0',
      description: 'Neutron juga berada di inti. Perbedaan jumlah neutron pada unsur yang sama menghasilkan isotop.',
      count: neutronCount,
      color: 'text-slate-600',
    },
    electron: {
      title: 'Elektron · muatan −1',
      description: 'Elektron menempati kulit di sekitar inti. Pada atom netral, jumlah elektron sama dengan jumlah proton.',
      count: atomicNumber,
      color: 'text-blue-700',
    },
  } as const;
  const detail = particleDetails[focusedParticle];

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <section className={cardClass}>
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">Eksplorasi partikel subatom</p>
          <h3 className="mt-1 text-xl font-extrabold text-[#172033]">Bangun atom dan amati partikelnya</h3>
          <p className="mt-2 text-sm leading-6 text-[#64748B]">Pilih unsur, lalu ubah nomor massa untuk melihat pengaruh jumlah neutron.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ElementPicker value={atomicNumber} label="Unsur (nomor atom Z)" onChange={(z) => { setAtomicNumber(z); setMassNumber(getElement(z)!.defaultMassNumber); }} />
          <label className="block space-y-1.5 text-xs font-bold text-[#475569]">
            Nomor massa (A)
            <input className={numberClass} type="number" min={atomicNumber} max={atomicNumber + 40} value={massNumber} onChange={(event) => {
              const next = Number(event.target.value);
              if (Number.isInteger(next) && next >= atomicNumber && next <= atomicNumber + 40) setMassNumber(next);
            }} />
          </label>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {(['proton', 'neutron', 'electron'] as const).map((particle) => (
            <button type="button" key={particle} onClick={() => setFocusedParticle(particle)} aria-pressed={focusedParticle === particle} className={`rounded-xl border p-3 text-left transition ${focusedParticle === particle ? 'border-[#C2410C] bg-orange-50' : 'border-[#F1E5D8] hover:bg-orange-50/50'}`}>
              <span className={`block text-[11px] font-bold capitalize ${particleDetails[particle].color}`}>{particle}</span>
              <span className="mt-1 block text-2xl font-black text-[#172033]">{particleDetails[particle].count}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-[#FFF8F0] p-4" aria-live="polite">
          <h4 className={`text-sm font-extrabold ${detail.color}`}>{detail.title}</h4>
          <p className="mt-1 text-xs leading-5 text-[#475569]">{detail.description}</p>
        </div>
        <div className="mt-4 rounded-xl border border-[#F1E5D8] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-[#64748B]">{element.name} · atom netral</p>
              <p className="mt-1 text-lg font-black text-[#172033]">{massNumber}{element.symbol}</p>
            </div>
            <p className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-bold text-[#9A3412]">p = Z · n = A − Z · e = Z</p>
          </div>
          <p className="mt-3 text-xs text-[#475569]">Susunan elektron per kulit: <strong>{shellCounts.join(' · ')}</strong></p>
        </div>
      </section>
      <AtomDiagram protons={atomicNumber} neutrons={neutronCount} electrons={atomicNumber} caption={`Atom ${element.name} (${element.symbol})`} />
    </div>
  );
}

interface NuclideInput {
  atomicNumber: number;
  massNumber: number;
}

function NuclideEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: NuclideInput;
  onChange: (value: NuclideInput) => void;
}) {
  const element = getElement(value.atomicNumber)!;
  return (
    <fieldset className="rounded-2xl border border-[#F1E5D8] p-4">
      <legend className="px-2 text-sm font-extrabold text-[#172033]">{label}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <ElementPicker value={value.atomicNumber} label="Unsur / Z" onChange={(atomicNumber) => onChange({ atomicNumber, massNumber: getElement(atomicNumber)!.defaultMassNumber })} />
        <label className="block space-y-1.5 text-xs font-bold text-[#475569]">
          Nomor massa (A)
          <input className={numberClass} type="number" min={value.atomicNumber} max={value.atomicNumber + 40} value={value.massNumber} onChange={(event) => {
            const massNumber = Number(event.target.value);
            if (Number.isInteger(massNumber) && massNumber >= value.atomicNumber && massNumber <= value.atomicNumber + 40) onChange({ ...value, massNumber });
          }} />
        </label>
      </div>
      <p className="mt-3 rounded-lg bg-[#FFF8F0] px-3 py-2 text-center font-mono text-lg font-bold text-[#172033]">
        <sup>{value.massNumber}</sup>{element.symbol} <span className="font-sans text-xs text-[#64748B]">· p={value.atomicNumber}, n={getNeutronCount(value.massNumber, value.atomicNumber)}</span>
      </p>
    </fieldset>
  );
}

const RELATION_DETAILS = {
  isotop: {
    title: 'Isotop',
    description: 'Nomor atom sama (proton sama), tetapi nomor massa dan jumlah neutron berbeda.',
    className: 'border-blue-200 bg-blue-50 text-blue-950',
  },
  isobar: {
    title: 'Isobar',
    description: 'Nomor massa sama, tetapi nomor atom berbeda sehingga unsur berbeda.',
    className: 'border-purple-200 bg-purple-50 text-purple-950',
  },
  isoton: {
    title: 'Isoton',
    description: 'Jumlah neutron sama, tetapi nomor atom dan unsur berbeda.',
    className: 'border-green-200 bg-green-50 text-green-950',
  },
  berbeda: {
    title: 'Tidak termasuk pasangan khusus di atas',
    description: 'Bandingkan Z, A, dan jumlah neutron (A − Z) untuk menentukan hubungan kedua nuklida.',
    className: 'border-amber-200 bg-amber-50 text-amber-950',
  },
} as const;

export function NuclideCalculator() {
  const [first, setFirst] = useState<NuclideInput>({ atomicNumber: 6, massNumber: 12 });
  const [second, setSecond] = useState<NuclideInput>({ atomicNumber: 6, massNumber: 14 });
  const [atomicNumber, setAtomicNumber] = useState(11);
  const [massNumber, setMassNumber] = useState(23);
  const [charge, setCharge] = useState(0);
  const element = getElement(atomicNumber)!;
  const electronCount = getElectronCount(atomicNumber, charge);
  const relation = compareNuclides(first, second);
  const relationDetail = RELATION_DETAILS[relation];
  const firstElement = getElement(first.atomicNumber)!;
  const secondElement = getElement(second.atomicNumber)!;

  return (
    <div className="space-y-5">
      <section className={cardClass}>
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">Kalkulator notasi atom</p>
          <h3 className="mt-1 text-xl font-extrabold text-[#172033]">Hitung proton, neutron, dan elektron</h3>
          <p className="mt-2 text-sm text-[#64748B]">Masukkan Z, A, dan muatan. Hubungan yang digunakan: p = Z, n = A − Z, e = Z − q.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            <ElementPicker value={atomicNumber} label="Unsur / nomor atom Z" onChange={(z) => { setAtomicNumber(z); setMassNumber(Math.max(z, getElement(z)!.defaultMassNumber)); }} />
            <label className="block space-y-1.5 text-xs font-bold text-[#475569]">
              Nomor massa A
              <input className={numberClass} type="number" min={atomicNumber} max={atomicNumber + 40} value={massNumber} onChange={(event) => {
                const next = Number(event.target.value);
                if (Number.isInteger(next) && next >= atomicNumber && next <= atomicNumber + 40) setMassNumber(next);
              }} />
            </label>
            <label className="block space-y-1.5 text-xs font-bold text-[#475569] sm:col-span-2">
              Muatan partikel (q)
              <select className={selectClass} value={charge} onChange={(event) => setCharge(Number(event.target.value))}>
                <option value={-2}>−2 (anion 2−)</option>
                <option value={-1}>−1 (anion 1−)</option>
                <option value={0}>0 (atom netral)</option>
                <option value={1}>+1 (kation 1+)</option>
                <option value={2}>+2 (kation 2+)</option>
              </select>
            </label>
            <div className="rounded-xl bg-[#FFF8F0] p-4 sm:col-span-2">
              <p className="text-xs font-semibold text-[#64748B]">Notasi dan hasil</p>
              <p className="mt-1 text-2xl font-black text-[#172033]"><sup className="text-sm">{massNumber}</sup>{element.symbol}<sup className="text-sm">{charge === 0 ? '' : `${Math.abs(charge)}${charge > 0 ? '+' : '−'}`}</sup></p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <CountTile label="Proton" value={atomicNumber} />
                <CountTile label="Neutron" value={getNeutronCount(massNumber, atomicNumber)} />
                <CountTile label="Elektron" value={electronCount} />
              </div>
            </div>
          </div>
          <AtomDiagram protons={atomicNumber} neutrons={getNeutronCount(massNumber, atomicNumber)} electrons={electronCount} caption={`${element.symbol}${charge === 0 ? '' : `${Math.abs(charge)}${charge > 0 ? '+' : '−'}`}`} />
        </div>
      </section>

      <section className={cardClass}>
        <div className="mb-4 flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5 text-[#C2410C]" aria-hidden="true" />
          <div>
            <h3 className="text-lg font-extrabold text-[#172033]">Bandingkan dua nuklida</h3>
            <p className="text-xs text-[#64748B]">Ubah Z dan A untuk menguji isotop, isobar, atau isoton.</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <NuclideEditor label="Nuklida A" value={first} onChange={setFirst} />
          <NuclideEditor label="Nuklida B" value={second} onChange={setSecond} />
        </div>
        <div className={`mt-4 rounded-xl border p-4 ${relationDetail.className}`} aria-live="polite">
          <p className="font-extrabold">{relationDetail.title}</p>
          <p className="mt-1 text-sm leading-5">{relationDetail.description}</p>
          <p className="mt-2 text-xs">
            {formatNuclide(firstElement.symbol, first.massNumber)}: n={getNeutronCount(first.massNumber, first.atomicNumber)}
            {' · '}
            {formatNuclide(secondElement.symbol, second.massNumber)}: n={getNeutronCount(second.massNumber, second.atomicNumber)}
          </p>
        </div>
      </section>
    </div>
  );
}

function CountTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[#F1E5D8] bg-white px-2 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B]">{label}</p>
      <p className="mt-0.5 text-xl font-black text-[#172033]">{value}</p>
    </div>
  );
}

interface IonPreset {
  symbol: string;
  charge: number;
  label: string;
}

const ION_PRESETS: IonPreset[] = [
  { symbol: 'Na', charge: 1, label: 'Na → Na⁺ + e⁻' },
  { symbol: 'Mg', charge: 2, label: 'Mg → Mg²⁺ + 2e⁻' },
  { symbol: 'O', charge: -2, label: 'O + 2e⁻ → O²⁻' },
  { symbol: 'Cl', charge: -1, label: 'Cl + e⁻ → Cl⁻' },
  { symbol: 'Ca', charge: 2, label: 'Ca → Ca²⁺ + 2e⁻' },
];

export function IonSimulator() {
  const [atomicNumber, setAtomicNumber] = useState(11);
  const [electronCount, setElectronCount] = useState(11);
  const element = getElement(atomicNumber)!;
  const charge = atomicNumber - electronCount;
  const massNumber = element.defaultMassNumber;
  const neutronCount = getNeutronCount(massNumber, atomicNumber);
  const shellCounts = getBohrShells(electronCount);
  const isNeutral = charge === 0;
  const isCation = charge > 0;
  const chargeLabel = isNeutral ? 'atom netral' : isCation ? `kation ${charge}+` : `anion ${Math.abs(charge)}−`;

  const selectElement = (nextZ: number) => {
    setAtomicNumber(nextZ);
    setElectronCount(nextZ);
  };
  const setPreset = (preset: IonPreset) => {
    const presetElement = ELEMENTS.find((item) => item.symbol === preset.symbol);
    if (!presetElement) return;
    setAtomicNumber(presetElement.atomicNumber);
    setElectronCount(presetElement.atomicNumber - preset.charge);
  };

  return (
    <div className="space-y-5">
      <section className={cardClass}>
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">Simulator serah-terima elektron</p>
          <h3 className="mt-1 text-xl font-extrabold text-[#172033]">Bentuk kation dan anion</h3>
          <p className="mt-2 text-sm leading-6 text-[#64748B]">Jumlah proton tetap. Tambah atau lepaskan elektron dan amati perubahan muatan atom.</p>
        </div>
        <div className="mb-5">
          <ElementPicker value={atomicNumber} label="Pilih atom netral" onChange={selectElement} />
        </div>
        <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-4">
            <div className={`rounded-2xl border p-5 ${isNeutral ? 'border-blue-200 bg-blue-50' : isCation ? 'border-orange-200 bg-orange-50' : 'border-purple-200 bg-purple-50'}`}>
              <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Partikel saat ini</p>
              <p className="mt-1 text-3xl font-black text-[#172033]">
                <sup className="text-base">{massNumber}</sup>{element.symbol}<sup className="text-base">{isNeutral ? '' : `${Math.abs(charge)}${charge > 0 ? '+' : '−'}`}</sup>
              </p>
              <p className={`mt-1 text-sm font-bold ${isNeutral ? 'text-blue-800' : isCation ? 'text-[#9A3412]' : 'text-purple-800'}`}>{element.name} · {chargeLabel}</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <CountTile label="Proton" value={atomicNumber} />
                <CountTile label="Neutron" value={neutronCount} />
                <CountTile label="Elektron" value={electronCount} />
              </div>
              <p className="mt-3 text-xs text-[#475569]">
                Elektron per kulit: <strong>K {shellCounts[0]} · L {shellCounts[1]} · M {shellCounts[2]} · N {shellCounts[3]}</strong>
              </p>
              <p className="mt-2 text-xs leading-5 text-[#475569]">
                {isNeutral
                  ? 'Muatan total nol karena jumlah proton dan elektron sama.'
                  : isCation
                    ? `Atom melepas ${charge} elektron; jumlah proton tetap.`
                    : `Atom menerima ${Math.abs(charge)} elektron; jumlah proton tetap.`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setElectronCount((count) => count + 1)} disabled={electronCount >= 22} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 text-sm font-bold text-blue-900 transition hover:bg-blue-100 disabled:opacity-40"><Plus className="h-4 w-4" aria-hidden="true" />Terima elektron</button>
              <button type="button" onClick={() => setElectronCount((count) => Math.max(0, count - 1))} disabled={electronCount <= 0} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 text-sm font-bold text-orange-950 transition hover:bg-orange-100 disabled:opacity-40"><Minus className="h-4 w-4" aria-hidden="true" />Lepas elektron</button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setElectronCount(atomicNumber)} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-xs font-bold text-[#475569] hover:bg-[#FFF8F0]"><RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />Kembalikan ke atom netral</button>
            </div>
          </div>
          <AtomDiagram protons={atomicNumber} neutrons={neutronCount} electrons={electronCount} caption={`${element.name}, ${chargeLabel}`} />
        </div>
      </section>

      <section className={cardClass}>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#F97316]" aria-hidden="true" />
          <div><h3 className="text-lg font-extrabold text-[#172033]">Coba contoh pembentukan ion</h3><p className="text-xs text-[#64748B]">Pilih reaksi untuk melihat perpindahan elektron yang umum.</p></div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {ION_PRESETS.map((preset) => (
            <button key={preset.symbol} type="button" onClick={() => setPreset(preset)} className="min-h-12 rounded-xl border border-[#F1E5D8] bg-[#FFF8F0] px-3 py-2 text-left font-mono text-xs font-bold text-[#172033] transition hover:border-[#F97316] hover:bg-orange-50">
              {preset.label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-center gap-2 text-sm font-extrabold text-orange-950"><ArrowUp className="h-4 w-4" aria-hidden="true" />Kation: melepas elektron</div>
            <p className="mt-1 text-xs leading-5 text-orange-950/80">Elektron berkurang, sehingga proton lebih banyak daripada elektron. Muatan bersihnya positif.</p>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-2 text-sm font-extrabold text-blue-950"><ArrowDown className="h-4 w-4" aria-hidden="true" />Anion: menerima elektron</div>
            <p className="mt-1 text-xs leading-5 text-blue-950/80">Elektron bertambah, sehingga elektron lebih banyak daripada proton. Muatan bersihnya negatif.</p>
          </div>
        </div>
        <p className="mt-4 rounded-xl bg-[#FFF8F0] p-4 text-xs leading-5 text-[#475569]">
          Ingat: pembentukan ion hanya mengubah jumlah elektron; inti atom tidak berubah. Model kulit mengikuti pendekatan Bohr sederhana untuk unsur Z = 1–20 dan bukan gambaran skala sebenarnya.
        </p>
      </section>
    </div>
  );
}
