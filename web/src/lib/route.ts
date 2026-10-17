// Jednoduché hash routování: #/pacienti/<id>/<záložka> nebo #/<sekce>.

export const sectionIds = ['domu', 'pacienti', 'upozorneni', 'ukoly', 'plan', 'appstore', 'analytika', 'nastaveni'] as const;
export type SectionId = (typeof sectionIds)[number];

export const patientTabs = ['prehled', 'aplikace', 'workflow', 'science'] as const;
export type PatientTab = (typeof patientTabs)[number];

export interface Route {
  section: SectionId;
  patientId?: string;
  tab: PatientTab;
}

export function parseHash(hash: string, defaultPatientId: string): Route {
  const [section, patientId, tab] = hash.replace(/^#\/?/, '').split('/');
  const s = (sectionIds as readonly string[]).includes(section) ? (section as SectionId) : 'pacienti';
  const t = (patientTabs as readonly string[]).includes(tab) ? (tab as PatientTab) : 'aplikace';
  return { section: s, patientId: s === 'pacienti' ? patientId || defaultPatientId : undefined, tab: t };
}

export function patientHref(patientId: string, tab: PatientTab = 'aplikace'): string {
  return `#/pacienti/${patientId}/${tab}`;
}
