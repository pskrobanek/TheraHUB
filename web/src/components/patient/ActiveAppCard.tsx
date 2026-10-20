import { MoreHorizontal } from 'lucide-react';
import type { ActivePatientApp, CatalogApp } from '../../data/types';
import AppIcon from '../AppIcon';
import {
  EcgActions,
  EcgBody,
  PendingBody,
  ScribeActions,
  ScribeBody,
  ToxicityActions,
  ToxicityBody,
} from './widgets';

interface Props {
  app: CatalogApp;
  active: ActivePatientApp;
  onToggleTask: (taskId: string) => void;
}

export default function ActiveAppCard({ app, active, onToggleTask }: Props) {
  const w = active.widget;
  return (
    <article className="app-card glass">
      <header className="app-card-head">
        <AppIcon app={app} />
        <div>
          <h3>{app.name}</h3>
          <div className="muted small">
            {app.tagline} · od {active.since}
          </div>
        </div>
        <button className="btn ghost icon" aria-label="Další volby">
          <MoreHorizontal size={18} />
        </button>
      </header>

      <div className="app-card-body">
        {w.kind === 'toxicity' && <ToxicityBody w={w} />}
        {w.kind === 'ecg' && <EcgBody w={w} />}
        {w.kind === 'scribe' && <ScribeBody w={w} onToggle={onToggleTask} />}
        {w.kind === 'pending' && <PendingBody />}
      </div>

      <footer className="app-card-actions">
        {w.kind === 'toxicity' && <ToxicityActions />}
        {w.kind === 'ecg' && <EcgActions tint={app.tint} />}
        {w.kind === 'scribe' && <ScribeActions />}
        {w.kind === 'pending' && <button className="btn">Znovu poslat odkaz</button>}
      </footer>
    </article>
  );
}
