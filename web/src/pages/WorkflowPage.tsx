// Sekce Workflow: Přehled workflows nemocnice, Šablony TheraHUB a Vytvořit (editor na plátně).
import { ArrowRight, ClipboardList, LayoutTemplate, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import AppIcon from '../components/AppIcon';
import { FlowBranch } from '../components/icons';
import Link from '../components/Link';
import PageHeader from '../components/PageHeader';
import Builder from '../components/workflow/Builder';
import { storeApps } from '../data/store';
import { appsOf, hospitalWorkflows, statusLabel, templates, toolById, type HospitalWorkflow, type WfGraph } from '../data/workflows';
import { navigate } from '../lib/route';

const appById = Object.fromEntries(storeApps.map((a) => [a.id, a]));

/** Workflows v paměti stránky (v ukázce se neukládají na server). */
let store: HospitalWorkflow[] = [...hospitalWorkflows];

export default function WorkflowPage({ sub, item }: { sub?: string; item?: string }) {
  const [, refresh] = useState(0);
  const view = sub === 'sablony' ? 'sablony' : sub === 'vytvorit' ? 'vytvorit' : 'prehled';
  const editing = view === 'vytvorit' && item ? (store.find((w) => w.id === item) ?? templates.find((t) => t.id === item)) : undefined;
  const isOwn = !!editing && store.some((w) => w.id === editing.id);

  const title = { prehled: 'Workflow', sablony: 'Šablony', vytvorit: isOwn ? 'Upravit workflow' : 'Vytvořit workflow' }[view];
  const subtitle = {
    prehled: `${store.length} workflows nemocnice · ${store.filter((w) => w.status === 'aktivni').length} aktivních`,
    sablony: `${templates.length} šablon TheraHUB – výchozí body, které si nemocnice upraví`,
    vytvorit: 'Přetáhněte aplikace a nástroje na plátno a propojte je šipkami',
  }[view];

  const save = (g: WfGraph & { name: string }) => {
    if (isOwn) store = store.map((w) => (w.id === editing!.id ? { ...w, ...g } : w));
    else {
      const id = `vlastni-${Date.now().toString(36)}`;
      store = [...store, { id, ...g, desc: 'Vlastní workflow vytvořené v editoru.', status: 'koncept', patients: 0, owner: 'Radiační onkologie', updated: 'dnes' }];
      navigate(`#/workflow/vytvorit/${id}`);
    }
    refresh((x) => x + 1);
  };

  return (
    <div className="page workflow">
      <PageHeader
        icon={view === 'sablony' ? LayoutTemplate : view === 'vytvorit' ? Plus : FlowBranch}
        title={title}
        subtitle={subtitle}
        nav={
          <nav className="switch" aria-label="Přehled, Šablony nebo Vytvořit">
            <Link href="#/workflow" className={view === 'prehled' ? 'switch-item active' : 'switch-item'}>
              <ClipboardList size={16} /> Přehled <span className="tab-count">{store.length}</span>
            </Link>
            <Link href="#/workflow/sablony" className={view === 'sablony' ? 'switch-item active' : 'switch-item'}>
              <LayoutTemplate size={16} /> Šablony <span className="tab-count">{templates.length}</span>
            </Link>
            <Link href="#/workflow/vytvorit" className={view === 'vytvorit' ? 'switch-item active' : 'switch-item'}>
              <Plus size={16} /> Vytvořit
            </Link>
          </nav>
        }
      />

      {view === 'prehled' && <Overview list={store} />}
      {view === 'sablony' && <Templates />}
      {view === 'vytvorit' && (
        <Builder
          key={item ?? 'novy'}
          initial={editing ? { name: isOwn ? editing.name : `${editing.name} (kopie šablony)`, nodes: editing.nodes, edges: editing.edges } : { name: 'Nový workflow', nodes: [{ id: 'start', kind: 'tool', ref: 'start', x: 20, y: 150 }], edges: [] }}
          onSave={save}
        />
      )}
    </div>
  );
}

/** Řada ikon kroků v pořadí, jak jdou v grafu (pro náhled na kartě). */
function Chain({ g }: { g: WfGraph }) {
  const order = [...g.nodes].sort((a, b) => a.x - b.x || a.y - b.y);
  return (
    <ol className="wf-chain" aria-label="Kroky">
      {order.map((nd) => {
        if (nd.kind === 'app') {
          const a = appById[nd.ref];
          return a ? (
            <li key={nd.id} title={a.name}>
              <AppIcon app={a} size={22} />
            </li>
          ) : null;
        }
        const t = toolById[nd.ref];
        if (!t) return null;
        const Icon = t.icon;
        return (
          <li key={nd.id} title={t.label}>
            <span className={`wf-tool-icon sm wf-g-${t.group}`}>
              <Icon size={12} strokeWidth={2} aria-hidden />
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Overview({ list }: { list: HospitalWorkflow[] }) {
  return (
    <div className="wf-list glass">
      <table className="trq-table wf-table">
        <thead>
          <tr>
            <th>Workflow</th>
            <th>Kroky</th>
            <th>Pacienti</th>
            <th>Spravuje</th>
            <th>Upraveno</th>
            <th>Stav</th>
            <th aria-label="Akce" />
          </tr>
        </thead>
        <tbody>
          {list.map((w) => (
            <tr key={w.id} className="wf-row" onClick={() => navigate(`#/workflow/vytvorit/${w.id}`)}>
              <td>
                <Link href={`#/workflow/vytvorit/${w.id}`} className="wf-row-name">
                  <b>{w.name}</b>
                  <span className="muted small">{w.desc}</span>
                </Link>
              </td>
              <td>
                <Chain g={w} />
                <span className="muted small">
                  {w.nodes.length} kroků · {appsOf(w).length} aplikací
                </span>
              </td>
              <td className="mono">{w.patients}</td>
              <td className="small">{w.owner}</td>
              <td className="nowrap small">{w.updated}</td>
              <td>
                <span className={`st-chip compact tone-${w.status === 'aktivni' ? 'match' : w.status === 'koncept' ? 'na' : 'wait'}`}>{statusLabel[w.status]}</span>
              </td>
              <td className="wf-row-act">
                <Link href={`#/workflow/vytvorit/${w.id}`} className="tile-btn">
                  <Pencil size={14} aria-hidden /> Upravit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link href="#/workflow/vytvorit" className="wf-list-new">
        <Plus size={15} aria-hidden /> Vytvořit workflow – prázdné plátno, nebo začněte ze šablony
      </Link>
    </div>
  );
}

function Templates() {
  return (
    <div className="wf-list glass">
      <table className="trq-table wf-table">
        <thead>
          <tr>
            <th>Šablona</th>
            <th>Oblast</th>
            <th>Kroky</th>
            <th>Aplikace</th>
            <th aria-label="Akce" />
          </tr>
        </thead>
        <tbody>
          {templates.map((t) => (
            <tr key={t.id} className="wf-row" onClick={() => navigate(`#/workflow/vytvorit/${t.id}`)}>
              <td>
                <span className="wf-row-name">
                  <b>{t.name}</b>
                  <span className="muted small">{t.desc}</span>
                </span>
              </td>
              <td>
                <span className="st-chip compact tone-review">{t.area}</span>
              </td>
              <td>
                <Chain g={t} />
                <span className="muted small">{t.nodes.length} kroků</span>
              </td>
              <td className="small">{appsOf(t).length ? appsOf(t).map((id) => appById[id]?.name).join(', ') : <span className="muted">jen obecné nástroje</span>}</td>
              <td className="wf-row-act">
                <Link href={`#/workflow/vytvorit/${t.id}`} className="tile-btn open">
                  Použít <ArrowRight size={14} aria-hidden />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
