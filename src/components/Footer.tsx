import { Link } from 'react-router-dom';
import { Sparkles, Atom } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[#F1E5D8] bg-white py-10 px-4 sm:px-6 mt-12 mb-16 md:mb-0">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand & Description */}
          <div className="md:col-span-5 space-y-3">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F97316] to-[#C2410C] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Atom className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-[#172033]">
                  ATOMIKA
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFEDD5] text-[#C2410C]">
                  Fase E
                </span>
              </div>
            </Link>
            <p className="text-xs text-[#475569] leading-relaxed max-w-sm">
              Media Pembelajaran Kimia Interaktif Struktur Atom untuk siswa SMA/MA Kelas X (Fase E Kurikulum Merdeka). Memadukan konsep visual, simulasi laboratorium partikel, dan kuis adaptif.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-4 grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-bold text-[#172033] mb-2.5">Menu Utama</p>
              <ul className="space-y-1.5 text-[#475569]">
                <li>
                  <Link to="/" className="hover:text-[#C2410C] transition-colors">
                    Beranda
                  </Link>
                </li>
                <li>
                  <Link to="/materi" className="hover:text-[#C2410C] transition-colors">
                    Materi Pembelajaran
                  </Link>
                </li>
                <li>
                  <Link to="/laboratorium" className="hover:text-[#C2410C] transition-colors">
                    Laboratorium Atom
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-[#172033] mb-2.5">Aktivitas</p>
              <ul className="space-y-1.5 text-[#475569]">
                <li>
                  <Link to="/kuis" className="hover:text-[#C2410C] transition-colors">
                    Kuis Evaluasi
                  </Link>
                </li>
                <li>
                  <Link to="/kelas" className="hover:text-[#C2410C] transition-colors">
                    Kegiatan Kelas
                  </Link>
                </li>
                <li>
                  <Link to="/login?role=teacher" className="hover:text-[#C2410C] transition-colors font-medium text-[#C2410C]/90">
                    Akses Guru
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Curriculum & Specs */}
          <div className="md:col-span-3 space-y-2.5 text-xs text-[#475569]">
            <p className="font-bold text-[#172033]">Standar Pembelajaran</p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFF8F0] border border-[#F1E5D8] text-[11px] font-medium text-[#C2410C]">
              <Sparkles className="w-3.5 h-3.5 text-[#F97316]" aria-hidden="true" />
              <span>Capaian Pembelajaran Fase E</span>
            </div>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              Materi disusun berdasar Alur Tujuan Pembelajaran (ATP) Kimia SMA: perkembangan model atom, partikel subatom, notasi atom, dan pembentukan ion.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#F1E5D8] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
          <p>© {new Date().getFullYear()} ATOMIKAWEB. Media Pembelajaran Kimia SMA/MA.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Bahasa Indonesia</span>
            <span>·</span>
            <span>Privat & Anonim</span>
            <span>·</span>
            <span>Fase E Kelas X</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
