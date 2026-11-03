// Editor schvalovacího procesu (brief §5.3, §9.5). Fáze 0b: jen rozhraní, publikování a simulace jsou ukázkové.
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowDown, ArrowUp, CircleAlert, CircleCheck, GitBranch, GripVertical, Layers, Play, Plus, Trash2, Ungroup } from 'lucide-react';
import { useMemo, useState } from 'react';
import { storeApps } from '../../data/store';
import { workdaysLabel } from '../../data/trial/dates';
import { dossiers, realAppIds } from '../../data/trial/dossiers';
import { departments, domainOwner, staff, type DeptId } from '../../data/trial/requests';
import {
  assigneeRules,
  conditions,
  makeStep,
  newId,
  returnTargets,
  stepTypeLabel,
  templates,
  validate,
  type StepType,
  type WfNode,
  type WfStep,
} from '../../data/trial/workflow';

const palette: StepType[] = ['schvaleni', 'firma', 'posouzeni', 'smlouva', 'eticka', 'pilot', 'kpi', 'rozhodnuti', 'informovat'];
const noAutoClear: StepType[] = ['rozhodnuti', 'smlouva', 'zadost', 'pilot', 'nakup', 'odchod'];

export default function WorkflowBuilder() {
  const [tplId, setTplId] = useState('A');
  const tpl = templates.find((t) => t.id === tplId)!;
  const [published, setPublished] = useState<Record<string, WfNode[]>>(() => Object.fromEntries(templates.map((t) => [t.id, t.nodes()])));
  const [nodes, setNodes] = useState<WfNode[]>(() => structuredClone(published.A));
  const [selId, setSelId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const errors = validate(nodes);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const switchTpl = (id: string) => {
    setTplId(id);
    setNodes(structuredClone(published[id]));
    setSelId(null);
    setNotice(null);
  };

  const selected = useMemo(() => {
    for (const n of nodes) {
      if (n.kind === 'step' && n.step.id === selId) return n.step;
      if (n.kind === 'group') {
        const s = n.steps.find((x) => x.id === selId);
        if (s) return s;
      }
    }
    return null;
  }, [nodes, selId]);

  const update = (patch: Partial<WfStep>) =>
    setNodes((ns) =>
      ns.map((n) =>
        n.kind === 'step' ? (n.step.id === selId ? { ...n, step: { ...n.step, ...patch } } : n) : { ...n, steps: n.steps.map((s) => (s.id === selId ? { ...s, ...patch } : s)) },
      ),
    );

  const move = (i: number, d: number) => setNodes((ns) => (i + d < 0 || i + d >= ns.length ? ns : arrayMove(ns, i, i + d)));
  const remove = (i: number) => setNodes((ns) => ns.filter((_, k) => k !== i));
  /** Seskupit s předchozím uzlem do paralelní skupiny (klávesnicová alternativa k přetažení na krok). */
  const group = (i: number) =>
    setNodes((ns) => {
      if (i === 0) return ns;
      const a = ns[i - 1];
      const b = ns[i];
      const steps = [...(a.kind === 'step' ? [a.step] : a.steps), ...(b.kind === 'step' ? [b.step] : b.steps)];
      const g: WfNode = { id: newId('g'), kind: 'group', name: a.kind === 'group' ? a.name : 'Paralelní skupina', steps };
      return [...ns.slice(0, i - 1), g, ...ns.slice(i + 1)];
    });
  const ungroup = (i: number) =>
    setNodes((ns) => {
      const g = ns[i];
      if (g.kind !== 'group') return ns;
      return [...ns.slice(0, i), ...g.steps.map((s): WfNode => ({ id: s.id, kind: 'step', step: s })), ...ns.slice(i + 1)];
    });
  const add = (type: StepType) => {
    const s = makeStep(type);
    setNodes((ns) => {
      // Nový krok před Rozhodnutí, aby větvení zůstalo na konci.
      const at = ns.findIndex((n) => n.kind === 'step' && n.step.type === 'rozhodnuti');
      const node: WfNode = { id: s.id, kind: 'step', step: s };
      return at < 0 ? [...ns, node] : [...ns.slice(0, at), node, ...ns.slice(at)];
    });
    setSelId(s.id);
  };

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    setNodes((ns) => arrayMove(ns, ns.findIndex((n) => n.id === e.active.id), ns.findIndex((n) => n.id === e.over!.id)));
  };

  const changes = diff(published[tplId], nodes);
  const publish = () => {
    setPublished((p) => ({ ...p, [tplId]: structuredClone(nodes) }));
    setNotice(`Publikováno jako verze ${tpl.version + 1} (ukázka). Žádosti v běhu zůstávají na verzi, se kterou začaly; převod je jen ruční a zapisuje se do auditu.`);
  };

  return (
    <div className="wfb">
      <div className="wfb-top glass">
        <label>
          <span className="muted small">Šablona</span>
          <select value={tplId} onChange={(e) => switchTpl(e.target.value)}>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} · v{t.version} · {t.status}
              </option>
            ))}
          </select>
        </label>
        <span className="muted small">Použije se: {tpl.rule}</span>
        <span className="wfb-top-actions">
          <span className={errors.length ? 'st-chip tone-gap' : 'st-chip tone-match'}>
            {errors.length ? <CircleAlert size={14} aria-hidden /> : <CircleCheck size={14} aria-hidden />}
            {errors.length ? `${errors.length} chyb` : 'Proces je platný'}
          </span>
          <button className="btn primary" disabled={errors.length > 0 || changes.length === 0} onClick={publish}>
            Publikovat verzi {tpl.version + 1}
          </button>
        </span>
      </div>
      {notice && <p className="phase-note glass">{notice}</p>}

      <div className="wfb-grid">
        <aside className="wfb-palette glass" aria-label="Typy kroků">
          <h3>Typy kroků</h3>
          {palette.map((t) => (
            <button key={t} className="wfb-pal-item" onClick={() => add(t)}>
              <Plus size={14} aria-hidden /> {stepTypeLabel[t]}
            </button>
          ))}
          <p className="muted small">Klik přidá krok před Rozhodnutí. Kroky přesouváte přetažením za úchyt nebo tlačítky ↑ ↓ (i klávesnicí: Tab na úchyt, mezerník, šipky).</p>
        </aside>

        <section className="wfb-canvas glass" aria-label="Schvalovací proces">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={nodes.map((n) => n.id)} strategy={verticalListSortingStrategy}>
              <ol className="wfb-chain">
                {nodes.map((n, i) => (
                  <SortableNode
                    key={n.id}
                    node={n}
                    index={i}
                    count={nodes.length}
                    selId={selId}
                    onSelect={setSelId}
                    onMove={move}
                    onGroup={group}
                    onUngroup={ungroup}
                    onRemove={remove}
                  />
                ))}
              </ol>
            </SortableContext>
          </DndContext>
          <div className="wfb-branch">
            <GitBranch size={16} aria-hidden />
            <span>
              Po Rozhodnutí: <b>Nákup (měsíční předplatné)</b> · <b>Prodloužení</b> (zpět na Pilotní provoz zkrácenou cestou) · <b>Odchod</b>
            </span>
          </div>
        </section>

        <aside className="wfb-inspector glass" aria-label="Vlastnosti kroku">
          {selected ? <Inspector step={selected} onChange={update} /> : <p className="muted small">Vyberte krok na plátně.</p>}
        </aside>
      </div>

      <div className="wfb-bottom">
        <section className="glass wfb-panel">
          <h3>Validace</h3>
          {errors.length === 0 ? (
            <p className="st-chip tone-match">
              <CircleCheck size={14} aria-hidden /> Všechna pravidla splněna
            </p>
          ) : (
            <ul className="wfb-errors">
              {errors.map((e) => (
                <li key={e}>
                  <CircleAlert size={14} aria-hidden /> {e}
                </li>
              ))}
            </ul>
          )}
          <h3>Změny proti verzi {tpl.version}</h3>
          {changes.length ? (
            <ul className="wfb-diff">
              {changes.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          ) : (
            <p className="muted small">Beze změn.</p>
          )}
        </section>
        <Simulation nodes={nodes} />
      </div>
    </div>
  );
}

