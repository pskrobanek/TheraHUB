// Klinický pracovní prostor běží v kontextu nemocnice (TheraHUB Node, ENDGAME kap. 11).
// Zdravotní data pacientů nikdy neopouštějí nemocnici; centrální část zná jen katalog aplikací.

export interface Diagnosis {
  code: string;
  label: string;
}

export interface Treatment {
  name: string;
  done: number;
  total: number;
  unit: string;
  started: string;
  plannedEnd: string;
}

export interface Patient {
  id: string;
  name: string;
  sex: 'muž' | 'žena';
  age: number;
  /** Interní číslo pacienta v NIS (ne rodné číslo). */
  nisId: string;
  attending: string;
  tags: Diagnosis[];
  /** Rodné číslo (v demu fiktivní). */
  birthNumber: string;
  /** Hlavní diagnóza dle MKN-10. */
  mainDiagnosis: string;
  treatment?: Treatment;
}

/** Aplikace z katalogu TheraHUB. */
export interface CatalogApp {
  id: string;
  name: string;
  tagline: string;
  category: string;
  icon: IconName;
  /** Barva ikony / akcentu karty. */
  tint: string;
}

export type IconName =
  | 'onco' | 'heart' | 'scribe' | 'droplet' | 'leaf' | 'camera' | 'smile' | 'gauge' | 'pill' | 'watch'
  | 'bed' | 'scan' | 'activity' | 'database' | 'calendar';

/** Splněno / částečně / nesplněno. */
export type Check = 'ok' | 'partial' | 'no';

export type Audience = 'pacient' | 'lekar' | 'sestra' | 'admin' | 'vyzkumnik';

/** Míra zapojení AI: žádná / AI navrhuje / AI rozhoduje a člověk schvaluje / AI jedná samostatně. */
export type AiMode = 'none' | 'assisted' | 'guided' | 'autonomous';

export interface StoreInfo {
  /** Jedna věta, proč aplikaci chtít. */
  pitch: string;
  audience: Audience[];
  /** Regulatorní zařazení (ENDGAME kap. 3.4). */
  regulatory: { kind: 'mdr' | 'admin' | 'research' | 'wellness'; label: string };
  ai: AiMode;
  trial: { days: number; kpis: string[] } | null;
  price: { amount: number; per: 'pacient' | 'uživatel' | 'událost' | 'lůžko' | 'nemocnice'; period: 'měsíc' | 'rok' | 'jednorázově' };
  rating: number;
  reviews: number;
  /** V kolika nemocnicích aplikace aktivně běží. */
  hospitals: number;
  /** Aktivní uživatelé za posledních 30 dní napříč nemocnicemi. */
  activeUsers: number;
  compliance: {
    /** Soulad s profilem vaší nemocnice (ENDGAME kap. 4). */
    hospital: { legal: Check; gdpr: Check; security: Check };
    /** Míra integrace s vaším NIS v % (readiness, kap. 4.2). */
    nis: number;
    therahub: { widget: boolean; science: boolean; workflow: boolean };
    intersystems: Check;
    /** Evropský datový standard (EHDS / EEHRxF, HL7 Europe). */
    euStandard: Check;
    /** Soulad s kodexem asociace pro AI; null = aplikace AI nepoužívá. */
    aiAssociation: Check | null;
    /** Záštita odborné společnosti, pokud ji aplikace má. */
    society: string | null;
  };
}

export interface StoreApp extends CatalogApp {
  store: StoreInfo;
}

export interface ToxicityItem {
  label: string;
  grade: 0 | 1 | 2 | 3 | 4;
}

/** Data, která aplikace poskytuje do karty pacienta (widget aplikace). */
export type AppWidget =
  | {
      kind: 'toxicity';
      alert?: { text: string; time: string };
      items: ToxicityItem[];
      completed: number;
      total: number;
      next: string;
    }
  | {
      kind: 'ecg';
      bpm: number;
      rhythm: string;
      qtc: number;
      pr: number;
      qrs: number;
      lastRecord: string;
    }
  | {
      kind: 'scribe';
      title: string;
      meta: string;
      summary: string;
      tasks: { id: string; text: string; done: boolean }[];
    }
  | { kind: 'pending' };

export interface ActivePatientApp {
  appId: string;
  since: string;
  widget: AppWidget;
}

export interface Recommendation {
  appId: string;
  /** Důvod doporučení odvozený z dat pacienta. */
  reason: string;
}
