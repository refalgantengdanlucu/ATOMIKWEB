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
- `AccessProvider` memulihkan sesi Firebase. Siswa adalah peran default; guru ditentukan hanya oleh dokumen `teachers/{uid}` yang memiliki `institutionId` valid. Custom claim role tidak dipakai sebagai sumber otorisasi.
- Profil siswa `profiles/{uid}` dapat dibuat pemiliknya dengan nama/kelas, tetapi `institutionId` ditambahkan administrator melalui Firebase Console/Admin SDK. Profil tanpa institusi tetap dapat memakai data lokal, tetapi tidak dapat mengirim record ke Firestore.
- `PanelGuruRoute` memeriksa dokumen keanggotaan guru dan `institutionId`. `TeacherDashboard` hanya meminta `quiz_attempts` dengan filter `institutionId` milik guru; `/kelas` memfilter query aktivitas dan hasil kuis dengan ID yang sama.
- Progres utama memakai key `atomika-progress-v1:{uid}`; progres lawas dipertahankan hanya pada namespace anonim. Draf dan riwayat kuis diturunkan dari key progres akun, sehingga akun lain memakai namespace berbeda.
- `safe-storage.ts` menyediakan fallback memori jika localStorage gagal; fallback ini tidak bertahan sesudah halaman ditutup.
- Log aktivitas dan data lokal `/kelas` memakai namespace UID; data global lama tidak dipetakan berdasarkan nama dan kelas. Progres utama dan riwayat kuis tetap lokal per UID.
- Firestore memakai `profiles/{uid}`, `teachers/{uid}`, `student_activities/{uid}`, dan `quiz_attempts/{attemptId}`. Rules memastikan owner UID, institusi yang ditetapkan administrator, identitas tampilan terhadap profil, validasi payload, dan akses guru pada institusi yang sama. Dokumen lama tanpa `institutionId` tidak dapat dibaca pada query dashboard baru sampai dipetakan secara tepercaya.
- `google-apps-script/Code.gs` dan sinkronisasi Google Sheets dinonaktifkan karena endpoint lama tidak memverifikasi Firebase ID token. File source yang ditolak tidak menonaktifkan deployment Apps Script lama; deployment eksternal harus dihapus atau diperbarui manual.
- Kuis/presensi/polling/progres laporan pada `/kelas` tetap tersedia secara lokal per UID. Fitur lokal tersebut bukan database bersama dan tidak digunakan sebagai sumber data guru lintas perangkat.
- `firebase.json` mengatur Firestore Emulator. Tes aturan terpisah ada di `tests/firestore-rules.node.mjs`; jalankan `npm run test:rules` dengan Firebase CLI dan Java. Rules di repository tidak membuktikan publikasi atau perilaku proyek Firebase produksi.

## Pengujian dan build

- `npm test`: Vitest, mencakup kalkulator kimia, bank soal, progres/storage, aktivitas kelas, sanity materi, dan analitik guru.
- `npm run lint`: oxlint.
- `npm run build`: TypeScript project build kemudian Vite production build.
- Tidak ada test component/browser otomatis pada suite yang terdaftar. Pengujian visual/manual harus dicatat terpisah pada [`../TESTING.md`](../TESTING.md).
