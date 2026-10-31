import { ChevronDown, CircleCheck, CircleDashed, CircleX, Hospital, Star } from 'lucide-react';
import { useState } from 'react';
import type { Audience, StoreApp } from '../../data/types';
import { adoptionIndex, levelFor, type ScoreCheck } from '../../lib/score';
import AppIcon from '../AppIcon';

export const audienceLabel: Record<Audience, string> = {
  pacient: 'Pacient',
  lekar: 'Lékař',
  sestra: 'Sestra',
  admin: 'Administrativa',
  vyzkumnik: 'Výzkumník',
};

function Bar({ pct, thin = false }: { pct: number; thin?: boolean }) {
  return (
    <span className={thin ? 'bar thin' : 'bar'} aria-hidden>
      <span className={`bar-fill fill-${levelFor(pct)}`} style={{ width: `${pct}%` }} />
    </span>
  );
}

/** Pět hvězd, vybarvených podle hodnocení (i zlomkově, např. 4,6). */
function Stars({ value }: { value: number }) {
  const row = () => Array.from({ length: 5 }, (_, i) => <Star key={i} size={13} fill="currentColor" strokeWidth={0} />);
  return (
    <span className="stars" role="img" aria-label={`Hodnocení ${value.toLocaleString('cs-CZ')} z 5`}>
      <span className="stars-base">{row()}</span>
      <span className="stars-fill" style={{ width: `${(value / 5) * 100}%` }}>
        {row()}
      </span>
    </span>
  );
}

function CheckRow({ check }: { check: ScoreCheck }) {
  const Icon = check.value >= 1 ? CircleCheck : check.value > 0 ? CircleDashed : CircleX;
  const state = check.value >= 1 ? 'ok' : check.value > 0 ? 'partial' : 'no';
  return (
    <li className="idx-check">
      <Icon size={14} className={`check check-${state}`} />
      <span className="idx-check-label">{check.label}</span>
      {check.note && <span className="muted idx-note">{check.note}</span>}
    </li>
  );
}

export default function StoreCard({ app }: { app: StoreApp }) {
  const s = app.store;
  const score = adoptionIndex(app);
  const [open, setOpen] = useState(false);
  const detailId = `idx-${app.id}`;

  return (
    <article className="store-card glass">
      <header className="store-head">
        <AppIcon app={app} size={44} />
        <div className="store-title">
          <h3>{app.name}</h3>
          <span className="store-tagline">{app.tagline}</span>
        </div>
      </header>

      <p className="pitch">{s.pitch}</p>

      <div className="store-meta">
        <Stars value={s.rating} />
        <span className="rating">{s.rating.toFixed(1).replace('.', ',')}</span>
        <span className="muted">({s.reviews})</span>
      </div>

      <div className="hosp-row">
        <Hospital size={15} className="hosp-icon" aria-hidden />
        <span className="muted">
          aktivních poskytovatelů <b className="hosp-count">{s.hospitals}</b>
        </span>
      </div>

      <footer className={open ? 'store-foot open' : 'store-foot'}>
        <button className="idx-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={detailId}>
          <span className="idx-head">
            <span className="idx-title">
              <span className="c-label">Adoption index</span>
              <span className={`idx-level level-${score.level}`}>{score.levelLabel}</span>
            </span>
            <b className="idx-total">{score.total}</b>
            <ChevronDown size={16} className="idx-chevron" />
          </span>
          <Bar pct={score.total} />
        </button>

        {open && (
          <div className="idx-detail" id={detailId}>
            {score.parts.map((p) => (
              <section key={p.id} className="idx-part">
                <div className="idx-part-head">
                  <b>{p.label}</b>
                  <span className="muted">váha {Math.round(p.weight * 100)} %</span>
                  <span className="mono idx-pct">{p.pct} %</span>
                </div>
                <Bar pct={p.pct} thin />
                <ul className="idx-checks">
                  {p.checks.map((c) => (
                    <CheckRow key={c.label} check={c} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </footer>
    </article>
  );
}
