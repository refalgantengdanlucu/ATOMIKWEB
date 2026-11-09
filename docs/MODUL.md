# MODUL PEMBELAJARAN KIMIA FASE E
## ATOMIKA: Struktur Atom, Notasi Partikel Subatom, dan Dasar Hubungan Massa-Mol

> **Media Acuan:** Platform Interaktif ATOMIKA (SMA/MA Kelas X)  
> **Penyusun:** Tim Pengembang Media Pembelajaran Kimia  
> **Dokumen Terkait:** `docs/PRD.md`, `docs/AGENTS.md`, `docs/USER_FLOW.md`

---

## 1. Identitas Modul & Tujuan Pembelajaran

### 1.1 Informasi Umum
- **Mata Pelajaran:** Kimia
- **Fase / Kelas:** Fase E / Kelas X SMA/MA
- **Elemen:** Pemahaman Kimia (Struktur Atom dan Partikel Penyusunnya)
- **Alokasi Waktu Pembelajaran:** 4 JP (dapat disesuaikan)
- **Model Pembelajaran:** *Guided Inquiry Learning* berbantuan media virtual interaktif ATOMIKA

### 1.2 Sasaran Pengguna
Peserta didik SMA/MA kelas X yang sedang menempuh kurikulum merdeka pada materi struktur atom dasar, serta guru mata pelajaran kimia sebagai panduan aktivitas kelas dan praktikum virtual.

### 1.3 Pengetahuan Awal (Prasyarat)
Sebelum mempelajari modul ini, peserta didik diharapkan telah memahami:
1. Konsep materi, unsur, dan molekul sederhana dari pembelajaran IPA di tingkat SMP.
2. Satuan besaran pokok massa (gram, kilogram) dan operasi aritmetika dasar (penjumlahan, pengurangan, perkalian, dan pembagian bilangan desimal).
3. Pemahaman dasar bahwa materi tersusun atas unit terkecil yang memiliki massa dan karakteristik tertentu.

### 1.4 Tujuan Pembelajaran yang Dapat Diperiksa (*Measurable Objectives*)
Setelah menyelesaikan modul ini dan beraktivitas di website ATOMIKA, peserta didik mampu:
1. **TP 1.1:** Mengidentifikasi tiga partikel subatom utama (proton, neutron, dan elektron) beserta nilai muatan relatif, massa relatif, dan lokasinya di dalam atom dengan tingkat akurasi 100%.
2. **TP 2.1:** Menafsirkan notasi atom standar ($^A_Z\text{X}$) untuk menentukan nomor atom ($Z$), nomor massa ($A$), dan lambang unsur.
3. **TP 2.2:** Menghitung jumlah partikel proton ($p$), neutron ($n$), dan elektron ($e$) pada atom netral menggunakan rumus $p = Z$, $n = A - Z$, dan $e = Z$.
4. **TP 2.3:** Membedakan dan mengklasifikasikan pasangan nuklida ke dalam kelompok isotop, isobar, atau isoton berdasarkan perbandingan angka $Z$, $A$, dan $n$.
5. **TP 2.4:** Menghitung jumlah mol zat dari data massa dan massa molar dengan persamaan $n = \frac{m}{M}$ secara benar beserta pembatalan satuannya.
6. **TP 3.1:** Menjelaskan bahwa pembentukan ion terjadi karena perpindahan (pelepasan atau penerimaan) elektron, sedangkan jumlah proton di dalam inti selalu tetap.
7. **TP 3.2:** Menentukan muatan listrik dan jumlah elektron pada kation dan anion sederhana dengan formula $q = p - e$ dan $e = Z - q$.

---

## 2. Bagian Materi Pembelajaran

---

### BAB 1: Struktur Atom dan Karakteristik Partikel Subatom

#### 1.1 Hakikat Atom dan Penyusunnya
Materi di sekitar kita tersusun atas atom-atom. Secara garis besar, sebuah atom terdiri atas dua bagian utama:
1. **Inti Atom (*Nucleus*):** Terletak di pusat atom, berukuran sangat kecil namun memusatkan hampir seluruh massa atom. Inti atom dihuni oleh dua jenis partikel: **proton** dan **neutron** (keduanya disebut sebagai *nukleon*).
2. **Ruang Ekstranuklir (Awan Elektron / Kulit Atom):** Ruang di sekeliling inti atom yang relatif sangat luas dan kosong, tempat **elektron** bergerak dan berinteraksi.

