// Box „Shoda s požadavky [nemocnice]“ a panel s položkami (brief §9.1).
import { FileDown, Info, ShieldCheck, TriangleAlert, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { criticalityLabel, domainLabel, domains, profileVersion, type Domain } from '../../data/trial/catalog';
import { fmtDay } from '../../data/trial/dates';
import { statusOrder, type MatchResult } from '../../data/trial/match';
import { hospitalDemo } from '../../data/trial/requests';
import { Counts, StatusChip, VerdictBadge } from './Status';

interface Props {
  result: MatchResult;
  dossierVersion?: number;
  /** Skutečná aplikace bez hotového dossier (DEC-008). */
  pending?: boolean;
  /** Snímek z podání žádosti (REQ-MAT-008). */
  snapshotLabel?: string;
  /** Tlačítko žádosti; null = nezobrazovat. */
  onRequest?: (() => void) | null;
}

export default function ComplianceBox({ result, dossierVersion, pending, snapshotLabel, onRequest }: Props) {
  const [open, setOpen] = useState<Domain | null>(null);
  const blocking = result.domains.some((d) => d.items.some((i) => i.item.criticality === 'blokujici' && ['gap', 'missing', 'expired'].includes(i.status)));

  return (
    <section className="cbox glass" aria-labelledby="cbox-title">
      <header className="cbox-head">
        <div>
          <h2 id="cbox-title">Shoda s požadavky {hospitalDemo.short}</h2>
          <p className="muted small">
            {snapshotLabel ?? `Vyhodnoceno ${fmtDay(result.asOf, true)}`} · profil v{profileVersion.version}
            {dossierVersion ? ` · dossier v${dossierVersion}` : ''}
          </p>
        </div>
        <VerdictBadge verdict={pending ? 'pripravuje' : result.verdict} size="lg" />
      </header>

      {pending ? (
        <p className="cbox-pending">
          <Info size={16} aria-hidden />
          Dodavatel dossier teprve vyplňuje. Shoda se ukáže, až bude kompletní – do té doby žádné vymyšlené hodnocení.
        </p>
      ) : (
        <div className="cbox-tiles">
          {result.domains.map((d) => (
            <button key={d.domain} className="cbox-tile" onClick={() => setOpen(d.domain)} aria-haspopup="dialog">
              <span className="cbox-tile-name">{domainLabel[d.domain]}</span>
              <VerdictBadge verdict={d.verdict} size="sm" />
              <Counts counts={d.counts} />
            </button>
          ))}
        </div>
      )}

      {onRequest !== null && !pending && (
        <footer className="cbox-foot">
          {blocking && (
            <span className="cbox-warn">
              <TriangleAlert size={15} aria-hidden /> Aplikace má blokující rozpory. Žádost lze podat, rozpory se řeší výjimkou nebo doplněním.
            </span>
          )}
          <button className="btn primary" onClick={onRequest ?? undefined}>
            Požádat o pilotní provoz
          </button>
        </footer>
      )}

      <p className="cbox-note muted small">
        <ShieldCheck size={13} aria-hidden /> Požadavky a prahy jsou zástupné ukázky, ne skutečný právní, GDPR ani bezpečnostní obsah.
      </p>

      {open && !pending && result.domains.length > 0 && <Drawer result={result} initial={open} onClose={() => setOpen(null)} />}
    </section>
  );
}

function Drawer({ result, initial, onClose }: { result: MatchResult; initial: Domain; onClose: () => void }) {
  const [dom, setDom] = useState<Domain>(initial);
  const [onlyProblems, setOnlyProblems] = useState(false);
  const [onlyBlocking, setOnlyBlocking] = useState(false);
  const d = result.domains.find((x) => x.domain === dom)!;
  const items = [...d.items]
    .filter((i) => !onlyProblems || !['match', 'na', 'waived'].includes(i.status))
    .filter((i) => !onlyBlocking || i.item.criticality === 'blokujici')
    .sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={`Položky oblasti ${domainLabel[dom]}`} onClick={(e) => e.stopPropagation()}>
        <header className="drawer-head">
          <nav className="drawer-tabs" aria-label="Oblasti">
            {domains.map((x) => (
              <button key={x} className={x === dom ? 'tab active' : 'tab'} onClick={() => setDom(x)}>
                {domainLabel[x]}
              </button>
            ))}
          </nav>
          <button className="btn ghost icon" onClick={onClose} aria-label="Zavřít">
            <X size={18} />
          </button>
        </header>
        <div className="drawer-tools">
          <VerdictBadge verdict={d.verdict} size="sm" />
          <Counts counts={d.counts} />
          <span className="drawer-filters">
            <label>
              <input type="checkbox" checked={onlyProblems} onChange={(e) => setOnlyProblems(e.target.checked)} /> Jen rozpory
            </label>
            <label>
              <input type="checkbox" checked={onlyBlocking} onChange={(e) => setOnlyBlocking(e.target.checked)} /> Jen blokující
            </label>
            <button className="btn" disabled title="Export PDF přijde ve Fázi 1">
              <FileDown size={15} /> PDF
            </button>
          </span>
        </div>
        <div className="drawer-table-wrap">
          <table className="ctable">
            <thead>
              <tr>
                <th>Požadavek</th>
                <th>Kritičnost</th>
                <th>Očekávání nemocnice</th>
                <th>Odpověď firmy</th>
                <th>Doklad</th>
                <th>Stav</th>
                <th>Výjimka / poznámka</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.item.code}>
                  <td>
                    <span className="mono muted small">{r.item.code}</span>
                    <div>{r.item.title}</div>
                  </td>
                  <td>{criticalityLabel[r.item.criticality]}</td>
                  <td>{r.item.expectation}</td>
                  <td>{r.answer}</td>
                  <td>
                    {r.evidence ? (
                      <>
                        <div>{r.evidence.name}</div>
                        <div className="muted small">
                          {fmtDay(r.evidence.issued, true)}
                          {r.evidence.validUntil ? ` – ${fmtDay(r.evidence.validUntil, true)}` : ''}
                        </div>
                        <div className={r.evidence.verified ? 'ev-verified small' : 'muted small'}>{r.evidence.verified ? 'Ověřeno TheraHUB' : 'Čestné prohlášení'}</div>
                      </>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td>
                    <StatusChip status={r.status} compact />
                    <div className="muted small ctable-reason">{r.reason}</div>
                  </td>
                  <td>{r.waiver ?? <span className="muted">—</span>}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="muted">
                    Žádná položka neodpovídá filtru.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="muted small drawer-foot">Obsah požadavků je zástupný: TODO(legal), TODO(dpo), TODO(security).</p>
      </aside>
    </div>
  );
}
