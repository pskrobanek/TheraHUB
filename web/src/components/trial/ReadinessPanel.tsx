// Pravý sloupec s připraveností aplikace (DEC-015): Adoption index, 4 oblasti požadavků nemocnice a další soulad.
// Stejná komponenta je v detailu aplikace v App Storu i v detailu žádosti – obě čtou stejné dossier, takže jsou vždy shodné.
import { LayoutGrid, Lock, Scale, Shield, type LucideIcon } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { domainLabel, profileVersion, type Domain } from '../../data/trial/catalog';
import { dossiers, realAppIds } from '../../data/trial/dossiers';
import { match, statusOrder, type DomainResult, type ItemStatus } from '../../data/trial/match';
import { hospitalDemo } from '../../data/trial/requests';
import type { StoreApp } from '../../data/types';
import { adoptionIndex, levelLabel } from '../../lib/score';
import { Bar, CheckRow } from '../apps/StoreCard';
import { Drawer } from './ComplianceBox';
import { StatusChip, VerdictBadge } from './Status';

export const domainIcon: Record<Domain, LucideIcon> = { legal: Scale, gdpr: Lock, security: Shield, ostatni: LayoutGrid };

/** Podíl splněných požadavků oblasti (Nevztahuje se se nepočítá; Částečně = polovina). */
export function domainPct(d: DomainResult): number {
  const items = d.items.filter((i) => i.status !== 'na');
  if (!items.length) return 100;
  const v = (s: ItemStatus) => (s === 'match' || s === 'waived' ? 1 : s === 'partial' ? 0.5 : 0);
  return Math.round((items.reduce((n, i) => n + v(i.status), 0) / items.length) * 100);
}

/** Barva podle podílu splněných: tokeny stavů (85+ / 70+ / 55+ / méně). */
export const toneFor = (pct: number) => (pct >= 85 ? 'match' : pct >= 70 ? 'partial' : pct >= 55 ? 'missing' : 'gap');

function Ring({ value, level }: { value: number | null; level?: string }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <svg className="sd-ring" width="84" height="84" viewBox="0 0 84 84" role="img" aria-label={value === null ? 'Adoption index zatím není' : `Adoption index ${value} ze 100`}>
      <circle cx="42" cy="42" r={r} className="sd-ring-track" />
      {value !== null && (
        <circle cx="42" cy="42" r={r} className={`sd-ring-fill fill-${level}`} strokeDasharray={`${(value / 100) * c} ${c}`} transform="rotate(-90 42 42)" />
      )}
      <text x="42" y="47" textAnchor="middle" className="sd-ring-num">
        {value ?? '—'}
      </text>
    </svg>
  );
}

/** Pravý sloupec připravenosti. `note` se ukáže pod oblastmi (např. snímek z podání), `children` dole (tlačítko žádosti apod.). */
export default function ReadinessPanel({ app, note, children }: { app: StoreApp; note?: ReactNode; children?: ReactNode }) {
  const real = realAppIds.has(app.id);
  const dossier = dossiers[app.id];
  const result = match(real ? undefined : dossier?.answers);
  const score = adoptionIndex(app);
  const [drawer, setDrawer] = useState<Domain | null>(null);
  const otherParts = score.parts.filter((p) => p.id !== 'hospital');
  const nis = score.parts.find((p) => p.id === 'hospital')!.checks.find((c) => c.label === 'Integrace s NIS')!;

  return (
    <aside className="sd-side glass" aria-label="Připravenost a shoda">
          <header className="sd-side-head">
            <Ring value={real ? null : score.total} level={score.level} />
            <div>
              <span className="c-label">Adoption index</span>
              <b className="sd-side-level">{real ? 'Spočítá se z dossier' : `${levelLabel[score.level]} připravenost`}</b>
              <p className="small muted">Obecná připravenost aplikace v katalogu. Není to verdikt vaší nemocnice – ten je níže.</p>
            </div>
          </header>

          <section className="sd-block">
            <div className="sd-block-head">
              <h2>Požadavky {hospitalDemo.short}</h2>
              <VerdictBadge verdict={real ? 'pripravuje' : result.verdict} size="sm" />
            </div>
            {real ? (
              <p className="small muted">Dodavatel dossier teprve vyplňuje – do té doby žádné vymyšlené hodnocení.</p>
            ) : (
              <ul className="sd-domains">
                {result.domains.map((d) => {
                  const pct = domainPct(d);
                  const tone = toneFor(pct);
                  const Icon = domainIcon[d.domain];
                  const unmet = d.items.filter((i) => !['match', 'na', 'waived'].includes(i.status)).sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));
                  return (
                    <li key={d.domain} className={`sd-domain tone-${tone}`}>
                      <button className="sd-domain-row" onClick={() => setDrawer(d.domain)} aria-haspopup="dialog">
                        <span className="sd-domain-icon" aria-hidden>
                          <Icon size={17} fill="currentColor" strokeWidth={1.5} />
                        </span>
                        <span className="sd-domain-name">{domainLabel[d.domain]}</span>
                        <span className="sd-domain-pct">{pct} %</span>
                        <span className="sd-domain-bar" aria-hidden>
                          <span style={{ width: `${pct}%` }} />
                        </span>
                      </button>
                      {unmet.length > 0 ? (
                        <ul className="sd-unmet">
                          {unmet.map((u) => (
                            <li key={u.item.code}>
                              <StatusChip status={u.status} compact />
                              <span>
                                {u.item.title}
                                <span className="muted"> – {u.reason}</span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="sd-allok small">Všechny požadavky splněny.</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            {!real && note}
            {!real && (
              <p className="small muted">
                Profil v{profileVersion.version} · dossier v{dossier?.version} · požadavky a prahy jsou zástupné ukázky.{' '}
                <button className="link-btn" onClick={() => setDrawer('legal')}>
                  Všechny položky
                </button>
              </p>
            )}
          </section>

          <section className="sd-block">
            <div className="sd-block-head">
              <h2>Další soulad</h2>
            </div>
            {real ? (
              <p className="small muted">Spočítá se z dossier.</p>
            ) : (
              <div className="sd-more">
                <div className="sd-more-part">
                  <div className="sd-more-head">
                    <b>Integrace s NIS</b>
                    <span className="mono">{nis.note}</span>
                  </div>
                  <Bar pct={Math.round(nis.value * 100)} thin />
                </div>
                {otherParts.map((p) => (
                  <div key={p.id} className="sd-more-part">
                    <div className="sd-more-head">
                      <b>{p.label}</b>
                      <span className="mono">{p.pct} %</span>
                    </div>
                    <ul className="idx-checks">
                      {p.checks.map((c) => (
                        <CheckRow key={c.label} check={c} />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>

      {children}
      {drawer && !real && <Drawer result={result} initial={drawer} onClose={() => setDrawer(null)} />}
    </aside>
  );
}
