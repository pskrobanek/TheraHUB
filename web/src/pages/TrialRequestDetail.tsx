// Detail žádosti o pilotní provoz (brief §9.3, DEC-022, DEC-023). Hlavička aplikace jako v App Storu a pod ní box s průběhem
// (stejný jako v přehledu Implementace, kroky jsou klikací a otevírají podrobnosti).
import { ArrowLeft, Circle, CircleCheck, CircleMinus, CirclePause, CircleX, Clock, LayoutGrid, Lock, Scale, Shield, TriangleAlert, type LucideIcon } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import BrandDots from '../components/BrandDots';
import Link from '../components/Link';
import { lineup, phaseLabel, PhaseSteps, type LineStep, type PartKey } from '../components/trial/Lineup';
import { Drawer } from '../components/trial/ComplianceBox';
import StateBadge from '../components/trial/StateBadge';
import { VerdictBadge } from '../components/trial/Status';
import StoreAppHead from '../components/trial/StoreAppHead';
import { domainLabel, domains, type Domain } from '../data/trial/catalog';
import { fmtDay, workdaysLabel } from '../data/trial/dates';
import { dossiers } from '../data/trial/dossiers';
import { match } from '../data/trial/match';
import {
  departments,
  domainOwner,
  holdersOf,
  outcomeLabel,
  progressOf,
  templateA,
  type RunStatus,
  type StepRun,
  type TrialRequest,
} from '../data/trial/requests';
import { storeApps } from '../data/store';

const domainIcon: Record<Domain, LucideIcon> = { legal: Scale, gdpr: Lock, security: Shield, ostatni: LayoutGrid };

/** Stav části průběhu: vždy ikona + text (REQ-MAT-001). */
const runInfo: Record<RunStatus | 'none', { label: string; icon: LucideIcon; tone: string }> = {
  done: { label: 'Splněno', icon: CircleCheck, tone: 'match' },
  active: { label: 'Probíhá', icon: Clock, tone: 'wait' },
  waiting_vendor: { label: 'Čeká na firmu', icon: Clock, tone: 'wait' },
  on_hold: { label: 'Pozastaveno', icon: CirclePause, tone: 'wait' },
  rejected: { label: 'Zamítnuto', icon: CircleX, tone: 'gap' },
  withdrawn: { label: 'Staženo', icon: CircleMinus, tone: 'na' },
  pending: { label: 'Nadcházející', icon: Circle, tone: 'na' },
  none: { label: 'Nadcházející', icon: Circle, tone: 'na' },
};

function RunChip({ run, skip }: { run?: StepRun; skip?: boolean }) {
  const { label, icon: Icon, tone } = skip ? { label: 'Nevztahuje se', icon: CircleMinus, tone: 'na' } : runInfo[run?.status ?? 'none'];
  return (
    <span className={`st-chip tone-${tone}`}>
      <Icon size={14} aria-hidden /> {label}
    </span>
  );
}

/** Co se v části děje (popis procesu šablony A, ne právní obsah). */
const partInfo: Record<PartKey, { title: string; what: string }> = {
  primar: { title: 'Schválení primářem', what: 'Primář oddělení potvrdí odborný smysl pilotního provozu a kapacitu oddělení.' },
  namestek: { title: 'Souhlas náměstka', what: 'Náměstkyně pro léčebnou péči potvrdí, že pilotní provoz je pro nemocnici prioritou.' },
  firma: { title: 'Potvrzení firmou', what: 'Firma potvrdí podmínky pilotního provozu a doplní dossier.' },
  posouzeni: { title: 'Posouzení 4 oblastí', what: 'Legal, GDPR, Security a Ostatní posuzují souběžně, každá oblast nad svým balíčkem.' },
  smlouva: { title: 'Smlouva o pilotním provozu', what: 'Právní oddělení připraví smlouvu o bezplatném pilotním provozu, podepisuje ředitel.' },
  pilot: { title: 'Pilotní provoz', what: 'Aplikace běží na oddělení, odborný garant sleduje KPI.' },
  kpi: { title: 'Vyhodnocení KPI', what: 'Žadatel a primář vyhodnotí KPI proti cílům ze žádosti.' },
  rozhodnuti: { title: 'Rozhodnutí', what: 'Náměstkyně rozhodne o nákupu, nebo o ukončení pilotního provozu.' },
  nakup: { title: 'Smlouva o předplatném', what: 'Nákup proběhne podle pravidel zadávání veřejných zakázek.' },
  licence: { title: 'Licence', what: 'Aktivace licence a převedení aplikace do běžného provozu oddělení.' },
};

