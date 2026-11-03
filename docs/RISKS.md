# Rizika – modul Žádost o pilotní provoz a schvalování

| ID | Riziko | Dopad | Mitigace | Stav |
|---|---|---|---|---|
| RISK-001 | Ukázkové požadavky a prahy budou omylem brány jako skutečný právní, GDPR nebo bezpečnostní standard. | Nemocnice nebo dodavatel jednají podle neschváleného obsahu. | Zástupné hodnoty označené „ukázka“ v rozhraní a `TODO(legal/dpo/security)` v kódu (DEC-013); obsah dodají odborníci (OQ-014). | otevřené |
| RISK-002 | Smyšlená data v demu budou vypadat jako interní dokumenty skutečné nemocnice nebo firmy. | Reputační a právní riziko. | Modul jen na FN Demo (DEC-003); skutečné aplikace bez verdiktů (DEC-008); zbytek prototypu k rozhodnutí (OQ-102). | otevřené |
| RISK-003 | Automatické splnění kroku nebo AI předposouzení nahradí lidský úsudek. | Rozhodnutí bez odpovědné osoby. | Automatické splnění ve výchozím stavu vypnuté a nikdy u rozhodnutí, podpisů, výjimek a rozporů; AI jen „Návrh — ověřte“ (brief §8). | otevřené |
| RISK-004 | Barvy stavů nebudou čitelné na skleněném pozadí nebo pro barvoslepé. | Chybně přečtený stav shody. | Ikona + text u každého stavu, tokeny na jednom místě, kontrolní skript kontrastu (DEC-002). | ošetřené ve Fázi 0a |
| RISK-005 | Pilotní provoz bude vnímán jako nárok na smlouvu nebo obcházení zákona o zadávání veřejných zakázek. | Rozpor se ZZVZ. | Žádná obrazovka ani dokument to nenaznačuje; krok Nákup zaznamenává cestu zakázky (brief §11). `TODO(legal)` | otevřené |
| RISK-006 | Ukázkový matching ve Fázi 0 se bude lišit od budoucího enginu. | Demo slibuje jiné chování. | Stejné stavy a pravidla verdiktu jako brief §4 (DEC-010); ve Fázi 1 tabulka očekávaných verdiktů. | otevřené |
| RISK-007 | Únik důvěrných dokumentů dodavatelů nebo interních komentářů mezi nemocnicemi či k dodavateli. | Porušení důvěry a smluv. | Jedna vrstva oprávnění, automatické testy přístupu napříč nemocnicemi (Fáze 1–2). | otevřené |
