# ATOMIKA — PRD v2.1

**Media Pembelajaran Struktur Penyusun Atom Interaktif**
Website kimia untuk SMA/MA Kelas X · Bahasa Indonesia · Siap untuk vibe coding

---

## 0. Cara Memakai Dokumen Ini

Dokumen ini ditulis untuk dua pembaca: dosen/penilai (alasan dan arah produk) dan AI coding agent (spesifikasi yang eksak).

- **Sumber kebenaran:** Bagian 3 (keputusan terkunci), 6 (ATP), 7 (spesifikasi fitur), 10 (model data), dan 11 (konten awal). Jika ada konflik antarbagian, bagian-bagian itu yang dipakai.
- **Untuk vibe coding:** buka folder proyek di VS Code, simpan berkas ini sebagai `docs/PRD.md`, lalu minta agent membacanya. Prompt siap tempel ada di Bagian 15.
- **Pratinjau di VS Code:** tekan `Ctrl+Shift+V` (Windows/Linux) atau `Cmd+Shift+V` (Mac).

---

## 1. Ringkasan Produk

ATOMIKA adalah website pembelajaran kimia interaktif yang membantu siswa kelas X memahami struktur atom lewat materi bertahap, visualisasi, simulasi, latihan terbimbing, kuis berumpan balik, pencarian materi, dan progres belajar anonim (tanpa akun).

- **Pengguna utama:** siswa SMA/MA kelas X. **Pendukung:** guru kimia (memakai sebagai media, tanpa akun guru).
- **Empat fitur inti:** (1) Materi dan pencarian, (2) Laboratorium Atom, (3) Kuis berumpan balik, (4) Progres anonim.
- **Prinsip:** akurat secara ilmiah, interaktif, umpan balik menjelaskan alasan, responsif, privat.
- **Catatan penting:** fitur yang berfungsi tidak otomatis membuktikan hasil belajar meningkat. Klaim efektivitas butuh evaluasi tersendiri (Bagian 16).

---

## 2. Masalah dan Tujuan

Masalah berikut adalah **hipotesis kebutuhan** yang perlu dikonfirmasi lewat observasi, wawancara guru/siswa, atau uji coba awal.

| ID | Masalah belajar | Solusi | Bukti fungsi |
|---|---|---|---|
| M1 | Struktur atom abstrak, sulit dibayangkan lewat teks | Visualisasi atom dan eksplorasi partikel (Lab mode Partikel) | Siswa dapat memilih partikel dan membaca sifatnya |
| M2 | Tertukar nomor atom, nomor massa, dan jumlah partikel | Kalkulator + latihan prediksi + contoh bertahap | Hasil kalkulator cocok dengan semua kasus uji |
| M3 | Sulit memahami pembentukan ion | Simulator ion (ubah elektron, lihat muatan) | Proton tetap, muatan dan label benar |
| M4 | Latihan hanya benar/salah | Kuis dengan penjelasan dan petunjuk miskonsepsi | Setiap soal punya umpan balik spesifik |
| M5 | Sulit menemukan materi dan memantau belajar | Pencarian materi dan progres lokal | Hasil pencarian relevan; progres bertahan setelah reload |

**Rumusan masalah produk:** bagaimana merancang website pembelajaran kimia yang membantu siswa kelas X memahami struktur atom, menghitung partikel subatom, dan menjelaskan pembentukan ion melalui materi interaktif, simulasi, kuis berumpan balik, pencarian materi, dan progres belajar?

---

## 3. Keputusan Terkunci (jangan diubah agent tanpa persetujuan)

| Aspek | Keputusan |
|---|---|
| Stack | React 18 + TypeScript + Vite + Tailwind CSS. React Router memakai `HashRouter` (aman untuk hosting statis). Vitest untuk logika |
| Backend | Tidak ada. Semua konten di `src/data`, progres di browser |
| Visual | SVG + komponen React. Tanpa LaTeX/KaTeX. Notasi atom dibuat komponen `AtomNotation` (A di atas, Z di bawah, simbol) |
| Cakupan unsur | **Z = 1–20 untuk seluruh fitur** (Lab, kalkulator, simulator ion, kuis) |
| Konfigurasi elektron | **Tidak dimasukkan.** Tidak ada materi, soal, atau latihan konfigurasi elektron, subkulit, orbital, atau bilangan kuantum |
| Model visual | Bohr disederhanakan. Jumlah elektron per kulit hanya untuk menggambar (kapasitas 2, 8, 8, sisanya kulit ke-4) dan wajib diberi label penyederhanaan |
| Kuis | 3 paket (satu per topik) × 5 soal = 15 soal. Satu jawaban per soal. Nilai = benar ÷ 5 × 100. Simpan nilai **terakhir dan terbaik** |
| Progres | `localStorage`, kunci `atomika-progress-v1`. Status topik **diturunkan** dari data, bukan disimpan ganda |
| Pencarian | Sisi klien, indeks dari data materi, skor berbobot (Bagian 7.1) |
| Di luar MVP | Akun, sinkronisasi, dasbor guru, papan peringkat, chatbot AI, LMS, analitik, gim bercabang, aplikasi nanoteknologi |
| Bahasa | Seluruh antarmuka dan konten Bahasa Indonesia |

---

## 4. Ruang Lingkup

**Termasuk MVP:** beranda, 3 topik (materi + ilustrasi + contoh + ringkasan), pencarian, Laboratorium Atom (Partikel, Kalkulator, Ion), latihan terbimbing, kuis berumpan balik, halaman progres, reset dengan konfirmasi, UI responsif, halaman 404.

