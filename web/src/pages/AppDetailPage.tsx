import { CircleCheck, Clock, ShieldCheck } from 'lucide-react';
import AppIcon from '../components/AppIcon';
import { PatientName, Row, Trend, severityIcon, severityLabel } from '../components/apps/overviewParts';
import Link from '../components/Link';
import { hospital } from '../data/demo';
import { overviews, rosterOf, type RosterEntry } from '../data/overview';
import { specialtyOf } from '../data/specialties';
import type { StoreApp } from '../data/types';
import { appHref, appTabs, type AppTab } from '../lib/route';

const tabLabels: Record<AppTab, string> = { pacienti: 'Pacienti', workflow: 'Workflow', science: 'Science' };

const tabPlans: Record<Exclude<AppTab, 'pacienti'>, string> = {
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

      {tab !== 'pacienti' ? (
        <div className="empty glass">
          <b>Připravujeme.</b> {tabPlans[tab]}
        </div>
      ) : (
      <div className="app-detail-grid">
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

        <div className="app-detail-side">
          <section className="glass app-panel">
            {w.kind === 'list' ? (
              <div className="ov-list">
                <span className="widget-label">{w.title}</span>
                <ul>
                  {w.rows.map((r) => (
                    <Row key={r.patient + r.detail} row={r} />
                  ))}
                </ul>
              </div>
            ) : (
              <Trend w={w} tint={app.tint} />
            )}
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
          <div className="app-detail-note muted small">
            <ShieldCheck size={15} aria-hidden />
            <span>
              Aplikace běží v prostředí {hospital.short} přes SMART on FHIR. Data pacientů zůstávají v nemocnici.
            </span>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
