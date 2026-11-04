// Implementace: přehled žádostí o pilotní provoz v nemocnici (brief §9.2, zjednodušeno DEC-019).
// Řádek = aplikace, obor, stav (V pořádku / Čeká / Upozornění) a průběh kroků od primáře po licenci.
import { Check, CircleAlert, CircleCheck, CircleMinus, CirclePause, Kanban, List, ListFilter, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import AppIcon from '../components/AppIcon';
import Link from '../components/Link';
import StateBadge from '../components/trial/StateBadge';
import { domainLabel, domains } from '../data/trial/catalog';
import { dossiers } from '../data/trial/dossiers';
import { departments, progressOf, trialRequests, type DeptId, type RunStatus, type StepRun, type TrialRequest } from '../data/trial/requests';
import { storeApps } from '../data/store';

const appOf = (id: string) => storeApps.find((a) => a.id === id)!;
const vendorOf = (r: TrialRequest) => dossiers[r.appId]?.vendor ?? 'Firma';

/** Souhrnný stav řádku: v pořádku, čeká (na firmu / žadatele), upozornění (po termínu, pozastaveno, zamítnuto). */
type Health = 'ok' | 'waiting' | 'alert' | 'closed';
const healthInfo: Record<Health, { label: string; icon: LucideIcon; tone: string }> = {
  ok: { label: 'V pořádku', icon: CircleCheck, tone: 'match' },
  waiting: { label: 'Čeká', icon: CirclePause, tone: 'partial' },
  alert: { label: 'Upozornění', icon: CircleAlert, tone: 'gap' },
  closed: { label: 'Staženo', icon: CircleMinus, tone: 'na' },
};
export function healthOf(r: TrialRequest): Health {
  if (r.state === 'withdrawn') return 'closed';
  const p = progressOf(r, vendorOf(r));
  if (p.overdue || r.state === 'on_hold' || r.state === 'rejected') return 'alert';
  if (['draft', 'submitted', 'waiting_vendor'].includes(r.state)) return 'waiting';
  return 'ok';
}

/** Stav jednoho bodu průběhu: splněno, probíhá/čeká, nadcházející, zamítnuto, nevztahuje se. */
type Dot = 'done' | 'now' | 'todo' | 'fail' | 'skip';
const dotOf = (run: StepRun | undefined): Dot => {
  const s: RunStatus | undefined = run?.status;
  if (s === 'done') return 'done';
  if (s === 'rejected') return 'fail';
  if (s === 'withdrawn') return 'skip';
  if (s === 'active' || s === 'waiting_vendor' || s === 'on_hold') return 'now';
  return 'todo';
};

interface LineStep {
  label: string;
  dot: Dot;
  sub?: { label: string; dot: Dot }[];
}

interface LineGroup {
  id: Phase;
  label: string;
  steps: LineStep[];
}

/** Fáze implementace (DEC-020): Příprava, Trial (pilotní provoz), Integrace. */
export type Phase = 'priprava' | 'trial' | 'integrace';
export const phaseLabel: Record<Phase, string> = { priprava: 'Příprava', trial: 'Trial', integrace: 'Integrace' };

/** Ve které fázi žádost je. */
export function phaseOf(r: TrialRequest): Phase {
  if (r.state === 'purchased') return 'integrace';
  if (['trial_active', 'evaluating', 'exited'].includes(r.state)) return 'trial';
  return 'priprava';
}

/** Průběh ve třech celcích: Příprava (Primář, Náměstek, Firma, 4 oblasti, Smlouva), Trial (Pilot, KPI, Rozhodnutí), Integrace (Smlouva, Licence). */
function lineup(r: TrialRequest): LineGroup[] {
  const st = r.steps;
  const blockRun = st.posouzeni;
  const sub = domains.map((d) => ({ label: domainLabel[d], dot: dotOf(r.block ? r.block[d] : blockRun) }));
  const blockDot: Dot = sub.some((x) => x.dot === 'fail') ? 'fail' : sub.every((x) => x.dot === 'done') ? 'done' : sub.some((x) => x.dot !== 'todo') ? 'now' : 'todo';
  const end: Dot = r.final === 'odchod' ? 'skip' : dotOf(st.zaver);
  return [
    {
      id: 'priprava',
      label: 'Příprava',
      steps: [
        { label: 'Primář', dot: dotOf(st.primar) },
        { label: 'Náměstek', dot: dotOf(st.namestek) },
        { label: 'Firma', dot: dotOf(st.firma) },
        { label: '4 oblasti', dot: blockDot, sub },
        { label: 'Smlouva', dot: dotOf(st.smlouva) },
      ],
    },
    {
      id: 'trial',
      label: 'Trial',
      steps: [
        { label: 'Pilot', dot: dotOf(st.pilot) },
        { label: 'KPI', dot: dotOf(st.kpi) },
        { label: 'Rozhodnutí', dot: dotOf(st.rozhodnuti) },
      ],
    },
    {
      id: 'integrace',
      label: 'Integrace',
      steps: [
        { label: 'Smlouva', dot: end },
        { label: 'Licence', dot: end },
      ],
    },
  ];
}

const dotLabel: Record<Dot, string> = { done: 'splněno', now: 'probíhá / čeká', todo: 'nadcházející', fail: 'zamítnuto', skip: 'nevztahuje se' };

function Lineup({ r }: { r: TrialRequest }) {
  return (
    <div className="lineup" aria-label="Průběh implementace">
      {lineup(r).map((g) => (
        <div key={g.id} className="ln-group">
          <span className="ln-group-label">{g.label}</span>
          <ol>
            {g.steps.map((s, i) => (
              <li key={i} className={`ln ln-${s.dot}`} title={`${s.label}: ${dotLabel[s.dot]}`}>
                {s.sub && (
                  <span className="ln-sub">
                    {s.sub.map((x) => (
                      <i key={x.label} className={`ln-${x.dot}`} title={`${x.label}: ${dotLabel[x.dot]}`} />
                    ))}
                  </span>
                )}
                <span className="ln-label">{s.label}</span>
                <span className="sr-only">{dotLabel[s.dot]}</span>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

function Health({ r }: { r: TrialRequest }) {
  const { label, icon: Icon, tone } = healthInfo[healthOf(r)];
  return (
    <span className={`st-chip tone-${tone}`}>
      <Icon size={14} aria-hidden /> {label}
    </span>
  );
}

const columns = ['Rozpracováno', 'Předkontrola', 'Primář', 'Náměstek', 'Firma', 'Posouzení 4 oblastí', 'Schváleno k pilotu', 'Smlouva', 'Pilotní provoz', 'Vyhodnocení KPI', 'Uzavřeno'] as const;
function columnOf(r: TrialRequest): (typeof columns)[number] {
  if (r.state === 'draft') return 'Rozpracováno';
  if (r.state === 'submitted') return 'Předkontrola';
  if (r.state === 'approved_for_trial') return 'Schváleno k pilotu';
  if (['purchased', 'exited', 'rejected', 'withdrawn'].includes(r.state)) return 'Uzavřeno';
  const label = progressOf(r, vendorOf(r)).summary;
  return (columns as readonly string[]).includes(label) ? (label as (typeof columns)[number]) : 'Rozpracováno';
}

/** Oddělení přihlášené lékařky v demu – výchozí výběr (DEC-020). */
const myDept: DeptId = 'onko';

export default function TrialRequestsPage() {
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [dept, setDept] = useState<DeptId | 'vse'>(myDept);
  const [phases, setPhases] = useState<Set<Phase>>(new Set());
  const inDept = trialRequests.filter((r) => dept === 'vse' || r.dept === dept);
  const rows = inDept
    .filter((r) => phases.size === 0 || phases.has(phaseOf(r)))
    .sort((a, b) => {
      const rank = { alert: 0, waiting: 1, ok: 2, closed: 3 };
      return rank[healthOf(a)] - rank[healthOf(b)] || (b.submitted ?? b.created).localeCompare(a.submitted ?? a.created);
    });
  const toggle = (ph: Phase) =>
    setPhases((cur) => {
      const n = new Set(cur);
      if (n.has(ph)) n.delete(ph);
      else n.add(ph);
      return n;
    });

  return (
    <div className="store-layout impl-layout">
      <aside className="filters" aria-label="Výběr implementací">
        <label className="impl-dept">
          <span className="filters-sec-label">Oddělení</span>
          <select value={dept} onChange={(e) => setDept(e.target.value as DeptId | 'vse')}>
            {(Object.keys(departments) as DeptId[]).map((d) => (
              <option key={d} value={d}>
                {departments[d].name}
                {d === myDept ? ' (moje)' : ''}
              </option>
            ))}
            <option value="vse">Všechna oddělení</option>
          </select>
        </label>
        <section>
          <div className="filters-head">
            <b className="impl-filters-title">
              <ListFilter size={15} strokeWidth={2} aria-hidden /> Filtry
            </b>
            {phases.size > 0 && (
              <button className="link" onClick={() => setPhases(new Set())}>
                Zrušit
              </button>
            )}
          </div>
          <ul className="spec-list">
            {(Object.keys(phaseLabel) as Phase[]).map((ph) => (
              <li key={ph}>
                <button className={phases.has(ph) ? 'spec active' : 'spec'} onClick={() => toggle(ph)} aria-pressed={phases.has(ph)}>
                  <span className={phases.has(ph) ? 'impl-box on' : 'impl-box'} aria-hidden>
                    {phases.has(ph) && <Check size={12} strokeWidth={3} />}
                  </span>
                  {phaseLabel[ph]}
                  <span className="n">{inDept.filter((r) => phaseOf(r) === ph).length}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </aside>

      <div className="store-main">
      <div className="trq-toolbar">
        <span className="muted small">
          Zobrazeno {rows.length} z {inDept.length}
        </span>
        <span className="segmented icons" role="group" aria-label="Zobrazení">
          <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')} aria-label="Řádky" title="Řádky">
            <List size={16} />
          </button>
          <button className={view === 'kanban' ? 'active' : ''} onClick={() => setView('kanban')} aria-label="Board podle kroku" title="Board podle kroku">
            <Kanban size={16} />
          </button>
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="empty glass">Žádná implementace neodpovídá výběru.</div>
      ) : view === 'list' ? (
        <div className="trq-table-wrap glass">
          <table className="trq-table impl-table">
            <thead>
              <tr>
                <th>Aplikace a obor</th>
                <th>Stav</th>
                <th>Průběh</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const app = appOf(r.appId);
                return (
                  <tr key={r.id}>
                    <td>
                      <Link href={`#/aplikace/zadosti/${r.id}`} className="trq-app">
                        <AppIcon app={app} size={30} />
                        <span>
                          <b className="nowrap">{app.name}</b>
                          <span className="muted small" title={r.id}>
                            {app.category}
                            {dept === 'vse' ? ` · ${departments[r.dept].name}` : ''}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td>
                      <Health r={r} />
                    </td>
                    <td>
                      <Lineup r={r} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="muted small impl-legend">
            <i className="ln-done" /> splněno <i className="ln-now" /> probíhá / čeká <i className="ln-todo" /> nadcházející <i className="ln-fail" /> zamítnuto
          </p>
        </div>
      ) : (
        <div className="trq-kanban">
          {columns.map((c) => {
            const items = rows.filter((r) => columnOf(r) === c);
            return (
              <section key={c} className="kb-col">
                <h3>
                  {c} <span className="muted small">{items.length}</span>
                </h3>
                {items.map((r) => {
                  const app = appOf(r.appId);
                  return (
                    <Link key={r.id} href={`#/aplikace/zadosti/${r.id}`} className="kb-card glass">
                      <span className="kb-card-top">
                        <AppIcon app={app} size={24} />
                        <b>{app.name}</b>
                      </span>
                      <span className="muted small">
                        {app.category} · {departments[r.dept].name}
                      </span>
                      <Health r={r} />
                      <StateBadge state={r.state} />
                    </Link>
                  );
                })}
              </section>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
