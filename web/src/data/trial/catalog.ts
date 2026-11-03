// Ukázkový katalog požadavků (brief §3.1). Oblast Ostatní = další požadavky nemocnice (provoz, podpora, reference);
// integrace, datový prostor, záštity a TheraHUB integrace patří do Adoption indexu, ne do posouzení (DEC-014).
// Položky jsou jen ilustrace tvaru z briefu.
// Skutečný obsah dodají odborníci: TODO(legal), TODO(dpo), TODO(security) – viz docs/OPEN_QUESTIONS.md OQ-014.

export type Domain = 'legal' | 'gdpr' | 'security' | 'ostatni';
export type Pillar = 'legal' | 'privacy' | 'security' | 'safety' | 'data' | 'research';
export type Criticality = 'blokujici' | 'dulezite' | 'informativni';

export const domains: Domain[] = ['legal', 'gdpr', 'security', 'ostatni'];
export const domainLabel: Record<Domain, string> = { legal: 'Legal', gdpr: 'GDPR', security: 'Security', ostatni: 'Ostatní' };
export const pillarLabel: Record<Pillar, string> = {
  legal: 'LEGAL & BUSINESS',
  privacy: 'PRIVACY',
  security: 'SECURITY',
  safety: 'SAFETY',
  data: 'DATA',
  research: 'RESEARCH',
};
export const criticalityLabel: Record<Criticality, string> = { blokujici: 'Blokující', dulezite: 'Důležité', informativni: 'Informativní' };

/** Jak se položka vyhodnocuje (v demu; ve Fázi 1 parametry jako data). */
export type Rule =
  | { kind: 'yes' } // vyžadováno „ano“ s dokladem
  | { kind: 'oneOf'; allowed: string[] } // odpověď z povolených možností
  | { kind: 'maxAgeMonths'; months: number } // stáří dokladu
  | { kind: 'max'; limit: number; unit: string } // číselná hodnota nejvýš N (hodiny, dny)
  | { kind: 'review' }; // jen dokument nebo volný text – nelze posoudit automaticky

export interface CatalogItem {
  code: string;
  domain: Domain;
  pillar: Pillar;
  subcategory?: string;
  title: string;
  /** Očekávání nemocnice FN Demo – zástupná ukázka. */
  expectation: string;
  criticality: Criticality;
  rule: Rule;
  todo: 'legal' | 'dpo' | 'security' | 'clinical';
}

/** Ukázkový profil požadavků FN Demo, verze 3 (publikováno 15. 10. 2026). Hodnoty jsou zástupné. */
export const profileVersion = { version: 3, published: '2026-10-15' };

