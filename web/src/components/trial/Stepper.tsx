// Průběh žádosti o pilotní provoz (brief §9.1, REQ-WFL-001–005).
import { Ban, Check, CirclePause, Clock4, Undo2, UserRound, X } from 'lucide-react';
import { domainLabel, domains } from '../../data/trial/catalog';
import { daysBetween, daysLabel, DEMO_TODAY, fmtDay, workdaysLabel } from '../../data/trial/dates';
import { dossiers } from '../../data/trial/dossiers';
import { closedAt, outcomeLabel, progressOf, templateA, type Person, type StepRun, type TrialRequest } from '../../data/trial/requests';

const who = (ps: Person[]) => ps.map((p) => `${p.name}${p.role ? `, ${p.role}` : ''}`).join(' · ');

function runClass(run: StepRun | undefined, isCurrent: boolean) {
  if (!run || run.status === 'pending') return 'todo';
  if (run.status === 'done') return 'done';
  if (run.status === 'rejected') return 'rejected';
  if (run.status === 'withdrawn') return 'withdrawn';
  if (run.status === 'on_hold') return 'hold';
  if (run.status === 'waiting_vendor') return 'waiting';
  return isCurrent ? 'current' : 'todo';
}

function StepIcon({ cls }: { cls: string }) {
  if (cls === 'done') return <Check size={14} aria-hidden />;
  if (cls === 'rejected') return <X size={14} aria-hidden />;
  if (cls === 'withdrawn') return <Undo2 size={14} aria-hidden />;
  if (cls === 'hold' || cls === 'waiting') return <CirclePause size={14} aria-hidden />;
  if (cls === 'current') return <Clock4 size={14} aria-hidden />;
  return null;
}

const clsLabel: Record<string, string> = {
  done: 'hotovo',
  current: 'probíhá',
  todo: 'čeká na předchozí kroky',
  rejected: 'zamítnuto',
  withdrawn: 'staženo',
  hold: 'pozastaveno',
  waiting: 'čeká na firmu',
};

