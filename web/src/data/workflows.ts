// Workflows nemocnice: propojení aplikací a obecných nástrojů do klinických a provozních celků (ENDGAME, sekce Workflow).
// Ukázková data. Prahy a klinická pravidla v uzlech jsou zástupné – obsah určí odborníci nemocnice.
import {
  BadgeCheck,
  BellRing,
  CalendarClock,
  CircleStop,
  ClipboardCheck,
  Database,
  EyeOff,
  FileChartColumn,
  GitFork,
  Hourglass,
  ListChecks,
  ListTodo,
  MessageSquare,
  Play,
  Radio,
  Signature,
  Split,
  type LucideIcon,
} from 'lucide-react';
import { appApis } from './workflowApis';

export type ToolGroup = 'spoustece' | 'kontrola' | 'rizeni' | 'komunikace' | 'data';
export const toolGroupLabel: Record<ToolGroup, string> = {
  spoustece: 'Spouštěče',
  kontrola: 'Kontrolní úlohy',
  rizeni: 'Řízení toku',
  komunikace: 'Komunikace',
  data: 'Data a výstupy',
};

export interface Tool {
  id: string;
  label: string;
  group: ToolGroup;
  icon: LucideIcon;
  desc: string;
}

/** Obecné nástroje, které lze zapracovat do libovolného workflow (nejsou to aplikace z App Storu). */
export const tools: Tool[] = [
  { id: 'start', label: 'Zařazení pacienta', group: 'spoustece', icon: Play, desc: 'Lékař zařadí pacienta do workflow.' },
  { id: 'plan', label: 'Plán / čas', group: 'spoustece', icon: CalendarClock, desc: 'Spustí se v daný den nebo pravidelně.' },
  { id: 'nis', label: 'Událost z NIS', group: 'spoustece', icon: Radio, desc: 'Např. příjem, propuštění nebo nová diagnóza (FHIR).' },
  { id: 'kontrola', label: 'Kontrolní úloha lékaře', group: 'kontrola', icon: ClipboardCheck, desc: 'Lékař zkontroluje výsledek a potvrdí další krok.' },
  { id: 'schvaleni', label: 'Schválení', group: 'kontrola', icon: BadgeCheck, desc: 'Pokračuje až po schválení určenou rolí.' },
  { id: 'validace', label: 'Kontrola dat', group: 'kontrola', icon: ListChecks, desc: 'Ověří úplnost a platnost dat před dalším krokem.' },
  { id: 'souhlas', label: 'Souhlas pacienta', group: 'kontrola', icon: Signature, desc: 'Pokračuje jen s platným souhlasem pacienta.' },
  { id: 'podminka', label: 'Podmínka', group: 'rizeni', icon: Split, desc: 'Větví tok podle hodnoty (práh určí lékař).' },
  { id: 'paralelne', label: 'Paralelně', group: 'rizeni', icon: GitFork, desc: 'Spustí více kroků najednou.' },
  { id: 'cekani', label: 'Čekání', group: 'rizeni', icon: Hourglass, desc: 'Počká daný čas nebo na odpověď.' },
  { id: 'konec', label: 'Konec', group: 'rizeni', icon: CircleStop, desc: 'Ukončí workflow pro pacienta.' },
  { id: 'upozorneni', label: 'Upozornění lékaři', group: 'komunikace', icon: BellRing, desc: 'Alert do TheraHUB a NIS ošetřujícímu lékaři.' },
  { id: 'zprava', label: 'Zpráva pacientovi', group: 'komunikace', icon: MessageSquare, desc: 'SMS nebo zpráva v aplikaci pacienta.' },
  { id: 'ukol', label: 'Úkol sestře', group: 'komunikace', icon: ListTodo, desc: 'Úkol do pracovního seznamu sestry.' },
  { id: 'zapis', label: 'Zápis do NIS', group: 'data', icon: Database, desc: 'Uloží výsledek do dokumentace přes FHIR.' },
  { id: 'report', label: 'Report', group: 'data', icon: FileChartColumn, desc: 'Souhrn pro lékaře nebo vedení oddělení.' },
  { id: 'pseudo', label: 'Pseudonymizace pro Science', group: 'data', icon: EyeOff, desc: 'Předá pseudonymizovaná data do výzkumu (OMOP).' },
];
export const toolById = Object.fromEntries(tools.map((t) => [t.id, t])) as Record<string, Tool>;

