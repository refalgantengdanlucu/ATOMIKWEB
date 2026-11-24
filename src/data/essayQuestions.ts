import type { TopicId } from '../types';

export interface EssayQuestion {
  id: string;
  number: number;
  subtopicId: TopicId;
  subtopicTitle: string;
  prompt: string;
  guidePoints?: string[];
}

export const ESSAY_SUBTOPICS: { id: TopicId; title: string; questionNumbers: number[] }[] = [
  {
    id: 't1',
    title: 'Struktur Atom & Partikel Penyusunnya',
    questionNumbers: [1, 2],
  },
  {
    id: 't2',
    title: 'Nomor Atom, Nomor Massa & Partikel Subatom',
    questionNumbers: [3, 4],
  },
  {
    id: 't3',
    title: 'Ion & Perubahan Jumlah Elektron',
    questionNumbers: [5, 6],
  },
];

export const ESSAY_QUESTIONS: EssayQuestion[] = [
  {
    id: 'essay-1',
    number: 1,
    subtopicId: 't1',
    subtopicTitle: 'Struktur Atom & Partikel Penyusunnya',
    prompt:
      'Atom merupakan partikel terkecil penyusun suatu unsur yang masih memiliki sifat unsur tersebut. Jelaskan struktur dasar atom dengan menyebutkan tiga partikel subatom penyusunnya, letak masing-masing partikel, serta muatan listriknya!',
    guidePoints: [
      'Sebutkan 3 partikel subatom: proton, neutron, elektron',
      'Jelaskan letak: proton dan neutron di inti atom, elektron di luar inti/kulit atom',
      'Jelaskan muatan listrik: proton bermuatan positif (+1), neutron netral (0), elektron bermuatan negatif (−1)',
    ],
  },
  {
    id: 'essay-2',
    number: 2,
    subtopicId: 't1',
    subtopicTitle: 'Struktur Atom & Partikel Penyusunnya',
    prompt:
      'Seorang peserta didik mengamati ilustrasi model atom yang menunjukkan adanya inti atom dan elektron yang berada di sekitarnya. Menurut pemahamanmu, mengapa sebagian besar massa atom terkonsentrasi pada inti atom, sedangkan elektron berada di luar inti? Jelaskan berdasarkan karakteristik partikel penyusun atom!',
    guidePoints: [
      'Bandingkan massa proton dan neutron dengan massa elektron (massa proton dan neutron jauh lebih besar, ~1836 kali massa elektron)',
      'Jelaskan konsentrasi massa di inti atom karena diisi oleh proton dan neutron',
      'Jelaskan bahwa elektron bermassa sangat kecil/dapat diabaikan terhadap massa total dan bergerak di ruang sekeliling inti',
    ],
  },
  {
    id: 'essay-3',
    number: 3,
    subtopicId: 't2',
    subtopicTitle: 'Nomor Atom, Nomor Massa & Partikel Subatom',
    prompt:
      'Suatu atom unsur X memiliki nomor atom 17 dan nomor massa 35. Tentukan jumlah proton, elektron, dan neutron dalam atom tersebut! Jelaskan langkah-langkah yang kamu gunakan untuk memperoleh setiap jumlah partikel tersebut!',
    guidePoints: [
      'Proton = Nomor Atom (Z) = 17',
      'Elektron = Proton = 17 (karena atom netral)',
      'Neutron = Nomor Massa (A) − Nomor Atom (Z) = 35 − 17 = 18',
      'Tuliskan langkah perhitungan secara sistematis',
    ],
  },
  {
    id: 'essay-4',
    number: 4,
    subtopicId: 't2',
    subtopicTitle: 'Nomor Atom, Nomor Massa & Partikel Subatom',
    prompt:
      'Unsur karbon memiliki dua isotop, yaitu karbon-12 dan karbon-14. Kedua isotop tersebut memiliki nomor atom yang sama, tetapi nomor massanya berbeda. Jelaskan mengapa kedua atom tersebut tetap termasuk unsur karbon dan apa yang menyebabkan perbedaan nomor massanya!',
    guidePoints: [
      'Jelaskan identitas unsur ditentukan oleh nomor atom/jumlah proton (keduanya memiliki 6 proton, sehingga tetap unsur karbon)',
      'Jelaskan perbedaan nomor massa disebabkan oleh perbedaan jumlah neutron di dalam inti (karbon-12 memiliki 6 neutron, karbon-14 memiliki 8 neutron)',
      'Kaitkan dengan definisi ilmiah isotop',
    ],
  },
  {
    id: 'essay-5',
    number: 5,
    subtopicId: 't3',
    subtopicTitle: 'Ion & Perubahan Jumlah Elektron',
    prompt:
      'Atom magnesium (Mg) memiliki nomor atom 12. Ketika membentuk ion Mg²⁺, atom tersebut melepaskan sejumlah elektron. Jelaskan proses pembentukan ion Mg²⁺ serta tentukan jumlah proton, elektron, dan muatan yang dimiliki ion tersebut!',
    guidePoints: [
      'Atom Mg netral memiliki 12 proton dan 12 elektron',
      'Pembentukan ion Mg²⁺: atom Mg melepaskan 2 elektron valensi untuk mencapai kestabilan oktet',
      'Partikel ion Mg²⁺: proton = 12, elektron = 10 (12 − 2), muatan = +2',
    ],
  },
  {
    id: 'essay-6',
    number: 6,
    subtopicId: 't3',
    subtopicTitle: 'Ion & Perubahan Jumlah Elektron',
    prompt:
      'Perhatikan dua proses pembentukan ion berikut:\na. Atom natrium (Na) melepaskan 1 elektron menjadi Na⁺.\nb. Atom oksigen (O) menerima 2 elektron menjadi O²⁻.\nJelaskan perbedaan proses pembentukan kedua ion tersebut berdasarkan perubahan jumlah elektron, muatan ion yang terbentuk, dan hubungannya dengan kestabilan konfigurasi elektron!',
    guidePoints: [
      'Perubahan elektron: Na melepaskan 1 elektron (kation), sedangkan O menerima/menangkap 2 elektron (anion)',
      'Muatan yang terbentuk: Na menjadi bermuatan +1 (Na⁺) karena proton (11) > elektron (10); O menjadi bermuatan −2 (O²⁻) karena elektron (10) > proton (8)',
      'Kestabilan konfigurasi elektron: keduanya mencapai konfigurasi elektron stabil gas mulia (oktet/seperti Neon)',
    ],
  },
];
