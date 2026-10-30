import type { Audience, StoreApp } from '../../data/types';
import { specialtyOf } from '../../data/specialties';
import { complianceScore, usesAi } from '../../lib/score';
import { audienceLabel } from './StoreCard';

export type MinScore = 0 | 70 | 85 | 95;

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
  category: string | null;
  minScore: MinScore;
  criteria: Set<CriterionId>;
  audience: Set<Audience>;
  regClass: Set<RegClass>;
  aiOnly: boolean;
  topRated: boolean;
}

export const emptyFilters: Filters = {
  category: null,
  minScore: 0,
  criteria: new Set(),
  audience: new Set(),
  regClass: new Set(),
  aiOnly: false,
  topRated: false,
};

export function applyFilters(apps: StoreApp[], f: Filters): StoreApp[] {
  return apps.filter(
    (a) =>
      (!f.category || a.category === f.category) &&
      complianceScore(a).total >= f.minScore &&
      [...f.criteria].every((id) => criteria[id].test(a)) &&
      (f.audience.size === 0 || a.store.audience.some((x) => f.audience.has(x))) &&
      (f.regClass.size === 0 || f.regClass.has(regClassOf(a))) &&
      (!f.aiOnly || usesAi(a)) &&
      (!f.topRated || a.store.rating >= 4.5),
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
    !filters.category && filters.minScore === 0 && filters.criteria.size === 0 && filters.audience.size === 0 && filters.regClass.size === 0 && !filters.aiOnly && !filters.topRated;
  const groups = [...new Set(Object.values(criteria).map((c) => c.group))];

  return (
    <aside className="filters glass">
      <div className="filters-head">
        <b>Filtry</b>
        {!isEmpty && (
          <button className="link" onClick={() => onChange(emptyFilters)}>
            Zrušit vše
          </button>
        )}
      </div>

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
        <h4>Compliance score</h4>
        <div className="segmented small">
          {([0, 70, 85, 95] as MinScore[]).map((v) => (
            <button key={v} className={filters.minScore === v ? 'on' : ''} onClick={() => set({ minScore: v })}>
              {v === 0 ? 'Vše' : `${v}+`}
            </button>
          ))}
        </div>
        <p className="muted tiny">Skóre = nemocnice 35 % + datový prostor 25 % + odborné společnosti 20 % + TheraHUB integrace 20 %.</p>
      </section>

      <section>
        <h4>Kritéria compliance</h4>
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
        <label className="crit">
          <input type="checkbox" checked={filters.aiOnly} onChange={() => set({ aiOnly: !filters.aiOnly })} />
          <span>Využívá AI</span>
          <span className="n">{count(usesAi)}</span>
        </label>
      </section>

      <section>
        <h4>Hodnocení nemocnic</h4>
        <label className="crit">
          <input type="checkbox" checked={filters.topRated} onChange={() => set({ topRated: !filters.topRated })} />
          <span>4,5 hvězdičky a více</span>
          <span className="n">{count((a) => a.store.rating >= 4.5)}</span>
        </label>
      </section>
    </aside>
  );
}
