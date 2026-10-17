import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import { activeApps as initialActive, patients } from './data/demo';
import type { ActivePatientApp } from './data/types';
import { onNavigate, parseHash, type Route } from './lib/route';
import PatientPage from './pages/PatientPage';
import Placeholder from './pages/Placeholder';

const routeOf = (hash: string) => parseHash(hash, patients[0].id);

export default function App() {
  const [route, setRoute] = useState<Route>(() => routeOf(window.location.hash));
  const [active, setActive] = useState<Record<string, ActivePatientApp[]>>(initialActive);

  useEffect(() => onNavigate((href) => setRoute(routeOf(href))), []);

  const patient = patients.find((p) => p.id === route.patientId) ?? patients[0];

  const activate = (appId: string) =>
    setActive((prev) => ({
      ...prev,
      [patient.id]: [...(prev[patient.id] ?? []), { appId, since: 'dnes', widget: { kind: 'pending' } }],
    }));

  const toggleTask = (appId: string, taskId: string) =>
    setActive((prev) => ({
      ...prev,
      [patient.id]: prev[patient.id].map((a) =>
        a.appId === appId && a.widget.kind === 'scribe'
          ? {
              ...a,
              widget: {
                ...a.widget,
                tasks: a.widget.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
              },
            }
          : a,
      ),
    }));

  return (
    <>
      <div className="backdrop" aria-hidden>
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
      </div>
      <div className="shell">
        <Sidebar route={route} />
        <main className="content">
          {route.section === 'pacienti' ? (
            <PatientPage
              patient={patient}
              tab={route.tab}
              active={active[patient.id] ?? []}
              onActivate={activate}
              onToggleTask={toggleTask}
            />
          ) : (
            <Placeholder section={route.section} />
          )}
        </main>
      </div>
    </>
  );
}