function SortableNode(props: {
  node: WfNode;
  index: number;
  count: number;
  selId: string | null;
  onSelect: (id: string) => void;
  onMove: (i: number, d: number) => void;
  onGroup: (i: number) => void;
  onUngroup: (i: number) => void;
  onRemove: (i: number) => void;
}) {
  const { node, index: i, count, selId, onSelect, onMove, onGroup, onUngroup, onRemove } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: node.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const name = node.kind === 'step' ? node.step.name : node.name;
  const locked = node.kind === 'step' && node.step.type === 'zadost';

  return (
    <li ref={setNodeRef} style={style} className={isDragging ? 'wfb-node dragging' : 'wfb-node'}>
      <div className={node.kind === 'group' ? 'wfb-card group' : `wfb-card${node.step.id === selId ? ' on' : ''}`}>
        <button className="wfb-grip" {...attributes} {...listeners} aria-label={`Přesunout ${name}`} disabled={locked}>
          <GripVertical size={16} />
        </button>
        {node.kind === 'step' ? (
          <button className="wfb-card-main" onClick={() => onSelect(node.step.id)}>
            <b>{node.step.name}</b>
            <span className="muted small">
              {stepTypeLabel[node.step.type]} · {node.step.assignee}
              {node.step.sla ? ` · SLA ${node.step.sla} dní` : ''}
              {node.step.condition !== 'Vždy' ? ` · ${node.step.condition.toLowerCase()}` : ''}
            </span>
          </button>
        ) : (
          <div className="wfb-card-main">
            <b>
              <Layers size={14} aria-hidden /> {node.name} <span className="muted small">paralelně</span>
            </b>
            <div className="wfb-group">
              {node.steps.map((s) => (
                <button key={s.id} className={s.id === selId ? 'wfb-sub on' : 'wfb-sub'} onClick={() => onSelect(s.id)}>
                  {s.name}
                  {s.requiredBeforeTrial && <span className="muted"> · povinné před pilotem</span>}
                </button>
              ))}
            </div>
          </div>
        )}
        <span className="wfb-tools">
          <button className="btn ghost icon" onClick={() => onMove(i, -1)} disabled={i <= 1} aria-label={`${name} výš`} title="Výš">
            <ArrowUp size={15} />
          </button>
          <button className="btn ghost icon" onClick={() => onMove(i, 1)} disabled={i === 0 || i >= count - 1} aria-label={`${name} níž`} title="Níž">
            <ArrowDown size={15} />
          </button>
          {node.kind === 'group' ? (
            <button className="btn ghost icon" onClick={() => onUngroup(i)} aria-label={`Rozdělit skupinu ${name}`} title="Rozdělit skupinu">
              <Ungroup size={15} />
            </button>
          ) : (
            i > 1 && (
              <button className="btn ghost icon" onClick={() => onGroup(i)} aria-label={`Seskupit ${name} s předchozím krokem`} title="Seskupit s předchozím (paralelně)">
                <Layers size={15} />
              </button>
            )
          )}
          {!locked && (
            <button className="btn ghost icon" onClick={() => onRemove(i)} aria-label={`Odebrat ${name}`} title="Odebrat">
              <Trash2 size={15} />
            </button>
          )}
        </span>
      </div>
    </li>
  );
}