**Asumsi:** browser modern; progres hanya di browser dan perangkat yang sama dan bisa hilang jika data situs dihapus; konten harus ditinjau guru/ahli materi sebelum dipakai luas; kedalaman materi mengikuti ATP pada Bagian 6.

---

## 5. Tiga Topik Pembelajaran

Pengelompokan tiga topik adalah pengorganisasian konten produk, bukan klaim bahwa kurikulum menetapkan tiga modul resmi.

### Topik 1 — Struktur Atom dan Partikel Penyusunnya (`t1`)

**Tujuan:** menjelaskan karakteristik proton, neutron, elektron dan membandingkan gagasan utama model atom Dalton, Thomson, Rutherford, Bohr.

| Partikel | Muatan relatif | Massa relatif | Lokasi |
|---|---|---|---|
| Proton | +1 | 1 | Inti |
| Neutron | 0 | 1 | Inti |
| Elektron | −1 | sekitar 1/1836 | Di luar inti |

**Catatan ilmiah:** gambar tidak berskala; lintasan melingkar Bohr bukan lintasan pasti elektron menurut model modern; model atom adalah representasi ilmiah yang berkembang berdasarkan bukti.

### Topik 2 — Nomor Atom, Nomor Massa, dan Partikel Subatom (`t2`)

**Tujuan:** menafsirkan notasi atom, menghitung partikel, dan membedakan isotop, isobar, isoton.

- Proton = Z; neutron = A − Z; elektron atom netral = Z.
- **Isotop:** Z sama, A berbeda. **Isobar:** A sama, Z berbeda. **Isoton:** jumlah neutron sama, Z berbeda.
- Validasi: A dan Z bilangan bulat, A ≥ Z. Syarat ini **tidak menjamin** nuklida itu nyata, sehingga contoh latihan hanya dari daftar kurasi (Bagian 11).

### Topik 3 — Ion dan Perubahan Jumlah Elektron (`t3`)

**Tujuan:** menentukan jumlah elektron ion sederhana dan menjelaskan bahwa pembentukan ion lewat perpindahan elektron tidak mengubah jumlah proton.

- Muatan: **q = p − e**. Jumlah elektron: **e = Z − q**.
- Melepas elektron → kation (q positif). Menerima elektron → anion (q negatif).
- Contoh wajib: Na⁺ (e = 10), Mg²⁺ (e = 10), Cl⁻ (e = 18), O²⁻ (e = 10).

---

## 6. Alur Tujuan Pembelajaran (ATP)

### 6.1 Dasar dan status

- **Fase/kelas:** Fase E (kelas X), mata pelajaran Kimia, elemen Pemahaman Kimia.
- **Rujukan CP:** redaksi CP Fase E pada elemen Pemahaman Kimia memuat frasa *memahami struktur atom dan aplikasinya dalam nanoteknologi* (dikutip dari dokumen perangkat ajar yang mengacu CP; periksa redaksi final dan nomor keputusan CP terbaru di portal resmi, Bagian 17).
- **Batasan ATOMIKA:** hanya bagian *struktur atom*. Konfigurasi elektron, bilangan kuantum, orbital rinci, sistem periodik, dan aplikasi nanoteknologi **tidak termasuk**.
- **Status:** ini ATP **rancangan pengembang**. Halaman *Inspirasi ATP* Kimia Fase E di portal Kemendikdasmen saat dicek (26 Oktober 2026) menyatakan contoh ATP masih dikembangkan, sehingga belum ada ATP resmi yang bisa disalin. Sesuaikan dengan ATP sekolah sasaran atau arahan dosen pembimbing.

### 6.2 Urutan tujuan pembelajaran

| Urutan | Kode | Tujuan Pembelajaran (TP) | Prasyarat | Usulan alokasi |
|---|---|---|---|---|
| 1 | TP 1.1 | Mengidentifikasi proton, neutron, dan elektron beserta muatan relatif, massa relatif, dan lokasinya dalam atom | Atom sebagai penyusun materi (SMP) | 1 JP |
| 2 | TP 1.2 | Membandingkan gagasan utama model atom Dalton, Thomson, Rutherford, dan Bohr beserta bukti atau keterbatasannya | TP 1.1 | 2 JP |
| 3 | TP 1.3 | Menjelaskan bahwa model Bohr adalah penyederhanaan dan bahwa model atom modern menggambarkan elektron dengan daerah kebolehjadian (pengantar) | TP 1.2 | 1 JP |
| 4 | TP 2.1 | Menafsirkan notasi atom: nomor atom (Z), nomor massa (A), dan simbol unsur | TP 1.1 | 1 JP |
| 5 | TP 2.2 | Menentukan jumlah proton, neutron, dan elektron atom netral dari notasi atom | TP 2.1 | 2 JP |
| 6 | TP 2.3 | Membedakan isotop, isobar, dan isoton berdasarkan data notasi nuklida | TP 2.2 | 2 JP |
| 7 | TP 3.1 | Menjelaskan pembentukan kation dan anion melalui pelepasan atau penerimaan elektron tanpa perubahan jumlah proton | TP 2.2 | 1 JP |
| 8 | TP 3.2 | Menentukan jumlah elektron dan muatan ion sederhana dengan q = p − e | TP 3.1 | 2 JP |

Alokasi waktu (total usulan 12 JP) hanya perkiraan; sesuaikan dengan jadwal sekolah.

### 6.3 Pemetaan TP ke produk dan kriteria ketercapaian

