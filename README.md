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

## Login dan Alur Belajar Siswa

Beranda, seluruh materi dan latihan essay, Laboratorium, serta semua paket Kuis dapat digunakan tanpa login. Progres anonim disimpan sementara di browser; progres akun tetap dipisahkan berdasarkan UID. Hanya menu Progres dan Presensi yang meminta login. Sesudah login, pengguna kembali ke halaman yang diminta. Tanpa konfigurasi Firebase, halaman login akan menampilkan variabel yang perlu disiapkan dan proses autentikasi tetap dinonaktifkan.

Materi, tiga mode Laboratorium (Partikel, Kalkulator Partikel, dan Simulator Ion), serta tiga paket kuis dapat dibuka dalam urutan bebas. Halaman **Progres** menampilkan status materi, lab, dan nilai kuis terakhir/terbaik setelah login.

## Presensi

Halaman **Presensi** di `/presensi` menggunakan identitas akun dan menyimpan satu catatan per murid per hari ke Firestore. Waktu dibuat oleh Firestore, tanggal harian mengikuti zona WIB, dan aturan database membatasi catatan pada pemiliknya serta mencegah perubahan/penghapusan dan presensi ganda. Riwayat yang ditampilkan hanya milik akun murid. Firestore dan profil murid harus sudah dikonfigurasi serta ditetapkan ke institusi oleh administrator. Rute lama `/kelas?aktivitas=...` tetap tersedia untuk menjaga fitur/data kegiatan kelas yang telah ada; membuka `/kelas` tanpa aktivitas mengarah ke Presensi.

Sinkronisasi Google Sheets sengaja dinonaktifkan. Endpoint Apps Script lama tidak memverifikasi identitas Firebase dan tidak aman untuk menerima atau menampilkan data siswa. `google-apps-script/Code.gs` kini menolak permintaan. Jika pernah ada deployment Web App sebelumnya, hapus deployment atau cabut akses publik di Apps Script; mengubah file source saja tidak menonaktifkan deployment lama.

## Autentikasi

Autentikasi tetap aktif untuk data akun dan fungsi administrasi. Permintaan login dari Progres atau Presensi menyimpan tujuan awal agar pengguna kembali ke halaman tersebut sesudah autentikasi berhasil. Halaman login, pendaftaran, dan pemulihan kata sandi tetap dapat diakses tanpa sesi.

Autentikasi belum dapat digunakan sampai aplikasi Firebase Web dikonfigurasi. Buat aplikasi Web di Firebase, salin `.env.example` sebagai `.env.local` (PowerShell: `Copy-Item .env.example .env.local`), lalu ganti nilai contoh dengan konfigurasi Web Firebase dari **Project settings → Your apps**. Isi sekurangnya `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, dan `VITE_FIREBASE_APP_ID`. Mulai ulang server Vite setelah mengubah environment. Untuk deployment, tambahkan variabel yang sama pada pengaturan environment hosting dan build ulang. Nilai konfigurasi Web Firebase berada di sisi klien; jangan menaruh kredensial Admin SDK atau service account di frontend.

Di Firebase Console:

1. Aktifkan **Authentication → Sign-in method → Email/Password** dan **Google**. Untuk Google, isi alamat email dukungan proyek.
2. Pada **Authentication → Settings → Authorized domains**, tambahkan domain lokal dan domain deployment.
3. Aktifkan Cloud Firestore. Jalankan `npm run test:rules` pada lingkungan dengan Firebase CLI dan Java, lalu salin `firestore.rules` ke **Firestore → Rules** dan publish setelah hasil emulator lulus.
4. Akun biasa menjadi siswa. Dokumen `profiles/{uid}` dibuat oleh pemilik akun dengan nama dan kelas, tetapi `institutionId` hanya boleh ditetapkan administrator melalui Firebase Console atau Admin SDK di lingkungan tepercaya.
5. Tetapkan guru dengan membuat `teachers/{uid}` berisi `institutionId` melalui Firebase Console atau Admin SDK. Dokumen tersebut adalah satu-satunya sumber peran guru; klien tidak dapat membuat atau mengubah keanggotaan guru.
6. Gunakan ID institusi kanonis yang hanya berisi huruf, angka, `_` atau `-` (maksimum 80 karakter), lalu berikan ID yang sama kepada profil siswa dan guru yang satu institusi. Jangan memetakan data lama berdasarkan nama saja.

Sesi dan token dikelola Firebase Authentication, bukan kata sandi yang disimpan aplikasi. Opsi **Ingat saya di perangkat ini** mengatur persistensi sesi browser. Lupa kata sandi dan verifikasi email memakai tautan Firebase. Nilai `VITE_FIREBASE_*` adalah konfigurasi Web yang dapat terlihat di browser, bukan kredensial Admin; jangan masukkan service-account key atau rahasia Admin SDK ke frontend.

Aturan Firestore membatasi siswa pada dokumen dengan UID Firebase mereka dan membatasi guru pada dokumen yang `institutionId`-nya sama dengan dokumen keanggotaan guru. Query dashboard juga harus memfilter `institutionId`. Pengguna tanpa penetapan institusi tetap dapat memakai fitur lokal, tetapi penyimpanan Firestore dan akses guru lintas perangkat belum tersedia untuk akun tersebut.

### Migrasi dan pengujian keamanan

Perubahan skema bersifat aditif dan tetap memakai Firebase: tambahkan `institutionId` pada `profiles/{uid}`, `teachers/{uid}`, `student_activities/{uid}`, dan `quiz_attempts/{attemptId}`. Data lama tanpa institusi tidak otomatis dimasukkan ke institusi mana pun. Administrator harus memeriksa identitas UID dan memetakan dokumen secara manual sebelum data itu muncul di dashboard. Uji rules menggunakan project emulator `demo-atomika-security`; jangan menjalankan test dengan data produksi.

Rules di repositori belum sama dengan rules yang aktif sampai dipublikasikan di Firebase Console/CLI. Emulator lokal menguji file rules, bukan deployment produksi. Login, operasi Firestore, dan rules produksi tetap membutuhkan proyek staging serta akun uji.

## Laboratorium Virtual

Laboratorium menyediakan tiga simulasi interaktif untuk unsur Z = 1–20: **Lab Partikel** untuk mengeksplorasi proton, neutron, elektron, dan kulit elektron; **Kalkulator Partikel** untuk menghitung p/n/e berdasarkan Z, A, dan muatan serta membandingkan isotop/isobar/isoton; dan **Simulator Ion** untuk mengamati serah-terima elektron saat membentuk kation atau anion. Ilustrasi memakai model Bohr yang disederhanakan dan bukan skala sebenarnya. Logika hitungnya berada di `src/lib/chemistry.ts`.
