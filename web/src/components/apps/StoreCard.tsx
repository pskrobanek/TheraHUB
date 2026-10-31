import { ChevronDown, CircleCheck, CircleDashed, CircleX, Star } from 'lucide-react';
import { useState } from 'react';
import type { Audience, StoreApp } from '../../data/types';
import { hospitalsFor } from '../../data/hospitals';
import { specialtyOf } from '../../data/specialties';
import { adoptionIndex, type ScoreCheck } from '../../lib/score';
import AppIcon from '../AppIcon';

export const audienceLabel: Record<Audience, string> = {
  pacient: 'Pacient',
  lekar: 'Lékař',
  sestra: 'Sestra',
  admin: 'Administrativa',
  vyzkumnik: 'Výzkumník',
};

const levelOf = (pct: number) => (pct >= 85 ? 'vysoke' : pct >= 70 ? 'stredni' : 'nizke');

function Bar({ pct, thin = false }: { pct: number; thin?: boolean }) {
  return (
    <span className={thin ? 'bar thin' : 'bar'} aria-hidden>
      <span className={`bar-fill fill-${levelOf(pct)}`} style={{ width: `${pct}%` }} />
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

/** „nemocnici / nemocnicích“ podle počtu (6. pád po předložce „v“). */
const hospitalWord = (n: number) => (n === 1 ? 'nemocnici' : 'nemocnicích');

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
  const spec = specialtyOf(app.category);
  const score = adoptionIndex(app);
  const [open, setOpen] = useState(false);
  const detailId = `idx-${app.id}`;

  return (
    <article className="store-card glass">
      <header className="store-head">
        <AppIcon app={app} size={44} filled />
        <div className="store-title">
          <h3>{app.name}</h3>
          <span className="muted small">{app.tagline}</span>
          <span className="title-tags">
            <span className="tag cat" style={{ color: spec.color, background: `${spec.color}18` }}>
              {app.category}
            </span>
          </span>
        </div>
      </header>

      <div className="store-meta">
        <Stars value={s.rating} />
        <span className="rating">{s.rating.toFixed(1).replace('.', ',')}</span>
        <span className="muted">({s.reviews})</span>
      </div>

      <div className="hosp-row">
        <span className="hosp-logos">
          {hospitalsFor(app.id, Math.min(3, s.hospitals)).map((h) => (
            <span key={h.id} className="hosp-logo" style={{ background: h.color }} title={`${h.name} (demo)`}>
              {h.mark}
            </span>
          ))}
        </span>
        <span className="muted">
          Aktivní v <b className="hosp-count">{s.hospitals}</b> {hospitalWord(s.hospitals)}
        </span>
      </div>

      <p className="pitch">{s.pitch}</p>

      <footer className={`store-foot foot-${score.level}${open ? ' open' : ''}`}>
        <button className="idx-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={detailId}>
          <span className="idx-head">
            <span className="c-label">Adoption index</span>
            <span className={`idx-level level-${score.level}`}>{score.levelLabel}</span>
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
