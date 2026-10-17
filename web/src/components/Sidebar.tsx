import type { Hospital } from '../data/types';

export const sections = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'appstore', label: 'App Store', icon: '🛒' },
  { id: 'workflow', label: 'Workflow', icon: '🔗' },
  { id: 'science', label: 'Science', icon: '🔬' },
  { id: 'profil', label: 'Profil nemocnice', icon: '🏥' },
] as const;

export type Section = (typeof sections)[number]['id'];

interface Props {
  active: Section;
  hospital: Hospital;
}

export default function Sidebar({ active, hospital }: Props) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">T</span>
        <span>TheraHUB</span>
      </div>
      <div className="hospital">
        <div className="hospital-name">{hospital.name}</div>
        <div className="muted">NIS: {hospital.nis}</div>
      </div>
      <nav>
        {sections.map((s) => (
          <a key={s.id} href={`#/${s.id}`} className={s.id === active ? 'nav-item active' : 'nav-item'}>
            <span aria-hidden>{s.icon}</span>
            {s.label}
          </a>
        ))}
      </nav>
      <div className="sidebar-footer muted">Demo · data jsou fiktivní</div>
    </aside>
  );
}
