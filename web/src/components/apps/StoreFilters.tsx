import { Star } from 'lucide-react';
import type { AiMode, Audience, StoreApp } from '../../data/types';
import { specialtyOf } from '../../data/specialties';
import { complianceScore, departmentEstimate, usesAi } from '../../lib/score';
import { audienceLabel } from './StoreCard';

export type MinScore = 0 | 70 | 85 | 95;
export type Sort = 'score' | 'price' | 'rating';
export type MinRating = 0 | 3 | 3.5 | 4 | 4.5;

export const sortLabel: Record<Sort, string> = { score: 'Index důvěry', price: 'Cena', rating: 'Hodnocení' };

export const aiModeLabel: Record<AiMode, { label: string; hint: string }> = {
  none: { label: 'Bez AI', hint: 'Aplikace AI nepoužívá.' },
  assisted: { label: 'Asistující AI', hint: 'AI upozorňuje a navrhuje, rozhoduje člověk.' },
  guided: { label: 'Vedená AI', hint: 'AI připraví výstup nebo rozhodnutí, člověk ho schválí.' },
  autonomous: { label: 'Autonomní AI', hint: 'AI jedná samostatně, člověk dohlíží.' },
};

export function sortApps(apps: StoreApp[], sort: Sort): StoreApp[] {
  return [...apps].sort((a, b) => {
    if (sort === 'score') return complianceScore(b).total - complianceScore(a).total;
    if (sort === 'price') return departmentEstimate(a).monthly - departmentEstimate(b).monthly;
    return b.store.rating - a.store.rating;
  });
}

export const criteria = {
  legal: { group: 'Vaše nemocnice', label: 'Legal schváleno', test: (a: StoreApp) => a.store.compliance.hospital.legal === 'ok' },
  gdpr: { group: 'Vaše nemocnice', label: 'GDPR schváleno', test: (a: StoreApp) => a.store.compliance.hospital.gdpr === 'ok' },
  security: { group: 'Vaše nemocnice', label: 'Security schváleno', test: (a: StoreApp) => a.store.compliance.hospital.security === 'ok' },
  nis: { group: 'Vaše nemocnice', label: 'Integrace s NIS ≥ 85 %', test: (a: StoreApp) => a.store.compliance.nis >= 85 },
  intersystems: { group: 'Datový prostor', label: 'InterSystems datový prostor', test: (a: StoreApp) => a.store.compliance.intersystems === 'ok' },
  eu: { group: 'Datový prostor', label: 'Evropský datový standard', test: (a: StoreApp) => a.store.compliance.euStandard === 'ok' },
  society: { group: 'Odborné společnosti', label: 'Záštita odborné společnosti', test: (a: StoreApp) => !!a.store.compliance.society },
  ai: { group: 'Odborné společnosti', label: 'Asociace pro AI ČR (u AI)', test: (a: StoreApp) => !usesAi(a) || a.store.compliance.aiAssociation === 'ok' },
  widget: { group: 'TheraHUB integrace', label: 'Widget', test: (a: StoreApp) => a.store.compliance.therahub.widget },
  science: { group: 'TheraHUB integrace', label: 'Science', test: (a: StoreApp) => a.store.compliance.therahub.science },
  workflow: { group: 'TheraHUB integrace', label: 'Workflow', test: (a: StoreApp) => a.store.compliance.therahub.workflow },
} as const;

export type CriterionId = keyof typeof criteria;

export const regClasses = ['Není ZP', 'MDR I', 'MDR IIa', 'MDR IIb'] as const;
export type RegClass = (typeof regClasses)[number];

export function regClassOf(app: StoreApp): RegClass {
  const m = app.store.regulatory.label.match(/MDR (IIb|IIa|I)\b/);
  return m ? (`MDR ${m[1]}` as RegClass) : 'Není ZP';
}

export interface Filters {
  sort: Sort;
  category: string | null;
  minScore: MinScore;
  criteria: Set<CriterionId>;
  audience: Set<Audience>;
  regClass: Set<RegClass>;
  ai: Set<AiMode>;
  minRating: MinRating;
}

export const emptyFilters: Filters = {
  sort: 'score',
  category: null,
  minScore: 0,
  criteria: new Set(),
  audience: new Set(),
  regClass: new Set(),
  ai: new Set(),
  minRating: 0,
};

export function applyFilters(apps: StoreApp[], f: Filters): StoreApp[] {
  return apps.filter(
    (a) =>
      (!f.category || a.category === f.category) &&
      complianceScore(a).total >= f.minScore &&
      [...f.criteria].every((id) => criteria[id].test(a)) &&
      (f.audience.size === 0 || a.store.audience.some((x) => f.audience.has(x))) &&
      (f.regClass.size === 0 || f.regClass.has(regClassOf(a))) &&
      (f.ai.size === 0 || f.ai.has(a.store.ai)) &&
      a.store.rating >= f.minRating,
  );
}

