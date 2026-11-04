// Ukázková data modulu Žádost o pilotní provoz (Fáze 0a). Nemocnice, lidé, firmy i rozhodnutí jsou smyšlené (DEC-003).
// V kódu se pilotní provoz jmenuje „trial“ (DEC-006).
import type { Domain } from './catalog';
import { addWorkdays, DEMO_TODAY, workdaysBetween } from './dates';

export const hospitalDemo = { short: 'FN Demo', name: 'Fakultní nemocnice Demo' };

export interface Person {
  name: string;
  role: string;
}

export type DeptId = 'onko' | 'kardio' | 'interna';

export const departments: Record<DeptId, { name: string; head: Person; requester: Person }> = {
  onko: {
    name: 'Onkologická klinika',
    head: { name: 'MUDr. Tomáš Řezníček', role: 'primář Onkologické kliniky' },
    requester: { name: 'MUDr. Eva Malá', role: 'lékařka, Onkologická klinika' },
  },
  kardio: {
    name: 'Kardiologie',
    head: { name: 'MUDr. Ivana Kopecká', role: 'primářka Kardiologie' },
    requester: { name: 'MUDr. Jan Pospíšil', role: 'lékař, Kardiologie' },
  },
  interna: {
    name: 'Interní klinika',
    head: { name: 'doc. MUDr. Pavel Hrubý', role: 'přednosta Interní kliniky' },
    requester: { name: 'MUDr. Lenka Horáková', role: 'lékařka, Interní klinika' },
  },
};

export const staff = {
  namestek: { name: 'MUDr. Hana Vojtíšková', role: 'náměstkyně pro léčebně preventivní péči' },
  reditel: { name: 'Ing. Karel Bárta', role: 'ředitel' },
  pravnik: { name: 'Mgr. Lucie Dvorská', role: 'právní oddělení' },
  dpo: { name: 'Mgr. Ondřej Malík', role: 'pověřenec pro ochranu osobních údajů' },
  kb: { name: 'Ing. Martin Šebek', role: 'manažer kybernetické bezpečnosti' },
  it: { name: 'Ing. Petra Králová', role: 'provoz a kvalita (Ostatní)' },
  nakup: { name: 'Bc. Jitka Nováková', role: 'veřejné zakázky' },
} satisfies Record<string, Person>;

export const domainOwner: Record<Domain, Person> = { legal: staff.pravnik, gdpr: staff.dpo, security: staff.kb, ostatni: staff.it };

// ---------- Šablona A – Souhlas vedení napřed (brief §5.4) ----------

export type StepId = 'zadost' | 'primar' | 'namestek' | 'firma' | 'posouzeni' | 'smlouva' | 'pilot' | 'kpi' | 'rozhodnuti' | 'zaver';

export interface TemplateStep {
  id: StepId;
  label: string;
  /** SLA v pracovních dnech (u Firmy lhůta dodavatele). */
  sla?: number;
}

export const templateA = {
  name: 'Šablona A – Souhlas vedení napřed',
  version: 2,
  steps: [
    { id: 'zadost', label: 'Žádost' },
    { id: 'primar', label: 'Primář', sla: 5 },
    { id: 'namestek', label: 'Náměstek', sla: 5 },
    { id: 'firma', label: 'Firma', sla: 5 },
    { id: 'posouzeni', label: 'Posouzení 4 oblastí', sla: 5 },
    { id: 'smlouva', label: 'Smlouva', sla: 10 },
    { id: 'pilot', label: 'Pilotní provoz' },
    { id: 'kpi', label: 'Vyhodnocení KPI', sla: 5 },
    { id: 'rozhodnuti', label: 'Rozhodnutí', sla: 5 },
    { id: 'zaver', label: 'Nákup / Odchod', sla: 10 },
  ] as TemplateStep[],
};

// ---------- Žádosti ----------

export type TrialState =
  | 'draft'
  | 'submitted'
  | 'in_approval'
  | 'waiting_vendor'
  | 'approved_for_trial'
  | 'contracting'
  | 'trial_active'
  | 'evaluating'
  | 'purchased'
  | 'exited'
  | 'rejected'
  | 'withdrawn'
  | 'on_hold';

