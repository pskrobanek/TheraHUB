import { Check as CheckIcon, CircleCheck, CircleDashed, CircleX, Clock, Star, Users } from 'lucide-react';
import type { Audience, Check, StoreApp } from '../../data/types';
import AppIcon from '../AppIcon';

const audienceLabel: Record<Audience, string> = {
  pacient: 'Pacient',
  lekar: 'Lékař',
  sestra: 'Sestra',
  admin: 'Administrativa',
  vyzkumnik: 'Výzkumník',
};

const checkLabel: Record<Check, string> = { ok: 'Splňuje', partial: 'Částečně', no: 'Nesplňuje' };

function CheckMark({ value }: { value: Check }) {
  const Icon = value === 'ok' ? CircleCheck : value === 'partial' ? CircleDashed : CircleX;
  return <Icon size={16} className={`check check-${value}`} aria-label={checkLabel[value]} />;
}

/** Malý štítek se stavem: zelený, oranžový, nebo přeškrtnutý šedý. */
function Flag({ label, value }: { label: string; value: Check | boolean }) {
  const v: Check = value === true ? 'ok' : value === false ? 'no' : value;
  return <span className={`flag flag-${v}`}>{label}</span>;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="c-row">
      <span className="c-label">{label}</span>
      <span className="c-value">{children}</span>
    </div>
  );
}

function formatPrice(p: StoreApp['store']['price']): string {
  const amount = p.amount.toLocaleString('cs-CZ');
  const per = p.per === 'událost' ? 'vyšetření' : p.per;
  return p.period === 'jednorázově' ? `${amount} Kč / ${per}` : `${amount} Kč / ${per} / ${p.period}`;
}

interface Props {
  app: StoreApp;
  nisName: string;
  purchased: boolean;
  trialRequested: boolean;
  onTrial: () => void;
}

export default function StoreCard({ app, nisName, purchased, trialRequested, onTrial }: Props) {
  const s = app.store;
  const c = s.compliance;
  return (
    <article className="store-card glass">
      <header className="store-head">
        <AppIcon app={app} size={44} />
        <div className="store-title">
          <h3>{app.name}</h3>
          <span className="muted small">{app.category}</span>
        </div>
        {purchased && (
          <span className="owned">
            <CheckIcon size={13} /> Zakoupeno
          </span>
        )}
      </header>

      <p className="pitch">{s.pitch}</p>

      <div className="store-meta">
        <span className="rating" aria-label={`Hodnocení ${s.rating} z 5`}>
          <Star size={14} fill="currentColor" /> {s.rating.toFixed(1)} <span className="muted">({s.reviews})</span>
        </span>
        <span className="muted">Aktivní v {s.hospitals} nemocnicích</span>
      </div>

      <div className="tags">
        {s.audience.map((a) => (
          <span key={a} className="tag">
            <Users size={12} /> {audienceLabel[a]}
          </span>
        ))}
        <span className={`tag reg reg-${s.regulatory.kind}`}>{s.regulatory.label}</span>
      </div>

      <div className="commercial">
        <div>
          <span className="c-label">Trial</span>
          {s.trial ? (
            <>
              <b>
                <Clock size={13} /> {s.trial.days} dní zdarma
              </b>
              <ul className="kpis">
                {s.trial.kpis.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
            </>
          ) : (
            <b className="muted">Bez trialu</b>
          )}
        </div>
        <div>
          <span className="c-label">{s.trial ? 'Cena po trialu' : 'Cena'}</span>
          <b>{formatPrice(s.price)}</b>
        </div>
      </div>

      <div className="compliance">
        <Row label="Vaše nemocnice">
          <Flag label="Legal" value={c.hospital.legal} />
          <Flag label="GDPR" value={c.hospital.gdpr} />
          <Flag label="Security" value={c.hospital.security} />
        </Row>
        <Row label={`Váš NIS (${nisName})`}>
          <span className="meter" aria-label={`Integrace ${c.nis} %`}>
            <span style={{ width: `${c.nis}%` }} className={c.nis >= 80 ? 'hi' : c.nis >= 50 ? 'mid' : 'lo'} />
          </span>
          <span className="mono small">{c.nis} %</span>
        </Row>
        <Row label="TheraHUB integrace">
          <Flag label="Widget" value={c.therahub.widget} />
          <Flag label="Science" value={c.therahub.science} />
          <Flag label="Workflow" value={c.therahub.workflow} />
        </Row>
        <Row label="InterSystems datový prostor">
          <CheckMark value={c.intersystems} />
        </Row>
        <Row label="Evropský datový standard">
          <CheckMark value={c.euStandard} />
        </Row>
        <Row label="Asociace pro AI ČR">
          {c.aiAssociation ? <CheckMark value={c.aiAssociation} /> : <span className="muted small">bez AI</span>}
        </Row>
        <Row label="Záštita odborné společnosti">
          {c.society ? <span className="small">{c.society}</span> : <span className="muted small">—</span>}
        </Row>
      </div>

      <footer className="store-actions">
        {purchased ? (
          <span className="muted small">Dostupné u pacientů v záložce Aplikace.</span>
        ) : trialRequested ? (
          <span className="trial-sent">
            <CheckIcon size={15} /> Žádost o trial odeslána
          </span>
        ) : s.trial ? (
          <button className="btn primary" onClick={onTrial}>
            Vyzkoušet {s.trial.days} dní zdarma
          </button>
        ) : (
          <button className="btn" onClick={onTrial}>
            Požádat o nabídku
          </button>
        )}
      </footer>
    </article>
  );
}
