import { AlertTriangle, CircleCheck, Clock, ShieldCheck } from 'lucide-react';
import AppIcon from '../components/AppIcon';
import { PatientName, Trend, severityIcon, severityLabel } from '../components/apps/overviewParts';
import Link from '../components/Link';
import { hospital } from '../data/demo';
import { overviews, rosterOf, type AppOverview, type RosterEntry } from '../data/overview';
import { specialtyOf } from '../data/specialties';
import type { StoreApp } from '../data/types';
import { appHref, appTabs, type AppTab } from '../lib/route';

const tabLabels: Record<AppTab, string> = { prehled: 'Přehled', pacienti: 'Pacienti', workflow: 'Workflow', science: 'Science' };

const tabPlans: Record<Exclude<AppTab, 'prehled' | 'pacienti'>, string> = {
  workflow: 'Léčebné cesty a postupy nemocnice, do kterých je aplikace zapojená, a kroky, které v nich obstarává.',
  science: 'Výzkumné projekty, které využívají data z této aplikace, a jejich stav.',
};

function Status({ s }: { s: RosterEntry['status'] }) {
  if (s === 'ok')
    return (
      <span className="roster-status sev-ok">
        <CircleCheck size={15} aria-hidden /> V pořádku
      </span>
    );
  const Icon = severityIcon[s];
  return (
    <span className={`roster-status sev-${s}`}>
      <Icon size={15} aria-hidden /> {severityLabel[s]}
    </span>
  );
}

/** Rozpad výsledků jako segmentový pruh s legendou (hodnoty i popisky vždy jako text). */
function Breakdown({ b }: { b: NonNullable<AppOverview['breakdown']> }) {
  const total = b.parts.reduce((n, p) => n + p.value, 0);
  return (
    <div className="breakdown">
      <div className="ov-trend-head">
        <span className="widget-label">{b.title}</span>
        <b className="small">{total} pacientů</b>
      </div>
      <div className="seg-bar" role="img" aria-label={b.parts.map((p) => `${p.label} ${p.value}`).join(', ')}>
        {b.parts.map((p) =>
          p.value > 0 ? <span key={p.label} className={`seg tone-${p.tone}`} style={{ flexGrow: p.value }} title={`${p.label}: ${p.value}`} /> : null,
        )}
      </div>
      <ul className="seg-legend">
        {b.parts.map((p) => (
          <li key={p.label}>
            <i className={`tone-${p.tone}`} />
            <span>{p.label}</span>
            <b>{p.value}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Aplikace otevřená v sekci Aplikace (podzáložka v menu). */
export default function AppDetailPage({ app, tab }: { app: StoreApp; tab: AppTab }) {
  const o = overviews[app.id];
  const spec = specialtyOf(app.category);
  if (!o) return <div className="empty glass">Pro tuto aplikaci zatím není souhrnný přehled.</div>;
  const roster = rosterOf(o);
  const w = o.widget;

  return (
    <div className="page app-detail">
      <header className="patient-header glass">
        <div className="patient-top">
          <AppIcon app={app} size={56} />
          <div className="patient-id">
            <h1>
              {app.name} <span className="birth-number">{app.tagline}</span>
            </h1>
            <span className="store-spec" style={{ color: spec.color, background: `${spec.color}1a` }}>
              {app.category}
            </span>
          </div>
          <div className="app-detail-actions">
            <button className="btn primary" style={{ background: app.tint }}>
              {o.actions[0]}
            </button>
            <button className="btn">{o.actions[1]}</button>
          </div>
        </div>

        <nav className="tabs" aria-label="Záložky aplikace">
          {appTabs.map((id) => (
            <Link key={id} href={appHref(app.id, id)} className={id === tab ? 'tab active' : 'tab'}>
              {tabLabels[id]}
              {id === 'pacienti' && <span className="tab-count">{o.patients}</span>}
            </Link>
          ))}
        </nav>
      </header>

      {tab === 'prehled' ? (
        <div className="app-overview">
          <section className="glass app-panel">
            <span className="widget-label">Statistiky</span>
            <div className="app-stats">
              <div>
                <span className="muted small">Pacienti</span>
                <b>{o.patients}</b>
              </div>
              <div>
                <span className="muted small">Alerty</span>
                <b className={o.alerts > 0 ? 'stat-alert' : undefined}>
                  {o.alerts > 0 && <AlertTriangle size={15} aria-hidden />}
                  {o.alerts}
                </b>
              </div>
              {[o.stat, ...o.extra].map((x) => (
                <div key={x.label}>
                  <span className="muted small">{x.label}</span>
                  <b>{x.value}</b>
                </div>
              ))}
            </div>
          </section>
          <div className="app-overview-row">
            {o.breakdown && (
              <section className="glass app-panel">
                <Breakdown b={o.breakdown} />
              </section>
            )}
            {w.kind === 'trend' && (
              <section className="glass app-panel">
                <Trend w={w} tint={app.tint} />
              </section>
            )}
            <section className="glass app-panel">
              <div className="ov-last">
                <span className="widget-label">Poslední pacient</span>
                <div className="ov-last-row small">
                  <Clock size={13} aria-hidden />
                  <span className="ov-last-text">
                    <PatientName name={o.last.patient} /> <span className="muted">· {o.last.text}</span>
                  </span>
                  <span className="mono muted">{o.last.time}</span>
                </div>
              </div>
            </section>
          </div>
          <div className="app-detail-note muted small">
            <ShieldCheck size={15} aria-hidden />
            <span>
              Aplikace běží v prostředí {hospital.short} přes SMART on FHIR. Data pacientů zůstávají v nemocnici.
            </span>
          </div>
        </div>
      ) : tab === 'pacienti' ? (
        <section className="glass app-panel">
          <h2 className="section-title">
            Pacienti v aplikaci <span className="count">{o.patients}</span>
          </h2>
          <table className="roster">
            <thead>
              <tr>
                <th>Pacient</th>
                <th>Stav</th>
                <th>Poslední událost</th>
                <th className="right">Kdy</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((r) => (
                <tr key={r.patient}>
                  <td>
                    <PatientName name={r.patient} />
                  </td>
                  <td>
                    <Status s={r.status} />
                  </td>
                  <td className="muted">{r.detail}</td>
                  <td className="mono muted right">{r.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="muted small roster-foot">
            Zobrazeno {roster.length} z {o.patients}
          </div>
        </section>
      ) : (
        <div className="empty glass">
          <b>Připravujeme.</b> {tabPlans[tab]}
        </div>
      )}
    </div>
  );
}
