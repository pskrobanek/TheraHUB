// Demo data – fiktivní pacienti, lékaři a aplikace. Nejde o reálné osoby ani produkty.
import { purchasedIds, storeApps } from './store';
import type { ActivePatientApp, CatalogApp, Patient, Recommendation } from './types';

export const hospital = { short: 'FN Demo', name: 'Fakultní nemocnice Demo', nis: 'Demo NIS 4.2' };

export const currentUser = {
  name: 'MUDr. Eva Malá',
  initials: 'EM',
  department: 'Radiační onkologie',
};

/** Aplikace licencované nemocnicí – dostupné k aktivaci u pacienta. */
export const catalog: CatalogApp[] = storeApps.filter((a) => purchasedIds.has(a.id));

export const patients: Patient[] = [
  {
    id: 'p1',
    name: 'Karel Dvořák',
    sex: 'muž',
    age: 58,
    nisId: 'NIS 104 233',
    attending: 'MUDr. E. Malá',
    tags: [
      { code: 'C10.9', label: 'Orofaryngeální SCC, p16+' },
      { code: 'TNM', label: 'cT2 N1 M0' },
      { code: 'Léčba', label: 'Chemoradioterapie 70 Gy / 35 fx + cisplatina' },
    ],
    birthNumber: '680412/1234',
    mainDiagnosis: 'C10.9',
    treatment: { name: 'Radioterapie', done: 18, total: 35, unit: 'Fx', started: '31. 8.', plannedEnd: '19. 10.' },
  },
  {
    id: 'p2',
    name: 'Jana Veselá',
    sex: 'žena',
    age: 47,
    nisId: 'NIS 118 907',
    attending: 'MUDr. E. Malá',
    tags: [
      { code: 'C50.4', label: 'Karcinom prsu, HER2−' },
      { code: 'Léčba', label: 'Adjuvantní RT 40 Gy / 15 fx' },
    ],
    birthNumber: '795318/2240',
    mainDiagnosis: 'C50.4',
    treatment: { name: 'Radioterapie', done: 9, total: 15, unit: 'Fx', started: '29. 9.', plannedEnd: '17. 10.' },
  },
  {
    id: 'p3',
    name: 'Tomáš Král',
    sex: 'muž',
    age: 71,
    nisId: 'NIS 097 412',
    attending: 'MUDr. P. Horák',
    tags: [
      { code: 'C61', label: 'Karcinom prostaty' },
      { code: 'Stav', label: 'Dispenzarizace po RT' },
    ],
    birthNumber: '550923/4417',
    mainDiagnosis: 'C61',
  },
];

export const activeApps: Record<string, ActivePatientApp[]> = {
  p1: [
    {
      appId: 'toxitrack',
      since: '31. 8.',
      widget: {
        kind: 'toxicity',
        alert: { text: 'Hlášena mukozitida stupně 3', time: '07:40' },
        items: [
          { label: 'Orální mukozitida', grade: 3 },
          { label: 'Dysfagie', grade: 2 },
          { label: 'Únava', grade: 2 },
          { label: 'Radiační dermatitida', grade: 1 },
        ],
        completed: 12,
        total: 13,
        next: 'pá 25. 9.',
      },
    },
    {
      appId: 'cardiowatch',
      since: '7. 9.',
      widget: { kind: 'ecg', bpm: 72, rhythm: 'Sinusový rytmus', qtc: 418, pr: 162, qrs: 94, lastRecord: 'včera 21:14 · 7 dní bez událostí' },
    },
    {
      appId: 'visitscribe',
      since: '19. 9.',
      widget: {
        kind: 'scribe',
        title: 'Kontrolní konzultace',
        meta: '19. 9. · 12 min',
        summary:
          'Bolestivé polykání od úterý, jen kašovitá strava. Analgezie navýšena. Hmotnost 71,4 kg, od začátku RT −4,1 kg.',
        tasks: [
          { id: 't1', text: 'Odeslat k nutričnímu terapeutovi', done: false },
          { id: 't2', text: 'Předepsat analgetický výplach', done: true },
        ],
      },
    },
  ],
  p2: [
    {
      appId: 'toxitrack',
      since: '29. 9.',
      widget: {
        kind: 'toxicity',
        items: [
          { label: 'Radiační dermatitida', grade: 2 },
          { label: 'Únava', grade: 1 },
          { label: 'Bolest prsu', grade: 1 },
        ],
        completed: 6,
        total: 6,
        next: 'po 13. 10.',
      },
    },
  ],
  p3: [],
};

export const recommendations: Record<string, Recommendation[]> = {
  p1: [
    { appId: 'polykej', reason: 'Při dysfagii G2' },
    { appId: 'nutriplan', reason: 'Při úbytku hmotnosti' },
  ],
  p2: [{ appId: 'dermafoto', reason: 'Při dermatitidě G2' }],
  p3: [{ appId: 'krokomer', reason: 'Pohyb po léčbě' }],
};