| TP | Bagian materi | Aktivitas ATOMIKA | Soal | Kriteria ketercapaian (siswa dianggap mencapai TP bila…) |
|---|---|---|---|---|
| 1.1 | t1-atom, t1-partikel | Lab Partikel (ketuk 3 jenis partikel) | q1-1, q1-2 | Menyebutkan muatan, massa relatif, dan lokasi ketiga partikel dengan benar |
| 1.2 | t1-dalton, t1-thomson, t1-rutherford, t1-bohr | Membaca materi dan membandingkan model | q1-3, q1-4 | Mencocokkan gagasan utama dengan modelnya dan menyebut satu bukti atau keterbatasan |
| 1.3 | t1-bohr, t1-modern | Label penyederhanaan pada Lab | q1-5 | Menyatakan bahwa lintasan Bohr bukan lintasan pasti elektron |
| 2.1 | t2-notasi | Komponen `AtomNotation` pada Kalkulator | — | Menunjukkan A dan Z pada notasi yang diberikan |
| 2.2 | t2-hitung, t2-contoh | Kalkulator mode Latihan (prediksi p, n, e) | q2-1, q2-2, q2-3 | Menghitung p, n, e benar pada contoh valid beserta langkahnya |
| 2.3 | t2-hubungan | Kalkulator mode Bandingkan Dua Nuklida | q2-4, q2-5 | Mengklasifikasikan pasangan nuklida dengan alasan numerik |
| 3.1 | t3-ion, t3-kation-anion | Lab Ion (ubah elektron, jawab pertanyaan pemeriksaan) | q3-5 | Menjelaskan bahwa proton tetap dan elektron yang berubah |
| 3.2 | t3-muatan, t3-contoh | Lab Ion preset Na⁺, Mg²⁺, Cl⁻, O²⁻ | q3-1 s.d. q3-4 | Menghitung e dari Z dan q pada ion sederhana |

### 6.4 Di luar ATP ini

Konfigurasi elektron, subkulit, orbital rinci, bilangan kuantum, elektron valensi, sistem periodik unsur, dan aplikasi nanoteknologi. Jika kelak dibutuhkan, tambahkan sebagai TP baru dan fase pengembangan terpisah.

---

## 7. Spesifikasi Fitur

### 7.1 Fitur 1 — Materi dan Pencarian

Halaman topik menampilkan **satu bagian materi per layar** dengan daftar bagian di samping (atas pada ponsel), tombol Sebelumnya/Berikutnya, contoh soal, dan ringkasan. Sebuah bagian dihitung **dibuka** saat ditampilkan.

**Algoritma pencarian:**

1. Normalisasi kueri: huruf kecil, trim, rapikan spasi ganda. Minimal 2 karakter.
2. Pecah menjadi token. Skor per bagian: judul cocok = 3, kata kunci/sinonim cocok = 2, isi cocok = 1. Bagian harus cocok dengan semua token.
3. Urutkan skor menurun, tampilkan maksimal 8 hasil: judul, topik, cuplikan ringkas.
4. Klik hasil membuka `/materi/:topicId?s=:sectionId`.
5. Tidak ada hasil → `EmptyState` berisi saran kata kunci. Tombol ✕ menghapus kueri.
6. Jangan mengklaim mencari seluruh teks bila yang diindeks hanya judul, kata kunci, dan isi bagian.

**Kriteria penerimaan:** tiga topik dapat dibuka; kueri `neutron` menampilkan bagian partikel dan bagian hitung partikel; hasil membuka bagian yang benar; tidak ada tautan navigasi ke halaman kosong.

### 7.2 Fitur 2 — Laboratorium Atom

Tiga mode pada rute `/lab/:mode`:

**Mode Partikel (`partikel`, Topik 1).** Atom contoh (default Li, Z=3, A=7) digambar skematis: inti di tengah, elektron per kulit. Siswa mengetuk proton, neutron, atau elektron untuk membuka `ParticleInfoCard` (muatan, massa relatif, lokasi). Latihan selesai ketika ketiga jenis partikel sudah diketuk. Label wajib: *Model Bohr disederhanakan — ukuran dan jarak tidak berskala.*

Aturan gambar inti: jika A ≤ 24 gambar semua nukleon; jika A > 24 gambar maksimal 24 lingkaran dengan perbandingan proton:neutron dipertahankan (minimal 1 tiap jenis bila jumlahnya lebih dari 0) dan tampilkan teks *Ditampilkan sebagian. Jumlah sebenarnya: p = …, n = …*. Proton = lingkaran oranye bertanda +, neutron = lingkaran abu bertanda n, elektron = lingkaran biru kecil bertanda −.

**Mode Kalkulator (`kalkulator`, Topik 2).** Input: Z (1–20), A (Z–60), muatan q (−3 sampai +3, default 0).

- p = Z; n = A − Z; e = Z − q. Kategori: q = 0 atom netral, q > 0 kation, q < 0 anion.
- Setiap hasil menampilkan langkah penyelesaian dengan angka nyata, misalnya: *n = A − Z = 23 − 11 = 12*.
- **Mode Latihan:** siswa mengisi prediksi p, n, e lebih dulu, lalu menekan Periksa. Umpan balik per isian dengan petunjuk. Latihan Topik 2 selesai bila satu set prediksi benar semua.
- **Bandingkan Dua Nuklida:** input (Z₁, A₁) dan (Z₂, A₂). Hasil: *identik* bila Z dan A sama; *isotop* bila Z sama dan A beda; *isobar* bila A sama dan Z beda; *isoton* bila neutron sama dan Z beda; selain itu *bukan ketiganya*. Tampilkan alasan numeriknya.

