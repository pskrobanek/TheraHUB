// Jedno místo s workflows nemocnice pro celý prototyp: sekce Workflow, detail aplikace (záložka Workflow)
// i počty „Workflows“ na dlaždicích čtou stejný seznam. V ukázce se drží v paměti stránky (po obnovení se vrátí výchozí).
import { storeApps } from './store';
import { appApis, toolSpecs, type ApiModule, type Field } from './workflowApis';
import { hospitalWorkflows, toolById, type HospitalWorkflow, type WfEdge, type WfNode } from './workflows';

let list: HospitalWorkflow[] = [...hospitalWorkflows];

export const getWorkflows = () => list;

/** Uloží workflow (nové přidá, existující nahradí). */
export function saveWorkflow(w: HospitalWorkflow) {
  list = list.some((x) => x.id === w.id) ? list.map((x) => (x.id === w.id ? w : x)) : [...list, w];
}

/** Workflows, ve kterých je aplikace zapojená. */
export const workflowsForApp = (appId: string) => list.filter((w) => w.nodes.some((nd) => nd.kind === 'app' && nd.ref === appId));

// ---------- Popis kroků (sdílí editor i detail aplikace) ----------

const appById = Object.fromEntries(storeApps.map((a) => [a.id, a]));

export const nodeLabel = (nd: WfNode) => (nd.kind === 'app' ? (appById[nd.ref]?.name ?? nd.ref) : (toolById[nd.ref]?.label ?? nd.ref));
export const moduleOf = (nd: WfNode): ApiModule | undefined => (nd.kind === 'app' ? appApis[nd.ref]?.modules.find((m) => m.id === nd.module) : undefined);
/** Vstupy a výstupy kroku podle vybrané funkce (aplikace) nebo nástroje. */
export const ioOf = (nd: WfNode): { inputs: Field[]; outputs: Field[] } =>
  nd.kind === 'app' ? (moduleOf(nd) ?? { inputs: [], outputs: [] }) : (toolSpecs[nd.ref] ?? { inputs: [], outputs: [] });

export const TOKEN = /^\{\{([^.}]+)\.([^}]+)\}\}$/;

/** Namapovaná hodnota {{idKroku.klíč}} → zdrojový krok a jeho výstup. */
export function resolveToken(token: string, nodes: WfNode[]): { src: WfNode; field: Field | undefined; key: string } | null {
  const m = token.match(TOKEN);
  const src = m && nodes.find((nd) => nd.id === m[1]);
  if (!m || !src) return null;
  return { src, key: m[2], field: ioOf(src).outputs.find((f) => f.key === m[2]) };
}

export const incoming = (id: string, edges: WfEdge[]) => edges.filter((e) => e.to === id);
export const outgoing = (id: string, edges: WfEdge[]) => edges.filter((e) => e.from === id);
