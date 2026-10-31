import { Clock, Star } from 'lucide-react';
import type { Audience, StoreApp } from '../../data/types';
import { specialtyOf } from '../../data/specialties';
import { adoptionIndex, usesAi } from '../../lib/score';
import { aiModeLabel } from './StoreFilters';
import AppIcon from '../AppIcon';

export const audienceLabel: Record<Audience, string> = {
  pacient: 'Pacient',
  lekar: 'Lékař',
  sestra: 'Sestra',
  admin: 'Administrativa',
  vyzkumnik: 'Výzkumník',
};

function Ring({ value, level }: { value: number; level: string }) {
  const r = 17;
  const c = 2 * Math.PI * r;
  return (
    <svg className={`ring ring-${level}`} viewBox="0 0 44 44" aria-hidden>
      <circle cx="22" cy="22" r={r} className="ring-bg" />
      <circle cx="22" cy="22" r={r} className="ring-fg" strokeDasharray={`${(c * value) / 100} ${c}`} />
      <text x="22" y="22" dy="0.36em" textAnchor="middle">
        {value}
      </text>
    </svg>
  );
}

interface Props {
  app: StoreApp;
  purchased: boolean;
  trialRequested: boolean;
  onTrial: () => void;
}

export default function StoreCard({ app, purchased, trialRequested, onTrial }: Props) {
  const s = app.store;
  const spec = specialtyOf(app.category);
  const score = adoptionIndex(app);

  return (
    <article className="store-card glass">
      <header className="store-head">
        <AppIcon app={app} size={44} filled />
        <div className="store-title">
          <h3>{app.name}</h3>
          <span className="muted small">{app.tagline}</span>
          <span className="tag cat" style={{ color: spec.color, background: `${spec.color}18` }}>
            {app.category}
          </span>
        </div>
      </header>

      <div className="tags">
        <span className="tag outline">{s.regulatory.label.replace(/\s*·\s*AI$/, '')}</span>
        {usesAi(app) && (
          <span className="tag ai" title={aiModeLabel[s.ai].hint}>
            {aiModeLabel[s.ai].label}
          </span>
        )}
      </div>

      <p className="pitch">{s.pitch}</p>

      <div className="store-meta">
        <span className="rating">
          <Star size={13} fill="currentColor" /> {s.rating.toFixed(1).replace('.', ',')}
        </span>
        <span className="muted">
          ({s.reviews}) · {s.hospitals} nemocnic
        </span>
      </div>


      <div className="score">
        <Ring value={score.total} level={score.level} />
        <div>
          <b>Adoption index</b>
          <span className={`score-level level-${score.level}`}>{score.levelLabel}</span>
        </div>
      </div>

      <footer className="store-foot">
        <button className={trialRequested ? 'trial sent' : 'trial'} onClick={onTrial} disabled={purchased || trialRequested || !s.trial}>
          <span className="c-label">
            <Clock size={11} /> Trial
          </span>
          {purchased ? (
            <b className="muted">Zakoupeno</b>
          ) : trialRequested ? (
            <b>Žádost odeslána</b>
          ) : s.trial ? (
            <b>
              {s.trial.days} dní <small>zdarma</small>
            </b>
          ) : (
            <b className="muted">Bez trialu</b>
          )}
        </button>
      </footer>
    </article>
  );
}
