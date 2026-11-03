// Detail žádosti o pilotní provoz (brief §9.3). Ve Fázi 0a záložky Přehled, Shoda a Rozhodnutí; ostatní naznačené.
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import AppIcon from '../components/AppIcon';
import Link from '../components/Link';
import ComplianceBox from '../components/trial/ComplianceBox';
import StateBadge from '../components/trial/StateBadge';
import { VerdictBadge } from '../components/trial/Status';
import Stepper from '../components/trial/Stepper';
import { domainLabel, domains } from '../data/trial/catalog';
import { fmtDay } from '../data/trial/dates';
import { dossiers } from '../data/trial/dossiers';
import { match } from '../data/trial/match';
import { departments, hospitalDemo, outcomeLabel, templateA, type StepRun, type TrialRequest } from '../data/trial/requests';
import { storeApps } from '../data/store';

type Tab = 'prehled' | 'shoda' | 'rozhodnuti' | 'dokumenty' | 'dotazy' | 'podminky' | 'pilot' | 'audit';
const tabs: { id: Tab; label: string; phase?: string }[] = [
  { id: 'prehled', label: 'Přehled' },
  { id: 'shoda', label: 'Shoda' },
  { id: 'rozhodnuti', label: 'Rozhodnutí' },
  { id: 'dokumenty', label: 'Dokumenty', phase: 'Fáze 2' },
  { id: 'dotazy', label: 'Dotazy', phase: 'Fáze 2' },
  { id: 'podminky', label: 'Podmínky a výjimky', phase: 'Fáze 2' },
  { id: 'pilot', label: 'Pilotní provoz', phase: 'Fáze 3' },
  { id: 'audit', label: 'Audit', phase: 'Fáze 2' },
];

export default function TrialRequestDetail({ req }: { req: TrialRequest }) {
  const [tab, setTab] = useState<Tab>('prehled');
  const app = storeApps.find((a) => a.id === req.appId)!;
  const dossier = dossiers[req.appId];
  const dep = departments[req.dept];

  return (
    <div className="page trq-detail">
      <Link href="#/aplikace/zadosti" className="back-link">
        <ArrowLeft size={15} /> Žádosti o pilotní provoz
      </Link>

      <header className="patient-header glass trq-head">
        <div className="trq-head-top">
          <AppIcon app={app} size={48} />
          <div className="trq-head-title">
            <h1>
              {app.name} <span className="birth-number mono">{req.id}</span>
            </h1>
            <p className="muted">
              {dep.name} · žadatel a odborný garant: {dep.requester.name} · {hospitalDemo.short}
              {req.submitted ? ` · podáno ${fmtDay(req.submitted, true)}` : ' · nepodáno'}
            </p>
          </div>
          <StateBadge state={req.state} />
        </div>
        <Stepper req={req} />
        <nav className="tabs" aria-label="Záložky žádosti">
          {tabs.map((t) => (
            <button key={t.id} className={t.id === tab ? 'tab active' : 'tab'} onClick={() => setTab(t.id)} disabled={!!t.phase} title={t.phase ? `Přijde ve ${t.phase}` : undefined}>
              {t.label}
              {t.phase && <span className="tab-phase">{t.phase}</span>}
            </button>
          ))}
        </nav>
      </header>

      {tab === 'prehled' && <Overview req={req} />}
      {tab === 'shoda' && (
        <>
          <ComplianceBox
            result={match(dossier?.answers, req.waivers ?? {}, req.snapshotAt ?? req.created)}
            dossierVersion={dossier?.version}
            snapshotLabel={req.snapshotAt ? `Snímek z podání ${fmtDay(req.snapshotAt, true)} (zmrazený)` : 'Žádost zatím nebyla podána – živý výsledek'}
            onRequest={null}
          />
          {req.snapshotAt && <LiveDiff req={req} />}
        </>
      )}
      {tab === 'rozhodnuti' && <DecisionLog req={req} />}
    </div>
  );
}

