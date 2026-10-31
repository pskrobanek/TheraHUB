import {
  Activity,
  BedDouble,
  CalendarClock,
  Camera,
  Database,
  Droplet,
  Gauge,
  HeartPulse,
  Leaf,
  Loader,
  Pill,
  ScanLine,
  Smile,
  Sparkles,
  Watch,
  type LucideIcon,
} from 'lucide-react';
import type { CatalogApp, IconName } from '../data/types';
import AppLogo, { hasLogo } from './AppLogo';

const icons: Record<IconName, LucideIcon> = {
  onco: Loader,
  heart: HeartPulse,
  scribe: Sparkles,
  droplet: Droplet,
  leaf: Leaf,
  camera: Camera,
  smile: Smile,
  gauge: Gauge,
  pill: Pill,
  watch: Watch,
  bed: BedDouble,
  scan: ScanLine,
  activity: Activity,
  database: Database,
  calendar: CalendarClock,
};

interface Props {
  app: CatalogApp;
  size?: number;
}

/** Logo aplikace; pro aplikace bez vlastního loga obecná ikona v barvě aplikace. */
export default function AppIcon({ app, size = 40 }: Props) {
  if (hasLogo(app.id)) return <AppLogo appId={app.id} size={size} />;
  const Icon = icons[app.icon];
  return (
    <span className="app-icon" style={{ width: size, height: size, color: app.tint, background: `${app.tint}14` }} aria-hidden>
      <Icon size={size * 0.5} strokeWidth={1.8} />
    </span>
  );
}
