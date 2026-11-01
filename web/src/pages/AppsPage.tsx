import { ArrowRight, LayoutGrid, Search, SlidersHorizontal, Store as StoreIcon } from 'lucide-react';
import { useState } from 'react';
import AppIcon from '../components/AppIcon';
import StoreCard from '../components/apps/StoreCard';
import StoreFilters, { applyFilters, emptyFilters, sortApps, type Filters } from '../components/apps/StoreFilters';
import Link from '../components/Link';
import { hospital } from '../data/demo';
import { purchasedIds, storeApps } from '../data/store';

const purchased = storeApps.filter((a) => purchasedIds.has(a.id));

export default function AppsPage({ sub }: { sub?: string }) {
  const view = sub === 'store' ? 'store' : 'zakoupene';
  return (
    <div className="page apps">
      <header className="page-head">
        <div>
          <h1>{view === 'store' ? 'App Store' : 'Moje aplikace'}</h1>
          <p className="muted small">
            {view === 'store' ? `${storeApps.length} aplikací v katalogu` : `${purchased.length} aplikací licencovaných pro ${hospital.short}`}
          </p>
        </div>
        <nav className="switch" aria-label="Moje aplikace nebo App Store">
          <Link href="#/aplikace" className={view === 'zakoupene' ? 'switch-item active' : 'switch-item'}>
            <LayoutGrid size={16} /> Moje aplikace <span className="tab-count">{purchased.length}</span>
          </Link>
          <Link href="#/aplikace/store" className={view === 'store' ? 'switch-item active' : 'switch-item'}>
            <StoreIcon size={16} /> App Store <span className="tab-count">{storeApps.length}</span>
          </Link>
        </nav>
      </header>

      {view === 'zakoupene' ? <Purchased /> : <Store />}
    </div>
  );
}

function Purchased() {
  return (
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
  );
}

function Store() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const q = query.trim().toLowerCase();
  const visible = sortApps(
    applyFilters(storeApps, filters).filter((a) => !q || `${a.name} ${a.store.pitch} ${a.category}`.toLowerCase().includes(q)),
    filters.sort,
  );

  return (
    <div className={filtersOpen ? 'store-layout filters-open' : 'store-layout'}>
      <button className="filters-toggle btn" onClick={() => setFiltersOpen((o) => !o)} aria-expanded={filtersOpen}>
        <SlidersHorizontal size={16} /> {filtersOpen ? 'Skrýt filtry' : 'Filtry'}
      </button>
      <StoreFilters apps={storeApps} filters={filters} onChange={setFilters} />

      <div className="store-main">
        <div className="store-toolbar">
          <label className="search inline">
            <Search size={16} />
            <input id="store-search" placeholder="Hledat aplikace…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <span className="muted small shown">
            Zobrazeno {visible.length} z {storeApps.length}
          </span>
        </div>

        <div className="store-grid">
          {visible.map((app) => (
            <StoreCard
              key={app.id}
              app={app}
            />
          ))}
          {visible.length === 0 && <div className="empty glass">Žádná aplikace neodpovídá filtru.</div>}
        </div>
      </div>
    </div>
  );
}