export const stateLabel: Record<TrialState, string> = {
  draft: 'Rozpracováno',
  submitted: 'Podáno',
  in_approval: 'Ve schvalování',
  waiting_vendor: 'Čeká na firmu',
  approved_for_trial: 'Schváleno k pilotnímu provozu',
  contracting: 'Smlouva',
  trial_active: 'Pilot probíhá',
  evaluating: 'Vyhodnocení',
  purchased: 'V předplatném',
  exited: 'Ukončeno',
  rejected: 'Zamítnuto',
  withdrawn: 'Staženo',
  on_hold: 'Pozastaveno',
};

export type RunStatus = 'pending' | 'active' | 'waiting_vendor' | 'done' | 'rejected' | 'withdrawn' | 'on_hold';
export type Outcome = 'schvaleno' | 's_podminkou' | 'zamitnuto' | 'prijato' | 'podepsano' | 'ukonceno' | 'nakup' | 'odchod' | 'podano';

export const outcomeLabel: Record<Outcome, string> = {
  podano: 'Podáno',
  schvaleno: 'Schváleno',
  s_podminkou: 'Schváleno s podmínkou',
  zamitnuto: 'Zamítnuto',
  prijato: 'Podmínky přijaty',
  podepsano: 'Podepsáno',
  ukonceno: 'Ukončeno',
  nakup: 'Doporučen nákup',
  odchod: 'Ukončit',
};

export interface StepRun {
  status: RunStatus;
  /** Kdo rozhodl (hotový krok). */
  by?: string;
  date?: string;
  outcome?: Outcome;
  condition?: string;
  /** Od kdy je krok aktivní / čeká. */
  since?: string;
  note?: string;
}

export interface Kpi {
  name: string;
  target: string;
  source: 'API dodavatele' | 'Dotazník uživatelů' | 'Ručně';
}

export interface TrialRequest {
  id: string;
  appId: string;
  dept: DeptId;
  created: string;
  submitted?: string;
  state: TrialState;
  steps: Partial<Record<StepId, StepRun>>;
  block?: Partial<Record<Domain, StepRun>>;
  purpose: string;
  patients: number;
  users: number;
  months: number;
  trialStart?: string;
  trialEnd?: string;
  kpis: Kpi[];
  waivers?: Record<string, string>;
  conditions?: { text: string; owner: string; status: 'otevřená' | 'splněná' }[];
  /** Text u stavu, který nejde vyčíst z kroků (předkontrola, pozastavení, zamítnutí). */
  note?: string;
  /** Datum, ke kterému je zmrazený výsledek shody (podání). */
  snapshotAt?: string;
  /** Konečné větvení po rozhodnutí. */
  final?: 'nakup' | 'odchod';
}

const done = (by: string, date: string, outcome: Outcome = 'schvaleno', condition?: string): StepRun => ({ status: 'done', by, date, outcome, condition });
const active = (since: string, note?: string): StepRun => ({ status: 'active', since, note });

const kpiSet = {
  provoz: [
    { name: 'Obsazenost lůžek plánovaná dopředu', target: '≥ 80 %', source: 'API dodavatele' },
    { name: 'Spokojenost uživatelů', target: '≥ 4 / 5', source: 'Dotazník uživatelů' },
  ],
  klinika: [
    { name: 'Čas do nálezu u urgentních snímků', target: '−30 %', source: 'API dodavatele' },
    { name: 'Spokojenost lékařů', target: '≥ 4 / 5', source: 'Dotazník uživatelů' },
  ],
  sepse: [
    { name: 'Včasné zahájení léčby sepse', target: '+15 %', source: 'API dodavatele' },
    { name: 'Falešné poplachy na lékaře a den', target: '≤ 2', source: 'Ručně' },
  ],
  kohorta: [
    { name: 'Čas sestavení kohorty', target: '−50 %', source: 'API dodavatele' },
    { name: 'Spokojenost výzkumníků', target: '≥ 4 / 5', source: 'Dotazník uživatelů' },
  ],
} satisfies Record<string, Kpi[]>;

