# Catatan Perubahan dengan Bantuan AI

Catatan ini berisi perubahan yang dapat diverifikasi di repositori, bukan klaim bahwa fitur eksternal sudah digunakan.

## 24 November 2026 — audit navigasi, isolasi aktivitas, dan dokumentasi

### Perubahan

- Mengganti `BrowserRouter` beserta jembatan hash lama menjadi `HashRouter`, mengikuti keputusan routing pada PRD dan AGENTS untuk hosting statis.
- Mengubah identitas aktivitas siswa dari nama/kelas menjadi UID bila tersedia. UID disimpan pada record lokal dan menjadi ID dokumen Firestore; data lama tanpa UID tetap memakai identitas legacy dan tidak dipindah ke akun secara otomatis.
- Menambahkan aturan Firestore untuk record aktivitas: pemilik akun dapat membuat/memperbarui record dengan UID yang cocok, dan guru terdaftar dapat membacanya.
- Menambahkan test unit yang memastikan dua siswa bernama dan berkelas sama tidak memakai key aktivitas yang sama.
- Melengkapi pedoman agent, arsitektur teknis, backlog, peran tim, dan matriks pengujian berdasarkan kode yang ada.

### Validasi

- `npm test`: lulus, 7 file dan 45 test.
- `npm run lint`: exit 0; ada dua warning `react-hooks/exhaustive-deps` di `src/components/AccessGate.tsx`.
- `npm run build`: lulus; Vite mengeluarkan warning ukuran chunk JavaScript di atas 500 kB.
- Preview production lokal: navigasi desktop tampil pada 1536 px; navigasi adaptif tampil pada 375–1280 px; tidak ada horizontal overflow pada 375, 768, 1024, 1280, dan 1536 px. Hash deep link terlindungi merespons HTTP 200 dan dialihkan ke login, lalu refresh tetap HTTP 200.
- Browser: tidak ditemukan page error atau console error pada alur beranda/menu login.

Lihat [`../TESTING.md`](../TESTING.md) untuk langkah, hasil aktual, dan batas cakupan setiap skenario.

### Batas bukti

Konfigurasi `.env.example` masih berisi nilai contoh, konfigurasi URL Google Apps Script di kode kosong, dan tidak ada bukti deployment hosting atau publikasi `firestore.rules` dari repositori. Karena itu login sungguhan, database jarak jauh, Google Sheets, serta hosting produksi tidak dianggap teruji.

## 24 November 2026 — login wajib dan revisi hero

### Perubahan

- Memindahkan beranda ke dalam `AccessGate`; pengguna tanpa sesi diarahkan ke login dan alur autentikasi mempertahankan tujuan awal.
- Menghapus tombol CTA pada hero atas dan mengganti klaim “Bebas Akun (Anonim)” menjadi progres per akun.
- Memperjelas pesan konfigurasi Firebase yang diperlukan di halaman autentikasi dan menambahkan langkah `.env.local`, environment hosting, serta restart/build ke README.
- Memperbarui PRD dan desain teknis agar login wajib sebelum beranda, tanpa mengubah batas konten pembelajaran.

### Batas konfigurasi

Pada awal perubahan login, checkout tidak memiliki `.env.local` dan `.env.example` masih berisi placeholder. Pengguna kemudian menambahkan konfigurasi Firebase lokal pada file bernama `env.lokal`; file tersebut dipindahkan ke `.env.local` agar dimuat Vite. File konfigurasi diabaikan Git dan nilainya tidak dicatat.

### Validasi perubahan

- `npm test`: 8 file, 46 test lulus, termasuk penolakan placeholder pada konfigurasi Firebase.
- `npm run lint`: exit 0 dengan dua warning dependency hook yang sudah ada.
- `npm run build`: lulus; warning bundle lebih besar dari 500 kB tetap ada.
- Preview production lokal: beranda dan deep link materi tanpa sesi diarahkan ke login; refresh login menghasilkan HTTP 200. Pesan setup Firebase terlihat dan tombol submit login dinonaktifkan ketika config tidak ada. Pada viewport ponsel 375 px (layout client 360 px), tidak ada overflow. Tidak ada console/page error pada browser.
- Pada validasi awal sebelum file konfigurasi diberikan, login berhasil dan tampilan beranda setelah autentikasi belum dapat diuji.

## 24 November 2026 — mengaktifkan konfigurasi Firebase lokal

- Menemukan konfigurasi lokal bernama `env.lokal`; Vite tidak memuat nama tersebut. Memindahkannya ke `.env.local`, yang diabaikan Git. Nilai config tidak dicetak atau dicatat.
- `npm run build` lulus dengan konfigurasi tersebut. Preview browser tidak lagi menampilkan peringatan konfigurasi dan tombol Google/email login aktif; tidak ada error console/page.
- `npm test`: 8 file, 46 test lulus. `npm run lint`: exit 0 dengan dua warning dependency hook yang sama.
- Belum melakukan sign-in Google memakai akun pengguna dan belum menguji baca/tulis Firestore atau rules yang dipublikasikan. Status Google provider, authorized domain deployment, dan database harus dipastikan di Firebase Console.
