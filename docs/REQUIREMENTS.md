# Požadavky – modul Žádost o pilotní provoz a schvalování

ID se odkazují z kódu a testů. Prefixy: **MAT** matching, **WFL** workflow, **TRL** pilotní provoz (v kódu trial), **UI** rozhraní, **DOC** dokumentace. Zdroj: `reference/TheraHUB_Trial_Approval_brief.md` (§ v závorce).

## Matching (MAT)

| ID | Požadavek | Zdroj | Fáze | Stav |
|---|---|---|---|---|
| REQ-MAT-001 | Každý stav položky (Splněno, Částečně, Rozpor, Chybí, Prošlé, K posouzení, Výjimka, Nevztahuje se) má ikonu i text; barva nikdy není jediný nositel. | §4.1 | 0a | hotovo (demo) |
| REQ-MAT-002 | Chybějící, prošlý nebo nečitelný doklad nikdy není Splněno; prošlý doklad se ve verdiktu počítá jako chybějící. | §4, §4.3 | 0a demo / 1 engine | demo; testy ve Fázi 1 |
| REQ-MAT-003 | Verdikt oblasti: Splňuje / Splňuje s výhradami / Nesplňuje podle pravidel §4.2; celkový verdikt = nejhorší z oblastí. | §4.2 | 0a demo / 1 engine | demo; testy ve Fázi 1 |
| REQ-MAT-004 | Zobrazují se počty stavů, ne procento. | §4.2 | 0a | hotovo |
| REQ-MAT-005 | Každá položka má konkrétní důvod (očekávání vs. odpověď vs. doklad). | §4.3 | 0a | hotovo (demo) |
| REQ-MAT-006 | U položky je vidět „Ověřeno TheraHUB“ nebo „Čestné prohlášení“. | §3.3 | 0a | hotovo |
| REQ-MAT-007 | Aplikace bez hotového dossier (skutečné aplikace v demu) ukazují neutrální stav „Dossier se připravuje“, ne verdikt. | DEC-008 | 0a | hotovo |
| REQ-MAT-008 | Výsledek se při podání žádosti zmrazí; detail žádosti ukazuje snímek z podání. | §4.3 | 0a (snímek) / 2 (diff) | snímek hotov |
| REQ-MAT-009 | Matching je čistá deterministická verzovaná funkce se 100% pokrytím větví a property-based testy. | §4.3, §13 | 1 | plán |

## Workflow (WFL)

| ID | Požadavek | Zdroj | Fáze | Stav |
|---|---|---|---|---|
| REQ-WFL-001 | Stepper ukazuje všechny kroky šablony; hotové kroky s ✓, kdo rozhodl, datum a případnou podmínku. | §9.1 | 0a | hotovo |
| REQ-WFL-002 | Aktuální krok je zvýrazněný s řešitelem, „čeká N dní“ a termínem SLA. | §9.1 | 0a | hotovo |
| REQ-WFL-003 | Stepper vždy uvádí, kdo je další na řadě (nebo proč nikdo – ukončené stavy). | §9.1, akceptace 0 | 0a | hotovo |
| REQ-WFL-004 | Paralelní blok se zobrazuje jako čtyři dílčí stavy oblastí. | §9.1 | 0a | hotovo |
| REQ-WFL-005 | Čekací stavy jsou vypsané slovy (např. „Čeká na odpověď firmy od 2. 11.“) a SLA při čekání na firmu stojí. | §9.1, §6.4 | 0a | hotovo |
| REQ-WFL-006 | Šablona A seedovaná jako výchozí; šablona B dostupná. | §5.4 | 0a (A) / 0b (editor) | A hotovo |
| REQ-WFL-007 | SLA v pracovních dnech s českými svátky. | §11 | 0a demo / 2 | demo |
| REQ-WFL-008 | Vlastní workflow engine, každý přechod přes jednu službu se zámkem a auditem. | §13 | 2 | plán |

## Pilotní provoz (TRL)

| ID | Požadavek | Zdroj | Fáze | Stav |
|---|---|---|---|---|
| REQ-TRL-001 | Všech 13 stavů žádosti existuje v ukázkových datech a stepper je u každého správný. | §6.2, akceptace 0 | 0a | hotovo |
| REQ-TRL-002 | Přehled žádostí: záložky Moje žádosti / Ke kontrole / Všechny žádosti; sloupce dle §9.2; seznam i kanban; filtry stav, oddělení, oblast, po termínu. | §9.2 | 0a | hotovo (bez uložených filtrů) |
| REQ-TRL-003 | Tlačítko „Požádat o pilotní provoz“; při blokujících rozporech s upozorněním. | §9.1 | 0a (naznačené) / 2 | naznačené |
| REQ-TRL-004 | Odznaky na kartách App Storu: Žádost podána / Pilot probíhá / V předplatném. | §9.1 | 0a | hotovo |
| REQ-TRL-005 | Jen jedna aktivní žádost na aplikaci a oddělení. | §6.1 | 0a (data) / 2 | data dodržují |

## Rozhraní (UI)

| ID | Požadavek | Zdroj | Fáze | Stav |
|---|---|---|---|---|
| REQ-UI-001 | Barvy stavů jsou tokeny na jednom místě a splňují kontrast WCAG 2.2 AA (text ≥ 4,5 : 1) i na skleněném pozadí. | DEC-002 | 0a | hotovo (`web/scripts/check-contrast.mjs`) |
| REQ-UI-002 | V rozhraní „pilotní provoz“, ne „trial“. | DEC-006 | 0a | hotovo |
| REQ-UI-003 | Modul ukazuje jen FN Demo; žádné osoby, požadavky ani rozhodnutí pod jménem FTN. | DEC-003 | 0a | hotovo |
| REQ-UI-004 | U Adoption indexu je vysvětlení, co měří a že není verdiktem nemocnice. | DEC-004 | 0a | hotovo |
| REQ-UI-005 | Použitelné na notebooku i tabletu; české formáty data a čísel. | §9 | 0a | hotovo |
| REQ-UI-006 | Panel položek: filtry Jen rozpory a Jen blokující, problémy nahoře, export PDF. | §9.1 | 0a (export naznačen) | hotovo |
| REQ-UI-007 | Detail aplikace: vlevo popis a náhledy, vpravo Adoption index v kruhu, 4 oblasti s plnou ikonou, podílem splněných a výpisem nesplněných položek, pod tím Další soulad. | DEC-015 | 0a | hotovo |
| REQ-MAT-010 | Oblast Ostatní obsahuje jen ostatní požadavky nemocnice; integrace, datový prostor, záštity a TheraHUB integrace jsou v Adoption indexu. | DEC-014 | 0a | hotovo |
