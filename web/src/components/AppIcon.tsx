import {
  Camera,
  Droplet,
  Gauge,
  HeartPulse,
  Leaf,
  Loader,
  Pill,
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
};

export default function AppIcon({ app, size = 40 }: { app: CatalogApp; size?: number }) {
  const Icon = icons[app.icon];
  return (
    <span
      className="app-icon"
      style={{ width: size, height: size, color: app.tint, background: `${app.tint}14` }}
      aria-hidden
    >
      <Icon size={size * 0.5} strokeWidth={1.8} />
    </span>
  );
}