const d = departments;
const s = staff;

export const trialRequests: TrialRequest[] = [
  {
    id: 'PP-2026-031',
    appId: 'smenaplan',
    dept: 'interna',
    created: '2026-10-30',
    state: 'draft',
    steps: { zadost: active('2026-10-30', 'Žadatelka doplňuje KPI') },
    purpose: 'Plánování služeb lékařů a sester na interně bez tabulek v e-mailu.',
    patients: 0,
    users: 45,
    months: 3,
    kpis: kpiSet.provoz,
  },
  {
    id: 'PP-2026-030',
    appId: 'onkokohorta',
    dept: 'kardio',
    created: '2026-10-27',
    submitted: '2026-10-29',
    snapshotAt: '2026-10-29',
    state: 'submitted',
    steps: { zadost: done(d.kardio.requester.name, '2026-10-29', 'podano') },
    note: 'Předkontrola: firma doplňuje odpověď k exit plánu (LEG-004) do 6. 11. Posuzovatelé začnou po doplnění.',
    purpose: 'Rychlejší výběr pacientů po infarktu do registrové studie.',
    patients: 300,
    users: 6,
    months: 6,
    kpis: kpiSet.kohorta,
  },
  {
    id: 'PP-2026-028',
    appId: 'sepsisalert',
    dept: 'interna',
    created: '2026-10-22',
    submitted: '2026-10-27',
    snapshotAt: '2026-10-27',
    state: 'in_approval',
    steps: { zadost: done(d.interna.requester.name, '2026-10-27', 'podano'), primar: active('2026-10-28') },
    purpose: 'Včasné varování sepse na JIP interny.',
    patients: 220,
    users: 30,
    months: 6,
    kpis: kpiSet.sepse,
  },
  {
    id: 'PP-2026-024',
    appId: 'bedflow',
    dept: 'onko',
    created: '2026-10-09',
    submitted: '2026-10-14',
    snapshotAt: '2026-10-14',
    state: 'in_approval',
    steps: {
      zadost: done(d.onko.requester.name, '2026-10-14', 'podano'),
      primar: done(d.onko.head.name, '2026-10-16'),
      namestek: active('2026-10-16'),
    },
    purpose: 'Plánování lůžek pro aplikace chemoterapie na stacionáři.',
    patients: 0,
    users: 12,
    months: 3,
    kpis: kpiSet.provoz,
  },
  {
    id: 'PP-2026-019',
    appId: 'onkokohorta',
    dept: 'onko',
    created: '2026-10-01',
    submitted: '2026-10-05',
    snapshotAt: '2026-10-05',
    state: 'waiting_vendor',
    steps: {
      zadost: done(d.onko.requester.name, '2026-10-05', 'podano'),
      primar: done(d.onko.head.name, '2026-10-07'),
      namestek: done(s.namestek.name, '2026-10-09'),
      firma: done('Demo Research s.r.o.', '2026-10-13', 'prijato'),
      posouzeni: active('2026-10-14'),
    },
    block: {
      legal: done(s.pravnik.name, '2026-10-20', 'schvaleno'),
      gdpr: done(s.dpo.name, '2026-10-22', 's_podminkou', 'Data opouští nemocnici jen pseudonymizovaná (ukázka, TODO(dpo)).'),
      security: { status: 'waiting_vendor', since: '2026-10-29', note: 'Dotaz na firmu: doložit šifrování záloh (SEC-003)' },
      ostatni: active('2026-10-14'),
    },
    conditions: [{ text: 'Data opouští nemocnici jen pseudonymizovaná (ukázka, TODO(dpo)).', owner: s.dpo.name, status: 'otevřená' }],
    purpose: 'Výběr pacientek do studie adjuvantní léčby karcinomu prsu.',
    patients: 400,
    users: 8,
    months: 6,
    kpis: kpiSet.kohorta,
  },
  {
    id: 'PP-2026-017',
    appId: 'sepsisalert',
    dept: 'kardio',
    created: '2026-10-08',
    submitted: '2026-10-12',
    snapshotAt: '2026-10-12',
    state: 'waiting_vendor',
    steps: {
      zadost: done(d.kardio.requester.name, '2026-10-12', 'podano'),
      primar: done(d.kardio.head.name, '2026-10-13'),
      namestek: done(s.namestek.name, '2026-10-15'),
      firma: done('Ukázka Medical a.s.', '2026-10-19', 'prijato'),
      posouzeni: active('2026-10-20'),
    },
    block: {
      legal: done(s.pravnik.name, '2026-10-23'),
      gdpr: active('2026-10-20'),
      security: { status: 'waiting_vendor', since: '2026-11-02', note: 'Dotaz na firmu: novější penetrační test (SEC-002)' },
      ostatni: done(s.it.name, '2026-10-27', 's_podminkou', 'Zaškolení personálu do 31. 1. 2027 (výjimka jen pro pilotní provoz).'),
    },
    waivers: { 'OST-001': 'Jen pro pilotní provoz; zaškolení do 31. 1. 2027.' },
    conditions: [{ text: 'Zaškolení personálu do 31. 1. 2027 (výjimka jen pro pilotní provoz).', owner: s.it.name, status: 'otevřená' }],
    purpose: 'Včasné varování sepse u pacientů na koronární jednotce.',
    patients: 150,
    users: 22,
    months: 6,
    kpis: kpiSet.sepse,
  },
  {
    id: 'PP-2026-012',
    appId: 'radiotriage',
    dept: 'interna',
    created: '2026-09-17',
    submitted: '2026-09-21',
    snapshotAt: '2026-09-21',
    state: 'approved_for_trial',
    steps: {
      zadost: done(d.interna.requester.name, '2026-09-21', 'podano'),
      primar: done(d.interna.head.name, '2026-09-23'),
      namestek: done(s.namestek.name, '2026-09-25'),
      firma: done('Startup Demo s.r.o.', '2026-09-30', 'prijato'),
      posouzeni: done('4 oblasti', '2026-10-20'),
    },
    block: {
      legal: done(s.pravnik.name, '2026-10-12'),
      gdpr: done(s.dpo.name, '2026-10-15'),
      security: done(s.kb.name, '2026-10-16'),
      ostatni: done(s.it.name, '2026-10-20'),
    },
    purpose: 'Rychlejší popis urgentních RTG snímků hrudníku z příjmu.',
    patients: 900,
    users: 14,
    months: 6,
    kpis: kpiSet.klinika,
  },
  {
    id: 'PP-2026-009',
    appId: 'radiotriage',
    dept: 'kardio',
    created: '2026-08-27',
    submitted: '2026-09-01',
    snapshotAt: '2026-09-01',
    state: 'contracting',
    steps: {
      zadost: done(d.kardio.requester.name, '2026-09-01', 'podano'),
      primar: done(d.kardio.head.name, '2026-09-03'),
      namestek: done(s.namestek.name, '2026-09-08'),
      firma: done('Startup Demo s.r.o.', '2026-09-11', 'prijato'),
      posouzeni: done('4 oblasti', '2026-10-02'),
      smlouva: active('2026-10-26', 'Návrh pilotní smlouvy a DPA připraven, čeká na podpis ředitele'),
    },
    block: {
      legal: done(s.pravnik.name, '2026-09-22'),
      gdpr: done(s.dpo.name, '2026-09-25'),
      security: done(s.kb.name, '2026-10-01', 's_podminkou', 'Přístup dodavatele jen přes VPN s MFA (ukázka, TODO(security)).'),
      ostatni: done(s.it.name, '2026-10-02'),
    },
    conditions: [{ text: 'Přístup dodavatele jen přes VPN s MFA (ukázka, TODO(security)).', owner: s.kb.name, status: 'otevřená' }],
    purpose: 'Triáž RTG hrudníku u pacientů s dušností.',
    patients: 600,
    users: 10,
    months: 6,
    kpis: kpiSet.klinika,
  },
  {
    id: 'PP-2026-004',
    appId: 'radiotriage',
    dept: 'onko',
    created: '2026-06-10',
    submitted: '2026-06-15',
    snapshotAt: '2026-06-15',
    state: 'trial_active',
    trialStart: '2026-09-01',
    trialEnd: '2027-02-26',
    steps: {
      zadost: done(d.onko.requester.name, '2026-06-15', 'podano'),
      primar: done(d.onko.head.name, '2026-06-17'),
      namestek: done(s.namestek.name, '2026-06-19'),
      firma: done('Startup Demo s.r.o.', '2026-06-24', 'prijato'),
      posouzeni: done('4 oblasti', '2026-07-14'),
      smlouva: done(`${s.reditel.name} a Startup Demo s.r.o.`, '2026-08-14', 'podepsano'),
      pilot: active('2026-09-01', 'Konec 26. 2. 2027 · připomínky 30, 14 a 7 dní předem'),
    },
    block: {
      legal: done(s.pravnik.name, '2026-07-01'),
      gdpr: done(s.dpo.name, '2026-07-06'),
      security: done(s.kb.name, '2026-07-10'),
      ostatni: done(s.it.name, '2026-07-14'),
    },
    purpose: 'Rychlejší popis CT plic u onkologických pacientů s podezřením na plicní embolii.',
    patients: 500,
    users: 9,
    months: 6,
    kpis: kpiSet.klinika,
  },
  {
    id: 'PP-2026-002',
    appId: 'smenaplan',
    dept: 'onko',
    created: '2026-02-25',
    submitted: '2026-03-02',
    snapshotAt: '2026-03-02',
    state: 'evaluating',
    trialStart: '2026-05-04',
    trialEnd: '2026-10-30',
    steps: {
      zadost: done(d.onko.requester.name, '2026-03-02', 'podano'),
      primar: done(d.onko.head.name, '2026-03-04'),
      namestek: done(s.namestek.name, '2026-03-06'),
      firma: done('Fiktivní Software s.r.o.', '2026-03-11', 'prijato'),
      posouzeni: done('4 oblasti', '2026-03-31'),
      smlouva: done(`${s.reditel.name} a Fiktivní Software s.r.o.`, '2026-04-24', 'podepsano'),
      pilot: done(d.onko.requester.name, '2026-10-30', 'ukonceno'),
      kpi: active('2026-11-02', 'KPI report sestaven: 2 ze 2 cílů splněny'),
    },
    block: {
      legal: done(s.pravnik.name, '2026-03-20'),
      gdpr: done(s.dpo.name, '2026-03-24'),
      security: done(s.kb.name, '2026-03-26'),
      ostatni: done(s.it.name, '2026-03-31'),
    },
    purpose: 'Plánování služeb na onkologii.',
    patients: 0,
    users: 60,
    months: 6,
    kpis: kpiSet.provoz,
  },
  {
    id: 'PP-2025-011',
    appId: 'smenaplan',
    dept: 'kardio',
    created: '2025-10-28',
    submitted: '2025-11-03',
    snapshotAt: '2025-11-03',
    state: 'purchased',
    trialStart: '2026-01-05',
    trialEnd: '2026-04-30',
    final: 'nakup',
    steps: {
      zadost: done(d.kardio.requester.name, '2025-11-03', 'podano'),
      primar: done(d.kardio.head.name, '2025-11-05'),
      namestek: done(s.namestek.name, '2025-11-07'),
      firma: done('Fiktivní Software s.r.o.', '2025-11-12', 'prijato'),
      posouzeni: done('4 oblasti', '2025-12-02'),
      smlouva: done(`${s.reditel.name} a Fiktivní Software s.r.o.`, '2025-12-19', 'podepsano'),
      pilot: done(d.kardio.requester.name, '2026-04-30', 'ukonceno'),
      kpi: done(d.kardio.head.name, '2026-05-08', 'nakup'),
      rozhodnuti: done(s.namestek.name, '2026-05-15', 'nakup'),
      zaver: done(s.nakup.name, '2026-06-15', 'nakup', 'Měsíční předplatné; cesta zakázky zaznamenána (ukázka, TODO(legal)).'),
    },
    block: {
      legal: done(s.pravnik.name, '2025-11-21'),
      gdpr: done(s.dpo.name, '2025-11-25'),
      security: done(s.kb.name, '2025-11-28'),
      ostatni: done(s.it.name, '2025-12-02'),
    },
    purpose: 'Plánování služeb na kardiologii.',
    patients: 0,
    users: 40,
    months: 4,
    kpis: kpiSet.provoz,
  },
  {
    id: 'PP-2026-001',
    appId: 'bedflow',
    dept: 'interna',
    created: '2026-01-07',
    submitted: '2026-01-12',
    snapshotAt: '2026-01-12',
    state: 'exited',
    trialStart: '2026-03-02',
    trialEnd: '2026-08-31',
    final: 'odchod',
    steps: {
      zadost: done(d.interna.requester.name, '2026-01-12', 'podano'),
      primar: done(d.interna.head.name, '2026-01-14'),
      namestek: done(s.namestek.name, '2026-01-16'),
      firma: done('Fiktivní Software s.r.o.', '2026-01-21', 'prijato'),
      posouzeni: done('4 oblasti', '2026-02-10'),
      smlouva: done(`${s.reditel.name} a Fiktivní Software s.r.o.`, '2026-02-25', 'podepsano'),
      pilot: done(d.interna.requester.name, '2026-08-31', 'ukonceno'),
      kpi: done(d.interna.head.name, '2026-09-09', 'odchod'),
      rozhodnuti: done(s.namestek.name, '2026-09-16', 'odchod'),
      zaver: done(`${d.interna.requester.name}, ${s.dpo.name}`, '2026-10-05', 'ukonceno', 'Data vrácena, potvrzení o výmazu přijato, DPO potvrdil.'),
    },
    block: {
      legal: done(s.pravnik.name, '2026-01-28'),
      gdpr: done(s.dpo.name, '2026-02-03', 's_podminkou', 'Pilot jen s provozními daty bez osobních údajů pacientů.'),
      security: done(s.kb.name, '2026-02-06', 's_podminkou', 'Výjimka SEC-001 jen pro pilotní provoz bez osobních údajů.'),
      ostatni: done(s.it.name, '2026-02-10'),
    },
    waivers: {
      'GDP-002': 'Jen pro pilotní provoz bez osobních údajů pacientů.',
      'SEC-001': 'Jen pro pilotní provoz bez osobních údajů; před nákupem nutná certifikace.',
      'SEC-004': 'Jen pro pilotní provoz.',
    },
    note: 'KPI nesplněny (obsazenost plánovaná dopředu 61 % proti cíli 80 %). Ukončeno, potvrzení o výmazu přijato.',
    purpose: 'Plánování lůžek na interně.',
    patients: 0,
    users: 25,
    months: 6,
    kpis: kpiSet.provoz,
  },
  {
    id: 'PP-2026-014',
    appId: 'bedflow',
    dept: 'kardio',
    created: '2026-09-10',
    submitted: '2026-09-15',
    snapshotAt: '2026-09-15',
    state: 'rejected',
    steps: {
      zadost: done(d.kardio.requester.name, '2026-09-15', 'podano'),
      primar: done(d.kardio.head.name, '2026-09-16'),
      namestek: done(s.namestek.name, '2026-09-18'),
      firma: done('Fiktivní Software s.r.o.', '2026-09-23', 'prijato'),
      posouzeni: { status: 'rejected', by: `${s.dpo.name}, ${s.kb.name}`, date: '2026-10-08', outcome: 'zamitnuto' },
    },
    block: {
      legal: done(s.pravnik.name, '2026-10-01', 's_podminkou', 'Obnovit pojištění odpovědnosti.'),
      gdpr: { status: 'rejected', by: s.dpo.name, date: '2026-10-06', outcome: 'zamitnuto', condition: 'Hosting mimo EU/EHP (GDP-002) u osobních údajů pacientů.' },
      security: { status: 'rejected', by: s.kb.name, date: '2026-10-08', outcome: 'zamitnuto', condition: 'Chybí certifikace bezpečnosti informací (SEC-001).' },
      ostatni: done(s.it.name, '2026-10-05'),
    },
    note: 'Zamítnuto v posouzení GDPR a Security. Ostatní oblasti doběhly (sbírají se všechna zjištění).',
    purpose: 'Plánování lůžek na kardiologii včetně údajů o pacientech.',
    patients: 400,
    users: 20,
    months: 3,
    kpis: kpiSet.provoz,
  },
  {
    id: 'PP-2026-011',
    appId: 'onkokohorta',
    dept: 'interna',
    created: '2026-09-03',
    submitted: '2026-09-08',
    snapshotAt: '2026-09-08',
    state: 'withdrawn',
    steps: {
      zadost: done(d.interna.requester.name, '2026-09-08', 'podano'),
      primar: done(d.interna.head.name, '2026-09-10'),
      namestek: { status: 'withdrawn', since: '2026-09-10', date: '2026-09-18', note: 'Staženo žadatelkou – studie odložena' },
    },
    note: 'Žadatelka žádost stáhla 18. 9. 2026 (studie odložena).',
    purpose: 'Výběr pacientů do studie diabetu 2. typu.',
    patients: 250,
    users: 5,
    months: 6,
    kpis: kpiSet.kohorta,
  },
  {
    id: 'PP-2026-006',
    appId: 'sepsisalert',
    dept: 'onko',
    created: '2026-08-19',
    submitted: '2026-08-24',
    snapshotAt: '2026-08-24',
    state: 'on_hold',
    steps: {
      zadost: done(d.onko.requester.name, '2026-08-24', 'podano'),
      primar: done(d.onko.head.name, '2026-08-26'),
      namestek: done(s.namestek.name, '2026-08-31'),
      firma: { status: 'on_hold', since: '2026-09-01', note: 'Firma neodpověděla do 15. 9. ani po 2 připomínkách' },
    },
    note: 'Pozastaveno od 16. 9. 2026: firma nepotvrdila podmínky pilotního provozu do termínu. Žadatelka byla informována.',
    purpose: 'Varování sepse u neutropenických pacientů po chemoterapii.',
    patients: 120,
    users: 18,
    months: 6,
    kpis: kpiSet.sepse,
  },
];

