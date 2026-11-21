import type { TopicId } from '../types';

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: { id: string; label: string }[];
  correct: string;
  explanation: string;
  wrongFeedback: Record<string, string>;
}

const QUIZ_QUESTION_BANK: Record<TopicId, QuizQuestion[]> = {
  t1: [
    {
      id: 't1-q1',
      prompt: 'Bagaimana susunan dasar atom menurut pemahaman modern pada materi?',
      options: [
        { id: 'a', label: 'Proton dan neutron berada di inti; elektron berada di wilayah sekitar inti.' },
        { id: 'b', label: 'Semua partikel tersebar merata di seluruh atom.' },
        { id: 'c', label: 'Elektron berada di inti, sedangkan proton mengelilinginya.' },
        { id: 'd', label: 'Atom hanya memiliki proton dan elektron, tanpa neutron.' },
        { id: 'e', label: 'Inti atom memenuhi seluruh volume atom.' },
      ],
      correct: 'a',
      explanation: 'Inti atom berisi proton dan neutron, sedangkan elektron berada di wilayah ekstranuklir di sekitar inti.',
      wrongFeedback: {
        b: 'Partikel atom tidak tersebar merata; proton dan neutron terpusat di inti.',
        c: 'Elektron tidak berada di inti. Elektron menempati wilayah di sekitar inti.',
        d: 'Neutron adalah salah satu dari tiga partikel dasar penyusun atom.',
        e: 'Inti berukuran sangat kecil dibandingkan atom; sebagian besar volume atom merupakan ruang di sekitar inti.',
      },
    },
    {
      id: 't1-q2',
      prompt: 'Pasangan muatan relatif proton, neutron, dan elektron yang tepat adalah ...',
      options: [
        { id: 'a', label: 'Proton +1, neutron 0, elektron −1' },
        { id: 'b', label: 'Proton −1, neutron 0, elektron +1' },
        { id: 'c', label: 'Proton +1, neutron +1, elektron 0' },
        { id: 'd', label: 'Proton 0, neutron +1, elektron −1' },
        { id: 'e', label: 'Ketiganya bermuatan +1' },
      ],
      correct: 'a',
      explanation: 'Proton bermuatan positif, neutron netral, dan elektron bermuatan negatif.',
      wrongFeedback: {
        b: 'Muatan proton dan elektron tertukar: proton positif dan elektron negatif.',
        c: 'Neutron tidak bermuatan, sedangkan elektron bermuatan −1.',
        d: 'Protonlah yang bermuatan +1; neutron tidak bermuatan.',
        e: 'Neutron netral dan elektron bermuatan negatif, jadi ketiganya tidak bermuatan sama.',
      },
    },
    {
      id: 't1-q3',
      prompt: 'Dalam percobaan lempeng emas Rutherford, sebagian besar partikel alfa menembus lurus. Kesimpulan yang tepat adalah ...',
      options: [
        { id: 'a', label: 'Sebagian besar volume atom merupakan ruang kosong.' },
        { id: 'b', label: 'Muatan positif tersebar merata di seluruh atom.' },
        { id: 'c', label: 'Elektron berada diam di dalam inti atom.' },
        { id: 'd', label: 'Atom tidak memiliki inti.' },
        { id: 'e', label: 'Semua partikel alfa diserap oleh lempeng emas.' },
      ],
      correct: 'a',
      explanation: 'Karena sebagian besar partikel alfa lewat tanpa dibelokkan, sebagian besar volume atom harus berupa ruang kosong.',
      wrongFeedback: {
        b: 'Pembelokan sebagian kecil partikel menunjukkan muatan positif terkonsentrasi di inti, bukan tersebar merata.',
        c: 'Percobaan Rutherford tidak menyimpulkan elektron berada di inti; elektron berada di luar inti.',
        d: 'Pembelokan tajam partikel alfa menjadi bukti adanya inti kecil yang padat dan positif.',
        e: 'Sebagian besar partikel justru menembus lempeng; hanya sebagian kecil yang dibelokkan atau terpental.',
      },
    },
    {
      id: 't1-q4',
      prompt: 'Gambaran atom pada model Thomson yang dikenal sebagai “roti kismis” adalah ...',
      options: [
        { id: 'a', label: 'Elektron tertanam dalam bola bermuatan positif yang tersebar merata.' },
        { id: 'b', label: 'Elektron mengorbit inti kecil pada lintasan seperti tata surya.' },
        { id: 'c', label: 'Atom berupa bola pejal yang tidak dapat dibagi.' },
        { id: 'd', label: 'Elektron berada pada orbital berdasarkan kebolehjadian.' },
        { id: 'e', label: 'Proton dan neutron tersebar di dalam bola elektron.' },
      ],
      correct: 'a',
      explanation: 'Dalam model Thomson, muatan positif mengisi bola atom dan elektron negatif tertanam di dalamnya.',
      wrongFeedback: {
        b: 'Lintasan elektron mengelilingi inti adalah gambaran model Rutherford, bukan model Thomson.',
        c: 'Bola pejal tak terbagi adalah model Dalton.',
        d: 'Orbital berbasis probabilitas merupakan konsep model atom modern.',
        e: 'Model Thomson menempatkan elektron di dalam muatan positif; proton dan neutron bukan komponen model roti kismis.',
      },
    },
    {
      id: 't1-q5',
      prompt: 'Apa perbedaan penting antara orbit pada model Bohr dan orbital pada model atom modern?',
      options: [
        { id: 'a', label: 'Orbit Bohr adalah lintasan tertentu; orbital modern adalah wilayah dengan peluang menemukan elektron.' },
        { id: 'b', label: 'Orbit dan orbital sama-sama lintasan pasti berbentuk lingkaran.' },
        { id: 'c', label: 'Orbital adalah inti atom, sedangkan orbit adalah proton.' },
        { id: 'd', label: 'Model modern menyatakan elektron tidak memiliki sifat gelombang.' },
        { id: 'e', label: 'Model Bohr menggunakan probabilitas, sedangkan model modern menetapkan posisi elektron secara pasti.' },
      ],
      correct: 'a',
      explanation: 'Model modern menggambarkan orbital sebagai wilayah probabilitas, bukan lintasan elektron yang pasti seperti gambaran Bohr.',
      wrongFeedback: {
        b: 'Lintasan pasti adalah gambaran Bohr; orbital modern berupa wilayah tiga dimensi dengan peluang tertentu.',
        c: 'Orbital bukan inti atau proton, melainkan wilayah kebolehjadian elektron.',
        d: 'Model modern berangkat dari gagasan dualisme gelombang-partikel elektron.',
        e: 'Pernyataan ini terbalik: Bohr memakai lintasan tertentu, sedangkan model modern menggunakan probabilitas.',
      },
    },
  ],
  t2: [
    {
      id: 't2-q1',
      prompt: 'Pada notasi nuklida, nomor atom (Z) menyatakan jumlah ...',
      options: [
        { id: 'a', label: 'Proton di dalam inti atom' },
        { id: 'b', label: 'Neutron di dalam inti atom' },
        { id: 'c', label: 'Proton dan neutron sekaligus' },
        { id: 'd', label: 'Elektron pada semua jenis atom tanpa memperhatikan muatan' },
        { id: 'e', label: 'Kulit elektron yang dimiliki atom' },
      ],
      correct: 'a',
      explanation: 'Nomor atom Z adalah jumlah proton dan menjadi identitas suatu unsur.',
      wrongFeedback: {
        b: 'Jumlah neutron dihitung dari A − Z, bukan dari Z saja.',
        c: 'Jumlah proton dan neutron adalah nomor massa A.',
        d: 'Z menyatakan proton. Jumlah elektron sama dengan Z hanya pada atom netral.',
        e: 'Z bukan jumlah kulit elektron, melainkan jumlah proton di inti.',
      },
    },
    {
      id: 't2-q2',
      prompt: 'Atom netral ²³₁₁Na memiliki jumlah proton, neutron, dan elektron berturut-turut ...',
      options: [
        { id: 'a', label: '11, 12, dan 11' },
        { id: 'b', label: '11, 23, dan 11' },
        { id: 'c', label: '12, 11, dan 12' },
        { id: 'd', label: '23, 11, dan 23' },
        { id: 'e', label: '11, 12, dan 12' },
      ],
      correct: 'a',
      explanation: 'Z = 11 memberi 11 proton dan, karena netral, 11 elektron. Neutron = A − Z = 23 − 11 = 12.',
      wrongFeedback: {
        b: 'Angka 23 adalah jumlah proton dan neutron, bukan jumlah neutron. Neutronnya 23 − 11 = 12.',
        c: 'Nomor atom 11 langsung menyatakan jumlah proton, bukan neutron.',
        d: 'Nomor massa 23 bukan jumlah proton; jumlah proton dan elektron atom netral masing-masing 11.',
        e: 'Atom netral memiliki elektron sama dengan proton, yaitu 11, bukan 12.',
      },
    },
    {
      id: 't2-q3',
      prompt: 'Hubungan yang benar antara nomor massa (A), jumlah proton (p), dan neutron (n) adalah ...',
      options: [
        { id: 'a', label: 'A = p + n' },
        { id: 'b', label: 'A = p − n' },
        { id: 'c', label: 'A = p + elektron' },
        { id: 'd', label: 'A = n − p' },
        { id: 'e', label: 'A selalu sama dengan Z − n' },
      ],
      correct: 'a',
      explanation: 'Nomor massa adalah jumlah nukleon di inti, yaitu proton ditambah neutron.',
      wrongFeedback: {
        b: 'Nomor massa menjumlahkan proton dan neutron, bukan mencari selisihnya.',
        c: 'Elektron tidak termasuk nukleon dan massanya diabaikan pada nomor massa.',
        d: 'Urutan pengurangan tidak sesuai definisi nomor massa.',
        e: 'Hubungan yang tepat adalah A = Z + n atau n = A − Z.',
      },
    },
    {
      id: 't2-q4',
      prompt: 'Pasangan ¹²₆C dan ¹⁴₆C disebut isotop karena memiliki ...',
      options: [
        { id: 'a', label: 'Nomor atom sama, tetapi nomor massa berbeda' },
        { id: 'b', label: 'Nomor massa sama, tetapi nomor atom berbeda' },
        { id: 'c', label: 'Jumlah neutron sama, tetapi unsur berbeda' },
        { id: 'd', label: 'Jumlah proton berbeda, tetapi elektron sama' },
        { id: 'e', label: 'Nomor atom dan nomor massa sama' },
      ],
      correct: 'a',
      explanation: 'Isotop adalah atom dari unsur yang sama (Z sama) dengan nomor massa berbeda karena jumlah neutronnya berbeda.',
      wrongFeedback: {
        b: 'Nomor massa sama dengan nomor atom berbeda merupakan ciri isobar.',
        c: 'Jumlah neutron sama pada unsur berbeda merupakan ciri isoton.',
        d: 'Kedua nuklida karbon memiliki jumlah proton yang sama, yaitu 6.',
        e: 'Jika A dan Z sama, keduanya bukan pasangan isotop yang berbeda.',
      },
    },
    {
      id: 't2-q5',
      prompt: 'Mengapa ¹³₆C dan ¹⁴₇N merupakan pasangan isoton?',
      options: [
        { id: 'a', label: 'Keduanya memiliki 7 neutron' },
        { id: 'b', label: 'Keduanya memiliki nomor massa 14' },
        { id: 'c', label: 'Keduanya memiliki nomor atom 6' },
        { id: 'd', label: 'Keduanya memiliki jumlah proton yang sama' },
        { id: 'e', label: 'Keduanya memiliki jumlah elektron yang sama karena netral' },
      ],
      correct: 'a',
      explanation: 'Jumlah neutron karbon-13 adalah 13 − 6 = 7; nitrogen-14 adalah 14 − 7 = 7. Jumlah neutron sama adalah ciri isoton.',
      wrongFeedback: {
        b: 'Nomor massa yang sama adalah ciri isobar; kedua nomor massa di sini 13 dan 14.',
        c: 'Nomor atomnya berbeda: karbon 6 dan nitrogen 7.',
        d: 'Jumlah protonnya berbeda karena keduanya merupakan unsur berbeda.',
        e: 'Atom netral karbon dan nitrogen memiliki elektron 6 dan 7; yang sama pada isoton adalah neutron.',
      },
    },
  ],
  t3: [
    {
      id: 't3-q1',
      prompt: 'Perubahan apa yang terjadi saat atom membentuk ion melalui reaksi kimia biasa?',
      options: [
        { id: 'a', label: 'Jumlah elektron berubah, sedangkan jumlah proton tetap.' },
        { id: 'b', label: 'Jumlah proton berubah, sedangkan elektron tetap.' },
        { id: 'c', label: 'Proton dan neutron berpindah keluar dari inti.' },
        { id: 'd', label: 'Nomor atom berubah karena elektron dilepas.' },
        { id: 'e', label: 'Jumlah neutron selalu bertambah satu.' },
      ],
      correct: 'a',
      explanation: 'Pembentukan ion melibatkan pelepasan atau penerimaan elektron; inti dan jumlah proton tidak berubah.',
      wrongFeedback: {
        b: 'Perubahan jumlah proton akan mengubah identitas unsur dan bukan proses pembentukan ion biasa.',
        c: 'Reaksi kimia pembentukan ion tidak mengubah partikel di dalam inti.',
        d: 'Nomor atom ditentukan oleh jumlah proton, yang tetap saat atom menjadi ion.',
        e: 'Jumlah neutron di inti tidak berubah dalam pembentukan ion.',
      },
    },
    {
      id: 't3-q2',
      prompt: 'Atom natrium netral (Z = 11) melepaskan satu elektron. Ion yang terbentuk adalah ...',
      options: [
        { id: 'a', label: 'Na⁺ dengan 10 elektron' },
        { id: 'b', label: 'Na⁻ dengan 12 elektron' },
        { id: 'c', label: 'Na⁺ dengan 12 elektron' },
        { id: 'd', label: 'Na²⁺ dengan 9 elektron' },
        { id: 'e', label: 'Na netral dengan 10 elektron' },
      ],
      correct: 'a',
      explanation: 'Natrium netral memiliki 11 elektron. Melepaskan satu elektron menghasilkan 10 elektron dan muatan +1.',
      wrongFeedback: {
        b: 'Melepaskan elektron membuat muatan positif, bukan negatif; jumlah elektronnya juga berkurang.',
        c: 'Setelah melepas satu elektron, natrium memiliki 10 elektron, bukan 12.',
        d: 'Satu elektron yang dilepas menghasilkan muatan +1, bukan +2.',
        e: 'Spesi dengan 11 proton dan 10 elektron bermuatan +1, jadi bukan atom netral.',
      },
    },
    {
      id: 't3-q3',
      prompt: 'Atom klorin netral memiliki Z = 17. Berapa jumlah elektron pada ion Cl⁻?',
      options: [
        { id: 'a', label: '18 elektron' },
        { id: 'b', label: '16 elektron' },
        { id: 'c', label: '17 elektron' },
        { id: 'd', label: '19 elektron' },
        { id: 'e', label: '34 elektron' },
      ],
      correct: 'a',
      explanation: 'Muatan −1 berarti klorin menerima satu elektron: 17 + 1 = 18 elektron.',
      wrongFeedback: {
        b: 'Ion negatif menerima elektron, bukan kehilangan elektron.',
        c: 'Jumlah 17 adalah elektron pada atom klorin netral, sebelum menerima elektron.',
        d: 'Muatan −1 menunjukkan penambahan satu elektron saja, bukan dua.',
        e: 'Muatan ion tidak menggandakan seluruh jumlah elektron; Cl⁻ memiliki satu elektron lebih banyak dari atom netral.',
      },
    },
    {
      id: 't3-q4',
      prompt: 'Ion sulfida S²⁻ memiliki nomor atom Z = 16. Berapa jumlah elektronnya?',
      options: [
        { id: 'a', label: '18 elektron' },
        { id: 'b', label: '14 elektron' },
        { id: 'c', label: '16 elektron' },
        { id: 'd', label: '17 elektron' },
        { id: 'e', label: '32 elektron' },
      ],
      correct: 'a',
      explanation: 'Anion bermuatan 2− menerima dua elektron, sehingga e = Z + 2 = 16 + 2 = 18.',
      wrongFeedback: {
        b: 'Muatan negatif berarti elektron bertambah, bukan berkurang.',
        c: 'Sebanyak 16 elektron dimiliki atom sulfur netral; S²⁻ menerima dua elektron tambahan.',
        d: 'Muatan 2− berarti bertambah dua elektron, bukan satu.',
        e: 'Nomor massa bukan jumlah elektron; jumlah elektron dihitung dari Z dan muatan ion.',
      },
    },
    {
      id: 't3-q5',
      prompt: 'Ion Mg²⁺ memiliki 12 proton. Pernyataan yang benar tentang muatan dan elektronnya adalah ...',
      options: [
        { id: 'a', label: 'Memiliki 10 elektron; q = p − e = 12 − 10 = +2' },
        { id: 'b', label: 'Memiliki 14 elektron; q = 12 − 14 = +2' },
        { id: 'c', label: 'Memiliki 12 elektron; karena proton dan elektron selalu sama' },
        { id: 'd', label: 'Memiliki 10 elektron, tetapi muatannya −2' },
        { id: 'e', label: 'Memiliki 2 elektron; angka 2 pada muatan menyatakan jumlah elektron total' },
      ],
      correct: 'a',
      explanation: 'Muatan q = p − e. Untuk q = +2 dan p = 12, jumlah elektron e = 12 − 2 = 10.',
      wrongFeedback: {
        b: 'Dengan 14 elektron, q = 12 − 14 = −2, bukan +2.',
        c: 'Proton dan elektron sama hanya pada atom netral; kation memiliki elektron lebih sedikit.',
        d: 'Jika p = 12 dan e = 10, q = +2, bukan −2.',
        e: 'Angka 2 pada Mg²⁺ menyatakan besar muatan; magnesium kehilangan dua elektron dari 12 menjadi 10.',
      },
    },
  ],
};