| Kondisi input | Jenis | Pesan |
|---|---|---|
| Kosong | Error | Isi nomor atom (Z) dan nomor massa (A). |
| Bukan angka, desimal, atau negatif | Error | Masukkan bilangan bulat positif. |
| Z di luar 1–20 | Error | Nomor atom harus antara 1 dan 20. |
| A < Z | Error | Nomor massa tidak boleh lebih kecil dari nomor atom. |
| A > 60 | Error | Nomor massa terlalu besar untuk latihan ini. |
| e = Z − q < 0 | Error | Muatan terlalu positif: jumlah elektron tidak boleh negatif. |
| (Z, A) tidak ada di daftar kurasi | Catatan | Bukan nuklida contoh ATOMIKA. Hasil hitungan tetap benar sebagai latihan. |

**Mode Ion (`ion`, Topik 3).** Pilih unsur Z = 1–20 (A default dari daftar unsur) atau preset Na⁺, Mg²⁺, Cl⁻, O²⁻.

- Tombol **− elektron** dan **+ elektron**. Rentang elektron: dari max(0, Z−3) sampai Z+3 (muatan dibatasi −3 sampai +3). Tombol dinonaktifkan di batas, dengan teks alasan.
- Proton dan neutron **tidak pernah berubah**. Tampilkan rumus hidup: *q = p − e = 11 − 10 = +1*.
- Label: atom netral / kation / anion. Penulisan muatan konsisten: +1 berarti satu elektron lebih sedikit dari atom netral, −1 berarti satu lebih banyak.
- Sebuah **pertanyaan pemeriksaan** muncul setelah siswa mengubah elektron (misal: *Mengapa muatannya menjadi positif?*, dua pilihan). Menjawab benar menandai latihan Topik 3 selesai. Tombol Reset mengembalikan atom netral.

**Jumlah elektron per kulit (`shells.ts`, hanya untuk gambar):** isi kulit berurutan K=2, L=8, M=8, sisanya kulit N. Contoh: e=10 → 2,8; e=18 → 2,8,8; e=19 → 2,8,8,1. Ini bukan materi konfigurasi elektron dan tidak muncul sebagai soal.

**Kriteria penerimaan:** hasil cocok dengan semua kasus uji Bagian 12; proton tidak berubah saat elektron berubah; label netral/kation/anion sesuai hitungan; error mudah dipahami; kontrol dapat dipakai di sentuh dan keyboard.

### 7.3 Fitur 3 — Kuis Berumpan Balik

**Alur:** pilih paket topik → instruksi (jumlah soal dan aturan nilai) → soal satu per satu → Periksa Jawaban (tombol nonaktif jika belum menjawab) → umpan balik di bawah soal → Lanjutkan → ringkasan hasil → Ulangi / Kembali ke materi.

- **Benar:** konfirmasi dan alasan yang menghubungkan jawaban dengan konsep.
- **Salah:** bahasa netral (*Belum tepat*), letak kesalahan atau miskonsepsi (`wrongHints` bila jawaban salah itu umum), jawaban benar beserta langkah, tautan *Pelajari lagi* ke `relatedSectionId`.
- Isian angka: terima bilangan bulat; spasi di awal/akhir diabaikan; kosong tidak bisa dikirim.
- Nilai = benar ÷ jumlah soal dinilai × 100, dibulatkan ke bilangan bulat. Jumlah soal dinilai selalu 5 (> 0).
- Penyimpanan: `lastScore` selalu diganti; `bestScore` = maksimum; `attempts` bertambah.
- Urutan soal dan pilihan tetap (tanpa acak) pada MVP.

**Kriteria penerimaan:** 15 soal punya kunci terverifikasi dan penjelasan; nilai sesuai aturan; kuis bisa diulang; jawaban salah tidak membuat aplikasi macet; hasil tersimpan ke progres.

### 7.4 Fitur 4 — Progres Anonim

**Tiga butir per topik:** (a) semua bagian materi dibuka, (b) latihan Lab topik itu selesai, (c) kuis topik diselesaikan (nilai berapa pun).

- Status topik: *belum dimulai* (tidak ada butir dan tidak ada bagian dibuka), *sedang dipelajari* (selain itu), *selesai* (3 dari 3).
- Persen topik = butir selesai ÷ 3. Persen keseluruhan = rata-rata tiga topik.
- Halaman Progres: status tiga topik, nilai terakhir/terbaik per kuis, aktivitas belum selesai, tombol **Lanjutkan** (ke `lastOpenedSectionId`), tombol **Reset progres**, dan keterangan *Progres hanya tersimpan di browser dan perangkat ini*.
- Reset memakai `ResetProgressDialog` (Batal / Ya, hapus). Hanya menghapus kunci `atomika-*`.
- **Kegagalan:** data kosong → progres baru; JSON rusak atau versi tidak dikenal → abaikan, mulai baru, tampilkan pemberitahuan; `localStorage` tidak tersedia atau penuh → banner *Progres tidak dapat disimpan di browser ini*, progres tetap berjalan di memori selama sesi, materi tetap bisa dibuka.
- Jangan menjanjikan penyimpanan permanen atau cadangan daring.

---

## 8. Rute dan Halaman

| Rute | Halaman | Isi utama |
|---|---|---|
| `/` | Beranda | Hero + tombol Mulai Belajar, 3 `TopicCard`, pintasan Lab dan Kuis, ringkasan progres, info penyimpanan lokal |
| `/materi` | Daftar materi | `SearchBar`, `SearchResults`, daftar 3 topik |
| `/materi/:topicId?s=:sectionId` | Materi topik | Bagian materi, ilustrasi, contoh, ringkasan, tombol ke latihan terkait |
| `/lab/:mode` | Laboratorium | Tab Partikel, Kalkulator, Ion |
| `/kuis` | Pilih paket | 3 paket, jumlah soal, aturan nilai |
| `/kuis/:topicId` | Mengerjakan kuis | Soal, `FeedbackPanel`, `QuizResult` |
| `/progres` | Progres belajar | `ProgressOverview`, reset |
| `*` | 404 | Pesan dan tombol ke Beranda |

