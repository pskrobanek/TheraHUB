// Detail aplikace v App Storu (brief §9.1): vlevo popis a náhledy, vpravo Adoption index, shoda se 4 oblastmi
// požadavků nemocnice a další soulad (integrace, datový prostor, záštity, TheraHUB). Pod tím průběh žádostí.
import { ArrowLeft, Info, LayoutGrid, Lock, Scale, Shield, TriangleAlert, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import AppIcon from '../components/AppIcon';
import { audienceLabel, Bar, CheckRow } from '../components/apps/StoreCard';
import { aiModeLabel } from '../components/apps/StoreFilters';
import Link from '../components/Link';
import AppScreens from '../components/trial/AppScreens';
import { Drawer } from '../components/trial/ComplianceBox';
import StateBadge from '../components/trial/StateBadge';
import { StatusChip, VerdictBadge } from '../components/trial/Status';
import Stepper from '../components/trial/Stepper';
import { specialtyOf } from '../data/specialties';
import { domainLabel, profileVersion, type Domain } from '../data/trial/catalog';
import { dossiers, realAppIds, realStatusNote } from '../data/trial/dossiers';
import { match, statusOrder, type DomainResult, type ItemStatus } from '../data/trial/match';
import { departments, hospitalDemo, isActive, requestsForApp, type DeptId } from '../data/trial/requests';
import type { StoreApp } from '../data/types';
import { adoptionIndex, levelLabel } from '../lib/score';

/** Oddělení přihlášené lékařky v demu (DEC-012). */
const myDept: DeptId = 'onko';

const domainIcon: Record<Domain, LucideIcon> = { legal: Scale, gdpr: Lock, security: Shield, ostatni: LayoutGrid };

/** Podíl splněných požadavků oblasti (Nevztahuje se se nepočítá; Částečně = polovina). */
function domainPct(d: DomainResult): number {
  const items = d.items.filter((i) => i.status !== 'na');
  if (!items.length) return 100;
  const v = (s: ItemStatus) => (s === 'match' || s === 'waived' ? 1 : s === 'partial' ? 0.5 : 0);
  return Math.round((items.reduce((n, i) => n + v(i.status), 0) / items.length) * 100);
}

/** Barva podle podílu splněných: tokeny stavů (85+ / 70+ / 55+ / méně). */
const toneFor = (pct: number) => (pct >= 85 ? 'match' : pct >= 70 ? 'partial' : pct >= 55 ? 'missing' : 'gap');

function Ring({ value, level }: { value: number | null; level?: string }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <svg className="sd-ring" width="84" height="84" viewBox="0 0 84 84" role="img" aria-label={value === null ? 'Adoption index zatím není' : `Adoption index ${value} ze 100`}>
      <circle cx="42" cy="42" r={r} className="sd-ring-track" />
      {value !== null && (
        <circle cx="42" cy="42" r={r} className={`sd-ring-fill fill-${level}`} strokeDasharray={`${(value / 100) * c} ${c}`} transform="rotate(-90 42 42)" />
      )}
      <text x="42" y="47" textAnchor="middle" className="sd-ring-num">
        {value ?? '—'}
      </text>
    </svg>
  );
}

const fmtPrice = (a: StoreApp) => `${a.store.price.amount.toLocaleString('cs-CZ')} Kč za ${a.store.price.per} / ${a.store.price.period}`;

