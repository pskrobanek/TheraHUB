// Fronta posuzovatele „Ke kontrole“ (brief §9.4, §7): seznam vlevo, balíček a rozhodnutí vpravo.
// Fáze 0b: jen rozhraní – rozhodnutí se drží v paměti stránky, workflow engine přijde ve Fázi 2.
import { CircleCheck, FileText, Flag, Info, KeyRound, MessageSquare, Send, Undo2, UserRound, Users, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { criticalityLabel, domainLabel, domains, type Domain } from '../../data/trial/catalog';
import { DEMO_TODAY, fmtDay, workdaysBetween, workdaysLabel } from '../../data/trial/dates';
import { dossiers } from '../../data/trial/dossiers';
import { match, statusOrder, type ItemResult } from '../../data/trial/match';
import { departments, domainOwner, outcomeLabel, progressOf, templateA, type StepId, type TrialRequest } from '../../data/trial/requests';
import { storeApps } from '../../data/store';
import AppIcon from '../AppIcon';
import Link from '../Link';
import StateBadge from './StateBadge';
import { Counts, StatusChip, VerdictBadge } from './Status';

export interface Task {
  key: string;
  req: TrialRequest;
  step: StepId;
  domain?: Domain;
  label: string;
  since?: string;
  due?: string;
  overdue: boolean;
  waitingVendor: boolean;
}

const vendorOf = (r: TrialRequest) => dossiers[r.appId]?.vendor ?? 'Firma';
const appOf = (id: string) => storeApps.find((a) => a.id === id)!;

/** Úkoly osoby: aktivní kroky, které drží (u bloku jen její oblast). */
export function tasksFor(person: string, requests: TrialRequest[]): Task[] {
  const out: Task[] = [];
  for (const r of requests) {
    const p = progressOf(r, vendorOf(r));
    if (p.current < 0) continue;
    const st = templateA.steps[p.current];
    if (st.id === 'posouzeni' && r.block) {
      domains.forEach((d) => {
        const b = r.block![d];
        if (domainOwner[d].name === person && b && (b.status === 'active' || b.status === 'waiting_vendor')) {
          out.push({
            key: `${r.id}:${d}`,
            req: r,
            step: st.id,
            domain: d,
            label: `Posouzení ${domainLabel[d]}`,
            since: b.since,
            due: p.due,
            overdue: b.status === 'active' && p.overdue,
            waitingVendor: b.status === 'waiting_vendor',
          });
        }
      });
    } else if (p.holders.some((h) => h.name === person) && !['rejected', 'withdrawn', 'on_hold'].includes(r.state)) {
      out.push({ key: `${r.id}:${st.id}`, req: r, step: st.id, label: st.label, since: p.currentRun?.since, due: p.due, overdue: p.overdue, waitingVendor: false });
    }
  }
  // Po termínu nahoře, pak podle termínu (§9.4).
  return out.sort((a, b) => Number(b.overdue) - Number(a.overdue) || (a.due ?? '9').localeCompare(b.due ?? '9'));
}

/** Dokumenty v balíčku podle oblasti (brief §7.1); v demu jen názvy. */
const domainDocs: Record<Domain, string[]> = {
  legal: ['Návrh pilotní smlouvy', 'Licenční podmínky', 'Pojistný certifikát'],
  gdpr: ['Návrh DPA (čl. 28)', 'DPIA', 'Seznam subdodavatelů', 'Informace pro pacienty'],
  security: ['Bezpečnostní architektura', 'Souhrn penetračního testu', 'Certifikáty'],
  ostatni: ['Plán školení personálu', 'SLA podpory', 'Reference'],
};

type Done = { action: string; text?: string };

export default function ReviewerInbox({ person, requests }: { person: string; requests: TrialRequest[] }) {
  const all = useMemo(() => tasksFor(person, requests), [person, requests]);
  const [done, setDone] = useState<Record<string, Done>>({});
  const tasks = all.filter((t) => !done[t.key]);
  const [sel, setSel] = useState(0);
  const [action, setAction] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const current = tasks[Math.min(sel, tasks.length - 1)];
  const lastDone = Object.entries(done).at(-1);

  useEffect(() => setSel(0), [person]);
  useEffect(() => setAction(null), [current?.key]);

  // Klávesnice: j/k pohyb, Enter otevřít, A schválit, R vrátit (§9.4).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'j') setSel((i) => Math.min(i + 1, tasks.length - 1));
      else if (e.key === 'k') setSel((i) => Math.max(i - 1, 0));
      else if (e.key === 'Enter') panelRef.current?.focus();
      else if (e.key === 'a' || e.key === 'A') setAction('approve');
      else if (e.key === 'r' || e.key === 'R') setAction('return');
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tasks.length]);

  const finish = (label: string, text?: string) => {
    if (!current) return;
    setDone((d) => ({ ...d, [current.key]: { action: label, text } }));
    setAction(null);
  };

  return (
    <div className="inbox">
      {lastDone && (
        <p className="inbox-toast" role="status">
          <CircleCheck size={16} aria-hidden /> {lastDone[1].action}: {lastDone[0].split(':')[0]}. V ukázce se rozhodnutí neukládá – workflow engine přijde ve Fázi 2.
        </p>
      )}
      {tasks.length === 0 ? (
        <div className="empty glass">{person} teď nemá nic ke kontrole.</div>
      ) : (
        <div className="inbox-split">
          <ul className="inbox-list glass" role="listbox" aria-label="Úkoly ke kontrole">
            {tasks.map((t, i) => {
              const app = appOf(t.req.appId);
              return (
                <li key={t.key} role="option" aria-selected={t === current}>
                  <button className={t === current ? 'inbox-item on' : 'inbox-item'} onClick={() => setSel(i)}>
                    <AppIcon app={app} size={30} />
                    <span className="inbox-item-text">
                      <b>{app.name}</b>
                      <span className="small">{t.label}</span>
                      <span className="muted small">
                        {departments[t.req.dept].name} · {t.req.id}
                      </span>
                    </span>
                    <span className="inbox-item-due small">
                      {t.waitingVendor ? (
                        <span className="muted">čeká na firmu</span>
                      ) : t.overdue ? (
                        <span className="overdue-tag">po termínu</span>
                      ) : t.due ? (
                        <span className="muted">do {fmtDay(t.due)}</span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {current && (
            <div className="inbox-task glass" tabIndex={-1} ref={panelRef} aria-label={`Úkol ${current.label}`}>
              <TaskPanel task={current} action={action} setAction={setAction} onFinish={finish} />
            </div>
          )}
        </div>
      )}
      <p className="muted small inbox-keys">
        <KeyRound size={13} aria-hidden /> Klávesy: <kbd>j</kbd>/<kbd>k</kbd> pohyb v seznamu · <kbd>Enter</kbd> otevřít úkol · <kbd>A</kbd> schválit · <kbd>R</kbd> vrátit
      </p>
    </div>
  );
}

function TaskPanel({ task, action, setAction, onFinish }: { task: Task; action: string | null; setAction: (a: string | null) => void; onFinish: (label: string, text?: string) => void }) {
  const r = task.req;
  const app = appOf(r.appId);
  const dep = departments[r.dept];
  const result = match(dossiers[r.appId]?.answers, r.waivers ?? {}, r.snapshotAt);
  const dom = task.domain ? result.domains.find((d) => d.domain === task.domain)! : undefined;
  const problems: ItemResult[] = dom ? dom.items.filter((i) => !['match', 'na', 'waived'].includes(i.status)).sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)) : [];
  const gaps = problems.filter((p) => p.status === 'gap' || p.status === 'partial' || p.status === 'missing' || p.status === 'expired');
  const earlier = [
    ...templateA.steps.map((st) => ({ label: st.label, run: r.steps[st.id] })),
    ...domains.map((d) => ({ label: `Posouzení ${domainLabel[d]}`, run: r.block?.[d] })),
  ].filter((x) => x.run && x.run.status === 'done' && x.label !== 'Žádost');

  return (
    <>
      <header className="task-head">
        <AppIcon app={app} size={40} />
        <div>
          <h2>
            {task.label} · {app.name}
          </h2>
          <p className="muted small">
            <Link href={`#/aplikace/zadosti/${r.id}`}>{r.id}</Link> · {dep.name} · žadatel {dep.requester.name}
            {task.since && ` · aktivní ${workdaysLabel(workdaysBetween(task.since, DEMO_TODAY))}`}
          </p>
        </div>
        <StateBadge state={r.state} />
      </header>

      {/* Souhrnná karta (§7.1) */}
      <section className="task-sec">
        <h3>Souhrn žádosti</h3>
        <dl className="task-facts">
          <div>
            <dt>Účel</dt>
            <dd>{r.purpose}</dd>
          </div>
          <div>
            <dt>Dodavatel</dt>
            <dd>{vendorOf(r)}</dd>
          </div>
          <div>
            <dt>Délka a rozsah</dt>
            <dd>
              {r.months} měs. · {r.patients ? `${r.patients} pacientů` : 'bez dat pacientů'} · {r.users} uživatelů
            </dd>
          </div>
          <div>
            <dt>KPI</dt>
            <dd>{r.kpis.map((k) => `${k.name} ${k.target}`).join('; ')}</dd>
          </div>
        </dl>
      </section>

      {/* Shoda: jen moje oblast, problémy nahoře; u schvalovatelů přehled všech oblastí */}
      <section className="task-sec">
        <h3>
          {dom ? `Shoda – ${domainLabel[dom.domain]}` : 'Shoda s požadavky'} <span className="muted small">snímek z podání {r.snapshotAt && fmtDay(r.snapshotAt, true)}</span>
        </h3>
        {dom ? (
          <>
            <div className="task-verdict">
              <VerdictBadge verdict={dom.verdict} size="sm" />
              <Counts counts={dom.counts} />
            </div>
            {problems.length === 0 ? (
              <p className="task-allok">
                <CircleCheck size={16} aria-hidden /> Vše splněno s platnými doklady – stačí potvrdit a předat dál.
              </p>
            ) : (
              <ul className="task-items">
                {problems.map((p) => (
                  <li key={p.item.code}>
                    <StatusChip status={p.status} compact />
                    <div>
                      <b>{p.item.title}</b> <span className="muted small">{p.item.code} · {criticalityLabel[p.item.criticality]}</span>
                      <div className="small">
                        Očekávání: {p.item.expectation} · Odpověď: {p.answer}
                      </div>
                      <div className="muted small">{p.reason}</div>
                      {p.evidence && (
                        <div className="small">
                          <FileText size={12} aria-hidden /> {p.evidence.name} · {p.evidence.verified ? 'Ověřeno TheraHUB' : 'Čestné prohlášení'}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="task-docs">
              <span className="muted small">Dokumenty oblasti:</span>
              {domainDocs[dom.domain].map((d) => (
                <span key={d} className="doc-chip">
                  <FileText size={12} aria-hidden /> {d}
                </span>
              ))}
            </div>
          </>
        ) : (
          <div className="task-verdict">
            <VerdictBadge verdict={result.verdict} size="sm" />
            {result.domains.map((d) => (
              <span key={d.domain} className="task-dom">
                {domainLabel[d.domain]} <Counts counts={d.counts} />
              </span>
            ))}
          </div>
        )}
      </section>

      {earlier.length > 0 && (
        <section className="task-sec">
          <h3>Dřívější rozhodnutí</h3>
          <ul className="task-earlier">
            {earlier.map((e) => (
              <li key={e.label}>
                <b>{e.label}</b> – {e.run!.by}, {e.run!.date && fmtDay(e.run!.date)} · {e.run!.outcome ? outcomeLabel[e.run!.outcome] : ''}
                {e.run!.condition && <span className="muted"> · podmínka: {e.run!.condition}</span>}
              </li>
            ))}
          </ul>
          <p className="muted small">Historie v konsorciu: nemocnice výsledky nesdílí (lze zapnout v nastavení).</p>
        </section>
      )}

      {task.waitingVendor ? (
        <p className="phase-note">
          <Info size={15} aria-hidden /> Čekáte na odpověď firmy na dotaz. SLA nemocnice stojí; po odpovědi se položka znovu vyhodnotí.
        </p>
      ) : (
        <Decision task={task} gaps={gaps} problems={problems} action={action} setAction={setAction} onFinish={onFinish} />
      )}
    </>
  );
}

const rejectReasons = ['Nesplňuje blokující požadavek', 'Nedostatečná klinická potřeba', 'Kapacita oddělení', 'Jiné'];

function Decision({ task, gaps, problems, action, setAction, onFinish }: { task: Task; gaps: ItemResult[]; problems: ItemResult[]; action: string | null; setAction: (a: string | null) => void; onFinish: (label: string, text?: string) => void }) {
  const [text, setText] = useState('');
  const [forVendor, setForVendor] = useState(false);
  const [waived, setWaived] = useState<Record<string, boolean>>({});
  const [mfa, setMfa] = useState(false);
  const [reason, setReason] = useState(rejectReasons[0]);
  const isFinal = task.step === 'rozhodnuti' || task.step === 'smlouva';
  const openGaps = gaps.filter((g) => !waived[g.item.code]);
  const blockingWaiver = gaps.some((g) => waived[g.item.code] && g.item.criticality === 'blokujici');
  const approveBlocked = !!task.domain && openGaps.some((g) => g.status === 'gap' || g.status === 'missing' || g.status === 'expired');

  useEffect(() => {
    setText('');
    setWaived({});
    setMfa(false);
  }, [task.key]);

  const needMfa = isFinal || blockingWaiver;
  const submit = (label: string) => (needMfa && !mfa && (action === 'approve' || action === 'condition' || action === 'waive') ? setMfa(true) : onFinish(label, text));

  const btn = (id: string, label: string, Icon: typeof Send, primary = false) => (
    <button className={action === id ? `btn ${primary ? 'primary' : ''} on` : `btn ${primary ? 'primary' : ''}`} onClick={() => setAction(action === id ? null : id)}>
      <Icon size={15} aria-hidden /> {label}
    </button>
  );

  return (
    <section className="task-sec task-decide">
      <h3>Rozhodnutí</h3>
      <div className="task-actions">
        {btn('approve', 'Schválit a předat dál', CircleCheck, true)}
        {btn('condition', 'Schválit s podmínkou', CircleCheck)}
        {task.domain && gaps.length > 0 && btn('waive', 'Udělit výjimku', Flag)}
        {task.domain && btn('ask', 'Dotaz na firmu', MessageSquare)}
        {btn('return', 'Vrátit žadateli', Undo2)}
        {btn('consult', 'Ke konzultaci', Users)}
        {btn('delegate', 'Delegovat', UserRound)}
        {btn('reject', 'Zamítnout', X)}
      </div>

      {action === 'approve' && (
        <div className="task-form">
          {approveBlocked ? (
            <p className="cbox-warn small">Oblast má otevřený rozpor, chybějící nebo prošlý doklad. Schválení vyžaduje výjimku nebo dotaz na firmu.</p>
          ) : (
            <button className="btn primary" onClick={() => submit('Schváleno a předáno dál')}>
              Potvrdit schválení
            </button>
          )}
        </div>
      )}
      {action === 'condition' && (
        <div className="task-form">
          <label>
            Podmínka (smluvní doložka, technické opatření, termín)
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} />
          </label>
          <button className="btn primary" disabled={!text.trim() || approveBlocked} onClick={() => submit('Schváleno s podmínkou')}>
            Schválit s podmínkou
          </button>
          {approveBlocked && <p className="cbox-warn small">Nejdřív vyřešte rozpory výjimkou.</p>}
        </div>
      )}
      {action === 'waive' && (
        <div className="task-form">
          {gaps.map((g) => (
            <label key={g.item.code} className="task-check">
              <input type="checkbox" checked={!!waived[g.item.code]} onChange={(e) => setWaived((w) => ({ ...w, [g.item.code]: e.target.checked }))} />
              <StatusChip status={g.status} compact /> {g.item.title} <span className="muted small">({criticalityLabel[g.item.criticality]})</span>
            </label>
          ))}
          <label>
            Důvod a rozsah výjimky
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="např. jen pro pilotní provoz, platí do…" />
          </label>
          <button className="btn primary" disabled={!text.trim() || !Object.values(waived).some(Boolean)} onClick={() => submit('Výjimka udělena')}>
            Udělit výjimku
          </button>
        </div>
      )}
      {action === 'ask' && (
        <div className="task-form">
          <label>
            Dotaz na firmu (návrh z rozporů – upravte)
            <textarea
              rows={3}
              value={text || problems.map((g) => `${g.item.code} ${g.item.title}: ${g.reason} Prosíme o doplnění nebo nápravu.`).join('\n')}
              onChange={(e) => setText(e.target.value)}
            />
          </label>
          <button className="btn primary" onClick={() => onFinish('Dotaz odeslán firmě', text)}>
            <Send size={15} aria-hidden /> Odeslat dotaz (SLA nemocnice se pozastaví)
          </button>
        </div>
      )}
      {(action === 'return' || action === 'consult' || action === 'delegate') && (
        <div className="task-form">
          {action !== 'return' && (
            <label>
              {action === 'consult' ? 'Komu poslat ke konzultaci' : 'Komu předat (stejná role)'}
              <select>
                <option>{action === 'consult' ? 'Kolega z nemocnice…' : 'Zástupce role…'}</option>
              </select>
            </label>
          )}
          <label>
            Komentář
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} />
          </label>
          <label className="task-check">
            <input type="checkbox" checked={forVendor} onChange={(e) => setForVendor(e.target.checked)} /> Pro firmu (jinak jen interní)
          </label>
          <button className="btn primary" disabled={action === 'return' && !text.trim()} onClick={() => onFinish(action === 'return' ? 'Vráceno žadateli' : action === 'consult' ? 'Posláno ke konzultaci' : 'Delegováno', text)}>
            Odeslat
          </button>
        </div>
      )}
      {action === 'reject' && (
        <div className="task-form">
          <label>
            Důvod zamítnutí
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              {rejectReasons.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            Zdůvodnění
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} />
          </label>
          <button className="btn danger" disabled={!text.trim()} onClick={() => submit(`Zamítnuto (${reason})`)}>
            Zamítnout
          </button>
        </div>
      )}

      {mfa && (
        <div className="mfa glass" role="dialog" aria-label="Ověření MFA">
          <KeyRound size={18} aria-hidden />
          <span>Finální rozhodnutí nebo výjimka u blokujícího požadavku vyžaduje znovu MFA. V ukázce stačí potvrdit.</span>
          <button className="btn primary" onClick={() => onFinish(action === 'waive' ? 'Výjimka udělena' : action === 'condition' ? 'Schváleno s podmínkou' : 'Schváleno a předáno dál', text)}>
            Potvrdit kódem
          </button>
        </div>
      )}
      <p className="muted small">Komentáře jsou interní, dokud je výslovně neoznačíte „Pro firmu“. Firma vidí jen role, ne jména.</p>
    </section>
  );
}
