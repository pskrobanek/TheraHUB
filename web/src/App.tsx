import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import { activeApps as initialActive, patients } from './data/demo';
import type { ActivePatientApp } from './data/types';
import { purchasedIds, storeApps } from './data/store';
import { navigate, onNavigate, openAppId, parseHash, patientHref, type Route } from './lib/route';
import AppsPage from './pages/AppsPage';
import PatientPage from './pages/PatientPage';
import Placeholder from './pages/Placeholder';

// Bez adresy otevři prvního pacienta, ať prototyp hned ukazuje obsah.
const routeOf = (hash: string): Route => (hash ? parseHash(hash) : { ...parseHash(hash), patientId: patients[0].id });

export default function App() {
  const [route, setRoute] = useState<Route>(() => routeOf(window.location.hash));
  const [active, setActive] = useState<Record<string, ActivePatientApp[]>>(initialActive);
  const [openIds, setOpenIds] = useState<string[]>(patients.map((p) => p.id));

  const [openAppIds, setOpenAppIds] = useState<string[]>([]);

  useEffect(() => onNavigate((href) => setRoute(routeOf(href))), []);

  // Otevřená aplikace se přidá do menu jako podzáložka (podobně jako pacient).
  const shownAppId = openAppId(route);
  useEffect(() => {
    if (shownAppId && purchasedIds.has(shownAppId)) setOpenAppIds((ids) => (ids.includes(shownAppId) ? ids : [...ids, shownAppId]));
  }, [shownAppId]);
  const openApps = openAppIds.map((id) => storeApps.find((a) => a.id === id)!);

  const closeApp = (id: string) => {
    const rest = openAppIds.filter((x) => x !== id);
    setOpenAppIds(rest);
    if (shownAppId === id) navigate('#/aplikace');
  };

  const openPatients = openIds.map((id) => patients.find((p) => p.id === id)!);
  const patient = patients.find((p) => p.id === route.patientId) ?? patients[0];

  const closePatient = (id: string) => {
    const rest = openIds.filter((x) => x !== id);
    setOpenIds(rest);
    // Zavřený pacient byl právě zobrazený: přejdi na dalšího otevřeného, nebo na seznam.
    if (route.patientId === id) navigate(rest.length ? patientHref(rest[0], route.tab) : '#/pacienti');
  };

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
        <Sidebar route={route} openPatients={openPatients} onClosePatient={closePatient} openApps={openApps} onCloseApp={closeApp} />
        <main className="content">
          {route.section === 'pacienti' && route.patientId ? (
            <PatientPage
              patient={patient}
              tab={route.tab}
              active={active[patient.id] ?? []}
              onActivate={activate}
              onToggleTask={toggleTask}
            />
          ) : route.section === 'aplikace' ? (
            <AppsPage sub={route.sub} appId={shownAppId} appTab={route.appTab} />
          ) : (
            <Placeholder section={route.section} />
          )}
        </main>
      </div>
    </>
  );
}
