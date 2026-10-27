import { Link } from 'react-router-dom';
import { HomeHero } from '../components/HomeHero';
import { TopicCard } from '../components/TopicCard';
import { TOPICS } from '../data/topics';
import {
  Atom,
  HelpCircle,
  Calculator,
  Zap,
  Info,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export function HomePage() {
  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero */}
      <HomeHero />

      {/* 2. Topik Pembelajaran */}
      <section aria-labelledby="topik-heading">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">
              Kurikulum Merdeka — Kimia Fase E
            </span>
            <h2
              id="topik-heading"
              className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight mt-1"
            >
              Tiga Topik Pembelajaran
            </h2>
          </div>
          <Link
            to="/materi"
            className="text-sm font-semibold text-[#C2410C] hover:underline flex items-center gap-1"
          >
            <span>Lihat semua materi</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TOPICS.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      </section>

      {/* 3. Pintasan Fitur Unggulan (Laboratorium & Kuis) */}
      <section aria-labelledby="fitur-heading" className="space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">
            Eksplorasi Interaktif
          </span>
          <h2
            id="fitur-heading"
            className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight mt-1"
          >
            Fitur Praktikum & Uji Pemahaman
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Lab Partikel */}
          <Link
            to="/lab/partikel"
            className="flex flex-col justify-between p-5 rounded-2xl bg-white border border-[#F1E5D8] hover:border-[#F97316] transition-all group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-[#C2410C] mb-3 group-hover:scale-105 transition-transform">
                <Atom className="w-5 h-5 text-[#F97316]" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-[#172033] text-base group-hover:text-[#C2410C] transition-colors">
                Lab Partikel
              </h3>
              <p className="text-xs text-[#475569] mt-1.5 leading-relaxed">
                Ketuk proton, neutron, dan elektron untuk melihat muatan dan massanya.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#F1E5D8] text-xs font-semibold text-[#C2410C] flex items-center justify-between">
              <span>Buka Lab</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
          </Link>

          {/* Card 2: Kalkulator Partikel */}
          <Link
            to="/lab/kalkulator"
            className="flex flex-col justify-between p-5 rounded-2xl bg-white border border-[#F1E5D8] hover:border-[#F97316] transition-all group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#2563EB] mb-3 group-hover:scale-105 transition-transform">
                <Calculator className="w-5 h-5 text-[#2563EB]" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-[#172033] text-base group-hover:text-[#C2410C] transition-colors">
                Kalkulator Partikel
              </h3>
              <p className="text-xs text-[#475569] mt-1.5 leading-relaxed">
                Hitung p, n, e otomatis dari Z dan A, serta bandingkan dua nuklida.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#F1E5D8] text-xs font-semibold text-[#C2410C] flex items-center justify-between">
              <span>Buka Kalkulator</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
          </Link>

          {/* Card 3: Simulator Ion */}
          <Link
            to="/lab/ion"
            className="flex flex-col justify-between p-5 rounded-2xl bg-white border border-[#F1E5D8] hover:border-[#F97316] transition-all group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 mb-3 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 text-teal-600" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-[#172033] text-base group-hover:text-[#C2410C] transition-colors">
                Simulator Ion
              </h3>
              <p className="text-xs text-[#475569] mt-1.5 leading-relaxed">
                Ubah jumlah elektron dan amati perubahan muatan kation & anion.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#F1E5D8] text-xs font-semibold text-[#C2410C] flex items-center justify-between">
              <span>Buka Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
          </Link>

          {/* Card 4: Kuis Berumpan Balik */}
          <Link
            to="/kuis"
            className="flex flex-col justify-between p-5 rounded-2xl bg-white border border-[#F1E5D8] hover:border-[#F97316] transition-all group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-3 group-hover:scale-105 transition-transform">
                <HelpCircle className="w-5 h-5 text-purple-600" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-[#172033] text-base group-hover:text-[#C2410C] transition-colors">
                Kuis Berumpan Balik
              </h3>
              <p className="text-xs text-[#475569] mt-1.5 leading-relaxed">
                15 soal pilihan ganda & isian dengan penjelasan konsep jika belum tepat.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#F1E5D8] text-xs font-semibold text-[#C2410C] flex items-center justify-between">
              <span>Mulai Kuis</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
          </Link>
        </div>
      </section>

      {/* 4. Ringkasan Progres & Info Penyimpanan Lokal */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ringkasan Progres Belajar */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-white border border-[#F1E5D8] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C2410C] mb-2">
              <TrendingUp className="w-4 h-4 text-[#F97316]" aria-hidden="true" />
              <span>Progres Belajar Anda</span>
            </div>
            <h3 className="text-lg font-bold text-[#172033]">
              Pantau Pemahaman Anda Secara Nyata
            </h3>
            <p className="text-sm text-[#475569] mt-1">
              Setiap kali Anda membaca materi, mencoba eksperimen di laboratorium, dan menyelesaikan kuis, progres Anda akan tercatat secara otomatis.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F1E5D8] flex items-center justify-between">
            <span className="text-xs text-[#475569]">
              3 Topik · 3 Lab Praktik · 3 Paket Kuis
            </span>
            <Link
              to="/progres"
              className="px-4 py-2 rounded-xl bg-[#FFF8F0] hover:bg-[#FFEDD5] text-[#C2410C] text-xs font-semibold border border-[#F1E5D8] transition-colors"
            >
              Lihat Rincian Progres
            </Link>
          </div>
        </div>

        {/* Info Penyimpanan Lokal */}
        <div className="p-6 rounded-2xl bg-[#FFEDD5]/40 border border-[#F1E5D8] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#C2410C] mb-2">
              <Info className="w-5 h-5 shrink-0" aria-hidden="true" />
              <h3 className="font-bold text-sm text-[#172033]">
                Penyimpanan Lokal & Anonim
              </h3>
            </div>
            <p className="text-xs text-[#475569] leading-relaxed">
              ATOMIKA tidak memerlukan registrasi atau akun. Catatan belajar Anda disimpan langsung di browser perangkat ini melalui{' '}
              <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-[#F1E5D8] text-[#C2410C]">
                localStorage
              </code>
              .
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F1E5D8]/80 text-[11px] text-[#475569]">
            💡 Jika Anda membersihkan data cache peramban, riwayat belajar akan ter-reset.
          </div>
        </div>
      </section>
    </div>
  );
}

