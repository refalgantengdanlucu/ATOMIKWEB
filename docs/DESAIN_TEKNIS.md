# Desain Teknis ATOMIKA

## Ringkasan

ATOMIKA adalah SPA berbasis React, TypeScript, Vite, dan Tailwind CSS. Implementasi dependency saat ini memakai React 19, React Router 7, Firebase JS SDK, Vitest, dan oxlint. PRD masih menuliskan React 18; ketidaksesuaian versi dicatat pada [`BACKLOG.md`](./BACKLOG.md), bukan diubah diam-diam.

## Aplikasi dan navigasi

- Entry point: `src/main.tsx`; stylesheet global: `src/index.css`.
- `src/App.tsx` membungkus route dengan `HashRouter`. Rute aplikasi tampil sebagai `/#/materi`, sehingga path setelah `#` tidak dikirim sebagai permintaan file ke web server dan refresh tidak memerlukan rewrite path aplikasi.
- Rute tanpa sesi: `/login`, `/register`, `/forgot-password`, `/reset-password`.
- Rute panel guru: `/panel-guru/*`, dengan pemeriksaan terpisah dalam `PanelGuruRoute`.
- Beranda `/` dan rute belajar melewati `AccessGate`: `/materi`, `/materi/:topicId`, `/laboratorium/:mode`, alias `/lab/:mode`, `/kuis`, `/kuis/:topicId`, `/progres`, `/kelas`; `/dashboard` dan `/guru` dialihkan ke `/kelas`.
- Route tak dikenal dan beranda masuk melalui `AccessGate`; pengguna tanpa sesi diarahkan ke login dengan tujuan awal disimpan untuk dikunjungi setelah login.
- Menu utama desktop dan navigasi ponsel berada di `src/components/Navbar.tsx`. Path internal tetap sama; HashRouter mengodekannya ke fragmen URL.

## Data pembelajaran

- Topik berada di `src/data/topics.ts`; materi di `src/data/sections.ts` (17 bagian, tiga topik); bank kuis v1 di `src/panel-guru/question-banks/v1.ts`, diimpor dari `src/data/quizQuestions.ts`.
- Perhitungan partikel, validasi unsur/muatan, notasi, dan kulit visual sederhana berada di `src/lib/chemistry.ts`.
- Konten statis tidak memerlukan backend. Cakupan unsur adalah Z = 1–20; ilustrasi kulit Bohr merupakan penyederhanaan.

## Identitas, akses, dan penyimpanan

- Firebase diinisialisasi hanya bila API key, auth domain, project ID, dan app ID tersedia. `.env.example` hanya berisi nilai contoh.
- `AccessProvider` memulihkan sesi Firebase dan profil siswa; halaman terlindungi dialihkan ke login jika belum ada profil.
- `PanelGuruRoute` memeriksa keberadaan `teachers/{uid}` melalui Firestore. `AccessProvider` juga membaca claim `role` untuk label/izin kuis. Keduanya perlu diverifikasi konsistensinya pada Firebase aktif.
- Progres utama memakai key `atomika-progress-v1:{uid}`; progres lawas dipertahankan hanya pada namespace anonim. Draf dan riwayat kuis diturunkan dari key progres akun, sehingga akun lain memakai namespace berbeda.
- `safe-storage.ts` menyediakan fallback memori jika localStorage gagal; fallback ini tidak bertahan sesudah halaman ditutup.
- Log aktivitas lokal menyimpan UID pada record baru dan membedakan key berdasarkan UID; record legacy tanpa UID tidak otomatis dipetakan ke akun.
- `firestore.rules` berisi aturan profil, aktivitas per UID, dan hasil kuis. File rules belum membuktikan bahwa aturan telah dipublikasikan pada proyek Firebase.
- `google-apps-script/Code.gs` adalah integrasi lama yang terpisah. URL Web App pada `src/lib/classroom-sync.ts` kosong, jadi sinkronisasi tersebut tidak aktif pada konfigurasi repository ini. Sebelum mengaktifkan, skema data/identitas dan deployment harus diuji.

## Pengujian dan build

- `npm test`: Vitest, mencakup kalkulator kimia, bank soal, progres/storage, aktivitas kelas, sanity materi, dan analitik guru.
- `npm run lint`: oxlint.
- `npm run build`: TypeScript project build kemudian Vite production build.
- Tidak ada test component/browser otomatis pada suite yang terdaftar. Pengujian visual/manual harus dicatat terpisah pada [`../TESTING.md`](../TESTING.md).
