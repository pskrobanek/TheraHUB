import { useEffect } from 'react';
import type { ActiveApp } from '../data/types';
import { daysUntil, formatCzk, formatDate } from '../lib/dates';
import { contractLabel, hostingLabel, levelLabel } from '../lib/labels';
import { ReadinessBadge, StatusBadge } from './Badges';

interface Props {
  app: ActiveApp;
  onClose: () => void;
}

export default function AppDetail({ app, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const certDays = daysUntil(app.compliance.certifiedUntil);

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" role="dialog" aria-label={app.name} onClick={(e) => e.stopPropagation()}>
        <button className="drawer-close" onClick={onClose} aria-label="Zavřít">
          ×
        </button>
        <h2>{app.name}</h2>
        <div className="muted">
          {app.vendor} · {app.category}
        </div>
        <p>{app.description}</p>
        <div className="badges">
          <StatusBadge status={app.status} />
          <ReadinessBadge readiness={app.readiness} />
        </div>
        {app.readinessNote && <p className="note">{app.readinessNote}</p>}

        <h3>Nasazení</h3>
        <dl>
          <dt>Oddělení</dt>
          <dd>{app.departments.join(', ')}</dd>
          <dt>Hosting</dt>
          <dd>{hostingLabel[app.hosting]}</dd>
          <dt>Aktivní uživatelé</dt>
          <dd>{app.usage.activeUsers}</dd>
          <dt>Dostupnost (30 dní)</dt>
          <dd>{app.usage.uptimePct === null ? '—' : `${app.usage.uptimePct} %`}</dd>
          <dt>Otevřené incidenty</dt>
          <dd>{app.openIncidents}</dd>
        </dl>

        <h3>Compliance</h3>
        <dl>
          <dt>Data</dt>
          <dd>{levelLabel[app.compliance.data]}</dd>
          <dt>Security</dt>
          <dd>{levelLabel[app.compliance.security]}</dd>
          <dt>Privacy</dt>
          <dd>{levelLabel[app.compliance.privacy]}</dd>
          <dt>Safety</dt>
          <dd>{app.compliance.safety}</dd>
          <dt>Certifikace do</dt>
          <dd>
            {formatDate(app.compliance.certifiedUntil)} <span className="muted">({certDays} dní)</span>
          </dd>
        </dl>

        <h3>Smlouva</h3>
        <dl>
          <dt>Typ</dt>
          <dd>{contractLabel[app.contract.type]}</dd>
          <dt>Platnost do</dt>
          <dd>{app.contract.validUntil ? formatDate(app.contract.validUntil) : 'na dobu neurčitou'}</dd>
          <dt>Roční náklady</dt>
          <dd>{formatCzk(app.contract.annualCostCzk)}</dd>
        </dl>
      </aside>
    </div>
  );
}
