import { Check as CheckIcon, Clock, Star, User } from 'lucide-react';
import type { Audience, StoreApp } from '../../data/types';
import { specialtyOf } from '../../data/specialties';
import { complianceScore, departmentEstimate, usesAi } from '../../lib/score';
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

function Dots({ values }: { values: number[] }) {
  return (
    <span className="dots" aria-hidden>
      {values.map((v, i) => (
        <i key={i} className={v >= 1 ? 'ok' : v > 0 ? 'partial' : ''} />
      ))}
    </span>
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
  const score = complianceScore(app);
  const estimate = departmentEstimate(app);

  return (
    <article className="store-card glass">
      <header className="store-head">
        <AppIcon app={app} size={44} filled />
        <div className="store-title">
          <h3>{app.name}</h3>
          <div className="tags">
            <span className="tag cat" style={{ color: spec.color, background: `${spec.color}18` }}>
              {app.category}
            </span>
            <span className="tag outline">{s.regulatory.label.replace(/\s*·\s*AI$/, '')}</span>
            {usesAi(app) && (
              <span className="tag ai" title={aiModeLabel[s.ai].hint}>
                {aiModeLabel[s.ai].label}
              </span>
            )}
          </div>
        </div>
        {purchased && (
          <span className="owned" title="Zakoupeno">
            <CheckIcon size={13} />
          </span>
        )}
      </header>

      <p className="pitch">{s.pitch}</p>

      <div className="store-meta">
        <span className="rating">
          <Star size={13} fill="currentColor" /> {s.rating.toFixed(1).replace('.', ',')}
        </span>
        <span className="muted">
          ({s.reviews}) · {s.hospitals} nemocnic
        </span>
      </div>

      <div className="tags">
        {s.audience.map((a) => (
          <span key={a} className="tag">
            <User size={11} /> {audienceLabel[a]}
          </span>
        ))}
      </div>

      <div className="score">
        <div className="score-head">
          <Ring value={score.total} level={score.level} />
          <div>
            <b>Index důvěry</b>
            <span className={`score-level level-${score.level}`}>{score.levelLabel}</span>
          </div>
        </div>
        <div className="score-rows">
          {score.parts.map((p) => (
            <div key={p.id} className="score-row">
              <span className="muted">{p.label}</span>
              <Dots values={p.dots} />
              <span className="mono pct">{p.pct} %</span>
            </div>
          ))}
        </div>
      </div>

      <footer className="store-foot">
        <button
          className={trialRequested ? 'trial sent' : 'trial'}
          onClick={onTrial}
          disabled={purchased || trialRequested || !s.trial}
        >
          <span className="c-label">
            <Clock size={11} /> Trial
          </span>
          {purchased ? (
            <b className="muted">Zakoupeno</b>
          ) : trialRequested ? (
            <b>Odesláno</b>
          ) : s.trial ? (
            <>
              <b>{s.trial.days} dní</b>
              <small>zdarma</small>
            </>
          ) : (
            <b className="muted">—</b>
          )}
        </button>
        <div className="estimate">
          <span className="c-label">Odhad na oddělení</span>
          <b>
            ≈ {estimate.monthly.toLocaleString('cs-CZ')} Kč <small>/ měs.</small>
          </b>
          <span className="muted small">{estimate.unit}</span>
        </div>
      </footer>
    </article>
  );
}
