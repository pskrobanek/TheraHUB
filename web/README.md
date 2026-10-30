# TheraHUB – webová aplikace (prototyp)

Klikací prototyp klinického pracovního prostoru TheraHUB (pohled lékaře na pacienta). Zatím bez backendu, s fiktivními demo daty (`src/data/demo.ts`).

## Spuštění

```bash
cd web
npm install
npm run dev        # vývojový server na http://localhost:5173
npm run build      # typová kontrola + produkční build
```

## Struktura

- `src/components/Sidebar.tsx` – navigace: Domů, Pacienti (otevření pacienti jako podpoložky), Aplikace, Workflow, Science, Nastavení
- `src/pages/PatientPage.tsx` – karta pacienta se záložkami Přehled / Aplikace / Workflow / Science
- `src/components/patient/` – hlavička pacienta, karty aktivních aplikací (widgety), dostupné aplikace
- `src/data/types.ts` – datový model podle `docs/ENDGAME.md`
- `src/lib/route.ts` – hash routování (`#/pacienti/<id>/<záložka>`)

## Design

Skleněné (glass) panely s průhledností nad jemným barevným pozadím; tokeny jsou v `:root` v `src/styles.css`.
