import { ChevronDown, CircleCheck, CircleDashed, CircleX, Star } from 'lucide-react';
import { useState } from 'react';
import type { Audience, StoreApp } from '../../data/types';
import { specialtyOf } from '../../data/specialties';
import { adoptionIndex, levelFor, type ScoreCheck } from '../../lib/score';
import AppIcon from '../AppIcon';
import Link from '../Link';
import { VerdictBadge } from '../trial/Status';
import { dossiers, realAppIds } from '../../data/trial/dossiers';
import { match } from '../../data/trial/match';
import { hospitalDemo, storeBadge } from '../../data/trial/requests';

const badgeLabel = { podano: 'Žádost podána', pilot: 'Pilot probíhá', predplatne: 'V předplatném' } as const;

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
  const spec = specialtyOf(app.category);
  const [open, setOpen] = useState(false);
  const detailId = `idx-${app.id}`;
  const real = realAppIds.has(app.id);
  const badge = storeBadge(app.id);

  return (
    <article className="store-card glass">
      <Link href={`#/aplikace/store/${app.id}`} className="store-head store-head-link">
        <AppIcon app={app} size={63} />
        <div className="store-title">
          <h3>{app.name}</h3>
          <span className="store-tagline">{app.tagline}</span>
          <span className="store-spec" style={{ color: spec.color, background: `${spec.color}1a` }}>
            {app.category}
          </span>
        </div>
      </Link>

      <p className="pitch">{s.pitch}</p>

      <div className="store-meta">
        <Stars value={s.rating} />
        <span className="rating">{s.rating.toFixed(1).replace('.', ',')}</span>
        <span className="muted">({s.reviews})</span>
      </div>

      <div className="store-providers muted">
        <b className="fact-num">{s.hospitals}</b> {s.hospitals === 1 ? 'poskytovatel' : s.hospitals < 5 ? 'poskytovatelé' : 'poskytovatelů'}
      </div>

      <div className="store-badges">
        <VerdictBadge
          verdict={real ? 'pripravuje' : match(dossiers[app.id]?.answers).verdict}
          size="sm"
          title={`Shoda s požadavky ${hospitalDemo.short} – detail v aplikaci`}
        />
        {badge && <span className={`req-badge ${badge}`}>{badgeLabel[badge]}</span>}
      </div>

      {real ? (
        <footer className="store-foot">
          <div className="idx-toggle idx-pending">
            <span className="c-label">Adoption index</span>
            <span className="muted small">spočítá se z dossier</span>
          </div>
        </footer>
      ) : (
      <footer className={open ? 'store-foot open' : 'store-foot'}>
        <button className="idx-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={detailId}>
          <span className="c-label">Adoption index</span>
          <Bar pct={score.total} />
          <b className={`idx-total level-${score.level}`}>{score.total}</b>
          <ChevronDown size={15} className="idx-chevron" />
        </button>

        {open && (
          <div className="idx-detail" id={detailId}>
            <p className="idx-help muted small">
              Obecná připravenost aplikace v katalogu z veřejných vah. Není to verdikt vaší nemocnice – ten je v detailu aplikace (Shoda s požadavky).
            </p>
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
      )}
    </article>
  );
}
