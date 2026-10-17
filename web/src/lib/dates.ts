const DAY_MS = 24 * 60 * 60 * 1000;

/** ISO datum posunuté o `days` dní od dneška (pro demo data, aby nezastarávala). */
export function daysFromNow(days: number): string {
  return new Date(Date.now() + days * DAY_MS).toISOString().slice(0, 10);
}

/** Počet celých dní od dneška do `iso` (záporné = v minulosti). */
export function daysUntil(iso: string): number {
  const today = new Date(new Date().toISOString().slice(0, 10)).getTime();
  return Math.round((new Date(iso).getTime() - today) / DAY_MS);
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('cs-CZ');
}

export function formatCzk(value: number | null): string {
  if (value === null) return '—';
  return value.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 });
}
