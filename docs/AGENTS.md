# ATOMIKA — Pedoman & Aturan AI Agent (AGENTS.md)

Dokumen ini mendefinisikan peran, batasan, keputusan terkunci, dan alur kerja AI Agent dalam pengembangan media pembelajaran interaktif **ATOMIKA** (Kimia SMA/MA Kelas X Fase E).

---

## 1. Peran & Persona Agent

| Peran | Tanggung Jawab Utama |
|---|---|
| **Senior Front-End Architect** | Mengimplementasikan komponen React 18, TypeScript murni (strict, tanpa `any`), Tailwind CSS, arsitektur HashRouter, dan performa tinggi bebas error. |
| **Chemical Content & Pedagogy Auditor** | Memastikan keakuratan konten sains, keterikatan dengan ATP Fase E, visualisasi Bohr berlabel penyederhanaan, serta pencegahan miskonsepsi. |
| **Test & Reliability Engineer** | Menulis unit test otomatis (Vitest) untuk fungsi logika perhitungan kimia di `src/lib`, memverifikasi build, serta memvalidasi toleransi error. |

---

## 2. Keputusan Terkunci (Non-Negotiable)

1. **Teknologi:** React 18 + TypeScript + Vite + Tailwind CSS. Routing wajib menggunakan `HashRouter` untuk kompatibilitas hosting statis. Vitest untuk logika murni.
2. **Tanpa Backend & Bebas Akun:** Seluruh data materi/soal berada di `src/data/`, progres belajar anonim di `localStorage` peramban (`atomika-progress-v1`).
3. **Cakupan Unsur:** Terbatas pada unsur **Z = 1 s.d. 20**.
4. **Batasan Materi Ketat:** **Dilarang keras** memasukkan materi, latihan, atau soal mengenai konfigurasi elektron ($1s^2 2s^2 \dots$), subkulit, orbital, atau bilangan kuantum.
5. **Representasi Visual:** Model Bohr disederhanakan (kapasitas 2, 8, 8, sisanya kulit ke-4) dan **wajib** mencantumkan label bahwa ini adalah representasi penyederhanaan bukan skala sebenarnya.
6. **Desain & Aksesibilitas:** Menggunakan konsep *Atomic Orange — Warm Science* dengan kontras teks tombol utama (`#C2410C`) memenuhi standar WCAG AA ($\ge 4.5:1$).

---

## 3. Alur Pengembangan Per Milestone

Agent bekerja secara terisolasi per milestone, menjalankan `npm run test` dan `npm run build` di setiap akhir tahap sebelum melapor:

- **M1:** Pondasi proyek, design tokens, AppHeader, MainNavigation, rute HashRouter, dan Beranda. *(Selesai)*
- **M2:** Logika murni perhitungan subatom di `src/lib/` beserta rangkaian unit test Vitest T-01 s.d. T-13 & T-15.
- **M3:** Data kurasi materi 17 bagian, penampil materi bertahap, dan algoritma pencarian berbobot.
- **M4:** Laboratorium Atom interaktif (Mode Partikel SVG, Mode Kalkulator & Latihan, Mode Simulator Ion).
- **M5:** Bank soal kuis 15 nomor dengan umpan balik konsep dan deteksi miskonsepsi spesifik.
- **M6:** Hook `useProgress`, sinkronisasi storage lokal, fallback memori, dan dialog konfirmasi reset.
- **M6b:** Roadmap interaktif dengan maskot orisinal (Prota, Neu, Eli) dan tips pemandu.
- **M7:** Audit aksesibilitas akhir, keyboard navigation, kontras, dan perapian.

---

## 4. Integritas Konten Kimia

- Setiap perhitungan harus didasarkan pada rumus standar:
  - $p = Z$
  - $n = A - Z$
  - $e = Z - q$ (atom netral $q = 0 \Rightarrow e = Z$)
- Stoikiometri dasar / jembatan massa ke mol:
  - $n = \frac{m}{M}$ (di mana satuan gram saling menghilangkan, menghasilkan mol).
- Sumber rujukan materi wajib merujuk pustaka resmi: OpenStax Chemistry 2e (*Formula Mass and the Mole Concept*) dan Kemendikbudristek.

