// Nastavení kroku workflow (inspirace make.com): funkce z API aplikace, připojení, vstupy zadané ručně nebo namapované
// z výstupů dřívějších kroků, výstupy pro další kroky a chování při chybě.
import { ArrowRight, Link2, Plug, ShieldCheck, Trash, X } from 'lucide-react';
import { storeApps } from '../../data/store';
import { appApis, moduleKindLabel, onErrorOptions, toolSpecs, type ApiModule, type Field } from '../../data/workflowApis';
import { toolById, type WfEdge, type WfNode } from '../../data/workflows';
import AppIcon from '../AppIcon';

const appById = Object.fromEntries(storeApps.map((a) => [a.id, a]));

export const nodeLabel = (nd: WfNode) => (nd.kind === 'app' ? (appById[nd.ref]?.name ?? nd.ref) : (toolById[nd.ref]?.label ?? nd.ref));
export const moduleOf = (nd: WfNode): ApiModule | undefined => (nd.kind === 'app' ? appApis[nd.ref]?.modules.find((m) => m.id === nd.module) : undefined);
/** Vstupy a výstupy kroku podle vybrané funkce (aplikace) nebo nástroje. */
export const ioOf = (nd: WfNode): { inputs: Field[]; outputs: Field[] } => (nd.kind === 'app' ? (moduleOf(nd) ?? { inputs: [], outputs: [] }) : (toolSpecs[nd.ref] ?? { inputs: [], outputs: [] }));

const TOKEN = /^\{\{([^.}]+)\.([^}]+)\}\}$/;

/** Kroky, ze kterých vede cesta do daného kroku (jen jejich výstupy lze mapovat). */
function ancestors(id: string, edges: WfEdge[]): Set<string> {
  const out = new Set<string>();
  const stack = [id];
  while (stack.length) {
    const cur = stack.pop()!;
    for (const ed of edges) if (ed.to === cur && !out.has(ed.from) && ed.from !== id) (out.add(ed.from), stack.push(ed.from));
  }
  return out;
}

