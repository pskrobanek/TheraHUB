import type { ActiveApp } from '../data/types';
import { daysUntil } from './dates';

export interface Alert {
  appId: string;
  severity: 'warning' | 'critical';
  text: string;
}

const CERT_WARN_DAYS = 60;
const CONTRACT_WARN_DAYS = 90;

/** Upozornění odvozená z aplikací: expirace certifikací a smluv, incidenty, omezený provoz. */
export function deriveAlerts(apps: ActiveApp[]): Alert[] {
  const alerts: Alert[] = [];
  for (const app of apps) {
    const certDays = daysUntil(app.compliance.certifiedUntil);
    if (certDays <= CERT_WARN_DAYS) {
      alerts.push({
        appId: app.id,
        severity: certDays <= 14 ? 'critical' : 'warning',
        text: `${app.name}: certifikace TheraHUB vyprší za ${certDays} dní`,
      });
    }
    if (app.contract.validUntil) {
      const contractDays = daysUntil(app.contract.validUntil);
      if (contractDays <= CONTRACT_WARN_DAYS) {
        const what = app.contract.type === 'pilotni' ? 'pilot končí' : 'smlouva končí';
        alerts.push({
          appId: app.id,
          severity: contractDays <= 30 ? 'critical' : 'warning',
          text: `${app.name}: ${what} za ${contractDays} dní`,
        });
      }
    }
    if (app.openIncidents > 0) {
      alerts.push({ appId: app.id, severity: 'critical', text: `${app.name}: otevřené incidenty (${app.openIncidents})` });
    }
    if (app.readiness === 'omezeny') {
      alerts.push({ appId: app.id, severity: 'warning', text: `${app.name}: omezený provoz – chybí data z NIS` });
    }
  }
  return alerts.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'critical' ? -1 : 1));
}
