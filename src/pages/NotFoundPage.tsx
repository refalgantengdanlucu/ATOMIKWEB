import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="py-20 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-[#FFEDD5] text-[#C2410C] flex items-center justify-center mx-auto mb-5 shadow-xs">
        <AlertCircle className="w-8 h-8 text-[#F97316]" aria-hidden="true" />
      </div>
      <span className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">
        Error 404
      </span>
      <h1 className="text-3xl font-extrabold text-[#172033] tracking-tight mt-1">
        Halaman Tidak Ditemukan
      </h1>
      <p className="mt-3 text-sm text-[#475569] leading-relaxed">
        Halaman atau tautan yang Anda tuju tidak tersedia atau telah dipindahkan.
      </p>

      <div className="mt-8 flex justify-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold text-sm shadow-sm transition-colors min-h-[44px]"
        >
          <Home className="w-4 h-4" aria-hidden="true" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  );
}

