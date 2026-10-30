import { ArrowRight, LayoutGrid, Plus, Sparkle } from 'lucide-react';
import type { CatalogApp, Recommendation } from '../../data/types';
import AppIcon from '../AppIcon';
import Link from '../Link';

interface Props {
  hospitalShort: string;
  apps: CatalogApp[];
  recommendations: Recommendation[];
  onActivate: (appId: string) => void;
}

export default function AvailableApps({ hospitalShort, apps, recommendations, onActivate }: Props) {
  const reasonOf = (id: string) => recommendations.find((r) => r.appId === id)?.reason;
  // Doporučené aplikace řadíme na začátek.
  const sorted = [...apps].sort((a, b) => Number(!!reasonOf(b.id)) - Number(!!reasonOf(a.id)));

  return (
    <section>
      <h2 className="section-title">
        Dostupné v {hospitalShort} <span className="count">{apps.length}</span>
      </h2>
      <p className="muted section-sub">Licencováno vaší nemocnicí. Aktivace pošle pacientovi SMS odkaz, nic se neinstaluje.</p>

      <div className="available-grid">
        {sorted.map((app) => {
          const reason = reasonOf(app.id);
          return (
            <div key={app.id} className={reason ? 'available glass recommended' : 'available glass'}>
              <AppIcon app={app} size={36} />
              <div className="available-text">
                <b>{app.name}</b>
                <span className="muted small">{app.tagline}</span>
                {reason && (
                  <span className="reason">
                    <Sparkle size={12} fill="currentColor" /> {reason}
                  </span>
                )}
              </div>
              <button
                className={reason ? 'add filled' : 'add'}
                onClick={() => onActivate(app.id)}
                aria-label={`Aktivovat ${app.name}`}
              >
                <Plus size={18} />
              </button>
            </div>
          );
        })}

        <Link href="#/aplikace/store" className="available glass more">
          <span className="app-icon" style={{ width: 36, height: 36, color: 'var(--accent)', background: 'var(--accent-soft)' }}>
            <LayoutGrid size={18} />
          </span>
          <div className="available-text">
            <b>App Store</b>
            <span className="muted small">Požádat o další aplikace</span>
          </div>
          <ArrowRight size={18} className="muted" />
        </Link>
      </div>
    </section>
  );
}
