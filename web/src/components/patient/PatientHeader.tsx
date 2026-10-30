import type { Patient } from '../../data/types';
import { patientHref, patientTabs, type PatientTab } from '../../lib/route';
import { initials } from '../../lib/format';
import Link from '../Link';

const tabLabels: Record<PatientTab, string> = {
  prehled: 'Přehled',
  aplikace: 'Aplikace',
  workflow: 'Workflow',
  science: 'Science',
};

interface Props {
  patient: Patient;
  tab: PatientTab;
  activeCount: number;
}

export default function PatientHeader({ patient, tab, activeCount }: Props) {
  return (
    <header className="patient-header glass">
      <div className="patient-top">
        <span className="avatar xl">{initials(patient.name)}</span>
        <div className="patient-id">
          <h1>
            {patient.name} <span className="birth-number mono">{patient.birthNumber}</span>
          </h1>
        </div>
      </div>

      <nav className="tabs" aria-label="Záložky pacienta">
        {patientTabs.map((id) => (
          <Link key={id} href={patientHref(patient.id, id)} className={id === tab ? 'tab active' : 'tab'}>
            {tabLabels[id]}
            {id === 'aplikace' && <span className="tab-count">{activeCount}</span>}
          </Link>
        ))}
      </nav>
    </header>
  );
}