// ---------- Kdo krok drží a kdo je další ----------

/** Kdo krok řeší (role z organizační struktury, ne ručně zadané jméno). */
export function holdersOf(req: TrialRequest, step: StepId, vendor: string): Person[] {
  const dep = departments[req.dept];
  switch (step) {
    case 'zadost':
      return [dep.requester];
    case 'primar':
      return [dep.head];
    case 'namestek':
      return [staff.namestek];
    case 'firma':
      return [{ name: vendor, role: 'firma' }];
    case 'posouzeni':
      return Object.values(domainOwner);
    case 'smlouva':
      return [staff.pravnik, staff.reditel];
    case 'pilot':
      return [{ ...dep.requester, role: 'odborný garant pilotního provozu' }];
    case 'kpi':
      return [dep.requester, dep.head];
    case 'rozhodnuti':
      return [staff.namestek];
    case 'zaver':
      return req.final === 'odchod' ? [dep.requester, staff.dpo] : [staff.nakup];
  }
}

export interface Progress {
  /** Index aktuálního kroku v šabloně; −1 = žádný (ukončeno). */
  current: number;
  currentRun?: StepRun;
  holders: Person[];
  /** Pracovní dny od aktivace (bez doby čekání na firmu). */
  waiting: number;
  due?: string;
  overdue: boolean;
  paused: boolean;
  next?: { label: string; who: Person[] };
  /** Krátké shrnutí pro tabulku. */
  summary: string;
}

