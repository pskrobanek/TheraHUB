// Přehled Žádostí o pilotní provoz (brief §9.2, REQ-TRL-002).
import { Kanban, List } from 'lucide-react';
import { useMemo, useState } from 'react';
import AppIcon from '../components/AppIcon';
import Link from '../components/Link';
import StateBadge from '../components/trial/StateBadge';
import { VerdictBadge } from '../components/trial/Status';
import { domainLabel, domains, type Domain } from '../data/trial/catalog';
import { workdaysLabel } from '../data/trial/dates';
import { dossiers } from '../data/trial/dossiers';
import { match } from '../data/trial/match';
import { departments, progressOf, staff, stateLabel, totalDays, trialRequests, type DeptId, type TrialRequest, type TrialState } from '../data/trial/requests';
import { storeApps } from '../data/store';

interface Persona {
  id: string;
  name: string;
  label: string;
  /** Rozsah záložky Všechny žádosti: celá nemocnice, jedno oddělení, nebo žádný. */
  all: 'hospital' | DeptId | null;
}

/** Přepínač pohledu jen pro demo (DEC-012). */
export const personas: Persona[] = [
  { id: 'zadatel', name: departments.onko.requester.name, label: 'žadatelka, Onkologická klinika', all: null },
  { id: 'primar', name: departments.onko.head.name, label: 'primář Onkologické kliniky', all: 'onko' },
  { id: 'namestek', name: staff.namestek.name, label: 'náměstkyně pro LPP', all: 'hospital' },
  { id: 'pravnik', name: staff.pravnik.name, label: 'právní oddělení (Legal)', all: null },
  { id: 'dpo', name: staff.dpo.name, label: 'pověřenec (GDPR)', all: null },
  { id: 'kb', name: staff.kb.name, label: 'kybernetická bezpečnost (Security)', all: null },
  { id: 'it', name: staff.it.name, label: 'IT a integrace (Ostatní)', all: null },
];

type Tab = 'moje' | 'kontrola' | 'vse';
const appOf = (id: string) => storeApps.find((a) => a.id === id)!;
const vendorOf = (r: TrialRequest) => dossiers[r.appId]?.vendor ?? 'Firma';

/** Sloupce kanbanu podle kroku (§9.2). */
const columns = ['Rozpracováno', 'Předkontrola', 'Primář', 'Náměstek', 'Firma', 'Posouzení 4 oblastí', 'Schváleno k pilotu', 'Smlouva', 'Pilotní provoz', 'Vyhodnocení KPI', 'Uzavřeno'] as const;
function columnOf(r: TrialRequest): (typeof columns)[number] {
  if (r.state === 'draft') return 'Rozpracováno';
  if (r.state === 'submitted') return 'Předkontrola';
  if (r.state === 'approved_for_trial') return 'Schváleno k pilotu';
  if (['purchased', 'exited', 'rejected', 'withdrawn'].includes(r.state)) return 'Uzavřeno';
  const p = progressOf(r, vendorOf(r));
  const label = p.summary;
  return (columns as readonly string[]).includes(label) ? (label as (typeof columns)[number]) : 'Rozpracováno';
}

/** Je otevřené posouzení dané oblasti? (filtr Oblast) */
const domainOpen = (r: TrialRequest, d: Domain) => {
  const b = r.block?.[d];
  return !!b && (b.status === 'active' || b.status === 'waiting_vendor');
};

