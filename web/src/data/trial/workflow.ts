// Definice schvalovacího procesu pro editor (brief §5). Fáze 0b: jen data pro rozhraní, bez enginu.
import type { Domain } from './catalog';

export type StepType =
  | 'zadost'
  | 'schvaleni'
  | 'firma'
  | 'posouzeni'
  | 'smlouva'
  | 'eticka'
  | 'pilot'
  | 'kpi'
  | 'rozhodnuti'
  | 'nakup'
  | 'odchod'
  | 'informovat';

export const stepTypeLabel: Record<StepType, string> = {
  zadost: 'Žádost',
  schvaleni: 'Schválení',
  firma: 'Firma',
  posouzeni: 'Posouzení oblasti',
  smlouva: 'Smlouva',
  eticka: 'Etická komise',
  pilot: 'Pilotní provoz',
  kpi: 'Vyhodnocení KPI',
  rozhodnuti: 'Rozhodnutí',
  nakup: 'Nákup (měsíční předplatné)',
  odchod: 'Odchod',
  informovat: 'Informovat',
};

export const assigneeRules = [
  'Žadatel',
  'Primář oddělení žadatele',
  'Náměstek pro léčebnou péči',
  'Ředitel',
  'Vlastník oblasti',
  'Právník + podepisující osoba',
  'Odborný garant',
  'Nákup',
  'Firma (dodavatel)',
  'Pojmenovaná osoba',
  'Skupina – rozhodne kdokoli',
  'Skupina – rozhodnou všichni',
] as const;
export type AssigneeRule = (typeof assigneeRules)[number];

export const conditions = ['Vždy', 'Jen pokud zpracovává osobní údaje', 'Jen u zdravotnického prostředku', 'Jen nad měsíční cenu 20 000 Kč', 'Jen u výzkumu'] as const;
export type Condition = (typeof conditions)[number];

export const returnTargets = ['Žadatel', 'Firma', 'Předchozí krok'] as const;

export interface WfStep {
  id: string;
  type: StepType;
  name: string;
  domain?: Domain;
  assignee: AssigneeRule;
  person?: string;
  deputy: string;
  sla: number;
  condition: Condition;
  returnTo: (typeof returnTargets)[number];
  requiredBeforeTrial: boolean;
  autoClear: boolean;
}

/** Uzel plátna: jeden krok, nebo paralelní skupina kroků. */
export type WfNode = { id: string; kind: 'step'; step: WfStep } | { id: string; kind: 'group'; name: string; steps: WfStep[] };

let seq = 0;
export const newId = (p = 's') => `${p}${++seq}`;

export function makeStep(type: StepType, over: Partial<WfStep> = {}): WfStep {
  const base: Record<StepType, Partial<WfStep>> = {
    zadost: { assignee: 'Žadatel', sla: 0 },
    schvaleni: { assignee: 'Primář oddělení žadatele', sla: 5 },
    firma: { assignee: 'Firma (dodavatel)', sla: 5, returnTo: 'Firma' },
    posouzeni: { assignee: 'Vlastník oblasti', sla: 5, requiredBeforeTrial: true },
    smlouva: { assignee: 'Právník + podepisující osoba', sla: 10 },
    eticka: { assignee: 'Žadatel', sla: 10, condition: 'Jen u výzkumu' },
    pilot: { assignee: 'Odborný garant', sla: 0 },
    kpi: { assignee: 'Odborný garant', sla: 5 },
    rozhodnuti: { assignee: 'Náměstek pro léčebnou péči', sla: 5 },
    nakup: { assignee: 'Nákup', sla: 10 },
    odchod: { assignee: 'Odborný garant', sla: 10 },
    informovat: { assignee: 'Primář oddělení žadatele', sla: 0 },
  };
  return {
    id: newId(),
    type,
    name: stepTypeLabel[type],
    deputy: 'Zástupce dle organizační struktury',
    condition: 'Vždy',
    returnTo: 'Žadatel',
    requiredBeforeTrial: false,
    autoClear: false,
    sla: 5,
    assignee: 'Žadatel',
    ...base[type],
    ...over,
  };
}

const domainStep = (d: Domain, name: string) =>
  makeStep('posouzeni', { domain: d, name, condition: d === 'gdpr' ? 'Jen pokud zpracovává osobní údaje' : 'Vždy', requiredBeforeTrial: d !== 'ostatni' });