export interface WfNode {
  id: string;
  kind: 'app' | 'tool';
  /** Id aplikace z App Storu, nebo id nástroje. */
  ref: string;
  x: number;
  y: number;
  /** Vlastní popisek kroku (např. „ePRO dotazník“). */
  note?: string;
  /** Vybraná funkce z API aplikace (workflowApis.ts). */
  module?: string;
  /** Hodnoty vstupů: text, nebo odkaz na výstup dřívějšího kroku ve tvaru {{idKroku.klíč}}. */
  config?: Record<string, string>;
  /** Chování při chybě kroku. */
  onError?: string;
}

export interface WfEdge {
  from: string;
  to: string;
  label?: string;
}

export interface WfGraph {
  nodes: WfNode[];
  edges: WfEdge[];
}

export interface WfTemplate extends WfGraph {
  id: string;
  name: string;
  desc: string;
  area: string;
}

export interface HospitalWorkflow extends WfGraph {
  id: string;
  name: string;
  desc: string;
  status: 'aktivni' | 'koncept' | 'pozastaveno';
  patients: number;
  /** Tým, který workflow spravuje. */
  owner: string;
  updated: string;
}

export const statusLabel: Record<HospitalWorkflow['status'], string> = { aktivni: 'Aktivní', koncept: 'Koncept', pozastaveno: 'Pozastaveno' };

const n = (id: string, kind: WfNode['kind'], ref: string, x: number, y: number, note?: string, module?: string): WfNode => ({ id, kind, ref, x, y, note, module });
const e = (from: string, to: string, label?: string): WfEdge => ({ from, to, label });

/** Výchozí funkce aplikace v ukázkových datech: krok před Podmínkou dodává data (spouštěč), jinak akce. */
function withDefaults<T extends WfGraph>(g: T): T {
  return {
    ...g,
    nodes: g.nodes.map((nd) => {
      const api = nd.kind === 'app' ? appApis[nd.ref] : undefined;
      if (!api || nd.module) return nd;
      const feedsCondition = g.edges.some((ed) => ed.from === nd.id && g.nodes.find((x) => x.id === ed.to)?.ref === 'podminka');
      const m = api.modules.find((x) => x.kind === (feedsCondition ? 'trigger' : 'action')) ?? api.modules[0];
      return { ...nd, module: m.id };
    }),
  };
}

/** Aplikace zapojené do grafu. */
export const appsOf = (g: WfGraph) => [...new Set(g.nodes.filter((x) => x.kind === 'app').map((x) => x.ref))];

// ---------- Workflows nemocnice (počty zapojení sedí s „Workflows“ na dlaždicích Moje aplikace) ----------