export default function Stepper({ req, compact = false }: { req: TrialRequest; compact?: boolean }) {
  const vendor = dossiers[req.appId]?.vendor ?? 'Firma';
  const p = progressOf(req, vendor);
  const steps = templateA.steps;
  const ended = req.state === 'purchased' || req.state === 'exited';

  return (
    <div className={compact ? 'stepper compact' : 'stepper'}>
      <ol className="stepper-track">
        {steps.map((st, i) => {
          const run = req.steps[st.id];
          let cls = runClass(run, i === p.current);
          if (st.id === 'zadost' && req.state === 'draft') cls = 'current';
          const label = st.id === 'zaver' ? (req.final === 'odchod' ? 'Odchod' : req.final === 'nakup' ? 'Nákup' : 'Nákup / Odchod') : st.label;
          return (
            <li key={st.id} className={`step ${cls}`} aria-current={cls === 'current' ? 'step' : undefined}>
              <span className="step-dot">
                <StepIcon cls={cls} />
              </span>
              <span className="step-label">{label}</span>
              <span className="sr-only">{clsLabel[cls]}</span>
              {!compact && run?.status === 'done' && (
                <span className="step-meta">
                  {run.by}
                  <br />
                  {run.date && fmtDay(run.date)}
                  {run.outcome && run.outcome !== 'schvaleno' && run.outcome !== 'podano' ? ` · ${outcomeLabel[run.outcome]}` : ''}
                </span>
              )}
              {st.id === 'posouzeni' && req.block && (
                <span className="step-subs">
                  {domains.map((dm) => {
                    const b = req.block![dm];
                    const c = runClass(b, b?.status === 'active');
                    return (
                      <span key={dm} className={`sub-chip ${c}`} title={`${domainLabel[dm]}: ${clsLabel[c]}${b?.condition ? ` – ${b.condition}` : ''}`}>
                        <StepIcon cls={c} />
                        {domainLabel[dm]}
                        <span className="sr-only">{clsLabel[c]}</span>
                      </span>
                    );
                  })}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {!compact && <StepperStatus req={req} vendor={vendor} />}
      {compact && (
        <p className="stepper-line small">
          {p.holders.length > 0 && (
            <>
              <b>{p.summary}</b> · má {p.holders.map((h) => h.name).join(', ')}
            </>
          )}
          {p.next && <span className="muted"> · další: {p.next.who.map((h) => h.name).join(', ')}</span>}
        </p>
      )}
      {ended && compact && <p className="stepper-line small muted">{req.final === 'nakup' ? 'Uzavřeno nákupem (měsíční předplatné).' : 'Uzavřeno odchodem, data vrácena a vymazána.'}</p>}
    </div>
  );
}

function StepperStatus({ req, vendor }: { req: TrialRequest; vendor: string }) {
  const p = progressOf(req, vendor);
  const st = req.state;
  const blockWaiting = req.block && Object.values(req.block).find((b) => b?.status === 'waiting_vendor');
  const conds = [...Object.values(req.steps), ...Object.values(req.block ?? {})].filter((r) => r?.condition && r.status === 'done');

  let headline: string;
  if (st === 'draft') headline = 'Žádost je rozpracovaná, zatím nebyla podána.';
  else if (st === 'submitted') headline = 'Předkontrola: firma doplňuje dossier, posuzovatelé zatím nezačali.';
  else if (st === 'approved_for_trial') headline = 'Všechna schválení před smlouvou jsou hotová.';
  else if (st === 'purchased') headline = 'Uzavřeno nákupem – aplikace je v měsíčním předplatném.';
  else if (st === 'exited') headline = 'Pilotní provoz ukončen, data vrácena a potvrzení o výmazu přijato.';
  else if (st === 'rejected') headline = 'Žádost byla zamítnuta.';
  else if (st === 'withdrawn') headline = 'Žádost stažena žadatelem.';
  else if (st === 'on_hold') headline = 'Žádost je pozastavena – firma neodpověděla do termínu.';
  else if (st === 'trial_active') headline = `Pilotní provoz probíhá do ${req.trialEnd ? fmtDay(req.trialEnd, true) : '—'}.`;
  else headline = `Aktuální krok: ${p.summary}.`;

  return (
    <div className="stepper-status">
      <p className="stepper-headline">{headline}</p>
      <dl className="stepper-facts">
        {p.holders.length > 0 && (
          <div>
            <dt>
              <UserRound size={14} aria-hidden /> Teď má žádost
            </dt>
            <dd>{who(p.holders)}</dd>
          </div>
        )}
        {(st === 'draft' || st === 'in_approval' || st === 'contracting' || st === 'evaluating' || st === 'submitted') && p.currentRun?.since && (
          <div>
            <dt>
              <Clock4 size={14} aria-hidden /> Čeká
            </dt>
            <dd className={p.overdue ? 'overdue' : undefined}>
              {workdaysLabel(p.waiting)} {p.due && `· termín SLA ${fmtDay(p.due)}`} {p.overdue && '· po termínu'}
            </dd>
          </div>
        )}
        {st === 'submitted' && p.due && (
          <div>
            <dt>
              <Clock4 size={14} aria-hidden /> Lhůta firmy
            </dt>
            <dd>do {fmtDay(p.due)} · SLA nemocnice zatím neběží</dd>
          </div>
        )}
        {blockWaiting?.since && (
          <div>
            <dt>
              <CirclePause size={14} aria-hidden /> Čeká na firmu
            </dt>
            <dd>
              od {fmtDay(blockWaiting.since)} – {blockWaiting.note}. SLA nemocnice stojí.
            </dd>
          </div>
        )}
        {st === 'trial_active' && req.trialStart && (
          <div>
            <dt>
              <Clock4 size={14} aria-hidden /> Pilotní provoz
            </dt>
            <dd>
              {fmtDay(req.trialStart, true)} – {req.trialEnd && fmtDay(req.trialEnd, true)} · {p.currentRun?.note}
            </dd>
          </div>
        )}
        {p.next ? (
          <div>
            <dt>Další na řadě</dt>
            <dd>
              <b>{p.next.label}:</b> {who(p.next.who)}
            </dd>
          </div>
        ) : (
          <div>
            <dt>Další na řadě</dt>
            <dd className="muted">Nikdo – žádost je uzavřená.</dd>
          </div>
        )}
        {req.note && (
          <div>
            <dt>
              {st === 'rejected' ? <Ban size={14} aria-hidden /> : <CirclePause size={14} aria-hidden />} Poznámka
            </dt>
            <dd>{req.note}</dd>
          </div>
        )}
        {conds.length > 0 && (
          <div>
            <dt>Podmínky</dt>
            <dd>
              <ul className="stepper-conds">
                {conds.map((c, i) => (
                  <li key={i}>
                    {c!.condition} <span className="muted">({c!.by})</span>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}
        {req.submitted && (
          <div>
            <dt>Celkem od podání</dt>
            <dd>{daysLabel(daysBetween(req.submitted, closedAt(req) ?? DEMO_TODAY))}{closedAt(req) ? ' (uzavřeno)' : ` (k ${fmtDay(DEMO_TODAY, true)})`}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