Navigasi utama: Beranda, Materi, Laboratorium Atom, Kuis, Progres Belajar. Pada ponsel berupa menu ringkas/tab bawah dengan label teks.

---

## 9. Spesifikasi UI/UX

**Konsep:** Atomic Orange — Warm Science. Modern, hangat, bersih; kartu putih sudut membulat, bayangan tipis, latar krem, animasi sederhana yang bisa diminimalkan.

| Token | Kode | Penggunaan |
|---|---|---|
| Primary Orange | `#F97316` | Ikon, garis, aksen, **warna proton** (bukan warna teks) |
| Deep Orange | `#C2410C` | **Latar tombol utama dengan teks putih**, tautan, hover |
| Soft Orange | `#FFEDD5` | Latar aksen |
| Cream | `#FFF8F0` | Latar halaman |
| White | `#FFFFFF` | Kartu |
| Navy Ink | `#172033` | Judul dan teks utama |
| Slate Text | `#475569` | Teks pendukung (gunakan ini untuk teks kecil) |
| Neutron Slate | `#64748B` | Penanda neutron (disertai label n) |
| Border Soft | `#F1E5D8` | Garis batas |
| Success / Warning / Error | `#15803D` / `#B45309` / `#B91C1C` | Status, selalu disertai ikon dan teks |
| Electron Blue | `#2563EB` | Penanda elektron (disertai tanda −) |

**Koreksi kontras:** teks putih di atas `#F97316` hanya sekitar 2,8:1 dan gagal WCAG AA (butuh 4,5:1). Karena itu tombol utama memakai `#C2410C` (sekitar 5,2:1).

**Tipografi dan tata letak:** font sans-serif sistem atau satu font web; teks isi minimal 16 px; breakpoint 640/1024 px; target sentuh minimal 44 × 44 px; satu kolom di ponsel, tidak ada gulir horizontal pada lebar 360 px.

**Aksesibilitas:** semua kontrol punya label; fokus terlihat; navigasi keyboard untuk kontrol utama; hasil hitung dan umpan balik memakai `aria-live="polite"`; informasi tidak hanya lewat warna; SVG punya `title`/deskripsi teks; hormati `prefers-reduced-motion`.

**Komponen:** AppHeader, MainNavigation, HomeHero, TopicCard, SearchBar, SearchResults, LessonSection, AtomNotation, AtomVisualization, ParticleInfoCard, ParticleCalculator, NuclideComparer, IonSimulator, GuidedExercise, QuizQuestion, FeedbackPanel, QuizResult, ProgressOverview, ResetProgressDialog, StorageWarning, EmptyState, ErrorMessage.

---

## 10. Model Data

```ts
type TopicId = 't1' | 't2' | 't3';

type LessonSection = {
  id: string; topicId: TopicId; order: number;
  title: string; body: string;
  keywords: string[]; // termasuk sinonim
};

type Topic = {
  id: TopicId; title: string; description: string;
  learningObjectives: string[]; // kode TP dari Bagian 6
  sectionIds: string[];
};

type Question = {
  id: string; topicId: TopicId;
  type: 'multiple-choice' | 'true-false' | 'numeric' | 'classification';
  prompt: string;
  options?: { id: string; label: string }[];
  correct: string | number | boolean; // id opsi, angka, atau boolean
  explanation: string;
  wrongHints?: Record<string, string>; // kunci: id opsi atau angka salah yang umum
  relatedSectionId: string;
  objectiveCode: string; // contoh 'TP 2.2'
};

type Element = { z: number; symbol: string; name: string; defaultA: number };
type Nuclide = { z: number; a: number }; // daftar kurasi

type LocalProgress = {
  version: 1;
  visitedSectionIds: string[];
  labDone: Record<TopicId, boolean>;
  quizResults: Partial<Record<TopicId, {
    attempts: number; lastScore: number; bestScore: number; lastCompletedAt: string;
  }>>;
  lastOpenedSectionId?: string;
  updatedAt: string; // ISO 8601
};
```

Catatan: status topik tidak disimpan (diturunkan, Bagian 7.4). Karena MVP berjalan di frontend, kunci jawaban secara teknis dapat dilihat pengguna; jika kerahasiaan soal dibutuhkan, validasi harus memakai backend (fase berikutnya).

---

## 11. Konten Awal (data kurasi)

**Unsur Z = 1–20** (simbol, nama, A default): 1 H Hidrogen 1; 2 He Helium 4; 3 Li Litium 7; 4 Be Berilium 9; 5 B Boron 11; 6 C Karbon 12; 7 N Nitrogen 14; 8 O Oksigen 16; 9 F Fluor 19; 10 Ne Neon 20; 11 Na Natrium 23; 12 Mg Magnesium 24; 13 Al Aluminium 27; 14 Si Silikon 28; 15 P Fosforus 31; 16 S Belerang 32; 17 Cl Klorin 35; 18 Ar Argon 40; 19 K Kalium 39; 20 Ca Kalsium 40.

**Nuklida kurasi:** H-1, H-2, H-3, C-12, C-13, C-14, N-14, N-15, O-16, O-17, O-18, Na-23, Mg-24, Cl-35, Cl-37, Ar-40, K-40, Ca-40. Pasangan contoh: isotop C-12/C-14; isobar C-14/N-14 dan Ar-40/K-40/Ca-40; isoton N-15/O-16 (neutron 8 dan 8).