function Inspector({ step, onChange }: { step: WfStep; onChange: (p: Partial<WfStep>) => void }) {
  const autoForbidden = noAutoClear.includes(step.type);
  return (
    <div className="wfb-insp">
      <h3>{stepTypeLabel[step.type]}</h3>
      <label>
        Název
        <input value={step.name} onChange={(e) => onChange({ name: e.target.value })} />
      </label>
      <label>
        Kdo rozhoduje
        <select value={step.assignee} onChange={(e) => onChange({ assignee: e.target.value as WfStep['assignee'] })}>
          {assigneeRules.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </label>
      {step.assignee === 'Pojmenovaná osoba' && (
        <label>
          Osoba
          <input value={step.person ?? ''} onChange={(e) => onChange({ person: e.target.value })} placeholder="jméno z organizační struktury" />
        </label>
      )}
      <label>
        Zástupce
        <input value={step.deputy} onChange={(e) => onChange({ deputy: e.target.value })} />
      </label>
      <label>
        SLA (pracovní dny)
        <input type="number" min={0} value={step.sla} onChange={(e) => onChange({ sla: Number(e.target.value) })} />
      </label>
      <label>
        Zahrnout
        <select value={step.condition} onChange={(e) => onChange({ condition: e.target.value as WfStep['condition'] })}>
          {conditions.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label>
        Vrátit lze na
        <select value={step.returnTo} onChange={(e) => onChange({ returnTo: e.target.value as WfStep['returnTo'] })}>
          {returnTargets.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className="task-check">
        <input type="checkbox" checked={step.requiredBeforeTrial} onChange={(e) => onChange({ requiredBeforeTrial: e.target.checked })} /> Povinné před pilotním provozem
      </label>
      <label className="task-check">
        <input type="checkbox" checked={step.autoClear} disabled={autoForbidden} onChange={(e) => onChange({ autoClear: e.target.checked })} /> Automatické splnění pravidlem
      </label>
      <p className="muted small">
        {autoForbidden
          ? 'U tohoto kroku automatické splnění není dovoleno.'
          : 'Ve výchozím stavu vypnuto. Jen při verdiktu Splňuje z ověřených dokladů, s lhůtou 2 pracovní dny pro námitku. TODO(legal): ověřit vnitřní předpisy.'}
      </p>
    </div>
  );
}

function Simulation({ nodes }: { nodes: WfNode[] }) {
  const apps = storeApps.filter((a) => dossiers[a.id] && !realAppIds.has(a.id));
  const [appId, setAppId] = useState(apps[0].id);
  const [dept, setDept] = useState<DeptId>('onko');
  const d = dossiers[appId];
  const personal = d.answers['GDP-003']?.notApplicable === undefined;
  const mdr = String(d.answers['LEG-001']?.value ?? '').startsWith('MDR');
  const research = storeApps.find((a) => a.id === appId)!.category === 'Výzkum';
  const applies = (s: WfStep) =>
    s.condition === 'Vždy' ||
    (s.condition === 'Jen pokud zpracovává osobní údaje' && personal) ||
    (s.condition === 'Jen u zdravotnického prostředku' && mdr) ||
    (s.condition === 'Jen u výzkumu' && research) ||
    s.condition === 'Jen nad měsíční cenu 20 000 Kč';
  const who = (s: WfStep): string => {
    switch (s.assignee) {
      case 'Primář oddělení žadatele':
        return departments[dept].head.name;
      case 'Náměstek pro léčebnou péči':
        return staff.namestek.name;
      case 'Ředitel':
        return staff.reditel.name;
      case 'Vlastník oblasti':
        return s.domain ? domainOwner[s.domain].name : '—';
      case 'Právník + podepisující osoba':
        return `${staff.pravnik.name}, ${staff.reditel.name}`;
      case 'Odborný garant':
      case 'Žadatel':
        return departments[dept].requester.name;
      case 'Nákup':
        return staff.nakup.name;
      case 'Firma (dodavatel)':
        return d.vendor;
      case 'Pojmenovaná osoba':
        return s.person || 'neurčeno';
      default:
        return 'skupina z organizační struktury';
    }
  };
  let total = 0;
  let beforePilot = 0;
  let pilotSeen = false;
  const rows = nodes.map((n) => {
    const steps = n.kind === 'step' ? [n.step] : n.steps;
    const active = steps.filter(applies);
    const dur = active.reduce((m, s) => (n.kind === 'group' ? Math.max(m, s.sla) : m + s.sla), 0);
    total += dur;
    if (steps.some((s) => s.type === 'pilot')) pilotSeen = true;
    if (!pilotSeen) beforePilot += dur;
    return { n, steps, active, dur };
  });

  return (
    <section className="glass wfb-panel">
      <h3>
        <Play size={14} aria-hidden /> Simulace
      </h3>
      <div className="wfb-sim-pick">
        <select value={appId} onChange={(e) => setAppId(e.target.value)} aria-label="Ukázková aplikace">
          {apps.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <select value={dept} onChange={(e) => setDept(e.target.value as DeptId)} aria-label="Oddělení žadatele">
          {(Object.keys(departments) as DeptId[]).map((k) => (
            <option key={k} value={k}>
              {departments[k].name}
            </option>
          ))}
        </select>
      </div>
      <ol className="wfb-sim">
        {rows.map(({ n, steps, active, dur }) => (
          <li key={n.id} className={active.length ? '' : 'skipped'}>
            <b>{n.kind === 'step' ? n.step.name : n.name}</b>
            <span className="muted small">
              {active.length === 0
                ? `přeskočeno (${steps[0].condition.toLowerCase()})`
                : steps
                    .map((s) => (applies(s) ? `${n.kind === 'group' ? `${s.name}: ` : ''}${who(s)}` : `${s.name}: přeskočeno`))
                    .join(' · ')}
              {dur ? ` · ${workdaysLabel(dur)}` : ''}
            </span>
          </li>
        ))}
      </ol>
      <p className="small">
        Očekávaná doba do pilotního provozu: <b>{workdaysLabel(beforePilot)}</b> (podle SLA, paralelní kroky se nesčítají). Celkem bez samotného pilotu: {workdaysLabel(total)}.
      </p>
      <p className="muted small">Řešitelé jsou dosazení z dnešní organizační struktury FN Demo.</p>
    </section>
  );
}

/** Textový rozdíl proti publikované verzi. */
function diff(prev: WfNode[], next: WfNode[]): string[] {
  const label = (n: WfNode) => (n.kind === 'step' ? n.step.name : `${n.name} (${n.steps.map((s) => s.name).join(', ')})`);
  const a = prev.map(label);
  const b = next.map(label);
  const out: string[] = [];
  b.forEach((x) => !a.includes(x) && out.push(`Přidáno: ${x}`));
  a.forEach((x) => !b.includes(x) && out.push(`Odebráno: ${x}`));
  if (!out.length && a.join('|') !== b.join('|')) out.push('Změněno pořadí kroků');
  const flat = (ns: WfNode[]) => ns.flatMap((n) => (n.kind === 'step' ? [n.step] : n.steps));
  const pm = new Map(flat(prev).map((s) => [s.id, s]));
  flat(next).forEach((s) => {
    const p = pm.get(s.id);
    if (!p) return;
    if (p.sla !== s.sla) out.push(`${s.name}: SLA ${p.sla} → ${s.sla} dní`);
    if (p.assignee !== s.assignee) out.push(`${s.name}: rozhoduje ${s.assignee}`);
    if (p.condition !== s.condition) out.push(`${s.name}: ${s.condition}`);
    if (p.name !== s.name) out.push(`Přejmenováno: ${p.name} → ${s.name}`);
    if (p.autoClear !== s.autoClear) out.push(`${s.name}: automatické splnění ${s.autoClear ? 'zapnuto' : 'vypnuto'}`);
    if (p.requiredBeforeTrial !== s.requiredBeforeTrial) out.push(`${s.name}: ${s.requiredBeforeTrial ? 'povinné' : 'nepovinné'} před pilotem`);
  });
  return out;
}
