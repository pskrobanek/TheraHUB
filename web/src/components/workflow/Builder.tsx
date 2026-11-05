// Editor workflow: nahoře aplikace (malé ikony), uprostřed plátno, vpravo obecné nástroje.
// Aplikace i nástroje se na plátno přetahují (nebo přidávají kliknutím), kroky se posouvají myší i šipkami
// a propojují šipkou z pravého úchytu na jiný krok (nebo výběrem „Propojit s“). V ukázce se nic neukládá na server.
import { Check, Link2, Maximize, Minus, Plus, Save, Trash, TriangleAlert, Wrench, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type DragEvent, type PointerEvent as RPointerEvent } from 'react';
import { purchasedIds, storeApps } from '../../data/store';
import { toolById, toolGroupLabel, tools, type ToolGroup, type WfEdge, type WfGraph, type WfNode } from '../../data/workflows';
import AppIcon from '../AppIcon';

const W = 170;
const H = 58;
const GRID = 10;
const ITEM_MIME = 'application/x-therahub-wf-item';
const snap = (v: number) => Math.max(0, Math.round(v / GRID) * GRID);

const installed = storeApps.filter((a) => purchasedIds.has(a.id));
const appById = Object.fromEntries(storeApps.map((a) => [a.id, a]));

const labelOf = (nd: WfNode) => (nd.kind === 'app' ? (appById[nd.ref]?.name ?? nd.ref) : (toolById[nd.ref]?.label ?? nd.ref));

let seq = 0;
const newId = () => `n${Date.now().toString(36)}${(seq++).toString(36)}`;

interface Props {
  initial: WfGraph & { name: string };
  onSave: (g: WfGraph & { name: string }) => void;
}

