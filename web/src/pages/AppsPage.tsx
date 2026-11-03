import { ArrowRight, ClipboardCheck, LayoutGrid, Search, SlidersHorizontal, ShoppingBag as StoreIcon } from 'lucide-react';
import { useState } from 'react';
import AppDetailPage from './AppDetailPage';
import StoreAppDetail from './StoreAppDetail';
import TrialRequestDetail from './TrialRequestDetail';
import TrialRequestsPage from './TrialRequestsPage';
import AppIcon from '../components/AppIcon';
import BrandDots from '../components/BrandDots';
import StoreCard from '../components/apps/StoreCard';
import StoreFilters, { applyFilters, emptyFilters, sortApps, type Filters } from '../components/apps/StoreFilters';
import Link from '../components/Link';
import PageHeader from '../components/PageHeader';
import { hospital } from '../data/demo';
import { appGroups } from '../data/appGroups';
import { overviews } from '../data/overview';
import { OpenBridge } from '../components/icons';
import { openExternalApp } from '../lib/launch';
import { appHref, type AppTab } from '../lib/route';
import { purchasedIds, storeApps } from '../data/store';
import { hospitalDemo, isActive, trialRequests } from '../data/trial/requests';

const purchased = storeApps.filter((a) => purchasedIds.has(a.id));

/** Počty na dlaždici; pruh ukazuje hodnotu vůči aplikaci s nejvyšším počtem. */
const tileStats = [
  { key: 'patients', label: 'Pacienti' },
  { key: 'workflows', label: 'Workflows' },
  { key: 'studies', label: 'Studie' },
] as const;
const maxOf = Object.fromEntries(
  tileStats.map(({ key }) => [key, Math.max(1, ...purchased.map((a) => overviews[a.id]?.[key] ?? 0))]),
) as Record<(typeof tileStats)[number]['key'], number>;

/** Zakoupené aplikace seskupené podle funkční kategorie. */
const groups = appGroups
  .map((g) => ({ ...g, apps: purchased.filter((a) => g.appIds.includes(a.id)) }))
  .filter((g) => g.apps.length > 0);

interface Props {
  sub?: string;
  item?: string;
  appId?: string;
  appTab: AppTab;
}

export default function AppsPage({ sub, item, appId, appTab }: Props) {
  const opened = appId ? purchased.find((a) => a.id === appId) : undefined;
  if (opened) return <AppDetailPage app={opened} tab={appTab} />;
  const storeApp = sub === 'store' && item ? storeApps.find((a) => a.id === item) : undefined;
  if (storeApp) return <StoreAppDetail key={storeApp.id} app={storeApp} />;
  const req = sub === 'zadosti' && item ? trialRequests.find((r) => r.id === item) : undefined;
  if (req) return <TrialRequestDetail key={req.id} req={req} />;
  const view = sub === 'store' ? 'store' : sub === 'zadosti' ? 'zadosti' : 'zakoupene';
  const title = { store: 'App Store', zadosti: 'Žádosti o pilotní provoz', zakoupene: 'Moje aplikace' }[view];
  const subtitle = {
    store: `${storeApps.length} aplikací v katalogu`,
    zadosti: `${hospitalDemo.name} – smyšlená ukázková nemocnice; osoby, požadavky a rozhodnutí jsou vymyšlené`,
    zakoupene: `${purchased.length} aplikací licencovaných pro ${hospital.short}`,
  }[view];
  return (
    <div className="page apps">
      <PageHeader
        icon={view === 'store' ? StoreIcon : view === 'zadosti' ? ClipboardCheck : LayoutGrid}
        title={title}
        subtitle={subtitle}
        nav={
          <nav className="switch" aria-label="Moje aplikace, App Store nebo žádosti">
            <Link href="#/aplikace" className={view === 'zakoupene' ? 'switch-item active' : 'switch-item'}>
              <LayoutGrid size={16} /> Moje aplikace <span className="tab-count">{purchased.length}</span>
            </Link>
            <Link href="#/aplikace/store" className={view === 'store' ? 'switch-item active' : 'switch-item'}>
              <StoreIcon size={16} /> App Store <span className="tab-count">{storeApps.length}</span>
            </Link>
            <Link href="#/aplikace/zadosti" className={view === 'zadosti' ? 'switch-item active' : 'switch-item'}>
              <ClipboardCheck size={16} /> Žádosti o pilotní provoz <span className="tab-count">{trialRequests.filter(isActive).length}</span>
            </Link>
          </nav>
        }
      />

      {view === 'zakoupene' ? <Purchased /> : view === 'zadosti' ? <TrialRequestsPage /> : <Store />}
    </div>
  );
}

function Purchased() {
  return (
    <div className="myapps">
      {groups.map(({ id, label, apps }) => (
        <section key={id} className="myapps-group">
          <header className="myapps-head">
            <h2>{label}</h2>
            <span className="muted small">{apps.length}</span>
          </header>
          <div className="my-tiles">
            {apps.map((app) => {
              const o = overviews[app.id];
              return (
                <article key={app.id} className="my-tile">
                  <Link href={appHref(app.id)} className="my-tile-main">
                    <AppIcon app={app} size={44} />
                    <span className="my-tile-title">
                      <h3>{app.name}</h3>
                      <span className="my-tile-tagline">{app.tagline}</span>
                    </span>
                  </Link>
                  {o && (
                    <dl className="my-tile-stats">
                      {tileStats.map(({ key, label }) => (
                        <div key={key} title={`${label}: ${o[key]} (pruh vůči aplikaci s nejvyšším počtem)`}>
                          <dt>{label}</dt>
                          <span className="tile-bar" aria-hidden>
                            <span style={{ width: `${o[key] === 0 ? 0 : Math.max(4, (o[key] / maxOf[key]) * 100)}%` }} />
                          </span>
                          <dd>{o[key]}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  <div className="my-tile-actions">
                    <Link href={appHref(app.id)} className="tile-btn">
                      <BrandDots size={12} /> Přehled
                    </Link>
                    <button className="tile-btn open" onClick={() => openExternalApp(app)}>
                      Otevřít <OpenBridge size={16} strokeWidth={1.75} aria-hidden />
                    </button>
                  </div>
                </article>
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
