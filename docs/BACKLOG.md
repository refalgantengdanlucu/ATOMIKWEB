# Backlog Teknis ATOMIKA

Status di bawah menunjukkan hal yang belum dapat dibuktikan atau diselesaikan hanya dari checkout lokal ini. Prioritas dapat berubah setelah konfigurasi dan kebutuhan deployment tersedia.

| Prioritas | Item | Status | Kriteria selesai |
|---|---|---|---|
| Tinggi | Jalankan tes Firestore Rules pada Emulator | Tes akses dibuat; Firebase CLI dan Java tidak tersedia pada lingkungan kerja ini | `npm run test:rules` lulus untuk anonim, owner UID, spoof UID, guru satu institusi, dan institusi lain |
| Tinggi | Publikasikan Firestore Rules dan provision data di proyek staging | Belum dilakukan; rules lokal tidak mengubah layanan | Rules yang sama dipublikasikan; profil siswa dan dokumen guru diberi `institutionId` terverifikasi; operasi staging membuktikan penolakan akses lintas institusi |
| Tinggi | Konfigurasikan Firebase Web pada hosting | `.env.local` lokal sudah dikonfigurasi; environment hosting dan domain deployment belum diverifikasi | Tambahkan variabel Web Firebase pada hosting, aktifkan Google provider dan authorized domain, lalu sign-in berhasil pada situs deployment |
| Tinggi | Provision akun siswa/guru untuk institusi | Skema aditif disiapkan; data existing belum dipetakan | Administrator memverifikasi pemilik UID lalu mengisi `institutionId`; akun siswa tidak dapat mengubahnya; guru hanya membaca institusi yang sama |
| Tinggi | Uji hosting statis target dengan tautan hash dan refresh | Belum diuji pada hosting produksi | Beranda, deep link `/#/...`, dan refresh memuat aplikasi tanpa 404 pada domain target |
| Tinggi | Hapus atau perbarui deployment Apps Script lama | Source repository kini menolak GET/POST; deployment yang pernah dibuat tidak dapat dinonaktifkan dari checkout | Hapus deployment publik lama dari Apps Script dan pastikan endpoint aktif menolak akses anonim serta tidak mengakses spreadsheet |
| Sedang | Uji responsivitas semua halaman dan seluruh kontrol pada perangkat nyata | Belum diuji menyeluruh | Daftar halaman/rute diuji pada ukuran desktop dan ponsel; kontrol navigasi, kuis, kalkulator, serta formulir dapat digunakan |
| Sedang | Selaraskan ketentuan versi React di PRD dengan paket aktual | PRD menyebut React 18; `package.json` menggunakan React 19 | Pemilik produk menyetujui versi, lalu PRD dan pedoman teknis konsisten |
| Sedang | Rencanakan migrasi data aktivitas lama tanpa UID | Tidak dapat dipetakan aman secara otomatis | Pemilik data memutuskan retensi/pembersihan; tidak ada record lama yang dikaitkan ke akun berdasarkan nama saja |
| Sedang | Rancang integrasi spreadsheet yang memverifikasi Firebase ID token di server | Integrasi langsung browser/Apps Script dinonaktifkan | Hanya aktif setelah server memverifikasi token, membatasi `institutionId`, dan lulus tes negatif tanpa token/UID palsu |
| Rendah | Tambahkan test browser/UI untuk penyimpanan draf kuis dan perutean terlindungi | Belum tersedia di suite saat ini | Test memverifikasi reload draf per UID, redirect login, dan larangan akses berdasarkan role/progres |

## Catatan pembatasan

Jangan menandai integrasi sebagai selesai hanya karena modul/aturan terdapat di repository. Untuk pekerjaan yang memerlukan akun Firebase, emulator, spreadsheet, atau deployment, gunakan lingkungan uji dengan data sintetis dan catat konfigurasi yang diuji tanpa mencatat rahasia.
