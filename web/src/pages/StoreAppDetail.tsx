// Detail aplikace v App Storu (brief §9.1): vlevo popis a náhledy, vpravo Adoption index, shoda se 4 oblastmi
// požadavků nemocnice a další soulad (integrace, datový prostor, záštity, TheraHUB). Pod tím průběh žádostí.
import { ArrowLeft, Info, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { audienceLabel } from '../components/apps/StoreCard';
import { aiModeLabel } from '../components/apps/StoreFilters';
import Link from '../components/Link';
import AppScreens from '../components/trial/AppScreens';
import ReadinessPanel from '../components/trial/ReadinessPanel';
import StateBadge from '../components/trial/StateBadge';
import StoreAppHead from '../components/trial/StoreAppHead';
import Stepper from '../components/trial/Stepper';
import { dossiers, realAppIds, realStatusNote } from '../data/trial/dossiers';
import { match } from '../data/trial/match';
import { fmtDay } from '../data/trial/dates';
import { departments, hospitalDemo, isActive, requestsForApp, staff, type DeptId } from '../data/trial/requests';
import type { StoreApp } from '../data/types';

/** Oddělení přihlášené lékařky v demu (DEC-012). */
const myDept: DeptId = 'onko';

const fmtPrice = (a: StoreApp) => `${a.store.price.amount.toLocaleString('cs-CZ')} Kč za ${a.store.price.per} / ${a.store.price.period}`;

export default function StoreAppDetail({ app }: { app: StoreApp }) {
  const real = realAppIds.has(app.id);
  const dossier = dossiers[app.id];
  const result = match(real ? undefined : dossier?.answers);
  const reqs = requestsForApp(app.id).sort((a, b) => (a.dept === myDept ? -1 : b.dept === myDept ? 1 : (b.submitted ?? b.created).localeCompare(a.submitted ?? a.created)));
  const mine = reqs.find((r) => r.dept === myDept && isActive(r));
  const [asked, setAsked] = useState(false);
  const blocking = result.domains.some((d) => d.items.some((i) => i.item.criticality === 'blokujici' && ['gap', 'missing', 'expired'].includes(i.status)));
  const s = app.store;
  /** Další tři kroky šablony A po podání žádosti z mého oddělení (DEC-016). */
  const nextSteps = [
    { label: 'Primář', who: departments[myDept].head.name },
    { label: 'Náměstkyně pro léčebnou péči', who: staff.namestek.name },
    { label: 'Firma', who: `${dossier?.vendor ?? 'Dodavatel'} – potvrdí podmínky` },
  ];

  return (
    <div className="page store-detail">
      <Link href="#/aplikace/store" className="back-link">
        <ArrowLeft size={15} /> App Store
      </Link>

      <div className="sd-grid">
        {/* Vlevo: popis a náhledy */}
        <section className="sd-main glass">
          <StoreAppHead app={app} />
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
        <ReadinessPanel app={app}>
          {!real && (
            <footer className="sd-cta">
              {mine ? (
                <p className="small">
                  {departments[myDept].name} už žádá ({mine.id}). Můžete se připojit jako spolužadatel/ka.
                </p>
              ) : (
                <>
                  <div className="next-steps">
                    <span className="c-label">Co bude následovat</span>
                    <ol>
                      {nextSteps.map((st, i) => (
                        <li key={st.label}>
                          <span className="ns-dot">{i + 1}</span>
                          <b>{st.label}</b>
                          <span className="muted">{st.who}</span>
                        </li>
                      ))}
                      <li className="ns-more">
                        <span className="ns-dot">…</span>
                        <b>Další kroky</b>
                        <span className="muted">Posouzení Legal, GDPR, Security a Ostatní · smlouva · pilotní provoz · vyhodnocení</span>
                      </li>
                    </ol>
                  </div>
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
              {reqs.length > 0 && (
                <div className="past-reqs">
                  <span className="c-label">Žádosti o tuto aplikaci v {hospitalDemo.short}</span>
                  <ul>
                    {reqs.map((r) => (
                      <li key={r.id}>
                        <Link href={`#/aplikace/zadosti/${r.id}`} className="past-req">
                          <span>
                            <b>{departments[r.dept].name}</b>
                            <span className="muted small">
                              {r.id} · {r.submitted ? `podáno ${fmtDay(r.submitted, true)}` : 'nepodáno'}
                            </span>
                          </span>
                          <StateBadge state={r.state} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </footer>
          )}
        </ReadinessPanel>
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

    </div>
  );
}