export const hospitalWorkflows: HospitalWorkflow[] = ([
  {
    id: 'rt-hlava-krk',
    name: 'Péče během radioterapie hlavy a krku',
    desc: 'Sledování toxicity, polykání, výživy a kůže od první frakce do kontroly po léčbě.',
    status: 'aktivni',
    patients: 18,
    owner: 'Radiační onkologie',
    updated: '2. 11.',
    nodes: [
      n('a', 'tool', 'start', 20, 170),
      n('b', 'tool', 'paralelne', 200, 170),
      n('c', 'app', 'oncoready', 390, 30, 'ePRO 1× týdně'),
      n('d', 'app', 'toxitrack', 390, 120),
      n('e', 'app', 'polykej', 390, 210),
      n('f', 'app', 'nutriplan', 390, 300),
      n('g', 'app', 'dermafoto', 390, 390),
      n('h', 'tool', 'podminka', 600, 120, 'Toxicita nad prahem? (práh určí lékař)'),
      n('i', 'tool', 'upozorneni', 790, 60),
      n('j', 'app', 'bolestdenik', 600, 300),
      n('k', 'tool', 'kontrola', 790, 200),
      n('l', 'app', 'visitscribe', 980, 200, 'Záznam kontroly'),
    ],
    edges: [e('a', 'b'), e('b', 'c'), e('b', 'd'), e('b', 'e'), e('b', 'f'), e('b', 'g'), e('c', 'h'), e('d', 'h'), e('h', 'i', 'ano'), e('h', 'k', 'ne'), e('f', 'j'), e('j', 'k'), e('i', 'k'), e('k', 'l')],
  },
  {
    id: 'prescreening',
    name: 'Prescreening do klinických studií',
    desc: 'Vytipování vhodných pacientů pro otevřené studie a ověření zájmu a souhlasu.',
    status: 'aktivni',
    patients: 46,
    owner: 'Onkologie – klinické studie',
    updated: '28. 10.',
    nodes: [
      n('a', 'tool', 'nis', 20, 150, 'Nová onkologická diagnóza'),
      n('b', 'app', 'oncoready', 220, 150, 'Prescreening', 'prescreening'),
      n('c', 'app', 'klid', 420, 60, 'Screening distresu'),
      n('d', 'tool', 'kontrola', 420, 230, 'Lékař potvrdí vhodnost'),
      n('e', 'tool', 'souhlas', 620, 230),
      n('f', 'app', 'visitscribe', 820, 230, 'Záznam do dokumentace'),
      n('g', 'tool', 'pseudo', 820, 80),
    ],
    edges: [e('a', 'b'), e('b', 'c'), e('b', 'd'), e('d', 'e'), e('e', 'f'), e('e', 'g')],
  },
  {
    id: 'tox-system',
    name: 'Monitoring toxicity systémové léčby',
    desc: 'Hlášení nežádoucích účinků a adherence k lékům mezi cykly chemoterapie.',
    status: 'aktivni',
    patients: 24,
    owner: 'Onkologie',
    updated: '30. 10.',
    nodes: [
      n('a', 'tool', 'plan', 20, 150, 'Den 3 a 10 cyklu'),
      n('b', 'app', 'oncoready', 210, 60, 'ePRO'),
      n('c', 'app', 'lekyhlidac', 210, 240),
      n('d', 'app', 'toxitrack', 410, 60),
      n('e', 'tool', 'podminka', 610, 150, 'Závažný nežádoucí účinek?'),
      n('f', 'tool', 'upozorneni', 810, 60),
      n('g', 'tool', 'ukol', 810, 240, 'Telefonát sestry'),
      n('k', 'tool', 'kontrola', 1000, 150),
      n('h', 'app', 'visitscribe', 1190, 150),
    ],
    edges: [e('a', 'b'), e('a', 'c'), e('b', 'd'), e('d', 'e'), e('c', 'e'), e('e', 'f', 'ano'), e('e', 'g', 'ne'), e('f', 'k'), e('g', 'k'), e('k', 'h')],
  },
  {
    id: 'kardioonko',
    name: 'Kardioonkologický dohled',
    desc: 'Domácí monitoring srdce a aktivity u pacientů s kardiotoxickou léčbou.',
    status: 'koncept',
    patients: 0,
    owner: 'Kardiologie',
    updated: '3. 11.',
    nodes: [
      n('a', 'tool', 'start', 20, 150),
      n('b', 'app', 'cardiowatch', 210, 60),
      n('c', 'app', 'krokomer', 210, 240),
      n('d', 'app', 'lekyhlidac', 410, 240),
      n('e', 'tool', 'podminka', 610, 150, 'Odchylka od normy? (práh určí kardiolog)'),
      n('f', 'tool', 'upozorneni', 810, 60),
      n('g', 'app', 'visitscribe', 810, 240),
    ],
    edges: [e('a', 'b'), e('a', 'c'), e('c', 'd'), e('b', 'e'), e('d', 'e'), e('e', 'f', 'ano'), e('e', 'g', 'ne')],
  },
  {
    id: 'vyziva',
    name: 'Výživa a hmotnost během léčby',
    desc: 'Týdenní vážení a jídelníček; při poklesu hmotnosti nutriční konzultace.',
    status: 'pozastaveno',
    patients: 9,
    owner: 'Nutriční péče',
    updated: '14. 10.',
    nodes: [
      n('a', 'tool', 'plan', 20, 120, '1× týdně'),
      n('b', 'app', 'nutriplan', 210, 120),
      n('c', 'tool', 'podminka', 410, 120, 'Pokles hmotnosti nad prahem?'),
      n('d', 'tool', 'ukol', 610, 40, 'Nutriční konzultace'),
      n('e', 'tool', 'report', 610, 200, 'Měsíční přehled'),
    ],
    edges: [e('a', 'b'), e('b', 'c'), e('c', 'd', 'ano'), e('c', 'e', 'ne')],
  },
] as HospitalWorkflow[]).map(withDefaults);