export default function TrialRequestsPage() {
  const [personaId, setPersonaId] = useState('zadatel');
  const persona = personas.find((p) => p.id === personaId)!;
  const [tab, setTab] = useState<Tab>('moje');
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [fState, setFState] = useState<TrialState | ''>('');
  const [fDept, setFDept] = useState<DeptId | ''>('');
  const [fDomain, setFDomain] = useState<Domain | ''>('');
  const [fOverdue, setFOverdue] = useState(false);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'moje', label: 'Moje žádosti' },
    { id: 'kontrola', label: 'Ke kontrole' },
    ...(persona.all ? [{ id: 'vse' as Tab, label: persona.all === 'hospital' ? 'Všechny žádosti nemocnice' : `Všechny žádosti – ${departments[persona.all].name}` }] : []),
  ];
  const activeTab = tabs.some((t) => t.id === tab) ? tab : 'moje';

  const rows = useMemo(() => {
    const base = trialRequests.filter((r) => {
      const p = progressOf(r, vendorOf(r));
      if (activeTab === 'moje') return departments[r.dept].requester.name === persona.name;
      if (activeTab === 'kontrola') return p.holders.some((h) => h.name === persona.name);
      return persona.all === 'hospital' || r.dept === persona.all;
    });
    return base
      .filter((r) => !fState || r.state === fState)
      .filter((r) => !fDept || r.dept === fDept)
      .filter((r) => !fDomain || domainOpen(r, fDomain))
      .filter((r) => !fOverdue || progressOf(r, vendorOf(r)).overdue)
      .sort((a, b) => Number(progressOf(b, vendorOf(b)).overdue) - Number(progressOf(a, vendorOf(a)).overdue) || (b.submitted ?? b.created).localeCompare(a.submitted ?? a.created));
  }, [activeTab, persona, fState, fDept, fDomain, fOverdue]);

  return (
    <div className="trq">
      <div className="trq-bar">
        <label className="persona">
          <span className="muted small">Zobrazit jako</span>
          <select value={personaId} onChange={(e) => setPersonaId(e.target.value)}>
            {personas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} – {p.label}
              </option>
            ))}
          </select>
        </label>
        <span className="muted small">Ukázka role bez přihlášení; ve Fázi 2 nahradí skutečné přihlášení.</span>
      </div>

      <div className="trq-toolbar">
        <nav className="segmented" aria-label="Záložky žádostí">
          {tabs.map((t) => (
            <button key={t.id} className={t.id === activeTab ? 'active' : ''} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="trq-filters">
          <select value={fState} onChange={(e) => setFState(e.target.value as TrialState | '')} aria-label="Stav">
            <option value="">Všechny stavy</option>
            {(Object.keys(stateLabel) as TrialState[]).map((s) => (
              <option key={s} value={s}>
                {stateLabel[s]}
              </option>
            ))}
          </select>
          <select value={fDept} onChange={(e) => setFDept(e.target.value as DeptId | '')} aria-label="Oddělení">
            <option value="">Všechna oddělení</option>
            {(Object.keys(departments) as DeptId[]).map((d) => (
              <option key={d} value={d}>
                {departments[d].name}
              </option>
            ))}
          </select>
          <select value={fDomain} onChange={(e) => setFDomain(e.target.value as Domain | '')} aria-label="Otevřená oblast">
            <option value="">Všechny oblasti</option>
            {domains.map((d) => (
              <option key={d} value={d}>
                Otevřená: {domainLabel[d]}
              </option>
            ))}
          </select>
          <label className="trq-check">
            <input type="checkbox" checked={fOverdue} onChange={(e) => setFOverdue(e.target.checked)} /> Jen po termínu
          </label>
          <span className="segmented icons" role="group" aria-label="Zobrazení">
            <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')} aria-label="Seznam" title="Seznam">
              <List size={16} />
            </button>
            <button className={view === 'kanban' ? 'active' : ''} onClick={() => setView('kanban')} aria-label="Kanban podle kroku" title="Kanban podle kroku">
              <Kanban size={16} />
            </button>
          </span>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="empty glass">
          {activeTab === 'kontrola' ? `${persona.name} teď nemá nic ke kontrole.` : 'Žádná žádost neodpovídá filtru.'}
        </div>
      ) : view === 'list' ? (
        <div className="trq-table-wrap glass">
          <table className="trq-table">
            <thead>
              <tr>
                <th>Aplikace</th>
                <th>Žadatel</th>
                <th>Oddělení</th>
                <th>Podáno</th>
                <th>Aktuální krok</th>
                <th>Kdo ji má</th>
                <th>Čeká (prac. dny)</th>
                <th>Celkem (prac. dny)</th>
                <th>Shoda (při podání)</th>
                <th>Stav</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const app = appOf(r.appId);
                const p = progressOf(r, vendorOf(r));
                const verdict = match(dossiers[r.appId]?.answers, r.waivers ?? {}, r.snapshotAt).verdict;
                return (
                  <tr key={r.id}>
                    <td>
                      <Link href={`#/aplikace/zadosti/${r.id}`} className="trq-app">
                        <AppIcon app={app} size={28} />
                        <span>
                          <b className="nowrap">{app.name}</b>
                          <span className="mono muted small">{r.id}</span>
                        </span>
                      </Link>
                    </td>
                    <td>{departments[r.dept].requester.name}</td>
                    <td>{departments[r.dept].name}</td>
                    <td className="nowrap">{r.submitted ? new Date(r.submitted).toLocaleDateString('cs-CZ') : '—'}</td>
                    <td>{p.summary}</td>
                    <td title={p.holders.map((h) => h.name).join(', ')}>
                      {p.holders.length ? (
                        <>
                          {p.holders[0].name}
                          {p.holders.length > 1 && <span className="muted"> +{p.holders.length - 1}</span>}
                        </>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td className={p.overdue ? 'overdue nowrap' : 'nowrap'}>
                      {p.paused ? <span className="muted">SLA stojí</span> : p.holders.length ? p.waiting : '—'}
                      {p.overdue && <span className="overdue-tag">po termínu</span>}
                    </td>
                    <td className="nowrap">{r.submitted ? totalDays(r) : '—'}</td>
                    <td>{r.submitted ? <VerdictBadge verdict={verdict} size="sm" /> : <span className="muted">—</span>}</td>
                    <td>
                      <StateBadge state={r.state} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
                  const p = progressOf(r, vendorOf(r));
                  return (
                    <Link key={r.id} href={`#/aplikace/zadosti/${r.id}`} className="kb-card glass">
                      <span className="kb-card-top">
                        <AppIcon app={app} size={24} />
                        <b>{app.name}</b>
                      </span>
                      <span className="muted small">{departments[r.dept].name}</span>
                      <StateBadge state={r.state} />
                      {p.holders.length > 0 && <span className="small">má {p.holders.map((h) => h.name).join(', ')}</span>}
                      {p.overdue && <span className="overdue-tag">po termínu · {workdaysLabel(p.waiting)}</span>}
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
