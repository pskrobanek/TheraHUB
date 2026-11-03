// Jednotná hlavička stránky: ikona 48 px, nadpis, podnadpis, pod linkou volitelná řada tlačítek / záložek.
// Stejné rozměry používají i hlavičky pacienta, aplikace a žádosti (.page-header v styles.css).
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
  icon: LucideIcon;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Prvek vpravo v horní řadě (např. stav). */
  aside?: ReactNode;
  /** Řada pod linkou: přepínač nebo záložky. */
  nav?: ReactNode;
}

export default function PageHeader({ icon: Icon, title, subtitle, aside, nav }: Props) {
  return (
    <header className="page-header glass">
      <div className="ph-top">
        <span className="ph-icon" aria-hidden>
          <Icon size={30} strokeWidth={1.7} />
        </span>
        <div className="ph-title">
          <h1>{title}</h1>
          {subtitle && <p className="muted small">{subtitle}</p>}
        </div>
        {aside}
      </div>
      {nav && <div className="ph-nav">{nav}</div>}
    </header>
  );
}
