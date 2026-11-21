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

## Alur Belajar Siswa

Siswa membuka materi secara berurutan; seluruh bagian Topik 1–3 harus dibaca sebelum Laboratorium terbuka. Laboratorium memiliki tiga mode (Partikel, Kalkulator Partikel, dan Simulator Ion); setiap mode ditandai selesai saat dibuka. Setelah ketiga mode dibuka, Kuis 1 tersedia. Kuis berikutnya terbuka setelah kuis sebelumnya dikirim. Halaman **Progres** selalu dapat dibuka dan menampilkan status materi, lab, urutan kuis, serta nilai terakhir dan terbaik. Progres tersimpan lokal di browser/perangkat siswa.

## Kegiatan Kelas

Halaman **Kegiatan Kelas** di `/kelas` menyediakan kuis klasifikasi reaksi, cek pemahaman, presensi, dan checklist progres laporan praktikum. Tahapan progres, pertanyaan polling, bank soal, daftar nama guru, dan PIN dapat diedit pada `src/lib/classroom.ts`.

Data lokal disimpan di browser. Untuk merekap aktivitas lintas perangkat, proyek menyediakan Google Apps Script di `google-apps-script/Code.gs` yang menghubungkan spreadsheet dan mencatat aktivitas terakhir, riwayat perpindahan halaman, progres laporan, serta hasil kuis. Polling tetap lokal dan belum disinkronkan lintas perangkat. Gerbang PIN di sisi klien adalah penghalang kasual, bukan kontrol akses yang aman untuk data sensitif.

### Menghubungkan Google Sheets

1. Buka spreadsheet kelas, pilih **Ekstensi → Apps Script**, lalu salin isi `google-apps-script/Code.gs` ke editor Apps Script dan simpan. Script sudah memuat ID spreadsheet yang diberikan untuk proyek ini.
2. Pilih **Deploy → New deployment → Web app**. Jalankan aplikasi sebagai akun pemilik spreadsheet dan atur akses ke **Anyone** agar browser siswa dapat mengirim data tanpa login Google. Tinjau implikasi akses publik: PIN ini hanya penghalang kasual; jangan simpan data sensitif.
3. Deploy, izinkan akses saat diminta, lalu salin URL Web App yang berakhiran `/exec`.
4. Tempel URL tersebut ke `CLASSROOM_SHEETS_WEB_APP_URL` pada `src/lib/classroom-sync.ts`, lalu build dan deploy ulang aplikasi.
5. Setelah tersambung, tab **Aktivitas Siswa** menampilkan nama, kelas, halaman/topik terakhir, ringkasan progres materi, dan waktu terakhir aktif. Tab **Progres Tugas** dan **Kuis Reaksi** membaca data bersama dari spreadsheet; hasil kuis juga dicatat di tab `Hasil Kuis`. Dashboard memperbarui data cloud setiap 30 detik atau lewat tombol **Segarkan**.

URL spreadsheet saja belum mengaktifkan sinkronisasi; koneksi baru aktif setelah Web App Apps Script di-deploy dan URL `/exec` diisi pada konfigurasi aplikasi.

## Autentikasi

Semua halaman utama memakai Firebase Authentication. Buat aplikasi Web di Firebase, salin `.env.example` menjadi `.env.local`, lalu isi konfigurasi Web Firebase dari **Project settings → Your apps**. Nilai konfigurasi web Firebase berada di sisi klien; jangan menaruh kredensial Admin SDK atau service account di frontend.

Di Firebase Console:

1. Aktifkan **Authentication → Sign-in method → Email/Password** dan **Google**. Untuk Google, isi alamat email dukungan proyek.
2. Pada **Authentication → Settings → Authorized domains**, tambahkan domain lokal dan domain deployment.
3. Aktifkan Cloud Firestore, lalu salin aturan dari `firestore.rules` ke **Firestore → Rules** dan publish. Profil siswa disimpan di `profiles/{uid}` dan hanya dapat dibaca/ditulis oleh pemilik akun.
4. Akun baru menjadi siswa secara default. Akun guru harus ditetapkan melalui custom claim `role: "teacher"` memakai Firebase Admin SDK pada lingkungan tepercaya. Jangan menetapkan role dari browser atau dari dokumen profil Firestore.

Sesi dan token dikelola Firebase Authentication, bukan kata sandi yang disimpan aplikasi. Opsi **Ingat saya di perangkat ini** mengatur apakah sesi browser bertahan setelah tab ditutup. Lupa kata sandi dan verifikasi email memakai tautan Firebase; pastikan template email dan domain pengalihan dikonfigurasi untuk domain deployment. Tanpa `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, dan `VITE_FIREBASE_APP_ID`, autentikasi tidak dapat digunakan.

Pembatasan rute guru/siswa di website memakai custom claim pada token Firebase. Integrasi Google Sheets lama tetap memakai PIN bersama pada Apps Script dan berjalan terpisah dari Firebase; PIN tersebut bukan kontrol akses yang aman untuk data sensitif. Lindungi spreadsheet/deployment secara terpisah sebelum menggunakannya untuk data privat.

Akun yang sebelumnya hanya ada di Supabase tidak otomatis dipindahkan ke Firebase; migrasi akun lama perlu ditangani terpisah.

## Laboratorium Virtual

Laboratorium menyediakan tiga simulasi interaktif untuk unsur Z = 1–20: **Lab Partikel** untuk mengeksplorasi proton, neutron, elektron, dan kulit elektron; **Kalkulator Partikel** untuk menghitung p/n/e berdasarkan Z, A, dan muatan serta membandingkan isotop/isobar/isoton; dan **Simulator Ion** untuk mengamati serah-terima elektron saat membentuk kation atau anion. Ilustrasi memakai model Bohr yang disederhanakan dan bukan skala sebenarnya. Logika hitungnya berada di `src/lib/chemistry.ts`.
