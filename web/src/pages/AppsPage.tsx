import { ArrowRight, LayoutGrid, Search, SlidersHorizontal, Store as StoreIcon } from 'lucide-react';
import { useState } from 'react';
import AppDetailPage from './AppDetailPage';
import AppIcon from '../components/AppIcon';
import StoreCard from '../components/apps/StoreCard';
import StoreFilters, { applyFilters, emptyFilters, sortApps, type Filters } from '../components/apps/StoreFilters';
import Link from '../components/Link';
import { hospital } from '../data/demo';
import { appGroups } from '../data/appGroups';
import { specialtyOf } from '../data/specialties';
import { appHref, type AppTab } from '../lib/route';
import { purchasedIds, storeApps } from '../data/store';

const purchased = storeApps.filter((a) => purchasedIds.has(a.id));

/** Zakoupené aplikace seskupené podle funkční kategorie. */
const groups = appGroups
  .map((g) => ({ ...g, apps: purchased.filter((a) => g.appIds.includes(a.id)) }))
  .filter((g) => g.apps.length > 0);

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
      {groups.map(({ id, label, hint, icon: Icon, apps }) => (
        <section key={id} className="myapps-group">
          <header className="myapps-head">
            <span className="myapps-icon">
              <Icon size={16} />
            </span>
            <h2>{label}</h2>
            <span className="muted small">{apps.length}</span>
            <span className="muted small myapps-hint">{hint}</span>
          </header>
          <div className="store-grid">
            {apps.map((app) => {
              const spec = specialtyOf(app.category);
              return (
                <Link key={app.id} href={appHref(app.id)} className="store-card glass my-card">
                  <div className="store-head">
                    <AppIcon app={app} size={63} />
                    <div className="store-title">
                      <h3>{app.name}</h3>
                      <span className="store-tagline">{app.tagline}</span>
                      <span className="store-spec" style={{ color: spec.color, background: `${spec.color}1a` }}>
                        {app.category}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
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
