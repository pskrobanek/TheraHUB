import { FlaskConical, Home, LayoutGrid, Search, SlidersHorizontal, Users, X, type LucideIcon } from 'lucide-react';
import { currentUser, hospital } from '../data/demo';
import { overviews } from '../data/overview';
import type { Patient, StoreApp } from '../data/types';
import { appHref, openAppId, patientHref, type Route, type SectionId } from '../lib/route';
import AppIcon from './AppIcon';
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
  /** Aplikace otevřené jako podzáložky sekce Aplikace. */
  openApps: StoreApp[];
  onCloseApp: (appId: string) => void;
}

const alertsLabel = (n: number) => (n === 0 ? 'bez alertů' : n === 1 ? '1 alert' : n < 5 ? `${n} alerty` : `${n} alertů`);

export default function Sidebar({ route, openPatients, onClosePatient, openApps, onCloseApp }: Props) {
  const shownApp = openAppId(route);
  const inApps = route.section === 'aplikace';
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
          active={inApps && !shownApp}
        />
        {openApps.length > 0 && (
          <div className="subnav">
            {openApps.map((a) => {
              const o = overviews[a.id];
              return (
                <div key={a.id} className={shownApp === a.id ? 'sub-item active' : 'sub-item'}>
                  <Link href={appHref(a.id)} className="sub-link sub-app">
                    <AppIcon app={a} size={22} />
                    <span>
                      <span className="sub-name">{a.name}</span>
                      {o && (
                        <span className="sub-meta">
                          {o.patients} pacientů · {alertsLabel(o.alerts)}
                        </span>
                      )}
                    </span>
                  </Link>
                  <button className="sub-close" onClick={() => onCloseApp(a.id)} aria-label={`Zavřít ${a.name}`}>
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {after.map((item) => (
          <NavLink key={item.id} item={item} href={`#/${item.id}`} active={route.section === item.id} />
        ))}
      </nav>

      <div className="account">
        <div className="user org" title="Poskytovatel, pod kterým jste přihlášeni">
          <span className="avatar dark">
            <HospitalMark width={25} />
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
