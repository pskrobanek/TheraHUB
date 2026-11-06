// Záložka Workflow v detailu aplikace: workflows nemocnice, do kterých je aplikace zapojená, a co v nich dělá –
// funkce, odkud dostává data, co předává dál a kdo její výstupy používá. Čte stejný seznam jako sekce Workflow.
import { ArrowDownToLine, ArrowRight, ArrowUpFromLine, Pencil, Plus } from 'lucide-react';
import { storeApps } from '../../data/store';
import type { StoreApp } from '../../data/types';
import { incoming, ioOf, moduleOf, nodeLabel, outgoing, resolveToken, workflowsForApp } from '../../data/workflowStore';
import { statusLabel, toolById, type HospitalWorkflow, type WfNode } from '../../data/workflows';
import AppIcon from '../AppIcon';
import Link from '../Link';

const appById = Object.fromEntries(storeApps.map((a) => [a.id, a]));
const kindOne = { trigger: 'Spouštěč', action: 'Akce', search: 'Vyhledání' } as const;

function StepIcon({ nd, own }: { nd: WfNode; own: boolean }) {
  const t = nd.kind === 'tool' ? toolById[nd.ref] : undefined;
  const Icon = t?.icon;
  return (
    <span className={own ? 'awf-step own' : 'awf-step'} title={nodeLabel(nd)}>
      {nd.kind === 'app' ? (
        <AppIcon app={appById[nd.ref]} size={22} />
      ) : (
        Icon && (
          <span className={`wf-tool-icon sm wf-g-${t!.group}`}>
            <Icon size={12} strokeWidth={2} aria-hidden />
          </span>
        )
      )}
    </span>
  );
}

function Role({ w, nd }: { w: HospitalWorkflow; nd: WfNode }) {
  const num = (id: string) => w.nodes.findIndex((x) => x.id === id) + 1;
  const byId = Object.fromEntries(w.nodes.map((x) => [x.id, x]));
  const mod = moduleOf(nd);
  const { inputs, outputs } = ioOf(nd);
  const from = incoming(nd.id, w.edges).map((e) => byId[e.from]).filter(Boolean);
  const to = outgoing(nd.id, w.edges).map((e) => byId[e.to]).filter(Boolean);
  // Kroky, které mapují výstupy tohoto kroku do svých vstupů.
  const users = w.nodes.flatMap((x) =>
    Object.entries(x.config ?? {}).flatMap(([k, v]) => {
      const r = resolveToken(v, w.nodes);
      if (!r || r.src.id !== nd.id) return [];
      const input = ioOf(x).inputs.find((f) => f.key === k);
      return [{ x, input: input?.label ?? k, out: r.field?.label ?? r.key }];
    }),
  );

  return (
    <div className="awf-role">
      <div className="awf-role-head">
        <span className="wf-num">{num(nd.id)}</span>
        <b>{mod ? mod.label : 'Funkce zatím nevybraná'}</b>
        {mod && <span className="st-chip compact tone-review">{kindOne[mod.kind]}</span>}
        {nd.note && <span className="muted small">{nd.note}</span>}
      </div>
      {mod && <p className="muted small awf-desc">{mod.desc}</p>}
      <div className="awf-io">
        <section>
          <h4>
            <ArrowDownToLine size={13} aria-hidden /> Dostává
          </h4>
          {from.length > 0 && <p className="small muted">Navazuje na: {from.map((x) => `${num(x.id)}. ${nodeLabel(x)}`).join(', ')}</p>}
          <ul>
            {inputs.length === 0 && <li className="muted small">Bez vstupů.</li>}
            {inputs.map((f) => {
              const v = nd.config?.[f.key];
              const r = v ? resolveToken(v, w.nodes) : null;
              return (
                <li key={f.key} className="small">
                  <span>{f.label}</span>
                  {r ? (
                    <span className="wf-pill on">
                      <b>{num(r.src.id)}</b> {nodeLabel(r.src)} › {r.field?.label ?? r.key}
                    </span>
                  ) : v ? (
                    <span className="awf-val">{v}</span>
                  ) : (
                    <span className="muted">{f.type === 'patient' ? 'pacient z workflow' : 'nevyplněno'}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
        <section>
          <h4>
            <ArrowUpFromLine size={13} aria-hidden /> Předává
          </h4>
          <div className="wf-outs">
            {outputs.length === 0 && <span className="muted small">Bez výstupů.</span>}
            {outputs.map((o) => (
              <span key={o.key} className="wf-pill">
                {o.label}
                {o.fhir && <span className="wf-fhir">{o.fhir}</span>}
              </span>
            ))}
          </div>
          {to.length > 0 && (
            <p className="small muted awf-next">
              <ArrowRight size={13} aria-hidden /> pokračuje do: {to.map((x) => `${num(x.id)}. ${nodeLabel(x)}`).join(', ')}
            </p>
          )}
          {users.length > 0 && (
            <ul className="awf-users">
              {users.map((u, i) => (
                <li key={i} className="small">
                  <b>
                    {num(u.x.id)}. {nodeLabel(u.x)}
                  </b>{' '}
                  použije „{u.out}“ jako {u.input.toLowerCase()}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default function AppWorkflows({ app }: { app: StoreApp }) {
  const list = workflowsForApp(app.id);
  if (!list.length)
    return (
      <div className="empty glass">
        <p>{app.name} zatím není zapojená do žádného workflow nemocnice.</p>
        <Link href="#/workflow/vytvorit" className="tile-btn open">
          <Plus size={14} aria-hidden /> Vytvořit workflow
        </Link>
      </div>
    );
  return (
    <div className="awf">
      {list.map((w) => {
        const own = w.nodes.filter((nd) => nd.kind === 'app' && nd.ref === app.id);
        const order = [...w.nodes].sort((a, b) => a.x - b.x || a.y - b.y);
        const others = [...new Set(w.nodes.filter((nd) => nd.kind === 'app' && nd.ref !== app.id).map((nd) => appById[nd.ref]?.name))];
        return (
          <article key={w.id} className="glass app-panel awf-card">
            <header className="awf-head">
              <div>
                <h3>
                  <Link href={`#/workflow/vytvorit/${w.id}`}>{w.name}</Link>
                </h3>
                <p className="muted small">{w.desc}</p>
              </div>
              <span className={`st-chip compact tone-${w.status === 'aktivni' ? 'match' : w.status === 'koncept' ? 'na' : 'wait'}`}>{statusLabel[w.status]}</span>
              <Link href={`#/workflow/vytvorit/${w.id}`} className="tile-btn">
                <Pencil size={14} aria-hidden /> Otevřít v editoru
              </Link>
            </header>
            <ol className="awf-chain" aria-label="Kroky workflow; kroky této aplikace jsou zvýrazněné">
              {order.map((nd) => (
                <li key={nd.id}>
                  <StepIcon nd={nd} own={nd.kind === 'app' && nd.ref === app.id} />
                </li>
              ))}
            </ol>
            <p className="small muted">
              {w.patients} pacientů · spravuje {w.owner} · upraveno {w.updated}
              {others.length > 0 && ` · spolu s: ${others.join(', ')}`}
            </p>
            {own.map((nd) => (
              <Role key={nd.id} w={w} nd={nd} />
            ))}
          </article>
        );
      })}
      <p className="muted small">Funkce, vstupy a mapování dat se nastavují v editoru workflow. Data mezi kroky jdou přes TheraHUB Node ve FHIR.</p>
    </div>
  );
}
