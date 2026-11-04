// Průběh implementace ve třech celcích (DEC-020): Příprava, Trial, Integrace.
// Stejný průběh je v řádku přehledu Implementace i v detailu žádosti (tam jsou kroky klikací).
import { domainLabel, domains } from '../../data/trial/catalog';
import type { RunStatus, StepId, StepRun, TrialRequest } from '../../data/trial/requests';

/** Stav jednoho bodu průběhu: splněno, probíhá/čeká, nadcházející, zamítnuto, nevztahuje se. */
export type Dot = 'done' | 'now' | 'todo' | 'fail' | 'skip';
export const dotOf = (run: StepRun | undefined): Dot => {
  const s: RunStatus | undefined = run?.status;
  if (s === 'done') return 'done';
  if (s === 'rejected') return 'fail';
  if (s === 'withdrawn') return 'skip';
  if (s === 'active' || s === 'waiting_vendor' || s === 'on_hold') return 'now';
  return 'todo';
};

export const dotLabel: Record<Dot, string> = { done: 'splněno', now: 'probíhá / čeká', todo: 'nadcházející', fail: 'zamítnuto', skip: 'nevztahuje se' };

/** Klíč části průběhu (Smlouva je dvakrát – před pilotem a po rozhodnutí). */
export type PartKey = 'primar' | 'namestek' | 'firma' | 'posouzeni' | 'smlouva' | 'pilot' | 'kpi' | 'rozhodnuti' | 'nakup' | 'licence';

export interface LineStep {
  key: PartKey;
  /** Krok šablony A, ke kterému část patří. */
  step: StepId;
  label: string;
  dot: Dot;
  sub?: { label: string; dot: Dot }[];
}

/** Fáze implementace (DEC-020): Příprava, Trial (pilotní provoz), Integrace. */
export type Phase = 'priprava' | 'trial' | 'integrace';
export const phaseLabel: Record<Phase, string> = { priprava: 'Příprava', trial: 'Trial', integrace: 'Integrace' };

export interface LineGroup {
  id: Phase;
  label: string;
  steps: LineStep[];
}

/** Ve které fázi žádost je. */
export function phaseOf(r: TrialRequest): Phase {
  if (r.state === 'purchased') return 'integrace';
  if (['trial_active', 'evaluating', 'exited'].includes(r.state)) return 'trial';
  return 'priprava';
}

/** Průběh ve třech celcích: Příprava (Primář, Náměstek, Firma, 4 oblasti, Smlouva), Trial (Pilot, KPI, Rozhodnutí), Integrace (Smlouva, Licence). */
export function lineup(r: TrialRequest): LineGroup[] {
  const st = r.steps;
  const blockRun = st.posouzeni;
  const sub = domains.map((d) => ({ label: domainLabel[d], dot: dotOf(r.block ? r.block[d] : blockRun) }));
  const blockDot: Dot = sub.some((x) => x.dot === 'fail') ? 'fail' : sub.every((x) => x.dot === 'done') ? 'done' : sub.some((x) => x.dot !== 'todo') ? 'now' : 'todo';
  const end: Dot = r.final === 'odchod' ? 'skip' : dotOf(st.zaver);
  return [
    {
      id: 'priprava',
      label: 'Příprava',
      steps: [
        { key: 'primar', step: 'primar', label: 'Primář', dot: dotOf(st.primar) },
        { key: 'namestek', step: 'namestek', label: 'Náměstek', dot: dotOf(st.namestek) },
        { key: 'firma', step: 'firma', label: 'Firma', dot: dotOf(st.firma) },
        { key: 'posouzeni', step: 'posouzeni', label: '4 oblasti', dot: blockDot, sub },
        { key: 'smlouva', step: 'smlouva', label: 'Smlouva', dot: dotOf(st.smlouva) },
      ],
    },
    {
      id: 'trial',
      label: 'Trial',
      steps: [
        { key: 'pilot', step: 'pilot', label: 'Pilot', dot: dotOf(st.pilot) },
        { key: 'kpi', step: 'kpi', label: 'KPI', dot: dotOf(st.kpi) },
        { key: 'rozhodnuti', step: 'rozhodnuti', label: 'Rozhodnutí', dot: dotOf(st.rozhodnuti) },
      ],
    },
    {
      id: 'integrace',
      label: 'Integrace',
      steps: [
        { key: 'nakup', step: 'zaver', label: 'Smlouva', dot: end },
        { key: 'licence', step: 'zaver', label: 'Licence', dot: end },
      ],
    },
  ];
}

/** Výchozí vybraná část: první probíhající nebo zamítnutá, jinak poslední splněná, jinak první. */
export function currentPart(groups: LineGroup[]): PartKey {
  const all = groups.flatMap((g) => g.steps);
  return (all.find((s) => s.dot === 'now' || s.dot === 'fail') ?? [...all].reverse().find((s) => s.dot === 'done') ?? all[0]).key;
}

/** Kroky jedné fáze. S `onSelect` jsou kroky tlačítka (detail žádosti), jinak jen ukazatel (přehled). */
export function PhaseSteps({ g, selected, onSelect }: { g: LineGroup; selected?: PartKey; onSelect?: (k: PartKey) => void }) {
  return (
    <ol className={onSelect ? 'ln-steps ln-steps-lg' : 'ln-steps'} aria-label={g.label}>
      {g.steps.map((s) => {
        const body = (
          <>
            {s.sub && (
              <span className="ln-sub">
                {s.sub.map((x) => (
                  <i key={x.label} className={`ln-${x.dot}`} title={`${x.label}: ${dotLabel[x.dot]}`} />
                ))}
              </span>
            )}
            <span className="ln-label">{s.label}</span>
            <span className="sr-only">{dotLabel[s.dot]}</span>
          </>
        );
        return (
          <li key={s.key} className={`ln ln-${s.dot}${selected === s.key ? ' sel' : ''}`} title={`${s.label}: ${dotLabel[s.dot]}`}>
            {onSelect ? (
              <button type="button" className="ln-btn" onClick={() => onSelect(s.key)} aria-pressed={selected === s.key}>
                {body}
              </button>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ol>
  );
}
