// Sekce Workflow: Přehled workflows nemocnice, Šablony TheraHUB a Vytvořit (editor na plátně).
import { ArrowRight, ClipboardList, LayoutTemplate, Pencil, Plus, Users } from 'lucide-react';
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
    <div className="wf-cards">
      {list.map((w) => {
        const apps = appsOf(w);
        return (
          <article key={w.id} className="wf-card glass">
            <header className="wf-card-head">
              <h3>{w.name}</h3>
              <span className={`st-chip compact tone-${w.status === 'aktivni' ? 'match' : w.status === 'koncept' ? 'na' : 'wait'}`}>{statusLabel[w.status]}</span>
            </header>
            <p className="muted small">{w.desc}</p>
            <Chain g={w} />
            <dl className="wf-card-facts">
              <div>
                <dt>Aplikace</dt>
                <dd>{apps.length ? apps.map((id) => appById[id]?.name).join(', ') : 'jen nástroje'}</dd>
              </div>
              <div>
                <dt>
                  <Users size={13} aria-hidden /> Pacienti
                </dt>
                <dd>{w.patients}</dd>
              </div>
              <div>
                <dt>Spravuje</dt>
                <dd>{w.owner}</dd>
              </div>
              <div>
                <dt>Upraveno</dt>
                <dd>{w.updated}</dd>
              </div>
            </dl>
            <div className="wf-card-actions">
              <Link href={`#/workflow/vytvorit/${w.id}`} className="tile-btn">
                <Pencil size={14} aria-hidden /> Upravit
              </Link>
            </div>
          </article>
        );
      })}
      <Link href="#/workflow/vytvorit" className="wf-card wf-card-new glass">
        <Plus size={22} aria-hidden />
        <b>Vytvořit workflow</b>
        <span className="muted small">Prázdné plátno, nebo začněte ze šablony.</span>
      </Link>
    </div>
  );
}

function Templates() {
  return (
    <div className="wf-cards">
      {templates.map((t) => (
        <article key={t.id} className="wf-card glass">
          <header className="wf-card-head">
            <h3>{t.name}</h3>
            <span className="st-chip compact tone-review">{t.area}</span>
          </header>
          <p className="muted small">{t.desc}</p>
          <Chain g={t} />
          <p className="muted small">
            {t.nodes.length} kroků · {appsOf(t).length ? `aplikace: ${appsOf(t).map((id) => appById[id]?.name).join(', ')}` : 'jen obecné nástroje'}
          </p>
          <div className="wf-card-actions">
            <Link href={`#/workflow/vytvorit/${t.id}`} className="tile-btn open">
              Použít šablonu <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
