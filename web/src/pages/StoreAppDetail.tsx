// Detail aplikace v App Storu: Adoption index, box Shoda s požadavky a průběh žádostí (brief §9.1).
import { ArrowLeft, Info } from 'lucide-react';
import { useState } from 'react';
import AppIcon from '../components/AppIcon';
import Link from '../components/Link';
import ComplianceBox from '../components/trial/ComplianceBox';
import StateBadge from '../components/trial/StateBadge';
import Stepper from '../components/trial/Stepper';
import { specialtyOf } from '../data/specialties';
import { dossiers, realAppIds, realStatusNote } from '../data/trial/dossiers';
import { match } from '../data/trial/match';
import { departments, hospitalDemo, isActive, requestsForApp, type DeptId } from '../data/trial/requests';
import type { StoreApp } from '../data/types';
import { adoptionIndex, levelLabel } from '../lib/score';

/** Oddělení přihlášené lékařky v demu (DEC-012). */
const myDept: DeptId = 'onko';

export default function StoreAppDetail({ app }: { app: StoreApp }) {
  const real = realAppIds.has(app.id);
  const dossier = dossiers[app.id];
  const result = match(real ? undefined : dossier?.answers);
  const spec = specialtyOf(app.category);
  const score = adoptionIndex(app);
  const reqs = requestsForApp(app.id).sort((a, b) => (a.dept === myDept ? -1 : b.dept === myDept ? 1 : (b.submitted ?? b.created).localeCompare(a.submitted ?? a.created)));
  const mine = reqs.find((r) => r.dept === myDept && isActive(r));
  const [asked, setAsked] = useState(false);

  return (
    <div className="page store-detail">
      <Link href="#/aplikace/store" className="back-link">
        <ArrowLeft size={15} /> App Store
      </Link>

      <header className="sd-head glass">
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
          <p className="sd-pitch">{app.store.pitch}</p>
          {realStatusNote[app.id] && <p className="sd-real small">{realStatusNote[app.id]}</p>}
        </div>
        <aside className="sd-index">
          <span className="c-label">Adoption index</span>
          {real ? (
            <>
              <b className="sd-index-num muted">—</b>
              <span className="small muted">Spočítá se z dossier, až bude hotové.</span>
            </>
          ) : (
            <>
              <b className={`sd-index-num level-${score.level}`}>{score.total}</b>
              <span className="small">{levelLabel[score.level]} připravenost</span>
            </>
          )}
          <p className="sd-index-help small muted">
            <Info size={13} aria-hidden /> Obecná připravenost aplikace v katalogu z veřejných vah: nemocnice 35 %, datový prostor 25 %, odborné společnosti 20 %, TheraHUB
            integrace 20 %. Není to verdikt vaší nemocnice – ten je v boxu Shoda s požadavky. Chybějící údaj index nikdy nezvyšuje.
          </p>
        </aside>
      </header>

      <ComplianceBox
        result={result}
        dossierVersion={real ? undefined : dossier?.version}
        pending={real}
        onRequest={mine ? null : () => setAsked(true)}
      />
      {asked && (
        <p className="phase-note glass">
          <Info size={15} aria-hidden /> Ve Fázi 0 jen naznačeno: formulář žádosti bude předvyplněný z karty aplikace, dossier a vašeho profilu (oddělení, garant, KPI od
          dodavatele). Odeslání spustí předkontrolu a schvalovací proces {hospitalDemo.short}.
        </p>
      )}
      {mine && (
        <p className="phase-note glass">
          <Info size={15} aria-hidden /> {departments[myDept].name} už o pilotní provoz žádá ({mine.id}). Místo nové žádosti se můžete připojit jako spolužadatel/ka.
          <button className="btn" disabled title="Ve Fázi 2">
            Připojit se k žádosti
          </button>
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