export default function TrialRequestDetail({ req }: { req: TrialRequest }) {
  const app = storeApps.find((a) => a.id === req.appId)!;
  const dossier = dossiers[req.appId];
  const groups = lineup(req);
  /** Vybraná část: Přehled žádosti, nebo jeden krok průběhu. */
  const [part, setPart] = useState<PartKey | 'prehled'>('prehled');
  const step = part === 'prehled' ? undefined : groups.flatMap((g) => g.steps).find((s) => s.key === part);
  const tlRef = useRef<HTMLDivElement>(null);
  const [ind, setInd] = useState<{ left: number; width: number } | null>(null);
  // Zvýraznění vybraného kroku: úsek dělicí čáry pod ním (měří se, aby sedělo i při zalomení řádků).
  useLayoutEffect(() => {
    const place = () => {
      const tl = tlRef.current;
      const el = tl?.querySelector('.ln.sel, .trq-over-btn.sel');
      if (!tl || !el) return setInd(null);
      const a = tl.getBoundingClientRect();
      const b = el.getBoundingClientRect();
      setInd({ left: b.left - a.left, width: b.width });
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [part]);

  return (
    <div className="page store-detail trq-detail">
      <Link href="#/aplikace/zadosti" className="back-link">
        <ArrowLeft size={15} /> Implementace
      </Link>

      <div className="trq-col">
        <section className="sd-main glass">
          <StoreAppHead app={app} />
        </section>

        <section className="glass trq-flow">
          <div className="trq-timeline" role="group" aria-label="Průběh implementace" ref={tlRef}>
            <div className="trq-phase trq-over">
              <button type="button" className={part === 'prehled' ? 'trq-over-btn sel' : 'trq-over-btn'} onClick={() => setPart('prehled')} aria-pressed={part === 'prehled'}>
                <BrandDots size={14} /> Přehled
              </button>
            </div>
            {groups.map((g) => (
              <div key={g.id} className={`trq-phase trq-phase-${g.id}`}>
                <span className="c-label">{phaseLabel[g.id]}</span>
                <PhaseSteps g={g} selected={part === 'prehled' ? undefined : part} onSelect={setPart} />
              </div>
            ))}
            {ind && <span className="trq-tl-ind" style={{ left: ind.left, width: ind.width }} aria-hidden />}
          </div>

          {step ? (
            <PartDetail key={step.key} req={req} step={step} vendor={dossier?.vendor ?? 'Firma'} />
          ) : (
            <>
              <RequestFacts req={req} />
              <DecisionLog req={req} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}

/** Podrobnosti vybrané části průběhu. */
function PartDetail({ req, step, vendor }: { req: TrialRequest; step: LineStep; vendor: string }) {
  const [drawer, setDrawer] = useState<Domain | null>(null);
  const run = req.steps[step.step];
  const prog = progressOf(req, vendor);
  const isCurrent = prog.current >= 0 && templateA.steps[prog.current]?.id === step.step;
  const skip = step.dot === 'skip';
  const info = partInfo[step.key];
  const dossier = dossiers[req.appId];
  const result = match(dossier?.answers);
  const holders = holdersOf(req, step.step, vendor);
  const dep = departments[req.dept];

  return (
    <section className="trq-part" aria-live="polite">
      <header className="trq-part-head">
        <div>
          <h2>{info.title}</h2>
          <p className="muted small">{info.what}</p>
        </div>
        {step.key === 'posouzeni' && req.block ? <BlockChip req={req} /> : <RunChip run={run} skip={skip} />}
      </header>

      {isCurrent && req.note && (
        <p className="cbox-warn small">
          <TriangleAlert size={14} aria-hidden /> {req.note}
        </p>
      )}

      {step.key === 'posouzeni' ? (
        <>
          <ul className="trq-domains">
            {domains.map((d) => {
              const b = req.block?.[d] ?? (run && run.status !== 'active' ? run : undefined);
              const Icon = domainIcon[d];
              return (
                <li key={d} className="trq-domain">
                  <div className="trq-domain-head">
                    <Icon size={16} fill="currentColor" strokeWidth={1.5} aria-hidden />
                    <b>{domainLabel[d]}</b>
                    <RunChip run={b ?? (run?.status === 'active' ? { status: 'active' } : undefined)} />
                  </div>
                  <span className="muted small">
                    {b?.status === 'done' || b?.status === 'rejected'
                      ? `${b.by} · ${b.date ? fmtDay(b.date, true) : ''}${b.outcome ? ` · ${outcomeLabel[b.outcome]}` : ''}`
                      : b?.status === 'waiting_vendor'
                        ? `${vendor} · od ${b.since ? fmtDay(b.since, true) : ''}`
                        : domainOwner[d].name}
                  </span>
                  {(b?.condition || b?.note) && <span className="small">{b.condition ?? b.note}</span>}
                  <button className="link-btn small" onClick={() => setDrawer(d)}>
                    Položky oblasti
                  </button>
                </li>
              );
            })}
          </ul>
          {req.snapshotAt && <SnapshotNote req={req} />}
          {req.conditions && req.conditions.length > 0 && (
            <div className="trq-conds">
              <span className="c-label">Podmínky</span>
              <ul>
                {req.conditions.map((c) => (
                  <li key={c.text} className="small">
                    {c.text} <span className="muted">· {c.owner} · {c.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <dl className="trq-facts trq-part-facts">
          {skip ? (
            <div>
              <dt>Stav</dt>
              <dd>Nevztahuje se – po pilotním provozu bylo rozhodnuto aplikaci nekupovat.</dd>
            </div>
          ) : run?.status === 'done' || run?.status === 'rejected' || run?.status === 'withdrawn' ? (
            <>
              <div>
                <dt>Rozhodl(a)</dt>
                <dd>{run.by ?? '—'}</dd>
              </div>
              <div>
                <dt>Kdy</dt>
                <dd>{run.date ? fmtDay(run.date, true) : '—'}</dd>
              </div>
              <div>
                <dt>Výsledek</dt>
                <dd>{run.status === 'withdrawn' ? 'Staženo' : run.outcome ? outcomeLabel[run.outcome] : '—'}</dd>
              </div>
              {(run.condition || run.note) && (
                <div>
                  <dt>Podmínka / poznámka</dt>
                  <dd>{run.condition ?? run.note}</dd>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <dt>{run ? 'Řeší' : 'Bude řešit'}</dt>
                <dd>
                  {holders.map((h) => (
                    <span key={h.name} className="trq-holder">
                      {h.name} <span className="muted small">· {h.role}</span>
                    </span>
                  ))}
                </dd>
              </div>
              {run?.since && (
                <div>
                  <dt>Od</dt>
                  <dd>{fmtDay(run.since, true)}</dd>
                </div>
              )}
              {isCurrent && (
                <div>
                  <dt>{prog.paused ? 'Lhůta stojí' : 'Čeká'}</dt>
                  <dd>
                    {workdaysLabel(prog.waiting)}
                    {prog.due && ` · termín ${fmtDay(prog.due, true)}`}
                    {prog.overdue && <b className="trq-overdue"> · po termínu</b>}
                  </dd>
                </div>
              )}
              {run?.note && (
                <div>
                  <dt>Poznámka</dt>
                  <dd>{run.note}</dd>
                </div>
              )}
            </>
          )}
          {step.key === 'pilot' && (
            <>
              <div>
                <dt>Odborný garant</dt>
                <dd>{dep.requester.name}</dd>
              </div>
              <div>
                <dt>Období</dt>
                <dd>
                  {req.months} {req.months === 1 ? 'měsíc' : req.months < 5 ? 'měsíce' : 'měsíců'}
                  {req.trialStart && ` · ${fmtDay(req.trialStart, true)} – ${req.trialEnd ? fmtDay(req.trialEnd, true) : ''}`}
                </dd>
              </div>
            </>
          )}
        </dl>
      )}

      {(step.key === 'kpi' || step.key === 'pilot') && (
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
      )}

      {drawer && <Drawer result={result} initial={drawer} onClose={() => setDrawer(null)} />}
    </section>
  );
}

/** Souhrnný stav paralelního bloku 4 oblastí. */
function BlockChip({ req }: { req: TrialRequest }) {
  const runs = domains.map((d) => req.block?.[d]);
  const st: RunStatus | 'none' = runs.some((r) => r?.status === 'rejected')
    ? 'rejected'
    : runs.every((r) => r?.status === 'done')
      ? 'done'
      : runs.some((r) => r?.status === 'waiting_vendor')
        ? 'waiting_vendor'
        : runs.some((r) => r)
          ? 'active'
          : 'none';
  const n = runs.filter((r) => r?.status === 'done').length;
  const { label, icon: Icon, tone } = runInfo[st];
  return (
    <span className={`st-chip tone-${tone}`}>
      <Icon size={14} aria-hidden /> {label} · {n} ze 4
    </span>
  );
}

/** Údaje žádosti (účel, rozsah, kdo žádá). */
function RequestFacts({ req }: { req: TrialRequest }) {
  const dep = departments[req.dept];
  return (
    <section className="trq-sub">
      <div className="trq-sub-head">
        <h3 className="widget-label">Žádost</h3>
        <span className="mono muted small">{req.id}</span>
        <StateBadge state={req.state} />
      </div>
      <dl className="trq-facts">
        <div>
          <dt>Oddělení</dt>
          <dd>{dep.name}</dd>
        </div>
        <div>
          <dt>Žadatel a odborný garant</dt>
          <dd>{dep.requester.name}</dd>
        </div>
        <div>
          <dt>Podáno</dt>
          <dd>{req.submitted ? fmtDay(req.submitted, true) : 'Nepodáno'}</dd>
        </div>
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
      </dl>
      <p className="muted small">Pilotní provoz nezakládá nárok na smlouvu; případný nákup proběhne podle pravidel zadávání veřejných zakázek.</p>
    </section>
  );
}

/** Verdikt ze zmrazeného snímku při podání vs. dnešní stav (REQ-MAT-008). */
function SnapshotNote({ req }: { req: TrialRequest }) {
  const dossier = dossiers[req.appId];
  const snap = match(dossier?.answers, req.waivers ?? {}, req.snapshotAt);
  const live = match(dossier?.answers);
  const changed = snap.domains.flatMap((d, i) => d.items.filter((it, k) => live.domains[i].items[k].status !== it.status));
  return (
    <p className="trq-snap small">
      Při podání {fmtDay(req.snapshotAt!, true)} (zmrazený snímek): <VerdictBadge verdict={snap.verdict} size="sm" />
      {changed.length > 0
        ? ` · ${changed.length} ${changed.length === 1 ? 'položka se od podání změnila' : changed.length < 5 ? 'položky se od podání změnily' : 'položek se od podání změnilo'}.`
        : ' · od podání beze změny.'}
      {req.waivers && Object.keys(req.waivers).length > 0 && ` Výjimky v žádosti: ${Object.keys(req.waivers).join(', ')}.`}
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
    <section className="trq-sub">
      <h3 className="widget-label">Historie rozhodnutí</h3>
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