export default function Builder({ initial, onSave }: Props) {
  const [name, setName] = useState(initial.name);
  const [nodes, setNodes] = useState<WfNode[]>(initial.nodes);
  const [edges, setEdges] = useState<WfEdge[]>(initial.edges);
  const [sel, setSel] = useState<{ node?: string; edge?: number }>({});
  const [link, setLink] = useState<{ from: string; x: number; y: number } | null>(null);
  const [saved, setSaved] = useState(false);
  const innerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  /** Měřítko plátna; na začátku se graf přizpůsobí šířce plátna. */
  const [zoom, setZoom] = useState(1);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);

  const width = Math.max(600, ...nodes.map((nd) => nd.x + W + 60));
  const height = Math.max(480, ...nodes.map((nd) => nd.y + H + 60));
  const byId = useMemo(() => Object.fromEntries(nodes.map((nd) => [nd.id, nd])), [nodes]);

  const point = (clientX: number, clientY: number) => {
    const r = innerRef.current!.getBoundingClientRect();
    return { x: (clientX - r.left) / zoom, y: (clientY - r.top) / zoom };
  };

  const graphW = nodes.length ? Math.max(...nodes.map((nd) => nd.x + W)) + 40 : 0;
  const fit = () => {
    const cw = canvasRef.current?.clientWidth ?? 0;
    if (cw && graphW) setZoom(Math.max(0.5, Math.min(1, Math.floor((cw / graphW) * 20) / 20)));
    else setZoom(1);
  };
  useLayoutEffect(fit, []); // eslint-disable-line react-hooks/exhaustive-deps
  const zoomBy = (d: number) => setZoom((z) => Math.max(0.5, Math.min(1.5, Math.round((z + d) * 20) / 20)));

  /** Další volné místo pro krok přidaný kliknutím: vpravo od posledního. */
  const nextSpot = () => {
    if (!nodes.length) return { x: 20, y: 150 };
    const last = nodes[nodes.length - 1];
    return last.x + W + 40 + W < width ? { x: last.x + W + 40, y: last.y } : { x: 20, y: snap(Math.max(...nodes.map((nd) => nd.y)) + H + 40) };
  };

  const add = (kind: WfNode['kind'], ref: string, at?: { x: number; y: number }) => {
    const p = at ?? nextSpot();
    const nd: WfNode = { id: newId(), kind, ref, x: snap(p.x), y: snap(p.y) };
    setNodes((cur) => [...cur, nd]);
    setSel({ node: nd.id });
    setSaved(false);
  };

  const removeNode = (id: string) => {
    setNodes((cur) => cur.filter((nd) => nd.id !== id));
    setEdges((cur) => cur.filter((ed) => ed.from !== id && ed.to !== id));
    setSel({});
    setSaved(false);
  };
  const removeEdge = (i: number) => {
    setEdges((cur) => cur.filter((_, k) => k !== i));
    setSel({});
    setSaved(false);
  };
  const connect = (from: string, to: string) => {
    if (from === to || edges.some((ed) => ed.from === from && ed.to === to)) return;
    setEdges((cur) => [...cur, { from, to }]);
    setSaved(false);
  };
  const patchNode = (id: string, patch: Partial<WfNode>) => {
    setNodes((cur) => cur.map((nd) => (nd.id === id ? { ...nd, ...patch } : nd)));
    setSaved(false);
  };

  // Delete / Backspace smaže vybraný krok nebo šipku (mimo textová pole).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA') return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (sel.node) removeNode(sel.node);
        else if (sel.edge !== undefined) removeEdge(sel.edge);
      }
      if (e.key === 'Escape') {
        setSel({});
        setLink(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // ---------- Přetažení z palety na plátno ----------
  const paletteDrag = (kind: WfNode['kind'], ref: string) => ({
    draggable: true,
    onDragStart: (e: DragEvent) => {
      e.dataTransfer.setData(ITEM_MIME, `${kind}:${ref}`);
      e.dataTransfer.effectAllowed = 'copy';
    },
  });
  const onCanvasDragOver = (e: DragEvent) => {
    if (Array.from(e.dataTransfer.types).includes(ITEM_MIME)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  };
  const onCanvasDrop = (e: DragEvent) => {
    const v = e.dataTransfer.getData(ITEM_MIME);
    if (!v) return;
    e.preventDefault();
    const [kind, ref] = v.split(':') as [WfNode['kind'], string];
    const p = point(e.clientX, e.clientY);
    add(kind, ref, { x: p.x - W / 2, y: p.y - H / 2 });
  };

  // ---------- Posun kroku a tažení šipky ----------
  const onNodeDown = (e: RPointerEvent, nd: WfNode) => {
    if ((e.target as HTMLElement).closest('.wf-port-out')) return;
    const p = point(e.clientX, e.clientY);
    drag.current = { id: nd.id, dx: p.x - nd.x, dy: p.y - nd.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setSel({ node: nd.id });
  };
  const onNodeMove = (e: RPointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const p = point(e.clientX, e.clientY);
    patchNode(d.id, { x: snap(p.x - d.dx), y: snap(p.y - d.dy) });
  };
  const onNodeUp = () => {
    drag.current = null;
  };

  const onPortDown = (e: RPointerEvent, nd: WfNode) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const p = point(e.clientX, e.clientY);
    setLink({ from: nd.id, ...p });
  };
  const onPortMove = (e: RPointerEvent) => {
    if (!link) return;
    setLink({ ...link, ...point(e.clientX, e.clientY) });
  };
  const onPortUp = (e: RPointerEvent) => {
    if (!link) return;
    const el = document.elementsFromPoint(e.clientX, e.clientY).find((x) => (x as HTMLElement).dataset?.node) as HTMLElement | undefined;
    if (el?.dataset.node) connect(link.from, el.dataset.node);
    setLink(null);
  };

  const onNodeKey = (e: React.KeyboardEvent, nd: WfNode) => {
    const step = e.shiftKey ? GRID * 5 : GRID;
    const mv: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (mv[e.key]) {
      e.preventDefault();
      patchNode(nd.id, { x: Math.max(0, nd.x + mv[e.key][0]), y: Math.max(0, nd.y + mv[e.key][1]) });
    }
  };

  // ---------- Kontroly ----------
  const warnings: string[] = [];
  if (!nodes.some((nd) => nd.kind === 'tool' && toolById[nd.ref]?.group === 'spoustece')) warnings.push('Chybí spouštěč (např. Zařazení pacienta).');
  // AI Act: u aplikace s AI musí být ve workflow krok s lidským dohledem (ENDGAME 8.2).
  const aiApps = nodes.filter((nd) => nd.kind === 'app' && appById[nd.ref] && appById[nd.ref].store.ai !== 'none');
  if (aiApps.length && !nodes.some((nd) => nd.kind === 'tool' && (nd.ref === 'kontrola' || nd.ref === 'schvaleni')))
    warnings.push(`AI aplikace (${[...new Set(aiApps.map(labelOf))].join(', ')}) bez kroku s lidským dohledem – přidejte Kontrolní úlohu lékaře nebo Schválení.`);
  const lonely = nodes.filter((nd) => !edges.some((ed) => ed.from === nd.id || ed.to === nd.id));
  if (nodes.length > 1 && lonely.length) warnings.push(`${lonely.length === 1 ? 'Nepropojený krok' : 'Nepropojené kroky'}: ${lonely.map(labelOf).join(', ')}.`);

  const selNode = sel.node ? byId[sel.node] : undefined;
  const selEdge = sel.edge !== undefined ? edges[sel.edge] : undefined;

  const path = (x1: number, y1: number, x2: number, y2: number) => {
    const c = Math.max(40, Math.abs(x2 - x1) / 2);
    return `M ${x1} ${y1} C ${x1 + c} ${y1}, ${x2 - c} ${y2}, ${x2} ${y2}`;
  };

  return (
    <div className="wf-builder">
      <div className="wf-top glass">
        <div className="wf-toolbar">
          <input className="wf-name" style={{ width: `${Math.max(16, name.length + 2)}ch` }} value={name} onChange={(e) => (setName(e.target.value), setSaved(false))} aria-label="Název workflow" placeholder="Název workflow" />
          <span className="muted small">
            {nodes.length} kroků · {edges.length} propojení
          </span>
          <span className="wf-spacer" />
          <button
            className="tile-btn"
            onClick={() => {
              setNodes([]);
              setEdges([]);
              setSel({});
            }}
          >
            <Trash size={15} aria-hidden /> Vyčistit plátno
          </button>
          <button
            className="btn primary"
            onClick={() => {
              onSave({ name, nodes, edges });
              setSaved(true);
            }}
          >
            {saved ? <Check size={15} aria-hidden /> : <Save size={15} aria-hidden />} {saved ? 'Uloženo v ukázce' : 'Uložit'}
          </button>
        </div>
        <div className="wf-apps" aria-label="Aplikace – přetáhněte na plátno">
          <span className="c-label">Aplikace</span>
          <ul>
            {installed.map((a) => (
              <li key={a.id}>
                <button type="button" className="wf-app" title={`${a.name} – přetáhněte na plátno, nebo klikněte`} aria-label={`Přidat ${a.name}`} onClick={() => add('app', a.id)} {...paletteDrag('app', a.id)}>
                  <AppIcon app={a} size={30} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="wf-work">
        <div className="wf-canvas-col">
          {(selNode || selEdge) && (
            <div className="wf-inspect glass">
              {selNode ? (
                <>
                  <b>{labelOf(selNode)}</b>
                  <input
                    className="wf-note-input"
                    value={selNode.note ?? ''}
                    placeholder="Popis kroku (nepovinné)"
                    aria-label="Popis kroku"
                    onChange={(e) => patchNode(selNode.id, { note: e.target.value || undefined })}
                  />
                  <label className="wf-link-to">
                    <Link2 size={14} aria-hidden />
                    <select
                      value=""
                      aria-label="Propojit s krokem"
                      onChange={(e) => {
                        if (e.target.value) connect(selNode.id, e.target.value);
                      }}
                    >
                      <option value="">Propojit s…</option>
                      {nodes
                        .filter((x) => x.id !== selNode.id && !edges.some((ed) => ed.from === selNode.id && ed.to === x.id))
                        .map((x) => (
                          <option key={x.id} value={x.id}>
                            {labelOf(x)}
                            {x.note ? ` – ${x.note}` : ''}
                          </option>
                        ))}
                    </select>
                  </label>
                  <button className="link-btn" onClick={() => removeNode(selNode.id)}>
                    Smazat krok
                  </button>
                </>
              ) : (
                selEdge && (
                  <>
                    <b>
                      {labelOf(byId[selEdge.from])} → {labelOf(byId[selEdge.to])}
                    </b>
                    <input
                      className="wf-note-input"
                      value={selEdge.label ?? ''}
                      placeholder="Popisek šipky (např. ano / ne)"
                      aria-label="Popisek šipky"
                      onChange={(e) => {
                        const v = e.target.value;
                        setEdges((cur) => cur.map((ed, k) => (k === sel.edge ? { ...ed, label: v || undefined } : ed)));
                      }}
                    />
                    <button className="link-btn" onClick={() => removeEdge(sel.edge!)}>
                      Smazat propojení
                    </button>
                  </>
                )
              )}
              <button className="wf-inspect-close" onClick={() => setSel({})} aria-label="Zrušit výběr">
                <X size={15} />
              </button>
            </div>
          )}

          <div className="wf-canvas glass" ref={canvasRef} onDragOver={onCanvasDragOver} onDrop={onCanvasDrop} onPointerDown={(e) => e.target === e.currentTarget && setSel({})}>
            <div className="wf-zoom-box" style={{ width: width * zoom, height: height * zoom }}>
            <div className="wf-inner" ref={innerRef} style={{ width, height, transform: `scale(${zoom})` }} onPointerDown={(e) => e.target === e.currentTarget && setSel({})}>
              <svg className="wf-edges" width={width} height={height} aria-hidden>
                <defs>
                  <marker id="wf-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" className="wf-arrow" />
                  </marker>
                  <marker id="wf-arrow-sel" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" className="wf-arrow sel" />
                  </marker>
                </defs>
                {edges.map((ed, i) => {
                  const a = byId[ed.from];
                  const b = byId[ed.to];
                  if (!a || !b) return null;
                  const d = path(a.x + W, a.y + H / 2, b.x - 2, b.y + H / 2);
                  const on = sel.edge === i;
                  return (
                    <g key={i} className={on ? 'wf-edge sel' : 'wf-edge'} onPointerDown={() => setSel({ edge: i })}>
                      <path d={d} className="wf-edge-hit" />
                      <path d={d} className="wf-edge-line" markerEnd={`url(#${on ? 'wf-arrow-sel' : 'wf-arrow'})`} />
                      {ed.label && (
                        <text x={(a.x + W + b.x) / 2} y={(a.y + b.y) / 2 + H / 2 - 6} textAnchor="middle" className="wf-edge-label">
                          {ed.label}
                        </text>
                      )}
                    </g>
                  );
                })}
                {link && byId[link.from] && <path d={path(byId[link.from].x + W, byId[link.from].y + H / 2, link.x, link.y)} className="wf-edge-line temp" />}
              </svg>

              {nodes.map((nd) => {
                const app = nd.kind === 'app' ? appById[nd.ref] : undefined;
                const tool = nd.kind === 'tool' ? toolById[nd.ref] : undefined;
                const Icon = tool?.icon;
                return (
                  <div
                    key={nd.id}
                    data-node={nd.id}
                    className={`wf-node wf-${nd.kind}${tool ? ` wf-g-${tool.group}` : ''}${sel.node === nd.id ? ' sel' : ''}`}
                    style={{ left: nd.x, top: nd.y, width: W, height: H }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${labelOf(nd)}${nd.note ? `, ${nd.note}` : ''}. Šipkami posunete, Delete smaže.`}
                    onPointerDown={(e) => onNodeDown(e, nd)}
                    onPointerMove={onNodeMove}
                    onPointerUp={onNodeUp}
                    onFocus={() => setSel({ node: nd.id })}
                    onKeyDown={(e) => onNodeKey(e, nd)}
                  >
                    <span className="wf-port-in" aria-hidden />
                    {app ? <AppIcon app={app} size={28} /> : Icon && <span className="wf-tool-icon">{<Icon size={16} strokeWidth={2} aria-hidden />}</span>}
                    <span className="wf-node-text">
                      <b>{labelOf(nd)}</b>
                      {nd.note && <span className="wf-node-note" title={nd.note}>{nd.note}</span>}
                    </span>
                    <span
                      className="wf-port-out"
                      title="Táhněte na jiný krok a propojte šipkou"
                      onPointerDown={(e) => onPortDown(e, nd)}
                      onPointerMove={onPortMove}
                      onPointerUp={onPortUp}
                    />
                  </div>
                );
              })}

              {nodes.length === 0 && <p className="wf-empty muted">Přetáhněte sem aplikaci z horní lišty nebo nástroj zprava.</p>}
            </div>
            </div>
          </div>

          <div className="wf-status small">
            {warnings.length ? (
              warnings.map((w) => (
                <span key={w} className="cbox-warn">
                  <TriangleAlert size={14} aria-hidden /> {w}
                </span>
              ))
            ) : (
              <span className="muted">
                <Check size={14} aria-hidden /> Workflow je propojené.
              </span>
            )}
            <span className="muted">Kroky posunete myší nebo šipkami, šipku vytvoříte tažením z pravého úchytu kroku. Delete smaže vybrané.</span>
            <div className="wf-zoom" role="group" aria-label="Měřítko plátna">
              <button onClick={() => zoomBy(-0.1)} aria-label="Zmenšit" title="Zmenšit">
                <Minus size={14} />
              </button>
              <span className="mono small">{Math.round(zoom * 100)} %</span>
              <button onClick={() => zoomBy(0.1)} aria-label="Zvětšit" title="Zvětšit">
                <Plus size={14} />
              </button>
              <button onClick={fit} aria-label="Přizpůsobit plátnu" title="Přizpůsobit plátnu">
                <Maximize size={14} />
              </button>
            </div>
          </div>
        </div>

        <aside className="filters wf-tools" aria-label="Nástroje">
          <div className="filters-head">
            <span className="fh-tab on" title="Nástroje" aria-label="Nástroje">
              <Wrench size={15} strokeWidth={2} aria-hidden />
            </span>
          </div>
          {(Object.keys(toolGroupLabel) as ToolGroup[]).map((g) => (
            <section key={g}>
              <h4>{toolGroupLabel[g]}</h4>
              <ul className="spec-list">
                {tools
                  .filter((t) => t.group === g)
                  .map((t) => {
                    const Icon = t.icon;
                    return (
                      <li key={t.id}>
                        <button type="button" className="spec wf-tool" title={t.desc} onClick={() => add('tool', t.id)} {...paletteDrag('tool', t.id)}>
                          <span className={`wf-tool-icon wf-g-${t.group}`}>
                            <Icon size={14} strokeWidth={2} aria-hidden />
                          </span>
                          {t.label}
                          <Plus size={13} className="wf-tool-plus" aria-hidden />
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </section>
          ))}
        </aside>
      </div>
    </div>
  );
}
