// Části souhrnných widgetů aplikací (seznam k řešení, trend, jméno pacienta).
import { AlertCircle, AlertTriangle, CircleDot } from 'lucide-react';
import { patients } from '../../data/demo';
import type { OverviewRow, OverviewWidget } from '../../data/overview';
import { patientHref } from '../../lib/route';
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