export default function StoreAppDetail({ app }: { app: StoreApp }) {
  const real = realAppIds.has(app.id);
  const dossier = dossiers[app.id];
  const result = match(real ? undefined : dossier?.answers);
  const spec = specialtyOf(app.category);
  const score = adoptionIndex(app);
  const reqs = requestsForApp(app.id).sort((a, b) => (a.dept === myDept ? -1 : b.dept === myDept ? 1 : (b.submitted ?? b.created).localeCompare(a.submitted ?? a.created)));
  const mine = reqs.find((r) => r.dept === myDept && isActive(r));
  const [asked, setAsked] = useState(false);
  const [drawer, setDrawer] = useState<Domain | null>(null);
  const blocking = result.domains.some((d) => d.items.some((i) => i.item.criticality === 'blokujici' && ['gap', 'missing', 'expired'].includes(i.status)));
  const otherParts = score.parts.filter((p) => p.id !== 'hospital');
  const nis = score.parts.find((p) => p.id === 'hospital')!.checks.find((c) => c.label === 'Integrace s NIS')!;
  const s = app.store;

  return (
    <div className="page store-detail">
      <Link href="#/aplikace/store" className="back-link">
        <ArrowLeft size={15} /> App Store
      </Link>

      <div className="sd-grid">
        {/* Vlevo: popis a náhledy */}
        <section className="sd-main glass">
          <header className="sd-main-head">
            <AppIcon app={app} size={72} />
            <div className="sd-title">
              <h1>{app.name}</h1>
              <p className="muted">
                {app.tagline}
                {dossier && !real ? ` · ${dossier.vendor}` : ''}
              </p>
              <span className="store-spec" style={{ color: spec.color, background: `${spec.color}1a` }}>
                {app.category}
              </span>
            </div>
          </header>
          <p className="sd-pitch">{s.pitch}</p>
          {realStatusNote[app.id] && <p className="sd-real small">{realStatusNote[app.id]}</p>}

          <dl className="sd-facts">
            <div>
              <dt>Pro koho</dt>
              <dd>{s.audience.map((a) => audienceLabel[a]).join(', ')}</dd>
            </div>
            <div>
              <dt>Regulatorní zařazení</dt>
              <dd>{s.regulatory.label}</dd>
            </div>
            <div>
              <dt>Využití AI</dt>
              <dd>{aiModeLabel[s.ai].label}</dd>
            </div>
            {s.trial && (
              <div>
                <dt>Bezplatný pilotní provoz</dt>
                <dd>
                  {s.trial.days} dní · KPI: {s.trial.kpis.join('; ')}
                </dd>
              </div>
            )}
            {!real && (
              <div>
                <dt>Cena po pilotním provozu</dt>
                <dd>{fmtPrice(app)}</dd>
              </div>
            )}
          </dl>

          {real ? (
            <p className="cbox-pending">
              <Info size={16} aria-hidden /> Screenshoty dodá dodavatel spolu s dossier.
            </p>
          ) : (
            <AppScreens app={app} />
          )}
        </section>

        {/* Vpravo: index, 4 oblasti požadavků nemocnice, další soulad */}
        <aside className="sd-side glass" aria-label="Připravenost a shoda">
          <header className="sd-side-head">
            <Ring value={real ? null : score.total} level={score.level} />
            <div>
              <span className="c-label">Adoption index</span>
              <b className="sd-side-level">{real ? 'Spočítá se z dossier' : `${levelLabel[score.level]} připravenost`}</b>
              <p className="small muted">Obecná připravenost aplikace v katalogu. Není to verdikt vaší nemocnice – ten je níže.</p>
            </div>
          </header>

          <section className="sd-block">
            <div className="sd-block-head">
              <h2>Požadavky {hospitalDemo.short}</h2>
              <VerdictBadge verdict={real ? 'pripravuje' : result.verdict} size="sm" />
            </div>
            {real ? (
              <p className="small muted">Dodavatel dossier teprve vyplňuje – do té doby žádné vymyšlené hodnocení.</p>
            ) : (
              <ul className="sd-domains">
                {result.domains.map((d) => {
                  const pct = domainPct(d);
                  const tone = toneFor(pct);
                  const Icon = domainIcon[d.domain];
                  const unmet = d.items.filter((i) => !['match', 'na', 'waived'].includes(i.status)).sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));
                  return (
                    <li key={d.domain} className={`sd-domain tone-${tone}`}>
                      <button className="sd-domain-row" onClick={() => setDrawer(d.domain)} aria-haspopup="dialog">
                        <span className="sd-domain-icon" aria-hidden>
                          <Icon size={17} fill="currentColor" strokeWidth={1.5} />
                        </span>
                        <span className="sd-domain-name">{domainLabel[d.domain]}</span>
                        <span className="sd-domain-pct">{pct} %</span>
                        <span className="sd-domain-bar" aria-hidden>
                          <span style={{ width: `${pct}%` }} />
                        </span>
                      </button>
                      {unmet.length > 0 ? (
                        <ul className="sd-unmet">
                          {unmet.map((u) => (
                            <li key={u.item.code}>
                              <StatusChip status={u.status} compact />
                              <span>
                                {u.item.title}
                                <span className="muted"> – {u.reason}</span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="sd-allok small">Všechny požadavky splněny.</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            {!real && (
              <p className="small muted">
                Profil v{profileVersion.version} · dossier v{dossier?.version} · požadavky a prahy jsou zástupné ukázky.{' '}
                <button className="link-btn" onClick={() => setDrawer('legal')}>
                  Všechny položky
                </button>
              </p>
            )}
          </section>

          <section className="sd-block">
            <div className="sd-block-head">
              <h2>Další soulad</h2>
            </div>
            {real ? (
              <p className="small muted">Spočítá se z dossier.</p>
            ) : (
              <div className="sd-more">
                <div className="sd-more-part">
                  <div className="sd-more-head">
                    <b>Integrace s NIS</b>
                    <span className="mono">{nis.note}</span>
                  </div>
                  <Bar pct={Math.round(nis.value * 100)} thin />
                </div>
                {otherParts.map((p) => (
                  <div key={p.id} className="sd-more-part">
                    <div className="sd-more-head">
                      <b>{p.label}</b>
                      <span className="mono">{p.pct} %</span>
                    </div>
                    <ul className="idx-checks">
                      {p.checks.map((c) => (
                        <CheckRow key={c.label} check={c} />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>

          {!real && (
            <footer className="sd-cta">
              {mine ? (
                <p className="small">
                  {departments[myDept].name} už žádá ({mine.id}). Můžete se připojit jako spolužadatel/ka.
                </p>
              ) : (
                <>
                  {blocking && (
                    <span className="cbox-warn small">
                      <TriangleAlert size={14} aria-hidden /> Blokující rozpory – žádost lze podat, řeší se výjimkou nebo doplněním.
                    </span>
                  )}
                  <button className="btn primary" onClick={() => setAsked(true)}>
                    Požádat o pilotní provoz
                  </button>
                </>
              )}
              {mine && (
                <button className="btn" disabled title="Ve Fázi 2">
                  Připojit se k žádosti
                </button>
              )}
            </footer>
          )}
        </aside>
      </div>

      {asked && (
        <p className="phase-note glass">
          <Info size={15} aria-hidden /> Ve Fázi 0 jen naznačeno: formulář žádosti bude předvyplněný z karty aplikace, dossier a vašeho profilu (oddělení, garant, KPI od
          dodavatele). Odeslání spustí předkontrolu a schvalovací proces {hospitalDemo.short}.
        </p>
      )}

      {reqs.length > 0 && (
        <section className="sd-requests">
          <h2 className="section-title">
            Průběh žádostí v {hospitalDemo.short} <span className="count">{reqs.length}</span>
          </h2>
          {reqs.map((r, i) => (
            <article key={r.id} className="sd-req glass">
              <header className="sd-req-head">
                <Link href={`#/aplikace/zadosti/${r.id}`} className="sd-req-title">
                  <b>{departments[r.dept].name}</b> <span className="mono muted small">{r.id}</span>
                </Link>
                <StateBadge state={r.state} />
              </header>
              <Stepper req={r} compact={i > 0} />
            </article>
          ))}
        </section>
      )}

      {drawer && !real && <Drawer result={result} initial={drawer} onClose={() => setDrawer(null)} />}
    </div>
  );
}
