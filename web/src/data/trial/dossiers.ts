// Ukázková compliance dossier smyšlených aplikací (brief §3.3). Firmy, doklady i data jsou vymyšlené.
// Skutečné aplikace z konsorcia (OncoReady, Auris One, Kardi AI) dossier v demu nemají → „Dossier se připravuje“ (DEC-008).
import type { Answer } from './match';

/** Skutečné aplikace: žádné vymyšlené verdikty, rozpory ani Adoption index. */
export const realAppIds = new Set(['oncoready']);

/** Skutečný stav u skutečných aplikací (jediné místo, kde smí být FTN – DEC-003). */
export const realStatusNote: Record<string, string> = {
  oncoready: 'Skutečný stav: první pilotní provoz běží na Onkologické klinice FTN.',
};

const ok = (name: string, issued: string, verified = true, validUntil?: string): Answer['evidence'] => ({ name, issued, verified, validUntil });

/** Dossier, které splňuje všechny ukázkové požadavky FN Demo. */
const base: Record<string, Answer> = {
  'LEG-001': { value: 'MDR I', evidence: ok('Prohlášení o shodě', '2025-11-20') },
  'LEG-002': { value: true, evidence: ok('Pojistný certifikát', '2026-01-10', true, '2027-01-09') },
  'LEG-003': { value: true, evidence: ok('Pilotní podmínky dodavatele', '2026-03-02', false) },
  'LEG-004': { value: 30, evidence: ok('Exit plán', '2026-03-02', false) },
  'GDP-001': { value: true, evidence: ok('DPA (čl. 28)', '2026-02-14') },
  'GDP-002': { value: 'EU/EHP', evidence: ok('Seznam subdodavatelů', '2026-06-01') },
  'GDP-003': { value: true, evidence: ok('DPIA', '2026-05-12', false) },
  'SEC-001': { value: true, evidence: ok('Certifikát ISO/IEC 27001', '2025-09-30', true, '2028-09-29') },
  'SEC-002': { value: true, evidence: ok('Zpráva z penetračního testu', '2026-04-15') },
  'SEC-003': { value: true, evidence: ok('Bezpečnostní architektura', '2026-04-15') },
  'SEC-004': { value: 24, evidence: ok('Bezpečnostní příloha', '2026-04-15', false) },
  'OST-001': { value: true, evidence: ok('Integrační specifikace FHIR R4', '2026-05-20') },
  'OST-002': { value: true, evidence: ok('Prohlášení o přístupnosti', '2026-05-20', false) },
  'OST-003': { value: 4, evidence: ok('SLA podpory', '2026-03-02', false) },
  'OST-004': { value: true, evidence: ok('Reference (2 smyšlené nemocnice)', '2026-07-01', false) },
};

interface Dossier {
  vendor: string;
  version: number;
  answers: Record<string, Answer>;
}

const make = (vendor: string, version: number, overrides: Record<string, Answer | undefined> = {}): Dossier => {
  const answers: Record<string, Answer> = { ...base };
  for (const [k, v] of Object.entries(overrides)) {
    if (v === undefined) delete answers[k];
    else answers[k] = v;
  }
  return { vendor, version, answers };
};

export const dossiers: Record<string, Dossier> = {
  // Tři demo aplikace modulu (brief §13): Splňuje / Splňuje s výhradami / Nesplňuje.
  radiotriage: make('Startup Demo s.r.o.', 4, { 'LEG-001': { value: 'MDR IIa', evidence: ok('Certifikát MDR IIa', '2025-06-01', true, '2030-05-31') } }),
  sepsisalert: make(
    'Ukázka Medical a.s.',
    2,
    {
      'LEG-001': { value: 'MDR IIa', evidence: ok('Certifikát MDR IIa', '2025-12-01', true, '2030-11-30') },
      'SEC-002': { value: true, evidence: ok('Zpráva z penetračního testu', '2025-05-04') },
      'OST-001': { value: false, fixBy: '2027-03-31', evidence: ok('Roadmapa integrace', '2026-08-01', false) },
      'GDP-003': { value: 'DPIA se zpracovává, přiložen návrh', freeText: true, evidence: ok('Návrh DPIA', '2026-09-10', false) },
    },
  ),
  bedflow: make('Fiktivní Software s.r.o.', 1, {
    'LEG-001': { value: 'Není ZP', evidence: ok('Prohlášení dodavatele', '2026-01-15', false) },
    'LEG-002': { value: true, evidence: ok('Pojistný certifikát', '2025-09-01', true, '2026-08-31') },
    'GDP-002': { value: 'EU/EHP + USA', evidence: ok('Seznam subdodavatelů', '2026-02-01', false) },
    'SEC-001': undefined,
    'SEC-004': { value: 72, evidence: ok('Bezpečnostní příloha', '2026-02-01', false) },
  }),
  // Další smyšlené aplikace katalogu.
  onkokohorta: make('Demo Research s.r.o.', 3, {
    'LEG-001': { value: 'Není ZP', evidence: ok('Prohlášení dodavatele', '2026-02-01', false) },
    'LEG-004': { value: 'Archivace dle zákona, pak výmaz', freeText: true, evidence: ok('Exit plán', '2026-02-01', false) },
  }),
  smenaplan: make('Fiktivní Software s.r.o.', 2, {
    'LEG-001': { value: 'Není ZP', evidence: ok('Prohlášení dodavatele', '2026-02-01', false) },
    'GDP-003': { notApplicable: 'Aplikace nezpracovává zdravotní údaje pacientů.' },
  }),
  toxitrack: make('Startup Demo s.r.o.', 5, { 'LEG-001': { value: 'MDR IIa', evidence: ok('Certifikát MDR IIa', '2025-03-01', true, '2030-02-28') } }),
  cardiowatch: make('Ukázka Medical a.s.', 3, {
    'LEG-001': { value: 'MDR IIb', evidence: ok('Certifikát MDR IIb', '2025-04-01', true, '2030-03-31') },
  }),
  visitscribe: make('Startup Demo s.r.o.', 2),
  polykej: make('Demo Rehab s.r.o.', 2),
  nutriplan: make('Demo Rehab s.r.o.', 1, { 'SEC-002': { value: true, evidence: ok('Zpráva z penetračního testu', '2025-07-01') } }),
  dermafoto: make('Startup Demo s.r.o.', 2),
  klid: make('Demo Research s.r.o.', 2, { 'OST-004': { value: false, evidence: ok('Prohlášení dodavatele', '2026-03-01', false) } }),
  bolestdenik: make('Demo Rehab s.r.o.', 1),
  lekyhlidac: make('Ukázka Medical a.s.', 2),
  krokomer: make('Demo Rehab s.r.o.', 1, { 'LEG-001': { value: 'Wellness', evidence: ok('Prohlášení dodavatele', '2026-01-01', false) } }),
};
