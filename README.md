# Refal Project

Project React modern yang dikonfigurasi dengan:
- ⚡ **[Vite](https://vite.dev/)**
- ⚛️ **[React 19](https://react.dev/)**
- 🔷 **[TypeScript](https://www.typescriptlang.org/)**
- 🎨 **[Tailwind CSS v4](https://tailwindcss.com/)**

---

## 🚀 Perintah yang Tersedia

Jalankan perintah berikut di terminal:

```bash
# Menjalankan server development (lokal)
npm run dev

# Membangun bundle untuk production
npm run build

# Menjalankan linter
npm run lint

# Menjalankan preview dari hasil build
npm run preview
```

> **Catatan untuk Windows PowerShell:**  
> Jika muncul pesan `cannot be loaded because running scripts is disabled on this system`, gunakan `npm.cmd run dev` atau jalankan perintah:
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
> ```

---

## 📁 Struktur Folder

- `src/` — Berisi kode sumber aplikasi
  - `src/App.tsx` — Komponen utama aplikasi
  - `src/main.tsx` — Entry point React
  - `src/index.css` — Konfigurasi styling & Tailwind CSS
- `public/` — Berisi aset statis (favicon, icons, dll)
- `vite.config.ts` — Konfigurasi Vite & Tailwind CSS plugin
- `tsconfig.json` — Konfigurasi TypeScript

## Kegiatan Kelas

Halaman **Kegiatan Kelas** di `/kelas` menyediakan kuis klasifikasi reaksi, cek pemahaman, presensi, dan checklist progres laporan praktikum. Tahapan progres, pertanyaan polling, bank soal, daftar nama guru, dan PIN dapat diedit pada `src/lib/classroom.ts`.

Data kelas disimpan di `localStorage` browser. Artinya data bertahan di browser/perangkat yang sama, tetapi belum terkumpul lintas perangkat siswa; fitur polling memerlukan backend bersama untuk distribusi kelas lintas perangkat. Gerbang PIN di sisi klien adalah penghalang kasual, bukan kontrol akses yang aman untuk data sensitif. Ganti konstanta `TEACHER_PIN` sebelum publikasi.

## Gerbang Akses

Saat pertama membuka aplikasi, pilih **Akses Siswa** atau **Akses Guru**. Siswa mengisi nama lengkap dan kelas; sesi berlaku selama tab browser terbuka. Akses siswa dibatasi ke Topik 1, sedangkan Topik 2, Topik 3, Laboratorium Virtual, Progres/Evaluasi terkunci. Guru memilih Refaldi, Khilda, atau Wilda dan memakai PIN yang diatur oleh `TEACHER_PIN`; setelah valid, seluruh modul dan menu Dashboard Guru terbuka. Gerbang ini berjalan di sisi klien dan bukan pengamanan kuat.

## Laboratorium Virtual

Laboratorium menyediakan tiga simulasi interaktif untuk unsur Z = 1–20: **Lab Partikel** untuk mengeksplorasi proton, neutron, elektron, dan kulit elektron; **Kalkulator Partikel** untuk menghitung p/n/e berdasarkan Z, A, dan muatan serta membandingkan isotop/isobar/isoton; dan **Simulator Ion** untuk mengamati serah-terima elektron saat membentuk kation atau anion. Ilustrasi memakai model Bohr yang disederhanakan dan bukan skala sebenarnya. Logika hitungnya berada di `src/lib/chemistry.ts`.