```
       ┌────────────────────────────────────────────────────────┐
       │                     STRUKTUR ATOM                      │
       ├────────────────────────┬───────────────────────────────┤
       │   Inti Atom (Pusat)    │    Kulit / Awan Elektron      │
       ├────────────────────────┼───────────────────────────────┤
       │ • Proton (+1, m ≈ 1)   │ • Elektron (−1, m ≈ 1/1836)   │
       │ • Neutron ( 0, m ≈ 1)  │                               │
       └────────────────────────┴───────────────────────────────┘
```

#### 1.2 Sifat Tiga Partikel Subatom
Tiga partikel dasar pembentuk atom memiliki karakteristik mendasar:

| Partikel Subatom | Simbol | Muatan Relatif | Massa Relatif (sma) | Lokasi dalam Atom | Penemu & Tahun |
|---|:---:|:---:|:---:|:---:|:---:|
| **Proton** | $p$ atau $p^+$ | $+1$ | $1$ | Di dalam inti | E. Goldstein (1886) / E. Rutherford (1919) |
| **Neutron** | $n$ atau $n^0$ | $0$ (netral) | $1$ | Di dalam inti | James Chadwick (1932) |
| **Elektron** | $e$ atau $e^-$ | $-1$ | $\approx \frac{1}{1836}$ | Di luar inti (kulit) | J.J. Thomson (1897) |

> **Catatan Ilmiah Penting:**
> Massa elektron sangatlah kecil jika dibandingkan dengan proton dan neutron (hanya sekitar 0,05% massa proton). Oleh sebab itu, dalam perhitungan nomor massa atom biasa, massa elektron diabaikan dan massa atom dianggap terpusat sepenuhnya pada inti.

#### 1.3 Model Atom Bohr Disederhanakan
Pada aplikasi ATOMIKA (khususnya Lab Mode Partikel), penggambaran atom menggunakan representasi **Bohr Disederhanakan**:
- Inti atom digambarkan di bagian tengah sebagai kumpulan lingkaran oranye (proton) dan abu-abu (neutron).
- Elektron digambarkan mengitari inti pada lintasan lingkaran (kulit $K=2$, $L=8$, $M=8$, dan sisanya pada kulit $N$).
- **Batasan Model:** Representasi lintasan lingkaran ini adalah alat bantu visual penyederhanaan. Menurut model mekanika gelombang (model modern), elektron tidak bergerak pada rel lingkaran tetap, melainkan berada dalam daerah kebolehjadian menemukan elektron yang disebut orbital.

---

### BAB 2: Notasi Atom, Perhitungan Partikel, dan Jembatan Massa Atom ke Mol

#### 2.1 Penulisan Notasi Nuklida Standar
Untuk membedakan atom suatu unsur dengan atom unsur lainnya atau antar-isotop, digunakan lambang notasi nuklida:

$$\LARGE {^A_Z\text{X}}$$

Di mana:
- $\text{X}$ = Lambang unsur kimia (misal: $\text{H}, \text{C}, \text{Na}, \text{Cl}$)
- $A$ = **Nomor Massa** (jumlah total nukleon: proton $+$ neutron)
- $Z$ = **Nomor Atom** (jumlah proton dalam inti atom; menjadi identitas unik setiap unsur)

#### 2.2 Hubungan dan Rumus Perhitungan Partikel
Pada **atom netral** (muatan total = 0):
1. Jumlah proton: $p = Z$
2. Jumlah elektron: $e = Z$ (karena muatan $+p$ seimbang dengan $-e$)
3. Jumlah neutron: $n = A - Z$

#### 2.3 Hubungan Antar-Nuklida: Isotop, Isobar, dan Isoton
Dalam kimia, pasangan-pasangan nuklida dikelompokkan berdasarkan kemiripan nilai numeriknya:
- **Isotop:** Atom-atom dari unsur yang sama ($Z$ sama), tetapi memiliki nomor massa yang berbeda ($A$ berbeda). Contoh: $^{12}_6\text{C}$ dan $^{14}_6\text{C}$.
- **Isobar:** Atom-atom yang memiliki nomor massa sama ($A$ sama), tetapi nomor atomnya berbeda ($Z$ berbeda). Contoh: $^{14}_6\text{C}$ dan $^{14}_7\text{N}$.
- **Isoton:** Atom-atom berbeda yang memiliki jumlah neutron sama ($n = A - Z$ sama), tetapi nomor atomnya berbeda ($Z$ berbeda). Contoh: $^{15}_7\text{N}$ ($n = 15 - 7 = 8$) dan $^{16}_8\text{O}$ ($n = 16 - 8 = 8$).

