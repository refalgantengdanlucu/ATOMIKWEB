# Panduan Kerja Agent ATOMIKA

Dokumen ini melengkapi aturan tetap di [`AGENTS.md`](./AGENTS.md) dengan cara kerja yang sesuai implementasi proyek saat ini.

## Sumber kebenaran

1. Perilaku aktual: `src/`, `package.json`, `firestore.rules`, dan konfigurasi Vite.
2. Batas produk dan konten: [`PRD.md`](./PRD.md) serta koreksi keputusan yang disepakati.
3. Status pengujian: [`../TESTING.md`](../TESTING.md). Jangan menaikkan status menjadi lulus tanpa bukti eksekusi.

Jika dokumen dan kode berbeda, catat perbedaan di backlog, jangan mengarang perilaku atau mengubah keputusan produk tanpa persetujuan. Contoh drift saat ini: PRD menyebut React 18, sedangkan dependensi yang terpasang adalah React 19; keputusan router tetap HashRouter sesuai PRD.

## Aturan implementasi

- Pertahankan antarmuka Bahasa Indonesia dan identitas *Atomic Orange — Warm Science*.
- Halaman beranda `/` dan fitur belajar wajib melewati autentikasi; hanya rute login, pendaftaran, dan pemulihan akun yang tersedia tanpa sesi.
- Pertahankan cakupan tiga topik, 17 bagian materi, unsur Z = 1–20, tiga paket kuis, dan larangan materi konfigurasi elektron.
- Progres dan draf kuis harus memakai storage key yang diturunkan dari UID Firebase. Jangan menyatukan akun berdasarkan nama atau kelas.
- Data lama tanpa UID tidak boleh otomatis diklaim sebagai milik akun tertentu.
- Peran guru hanya berasal dari dokumen `teachers/{uid}` yang dikelola administrator dan memiliki `institutionId`; custom claim atau PIN di frontend bukan sumber otorisasi.
- `institutionId` pada profil siswa hanya dapat ditetapkan administrator. Jangan memberi peran atau cakupan institusi dari form atau storage klien.
- Batasi query guru dan aturan Firestore pada `institutionId` yang sama. Pemeriksaan UI bukan pengganti aturan server; perubahan rules belum aman untuk produksi sebelum diuji di Emulator dan dipublikasikan.
- Google Apps Script lama ditolak/dinonaktifkan. Jangan mengaktifkannya kembali tanpa verifikasi Firebase ID token di server.
- Jangan mengklaim login, database, hosting produksi, atau sinkronisasi Google Sheets berhasil sebelum diuji pada konfigurasi yang benar-benar aktif.
- Error penyimpanan atau sinkronisasi harus ditampilkan/dicatat, bukan disamarkan sebagai sukses.

## Siklus kerja

1. Baca halaman/rute, data, dan test yang berkaitan sebelum mengubahnya.
2. Buat perubahan terkecil yang memperbaiki akar masalah.
3. Tambahkan test fokus untuk perilaku baru atau bug yang diperbaiki.
4. Jalankan `npm test`, `npm run lint`, dan `npm run build`.
5. Untuk perubahan UI/routing, uji hasil build di browser termasuk refresh dan viewport ponsel.
6. Catat command, hasil, dan keterbatasan yang belum dapat diuji pada [`../TESTING.md`](../TESTING.md) dan [`AI_LOG.md`](./AI_LOG.md).
