# TheraHUB – webová aplikace (prototyp)

Klikací prototyp centrální části TheraHUB. Zatím bez backendu, s fiktivními demo daty (`src/data/mockApps.ts`).

## Spuštění

```bash
cd web
npm install
npm run dev        # vývojový server na http://localhost:5173
npm run build      # typová kontrola + produkční build
```

## Struktura

- `src/components/Sidebar.tsx` – navigace: Dashboard, App Store, Workflow, Science, Profil nemocnice
- `src/pages/Dashboard.tsx` – přehled aktivních aplikací nemocnice
- `src/components/AppDetail.tsx` – detail aplikace (nasazení, compliance, smlouva)
- `src/data/types.ts` – datový model podle `docs/ENDGAME.md`
- `src/lib/alerts.ts` – odvození upozornění (expirace certifikací a smluv, incidenty, omezený provoz)
