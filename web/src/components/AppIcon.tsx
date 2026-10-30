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
  /** Plná barevná dlaždice s bílým symbolem (App Store). */
  filled?: boolean;
}

export default function AppIcon({ app, size = 40, filled = false }: Props) {
  const Icon = icons[app.icon];
  const style = filled
    ? { width: size, height: size, color: '#fff', background: app.tint }
    : { width: size, height: size, color: app.tint, background: `${app.tint}14` };
  return (
    <span
      className="app-icon"
      style={style}
      aria-hidden
    >
      <Icon size={size * 0.5} strokeWidth={1.8} />
    </span>
  );
}
