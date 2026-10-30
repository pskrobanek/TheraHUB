// Demo data – fiktivní pacienti, lékaři a aplikace. Nejde o reálné osoby ani produkty.
import type { ActivePatientApp, CatalogApp, Patient, Recommendation } from './types';

export const hospital = { short: 'FN Demo', name: 'Fakultní nemocnice Demo' };

export const currentUser = {
  name: 'MUDr. Eva Malá',
  initials: 'EM',
  department: 'Radiační onkologie',
};

export const catalog: CatalogApp[] = [
  { id: 'toxitrack', name: 'ToxiTrack', tagline: 'Telemonitoring toxicity', icon: 'onco', tint: '#3b4cf5' },
  { id: 'cardiowatch', name: 'CardioWatch', tagline: 'Monitoring srdce', icon: 'heart', tint: '#b0306a' },
  { id: 'visitscribe', name: 'VisitScribe', tagline: 'Záznam návštěvy a AI souhrn', icon: 'scribe', tint: '#1f2a44' },
  { id: 'polykej', name: 'Polykej', tagline: 'Rehabilitace polykání', icon: 'droplet', tint: '#3b4cf5' },
  { id: 'nutriplan', name: 'NutriPlán', tagline: 'Výživa a hmotnost', icon: 'leaf', tint: '#15803d' },
  { id: 'dermafoto', name: 'DermaFoto', tagline: 'Fotodeník kůže', icon: 'camera', tint: '#b45309' },
  { id: 'klid', name: 'Klid', tagline: 'Screening distresu', icon: 'smile', tint: '#7c3aed' },
  { id: 'bolestdenik', name: 'Bolest deník', tagline: 'Deník bolesti', icon: 'gauge', tint: '#be123c' },
  { id: 'lekyhlidac', name: 'LékyHlídač', tagline: 'Adherence k lékům', icon: 'pill', tint: '#0e7490' },
  { id: 'krokomer', name: 'Krokoměr', tagline: 'Sledování aktivity', icon: 'watch', tint: '#334155' },
];

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
    summary: 'C10.9 · Fx 18/35',
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
    summary: 'C50.4 · Fx 9/15',
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
    summary: 'C61 · Kontrola',
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