**Indeks bagian materi** (agent menulis isi dari poin wajib; seluruh isi diperiksa ahli materi):

| ID | TP | Judul | Kata kunci | Poin wajib |
|---|---|---|---|---|
| t1-atom | 1.1 | Apa itu atom | atom, unsur, partikel | Atom terdiri atas inti dan elektron |
| t1-partikel | 1.1 | Proton, neutron, elektron | muatan, massa, inti, kulit | Tabel muatan/massa/lokasi; neutron ditemukan belakangan (Chadwick, 1932) |
| t1-dalton | 1.2 | Model Dalton | dalton, bola pejal | Atom sebagai bola pejal tak terbagi |
| t1-thomson | 1.2 | Model Thomson | thomson, roti kismis | Elektron tersebar dalam bola bermuatan positif |
| t1-rutherford | 1.2 | Model Rutherford | rutherford, inti, sinar alfa | Muatan positif dan massa terpusat di inti kecil; sebagian besar atom ruang kosong |
| t1-bohr | 1.2, 1.3 | Model Bohr | bohr, kulit, tingkat energi | Elektron pada kulit tertentu; penyederhanaan |
| t1-modern | 1.3 | Model atom modern (pengantar) | orbital, awan elektron | Elektron digambarkan dengan daerah kebolehjadian, bukan lintasan pasti. Tanpa konfigurasi elektron |
| t2-notasi | 2.1 | Notasi atom | notasi, simbol, A, Z | Arti nomor atom dan nomor massa |
| t2-hitung | 2.2 | Menghitung partikel | proton, neutron, elektron, rumus | p = Z; n = A − Z; e = Z (netral) |
| t2-contoh | 2.2 | Contoh bertahap | contoh, langkah | Na-23 dan Cl-35 |
| t2-hubungan | 2.3 | Isotop, isobar, isoton | isotop, isobar, isoton | Definisi dan contoh Bagian 5 |
| t2-ringkasan | 2.1–2.3 | Ringkasan Topik 2 | ringkasan, rumus | Ringkasan rumus dan kesalahan umum |
| t3-ion | 3.1 | Atom netral dan ion | ion, netral | Atom netral: p = e |
| t3-kation-anion | 3.1 | Kation dan anion | kation, anion, melepas, menerima | Proton tidak berubah |
| t3-muatan | 3.2 | Rumus muatan ion | muatan, q | q = p − e; e = Z − q |
| t3-contoh | 3.2 | Contoh ion | Na+, Mg2+, Cl-, O2- | e = 10, 10, 18, 10 |
| t3-ringkasan | 3.1–3.2 | Ringkasan Topik 3 | ringkasan | Ringkasan dan kesalahan umum |

**Sinonim pencarian:** inti = nukleus; kulit = tingkat energi; ion positif = kation; ion negatif = anion; nomor atom = Z; nomor massa = A.

**Bank soal awal (kunci sudah dihitung):**

| ID | TP | Tipe | Soal | Kunci | Penjelasan singkat |
|---|---|---|---|---|---|
| q1-1 | 1.1 | PG | Partikel bermuatan negatif yang berada di luar inti adalah… (Proton / Neutron / Elektron / Inti) | Elektron | Elektron bermuatan −1 dan berada di luar inti |
| q1-2 | 1.1 | PG | Partikel di dalam inti yang tidak bermuatan adalah… (Proton / Neutron / Elektron / Kulit) | Neutron | Neutron bermuatan 0 dan berada di inti |
| q1-3 | 1.2 | B/S | Menurut Rutherford, muatan positif dan hampir seluruh massa atom terpusat di inti yang kecil. | Benar | Hasil hamburan sinar alfa pada lempeng emas tipis |
| q1-4 | 1.2 | PG | Model yang menempatkan elektron pada kulit/tingkat energi tertentu adalah… (Dalton / Thomson / Rutherford / Bohr) | Bohr | Gagasan utama model Bohr |
| q1-5 | 1.3 | B/S | Lintasan melingkar pada gambar model Bohr adalah lintasan pasti elektron menurut model atom modern. | Salah | Model modern memakai daerah kebolehjadian; gambar Bohr adalah penyederhanaan |
| q2-1 | 2.2 | Angka | Atom netral Z = 11, A = 23. Berapa neutronnya? | 12 | n = A − Z = 23 − 11. Hint untuk jawaban 11: itu jumlah proton (Z), bukan neutron |
| q2-2 | 2.2 | Angka | Atom netral Cl-35 (Z = 17). Berapa elektronnya? | 17 | Atom netral: e = Z |
| q2-3 | 2.2 | Angka | Atom Ca dengan Z = 20 dan A = 40. Berapa neutronnya? | 20 | 40 − 20 = 20. Hint untuk 40: itu nomor massa |
| q2-4 | 2.3 | PG | Pasangan isotop adalah… (C-12 dan C-14 / C-14 dan N-14 / N-15 dan O-16 / Na-23 dan Cl-35) | C-12 dan C-14 | Z sama (6), A berbeda |
| q2-5 | 2.3 | Klasifikasi | N-15 (Z=7) dan O-16 (Z=8) merupakan… (isotop / isobar / isoton) | Isoton | Neutron 15−7 = 8 dan 16−8 = 8 |
| q3-1 | 3.2 | Angka | Berapa elektron ion Na⁺ (Z = 11)? | 10 | e = Z − q = 11 − 1 |
| q3-2 | 3.2 | Angka | Berapa elektron ion Cl⁻ (Z = 17)? | 18 | e = 17 − (−1) |
| q3-3 | 3.1 | PG | Saat Mg menjadi Mg²⁺ yang berubah adalah… (proton berkurang 2 / elektron berkurang 2 / neutron berkurang 2 / elektron bertambah 2) | Elektron berkurang 2 | Proton tetap 12, elektron 12 → 10 |
| q3-4 | 3.2 | Angka | Berapa elektron ion O²⁻ (Z = 8)? | 10 | e = 8 − (−2) |
| q3-5 | 3.1 | B/S | Atom yang melepas elektron menjadi ion bermuatan negatif. | Salah | Proton lebih banyak dari elektron, jadi muatan positif (kation) |

