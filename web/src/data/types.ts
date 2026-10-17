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
  /** Krátký popisek do seznamu nedávných pacientů. */
  summary: string;
  treatment?: Treatment;
}

/** Aplikace licencovaná nemocnicí (z katalogu TheraHUB). */
export interface CatalogApp {
  id: string;
  name: string;
  tagline: string;
  icon: IconName;
  /** Barva ikony / akcentu karty. */
  tint: string;
}

export type IconName =
  | 'onco' | 'heart' | 'scribe' | 'droplet' | 'leaf' | 'camera' | 'smile' | 'gauge' | 'pill' | 'watch';

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
