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
