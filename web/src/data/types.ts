// Datový model odpovídá docs/ENDGAME.md (kap. 3.7, 4.2, 4.3, 6.2).

/** Stupeň nasazení aplikace v nemocnici. */
export type AppStatus = 'produkce' | 'pilot' | 'sandbox';

/** Kde aplikace běží (profil nemocnice, kap. 4.3). */
export type Hosting = 'onprem' | 'privatni-cloud' | 'saas-eu' | 'therahub-cloud';

/** Připravenost k provozu s daty z NIS nemocnice (kap. 4.2). */
export type Readiness = 'plny' | 'omezeny' | 'nelze';

/** Úroveň splnění pilíře Frameworku. */
export type Level = 'base' | 'standard' | 'high';

export interface Compliance {
  data: Level;
  security: Level;
  privacy: Level;
  /** Regulatorní zařazení, např. „bez MDR“ nebo „MDR IIa“. */
  safety: string;
  /** Platnost certifikace TheraHUB (ISO datum). */
  certifiedUntil: string;
}

export interface Contract {
  type: 'pilotni' | 'provozni' | 'sandbox';
  /** Konec platnosti (ISO datum); null = na dobu neurčitou nebo bez smlouvy. */
  validUntil: string | null;
  annualCostCzk: number | null;
}

export interface ActiveApp {
  id: string;
  name: string;
  vendor: string;
  category: string;
  description: string;
  departments: string[];
  status: AppStatus;
  hosting: Hosting;
  readiness: Readiness;
  /** Vysvětlení u omezeného provozu – které funkce nepoběží a proč. */
  readinessNote?: string;
  compliance: Compliance;
  contract: Contract;
  usage: { activeUsers: number; uptimePct: number | null };
  openIncidents: number;
}

export interface Hospital {
  name: string;
  nis: string;
}
