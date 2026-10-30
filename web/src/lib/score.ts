import type { Check, StoreApp } from '../data/types';

const checkValue = (c: Check): number => (c === 'ok' ? 1 : c === 'partial' ? 0.5 : 0);
const pct = (xs: number[]): number => Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 100);

export interface ScorePart {
  id: 'hospital' | 'data' | 'society' | 'therahub';
  label: string;
  /** Hodnoty jednotlivých kritérií 0–1, každé = jedna tečka. */
  dots: number[];
  pct: number;
  weight: number;
}

export interface Score {
  total: number;
  level: 'vysoke' | 'stredni' | 'nizke';
  levelLabel: string;
  parts: ScorePart[];
}

export const usesAi = (app: StoreApp): boolean => app.store.ai !== 'none';

/**
 * Index důvěry: nemocnice 35 % + datový prostor 25 % + odborné společnosti 20 % + TheraHUB integrace 20 %.
 * U aplikací bez AI se kritérium asociace pro AI nepočítá.
 */
export function complianceScore(app: StoreApp): Score {
  const c = app.store.compliance;
  const hospital = [checkValue(c.hospital.legal), checkValue(c.hospital.gdpr), checkValue(c.hospital.security), c.nis / 100];
  const data = [checkValue(c.intersystems), checkValue(c.euStandard)];
  const society = [c.society ? 1 : 0, ...(c.aiAssociation ? [checkValue(c.aiAssociation)] : [])];
  const therahub = [c.therahub.widget, c.therahub.science, c.therahub.workflow].map(Number);

  const parts: ScorePart[] = [
    { id: 'hospital', label: 'Nemocnice', dots: hospital, pct: pct(hospital), weight: 0.35 },
    { id: 'data', label: 'Datový prostor', dots: data, pct: pct(data), weight: 0.25 },
    { id: 'society', label: 'Odborné spol.', dots: society, pct: pct(society), weight: 0.2 },
    { id: 'therahub', label: 'TheraHUB integrace', dots: therahub, pct: pct(therahub), weight: 0.2 },
  ];
  const total = Math.round(parts.reduce((sum, p) => sum + p.pct * p.weight, 0));
  const level = total >= 85 ? 'vysoke' : total >= 70 ? 'stredni' : 'nizke';
  return { total, level, levelLabel: { vysoke: 'Vysoké', stredni: 'Střední', nizke: 'Nízké' }[level], parts };
}

/** Hrubý odhad měsíčních nákladů pro jedno oddělení podle cenového modelu. */
export function departmentEstimate(app: StoreApp): { monthly: number; unit: string } {
  const p = app.store.price;
  const volume: Record<typeof p.per, number> = { pacient: 120, uživatel: 10, událost: 800, lůžko: 30, nemocnice: 1 };
  const perMonth = p.period === 'rok' ? p.amount / 12 : p.amount;
  const monthly = Math.round((perMonth * volume[p.per]) / 100) * 100;
  const per = p.per === 'událost' ? 'vyšetření' : p.per;
  const unit = p.period === 'jednorázově' ? `${p.amount.toLocaleString('cs-CZ')} Kč / ${per}` : `${p.amount.toLocaleString('cs-CZ')} Kč / ${per} / ${p.period === 'rok' ? 'rok' : 'měs.'}`;
  return { monthly, unit };
}