const OPTION_IDS = ['a', 'b', 'c', 'd', 'e'] as const;

function moveCorrectOption(question: QuizQuestion, targetId: (typeof OPTION_IDS)[number]): QuizQuestion {
  const currentIndex = OPTION_IDS.indexOf(question.correct as (typeof OPTION_IDS)[number]);
  const targetIndex = OPTION_IDS.indexOf(targetId);
  const shift = (targetIndex - currentIndex + OPTION_IDS.length) % OPTION_IDS.length;
  const remapId = (id: string) => {
    const index = OPTION_IDS.indexOf(id as (typeof OPTION_IDS)[number]);
    return OPTION_IDS[(index + shift) % OPTION_IDS.length];
  };

  return {
    ...question,
    options: question.options
      .map((option) => ({ ...option, id: remapId(option.id) }))
      .sort((left, right) => OPTION_IDS.indexOf(left.id as (typeof OPTION_IDS)[number]) - OPTION_IDS.indexOf(right.id as (typeof OPTION_IDS)[number])),
    correct: remapId(question.correct),
    wrongFeedback: Object.fromEntries(
      Object.entries(question.wrongFeedback).map(([id, feedback]) => [remapId(id), feedback])
    ),
  };
}

export const QUIZ_QUESTIONS = Object.fromEntries(
  (Object.entries(QUIZ_QUESTION_BANK) as [TopicId, QuizQuestion[]][]).map(([topicId, questions]) => [
    topicId,
    questions.map((question, index) => moveCorrectOption(question, OPTION_IDS[index % OPTION_IDS.length])),
  ])
) as Record<TopicId, QuizQuestion[]>;