export const catalog: CatalogItem[] = [
  // Legal
  { code: 'LEG-001', domain: 'legal', pillar: 'safety', subcategory: 'Regulatorní status', title: 'Regulatorní status deklarován (není ZP / třída MDR)', expectation: 'Povoleno: není ZP, wellness, MDR I, MDR IIa (ukázka)', criticality: 'blokujici', rule: { kind: 'oneOf', allowed: ['Není ZP', 'Wellness', 'MDR I', 'MDR IIa'] }, todo: 'legal' },
  { code: 'LEG-002', domain: 'legal', pillar: 'legal', title: 'Pojištění odpovědnosti za produkt', expectation: 'Platná pojistka (ukázka)', criticality: 'blokujici', rule: { kind: 'yes' }, todo: 'legal' },
  { code: 'LEG-003', domain: 'legal', pillar: 'legal', title: 'Pilotní provoz bez závazku koupě, bez automatického převodu na placený', expectation: 'Ano', criticality: 'blokujici', rule: { kind: 'yes' }, todo: 'legal' },
  { code: 'LEG-004', domain: 'legal', pillar: 'legal', title: 'Exit: vrácení a výmaz dat', expectation: 'Výmaz do 30 dnů (ukázka)', criticality: 'dulezite', rule: { kind: 'max', limit: 30, unit: 'dní' }, todo: 'legal' },
  // GDPR
  { code: 'GDP-001', domain: 'gdpr', pillar: 'privacy', title: 'Role (správce / zpracovatel) a DPA dle čl. 28 GDPR', expectation: 'DPA k dispozici', criticality: 'blokujici', rule: { kind: 'yes' }, todo: 'dpo' },
  { code: 'GDP-002', domain: 'gdpr', pillar: 'privacy', title: 'Hosting v EU/EHP a seznam subdodavatelů', expectation: 'Povoleno: EU/EHP (ukázka)', criticality: 'blokujici', rule: { kind: 'oneOf', allowed: ['EU/EHP'] }, todo: 'dpo' },
  { code: 'GDP-003', domain: 'gdpr', pillar: 'privacy', title: 'DPIA', expectation: 'Vyžadováno u zdravotních údajů (ukázka)', criticality: 'dulezite', rule: { kind: 'yes' }, todo: 'dpo' },
  // Security
  { code: 'SEC-001', domain: 'security', pillar: 'security', title: 'Certifikace bezpečnosti informací (např. ISO/IEC 27001)', expectation: 'Vyžadováno (ukázka)', criticality: 'blokujici', rule: { kind: 'yes' }, todo: 'security' },
  { code: 'SEC-002', domain: 'security', pillar: 'security', title: 'Penetrační test', expectation: 'Max. 12 měsíců starý (ukázka)', criticality: 'dulezite', rule: { kind: 'maxAgeMonths', months: 12 }, todo: 'security' },
  { code: 'SEC-003', domain: 'security', pillar: 'security', title: 'MFA pro personál, šifrování při přenosu i uložení', expectation: 'Ano', criticality: 'blokujici', rule: { kind: 'yes' }, todo: 'security' },
  { code: 'SEC-004', domain: 'security', pillar: 'security', title: 'Hlášení bezpečnostních incidentů', expectation: 'Do 24 hodin (ukázka)', criticality: 'dulezite', rule: { kind: 'max', limit: 24, unit: 'h' }, todo: 'security' },
  // Ostatní
  { code: 'OST-001', domain: 'ostatni', pillar: 'legal', subcategory: 'Provoz', title: 'Zaškolení personálu v ceně pilotního provozu', expectation: 'Ano (ukázka)', criticality: 'dulezite', rule: { kind: 'yes' }, todo: 'clinical' },
  { code: 'OST-002', domain: 'ostatni', pillar: 'legal', subcategory: 'Provoz', title: 'Čeština v rozhraní a přístupnost (WCAG)', expectation: 'Ano (ukázka)', criticality: 'dulezite', rule: { kind: 'yes' }, todo: 'clinical' },
  { code: 'OST-003', domain: 'ostatni', pillar: 'legal', subcategory: 'Podpora', title: 'Podpora a SLA odezvy', expectation: 'Pracovní dny, odezva do 4 h (ukázka)', criticality: 'dulezite', rule: { kind: 'max', limit: 4, unit: 'h' }, todo: 'clinical' },
  { code: 'OST-004', domain: 'ostatni', pillar: 'safety', subcategory: 'Klinická bezpečnost', title: 'Klinické důkazy a reference z jiných nemocnic', expectation: 'Informativní', criticality: 'informativni', rule: { kind: 'yes' }, todo: 'clinical' },
];

/** Další položky katalogu, které profil FN Demo zatím nepoužívá (nabídka „Přidat z katalogu“). Zástupné. */
export const catalogExtra: CatalogItem[] = [
  { code: 'LEG-005', domain: 'legal', pillar: 'legal', title: 'Escrow zdrojového kódu u kritických aplikací', expectation: 'Ano (ukázka)', criticality: 'informativni', rule: { kind: 'yes' }, todo: 'legal' },
  { code: 'GDP-004', domain: 'gdpr', pillar: 'privacy', title: 'Žádný trénink AI na datech nemocnice bez dohody', expectation: 'Ano (ukázka)', criticality: 'blokujici', rule: { kind: 'yes' }, todo: 'dpo' },
  { code: 'SEC-005', domain: 'security', pillar: 'security', title: 'Seznam softwarových komponent (SBOM)', expectation: 'Ano (ukázka)', criticality: 'dulezite', rule: { kind: 'yes' }, todo: 'security' },
  { code: 'SEC-006', domain: 'security', pillar: 'security', title: 'Přístup dodavatele do sítě jen přes VPN s MFA', expectation: 'Ano (ukázka)', criticality: 'dulezite', rule: { kind: 'yes' }, todo: 'security' },
  { code: 'OST-005', domain: 'ostatni', pillar: 'legal', subcategory: 'Provoz', title: 'Hotline podpory v češtině', expectation: 'Ano (ukázka)', criticality: 'informativni', rule: { kind: 'yes' }, todo: 'clinical' },
];
