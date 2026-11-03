# TheraHUB – webová aplikace (prototyp)

Klikací prototyp klinického pracovního prostoru TheraHUB (pohled lékaře na pacienta). Zatím bez backendu, s fiktivními demo daty (`src/data/demo.ts`).

## Spuštění

```bash
cd web
npm install
npm run dev        # vývojový server na http://localhost:5173
npm run build      # kontrola kontrastu stavů + typová kontrola + produkční build
npm run check:contrast  # jen kontrola kontrastu barev stavů (WCAG 2.2 AA)
```

## Struktura

- `src/components/Sidebar.tsx` – navigace: Domů, Pacienti (otevření pacienti jako podpoložky), Aplikace, Workflow, Science, Nastavení
- `src/pages/PatientPage.tsx` – karta pacienta se záložkami Přehled / Aplikace / Workflow / Science
- `src/components/patient/` – hlavička pacienta, karty aktivních aplikací (widgety), dostupné aplikace
- `src/pages/AppsPage.tsx` – Aplikace: zakoupené aplikace a App Store (`src/components/apps/StoreCard.tsx`)
- `src/components/apps/StoreFilters.tsx` – levý panel filtrů App Store; `src/lib/score.ts` – compliance score a odhad nákladů
- `src/data/store.ts` – demo katalog App Store a zakoupené aplikace; `src/data/specialties.ts` – ikony a barvy specializací
- `src/data/types.ts` – datový model podle `docs/ENDGAME.md`
- `src/lib/route.ts` – hash routování (`#/pacienti/<id>/<záložka>`, `#/aplikace/store/<id>`, `#/aplikace/zadosti/<id>`)

### Modul Žádost o pilotní provoz (Fáze 0a, `reference/TheraHUB_Trial_Approval_brief.md`)

- `src/data/trial/` – smyšlená FN Demo: katalog požadavků (`catalog.ts`), dossier (`dossiers.ts`), ukázkový matching (`match.ts`), žádosti ve všech 13 stavech a šablona A (`requests.ts`), pracovní dny (`dates.ts`)
- `src/components/trial/` – stavy shody s ikonou a textem (`Status.tsx`), box Shoda s požadavky a panel položek (`ComplianceBox.tsx`), stepper průběhu (`Stepper.tsx`)
- `src/pages/StoreAppDetail.tsx`, `TrialRequestsPage.tsx`, `TrialRequestDetail.tsx` – detail aplikace v App Storu, přehled žádostí (seznam a kanban) a detail žádosti
- Barvy stavů jsou tokeny `--st-*` na začátku `src/styles.css`; kontrast hlídá `scripts/check-contrast.mjs`
- Rozhodnutí, otázky, rizika a požadavky: `docs/DECISIONS.md`, `docs/OPEN_QUESTIONS.md`, `docs/RISKS.md`, `docs/REQUIREMENTS.md`

## Design

Skleněné (glass) panely s průhledností nad jemným barevným pozadím; tokeny jsou v `:root` v `src/styles.css`.
