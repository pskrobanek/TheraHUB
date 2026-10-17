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
  const t = patient.treatment;
  return (
    <header className="patient-header glass">
      <div className="patient-top">
        <span className="avatar xl">{initials(patient.name)}</span>
        <div className="patient-id">
          <h1>{patient.name}</h1>
          <div className="muted">
            {patient.sex === 'muž' ? 'Muž' : 'Žena'}, {patient.age} let · <span className="mono">{patient.nisId}</span> ·
            Ošetřující {patient.attending}
          </div>
          <div className="chips">
            {patient.tags.map((d) => (
              <span key={d.code + d.label} className="chip">
                <b className="mono">{d.code}</b> {d.label}
              </span>
            ))}
          </div>
        </div>
        {t && (
          <div className="treatment">
            <div className="treatment-row">
              <span className="muted">{t.name}</span>
              <span className="mono strong">
                {t.unit} {t.done} / {t.total}
              </span>
            </div>
            <div className="progress" role="progressbar" aria-valuenow={t.done} aria-valuemax={t.total}>
              <span style={{ width: `${(t.done / t.total) * 100}%` }} />
            </div>
            <div className="muted small">
              Zahájeno {t.started} · plánovaný konec {t.plannedEnd}
            </div>
          </div>
        )}
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
