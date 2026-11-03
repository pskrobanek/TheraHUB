// Nastavení nemocnice FN Demo: požadavky a schvalovací proces (Fáze 0b).
import { ClipboardList, GitBranch, SlidersHorizontal, Users } from 'lucide-react';
import Link from '../components/Link';
import PageHeader from '../components/PageHeader';
import RequirementsEditor from '../components/settings/RequirementsEditor';
import WorkflowBuilder from '../components/settings/WorkflowBuilder';
import { hospitalDemo } from '../data/trial/requests';

export default function SettingsPage({ sub }: { sub?: string }) {
  const view = sub === 'proces' ? 'proces' : 'pozadavky';
  return (
    <div className="page apps settings">
      <PageHeader
        icon={SlidersHorizontal}
        title="Nastavení"
        subtitle={`${hospitalDemo.name} – smyšlená ukázková nemocnice; obsah požadavků je zástupný`}
        nav={
          <nav className="switch" aria-label="Části nastavení">
            <Link href="#/nastaveni/pozadavky" className={view === 'pozadavky' ? 'switch-item active' : 'switch-item'}>
              <ClipboardList size={16} /> Požadavky nemocnice
            </Link>
            <Link href="#/nastaveni/proces" className={view === 'proces' ? 'switch-item active' : 'switch-item'}>
              <GitBranch size={16} /> Schvalovací proces
            </Link>
            <span className="switch-item disabled" title="Ve Fázi 1">
              <Users size={16} /> Organizace
            </span>
          </nav>
        }
      />
      {view === 'pozadavky' ? <RequirementsEditor /> : <WorkflowBuilder />}
    </div>
  );
}
