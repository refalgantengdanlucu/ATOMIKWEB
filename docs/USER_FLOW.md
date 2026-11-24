# ATOMIKA — Alur Pengguna (USER_FLOW.md)

Dokumen ini memetakan perjalanan pengguna (*User Flow*) siswa SMA/MA Kelas X dalam menggunakan platform pembelajaran kimia interaktif **ATOMIKA**.

---

## 1. Persona Pengguna

- **Siswa Utama:** Siswa SMA Kelas X yang sedang mempelajari materi Struktur Atom pada elemen Pemahaman Kimia Fase E.
- **Guru Pendukung:** Guru kimia yang menggunakan ATOMIKA di kelas sebagai media demonstrasi visual dan latihan terbimbing siswa.

---

## 2. Diagram Alur Utama (Global User Journey)

```
[ Masuk Website: Beranda (/) ]
            │
            ├──────────────────────────────────────────────┐
            ▼                                              ▼
[ Eksplorasi Roadmap / Topik ]                   [ Pintasan Langsung ]
            │                                     ├── Lab Partikel (/lab/partikel)
            ▼                                     ├── Kalkulator Atom (/lab/kalkulator)
  [ Halaman Materi (/materi) ]                    ├── Simulator Ion (/lab/ion)
            │                                     └── Kuis Interaktif (/kuis)
            ▼
[ Pilih Topik (t1, t2, atau t3) ]
            │
            ▼
[ Baca Bagian Materi Bertahap (satu per layar) ]
            │  (Tercatat di visitedSectionIds)
            ▼
[ Latihan Praktik di Laboratorium Atom ]
  ├── Topik 1: Eksplorasi Partikel (ketuk proton, neutron, elektron)
  ├── Topik 2: Kalkulator Partikel & Latihan Prediksi p, n, e
  └── Topik 3: Simulator Ion & Pemeriksaan Perubahan Elektron
            │  (Tercatat di labDone)
            ▼
[ Uji Pemahaman: Kuis Berumpan Balik (/kuis/:topicId) ]
  ├── Mengerjakan 5 butir soal secara bertahap
  ├── Menerima umpan balik instan (pembahasan ilmiah & petunjuk miskonsepsi)
  └── Melihat rangkuman skor (tersimpan nilai terbaik & terakhir)
            │  (Tercatat di quizResults)
            ▼
[ Pantau Capaian di Halaman Progres (/progres) ]
  ├── Cek status 3 Topik (Belum / Sedang / Selesai)
  ├── Tombol "Lanjutkan" ke materi terakhir
  └── Opsi Reset Progres dengan Dialog Konfirmasi
```

---

## 3. Alur Per Topik & Fitur

### 3.1 Alur Materi & Pencarian
1. Siswa membuka menu **Materi**.
2. Siswa dapat mengetik kata kunci pada **SearchBar** (misal: "neutron", "kation", "notasi").
3. Hasil pencarian berbobot menampilkan maksimal 8 hasil relevan.
4. Klik pada hasil membawa siswa langsung ke `/materi/:topicId?s=:sectionId`.
5. Siswa membaca bagian materi dan dapat berpindah menggunakan tombol *Sebelumnya* / *Berikutnya*.

### 3.2 Alur Laboratorium Atom
1. **Mode Partikel:** Siswa mengamati atom Lithium skematis, mengetuk ketiga jenis partikel untuk membuka kartu info sifat, massa, dan lokasi.
2. **Mode Kalkulator & Latihan:** Siswa memasukkan nomor atom $Z$ dan nomor massa $A$, menghitung $p, n, e$, serta dapat membandingkan pasangan nuklida (isotop, isobar, isoton).
3. **Mode Simulator Ion:** Siswa menambah/mengurangi elektron atom, melihat perubahan muatan hidup ($q = p - e$), dan menjawab pertanyaan konseptual.

### 3.3 Alur Kuis Berumpan Balik
1. Siswa memilih paket kuis topik (5 butir soal per paket).
2. Siswa menjawab per soal (pilihan ganda, benar/salah, atau isian angka).
3. Tombol *Periksa Jawaban* menampilkan umpan balik:
   - Jika benar: Penjelasan konsep pendukung.
   - Jika salah: Penjelasan kesalahan umum / miskonsepsi, langkah jawaban benar, dan tautan *Pelajari Lagi*.
4. Pada akhir kuis, siswa melihat skor total, perolehan terbaik, dan opsi ulangi kuis.