#### 2.4 Jembatan Massa Atom ke Massa Molar dan Konsep Mol
Nomor massa ($A$) pada tabel periodik berhubungan erat dengan massa atom relatif ($A_r$). Dalam skala laboratorium makroskopis, para ilmuwan menggunakan besaran **Mol** sebagai jembatan yang menghubungkan jumlah partikel mikroskopis dengan massa zat yang dapat ditimbang di neraca.

Hubungan dasar antara massa zat ($m$), massa molar ($M$), dan jumlah mol ($n$) dinyatakan dalam rumus stoikiometri:

$$\LARGE n = \frac{m}{M}$$

Keterangan:
- $n$ = jumlah zat (satuan: $\text{mol}$)
- $m$ = massa sampel zat (satuan: $\text{g}$)
- $M$ = massa molar zat (satuan: $\text{g/mol}$)

---

### BAB 3: Pembentukan Ion dan Perubahan Jumlah Elektron

#### 3.1 Bagaimana Ion Terbentuk?
Atom dalam keadaan dasar bersifat **netral** karena jumlah proton positif di inti sama dengan jumlah elektron negatif di kulit atom ($p = e$).

Ion terbentuk ketika atom **melepaskan** atau **menerima** elektron valensi:
1. **Kation (Ion Positif, $q > 0$):**
   - Terbentuk jika atom netral **melepaskan** satu atau lebih elektron.
   - Karena kehilangan muatan negatif, jumlah proton menjadi lebih banyak daripada elektron ($p > e$).
   - Contoh: Atom Natrium ($Z=11, e=11$) melepaskan $1$ elektron membentuk ion $\text{Na}^+$ ($e=10$).
2. **Anion (Ion Negatif, $q < 0$):**
   - Terbentuk jika atom netral **menerima / menangkap** satu atau lebih elektron.
   - Jumlah elektron menjadi lebih banyak daripada jumlah proton ($e > p$).
   - Contoh: Atom Klorin ($Z=17, e=17$) menangkap $1$ elektron membentuk ion $\text{Cl}^-$ ($e=18$).

#### 3.2 Rumus Perhitungan Ion
- Muatan ion ($q$): $q = p - e$
- Jumlah elektron pada ion ($e$): $e = Z - q$

> **Hukum Konservasi Inti:**
> Selama proses pembentukan ion biasa (reaksi kimia), **jumlah proton dan neutron di dalam inti atom TIDAK PERNAH berubah**. Yang bertambah atau berkurang semata-mata hanyalah elektron pada kulit luar.

---

## 3. Contoh Representasi dan Penjelasan Terbimbing

### 3.1 Contoh Pola Perhitungan Stoikiometri (Massa ke Mol)

Sebagai pola standar konversi analitis antara massa dan jumlah mol:

> **Soal Latihan Handout:**  
> Seorang siswa menimbang sampel air murni ($\text{H}_2\text{O}$) di laboratorium kimia sekolah. Diketahui massa $\text{H}_2\text{O} = 9{,}00\text{ g}$ dan massa molar yang digunakan $= 18{,}0\text{ g/mol}$. Berapakah jumlah mol air tersebut?

**Langkah Penyelesaian Sistematis:**
1. **Identifikasi Besaran yang Diketahui:**
   - Massa zat ($m$) = $9{,}00\text{ g}$
   - Massa molar zat ($M$) = $18{,}0\text{ g/mol}$
2. **Gunakan Rumus Hubungan Mol:**
   $$n = \frac{m}{M}$$
3. **Substitusi Nilai Beserta Satuannya:**
   $$n = \frac{9{,}00\text{ g}}{18{,}0\text{ g/mol}} = 0{,}500\text{ mol}$$
4. **Analisis Pembatalan Satuan (*Unit Cancellation*):**
   $$\frac{\text{g}}{\frac{\text{g}}{\text{mol}}} = \text{g} \times \frac{\text{mol}}{\text{g}} = \text{mol}$$
   Satuan gram ($\text{g}$) pada pembilang dan penyebut saling menghilangkan, sehingga hasil akhirnya eksak dalam satuan **$\text{mol}$**.

---

### 3.2 Contoh Representasi Notasi Atom & Perhitungan Partikel

