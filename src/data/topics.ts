import type { Topic } from '../types';

export const TOPICS: Topic[] = [
  {
    id: 't1',
    title: 'Topik 1: Struktur Atom & Partikel Penyusunnya',
    description:
      'Pelajari proton, neutron, dan elektron beserta perkembangannya dari model Dalton hingga Bohr dan pengantar model modern.',
    learningObjectives: ['TP 1.1', 'TP 1.2', 'TP 1.3'],
    sectionIds: [
      't1-atom',
      't1-partikel',
      't1-dalton',
      't1-thomson',
      't1-rutherford',
      't1-bohr',
      't1-modern',
    ],
  },
  {
    id: 't2',
    title: 'Topik 2: Nomor Atom, Nomor Massa & Partikel Subatom',
    description:
      'Kuasai cara membaca notasi atom, menghitung partikel subatom, dan membedakan hubungan isotop, isobar, serta isoton.',
    learningObjectives: ['TP 2.1', 'TP 2.2', 'TP 2.3'],
    sectionIds: [
      't2-notasi',
      't2-hitung',
      't2-contoh',
      't2-hubungan',
      't2-ringkasan',
    ],
  },
  {
    id: 't3',
    title: 'Topik 3: Ion & Perubahan Jumlah Elektron',
    description:
      'Pahami pembentukan kation dan anion sederhana melalui serah terima elektron tanpa merubah jumlah proton dalam inti.',
    learningObjectives: ['TP 3.1', 'TP 3.2'],
    sectionIds: [
      't3-ion',
      't3-kation-anion',
      't3-muatan',
      't3-contoh',
      't3-ringkasan',
    ],
  },
];