function toggle<T>(set: Set<T>, v: T): Set<T> {
  const next = new Set(set);
  if (next.has(v)) next.delete(v);
  else next.add(v);
  return next;
}

interface Props {
  apps: StoreApp[];
  filters: Filters;
  onChange: (f: Filters) => void;
}

export default function StoreFilters({ apps, filters, onChange }: Props) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  const categories = [...new Set(apps.map((a) => a.category))].sort((a, b) => a.localeCompare(b, 'cs'));
  const count = (test: (a: StoreApp) => boolean) => apps.filter(test).length;
  const isEmpty =
    !filters.category && filters.minScore === 0 && filters.criteria.size === 0 && filters.audience.size === 0 && filters.regClass.size === 0 && filters.ai.size === 0 && filters.minRating === 0;
  const groups = [...new Set(Object.values(criteria).map((c) => c.group))];

  return (
    <aside className="filters glass">
      <div className="filters-head">
        <b>Filtry</b>
        {!isEmpty && (
          <button className="link" onClick={() => onChange({ ...emptyFilters, sort: filters.sort })}>
            Zrušit vše
          </button>
        )}
      </div>

      <section>
        <h4>Seřadit</h4>
        <div className="segmented small">
          {(Object.keys(sortLabel) as Sort[]).map((k) => (
            <button key={k} className={filters.sort === k ? 'on' : ''} onClick={() => set({ sort: k })}>
              {sortLabel[k]}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h4>Specializace</h4>
        <ul className="spec-list">
          <li>
            <button className={filters.category === null ? 'spec active' : 'spec'} onClick={() => set({ category: null })}>
              <span className="spec-dot" style={{ background: 'var(--muted)' }} />
              <span>Všechny specializace</span>
              <span className="n">{apps.length}</span>
            </button>
          </li>
          {categories.map((c) => {
            const sp = specialtyOf(c);
            const Icon = sp.icon;
            return (
              <li key={c}>
                <button className={filters.category === c ? 'spec active' : 'spec'} onClick={() => set({ category: filters.category === c ? null : c })}>
                  <span className="spec-icon" style={{ color: sp.color, background: `${sp.color}18` }}>
                    <Icon size={13} />
                  </span>
                  <span>{c}</span>
                  <span className="n">{count((a) => a.category === c)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h4>Index důvěry</h4>
        <div className="segmented small">
          {([0, 70, 85, 95] as MinScore[]).map((v) => (
            <button key={v} className={filters.minScore === v ? 'on' : ''} onClick={() => set({ minScore: v })}>
              {v === 0 ? 'Vše' : `${v}+`}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h4>Kritéria důvěry</h4>
        {groups.map((g) => (
          <div key={g} className="crit-group">
            <b>{g}</b>
            {(Object.keys(criteria) as CriterionId[])
              .filter((id) => criteria[id].group === g)
              .map((id) => (
                <label key={id} className="crit">
                  <input type="checkbox" checked={filters.criteria.has(id)} onChange={() => set({ criteria: toggle(filters.criteria, id) })} />
                  <span>{criteria[id].label}</span>
                  <span className="n">{count(criteria[id].test)}</span>
                </label>
              ))}
          </div>
        ))}
      </section>

      <section>
        <h4>Agenda – pro koho</h4>
        <div className="chip-row">
          {(Object.keys(audienceLabel) as Audience[]).map((a) => (
            <button key={a} className={filters.audience.has(a) ? 'fchip on' : 'fchip'} onClick={() => set({ audience: toggle(filters.audience, a) })}>
              {audienceLabel[a]}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h4>Klasifikace</h4>
        <div className="chip-row">
          {regClasses.map((r) => (
            <button key={r} className={filters.regClass.has(r) ? 'fchip on' : 'fchip'} onClick={() => set({ regClass: toggle(filters.regClass, r) })}>
              {r}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h4>Využití AI</h4>
        <div className="ai-modes">
          {(Object.keys(aiModeLabel) as AiMode[]).map((m) => (
            <label key={m} className={filters.ai.has(m) ? 'ai-mode on' : 'ai-mode'}>
              <input type="checkbox" checked={filters.ai.has(m)} onChange={() => set({ ai: toggle(filters.ai, m) })} />
              <span className="ai-mode-text">
                <b>{aiModeLabel[m].label}</b>
                <small>{aiModeLabel[m].hint}</small>
              </span>
              <span className="n">{count((a) => a.store.ai === m)}</span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h4>Hodnocení nemocnic</h4>
        <div className="stars-scale" role="group" aria-label="Minimální hodnocení">
          {([0, 3, 3.5, 4, 4.5] as MinRating[]).map((r) => (
            <button key={r} className={filters.minRating === r ? 'star-step on' : 'star-step'} onClick={() => set({ minRating: r })}>
              {r === 0 ? (
                'Vše'
              ) : (
                <>
                  <Star size={12} fill="currentColor" /> {r.toLocaleString('cs-CZ')}+
                </>
              )}
              <small>{count((a) => a.store.rating >= r)}</small>
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}
