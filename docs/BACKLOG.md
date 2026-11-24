# Backlog Teknis ATOMIKA

Status di bawah menunjukkan hal yang belum dapat dibuktikan atau diselesaikan hanya dari checkout lokal ini. Prioritas dapat berubah setelah konfigurasi dan kebutuhan deployment tersedia.

| Prioritas | Item | Status | Kriteria selesai |
|---|---|---|---|
| Tinggi | Uji Firebase Authentication dan Firestore pada proyek uji | Konfigurasi Web lokal sudah dimuat, tetapi sign-in dan operasi database belum diuji | Login Google/email berhasil dengan akun uji; izin profil, aktivitas, kuis, dan pembatasan guru diverifikasi terhadap rules yang dipublikasikan |
| Tinggi | Konfigurasikan Firebase Web pada hosting | `.env.local` lokal sudah dikonfigurasi; environment hosting dan domain deployment belum diverifikasi | Tambahkan variabel Web Firebase pada hosting, aktifkan Google provider dan authorized domain, lalu sign-in berhasil pada situs deployment |
| Tinggi | Verifikasi akses guru antara custom claim dan dokumen `teachers/{uid}` | Perlu keputusan dan uji integrasi | Satu sumber otorisasi dipakai konsisten oleh UI dan aturan Firestore; siswa tidak dapat membuka panel atau membaca data guru |
| Tinggi | Uji hosting statis target dengan tautan hash dan refresh | Belum diuji pada hosting produksi | Beranda, deep link `/#/...`, dan refresh memuat aplikasi tanpa 404 pada domain target |
| Sedang | Uji responsivitas semua halaman dan seluruh kontrol pada perangkat nyata | Belum diuji menyeluruh | Daftar halaman/rute diuji pada ukuran desktop dan ponsel; kontrol navigasi, kuis, kalkulator, serta formulir dapat digunakan |
| Sedang | Selaraskan ketentuan versi React di PRD dengan paket aktual | PRD menyebut React 18; `package.json` menggunakan React 19 | Pemilik produk menyetujui versi, lalu PRD dan pedoman teknis konsisten |
| Sedang | Rencanakan migrasi data aktivitas lama tanpa UID | Tidak dapat dipetakan aman secara otomatis | Pemilik data memutuskan retensi/pembersihan; tidak ada record lama yang dikaitkan ke akun berdasarkan nama saja |
| Sedang | Tentukan apakah sinkronisasi Google Sheets lama akan dipakai | Tidak aktif: URL Web App kosong | Jika diaktifkan, skema identitas dan akses data lintas siswa ditinjau, lalu alur POST/GET dan deployment diuji dengan data dummy |
| Rendah | Tambahkan test browser/UI untuk penyimpanan draf kuis dan perutean terlindungi | Belum tersedia di suite saat ini | Test memverifikasi reload draf per UID, redirect login, dan larangan akses berdasarkan role/progres |

## Catatan pembatasan

Jangan menandai integrasi sebagai selesai hanya karena modul/aturan terdapat di repository. Untuk pekerjaan yang memerlukan akun Firebase, emulator, spreadsheet, atau deployment, gunakan lingkungan uji dengan data sintetis dan catat konfigurasi yang diuji tanpa mencatat rahasia.
