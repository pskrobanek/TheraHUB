import { ArrowRight, LayoutGrid, Search, SlidersHorizontal, Store as StoreIcon } from 'lucide-react';
import { useState } from 'react';
import AppDetailPage from './AppDetailPage';
import AppIcon from '../components/AppIcon';
import StoreCard from '../components/apps/StoreCard';
import StoreFilters, { applyFilters, emptyFilters, sortApps, type Filters } from '../components/apps/StoreFilters';
import Link from '../components/Link';
import { hospital } from '../data/demo';
import { specialtyOf } from '../data/specialties';
import type { StoreApp } from '../data/types';
import { appHref, type AppTab } from '../lib/route';
import { purchasedIds, storeApps } from '../data/store';

const purchased = storeApps.filter((a) => purchasedIds.has(a.id));

/** Zakoupené aplikace seskupené podle specializace (v pořadí katalogu). */
const groups = purchased.reduce<{ category: string; apps: StoreApp[] }[]>((acc, app) => {
  const g = acc.find((x) => x.category === app.category);
  if (g) g.apps.push(app);
  else acc.push({ category: app.category, apps: [app] });
  return acc;
}, []);

interface Props {
  sub?: string;
  appId?: string;
  appTab: AppTab;
}

export default function AppsPage({ sub, appId, appTab }: Props) {
  const opened = appId ? purchased.find((a) => a.id === appId) : undefined;
  if (opened) return <AppDetailPage app={opened} tab={appTab} />;
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
    <div className="myapps">
      {groups.map(({ category, apps }) => {
        const spec = specialtyOf(category);
        const Icon = spec.icon;
        return (
          <section key={category} className="myapps-group">
            <h2 className="myapps-head">
              <span className="myapps-spec" style={{ color: spec.color, background: `${spec.color}1a` }}>
                <Icon size={15} />
              </span>
              {category}
              <span className="muted small">{apps.length}</span>
            </h2>
            <div className="myapps-grid">
              {apps.map((app) => (
                <Link key={app.id} href={appHref(app.id)} className="myapp-tile glass">
                  <AppIcon app={app} size={44} />
                  <b>{app.name}</b>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
      <Link href="#/aplikace/store" className="myapps-store muted small">
        <StoreIcon size={15} /> Objevit další aplikace v App Storu <ArrowRight size={13} />
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
