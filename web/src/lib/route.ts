// Jednoduché hash routování: #/pacienti/<id>/<záložka> nebo #/<sekce>[/<podstránka>].

export const sectionIds = ['domu', 'pacienti', 'aplikace', 'workflow', 'science', 'nastaveni'] as const;
export type SectionId = (typeof sectionIds)[number];

export const patientTabs = ['prehled', 'aplikace', 'workflow', 'science'] as const;
export type PatientTab = (typeof patientTabs)[number];

export interface Route {
  section: SectionId;
  patientId?: string;
  tab: PatientTab;
  /** Podstránka sekce, např. #/aplikace/store. */
  sub?: string;
  /** Položka podstránky, např. id aplikace v #/aplikace/app/<id>. */
  item?: string;
}

export function parseHash(hash: string): Route {
  const [section, patientId, tab] = hash.replace(/^#\/?/, '').split('/');
  const s = (sectionIds as readonly string[]).includes(section) ? (section as SectionId) : 'pacienti';
  const t = (patientTabs as readonly string[]).includes(tab) ? (tab as PatientTab) : 'aplikace';
  if (s === 'pacienti') return { section: s, patientId: patientId || undefined, tab: t };
  return { section: s, tab: t, sub: patientId || undefined, item: tab || undefined };
}

export function patientHref(patientId: string, tab: PatientTab = 'aplikace'): string {
  return `#/pacienti/${patientId}/${tab}`;
}

/** Otevřená aplikace jako podzáložka sekce Aplikace. */
export function appHref(appId: string): string {
  return `#/aplikace/app/${appId}`;
}

/** Id aplikace otevřené v sekci Aplikace, pokud nějaká je. */
export const openAppId = (r: Route): string | undefined => (r.section === 'aplikace' && r.sub === 'app' ? r.item : undefined);

const NAV_EVENT = 'therahub:navigate';

/** Přejde na `href` bez opuštění stránky (funguje i ve vloženém náhledu, kde URL nelze měnit). */
export function navigate(href: string): void {
  try {
    history.replaceState(null, '', href);
  } catch {
    // Ve vloženém náhledu může být změna URL zakázaná; stav nese událost.
  }
  window.dispatchEvent(new CustomEvent(NAV_EVENT, { detail: href }));
}

export function onNavigate(handler: (href: string) => void): () => void {
  const listener = (e: Event) => handler((e as CustomEvent<string>).detail);
  const onHash = () => handler(window.location.hash);
  window.addEventListener(NAV_EVENT, listener);
  window.addEventListener('hashchange', onHash);
  return () => {
    window.removeEventListener(NAV_EVENT, listener);
    window.removeEventListener('hashchange', onHash);
  };
}
