import { useEffect, useState } from 'react';
import Sidebar, { type Section, sections } from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Placeholder from './pages/Placeholder';
import { hospital } from './data/mockApps';

function sectionFromHash(): Section {
  const id = window.location.hash.replace('#/', '');
  return sections.find((s) => s.id === id)?.id ?? 'dashboard';
}

export default function App() {
  const [section, setSection] = useState<Section>(sectionFromHash);

  useEffect(() => {
    const onHash = () => setSection(sectionFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return (
    <div className="shell">
      <Sidebar active={section} hospital={hospital} />
      <main className="content">
        {section === 'dashboard' ? <Dashboard /> : <Placeholder section={section} />}
      </main>
    </div>
  );
}