> **Contoh Soal Partikel:**  
> Diberikan nuklida Natrium $^{23}_{11}\text{Na}$. Tentukan jumlah proton, neutron, dan elektron untuk:
> a. Atom netral $^{23}_{11}\text{Na}$  
> b. Ion kation $^{23}_{11}\text{Na}^+$

**Penyelesaian:**
1. **Untuk atom netral $^{23}_{11}\text{Na}$:**
   - Dari notasi diperoleh $Z = 11$ dan $A = 23$.
   - Proton ($p$) = $Z = 11$.
   - Neutron ($n$) = $A - Z = 23 - 11 = 12$.
   - Elektron ($e$) = $Z = 11$ (karena atom netral).
2. **Untuk ion $\text{Na}^+$ (muatan $q = +1$):**
   - Proton ($p$) tetap $= 11$ (inti tidak berubah).
   - Neutron ($n$) tetap $= 12$.
   - Elektron ($e$) = $Z - q = 11 - (+1) = 10\text{ elektron}$.

---

## 4. Penjelasan Kekeliruan / Miskonsepsi yang Sering Muncul

Berikut adalah daftar kekeliruan umum (*common misconceptions / pitfalls*) yang kerap dilakukan peserta didik beserta penjelasan ilmiah untuk memperbaikinya:

| No | Bentuk Kekeliruan | Penjelasan Mengapa Keliru | Cara Kerja yang Benar |
|:---:|---|---|---|
| **1** | **Memakai nilai massa tanpa membaginya dengan massa molar.** | Siswa langsung menganggap $9{,}00\text{ g}$ sama dengan $9{,}00\text{ mol}$, atau memasukkan angka massa gram langsung ke perbandingan koefisien reaksi. Satuan gram mengukur massa fisis, bukan kuantitas jumlah partikel molekul. | Nilai massa ($m$) **wajib dibagi** dengan massa molar zat ($M$). Periksa selalu satuan: $\frac{\text{g}}{\text{g/mol}} = \text{mol}$. |
| **2** | **Tertukar antara Nomor Atom ($Z$) dan Nomor Massa ($A$).** | Siswa sering mengira angka yang lebih kecil adalah nomor massa, atau mengira nomor atom terletak di posisi atas notasi. | Nomor massa ($A$) selalu bernilai $\ge Z$ karena $A$ adalah gabungan proton dan neutron. Pada notasi baku, $A$ diletakkan di kiri atas dan $Z$ di kiri bawah ($^A_Z\text{X}$). |
| **3** | **Menganggap jumlah neutron sama dengan nomor massa.** | Siswa menyimpulkan $n = A$ tanpa melakukan pengurangan. | Nomor massa mencakup proton dan neutron ($A = p + n$). Jumlah neutron harus selalu dicari lewat selisih: $n = A - Z$. |
| **4** | **Mengira pembentukan ion melibatkan perpindahan proton.** | Ketika melihat ion $\text{Na}^+$, siswa mengira ada 1 proton yang bertambah pada inti. Sebaliknya pada $\text{Cl}^-$, dikira 1 proton hilang. | Proton terikat sangat kuat di inti oleh gaya nuklir kuat. Pembentukan kation terjadi karena **pelepasan elektron**, sedangkan anion karena **penangkapan elektron**. Jumlah proton selalu konstan. |
| **5** | **Mengira orbit Bohr adalah lintasan fisik riil elektron.** | Siswa membayangkan elektron mengitari inti seperti gerbong kereta di atas rel kaku. | Model Bohr adalah representasi penyederhanaan bertahap. Fisika modern menunjukkan posisi elektron digambarkan oleh kerapatan probabilitas (awan orbital). |

---

## 5. Sumber Rujukan Materi dan Aset Visual

Seluruh materi, formula ilmiah, dan data numerik yang dicantumkan dalam modul ini disadur dari sumber-sumber tepercaya berikut:

1. **Konsep Hubungan Massa dan Mol (Stoikiometri Dasar):**
   - Flowers, P., Theopold, K., Langley, R., & Robinson, W. R. *Chemistry 2e*. **OpenStax, Rice University**. Chapter 3: *Composition of Substances and Solutions — Formula Mass and the Mole Concept*. URL: [OpenStax Chemistry 2e](https://openstax.org/books/chemistry-2e/pages/3-1-formula-mass-and-the-mole-concept).
   - Angka sampel pada contoh perhitungan ($m = 9{,}00\text{ g}$ dan $M = 18{,}0\text{ g/mol}$) disusun secara didaktis untuk latihan *handout* terbimbing peserta didik.
2. **Capaian Pembelajaran Kimia Fase E:**
   - Badan Standar, Kurikulum, dan Asesmen Pendidikan (BSKAP) Kemendikbudristek RI. *Keputusan Kepala BSKAP Nomor 032/H/KR/2024 tentang Capaian Pembelajaran pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah pada Kurikulum Merdeka*.
3. **Data Unsur dan Notasi Kimia:**
   - *IUPAC Periodic Table of the Elements* dan *Compendium of Chemical Terminology (Gold Book)*. Cakupan unsur dibatasi pada nomor atom $Z = 1$ hingga $Z = 20$.
4. **Aset Gambar dan Maskot:**
   - Seluruh diagram skema atom dan maskot ATOMIKA (Prota, Neu, Eli) dirancang menggunakan komponen grafik vektor SVG orisinal tanpa menggunakan karakter berhak cipta pihak lain sesuai ketentuan `docs/PRD-UI-ROADMAP.md` bagian U2.

---

## 6. Penanda Evaluasi & Rencana Kuis Interaktif (Bab 3)

---

> ### ⚠️ [LOKASI PENANDA EVALUASI BAB 3]
> 
> **Status Fitur:** **`[RENCANA / BELUM AKTIF]`**  
> *(Sesuai prosedur PRD Bagian 15, modul kuis interaktif akan diaktifkan secara terprogram pada Milestone M5 di rute `/kuis/t3`).*
> 
> **PERINGATAN PENTING:**  
> Evaluasi kuis di bawah ini saat ini **masih berupa draf rencana naskah soal** dan **BELUM SELESAI / BELUM AKTIF** pada sistem web ATOMIKA. Jangan menganggap atau melaporkan kuis ini telah selesai dijalankan hingga implementasi logika kode evaluasi di Milestone M5 dituntaskan.

#### Draf Rencana Butir Soal Kuis Bab 3 (Ion dan Muatan Partikel):

1. **Butir Soal 1 (q3-1 — Numerik):**
   - *Pertanyaan:* Berapakah jumlah elektron pada ion Natrium $\text{Na}^+$ dengan nomor atom $Z = 11$?
   - *Kunci Rencana:* $10$ elektron.
   - *Penjelasan Rencana:* Ion $\text{Na}^+$ bermuatan $+1$, artinya atom netral melepaskan 1 elektron ($e = Z - q = 11 - 1 = 10$).
2. **Butir Soal 2 (q3-2 — Numerik):**
   - *Pertanyaan:* Berapakah jumlah elektron pada ion Klorida $\text{Cl}^-$ dengan nomor atom $Z = 17$?
   - *Kunci Rencana:* $18$ elektron.
   - *Penjelasan Rencana:* Ion $\text{Cl}^-$ bermuatan $-1$, artinya atom netral menerima 1 elektron ($e = 17 - (-1) = 18$).
3. **Butir Soal 3 (q3-3 — Pilihan Ganda):**
   - *Pertanyaan:* Ketika atom Magnesium ($\text{Mg}$) berubah menjadi ion $\text{Mg}^{2+}$, perubahan apa yang sesungguhnya terjadi?
     - A. Jumlah proton berkurang 2
     - B. Jumlah elektron berkurang 2
     - C. Jumlah neutron berkurang 2
     - D. Jumlah elektron bertambah 2
   - *Kunci Rencana:* B (Jumlah elektron berkurang 2).
   - *Penjelasan Rencana:* Pembentukan kation terjadi karena atom melepaskan elektron; jumlah proton dalam inti selalu tetap ($12$).
4. **Butir Soal 4 (q3-4 — Numerik):**
   - *Pertanyaan:* Berapakah jumlah elektron pada ion Oksida $\text{O}^{2-}$ jika nomor atom Oksigen adalah $Z = 8$?
   - *Kunci Rencana:* $10$ elektron.
   - *Penjelasan Rencana:* $e = Z - q = 8 - (-2) = 10$.
5. **Butir Soal 5 (q3-5 — Benar/Salah):**
   - *Pernyataan:* "Sebuah atom yang melepaskan elektron akan menjadi ion yang bermuatan negatif."
   - *Kunci Rencana:* Salah.
   - *Penjelasan Rencana:* Atom yang melepaskan elektron kehilangan muatan negatif, sehingga jumlah proton positif menjadi lebih dominan dan membentuk ion bermuatan positif (kation).

---
*Modul disusun untuk memenuhi standar Kurikulum Merdeka Fase E dan pedoman teknis sistem ATOMIKA.*

