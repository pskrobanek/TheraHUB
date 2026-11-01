import { FlaskConical, Home, LayoutGrid, Search, SlidersHorizontal, Users, X, type LucideIcon } from 'lucide-react';
import { currentUser, hospital } from '../data/demo';
import { storeApps } from '../data/store';
import type { Patient } from '../data/types';
import { patientHref, type Route, type SectionId } from '../lib/route';
import HospitalMark from './HospitalMark';
import { FlowBranch } from './icons';
import Link from './Link';

interface NavItem {
  id: SectionId;
  label: string;
  icon: LucideIcon;
}

const before: NavItem[] = [{ id: 'domu', label: 'Domů', icon: Home }];
const after: NavItem[] = [
  { id: 'workflow', label: 'Workflow', icon: FlowBranch },
  { id: 'science', label: 'Science', icon: FlaskConical },
  { id: 'nastaveni', label: 'Nastavení', icon: SlidersHorizontal },
];

function NavLink({ item, href, active }: { item: NavItem; href: string; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link href={href} className={active ? 'nav-item active' : 'nav-item'}>
      <Icon size={18} strokeWidth={1.8} />
      <span>{item.label}</span>
    </Link>
  );
}

interface Props {
  route: Route;
  /** Pacienti, které má lékař otevřené. */
  openPatients: Patient[];
  onClosePatient: (patientId: string) => void;
}

export default function Sidebar({ route, openPatients, onClosePatient }: Props) {
  const patientsItem: NavItem = { id: 'pacienti', label: 'Pacienti', icon: Users };
  const patientsHref = openPatients.length ? patientHref(openPatients[0].id) : '#/pacienti';

  return (
    <aside className="sidebar glass">
      <Link className="brand" href="#/domu">
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
        {before.map((item) => (
          <NavLink key={item.id} item={item} href={`#/${item.id}`} active={route.section === item.id} />
        ))}

        <NavLink item={patientsItem} href={patientsHref} active={route.section === 'pacienti' && !route.patientId} />
        {openPatients.length > 0 && (
          <div className="subnav">
            {openPatients.map((p) => (
              <div key={p.id} className={route.patientId === p.id ? 'sub-item active' : 'sub-item'}>
                <Link href={patientHref(p.id, route.tab)} className="sub-link">
                  <span className="sub-name">{p.name}</span>
                  <span className="sub-meta">
                    <span className="mono">{p.mainDiagnosis}</span> · <span className="mono">{p.birthNumber}</span>
                  </span>
                </Link>
                <button className="sub-close" onClick={() => onClosePatient(p.id)} aria-label={`Zavřít ${p.name}`}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <NavLink
          item={{ id: 'aplikace', label: 'Aplikace', icon: LayoutGrid }}
          href="#/aplikace"
          active={route.section === 'aplikace' && route.sub !== 'store'}
        />
        <div className="subnav">
          <Link href="#/aplikace/store" className={route.section === 'aplikace' && route.sub === 'store' ? 'sub-item active' : 'sub-item'}>
            <span className="sub-link">
              <span className="sub-name">App Store</span>
              <span className="sub-meta">{storeApps.length} aplikací v katalogu</span>
            </span>
          </Link>
        </div>

        {after.map((item) => (
          <NavLink key={item.id} item={item} href={`#/${item.id}`} active={route.section === item.id} />
        ))}
      </nav>

      <div className="account">
        <div className="user org" title="Poskytovatel, pod kterým jste přihlášeni">
          <span className="avatar dark">
            <HospitalMark size={25} />
          </span>
          <span>
            <span className="user-name">{hospital.short}</span>
            <span className="user-meta">{hospital.name}</span>
          </span>
        </div>
        <div className="user">
          <span className="avatar dark">{currentUser.initials}</span>
          <span>
            <span className="user-name">{currentUser.name}</span>
            <span className="user-meta">{currentUser.department}</span>
          </span>
        </div>
      </div>
    </aside>
  );
}