const terminal: TrialState[] = ['purchased', 'exited', 'rejected', 'withdrawn'];
export const isActive = (r: TrialRequest) => !terminal.includes(r.state);

export function progressOf(req: TrialRequest, vendor: string): Progress {
  const steps = templateA.steps;
  const idx = steps.findIndex((st) => {
    const run = req.steps[st.id];
    return run && run.status !== 'done' && run.status !== 'pending';
  });
  const lastDone = steps.reduce((i, st, k) => (req.steps[st.id]?.status === 'done' ? k : i), -1);

  if (terminal.includes(req.state) && req.state !== 'rejected' && req.state !== 'withdrawn') {
    return { current: -1, holders: [], waiting: 0, overdue: false, paused: false, summary: stateLabel[req.state] };
  }

  // Podáno: běží předkontrola dossier, posuzovatelé ještě nezačali (brief §8.1).
  if (req.state === 'submitted') {
    const since = req.submitted ?? DEMO_TODAY;
    return {
      current: -1,
      holders: [{ name: vendor, role: 'firma (předkontrola)' }],
      waiting: workdaysBetween(since, DEMO_TODAY),
      due: addWorkdays(since, 5),
      overdue: false,
      paused: true,
      next: { label: 'Primář', who: holdersOf(req, 'primar', vendor) },
      summary: 'Předkontrola',
    };
  }

  // Schváleno k pilotnímu provozu: nic není aktivní, další je Smlouva.
  if (idx === -1) {
    const nextStep = steps[lastDone + 1];
    return {
      current: -1,
      holders: [],
      waiting: 0,
      overdue: false,
      paused: false,
      next: nextStep ? { label: nextStep.label, who: holdersOf(req, nextStep.id, vendor) } : undefined,
      summary: stateLabel[req.state],
    };
  }

  const step = steps[idx];
  const run = req.steps[step.id]!;
  let holders = holdersOf(req, step.id, vendor);
  if (step.id === 'posouzeni' && req.block) {
    holders = (Object.keys(req.block) as Domain[])
      .filter((dm) => req.block![dm]!.status === 'active' || req.block![dm]!.status === 'waiting_vendor')
      .map((dm) => (req.block![dm]!.status === 'waiting_vendor' ? { name: vendor, role: `firma (dotaz ${dm === 'security' ? 'Security' : dm})` } : domainOwner[dm]));
  }
  const paused = req.state === 'waiting_vendor' || req.state === 'on_hold';
  const pausedFrom = req.block && Object.values(req.block).find((b) => b?.status === 'waiting_vendor')?.since;
  const since = run.since ?? DEMO_TODAY;
  const until = pausedFrom ?? (req.state === 'on_hold' ? addWorkdays(since, step.sla ?? 5) : DEMO_TODAY);
  const waiting = run.status === 'withdrawn' ? 0 : workdaysBetween(since, until);
  const due = step.sla ? addWorkdays(since, step.sla) : undefined;
  const overdue = !paused && !!due && due < DEMO_TODAY && run.status === 'active';
  const nextStep = steps[idx + 1];
  const ended = req.state === 'rejected' || req.state === 'withdrawn';
  return {
    current: idx,
    currentRun: run,
    holders: ended ? [] : holders,
    waiting,
    due: ended ? undefined : due,
    overdue,
    paused,
    next: !ended && nextStep ? { label: nextStep.id === 'zaver' ? 'Nákup / Odchod' : nextStep.label, who: holdersOf(req, nextStep.id, vendor) } : undefined,
    summary: ended ? stateLabel[req.state] : step.label,
  };
}

export const requestsForApp = (appId: string) => trialRequests.filter((r) => r.appId === appId);

/** Odznak na kartě App Storu pro nemocnici (REQ-TRL-004). */
export function storeBadge(appId: string): 'predplatne' | 'pilot' | 'podano' | null {
  const rs = requestsForApp(appId);
  if (rs.some((r) => r.state === 'purchased')) return 'predplatne';
  if (rs.some((r) => r.state === 'trial_active')) return 'pilot';
  if (rs.some((r) => isActive(r) && r.state !== 'draft')) return 'podano';
  return null;
}

/** Datum uzavření u ukončených žádostí (poslední rozhodnutí). */
export function closedAt(req: TrialRequest): string | undefined {
  if (!['purchased', 'exited', 'rejected', 'withdrawn'].includes(req.state)) return undefined;
  return Object.values(req.steps).reduce<string | undefined>((m, r) => (r?.date && (!m || r.date > m) ? r.date : m), undefined);
}

/** Pracovní dny od podání do dneška, u uzavřených do uzavření. */
export const totalDays = (r: TrialRequest) => (r.submitted ? workdaysBetween(r.submitted, closedAt(r) ?? DEMO_TODAY) : 0);
