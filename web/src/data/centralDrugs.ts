// Predikce CL – spotřeba centrových léčiv v centrech nemocnice do konce roku (ukázková, smyšlená čísla).
// Skutečnost leden–říjen, predikce listopad–prosinec. Výpočet běží v nemocnici (TheraHUB Node) nad agregovanými
// částkami; vstupy z workflow: MDT summary (nové indikace), OncoReady (přerušení léčby), VZP uptodate (změny úhrad).

export const months = ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čvn', 'Čvc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro'];
/** Počet měsíců se skutečností (do 31. 10. 2026). */
export const ACTUAL = 10;
export const asOf = '31. 10. 2026';

export interface Center {
  id: 'onko' | 'pneu' | 'neu';
  code: string;
  name: string;
  /** Roční limit (smluvní objem s pojišťovnami), mil. Kč. */
  limit: number;
  /** Měsíční čerpání, mil. Kč: 10 měsíců skutečnost + 2 predikce. */
  monthly: number[];
  /** Nejistota predikce za každý predikovaný měsíc (±, mil. Kč). */
  spread: number[];
  patients: number;
  patientsDelta: number;
  groups: { label: string; share: number }[];
  drivers: { app: 'mdtsummary' | 'oncoready' | 'vzpuptodate'; text: string; effect?: number }[];
}

export const centers: Center[] = [
  {
    id: 'onko',
    code: 'ONKO',
    name: 'Komplexní onkologické centrum',
    limit: 640,
    monthly: [48, 50, 53, 51, 55, 54, 57, 58, 61, 63, 65, 67],
    spread: [4, 6],
    patients: 412,
    patientsDelta: 18,
    groups: [
      { label: 'Imunoterapie', share: 46 },
      { label: 'Cílená léčba', share: 31 },
      { label: 'Ostatní', share: 23 },
    ],
    drivers: [
      { app: 'mdtsummary', text: 'Za říjen 14 nových indikací imunoterapie z MDT (o 5 víc než průměr).', effect: 6.8 },
      { app: 'oncoready', text: '6 pacientů s přerušenou léčbou pro toxicitu.', effect: -3.1 },
      { app: 'vzpuptodate', text: 'Od 1. 11. nižší úhrada u 2 přípravků cílené léčby (ukázka).', effect: -1.4 },
    ],
  },
  {
    id: 'pneu',
    code: 'PNEU',
    name: 'Pneumologické centrum',
    limit: 118,
    monthly: [8.6, 8.9, 9.1, 9.0, 9.4, 9.3, 9.6, 9.5, 9.8, 9.9, 10.0, 10.1],
    spread: [0.6, 0.9],
    patients: 96,
    patientsDelta: 3,
    groups: [
      { label: 'Biologika u těžkého astmatu', share: 52 },
      { label: 'Antifibrotika', share: 34 },
      { label: 'Ostatní', share: 14 },
    ],
    drivers: [
      { app: 'mdtsummary', text: '3 nové indikace biologické léčby za říjen.', effect: 0.9 },
      { app: 'vzpuptodate', text: 'Beze změn úhrad do konce roku.' },
    ],
  },
  {
    id: 'neu',
    code: 'NEU',
    name: 'Neurologické centrum',
    limit: 210,
    monthly: [15.2, 15.0, 15.6, 15.3, 15.8, 15.5, 15.9, 15.7, 16.0, 16.1, 16.2, 16.3],
    spread: [0.8, 1.2],
    patients: 288,
    patientsDelta: 4,
    groups: [
      { label: 'Roztroušená skleróza – vysoce účinná léčba', share: 61 },
      { label: 'Roztroušená skleróza – ostatní', share: 24 },
      { label: 'Migréna – biologická léčba', share: 15 },
    ],
    drivers: [
      { app: 'mdtsummary', text: '2 převody na vysoce účinnou léčbu roztroušené sklerózy.', effect: 0.6 },
      { app: 'vzpuptodate', text: 'Od 1. 12. levnější generikum – úspora asi 1,2 mil. Kč (ukázka).', effect: -1.2 },
    ],
  },
];

const round1 = (v: number) => Math.round(v * 10) / 10;

/** Kumulativní čerpání po měsících. */
export const cumulative = (c: Center) => c.monthly.reduce<number[]>((acc, v) => [...acc, round1((acc.length ? acc[acc.length - 1] : 0) + v)], []);

export interface CenterState {
  spent: number;
  forecast: number;
  low: number;
  high: number;
  pctNow: number;
  pctForecast: number;
  diff: number;
  status: 'ok' | 'risk' | 'over';
}

export function stateOf(c: Center): CenterState {
  const cum = cumulative(c);
  const spent = cum[ACTUAL - 1];
  const forecast = cum[11];
  const band = c.spread.reduce((a, b) => a + b, 0);
  const pctForecast = (forecast / c.limit) * 100;
  return {
    spent,
    forecast,
    low: round1(forecast - band),
    high: round1(forecast + band),
    pctNow: (spent / c.limit) * 100,
    pctForecast,
    diff: round1(forecast - c.limit),
    status: pctForecast >= 100 ? 'over' : pctForecast >= 95 ? 'risk' : 'ok',
  };
}

export const statusLabel: Record<CenterState['status'], string> = { ok: 'V limitu', risk: 'Riziko překročení', over: 'Predikce nad limitem' };

export const fmtMil = (v: number) => `${v.toLocaleString('cs-CZ', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mil. Kč`;
export const fmtPct = (v: number) => `${v.toLocaleString('cs-CZ', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
