// Implementace: přehled žádostí o pilotní provoz v nemocnici (brief §9.2, zjednodušeno DEC-019).
// Řádek = aplikace, obor, stav (V pořádku / Čeká / Upozornění) a průběh kroků od primáře po licenci.
import { CircleAlert, CircleCheck, CircleMinus, CirclePause, Kanban, List, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import AppIcon from '../components/AppIcon';
import Link from '../components/Link';
import StateBadge from '../components/trial/StateBadge';
import { domainLabel, domains } from '../data/trial/catalog';
import { dossiers } from '../data/trial/dossiers';
import { departments, progressOf, trialRequests, type RunStatus, type StepRun, type TrialRequest } from '../data/trial/requests';
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

/** Průběh: Primář, Náměstek, 4 oblasti, Smlouva, Pilot, KPI, Vyhodnocení, Smlouva, Licence. */
function lineup(r: TrialRequest): LineStep[] {
  const st = r.steps;
  const blockDots = domains.map((d) => ({ label: domainLabel[d], dot: dotOf(r.block?.[d]) }));
  // Posouzení bez rozepsaných oblastí (např. ještě nezačalo) bere stav bloku.
  const blockRun = st.posouzeni;
  const sub = r.block ? blockDots : domains.map((d) => ({ label: domainLabel[d], dot: dotOf(blockRun) }));
  const blockDot: Dot = sub.some((x) => x.dot === 'fail') ? 'fail' : sub.every((x) => x.dot === 'done') ? 'done' : sub.some((x) => x.dot !== 'todo') ? 'now' : 'todo';
  const end: Dot = r.final === 'odchod' ? 'skip' : dotOf(st.zaver);
  return [
    { label: 'Primář', dot: dotOf(st.primar) },
    { label: 'Náměstek', dot: dotOf(st.namestek) },
    { label: '4 oblasti', dot: blockDot, sub },
    { label: 'Smlouva', dot: dotOf(st.smlouva) },
    { label: 'Pilot', dot: dotOf(st.pilot) },
    { label: 'KPI', dot: dotOf(st.kpi) },
    { label: 'Vyhodnocení', dot: dotOf(st.rozhodnuti) },
    { label: 'Smlouva', dot: end },
    { label: 'Licence', dot: end },
  ];
}

const dotLabel: Record<Dot, string> = { done: 'splněno', now: 'probíhá / čeká', todo: 'nadcházející', fail: 'zamítnuto', skip: 'nevztahuje se' };

function Lineup({ r }: { r: TrialRequest }) {
  return (
    <ol className="lineup" aria-label="Průběh implementace">
      {lineup(r).map((s, i) => (
        <li key={i} className={`ln ln-${s.dot}`} title={`${s.label}: ${dotLabel[s.dot]}`}>
          {s.sub ? (
            <span className="ln-sub">
              {s.sub.map((x) => (
                <i key={x.label} className={`ln-${x.dot}`} title={`${x.label}: ${dotLabel[x.dot]}`} />
              ))}
            </span>
          ) : null}
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

export default function TrialRequestsPage() {
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [fOverdue, setFOverdue] = useState(false);
  const rows = trialRequests
    .filter((r) => !fOverdue || progressOf(r, vendorOf(r)).overdue)
    .sort((a, b) => {
      const rank = { alert: 0, waiting: 1, ok: 2, closed: 3 };
      return rank[healthOf(a)] - rank[healthOf(b)] || (b.submitted ?? b.created).localeCompare(a.submitted ?? a.created);
    });

  return (
    <div className="trq">
      <div className="trq-toolbar">
        <label className="trq-check">
          <input type="checkbox" checked={fOverdue} onChange={(e) => setFOverdue(e.target.checked)} /> Jen po termínu
        </label>
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
        <div className="empty glass">Žádná implementace není po termínu.</div>
      ) : view === 'list' ? (
        <div className="trq-table-wrap glass">
          <table className="trq-table impl-table">
            <thead>
              <tr>
                <th>Aplikace</th>
                <th>Obor</th>
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
                          <span className="muted small">
                            {departments[r.dept].name} · {r.id}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td>{app.category}</td>
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
  );
}