interface Props {
  node: WfNode;
  nodes: WfNode[];
  edges: WfEdge[];
  numberOf: (id: string) => number;
  onChange: (patch: Partial<WfNode>) => void;
  onConnect: (to: string) => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function StepPanel({ node, nodes, edges, numberOf, onChange, onConnect, onDelete, onClose }: Props) {
  const app = node.kind === 'app' ? appById[node.ref] : undefined;
  const api = node.kind === 'app' ? appApis[node.ref] : undefined;
  const tool = node.kind === 'tool' ? toolById[node.ref] : undefined;
  const ToolIcon = tool?.icon;
  const mod = moduleOf(node);
  const { inputs, outputs } = ioOf(node);
  const config = node.config ?? {};
  const byId = Object.fromEntries(nodes.map((nd) => [nd.id, nd]));
  const anc = [...ancestors(node.id, edges)].map((id) => byId[id]).filter(Boolean).sort((a, b) => numberOf(a.id) - numberOf(b.id));
  const sources = anc.flatMap((nd) => ioOf(nd).outputs.map((f) => ({ nd, f, token: `{{${nd.id}.${f.key}}}` })));
  const next = edges.filter((ed) => ed.from === node.id).map((ed) => byId[ed.to]).filter(Boolean);

  const set = (key: string, v: string) => onChange({ config: { ...config, [key]: v } });
  const clear = (key: string) => {
    const c = { ...config };
    delete c[key];
    onChange({ config: c });
  };

  /** Popisek namapované hodnoty: „2. OncoReady › Nejvyšší stupeň toxicity“. */
  const pill = (token: string) => {
    const m = token.match(TOKEN);
    const src = m && byId[m[1]];
    if (!src) return null;
    const f = ioOf(src).outputs.find((x) => x.key === m![2]);
    return { n: numberOf(src.id), label: nodeLabel(src), field: f?.label ?? m![2], src };
  };

  const control = (f: Field) => {
    const v = config[f.key] ?? '';
    const p = v ? pill(v) : null;
    if (p)
      return (
        <span className="wf-pill on">
          <b>{p.n}</b> {p.label} › {p.field}
          <button onClick={() => clear(f.key)} aria-label={`Zrušit mapování ${f.label}`}>
            <X size={12} />
          </button>
        </span>
      );
    if (f.type === 'select')
      return (
        <select value={v} onChange={(e) => (e.target.value ? set(f.key, e.target.value) : clear(f.key))}>
          <option value="">— vyberte —</option>
          {f.options!.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      );
    if (f.type === 'bool')
      return (
        <label className="wf-check">
          <input type="checkbox" checked={v === 'ano'} onChange={(e) => set(f.key, e.target.checked ? 'ano' : 'ne')} /> {v === 'ano' ? 'Ano' : 'Ne'}
        </label>
      );
    return (
      <input
        type={f.type === 'number' ? 'number' : 'text'}
        value={v}
        placeholder={f.type === 'patient' ? 'Namapujte pacienta ze spouštěče' : ''}
        onChange={(e) => (e.target.value ? set(f.key, e.target.value) : clear(f.key))}
      />
    );
  };

  return (
    <aside className="wf-panel glass" aria-label={`Nastavení kroku ${nodeLabel(node)}`}>
      <header className="wf-panel-head">
        <span className="wf-num">{numberOf(node.id)}</span>
        {app ? (
          <AppIcon app={app} size={34} />
        ) : (
          ToolIcon && (
            <span className={`wf-tool-icon lg wf-g-${tool!.group}`}>
              <ToolIcon size={18} strokeWidth={2} aria-hidden />
            </span>
          )
        )}
        <div className="wf-panel-title">
          <h3>{nodeLabel(node)}</h3>
          <span className="muted small">{app ? app.tagline : tool?.desc}</span>
        </div>
        <button className="wf-panel-close" onClick={onClose} aria-label="Zpět na nástroje" title="Zpět na nástroje">
          <X size={16} />
        </button>
      </header>

      {api && (
        <section className="wf-sec">
          <h4>Funkce</h4>
          {(['trigger', 'action', 'search'] as const).map((k) => {
            const list = api.modules.filter((m) => m.kind === k);
            if (!list.length) return null;
            return (
              <div key={k} className="wf-mods">
                <span className="wf-mods-kind">{moduleKindLabel[k]}</span>
                {list.map((m) => (
                  <button key={m.id} className={m.id === node.module ? 'wf-mod on' : 'wf-mod'} onClick={() => onChange({ module: m.id, config: {} })} aria-pressed={m.id === node.module}>
                    <b>{m.label}</b>
                    <span className="muted small">{m.desc}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </section>
      )}

      {api && (
        <section className="wf-sec">
          <h4>Připojení</h4>
          <p className="wf-conn small">
            <Plug size={14} aria-hidden /> {api.connection}
          </p>
          <div className="wf-scopes">
            {api.scopes.map((sc) => (
              <code key={sc}>{sc}</code>
            ))}
          </div>
          <p className="muted small wf-node-note-text">
            <ShieldCheck size={13} aria-hidden /> Data mezi kroky jdou přes TheraHUB Node ve FHIR a zůstávají v nemocnici.
          </p>
        </section>
      )}

      {inputs.length > 0 && (
        <section className="wf-sec">
          <h4>Vstupy</h4>
          {inputs.map((f) => (
            <div key={f.key} className="wf-field">
              <label>
                {f.label}
                {f.required && <span className="wf-req" title="Povinné"> *</span>}
                {f.fhir && <span className="wf-fhir">{f.fhir}</span>}
              </label>
              {control(f)}
              {sources.length > 0 && f.type !== 'select' && f.type !== 'bool' && !(config[f.key] && pill(config[f.key])) && (
                <select className="wf-map" value="" onChange={(e) => e.target.value && set(f.key, e.target.value)} aria-label={`Mapovat ${f.label} z dřívějšího kroku`}>
                  <option value="">⇢ Mapovat z dřívějšího kroku…</option>
                  {anc.map((nd) => (
                    <optgroup key={nd.id} label={`${numberOf(nd.id)}. ${nodeLabel(nd)}`}>
                      {ioOf(nd).outputs.map((o) => (
                        <option key={o.key} value={`{{${nd.id}.${o.key}}}`}>
                          {o.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              )}
              {f.hint && <span className="muted small">{f.hint}</span>}
            </div>
          ))}
          {sources.length === 0 && <p className="muted small">Mapovat lze výstupy kroků, které do tohoto kroku vedou šipkou.</p>}
        </section>
      )}

      {node.kind === 'app' && !mod && <p className="cbox-warn small wf-sec">Vyberte funkci, kterou má aplikace v tomto kroku provést.</p>}

      {outputs.length > 0 && (
        <section className="wf-sec">
          <h4>Výstupy pro další kroky</h4>
          <div className="wf-outs">
            {outputs.map((o) => (
              <span key={o.key} className="wf-pill" title={o.hint}>
                {o.label}
                {o.fhir && <span className="wf-fhir">{o.fhir}</span>}
              </span>
            ))}
          </div>
          {next.length > 0 && (
            <p className="muted small wf-next">
              <ArrowRight size={13} aria-hidden /> pokračuje do: {next.map((nd) => `${numberOf(nd.id)}. ${nodeLabel(nd)}`).join(', ')}
            </p>
          )}
        </section>
      )}

      <section className="wf-sec">
        <h4>Pokročilé</h4>
        <div className="wf-field">
          <label>Popis kroku</label>
          <input value={node.note ?? ''} placeholder="Např. ePRO 1× týdně" onChange={(e) => onChange({ note: e.target.value || undefined })} />
        </div>
        <div className="wf-field">
          <label>Při chybě</label>
          <select value={node.onError ?? onErrorOptions[0]} onChange={(e) => onChange({ onError: e.target.value })}>
            {onErrorOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
        <div className="wf-field">
          <label>
            <Link2 size={13} aria-hidden /> Propojit s krokem
          </label>
          <select value="" onChange={(e) => e.target.value && onConnect(e.target.value)}>
            <option value="">— vyberte —</option>
            {nodes
              .filter((x) => x.id !== node.id && !edges.some((ed) => ed.from === node.id && ed.to === x.id))
              .map((x) => (
                <option key={x.id} value={x.id}>
                  {numberOf(x.id)}. {nodeLabel(x)}
                </option>
              ))}
          </select>
        </div>
      </section>

      <footer className="wf-panel-foot">
        <button className="link-btn" onClick={onDelete}>
          <Trash size={14} aria-hidden /> Smazat krok
        </button>
      </footer>
    </aside>
  );
}
