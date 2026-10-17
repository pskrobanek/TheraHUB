import { useMemo, useState } from 'react';
import AppDetail from '../components/AppDetail';
import { ReadinessBadge, StatusBadge } from '../components/Badges';
import { activeApps } from '../data/mockApps';
import type { AppStatus } from '../data/types';
import { deriveAlerts } from '../lib/alerts';
import { formatCzk, formatDate } from '../lib/dates';
import { hostingLabel, statusLabel } from '../lib/labels';

type StatusFilter = AppStatus | 'vse';

export default function Dashboard() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('vse');
  const [department, setDepartment] = useState('vse');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const departments = useMemo(() => [...new Set(activeApps.flatMap((a) => a.departments))].sort(), []);
  const alerts = useMemo(() => deriveAlerts(activeApps), []);

  const counts = {
    produkce: activeApps.filter((a) => a.status === 'produkce').length,
    pilot: activeApps.filter((a) => a.status === 'pilot').length,
    sandbox: activeApps.filter((a) => a.status === 'sandbox').length,
  };
  const annualCost = activeApps.reduce((sum, a) => sum + (a.contract.annualCostCzk ?? 0), 0);

  const q = query.trim().toLowerCase();
  const visible = activeApps.filter(
    (a) =>
      (statusFilter === 'vse' || a.status === statusFilter) &&
      (department === 'vse' || a.departments.includes(department)) &&
      (!q || `${a.name} ${a.vendor} ${a.category}`.toLowerCase().includes(q)),
  );
  const selected = activeApps.find((a) => a.id === selectedId) ?? null;

  return (
    <div className="dashboard">
      <header className="page-header">
        <h1>Dashboard</h1>
        <p className="muted">Aplikace, které má nemocnice aktivní, a co vyžaduje pozornost.</p>
      </header>

      <section className="stats">
        <Stat label="V produkci" value={counts.produkce} />
        <Stat label="V pilotu" value={counts.pilot} />
        <Stat label="V sandboxu" value={counts.sandbox} />
        <Stat label="Roční náklady" value={formatCzk(annualCost)} />
        <Stat label="Upozornění" value={alerts.length} tone={alerts.length ? 'warn' : undefined} />
      </section>

      {alerts.length > 0 && (
        <section className="card">
          <h2>Vyžaduje pozornost</h2>
          <ul className="alerts">
            {alerts.map((al, i) => (
              <li key={i} className={`alert alert-${al.severity}`}>
                <button className="link" onClick={() => setSelectedId(al.appId)}>
                  {al.text}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card">
        <div className="toolbar">
          <h2>Aktivní aplikace</h2>
          <div className="filters">
            <div className="segmented" role="group" aria-label="Stav">
              {(['vse', 'produkce', 'pilot', 'sandbox'] as const).map((s) => (
                <button key={s} className={statusFilter === s ? 'on' : ''} onClick={() => setStatusFilter(s)}>
                  {s === 'vse' ? 'Vše' : statusLabel[s]}
                </button>
              ))}
            </div>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} aria-label="Oddělení">
              <option value="vse">Všechna oddělení</option>
              {departments.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <input type="search" placeholder="Hledat…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Aplikace</th>
                <th>Stav</th>
                <th>Oddělení</th>
                <th>Readiness (NIS)</th>
                <th>Hosting</th>
                <th>Smlouva do</th>
                <th className="num">Uživatelé</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((a) => (
                <tr key={a.id} onClick={() => setSelectedId(a.id)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSelectedId(a.id)}>
                  <td>
                    <div className="app-name">{a.name}</div>
                    <div className="muted small">
                      {a.vendor} · {a.category}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                  <td>{a.departments.join(', ')}</td>
                  <td>
                    <ReadinessBadge readiness={a.readiness} />
                  </td>
                  <td>{hostingLabel[a.hosting]}</td>
                  <td>{a.contract.validUntil ? formatDate(a.contract.validUntil) : '—'}</td>
                  <td className="num">{a.usage.activeUsers}</td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={7} className="muted empty">
                    Žádná aplikace neodpovídá filtru.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selected && <AppDetail app={selected} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: 'warn' }) {
  return (
    <div className={tone ? `stat stat-${tone}` : 'stat'}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
