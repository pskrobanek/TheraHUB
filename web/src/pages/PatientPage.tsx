import ActiveAppCard from '../components/patient/ActiveAppCard';
import AvailableApps from '../components/patient/AvailableApps';
import PatientHeader from '../components/patient/PatientHeader';
import { catalog, hospital, recommendations } from '../data/demo';
import type { ActivePatientApp, Patient } from '../data/types';
import type { PatientTab } from '../lib/route';

interface Props {
  patient: Patient;
  tab: PatientTab;
  active: ActivePatientApp[];
  onActivate: (appId: string) => void;
  onToggleTask: (appId: string, taskId: string) => void;
}

const tabPlans: Record<Exclude<PatientTab, 'aplikace'>, string> = {
  prehled: 'Souhrn pacienta z NIS: diagnózy, léčba, poslední výsledky a události ze všech aplikací na jednom místě.',
  workflow: 'Aplikace propojené do léčebné cesty pacienta, např. „Péče během radioterapie hlavy a krku“.',
  science: 'Výzkumné projekty, do kterých je pacient zařazen, a stav jeho souhlasů.',
};

export default function PatientPage({ patient, tab, active, onActivate, onToggleTask }: Props) {
  const activeIds = new Set(active.map((a) => a.appId));
  const available = catalog.filter((a) => !activeIds.has(a.id));
  const appById = (id: string) => catalog.find((a) => a.id === id)!;

  return (
    <div className="page">
      <PatientHeader patient={patient} tab={tab} activeCount={active.length} />

      {tab === 'aplikace' ? (
        <>
          <section>
            <h2 className="section-title">
              Aktivní <span className="count">{active.length}</span>
            </h2>
            {active.length === 0 ? (
              <div className="empty glass">Pacient zatím nemá aktivní žádnou aplikaci. Vyberte z nabídky níže.</div>
            ) : (
              <div className="active-grid">
                {active.map((a) => (
                  <ActiveAppCard
                    key={a.appId}
                    app={appById(a.appId)}
                    active={a}
                    onToggleTask={(taskId) => onToggleTask(a.appId, taskId)}
                  />
                ))}
              </div>
            )}
          </section>

          <AvailableApps
            hospitalShort={hospital.short}
            apps={available}
            recommendations={recommendations[patient.id] ?? []}
            onActivate={onActivate}
          />
        </>
      ) : (
        <div className="empty glass">
          <b>Připravujeme.</b> {tabPlans[tab]}
        </div>
      )}
    </div>
  );
}
