// Hlavička aplikace tak, jak ji lékař vidí v App Storu: ikona, název, krátký popis, dodavatel a obor.
import { specialtyOf } from '../../data/specialties';
import { dossiers, realAppIds } from '../../data/trial/dossiers';
import type { StoreApp } from '../../data/types';
import AppIcon from '../AppIcon';

export default function StoreAppHead({ app }: { app: StoreApp }) {
  const real = realAppIds.has(app.id);
  const dossier = dossiers[app.id];
  const spec = specialtyOf(app.category);
  return (
    <header className="sd-main-head">
      <AppIcon app={app} size={72} />
      <div className="sd-title">
        <h1>{app.name}</h1>
        <p className="muted">
          {app.tagline}
          {dossier && !real ? ` · ${dossier.vendor}` : ''}
        </p>
        <span className="store-spec" style={{ color: spec.color, background: `${spec.color}1a` }}>
          {app.category}
        </span>
      </div>
    </header>
  );
}
