# Tim dan Tanggung Jawab ATOMIKA

Nama personel atau daftar anggota resmi tidak tersedia pada source tree yang diaudit. Dokumen ini tidak mengarang nama; pembagian berikut adalah peran yang dibutuhkan untuk mengelola implementasi dan validasi.

| Peran | Tanggung jawab | Bukti/area kerja |
|---|---|---|
| Pemilik produk / dosen pembimbing | Menyetujui ruang lingkup, versi teknologi, dan perubahan keputusan PRD | `docs/PRD.md`, keputusan pada backlog |
| Pengembang front-end | Menjaga React/TypeScript, routing, tampilan, dan aksesibilitas | `src/`, `package.json`, `vite.config.ts` |
| Penelaah materi kimia | Memeriksa ketepatan konsep, contoh, miskonsepsi, dan batas materi Fase E | `src/data/sections.ts`, bank kuis, `docs/MODUL.md` |
| QA / penguji | Menjalankan test otomatis, alur manual, browser desktop/ponsel, dan mencatat bukti | `TESTING.md`, test Vitest di `src/` |
| Administrator Firebase/hosting | Menyediakan environment uji, mempublikasikan rules, mengelola domain dan deployment | `.env` lokal, `firestore.rules`, pengaturan konsol hosting |

## Tata kelola

- Personel yang menjalankan uji eksternal mengisi nama/lingkungan dan tanggal pada catatan pengujian sebelum menyatakan hasil lulus.
- Kredensial, data siswa riil, dan service account tidak disimpan dalam dokumen atau source control.
- Perubahan konten atau akses memerlukan peninjauan peran materi dan QA sebelum rilis.
