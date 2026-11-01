import { AlertCircle, AlertTriangle, CircleDot, Clock, MoreHorizontal } from 'lucide-react';
import { patients } from '../../data/demo';
import type { AppOverview, OverviewRow, OverviewWidget } from '../../data/overview';
import type { CatalogApp } from '../../data/types';
import { appHref, patientHref } from '../../lib/route';
import AppIcon from '../AppIcon';
import Link from '../Link';

export const num = (v: number) => v.toLocaleString('cs-CZ');
const fmt = (unit: string, v: number) => unit.replace('{v}', num(v));

/** Jméno pacienta; u pacientů z demo dat vede rovnou do jeho karty. */
export function PatientName({ name }: { name: string }) {
  const p = patients.find((x) => x.name === name);
  return p ? (
    <Link href={patientHref(p.id)} className="ov-patient">
      {name}
    </Link>
  ) : (
    <span className="ov-patient">{name}</span>
  );
}

export const severityIcon = { critical: AlertTriangle, warning: AlertCircle, info: CircleDot };
export const severityLabel = { critical: 'Závažné', warning: 'Upozornění', info: 'Informace' };

export function Row({ row }: { row: OverviewRow }) {
  const Icon = severityIcon[row.severity];
  return (
    <li className={`ov-row sev-${row.severity}`}>
      <Icon size={15} aria-label={severityLabel[row.severity]} />
      <span className="ov-row-main">
        <PatientName name={row.patient} />
        <span className="muted">{row.detail}</span>
      </span>
      <span className="mono muted ov-meta">{row.meta}</span>
    </li>
  );
}

export function Trend({ w, tint }: { w: Extract<OverviewWidget, { kind: 'trend' }>; tint: string }) {
  const max = Math.max(...w.values);
  const last = w.values[w.values.length - 1];
  return (
    <div className="ov-trend">
      <div className="ov-trend-head">
        <span className="widget-label">{w.title}</span>
        <span className="ov-trend-now">
          <b>{w.headline ?? fmt(w.unit, last)}</b>
          {w.note && <span className="muted small">{w.note}</span>}
        </span>
      </div>
      <div className="ov-bars" role="img" aria-label={`${w.title}: ${w.labels.map((l, i) => `${l} ${fmt(w.unit, w.values[i])}`).join(', ')}`}>
        {w.values.map((v, i) => (
          <div key={w.labels[i]} className="ov-col" data-tip={`${w.labels[i]}: ${fmt(w.unit, v)}`}>
            <span className="ov-bar-track">
              <span
                className="ov-bar"
                style={{ height: `${Math.max(4, (v / max) * 100)}%`, background: i === w.values.length - 1 ? tint : undefined }}
              />
            </span>
            <span className="ov-bar-label">{w.labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OverviewCard({ app, o }: { app: CatalogApp; o: AppOverview }) {
  const w = o.widget;
  return (
    <article className="app-card glass">
      <header className="app-card-head">
        <Link href={appHref(app.id)} className="app-card-open">
          <AppIcon app={app} />
          <div>
            <h3>{app.name}</h3>
            <div className="muted small">{app.tagline}</div>
          </div>
        </Link>
        <button className="btn ghost icon" aria-label="Další volby">
          <MoreHorizontal size={18} />
        </button>
      </header>

      <div className="app-card-body">
        <div className="metrics ov-kpis">
          <div>
            <span className="muted small">Pacienti</span>
            <b>{num(o.patients)}</b>
          </div>
          <div>
            <span className="muted small">Alerty</span>
            <b className={o.alerts > 0 ? 'ov-alerts on' : 'ov-alerts'}>
              {o.alerts > 0 && <AlertTriangle size={15} aria-hidden />}
              {o.alerts}
            </b>
          </div>
          <div>
            <span className="muted small">{o.stat.label}</span>
            <b>{o.stat.value}</b>
          </div>
        </div>

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
      </div>

      <footer className="app-card-actions">
        <Link href={appHref(app.id)} className="btn primary" style={{ background: app.tint }}>
          Otevřít
        </Link>
        <button className="btn">{o.actions[1]}</button>
      </footer>
    </article>
  );
}
