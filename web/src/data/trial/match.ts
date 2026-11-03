// Ukázkový matching pro Fázi 0 (DEC-010). Stavy a pravidla verdiktu podle briefu §4.
// Skutečný engine vznikne ve Fázi 1 jako čistá verzovaná knihovna s testy (REQ-MAT-009).
import { catalog, domains, type CatalogItem, type Criticality, type Domain } from './catalog';
import { DEMO_TODAY, monthsBetween } from './dates';

export type ItemStatus = 'match' | 'partial' | 'gap' | 'missing' | 'expired' | 'review' | 'waived' | 'na';
export type Verdict = 'splnuje' | 'vyhrady' | 'nesplnuje' | 'nelze';

export interface Evidence {
  name: string;
  issued: string; // ISO datum
  validUntil?: string;
  verified: boolean; // Ověřeno TheraHUB vs. čestné prohlášení
}

/** Odpověď dodavatele na položku katalogu. */
export interface Answer {
  value?: string | number | boolean;
  evidence?: Evidence;
  /** Dodavatel slíbil nápravu do data → Částečně (jen u Důležitých). */
  fixBy?: string;
  /** Položka se na aplikaci nevztahuje výslovným pravidlem. */
  notApplicable?: string;
  /** Odpověď jen volným textem nebo dokumentem – stroj ji nepřečte. */
  freeText?: boolean;
}

export interface ItemResult {
  item: CatalogItem;
  status: ItemStatus;
  reason: string;
  answer: string;
  evidence?: Evidence;
  waiver?: string;
}

export interface DomainResult {
  domain: Domain;
  verdict: Exclude<Verdict, 'nelze'>;
  items: ItemResult[];
  counts: Record<ItemStatus, number>;
}

export interface MatchResult {
  verdict: Verdict;
  domains: DomainResult[];
  asOf: string;
  dossierVersion?: number;
}

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('cs-CZ');

function answerText(a: Answer | undefined): string {
  if (!a || a.value === undefined) return '—';
  if (a.value === true) return 'Ano';
  if (a.value === false) return 'Ne';
  return String(a.value);
}

/** Vyhodnotí jednu položku. Chybějící, prošlý nebo nečitelný doklad nikdy není Splněno (REQ-MAT-002). */
export function evaluate(item: CatalogItem, a: Answer | undefined, asOf = DEMO_TODAY): Omit<ItemResult, 'item'> {
  const answer = answerText(a);
  if (a?.notApplicable) return { status: 'na', reason: a.notApplicable, answer };
  if (!a || a.value === undefined) return { status: 'missing', reason: 'Dodavatel na položku neodpověděl.', answer };
  const ev = a.evidence;
  if (item.rule.kind === 'review' || a.freeText) {
    return { status: 'review', reason: 'Nelze posoudit automaticky – posoudí člověk.', answer, evidence: ev };
  }
  if (!ev) return { status: 'missing', reason: 'Chybí požadovaný doklad.', answer };
  if (ev.validUntil && ev.validUntil < asOf) {
    return { status: 'expired', reason: `Doklad „${ev.name}“ platil do ${fmtDate(ev.validUntil)}.`, answer, evidence: ev };
  }
  const partial = (why: string): Omit<ItemResult, 'item'> =>
    a.fixBy && item.criticality === 'dulezite'
      ? { status: 'partial', reason: `${why} Dodavatel slíbil nápravu do ${fmtDate(a.fixBy)}.`, answer, evidence: ev }
      : { status: 'gap', reason: why, answer, evidence: ev };

  switch (item.rule.kind) {
    case 'yes':
      return a.value === true ? { status: 'match', reason: 'Splněno, doklad je platný.', answer, evidence: ev } : partial('Odpověď „Ne“.');
    case 'oneOf':
      return item.rule.allowed.includes(String(a.value))
        ? { status: 'match', reason: `„${a.value}“ je mezi povolenými.`, answer, evidence: ev }
        : partial(`Povoleno: ${item.rule.allowed.join(', ')}; uvedeno „${a.value}“.`);
    case 'max': {
      const n = Number(a.value);
      if (typeof a.value === 'boolean' || Number.isNaN(n)) return { status: 'missing', reason: 'Odpověď nelze přečíst.', answer };
      const { limit, unit } = item.rule;
      const why = `Požadováno max. ${limit} ${unit}, uvedeno ${n} ${unit}.`;
      return n <= limit ? { status: 'match', reason: why, answer: `${n} ${unit}`, evidence: ev } : { ...partial(why), answer: `${n} ${unit}` };
    }
    case 'maxAgeMonths': {
      const age = monthsBetween(ev.issued, asOf);
      const why = `Požadováno max. ${item.rule.months} měsíců, doloženo ${age} měsíců (${ev.name.toLowerCase()} ze ${fmtDate(ev.issued)}).`;
      return age <= item.rule.months ? { status: 'match', reason: why, answer, evidence: ev } : partial(why);
    }
  }
}

const emptyCounts = (): Record<ItemStatus, number> => ({ match: 0, partial: 0, gap: 0, missing: 0, expired: 0, review: 0, waived: 0, na: 0 });

/** Verdikt oblasti podle briefu §4.2 (REQ-MAT-003). */
export function domainVerdict(items: { status: ItemStatus; criticality: Criticality }[]): DomainResult['verdict'] {
  const bad = (s: ItemStatus) => s === 'gap' || s === 'missing' || s === 'expired';
  if (items.some((i) => i.criticality === 'blokujici' && bad(i.status))) return 'nesplnuje';
  if (items.some((i) => (i.criticality === 'dulezite' && (i.status === 'gap' || i.status === 'partial')) || i.status === 'review')) return 'vyhrady';
  if (items.some((i) => bad(i.status))) return 'vyhrady';
  return 'splnuje';
}

const rank: Record<Verdict, number> = { splnuje: 0, vyhrady: 1, nesplnuje: 2, nelze: 3 };

/** Porovná profil FN Demo s dossier. Bez dossier → „Nelze posoudit“ (u skutečných aplikací „Dossier se připravuje“). */
export function match(
  answers: Record<string, Answer> | undefined,
  waivers: Record<string, string> = {},
  asOf = DEMO_TODAY,
  /** Profil nemocnice; výchozí je publikovaná verze. Koncept profilu se dosazuje pro náhled dopadu. */
  profile: CatalogItem[] = catalog,
): MatchResult {
  if (!answers) return { verdict: 'nelze', domains: [], asOf };
  const results = profile.map((item) => {
    const r = evaluate(item, answers[item.code], asOf);
    const waiver = waivers[item.code];
    return waiver && (r.status === 'gap' || r.status === 'partial') ? { ...r, item, status: 'waived' as const, waiver } : { ...r, item };
  });
  const doms = domains.map((d) => {
    const items = results.filter((r) => r.item.domain === d);
    const counts = emptyCounts();
    items.forEach((i) => counts[i.status]++);
    return { domain: d, items, counts, verdict: domainVerdict(items.map((i) => ({ status: i.status, criticality: i.item.criticality }))) };
  });
  const verdict = doms.reduce<Verdict>((w, d) => (rank[d.verdict] > rank[w] ? d.verdict : w), 'splnuje');
  return { verdict, domains: doms, asOf };
}

/** Řazení položek: problémy nahoře (REQ-UI-006). */
export const statusOrder: ItemStatus[] = ['gap', 'missing', 'expired', 'partial', 'review', 'waived', 'match', 'na'];