function Overview({ req }: { req: TrialRequest }) {
  return (
    <section className="glass app-panel trq-overview">
      <dl className="trq-facts">
        <div>
          <dt>Klinický problém a účel</dt>
          <dd>{req.purpose}</dd>
        </div>
        <div>
          <dt>Očekávaný počet pacientů</dt>
          <dd>{req.patients ? req.patients.toLocaleString('cs-CZ') : 'Bez dat pacientů'}</dd>
        </div>
        <div>
          <dt>Uživatelé</dt>
          <dd>{req.users}</dd>
        </div>
        <div>
          <dt>Délka pilotního provozu</dt>
          <dd>
            {req.months} {req.months === 1 ? 'měsíc' : req.months < 5 ? 'měsíce' : 'měsíců'}
            {req.trialStart && ` · ${fmtDay(req.trialStart, true)} – ${req.trialEnd ? fmtDay(req.trialEnd, true) : ''}`}
          </dd>
        </div>
      </dl>
      <h3 className="widget-label">KPI pilotního provozu</h3>
      <table className="roster">
        <thead>
          <tr>
            <th>Ukazatel</th>
            <th>Cíl</th>
            <th>Zdroj měření</th>
          </tr>
        </thead>
        <tbody>
          {req.kpis.map((k) => (
            <tr key={k.name}>
              <td>{k.name}</td>
              <td>{k.target}</td>
              <td className="muted">{k.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted small">Pilotní provoz nezakládá nárok na smlouvu; případný nákup proběhne podle pravidel zadávání veřejných zakázek.</p>
    </section>
  );
}

/** Rozdíl mezi snímkem z podání a dnešním výsledkem (plně ve Fázi 2). */
function LiveDiff({ req }: { req: TrialRequest }) {
  const dossier = dossiers[req.appId];
  const snap = match(dossier?.answers, req.waivers ?? {}, req.snapshotAt);
  const live = match(dossier?.answers, req.waivers ?? {});
  const changed = snap.domains.flatMap((d, i) => d.items.filter((it, k) => live.domains[i].items[k].status !== it.status));
  return (
    <p className="phase-note glass">
      Dnešní živý výsledek: <VerdictBadge verdict={live.verdict} size="sm" />
      {changed.length > 0
        ? ` · ${changed.length} ${changed.length === 1 ? 'položka se od podání změnila' : changed.length < 5 ? 'položky se od podání změnily' : 'položek se od podání změnilo'} (${changed.map((c) => c.item.code).join(', ')}).`
        : ' · od podání beze změny.'}
    </p>
  );
}

function DecisionLog({ req }: { req: TrialRequest }) {
  const rows: { step: string; run: StepRun }[] = [];
  for (const st of templateA.steps) {
    const run = req.steps[st.id];
    if (st.id === 'posouzeni' && req.block) {
      domains.forEach((d) => {
        const b = req.block![d];
        if (b && (b.status === 'done' || b.status === 'rejected')) rows.push({ step: `Posouzení · ${domainLabel[d]}`, run: b });
      });
      continue;
    }
    if (run && (run.status === 'done' || run.status === 'rejected' || run.status === 'withdrawn')) rows.push({ step: st.label, run });
  }
  rows.sort((a, b) => (a.run.date ?? '').localeCompare(b.run.date ?? ''));
  return (
    <section className="glass app-panel">
      <table className="roster">
        <thead>
          <tr>
            <th>Kdy</th>
            <th>Krok</th>
            <th>Kdo</th>
            <th>Rozhodnutí</th>
            <th>Důvod / podmínka</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ step, run }, i) => (
            <tr key={i}>
              <td className="nowrap mono">{run.date ? fmtDay(run.date, true) : '—'}</td>
              <td>{step}</td>
              <td>{run.by ?? '—'}</td>
              <td>{run.status === 'withdrawn' ? 'Staženo' : run.outcome ? outcomeLabel[run.outcome] : '—'}</td>
              <td className="muted">{run.condition ?? run.note ?? '—'}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="muted">
                Zatím žádné rozhodnutí.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <p className="muted small">Ve Fázi 2 každé rozhodnutí ponese i MFA potvrzení a záznam v neměnném auditu.</p>
    </section>
  );
}
