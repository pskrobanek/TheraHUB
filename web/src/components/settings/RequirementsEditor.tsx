// Editor požadavků nemocnice (brief §3.2, §9.6). Fáze 0b: koncept v paměti, publikování ukázkové.
import { CircleAlert, Plus, Search, Upload, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { storeApps } from '../../data/store';
import { catalog, catalogExtra, criticalityLabel, domainLabel, domains, pillarLabel, profileVersion, type CatalogItem, type Criticality, type Domain } from '../../data/trial/catalog';
import { dossiers, realAppIds } from '../../data/trial/dossiers';
import { match } from '../../data/trial/match';
import { domainOwner, hospitalDemo } from '../../data/trial/requests';
import AppIcon from '../AppIcon';
import { VerdictBadge } from '../trial/Status';

interface Row {
  item: CatalogItem;
  included: boolean;
  evidence: string;
  maxAge: number;
  custom?: boolean;
}

const deputies: Record<Domain, string> = { legal: 'Mgr. Tereza Šimková', gdpr: 'Mgr. Adam Kolář', security: 'Ing. Pavel Dušek', ostatni: 'Bc. Marta Vlčková' };
const evidenceTypes = ['Certifikát', 'Zpráva', 'Smluvní šablona', 'Prohlášení'];
const mdrOptions = ['Není ZP', 'Wellness', 'MDR I', 'MDR IIa', 'MDR IIb', 'MDR III'];
const regionOptions = ['EU/EHP', 'EU/EHP + USA', 'ČR'];

const initialRows = (): Row[] => [
  ...catalog.map((item) => ({ item: structuredClone(item), included: true, evidence: item.rule.kind === 'yes' ? 'Prohlášení' : 'Zpráva', maxAge: 24 })),
  ...catalogExtra.map((item) => ({ item: structuredClone(item), included: false, evidence: 'Prohlášení', maxAge: 24 })),
];

/** Očekávání odvozené z parametru (vše zástupné). */
function expectationOf(it: CatalogItem): string {
  const r = it.rule;
  if (r.kind === 'oneOf') return `Povoleno: ${r.allowed.join(', ')} (ukázka)`;
  if (r.kind === 'max') return `Max. ${r.limit} ${r.unit} (ukázka)`;
  if (r.kind === 'maxAgeMonths') return `Max. ${r.months} měsíců starý (ukázka)`;
  if (r.kind === 'review') return 'Posoudí člověk';
  return it.expectation;
}

export default function RequirementsEditor() {
  const [published, setPublished] = useState<Row[]>(initialRows);
  const [version, setVersion] = useState(profileVersion.version);
  const [rows, setRows] = useState<Row[]>(() => structuredClone(published));
  const [tab, setTab] = useState<Domain>('legal');
  const [visibility, setVisibility] = useState('soukromý');
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const profileOf = (rs: Row[]) => rs.filter((r) => r.included).map((r) => ({ ...r.item, expectation: expectationOf(r.item) }));
  const set = (code: string, patch: Partial<Row> | ((r: Row) => Row)) =>
    setRows((rs) => rs.map((r) => (r.item.code === code ? (typeof patch === 'function' ? patch(r) : { ...r, ...patch }) : r)));
  const setItem = (code: string, patch: Partial<CatalogItem>) => set(code, (r) => ({ ...r, item: { ...r.item, ...patch } }));

  const changes = useMemo(() => {
    const out: string[] = [];
    const prev = new Map(published.map((r) => [r.item.code, r]));
    rows.forEach((r) => {
      const p = prev.get(r.item.code);
      if (!p) return r.included && out.push(`Přidán vlastní požadavek: ${r.item.title}`);
      if (p.included !== r.included) out.push(`${r.included ? 'Zařazeno' : 'Vyřazeno'}: ${r.item.code} ${r.item.title}`);
      if (r.included && p.item.criticality !== r.item.criticality) out.push(`${r.item.code}: ${criticalityLabel[p.item.criticality]} → ${criticalityLabel[r.item.criticality]}`);
      if (r.included && JSON.stringify(p.item.rule) !== JSON.stringify(r.item.rule)) out.push(`${r.item.code}: ${expectationOf(p.item)} → ${expectationOf(r.item)}`);
      if (r.included && (p.evidence !== r.evidence || p.maxAge !== r.maxAge)) out.push(`${r.item.code}: doklad ${r.evidence}, max. ${r.maxAge} měs.`);
    });
    return out;
  }, [rows, published]);

  /** Náhled dopadu: které aplikace v katalogu změní verdikt (§9.6). */
  const impact = useMemo(() => {
    const pub = profileOf(published);
    const draft = profileOf(rows);
    return storeApps
      .filter((a) => dossiers[a.id] && !realAppIds.has(a.id))
      .map((a) => ({ app: a, before: match(dossiers[a.id].answers, {}, undefined, pub).verdict, after: match(dossiers[a.id].answers, {}, undefined, draft).verdict }))
      .filter((x) => x.before !== x.after);
  }, [rows, published]);

  const domainRows = rows.filter((r) => r.item.domain === tab && (r.included || r.custom));
  const candidates = rows.filter((r) => !r.included && !r.custom && (!q || `${r.item.code} ${r.item.title}`.toLowerCase().includes(q.toLowerCase())));

  const addCustom = () => {
    const code = `VL-${tab.toUpperCase().slice(0, 3)}-${rows.filter((r) => r.custom).length + 1}`;
    setRows((rs) => [
      ...rs,
      {
        item: { code, domain: tab, pillar: 'legal', title: 'Nový vlastní požadavek', expectation: 'Posoudí člověk', criticality: 'informativni', rule: { kind: 'review' }, todo: 'legal' },
        included: true,
        evidence: 'Prohlášení',
        maxAge: 24,
        custom: true,
      },
    ]);
  };

  const publish = () => {
    setPublished(structuredClone(rows));
    setVersion((v) => v + 1);
    setNotice(`Publikováno jako verze ${version + 1} (ukázka). Box „Shoda s požadavky“ v App Storu používá vždy poslední verzi; žádosti v běhu zůstávají na verzi z podání a ukážou „profil změněn od podání“.`);
  };

  return (
    <div className="req-ed">
      <div className="wfb-top glass">
        <span>
          <b>Profil požadavků {hospitalDemo.short}</b> <span className="muted small">publikováno v{version} · koncept v{version + 1}</span>
        </span>
        <label>
          <span className="muted small">Viditelnost pro dodavatele</span>
          <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
            <option value="soukromý">Soukromý</option>
            <option value="dodavatele">Viditelný dodavatelům v TheraHUB</option>
            <option value="veřejný">Veřejný</option>
          </select>
        </label>
        <span className="wfb-top-actions">
          <button className="btn" disabled title="Ve Fázi 1">
            <Upload size={15} /> Importovat šablonu
          </button>
          <button className="btn primary" disabled={changes.length === 0} onClick={publish}>
            Publikovat verzi {version + 1}
          </button>
        </span>
      </div>
      <p className="phase-note">
        <CircleAlert size={15} aria-hidden /> Položky, prahy a doklady jsou zástupné ukázky (TODO(legal), TODO(dpo), TODO(security)). Skutečný obsah dodají právníci, DPO a bezpečnost.
      </p>
      {notice && <p className="phase-note glass">{notice}</p>}

      <div className="req-grid">
        <section className="glass req-main">
          <nav className="drawer-tabs req-tabs" aria-label="Oblasti">
            {domains.map((d) => (
              <button key={d} className={d === tab ? 'tab active' : 'tab'} onClick={() => setTab(d)}>
                {domainLabel[d]} <span className="muted small">{rows.filter((r) => r.item.domain === d && r.included).length}</span>
              </button>
            ))}
          </nav>
          <p className="small req-owner">
            Vlastník oblasti: <b>{domainOwner[tab].name}</b> ({domainOwner[tab].role}) · zástupce: {deputies[tab]}
          </p>
          <div className="drawer-table-wrap">
            <table className="ctable req-table">
              <thead>
                <tr>
                  <th>Zařadit</th>
                  <th>Požadavek</th>
                  <th>Kritičnost</th>
                  <th>Parametr</th>
                  <th>Doklad a max. stáří</th>
                </tr>
              </thead>
              <tbody>
                {domainRows.map((r) => (
                  <tr key={r.item.code} className={r.included ? '' : 'off'}>
                    <td>
                      <input type="checkbox" checked={r.included} onChange={(e) => set(r.item.code, { included: e.target.checked })} aria-label={`Zařadit ${r.item.title}`} />
                    </td>
                    <td>
                      <span className="mono muted small">{r.item.code}</span>
                      {r.custom ? (
                        <input className="req-input" value={r.item.title} onChange={(e) => setItem(r.item.code, { title: e.target.value })} aria-label="Název vlastního požadavku" />
                      ) : (
                        <div>{r.item.title}</div>
                      )}
                      <span className="muted small">
                        Pilíř {pillarLabel[r.item.pillar]}
                        {r.item.subcategory ? ` · ${r.item.subcategory}` : ''}
                        {r.custom ? ' · odešle se dodavateli jako dotaz' : ''}
                      </span>
                    </td>
                    <td>
                      <select value={r.item.criticality} onChange={(e) => setItem(r.item.code, { criticality: e.target.value as Criticality })} aria-label="Kritičnost">
                        {(Object.keys(criticalityLabel) as Criticality[]).map((c) => (
                          <option key={c} value={c}>
                            {criticalityLabel[c]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <ParamEditor item={r.item} onChange={(rule) => setItem(r.item.code, { rule })} />
                    </td>
                    <td>
                      <select value={r.evidence} onChange={(e) => set(r.item.code, { evidence: e.target.value })} aria-label="Typ dokladu">
                        {evidenceTypes.map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                      <label className="small req-age">
                        max.
                        <input type="number" min={1} value={r.maxAge} onChange={(e) => set(r.item.code, { maxAge: Number(e.target.value) })} aria-label="Maximální stáří dokladu v měsících" /> měs.
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="req-actions">
            <button className="btn" onClick={() => setAdding(true)}>
              <Search size={15} /> Přidat z katalogu
            </button>
            <button className="btn" onClick={addCustom}>
              <Plus size={15} /> Vlastní požadavek
            </button>
          </div>
        </section>

        <aside className="glass wfb-panel">
          <h3>Změny proti verzi {version}</h3>
          {changes.length ? (
            <ul className="wfb-diff">
              {changes.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          ) : (
            <p className="muted small">Koncept je shodný s publikovanou verzí.</p>
          )}
          <h3>Dopad před publikováním</h3>
          {impact.length === 0 ? (
            <p className="muted small">Žádná aplikace v katalogu nezmění verdikt.</p>
          ) : (
            <ul className="req-impact">
              {impact.map((x) => (
                <li key={x.app.id}>
                  <AppIcon app={x.app} size={22} />
                  <b>{x.app.name}</b>
                  <VerdictBadge verdict={x.before} size="sm" />→<VerdictBadge verdict={x.after} size="sm" />
                </li>
              ))}
            </ul>
          )}
          <p className="muted small">Skutečné aplikace bez hotového dossier se do dopadu nepočítají.</p>
        </aside>
      </div>

      {adding && (
        <div className="drawer-backdrop" onClick={() => setAdding(false)}>
          <aside className="drawer req-add" role="dialog" aria-label="Přidat z katalogu" onClick={(e) => e.stopPropagation()}>
            <header className="drawer-head">
              <b>Přidat z katalogu TheraHUB</b>
              <button className="btn ghost icon" onClick={() => setAdding(false)} aria-label="Zavřít">
                <X size={18} />
              </button>
            </header>
            <div className="drawer-tools">
              <label className="search inline">
                <Search size={16} />
                <input placeholder="Hledat v katalogu…" value={q} onChange={(e) => setQ(e.target.value)} />
              </label>
            </div>
            <ul className="req-cands">
              {candidates.map((r) => (
                <li key={r.item.code}>
                  <span>
                    <span className="mono muted small">{r.item.code}</span> {r.item.title}
                    <span className="muted small"> · {domainLabel[r.item.domain]} · {pillarLabel[r.item.pillar]}</span>
                  </span>
                  <button
                    className="btn"
                    onClick={() => {
                      set(r.item.code, { included: true });
                      setTab(r.item.domain);
                    }}
                  >
                    <Plus size={14} /> Přidat
                  </button>
                </li>
              ))}
              {candidates.length === 0 && <li className="muted">Nic dalšího v katalogu.</li>}
            </ul>
          </aside>
        </div>
      )}
    </div>
  );
}

function ParamEditor({ item, onChange }: { item: CatalogItem; onChange: (r: CatalogItem['rule']) => void }) {
  const r = item.rule;
  if (r.kind === 'oneOf') {
    const opts = item.code === 'GDP-002' ? regionOptions : mdrOptions;
    return (
      <span className="req-chips">
        {opts.map((o) => (
          <button
            key={o}
            className={r.allowed.includes(o) ? 'fchip on' : 'fchip'}
            onClick={() => onChange({ ...r, allowed: r.allowed.includes(o) ? r.allowed.filter((x) => x !== o) : [...r.allowed, o] })}
            aria-pressed={r.allowed.includes(o)}
          >
            {o}
          </button>
        ))}
      </span>
    );
  }
  if (r.kind === 'max')
    return (
      <label className="small req-age">
        max.
        <input type="number" min={0} value={r.limit} onChange={(e) => onChange({ ...r, limit: Number(e.target.value) })} aria-label="Maximální hodnota" /> {r.unit}
      </label>
    );
  if (r.kind === 'maxAgeMonths')
    return (
      <label className="small req-age">
        max.
        <input type="number" min={1} value={r.months} onChange={(e) => onChange({ ...r, months: Number(e.target.value) })} aria-label="Maximální stáří v měsících" /> měs.
      </label>
    );
  if (r.kind === 'review') return <span className="muted small">Posoudí člověk</span>;
  return <span className="small">Vyžadováno „ano“</span>;
}