---

## 12. Rencana Pengujian

Logika di `src/lib` wajib punya tes otomatis (Vitest) sebelum UI dibangun.

| ID | Skenario | Hasil yang diharapkan |
|---|---|---|
| T-01 | Kalkulator Z=11, A=23, q=0 | p 11, n 12, e 11, atom netral |
| T-02 | Z=11, A=23, q=+1 | e 10, kation |
| T-03 | Z=17, A=35, q=−1 | p 17, n 18, e 18, anion |
| T-04 | Z=1, A=1, q=0 dan q=+1 | n 0; e 1 dan e 0, keduanya valid |
| T-05 | Z=3, A=7, q=+4 | Error elektron negatif |
| T-06 | Input kosong, abc, 11.5, −3, Z=0, Z=21, A<Z, A=61 | Pesan error sesuai tabel 7.2, aplikasi tidak macet |
| T-07 | Bandingkan (6,12)&(6,14); (6,14)&(7,14); (7,15)&(8,16); (11,23)&(17,35); (11,23)&(11,23) | isotop; isobar; isoton; bukan ketiganya; identik |
| T-08 | Simulator Na: kurangi 1 elektron | e 10, q +1, kation, proton tetap 11 |
| T-09 | Simulator Cl: tambah 1 elektron | e 18, q −1, anion, proton tetap 17 |
| T-10 | Batas elektron simulator | Tombol nonaktif di muatan −3 dan +3 |
| T-11 | Jumlah elektron per kulit e = 10, 18, 19 | 2,8; 2,8,8; 2,8,8,1 |
| T-12 | Cari `neutron` dan ` NEUTRON ` dengan spasi | Hasil sama, memuat t1-partikel dan t2-hitung |
| T-13 | Cari `kation`; cari `zzzz`; hapus kueri | Hasil t3-kation-anion; EmptyState; kueri kosong |
| T-14 | Kuis q2-1 dijawab 11 | Belum tepat, hint miskonsepsi, jawaban 12 dan langkah |
| T-15 | Kuis 4 benar dari 5; ulang dengan 3 benar | Nilai 80; terakhir 60, terbaik 80, attempts 2 |
| T-16 | Muat ulang setelah aktivitas | Progres tetap ada |
| T-17 | Reset: Batal lalu Ya | Batal tidak menghapus; Ya menghapus kunci `atomika-*` saja |
| T-18 | JSON rusak, versi tak dikenal, localStorage dinonaktifkan | Mulai baru atau banner; materi tetap bisa dibuka |
| T-19 | Layar 360×640, 768, 1280 | Tanpa gulir horizontal; kontrol dapat dipakai |
| T-20 | Keyboard saja dan pemeriksaan kontras | Semua kontrol utama terjangkau; kontras memenuhi AA |
| T-21 | Cek isi konten | Tidak ada materi/soal konfigurasi elektron, subkulit, atau bilangan kuantum |

**Pengujian ilmiah:** periksa semua rumus, kunci, dan penjelasan; periksa konsistensi contoh isotop/isobar/isoton; minta guru atau ahli materi meninjau. **Uji pengguna:** amati keterpahaman navigasi, kejelasan instruksi, bagian yang membingungkan, manfaat umpan balik, dan pemahaman batasan penyimpanan.

---

## 13. Persyaratan Nonfungsional

- **Performa:** beranda terbuka sekitar 3 detik pada perangkat/koneksi uji yang wajar; animasi tidak menghambat interaksi; aset gambar dioptimalkan.
- **Keandalan:** perubahan input memberi pembaruan konsisten; kegagalan penyimpanan tidak memblokir materi.
- **Privasi:** tidak ada akun, tidak ada nama/email/telepon, progres tidak dikirim ke server, batasan penyimpanan lokal dijelaskan.
- **Pemeliharaan:** konten dalam struktur data konsisten; logika dipisah dari tampilan; komponen dapat dipakai ulang.

---

## 14. Risiko dan Mitigasi

| Risiko | Mitigasi |
|---|---|
| Materi tidak sesuai ATP sekolah | Cocokkan ATP Bagian 6 dengan ATP sekolah/dosen sebelum rilis |
| Visual memperkuat miskonsepsi | Label penyederhanaan, jelaskan beda Bohr dan model modern |
| AI agent mengarang data kimia | Konten hanya dari `src/data`; peninjauan ahli materi |
| Agent menambah konfigurasi elektron | Aturan di Bagian 3 dan tes T-21 |
| Rumus atau kunci salah | Tes otomatis T-01 s.d. T-11 dan peninjauan manual |
| Progres hilang | Beri tahu batasan penyimpanan lokal |
| Tampilan terlalu ramai | Satu bagian materi per layar, hierarki visual jelas |
| Klaim efektivitas tanpa data | Pisahkan uji fungsi dari evaluasi hasil belajar |

---

## 15. Rencana Vibe Coding

**Struktur folder:**

```text
atomika/
├─ docs/PRD.md
└─ src/
   ├─ data/        topics, sections, elements, nuclides, questions
   ├─ lib/         particles, relations, shells, search, scoring, storage, progress (+ berkas tes)
   ├─ components/
   ├─ pages/
   ├─ hooks/       useProgress.ts
   └─ App.tsx
```