// ---------- Šablony TheraHUB (výchozí body; nemocnice si je upraví) ----------

export const templates: WfTemplate[] = ([
  {
    id: 'sab-epro',
    name: 'ePRO s upozorněním lékaře',
    area: 'Monitorace',
    desc: 'Pravidelný dotazník pacienta, podmínka a upozornění; jinak záznam do NIS.',
    nodes: [
      n('a', 'tool', 'plan', 20, 140),
      n('b', 'app', 'oncoready', 210, 140, 'ePRO dotazník'),
      n('c', 'tool', 'podminka', 410, 140),
      n('d', 'tool', 'upozorneni', 610, 50),
      n('e', 'tool', 'kontrola', 810, 50),
      n('f', 'tool', 'zapis', 610, 230),
    ],
    edges: [e('a', 'b'), e('b', 'c'), e('c', 'd', 'ano'), e('c', 'f', 'ne'), e('d', 'e')],
  },
  {
    id: 'sab-studie',
    name: 'Prescreening a souhlas',
    area: 'Výzkum',
    desc: 'Událost z NIS, kontrola vhodnosti lékařem, souhlas a předání pseudonymizovaných dat.',
    nodes: [
      n('a', 'tool', 'nis', 20, 130),
      n('b', 'tool', 'validace', 210, 130),
      n('c', 'tool', 'kontrola', 410, 130),
      n('d', 'tool', 'souhlas', 610, 130),
      n('e', 'tool', 'pseudo', 810, 130),
    ],
    edges: [e('a', 'b'), e('b', 'c'), e('c', 'd'), e('d', 'e')],
  },
  {
    id: 'sab-propusteni',
    name: 'Po propuštění domů',
    area: 'Provoz',
    desc: 'Událost propuštění, zpráva pacientovi, čekání a telefonát sestry.',
    nodes: [
      n('a', 'tool', 'nis', 20, 130, 'Propuštění'),
      n('b', 'tool', 'zprava', 210, 130),
      n('c', 'tool', 'cekani', 410, 130, '7 dní'),
      n('d', 'tool', 'ukol', 610, 130, 'Kontrolní telefonát'),
      n('e', 'tool', 'konec', 810, 130),
    ],
    edges: [e('a', 'b'), e('b', 'c'), e('c', 'd'), e('d', 'e')],
  },
  {
    id: 'sab-paralel',
    name: 'Souběžné sledování',
    area: 'Monitorace',
    desc: 'Několik aplikací najednou a společná kontrolní úloha lékaře.',
    nodes: [
      n('a', 'tool', 'start', 20, 150),
      n('b', 'tool', 'paralelne', 210, 150),
      n('c', 'app', 'toxitrack', 410, 50),
      n('d', 'app', 'nutriplan', 410, 150),
      n('e', 'app', 'bolestdenik', 410, 250),
      n('f', 'tool', 'kontrola', 620, 150),
      n('g', 'tool', 'report', 820, 150),
    ],
    edges: [e('a', 'b'), e('b', 'c'), e('b', 'd'), e('b', 'e'), e('c', 'f'), e('d', 'f'), e('e', 'f'), e('f', 'g')],
  },
] as WfTemplate[]).map(withDefaults);
