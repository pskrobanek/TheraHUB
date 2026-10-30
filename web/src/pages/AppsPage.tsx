import { ArrowRight, LayoutGrid, Search, Store as StoreIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import AppIcon from '../components/AppIcon';
import StoreCard from '../components/apps/StoreCard';
import Link from '../components/Link';
import { hospital } from '../data/demo';
import { purchasedIds, storeApps } from '../data/store';
import type { Audience } from '../data/types';

const audienceFilters: { id: Audience | 'vse'; label: string }[] = [
  { id: 'vse', label: 'Všichni' },
  { id: 'pacient', label: 'Pacient' },
  { id: 'lekar', label: 'Lékař' },
  { id: 'sestra', label: 'Sestra' },
  { id: 'admin', label: 'Administrativa' },
  { id: 'vyzkumnik', label: 'Výzkumník' },
];

export default function AppsPage({ sub }: { sub?: string }) {
  const view = sub === 'store' ? 'store' : 'zakoupene';
  const purchased = storeApps.filter((a) => purchasedIds.has(a.id));

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Aplikace</h1>
          <p className="muted">
            {view === 'zakoupene'
              ? `Aplikace licencované pro ${hospital.name}, které lékaři aktivují u pacientů.`
              : 'Katalog certifikovaných aplikací. Vyzkoušejte zdarma, pak rozhodněte podle KPI.'}
          </p>
        </div>
      </header>

      <nav className="switch" aria-label="Zakoupené nebo App Store">
        <Link href="#/aplikace" className={view === 'zakoupene' ? 'switch-item active' : 'switch-item'}>
          <LayoutGrid size={20} />
          <span>
            <b>Zakoupené</b>
            <small>{purchased.length} aplikací v nemocnici</small>
          </span>
        </Link>
        <Link href="#/aplikace/store" className={view === 'store' ? 'switch-item active' : 'switch-item'}>
          <StoreIcon size={20} />
          <span>
            <b>App Store</b>
            <small>{storeApps.length} aplikací v katalogu</small>
          </span>
        </Link>
      </nav>

      {view === 'zakoupene' ? <Purchased /> : <Store />}
    </div>
  );
}

function Purchased() {
  const purchased = storeApps.filter((a) => purchasedIds.has(a.id));
  return (
    <section>
      <div className="owned-grid">
        {purchased.map((app) => (
          <div key={app.id} className="owned-tile glass">
            <AppIcon app={app} size={48} />
            <b>{app.name}</b>
            <span className="muted small">{app.category}</span>
          </div>
        ))}
        <Link href="#/aplikace/store" className="owned-tile glass more">
          <span className="app-icon" style={{ width: 48, height: 48, color: 'var(--accent)', background: 'var(--accent-soft)' }}>
            <StoreIcon size={24} />
          </span>
          <b>App Store</b>
          <span className="muted small">
            Objevit další aplikace <ArrowRight size={13} />
          </span>
        </Link>
      </div>
    </section>
  );
}

function Store() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('vse');
  const [audience, setAudience] = useState<Audience | 'vse'>('vse');
  const [trials, setTrials] = useState<Set<string>>(new Set());

  const categories = useMemo(() => [...new Set(storeApps.map((a) => a.category))].sort((a, b) => a.localeCompare(b, 'cs')), []);
  const q = query.trim().toLowerCase();
  const visible = storeApps.filter(
    (a) =>
      (category === 'vse' || a.category === category) &&
      (audience === 'vse' || a.store.audience.includes(audience)) &&
      (!q || `${a.name} ${a.store.pitch} ${a.category}`.toLowerCase().includes(q)),
  );

  return (
    <section>
      <div className="store-filters">
        <label className="search inline">
          <Search size={16} />
          <input id="store-search" placeholder="Hledat aplikace" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <select id="store-category" className="select" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Kategorie">
          <option value="vse">Všechny kategorie</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <div className="segmented" role="group" aria-label="Pro koho">
          {audienceFilters.map((f) => (
            <button key={f.id} className={audience === f.id ? 'on' : ''} onClick={() => setAudience(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="store-grid">
        {visible.map((app) => (
          <StoreCard
            key={app.id}
            app={app}
            nisName={hospital.nis}
            purchased={purchasedIds.has(app.id)}
            trialRequested={trials.has(app.id)}
            onTrial={() => setTrials((prev) => new Set(prev).add(app.id))}
          />
        ))}
        {visible.length === 0 && <div className="empty glass">Žádná aplikace neodpovídá filtru.</div>}
      </div>
    </section>
  );
}