**Urutan milestone** (agent berhenti di tiap akhir milestone, menjalankan `npm run test` dan `npm run build`, lalu melapor):

| M | Isi | Selesai bila |
|---|---|---|
| M1 | Proyek Vite+TS+Tailwind, design token, header/navigasi, semua rute dengan halaman placeholder, Beranda | Build lulus, semua rute terbuka |
| M2 | Logika murni di `src/lib` + tes T-01 s.d. T-13 dan T-15 | Semua tes hijau, belum ada UI baru |
| M3 | Data konten, halaman Materi, pencarian | T-12, T-13 lulus secara manual; navigasi hasil benar |
| M4 | Lab: Partikel, Kalkulator (+Latihan, Bandingkan), Ion | T-01 s.d. T-11 terpenuhi di UI |
| M5 | Kuis lengkap 15 soal dengan umpan balik | T-14, T-15 terpenuhi |
| M6 | Progres, reset, penanganan kegagalan storage | T-16 s.d. T-18 terpenuhi |
| M7 | Aksesibilitas, responsif, kontras, perapian | T-19, T-20, T-21 terpenuhi |

**Prompt master (tempel di awal sesi, lampirkan PRD ini):**

```text
Kamu adalah pengembang front-end senior. Bangun website ATOMIKA sesuai docs/PRD.md.
Ikuti Bagian 3 sebagai keputusan terkunci. Kerjakan per milestone pada Bagian 15 dan
berhenti di akhir setiap milestone: jalankan `npm run test` dan `npm run build`, lalu
laporkan hasil, berkas yang diubah, dan hal yang belum selesai.
Jangan menambah fitur di luar PRD, jangan memakai backend, akun, atau library UI berat.
Jangan membuat materi atau soal konfigurasi elektron, subkulit, orbital, atau bilangan kuantum.
Semua konten kimia hanya boleh berasal dari Bagian 11; jangan mengarang data baru dan beri
tanda TODO bila butuh konten tambahan. Taruh logika perhitungan di src/lib sebagai fungsi
murni yang diuji. Mulai dari M1.
```

**Aturan untuk agent:** satu komponen satu berkas; TypeScript strict; tanpa `any`; semua teks UI Bahasa Indonesia; jangan mengubah rumus atau kunci jawaban tanpa tes yang gagal terlebih dahulu; setiap error ditangani dengan pesan, bukan crash.

---

## 16. Definition of Done dan Validasi

**Siap uji coba bila:** tiga topik tersedia dan ditinjau; materi, ilustrasi, contoh, dan latihan ada di tiap topik; empat fitur inti berfungsi; semua tes Bagian 12 lulus; tiap soal punya umpan balik relevan; pencarian membuka bagian yang benar; progres tersimpan dan dapat direset dengan konfirmasi; berfungsi di ponsel dan komputer; keadaan kosong, error, dan gagal simpan ditangani; konten ditinjau guru/ahli materi; tidak ada masalah kritis pada aktivitas utama.

**Keputusan yang sudah dikonfirmasi pengembang:** cakupan unsur Z = 1–20 cukup; konfigurasi elektron tidak dimasukkan.

**Masih perlu diisi:** sekolah dan ATP acuan final; kesesuaian isotop/isobar/isoton dengan materi sekolah; perangkat utama siswa; apakah dipakai mandiri atau difasilitasi guru.

**Jika PRD dipakai untuk penelitian pengembangan:** validasi ahli materi, ahli media, guru, dan uji coba pengguna dapat menjadi bagian prosesnya. Tentukan instrumen (misalnya angket validasi, pretest-posttest) sebelum pengumpulan data, dan klaim kepraktisan atau efektivitas hanya berdasarkan data yang benar-benar dikumpulkan.

---

## 17. Referensi dan Hasil Pengecekan Tautan

Dicek pada 26 Oktober 2026.

| Tautan | Status | Catatan |
|---|---|---|
| https://guru.kemendikdasmen.go.id/kurikulum/referensi-penerapan/capaian-pembelajaran/ | Terbuka | Portal CP & ATP. Berisi tautan ke daftar CP per mapel dan Inspirasi ATP |
| https://kurikulum.kemendikdasmen.go.id/panduan-mapel | Tertaut dari portal (tidak dibuka langsung) | **Gunakan ini** untuk mencari CP Kimia dan memeriksa redaksi final Fase E |
| https://guru.kemendikdasmen.go.id/kurikulum/referensi-penerapan/capaian-pembelajaran/sd-sma/kimia/fase-e/ | Terbuka, tetapi isinya halaman *Inspirasi ATP* | Menyatakan contoh ATP masih dikembangkan. **Ini bukan halaman CP**; jangan dikutip sebagai sumber CP |
| https://kurikulum.kemdikbud.go.id/file/cp/dasmen/16.%20CP%20Kimia.pdf | Tidak dapat diverifikasi | Situs menolak akses otomatis, domain lama (kemdikbud). Buka manual; jika gagal, pakai tautan `panduan-mapel` |
| https://sma.kemendikdasmen.go.id/pembelajaran/media-pembelajaran-interaktif/konfigurasi-elektron-dan-elektron-valensi | Tidak dapat diverifikasi | **Dihapus dari referensi** karena konfigurasi elektron tidak dimasukkan |

Catatan: salah satu dokumen perangkat ajar yang ditemukan mencantumkan CP *Nomor 32 Tahun 2024*. Pastikan nomor dan redaksi CP yang berlaku pada portal resmi sebelum dikutip di laporan tugas.

