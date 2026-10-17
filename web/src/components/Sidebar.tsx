import {
  CalendarDays,
  CheckSquare,
  Home,
  Inbox,
  LayoutGrid,
  LineChart,
  Search,
  SlidersHorizontal,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { currentUser, hospital, patients, sidebarCounts } from '../data/demo';
import { initials } from '../lib/format';
import { patientHref, type Route, type SectionId } from '../lib/route';
import Link from './Link';

interface NavItem {
  id: SectionId;
  label: string;
  icon: LucideIcon;
  badge?: number;
  count?: number;
}

const mainNav: NavItem[] = [
  { id: 'domu', label: 'Domů', icon: Home },
  { id: 'pacienti', label: 'Pacienti', icon: Users },
  { id: 'upozorneni', label: 'Upozornění', icon: Inbox, badge: sidebarCounts.alerts },
  { id: 'ukoly', label: 'Úkoly', icon: CheckSquare, count: sidebarCounts.tasks },
  { id: 'plan', label: 'Plán', icon: CalendarDays },
];

const hospitalNav: NavItem[] = [
  { id: 'appstore', label: 'App Store', icon: LayoutGrid },
  { id: 'analytika', label: 'Analytika', icon: LineChart },
  { id: 'nastaveni', label: 'Nastavení', icon: SlidersHorizontal },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  const href = item.id === 'pacienti' ? patientHref(patients[0].id) : `#/${item.id}`;
  return (
    <Link href={href} className={active ? 'nav-item active' : 'nav-item'}>
      <Icon size={20} strokeWidth={1.8} />
      <span>{item.label}</span>
      {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
      {item.count ? <span className="nav-count">{item.count}</span> : null}
    </Link>
  );
}

export default function Sidebar({ route }: { route: Route }) {
  return (
    <aside className="sidebar glass">
      <Link className="brand" href={patientHref(patients[0].id)}>
        <span className="brand-mark" aria-hidden>
          {Array.from({ length: 16 }, (_, i) => (
            <i key={i} />
          ))}
        </span>
        <span>
          Thera<b>HUB</b>
        </span>
      </Link>

      <label className="search">
        <Search size={17} />
        <input placeholder="Hledat pacienty" aria-label="Hledat pacienty" />
        <kbd>⌘K</kbd>
      </label>

      <nav className="nav">
        {mainNav.map((item) => (
          <NavLink key={item.id} item={item} active={route.section === item.id} />
        ))}
      </nav>

      <div className="nav-heading">Nedávní pacienti</div>
      <div className="recent">
        {patients.map((p) => (
          <Link
            key={p.id}
            href={patientHref(p.id, route.tab)}
            className={route.patientId === p.id ? 'recent-item active' : 'recent-item'}
          >
            <span className="avatar sm">{initials(p.name)}</span>
            <span>
              <span className="recent-name">{p.name}</span>
              <span className="recent-meta">{p.summary}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="nav-heading">Nemocnice</div>
      <nav className="nav">
        {hospitalNav.map((item) => (
          <NavLink key={item.id} item={item} active={route.section === item.id} />
        ))}
      </nav>

      <div className="user">
        <span className="avatar dark">{currentUser.initials}</span>
        <span>
          <span className="user-name">{currentUser.name}</span>
          <span className="recent-meta">
            {hospital.short} · {currentUser.department}
          </span>
        </span>
      </div>
    </aside>
  );
}
