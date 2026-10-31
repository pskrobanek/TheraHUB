import type { Check, StoreApp } from '../data/types';

const checkValue = (c: Check): number => (c === 'ok' ? 1 : c === 'partial' ? 0.5 : 0);
const pct = (xs: number[]): number => Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 100);

/** Jedno kritérium indexu: hodnota 0–1 a volitelný text místo stavu (např. „92 %“ nebo název společnosti). */
export interface ScoreCheck {
  label: string;
  value: number;
  note?: string;
}

export interface ScorePart {
  id: 'hospital' | 'data' | 'society' | 'therahub';
  label: string;
  checks: ScoreCheck[];
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
 * Adoption index: nemocnice 35 % + datový prostor 25 % + odborné společnosti 20 % + TheraHUB integrace 20 %.
 * U aplikací bez AI se kritérium asociace pro AI nepočítá.
 */
export function adoptionIndex(app: StoreApp): Score {
  const c = app.store.compliance;
  const hospital: ScoreCheck[] = [
    { label: 'Legal', value: checkValue(c.hospital.legal) },
    { label: 'GDPR', value: checkValue(c.hospital.gdpr) },
    { label: 'Security', value: checkValue(c.hospital.security) },
    { label: 'Integrace s NIS', value: c.nis / 100, note: `${c.nis} %` },
  ];
  const data: ScoreCheck[] = [
    { label: 'InterSystems datový prostor', value: checkValue(c.intersystems) },
    { label: 'Evropský datový standard', value: checkValue(c.euStandard) },
  ];
  const society: ScoreCheck[] = [
    { label: 'Záštita odborné společnosti', value: c.society ? 1 : 0, note: c.society ?? undefined },
    ...(c.aiAssociation ? [{ label: 'Asociace pro AI ČR', value: checkValue(c.aiAssociation) }] : []),
  ];
  const therahub: ScoreCheck[] = [
    { label: 'Widget', value: Number(c.therahub.widget) },
    { label: 'Science', value: Number(c.therahub.science) },
    { label: 'Workflow', value: Number(c.therahub.workflow) },
  ];
  const part = (id: ScorePart['id'], label: string, checks: ScoreCheck[], weight: number): ScorePart => ({
    id,
    label,
    checks,
    pct: pct(checks.map((x) => x.value)),
    weight,
  });

  const parts: ScorePart[] = [
    part('hospital', 'Vaše nemocnice', hospital, 0.35),
    part('data', 'Datový prostor', data, 0.25),
    part('society', 'Odborné společnosti', society, 0.2),
    part('therahub', 'TheraHUB integrace', therahub, 0.2),
  ];
  const total = Math.round(parts.reduce((sum, p) => sum + p.pct * p.weight, 0));
  const level = total >= 85 ? 'vysoke' : total >= 70 ? 'stredni' : 'nizke';
  return { total, level, levelLabel: { vysoke: 'Vysoká', stredni: 'Střední', nizke: 'Nízká' }[level], parts };
}
