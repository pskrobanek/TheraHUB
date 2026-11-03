# Otevřené otázky – modul Žádost o pilotní provoz a schvalování

Výchozí odpověď (v hranatých závorkách) platí, dokud není otázka zodpovězená. Pavel 3. 11. 2026 potvrdil výchozí odpovědi z briefu §16.

## Proces (brief §16)

| ID | Otázka | Výchozí odpověď | Stav |
|---|---|---|---|
| OQ-001 | Co přesně dělá dodavatel v kroku Firma? | [potvrdí zájem a podmínky, doplní dossier; podpis až ve Smlouvě] | výchozí potvrzena |
| OQ-002 | Která šablona je výchozí: A (náměstek před posouzením oblastí), nebo B (po něm)? | [A] | výchozí potvrzena |
| OQ-003 | Běží čtyři oblasti vždy paralelně? Může jedna oblast žádost zamítnout, nebo jen doporučit? | [paralelně; každá oblast může zamítnout] | výchozí potvrzena |
| OQ-004 | Kdo v typické nemocnici posuzuje oblast Ostatní? Rozdělit ji na podoblasti? | [jedna oblast, uvnitř podkategorie] | výchozí potvrzena |
| OQ-005 | Může lékař žádat o pilotní provoz u aplikace s blokujícími rozpory? | [ano, s upozorněním] | výchozí potvrzena |
| OQ-006 | Dovolí vnitřní předpisy nemocnice automatické splnění kroku s lhůtou pro námitku? `TODO(legal)` | [ve výchozím stavu vypnuto] | výchozí potvrzena |
| OQ-007 | Výchozí SLA kroku a eskalace. | [5 pracovních dnů na krok; eskalace dle briefu §11] | výchozí potvrzena |
| OQ-008 | Kdo za nemocnici podepisuje pilotní smlouvu a je nutný kvalifikovaný e-podpis? | [ředitel nebo pověřený zástupce; v MVP nahrání podepsaného PDF] | výchozí potvrzena |
| OQ-009 | Je u pilotního provozu mimo výzkum potřeba etická komise? | [volitelný krok, jen u výzkumu] | výchozí potvrzena |

## Pilotní provoz, KPI a nákup

| ID | Otázka | Výchozí odpověď | Stav |
|---|---|---|---|
| OQ-010 | Maximální délka pilotního provozu a pravidla prodloužení. | [6 měsíců, jedno prodloužení] | výchozí potvrzena |
| OQ-011 | Standardní knihovna KPI (adopce, ušetřený čas, spokojenost, incidenty). Jaký dotazník spokojenosti? | TODO | otevřená |
| OQ-012 | Cesta veřejné zakázky pro měsíční předplatné ve veřejné nemocnici a limity. `TODO(legal)` | — | otevřená |
| OQ-013 | Ukončení: lhůta pro vrácení a výmaz dat, kdo potvrzuje, zda informovat pacienty. `TODO(dpo)` | — | otevřená |

## Obsah a sdílení

| ID | Otázka | Výchozí odpověď | Stav |
|---|---|---|---|
| OQ-014 | Počáteční obsah katalogu po oblastech a jeho zdroje (kontrolní seznamy nemocnic, šablona DPIA, vstupní podmínky plátců, národní doporučení ke kyberbezpečnosti). `TODO(legal)`, `TODO(dpo)`, `TODO(security)` | — | otevřená |
| OQ-015 | Mají dodavatelé vidět profil požadavků nemocnice ještě před žádostí? Mají nemocnice vidět výsledky ostatních? | [volí nemocnice; ve výchozím stavu soukromé] | výchozí potvrzena |
| OQ-016 | Má dodavatel vidět jména posuzovatelů, nebo jen role? | [jen role] | výchozí potvrzena |

## Technické

| ID | Otázka | Výchozí odpověď | Stav |
|---|---|---|---|
| OQ-017 | Repozitář platformy a sdílené UI. | Rozhodnuto: `platform/` vedle `web/` v `pskrobanek/therahub` (DEC-005). | uzavřená |
| OQ-018 | SSO nemocnice v prvním nasazení, nebo e-mail + heslo + MFA? | [e-mail + heslo + MFA] | výchozí potvrzena |

## Vzniklé během práce

| ID | Otázka | Výchozí odpověď | Stav |
|---|---|---|---|
| OQ-101 | Po prvních pilotních provozech vyhodnotit, zda **Adoption index** ponechat vedle verdiktu shody, nebo ho nahradit (DEC-004, ENDGAME kap. 19). | [ponechat] | otevřená |
| OQ-102 | Zbytek prototypu mimo tento modul stále ukazuje FTN (logo v menu, přihlášená lékařka, pacienti, statistiky Mých aplikací, spouštěcí okno). Pavel rozhodne zvlášť. Do té doby je v menu FTN, zatímco modul pracuje s FN Demo. | — | otevřená |
| OQ-103 | Svolení FTN k použití loga na odkazu prototypu. | — | otevřená |
| OQ-104 | OncoReady mimo modul (Moje aplikace, App Store) má ukázkovou cenu, hodnocení a statistiky provozu. Nahradit neutrálním stavem jako v modulu? | [v modulu už neutrální stav „Dossier se připravuje“] | otevřená |
| OQ-105 | Prahy a očekávání v ukázkovém profilu FN Demo (např. stáří penetračního testu, lhůta hlášení incidentu) jsou zástupné. `TODO(legal)`, `TODO(dpo)`, `TODO(security)` | — | otevřená |
