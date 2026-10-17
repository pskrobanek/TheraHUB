import type { AppStatus, Hosting, Level, Readiness } from '../data/types';

export const statusLabel: Record<AppStatus, string> = {
  produkce: 'Produkce',
  pilot: 'Pilot',
  sandbox: 'Sandbox',
};

export const hostingLabel: Record<Hosting, string> = {
  onprem: 'On-prem (Node)',
  'privatni-cloud': 'Privátní cloud',
  'saas-eu': 'SaaS EU',
  'therahub-cloud': 'TheraHUB cloud',
};

export const readinessLabel: Record<Readiness, string> = {
  plny: 'Plný provoz',
  omezeny: 'Omezený provoz',
  nelze: 'Nelze provozovat',
};

export const levelLabel: Record<Level, string> = {
  base: 'Base',
  standard: 'Standard',
  high: 'High',
};

export const contractLabel = {
  pilotni: 'Pilotní',
  provozni: 'Provozní',
  sandbox: 'Bez smlouvy (sandbox)',
} as const;