const block = (): WfNode => ({
  id: newId('g'),
  kind: 'group',
  name: 'Posouzení 4 oblastí',
  steps: [domainStep('legal', 'Legal'), domainStep('gdpr', 'GDPR'), domainStep('security', 'Security'), domainStep('ostatni', 'Ostatní')],
});

const st = (type: StepType, over: Partial<WfStep> = {}): WfNode => {
  const s = makeStep(type, over);
  return { id: s.id, kind: 'step', step: s };
};

export interface Template {
  id: string;
  name: string;
  version: number;
  status: 'publikováno' | 'koncept';
  rule: string;
  nodes: () => WfNode[];
}

export const templates: Template[] = [
  {
    id: 'A',
    name: 'A – Souhlas vedení napřed',
    version: 2,
    status: 'publikováno',
    rule: 'Výchozí',
    nodes: () => [
      st('zadost'),
      st('schvaleni', { name: 'Primář' }),
      st('schvaleni', { name: 'Náměstek', assignee: 'Náměstek pro léčebnou péči' }),
      st('firma'),
      block(),
      st('smlouva'),
      st('pilot'),
      st('kpi'),
      st('rozhodnuti'),
    ],
  },
  {
    id: 'B',
    name: 'B – Odborné posouzení napřed',
    version: 1,
    status: 'publikováno',
    rule: 'Zdravotnický prostředek',
    nodes: () => [
      st('zadost'),
      st('schvaleni', { name: 'Primář' }),
      st('firma'),
      block(),
      st('schvaleni', { name: 'Náměstek / Ředitel', assignee: 'Náměstek pro léčebnou péči' }),
      st('smlouva'),
      st('pilot'),
      st('kpi'),
      st('rozhodnuti'),
    ],
  },
  {
    id: 'C',
    name: 'Bez osobních údajů – zkrácený proces',
    version: 1,
    status: 'koncept',
    rule: 'Aplikace nezpracovává osobní údaje',
    nodes: () => [st('zadost'), st('schvaleni', { name: 'Primář' }), st('firma'), st('smlouva'), st('pilot'), st('kpi'), st('rozhodnuti')],
  },
];

/** Validace před publikováním (brief §5.3). Vrací seznam chyb. */
export function validate(nodes: WfNode[]): string[] {
  const errs: string[] = [];
  const flat = nodes.flatMap((n, i) => (n.kind === 'step' ? [{ s: n.step, i }] : n.steps.map((s) => ({ s, i }))));
  const first = nodes[0];
  if (!first || first.kind !== 'step' || first.step.type !== 'zadost') errs.push('Proces musí začínat krokem Žádost.');
  const pilot = flat.find((x) => x.s.type === 'pilot');
  if (!pilot) errs.push('V procesu chybí Pilotní provoz.');
  else {
    if (!flat.some((x) => x.s.type === 'smlouva' && x.i < pilot.i)) errs.push('Pilotnímu provozu musí předcházet Smlouva.');
    (['legal', 'gdpr', 'security'] as Domain[]).forEach((d) => {
      if (!flat.some((x) => x.s.type === 'posouzeni' && x.s.domain === d && x.i < pilot.i))
        errs.push(`Před pilotním provozem chybí posouzení ${d === 'legal' ? 'Legal' : d === 'gdpr' ? 'GDPR' : 'Security'} (povinné minimum).`);
    });
    flat.filter((x) => x.s.requiredBeforeTrial && x.i > pilot.i).forEach((x) => errs.push(`Krok „${x.s.name}“ je označený jako povinný před pilotním provozem, ale je až za ním.`));
    const kpi = flat.find((x) => x.s.type === 'kpi');
    if (!kpi || kpi.i < pilot.i) errs.push('Vyhodnocení KPI musí následovat po pilotním provozu.');
  }
  if (!flat.some((x) => x.s.type === 'rozhodnuti')) errs.push('Chybí Rozhodnutí, ze kterého vede větvení Nákup / Prodloužení / Odchod.');
  flat.filter((x) => x.s.assignee === 'Pojmenovaná osoba' && !x.s.person?.trim()).forEach((x) => errs.push(`Krok „${x.s.name}“ nemá určenou osobu.`));
  flat.filter((x) => !x.s.deputy.trim()).forEach((x) => errs.push(`Krok „${x.s.name}“ nemá zástupce.`));
  return errs;
}
