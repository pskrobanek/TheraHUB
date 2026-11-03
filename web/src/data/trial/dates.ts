// Datum a pracovní dny pro demo (DEC-011, REQ-WFL-007).

/** Pevné „dnes“ ukázkových dat. */
export const DEMO_TODAY = '2026-11-03';

/** České státní svátky a dny pracovního klidu 2026–2027 (velikonoční data spočítaná pro dané roky). */
const holidays = new Set([
  '2026-01-01', '2026-04-03', '2026-04-06', '2026-05-01', '2026-05-08', '2026-07-05', '2026-07-06', '2026-09-28', '2026-10-28', '2026-11-17', '2026-12-24', '2026-12-25', '2026-12-26',
  '2027-01-01', '2027-03-26', '2027-03-29', '2027-05-01', '2027-05-08', '2027-07-05', '2027-07-06', '2027-09-28', '2027-10-28', '2027-11-17', '2027-12-24', '2027-12-25', '2027-12-26',
]);

const iso = (d: Date) => d.toISOString().slice(0, 10);
const parse = (s: string) => new Date(`${s}T12:00:00Z`);

export const isWorkday = (s: string) => {
  const d = parse(s).getUTCDay();
  return d !== 0 && d !== 6 && !holidays.has(s);
};

/** Přičte N pracovních dnů. */
export function addWorkdays(start: string, n: number): string {
  const d = parse(start);
  let left = n;
  while (left > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (isWorkday(iso(d))) left--;
  }
  return iso(d);
}

/** Počet pracovních dnů mezi dvěma daty (bez počátečního dne). */
export function workdaysBetween(from: string, to: string): number {
  if (to <= from) return 0;
  const d = parse(from);
  let n = 0;
  while (iso(d) < to) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (isWorkday(iso(d))) n++;
  }
  return n;
}

export const daysBetween = (from: string, to: string) => Math.round((parse(to).getTime() - parse(from).getTime()) / 86400000);

export function monthsBetween(from: string, to: string): number {
  const a = parse(from);
  const b = parse(to);
  return (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth()) - (b.getUTCDate() < a.getUTCDate() ? 1 : 0);
}

export const addDays = (s: string, n: number) => {
  const d = parse(s);
  d.setUTCDate(d.getUTCDate() + n);
  return iso(d);
};

/** „3. 11.“ nebo s rokem. */
export const fmtDay = (s: string, year = false) =>
  parse(s).toLocaleDateString('cs-CZ', year ? { day: 'numeric', month: 'numeric', year: 'numeric' } : { day: 'numeric', month: 'numeric' });

/** „čeká 3 pracovní dny“ – české tvary. */
export const workdaysLabel = (n: number) => (n === 1 ? '1 pracovní den' : n >= 2 && n <= 4 ? `${n} pracovní dny` : `${n} pracovních dnů`);
export const daysLabel = (n: number) => (n === 1 ? '1 den' : n >= 2 && n <= 4 ? `${n} dny` : `${n} dní`);
