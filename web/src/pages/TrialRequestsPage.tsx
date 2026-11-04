// Implementace: přehled žádostí o pilotní provoz v nemocnici (brief §9.2, zjednodušeno DEC-019).
// Řádek = aplikace, obor, stav (V pořádku / Čeká / Upozornění) a průběh kroků od primáře po licenci.
import { Building2, Check, ChevronDown, CircleAlert, CircleCheck, CircleMinus, Clock, Kanban, List, ListFilter, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import AppIcon from '../components/AppIcon';
import Link from '../components/Link';
import StateBadge from '../components/trial/StateBadge';
import { domainLabel, domains } from '../data/trial/catalog';
import { dossiers } from '../data/trial/dossiers';
import { departments, progressOf, trialRequests, type DeptId, type RunStatus, type StepRun, type TrialRequest } from '../data/trial/requests';
import { storeApps } from '../data/store';

const appOf = (id: string) => storeApps.find((a) => a.id === id)!;
const vendorOf = (r: TrialRequest) => dossiers[r.appId]?.vendor ?? 'Firma';

/** Souhrnný stav řádku: v pořádku, čeká (na firmu / žadatele, pozastaveno – SLA stojí), upozornění (po termínu, zamítnuto). */
type Health = 'ok' | 'waiting' | 'alert' | 'closed';
const healthInfo: Record<Health, { label: string; icon: LucideIcon; tone: string }> = {
  ok: { label: 'V pořádku', icon: CircleCheck, tone: 'match' },
  waiting: { label: 'Čeká', icon: Clock, tone: 'wait' },
  alert: { label: 'Upozornění', icon: CircleAlert, tone: 'gap' },
  closed: { label: 'Staženo', icon: CircleMinus, tone: 'na' },
};
export function healthOf(r: TrialRequest): Health {
  if (r.state === 'withdrawn') return 'closed';
  const p = progressOf(r, vendorOf(r));
  if (p.overdue || r.state === 'rejected') return 'alert';
  if (['draft', 'submitted', 'waiting_vendor', 'on_hold'].includes(r.state)) return 'waiting';
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

/** Kroky jedné fáze v buňce tabulky (název fáze je v záhlaví sloupce). */
function PhaseSteps({ g }: { g: LineGroup }) {
  return (
    <ol className="ln-steps" aria-label={g.label}>
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

type DeptValue = DeptId | 'vse';
const deptOptions: { value: DeptValue; label: string }[] = [
  ...(Object.keys(departments) as DeptId[]).map((d) => ({ value: d, label: departments[d].name })),
  { value: 'vse', label: 'Všechna oddělení' },
];

/** Vlastní rozbalovací výběr oddělení (listbox; myš i klávesnice: šipky, Enter, Esc). */
function DeptSelect({ value, onChange }: { value: DeptValue; onChange: (v: DeptValue) => void }) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const current = deptOptions.find((o) => o.value === value)!;
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  const pick = (v: DeptValue) => {
    onChange(v);
    setOpen(false);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') return setOpen(false);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setHi(deptOptions.indexOf(current));
        return;
      }
      setHi((h) => (h + (e.key === 'ArrowDown' ? 1 : deptOptions.length - 1)) % deptOptions.length);
    }
    if ((e.key === 'Enter' || e.key === ' ') && open) {
      e.preventDefault();
      pick(deptOptions[hi].value);
    }
  };
  return (
    <div className={open ? 'dsel open' : 'dsel'} ref={ref} onKeyDown={onKey}>
      <button
        type="button"
        className="dsel-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Oddělení: ${current.label}`}
        onClick={() => {
          setOpen((o) => !o);
          setHi(deptOptions.indexOf(current));
        }}
      >
        <Building2 size={15} aria-hidden />
        <span>{current.label}</span>
        <ChevronDown size={15} className="dsel-chev" aria-hidden />
      </button>
      {open && (
        <ul className="dsel-list" role="listbox" aria-label="Oddělení">
          {deptOptions.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              className={(i === hi ? 'hi ' : '') + (o.value === value ? 'sel' : '')}
              onMouseEnter={() => setHi(i)}
              onClick={() => pick(o.value)}
            >
              <span>{o.label}</span>
              {o.value === value && <Check size={14} strokeWidth={2.5} aria-hidden />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function TrialRequestsPage() {
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [dept, setDept] = useState<DeptId | 'vse'>(myDept);
  const [phases, setPhases] = useState<Set<Phase>>(new Set());
  const [healths, setHealths] = useState<Set<Health>>(new Set());
  const inDept = trialRequests.filter((r) => dept === 'vse' || r.dept === dept);
  const rows = inDept
    .filter((r) => phases.size === 0 || phases.has(phaseOf(r)))
    .filter((r) => healths.size === 0 || healths.has(healthOf(r)))
    .sort((a, b) => {
      const rank = { alert: 0, waiting: 1, ok: 2, closed: 3 };
      return rank[healthOf(a)] - rank[healthOf(b)] || (b.submitted ?? b.created).localeCompare(a.submitted ?? a.created);
    });
  const flip = <T,>(cur: Set<T>, v: T) => {
    const n = new Set(cur);
    if (n.has(v)) n.delete(v);
    else n.add(v);
    return n;
  };
  const toggle = (ph: Phase) => setPhases((cur) => flip(cur, ph));
  const toggleHealth = (h: Health) => setHealths((cur) => flip(cur, h));

  return (
    <div className="store-layout impl-layout">
      <aside className="filters" aria-label="Filtry implementací">
        <div className="filters-head">
          <span className="fh-tab on" title="Filtry" aria-label="Filtry">
            <ListFilter size={15} strokeWidth={2} aria-hidden />
          </span>
          {(phases.size > 0 || healths.size > 0 || dept !== myDept) && (
            <button
              className="link"
              onClick={() => {
                setPhases(new Set());
                setHealths(new Set());
                setDept(myDept);
              }}
            >
              Zrušit vše
            </button>
          )}
        </div>

        <section>
          <h4>Oddělení</h4>
          <DeptSelect value={dept} onChange={setDept} />
        </section>

        <section>
          <h4>Fáze</h4>
          <ul className="spec-list">
            {(Object.keys(phaseLabel) as Phase[]).map((ph) => (
              <li key={ph}>
                <button className={phases.has(ph) ? 'spec active' : 'spec'} onClick={() => toggle(ph)} aria-pressed={phases.has(ph)}>
                  <span className={phases.has(ph) ? 'impl-box on' : 'impl-box'} aria-hidden>
                    {phases.has(ph) && <Check size={12} strokeWidth={3} />}
                  </span>
                  {phaseLabel[ph]}
                  <span className="n">{inDept.filter((r) => healths.size === 0 || healths.has(healthOf(r))).filter((r) => phaseOf(r) === ph).length}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h4>Stav</h4>
          <ul className="spec-list">
            {(Object.keys(healthInfo) as Health[]).map((h) => {
              const { label, icon: Icon, tone } = healthInfo[h];
              return (
                <li key={h}>
                  <button className={healths.has(h) ? 'spec active' : 'spec'} onClick={() => toggleHealth(h)} aria-pressed={healths.has(h)}>
                    <span className={healths.has(h) ? 'impl-box on' : 'impl-box'} aria-hidden>
                      {healths.has(h) && <Check size={12} strokeWidth={3} />}
                    </span>
                    <span className={`impl-health tone-${tone}`}>
                      <Icon size={14} aria-hidden />
                    </span>
                    {label}
                    <span className="n">{inDept.filter((r) => phases.size === 0 || phases.has(phaseOf(r))).filter((r) => healthOf(r) === h).length}</span>
                  </button>
                </li>
              );
            })}
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
                <th>Aplikace a oddělení</th>
                <th>Stav</th>
                {(Object.keys(phaseLabel) as Phase[]).map((ph) => (
                  <th key={ph} className="impl-phase-th">
                    {phaseLabel[ph]}
                  </th>
                ))}
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
                            {departments[r.dept].name}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td>
                      <Health r={r} />
                    </td>
                    {lineup(r).map((g) => (
                      <td key={g.id} className="impl-phase-td">
                        <PhaseSteps g={g} />
                      </td>
                    ))}
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
                        {departments[r.dept].name}
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
