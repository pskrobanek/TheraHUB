# TheraHUB – ENDGAME (cílová vize platformy)

> **Co je tento dokument:** popis **cílového stavu**, kam TheraHUB směřuje. Je to „severka“ projektu. Nestavíme ho najednou, ale **po jednom kroku** (viz kap. 20). Každý krok musí jít ve směru tohoto dokumentu.
> **Verze:** 1.0 (2026-10-17) · nahrazuje pracovní koncept v0.1
> **Změny:** vizi měníme vědomě – úpravou tohoto souboru a commitem s popisem, co a proč se změnilo.

---

## 0. Shrnutí na jedné stránce

**TheraHUB je neziskový „důvěryhodný prostředník“ mezi nemocnicemi a digitálními inovacemi.** Postavený na **HL7 FHIR** a **InterSystems IRIS for Health** propojuje nemocnice, jejich NIS a certifikované aplikace / startupy přes společný framework (data, bezpečnost, GDPR, safety, legal, výzkum).

Platforma má **čtyři hlavní záložky**, **pohled lékaře na pacienta** a pod nimi společné základy:

| Záložka | K čemu slouží |
|---|---|
| 🛒 **App Store** | katalog certifikovaných aplikací, hodnocení, kde běží, kompatibilita s mou nemocnicí a mým NIS, sandbox, pilot, online smlouva |
| 🩺 **Pacient** | klinický pracovní prostor: aktivní aplikace u konkrétního pacienta, jejich widgety a aktivace dalších jedním kliknutím |
| 📊 **Dashboard** | co máme k dispozici a v provozu, stav smluv, certifikací, incidentů, využití, nákladů |
| 🔗 **Workflow** | propojování aplikací do logických celků (klinické a provozní cesty) |
| 🔬 **Science** | pseudonymizovaná data na vyžádání pro výzkumné projekty, i napříč nemocnicemi |

**Společné základy:** TheraHUB Framework · Profil nemocnice (včetně NIS a datové dostupnosti) · Profil dodavatele · Smluvní engine s variantami · TheraHUB Node v nemocnici · Certifikace a dohled.

**Hlavní princip:** jednou se certifikuje dodavatel, jednou se nastaví nemocnice. Z N×M jednání (každý s každým) uděláme N+M (každý jednou se standardem).

---

## 1. Problém

Startup se do nemocnice dostává 12–24 měsíců. Nebrzdí ho technologie, ale to, že **každá nemocnice znovu a jinak řeší stejné otázky**:

| Bariéra | Co to v praxi znamená |
|---|---|
| **Legal** | každá nemocnice má vlastní smluvní vzory, právník čte smlouvu od nuly |
| **GDPR** | zdravotní data = zvláštní kategorie (čl. 9), zpracovatelská smlouva (čl. 28), DPIA (čl. 35), subdodavatelé, lokalita dat |
| **Kyberbezpečnost** | nemocnice musí podle zákona o kybernetické bezpečnosti (transpozice NIS2) řídit bezpečnost svých dodavatelů |
| **Napojení na NIS** | každý nemocniční informační systém má jiná rozhraní a každá integrace se platí znovu |
| **Regulace produktu** | software se zdravotnickým účelem = zdravotnický prostředek (MDR), u AI navíc AI Act |
| **Veřejné zakázky** | veřejné nemocnice postupují podle ZZVZ; startup neumí soutěžit, nemocnice neumí rychle nakoupit malou věc |
| **Výzkum** | sdílení dat mezi nemocnicemi pro výzkum je právně i technicky složité, každý projekt se řeší ručně |
| **Důvěra** | nemocnice neví, s kým jedná, kde budou data a jestli firma za rok bude existovat |

---

## 2. Mapa platformy

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         TheraHUB (non-profit)                            │
│                                                                          │
│   🛒 App Store      📊 Dashboard      🔗 Workflow      🔬 Science         │
│   ────────────────────────────────────────────────────────────────────   │
│   Profil nemocnice │ Profil dodavatele │ Smluvní engine │ Matching engine│
│   ────────────────────────────────────────────────────────────────────   │
│   TheraHUB Framework (pravidla)  │  Certifikace & dohled  │  Audit       │
└───────────────────────────────────┬──────────────────────────────────────┘
                                    │  (bez zdravotních dat)
              ┌─────────────────────┼─────────────────────┐
              ▼                     ▼                     ▼
      TheraHUB Node A       TheraHUB Node B       TheraHUB Node C
      (IRIS for Health)     (IRIS for Health)     (IRIS for Health)
              │                     │                     │
            NIS A                 NIS B                 NIS C
```

- **Centrální část** (TheraHUB Central) drží katalog, profily, smlouvy, certifikace, workflow šablony, výzkumné projekty. **Nedrží zdravotní data.**
- **TheraHUB Node** běží v každé nemocnici (nebo v jejím privátním cloudu). Napojuje se na NIS, vystavuje data ve FHIR, vynucuje pravidla a smlouvy, loguje, pseudonymizuje pro výzkum.

---

## 3. TheraHUB Framework – společný standard

Framework je jádro celé myšlenky. Bez něj je platforma jen další marketplace, s ním je to **důkaz důvěry**. Je **otevřený, verzovaný a veřejně připomínkovaný**.

Má **šest pilířů**. Každý pilíř má úrovně (**Base / Standard / High**), protože aplikace na objednávání pacientů nepotřebuje stejný režim jako AI diagnostika.

### 3.1 DATA (interoperabilita)
- Výměna dat přes **HL7 FHIR R4** (s připraveností na R5/R6, viz kap. 12), české profily HL7 CZ a evropské profily HL7 Europe.
- Autorizace přes **SMART on FHIR** (OAuth 2.0 / OpenID Connect) s granularními scopes.
- Terminologie: SNOMED CT, LOINC, MKN-10 (výhledově MKN-11), ATC, UCUM a národní číselníky.
- **Datový manifest aplikace:** aplikace deklaruje, jaké FHIR zdroje čte a zapisuje a za jakým účelem. Platforma jí pustí jen to.

### 3.2 SECURITY (kyberbezpečnost)
- Mapováno na zákon o kybernetické bezpečnosti (NIS2), vyhlášky NÚKIB a výhledově **Cyber Resilience Act** u software, který není zdravotnickým prostředkem.
- Minimum: šifrování, MFA, řízení přístupů, auditní logy, správa zranitelností, **SBOM**, incident response s lhůtami, penetrační test.
- High: ISO/IEC 27001 nebo ekvivalent, pravidelný externí pentest, hosting výhradně v EU.

### 3.3 PRIVACY (GDPR)
- Standardní **DPA (čl. 28)** jako modul s variantami (kap. 5).
- Předvyplněná **DPIA** od dodavatele.
- Registr subdodavatelů, lokalita dat, přenosy mimo EU.
- Role: nemocnice = správce, aplikace = zpracovatel, TheraHUB = **zdravotní data nevidí**.

### 3.4 SAFETY (regulace produktu)
- Klasifikace: wellness / administrativní SW / **zdravotnický prostředek (MDR)** třídy I–III.
- CE, ISO 14971, IEC 62304, IEC 82304-1, ISO 13485.
- **AI Act:** klasifikace rizika, dokumentace modelu, lidský dohled, monitoring výkonu po nasazení.
- Postmarketový dohled: incident hlášený jednou nemocnicí se dozví všechny nemocnice s danou aplikací.

### 3.5 LEGAL & BUSINESS
- Standardní smluvní moduly s variantami (kap. 5).
- Pojištění odpovědnosti, **exit plán** (export dat ve FHIR), escrow u kritických aplikací.
- Cenotvorba ve standardní struktuře, aby šly ceny porovnat.

### 3.6 RESEARCH (sekundární využití dat)
- Pravidla pro pseudonymizaci a anonymizaci (ISO 25237), minimální velikost skupin, kontrola výstupů.
- Standardní **research agreement**, data sharing agreement a smlouva o společném správcovství (čl. 26 GDPR) jako moduly s variantami.
- Kompatibilita s režimem **EHDS** pro sekundární využití (subjekty pro přístup ke zdravotním datům, datová povolení, bezpečná zpracovatelská prostředí).

### 3.7 Compliance profil aplikace
Každá aplikace má strojově čitelný profil, například:

```yaml
app: CardioWatch
vendor: Example s.r.o.
framework_version: 1.0
levels: { data: standard, security: high, privacy: standard, safety: mdr-IIa, ai_act: high-risk }
features:                       # funkce aplikace a data, která každá potřebuje
  - id: vitals-monitoring
    requires: [Patient, Observation(vital-signs)]
  - id: medication-alerts
    requires: [MedicationStatement, AllergyIntolerance]
  - id: auto-discharge-summary
    requires: [Encounter, Condition, Procedure]
    writes:   [DocumentReference]
hosting_options: [hospital-onprem, hospital-private-cloud, vendor-saas-eu, therahub-cloud]
contract_offers:               # varianty, které dodavatel nabízí (kap. 5)
  license: [per-bed-month, enterprise-flat]
  data_reuse: [none, anonymized-product-improvement]
  ai_training: [none]
certified_until: 2027-10-01
```

---

## 4. Profil nemocnice

Nemocnice si **jednou** nastaví, kdo je, co má a co dovolí. Profil je strojově čitelný (čte ho matching engine) a zároveň srozumitelný pro právníka, DPO, manažera kyberbezpečnosti, IT i vedení. Nemocnice začíná z **šablony** (např. „Fakultní nemocnice – přísná“, „Krajská – standard“, „Soukromá klinika“).

### 4.1 Sekce profilu

| Sekce | Obsah | Kdo vyplňuje |
|---|---|---|
| **Identita** | IČO, typ (veřejná / soukromá), počet lůžek, oddělení, kontakty | admin |
| **Legal** | **schválené varianty** smluvních kritérií (kap. 5), rozhodné právo, limity odpovědnosti, podepisující osoby | právní oddělení |
| **GDPR** | schválené varianty DPA, lokalita dat, subdodavatelé, výmaz, DPIA | DPO |
| **Security** | minimální úroveň, požadované certifikace, pentesty, lhůty hlášení incidentů | manažer KB / CISO |
| **Safety & AI** | povolené třídy MDR, přístup k AI, požadavek klinické validace, etická komise | náměstek LPP |
| **Research** | schválené varianty research agreementů, etická komise, ochota účastnit se sdílených projektů | věda a výzkum |
| **NIS a data** | jaký NIS a moduly, jaká rozhraní, **matice dostupnosti dat** (4.2) | IT |
| **Provoz a hosting** | kde mohou aplikace běžet (4.3), SSO, síť | IT |
| **Nákup** | režim zakázek, limity, schvalovací workflow | nákup / ekonomika |

### 4.2 NIS a datová dostupnost

Nemocnice popíše svůj NIS a hlavně to, **jaká data reálně umí poskytnout a jak dobře**:

```yaml
nis:
  vendor: <dodavatel NIS>
  product: <produkt>
  version: "x.y"
  modules: [ADT, ambulance, lůžková část, laboratoř (LIS), PACS/RIS, lékárna, e-preskripce]
interfaces:                    # jak se TheraHUB Node na NIS napojuje
  - type: HL7v2   messages: [ADT^A01-A08, ORU^R01, ORM^O01]
  - type: FHIR    version: R4   scope: read
  - type: DB-view
  - type: DICOMweb
data_availability:             # po FHIR zdrojích
  Patient:             { read: yes,  write: no,  mode: realtime, quality: high }
  Encounter:           { read: yes,  write: no,  mode: realtime, quality: high }
  Observation(lab):    { read: yes,  write: no,  mode: realtime, quality: high, coding: LOINC-partial }
  Observation(vitals): { read: yes,  write: yes, mode: near-realtime, quality: medium }
  Condition:           { read: yes,  write: no,  mode: batch-daily, quality: medium, coding: MKN-10 }
  AllergyIntolerance:  { read: no,   note: "jen volný text" }
  MedicationRequest:   { read: yes,  write: no,  mode: realtime, quality: high }
  ImagingStudy:        { read: yes,  mode: realtime }
  DocumentReference:   { read: yes,  write: yes }
```

Z toho matching engine pro každou aplikaci spočítá **připravenost k provozu (readiness)**:

| Výsledek | Význam |
|---|---|
| 🟢 **Plný provoz** | všechny funkce aplikace mají potřebná data |
| 🟡 **Omezený provoz** | funguje část funkcí; přesně řekne které („výstrahy na léky nefungují – alergie nejsou strukturované“) |
| 🔴 **Nelze provozovat** | chybí data pro základní funkci |

U omezeného provozu platforma ukáže, **co by bylo potřeba doplnit** (např. nový HL7 v2 interface nebo kódování alergií) a jestli to už jiná nemocnice se stejným NIS vyřešila. Adaptéry na jednotlivé NIS jsou sdílené: co se postaví pro jednu nemocnici, dostanou všechny se stejným systémem.

Matici dostupnosti dat jde z velké části **vyplnit automaticky** – TheraHUB Node umí po napojení změřit, co reálně teče a v jaké kvalitě.

### 4.3 Provoz a hosting

Nemocnice určí, **kde mohou aplikace běžet**. Každá varianta může být „povoleno“, „po schválení“ nebo „zakázáno“:

- **On-prem** – v kontejneru na TheraHUB Node v nemocnici,
- **privátní cloud nemocnice**,
- **SaaS dodavatele v EU**,
- **TheraHUB managed cloud (EU)**.

Volba se může lišit podle citlivosti (např. „aplikace s přístupem k diagnózám jen on-prem, administrativní aplikace i SaaS“).

---

## 5. Smluvní engine s variantami („klikací smlouvy“)

### 5.1 Princip
Smlouva se **neskládá od nuly**, ale z předem právně schválených modulů. Každý modul obsahuje **kritéria** a každé kritérium má **předem definované varianty**.

- **Nemocnice** si v profilu u každého kritéria **zaklikne**, které varianty schvaluje:
  - ✅ **schváleno** (podepíše se bez dalšího),
  - 🟡 **po schválení** (spustí interní workflow, např. DPO nebo etickou komisi),
  - ❌ **nepřijatelné**.
- **Dodavatel** u své aplikace zaklikne, které varianty **nabízí**.
- Matching engine najde **průnik**. Pokud existuje u všech kritérií → smlouva se vygeneruje automaticky. Pokud ne → platforma ukáže přesně, o kterém kritériu je potřeba jednat.

```
         Nemocnice schvaluje        Dodavatel nabízí         Výsledek
Licence:  [per-bed ✅][flat ✅]  ∩  [per-bed][per-user]  →  per-bed ✅
Lokalita: [CZ ✅][EU ✅]          ∩  [EU]                 →  EU ✅
AI trénink:[ne ✅][anonym. 🟡]   ∩  [anonymizovaná]      →  anonymizovaná 🟡 → DPO
```

### 5.2 Moduly a příklady kritérií

**Modul LICENCE**

| Kritérium | Varianty |
|---|---|
| Licenční model | per lůžko / per uživatel / per transakce / paušál pro celou nemocnici / zdarma pro pilot |
| Doba | pilot 3 měsíce / 1 rok / 3 roky / na dobu neurčitou s výpovědí |
| Výpovědní lhůta | 1 / 3 / 6 měsíců |
| Limit odpovědnosti | 1× / 2× / 5× roční cena / neomezeno u úmyslu a hrubé nedbalosti |
| SLA dostupnost | 99,0 % / 99,5 % / 99,9 % |
| Podpora | pracovní dny / 24×7 u kritických aplikací |
| Escrow zdrojového kódu | ne / ano u kritických aplikací |
| Exit | export dat ve FHIR do 30 dnů / s asistencí dodavatele |

**Modul GDPR (DPA)**

| Kritérium | Varianty |
|---|---|
| Lokalita dat | jen ČR / EU/EHP / EU + země s rozhodnutím o odpovídající ochraně |
| Subdodavatelé | předem schválený seznam / změna s oznámením a právem námitky / každá změna se souhlasem |
| Použití dat dodavatelem | zakázáno / jen anonymizovaná data pro zlepšení produktu / pseudonymizovaná na základě zvláštní dohody |
| Trénink AI na datech nemocnice | zakázán / jen anonymizovaná data / na základě research agreementu |
| Doba uchování po skončení | výmaz do 30 dnů / vrácení a výmaz / uchování dle zákona |
| Hlášení porušení zabezpečení | do 24 h / do 48 h |
| Audit | dotazníkem / dálkový audit / audit na místě |

**Modul SECURITY** (bezpečnostní příloha dle NIS2) – lhůty hlášení incidentů, pentesty, přístupy dodavatele do sítě (žádný / VPN s MFA / jen přes TheraHUB Node), SBOM, správa zranitelností.

**Modul RESEARCH AGREEMENT**

| Kritérium | Varianty |
|---|---|
| Typ dat | anonymizovaná / pseudonymizovaná / agregovaná (jen výsledky) |
| Způsob přístupu | federovaný dotaz (data neopouštějí nemocnici) / bezpečné zpracovatelské prostředí / export |
| Právní titul | čl. 9(2)(j) GDPR + § zvláštního zákona / souhlas pacienta / datové povolení dle EHDS (od jeho účinnosti) |
| Vlastnictví výsledků (IP) | nemocnice / společné / partner s licencí pro nemocnici |
| Publikace | volně / po odsouhlasení / se spoluautorstvím nemocnice |
| Komerční využití výsledků | zakázáno / s podílem na výnosech / bez omezení |
| Etická komise | schválení každé nemocnice / vedoucí etická komise pro celý projekt |
| Ukončení | výmaz dat / archivace dle zákona |

Další moduly: **Pilotní smlouva**, **Zdravotnický prostředek / AI**, **SLA**, **Workflow** (vzájemné předávání dat mezi aplikacemi, kap. 8), **Společné správcovství** (víc nemocnic v jednom výzkumném projektu).

### 5.3 Workflow podpisu
1. Matching engine vygeneruje smlouvu z průniku variant.
2. Kritéria „po schválení“ projdou **interním workflow nemocnice** (DPO, KB manažer, právník, etická komise, ředitel).
3. Podpis **kvalifikovaným elektronickým podpisem** (eIDAS).
4. Příprava **zveřejnění v registru smluv** (zákon č. 340/2015 Sb.) u veřejných nemocnic.
5. Platforma hlídá termíny (expirace, obnova, výpověď, platnost certifikace).
6. **Smlouva řídí techniku:** po podpisu se v TheraHUB Node automaticky zapnou přístupy podle datového manifestu a schválených variant; po skončení se vypnou.

Právník nemocnice tedy nečte 40 stran, ale jen **kritéria mimo jeho předem schválené varianty** – a těch je ve standardním případě nula.

---

## 6. 🛒 App Store

Pro nemocnici vypadá jako obchod s aplikacemi, pod kapotou je to **registr ověřených produktů**.

### 6.1 Karta aplikace
- Popis, klinický use-case, cílová oddělení, screenshoty a video.
- **Compliance odznaky** (Data / Security / Privacy / Safety / AI / Research) s úrovní a platností.
- **Kompatibilita s mou nemocnicí:**
  - 🟢/🟡/🔴 **pravidla** (profil nemocnice × compliance profil),
  - 🟢/🟡/🔴 **smlouva** (průnik variant, kap. 5),
  - 🟢/🟡/🔴 **readiness s mým NIS** (kap. 4.2), včetně seznamu funkcí, které poběží a které ne,
  - **hosting**, který odpovídá mému profilu.
- **Kde běží:** seznam nemocnic, kde je aplikace v pilotu nebo v produkci (nemocnice může zvolit, zda je uvedena jménem, nebo anonymně, např. „2 fakultní nemocnice“). Zvlášť je vidět, **kolik nemocnic se stejným NIS** ji už provozuje.
- **Hodnocení:**
  - **jen ověřené** – hodnotit mohou pouze nemocnice s aktivní nebo ukončenou smlouvou, ne kdokoli,
  - dimenze: klinický přínos, použitelnost, náročnost integrace, kvalita podpory, stabilita,
  - textové recenze podle rolí (lékař, sestra, IT, management),
  - **objektivní metriky z provozu** (se souhlasem nemocnic): dostupnost, počet incidentů, doba odezvy podpory, počet aktivních uživatelů.
- **Ceník** ve standardní struktuře: částka, za co se platí (pacient, uživatel, událost/vyšetření, lůžko, celá nemocnice) a frekvence (měsíčně, ročně, jednorázově).
- **Pro koho je aplikace:** pacient, lékař, sestra, administrativa, výzkumník.
- **Regulatorní zařazení** jako štítek: zdravotnický prostředek (třída MDR), administrativní aplikace, wellness, pouze pro výzkum; u AI navíc značka AI.
- **Free trial:** délka zdarma a **2–3 měřitelná KPI**, podle kterých nemocnice po trialu jednoduše vyhodnotí, zda aplikaci koupí (např. „neplánované hospitalizace −15 %“, „čas na dokumentaci −30 %“). Po trialu je vidět cena.
- **Soulad v jednom přehledu:**
  - s **profilem mé nemocnice** – legal, GDPR, security,
  - s **mým NIS** – míra integrace v % (readiness, kap. 4.2),
  - s **TheraHUB** – zda aplikace dodává widget, data pro Science a kroky pro Workflow,
  - s **datovým prostorem InterSystems** (IRIS for Health, kap. 11.4),
  - s **evropským datovým standardem** (EHDS / EEHRxF, HL7 Europe, kap. 12),
  - u AI s **kodexem asociace pro AI v ČR**,
  - **záštita odborné společnosti**, pokud ji aplikace má.
- **Adoption index (0–100)** shrnuje připravenost aplikace k nasazení v mé nemocnici do jednoho čísla ve čtyřech pásmech: Vysoká (85+, zelená) / Střední (70+, žlutá) / Nízká (55+, oranžová) / Velmi nízká (červená). Váhy: soulad s nemocnicí 35 %, datový prostor 25 %, odborné společnosti 20 %, TheraHUB integrace 20 %. Na kartě v katalogu je index jako progress bar s číslem a úrovní; šipkou se rozbalí rozpad na čtyři části (váha, procento) a všechny dílčí kontroly. Váhy jsou veřejné a verzované spolu s Frameworkem.
- **Filtry katalogu:** specializace, řazení (adoption index, hodnocení), minimální adoption index, jednotlivá kritéria indexu, pro koho, třída MDR, režim AI (bez AI, asistující, vedená, autonomní), minimální hodnocení.
- Tlačítka: **Vyzkoušet v sandboxu → Požádat o pilot → Uzavřít smlouvu**.

V nemocnici má sekce Aplikace dvě části: **Moje aplikace** (licencované aplikace, které lékaři mohou aktivovat u pacientů) a **App Store** (celý katalog s kartami výše). Moje aplikace jsou dlaždice (logo a název) rozdělené podle specializace. Otevřená aplikace se zobrazí jako podzáložka v menu (podobně jako otevřený pacient) a má záložky **Přehled / Pacienti / Workflow / Science**. Přehled je **souhrnný widget za celou nemocnici** – stejně jako widget u pacienta, jen agregovaně: statistiky aplikace, rozpad výsledků nebo trend a poslední aktivní pacient. Na záložce Pacienti je seznam pacientů v aplikaci se stavem. Widget dodává aplikace přes standardní rozhraní; data zůstávají v nemocnici.

### 6.2 Sandbox → Pilot → Produkce

| Stupeň | Data | Smlouva | Délka |
|---|---|---|---|
| **Sandbox** | syntetická data v českých FHIR profilech | klikací podmínky | ihned |
| **Pilot** | reálná data, omezený rozsah (oddělení, počet pacientů) | pilotní smlouva z variant | 1–3 měsíce |
| **Produkce** | plný rozsah | provozní smlouva z variant | dlouhodobě |

Kritéria úspěchu pilotu se nastaví na začátku. Přechod do produkce je předem definovaný.

### 6.3 Klinický pracovní prostor – aplikace u pacienta

Lékař nepracuje s aplikacemi jako se seznamem licencí, ale **u konkrétního pacienta**. Proto má TheraHUB vedle katalogu i pohled lékaře na pacienta:

- **Hlavička pacienta** z NIS: diagnózy, staging, probíhající léčba a její průběh (např. frakce radioterapie).
- **Aktivní aplikace** pacienta jako karty. Každá aplikace dodává **vlastní widget** (souhrn svých dat a hlavní akce): např. dotazník toxicity s upozorněním, EKG křivku, AI souhrn návštěvy s úkoly. Widget vzniká přes standardní rozhraní (SMART on FHIR, CDS Hooks), ne proprietárně.
- **Dostupné aplikace** – ty, které má nemocnice licencované. Aktivace u pacienta je jedno kliknutí; pacient dostane SMS odkaz, nic se neinstaluje. Aktivace je v rámci již podepsané smlouvy, nové smluvní jednání nevzniká.
- **Doporučení z dat pacienta** – platforma zvýrazní aplikace, které odpovídají stavu pacienta (např. „při dysfagii G2“). Doporučení je jen nabídka, rozhoduje lékař.
- Stejná karta pacienta má záložky **Workflow** (léčebná cesta pacienta) a **Science** (zařazení do výzkumu, souhlasy).

**Kde to běží:** pohled pracuje se zdravotními daty, proto běží **v kontextu nemocnice** – v TheraHUB Node nebo jako aplikace spouštěná z NIS (SMART on FHIR launch). Centrální část zná jen katalog a licence, ne pacienty.

---

## 7. 📊 Dashboard

Přehled pro nemocnici – „co máme, jak to běží, co nás čeká“. Obsah se liší podle role.

| Blok | Obsah |
|---|---|
| **Moje aplikace** | všechny aplikace podle stavu: sandbox / pilot / produkce / ukončené; podle oddělení |
| **K dispozici** | doporučené aplikace, které jsou 🟢 kompatibilní s mým profilem a NIS |
| **Smlouvy** | platnost, blížící se obnovy a výpovědní lhůty, čekající schválení (pro DPO, právníka, ředitele) |
| **Compliance** | stav certifikací dodavatelů, expirace, nové zranitelnosti v SBOM, změny subdodavatelů |
| **Bezpečnost a incidenty** | hlášené incidenty, jejich stav a lhůty |
| **Datové přístupy** | souhrn auditního logu: která aplikace k jakým datům přistupuje a kolik (pro DPO) |
| **Provoz** | dostupnost, využití, aktivní uživatelé |
| **Náklady** | roční náklady podle aplikací a oddělení, porovnání s rozpočtem |
| **Workflow a výzkum** | běžící workflow, aktivní výzkumné projekty a žádosti o data |

Obdobný dashboard má i **dodavatel** (kde běží, stav certifikace, poptávky, hodnocení, incidenty).

---

## 8. 🔗 Workflow – propojování aplikací do celků

Jednotlivé aplikace řeší jednotlivé problémy. Hodnota roste, když je propojíme do **logických celků**: klinických cest a provozních procesů.

### 8.1 Příklady
- **Péče po infarktu:** propuštění v NIS → aplikace na edukaci pacienta → telemonitoring → AI vyhodnocení rizika → při zhoršení úkol pro kardiologa + upozornění praktickému lékaři.
- **Radiologie:** nové vyšetření v PACS → AI triáž snímků → prioritizace pracovního seznamu radiologa → strukturovaný nález zpět do NIS.
- **Provoz lůžek:** příjem v NIS → predikce délky hospitalizace → plánování lůžek → objednání dopravy a návazné péče.

### 8.2 Jak to funguje
- **Vizuální editor:** kroky (aplikace, lidský krok, podmínka, časovač, notifikace) spojené šipkami.
- **Spouštěče** jsou události z NIS nebo z aplikací (FHIR Subscriptions, HL7 v2 zprávy).
- **Předávání dat** mezi kroky jde vždy přes TheraHUB Node ve FHIR – aplikace se nespojují napřímo.
- **Validátor workflow** před spuštěním zkontroluje:
  - smí aplikace B dostat data od aplikace A? (datové manifesty, účel, DPA),
  - jsou všechny aplikace ve workflow smluvně pokryté (případně se doplní modul Workflow ke smlouvě),
  - mají všechny aplikace potřebná data z mého NIS (readiness),
  - je u kritických rozhodnutí krok s lidským dohledem (AI Act).
- **Šablony workflow:** osvědčené workflow může nemocnice sdílet s ostatními („workflow store“). Jiná nemocnice ho převezme jedním kliknutím, pokud má aplikace a data.
- **Monitoring:** kolik případů prošlo, kde se zasekávají, doby průchodu.

### 8.3 Technika
Spouštění workflow zajišťuje **interoperabilní engine IRIS** v Node. Pro definice a výměnu se použijí standardy **FHIR Workflow** (PlanDefinition, ActivityDefinition, Task), **CDS Hooks** pro rozhodovací podporu přímo v NIS a **FHIR Subscriptions** pro události.

---

## 9. 🔬 Science – data pro výzkum na vyžádání

### 9.1 Cíl
Výzkumník (nemocnice, univerzita, startup s research agreementem) získá **pseudonymizovaná nebo anonymizovaná data na vyžádání** pro konkrétní projekt – z jedné nemocnice nebo **napříč nemocnicemi** – bez měsíců ručního vyjednávání a bez toho, aby data zbytečně opouštěla nemocnice.

### 9.2 Průběh projektu
1. **Návrh projektu:** cíl, hypotéza, požadovaná data (kohortní kritéria + proměnné), doba, tým.
2. **Feasibility dotaz (zdarma, okamžitě):** federovaný dotaz do Nodů zúčastněných nemocnic vrátí jen **počty** („v 5 nemocnicích je 1 240 pacientů splňujících kritéria“). Data neopouštějí nemocnice. Malé počty se nezobrazují.
3. **Žádost o data:** výběr nemocnic; platforma vygeneruje **research agreement z variant**, které nemocnice schválily (kap. 5.2), a podklady pro etickou komisi a DPIA.
4. **Schválení** v každé nemocnici přes její workflow (etická komise, DPO, vedení). Od účinnosti EHDS navíc **datové povolení** příslušného subjektu pro přístup ke zdravotním datům, pokud se na projekt vztahuje.
5. **Poskytnutí dat** jedním ze způsobů (podle schválené varianty):
   - **federovaná analýza** – kód jde k datům, ven jdou jen výsledky (nejbezpečnější),
   - **bezpečné zpracovatelské prostředí (SPE)** – výzkumník pracuje s pseudonymizovanými daty v uzavřeném prostředí bez možnosti stažení, výstupy se kontrolují,
   - **export** pseudonymizovaného datasetu (jen tam, kde to varianty dovolí).
6. **Ukončení:** výmaz / archivace, publikace podle dohody, výsledky se vracejí do katalogu (dataset karty, publikace).

### 9.3 Pseudonymizace napříč nemocnicemi
- Pseudonymizace probíhá **v Node každé nemocnice**, před opuštěním nemocnice.
- **Pseudonymy jsou specifické pro projekt** – stejný pacient má v každém projektu jiný pseudonym, projekty nejde spojovat.
- Propojení téhož pacienta z více nemocnic zajistí **nezávislá důvěryhodná třetí strana** (pseudonymizační služba s klíčem, který nemá ani TheraHUB, ani výzkumník).
- Ochrana proti reidentifikaci: minimalizace proměnných, zobecnění (věk v intervalech, data posunutá), prahy malých počtů, kontrola výstupů.

### 9.4 Datový model pro výzkum
Data se pro výzkum převádějí z FHIR do **OMOP CDM** (OHDSI) – evropského de facto standardu pro výzkum na reálných datech (EHDEN, DARWIN EU při EMA). Díky tomu fungují existující analytické nástroje a studie lze spouštět ve všech nemocnicích stejně.

---

## 10. Certifikace dodavatelů a dohled

1. **Registrace** a due diligence firmy (vlastníci, sankční seznamy, pojištění).
2. **Self-assessment** proti Frameworku (online dotazník + dokumenty).
3. **Technická validace** – automatické conformance testy (FHIR profily, SMART on FHIR) v sandboxu.
4. **Review** bezpečnosti a privacy (interní tým nebo akreditovaní externí auditoři).
5. **Odznaky** s platností (např. 12 měsíců).
6. **Průběžný dohled** – expirace certifikátů, incidenty, nové zranitelnosti v SBOM, hodnocení z provozu.
7. **Recertifikace** při významné změně produktu.

Startup projde certifikací **jednou ročně**, místo aby vyplňoval dotazníky pro každou nemocnici.

---

## 11. Technická architektura

### 11.1 Principy
1. **Zdravotní data zůstávají v nemocnici.** Central je nevidí.
2. **Standardy na rozhraní, ne proprietární API.** Vše, co se dá, je FHIR; Node je teoreticky vyměnitelný.
3. **Smlouva = konfigurace.** Přístupová práva se generují ze smluv, ne ručně.
4. **Policy as code.** Pravidla nemocnic, varianty smluv a požadavky Frameworku jsou strojově vyhodnotitelné.
5. **Všechno se loguje** (kdo, co, kdy, proč, na základě jaké smlouvy).

### 11.2 TheraHUB Central (EU cloud)
- Katalog, profily nemocnic a dodavatelů, Framework registr.
- Matching engine (pravidla, varianty, readiness).
- Smluvní engine, schvalovací workflow, podpisy, registr smluv.
- Certifikace a dohled, hodnocení.
- Sandbox se syntetickými daty.
- Knihovna workflow šablon.
- Science: katalog projektů, koordinace federovaných dotazů a schválení (bez dat).

### 11.3 TheraHUB Node (v nemocnici, IRIS for Health)
1. **NIS adaptér** – převod z NIS do FHIR (HL7 v2, DB pohledy, CDA, DICOM, FHIR), sdílený pro každý typ NIS.
2. **FHIR fasáda** – jednotné API pro aplikace.
3. **Autorizační server SMART on FHIR** – tokeny jen se scopes ze smlouvy.
4. **Policy enforcement** – vynucuje pravidla nemocnice za běhu.
5. **Měření dostupnosti a kvality dat** – automaticky plní matici z kap. 4.2.
6. **Workflow engine** – spouští workflow z kap. 8.
7. **Pseudonymizace a výzkumná vrstva** – FHIR → OMOP, federované dotazy, export do SPE.
8. **Audit log** – nepodvrhnutelný, přístupný DPO.
9. **SSO** – napojení na identitu nemocnice (AD / Entra ID).
10. **App runtime** – kontejnery pro aplikace provozované on-prem.

### 11.4 Proč IRIS for Health
- Nativní FHIR server, transformace HL7 v2 / CDA / SQL → FHIR.
- Zralý integrační engine pro starší NIS.
- Technologie InterSystems je v nemocnicích známá.

> Otevřená otázka: licenční model IRIS pro neziskovou platformu a uzly v nemocnicích – vyjednat s InterSystems. Architekturu držet tak, aby rozhraní byla čistě standardní (FHIR, OMOP) a uzel byl vyměnitelný.

---

## 12. Standardy a budoucnost – na co být připraven

Cílem je, aby **certifikace TheraHUB znamenala náskok i vůči evropské regulaci**, ne jen vůči dnešku. Přehled vychází ze stavu k říjnu 2026. Přesné termíny je nutné průběžně ověřovat, protože se upravují prováděcími akty i novelami.

### 12.1 Velký obraz
Evropa se posouvá od „každá země a každý dodavatel po svém“ k **povinné interoperabilitě**. Hlavním motorem je **EHDS**, technickým jazykem je **HL7 FHIR**.

### 12.2 Klíčová regulace

| Předpis | Co přináší | Dopad na TheraHUB |
|---|---|---|
| **EHDS** – Nařízení (EU) 2025/327 o evropském prostoru pro zdravotní data | Účinné od 2025, aplikace postupně ~2027–2031. **Primární využití:** pacient má právo na přístup ke svým datům a jejich sdílení; systémy elektronických zdravotních záznamů (EHR) musí mít harmonizované komponenty (interoperabilita + logování) a projít certifikací. Prioritní kategorie dat: pacientský souhrn, e-recept a výdej, laboratorní výsledky, obrazová dokumentace a zprávy, propouštěcí zprávy. **Sekundární využití:** subjekty pro přístup ke zdravotním datům, datová povolení, bezpečná zpracovatelská prostředí, právo pacienta na opt-out. | Framework DATA přímo přebírá **evropský formát výměny EHR (EEHRxF)**. Science od začátku navrhnout jako kompatibilní se sekundárním využitím dle EHDS. Aplikace, které se chovají jako EHR systémy, budou potřebovat EHDS certifikaci – TheraHUB jim ji usnadní. |
| **AI Act** – Nařízení (EU) 2024/1689 | Povinnosti pro vysoce rizikovou AI (vč. AI ve zdravotnických prostředcích) nabíhají v letech 2026–2027; termíny jsou předmětem úprav v rámci tzv. digitálního omnibusu. | Pilíř SAFETY: dokumentace modelu, lidský dohled, monitoring po nasazení; validátor workflow hlídá lidský krok. |
| **MDR / IVDR** | Software jako zdravotnický prostředek; probíhá revize evropského rámce. | Pilíř SAFETY. |
| **NIS2** (v ČR zákon č. 264/2025 Sb., o kybernetické bezpečnosti) | Povinnosti nemocnic včetně bezpečnosti dodavatelského řetězce. | Pilíř SECURITY, bezpečnostní příloha smluv. |
| **Cyber Resilience Act** – Nařízení (EU) 2024/2847 | Bezpečnost produktů s digitálními prvky; hlášení zranitelností od 2026, plné povinnosti od prosince 2027. Zdravotnické prostředky pod MDR jsou vyňaty, ostatní software ne. | SBOM a správa zranitelností jsou v Frameworku povinné už teď. |
| **eIDAS 2.0** – evropská peněženka digitální identity | Do konce roku 2026 mají členské státy nabídnout peněženku digitální identity. | Podpisy smluv, identita lékařů, výhledově souhlasy pacientů. |
| **Data Act** | Přístup k datům z připojených zařízení (wearables, zdravotnická technika). | Telemonitoring a zařízení v App Store. |
| **Česko: zákon č. 325/2021 Sb., o elektronizaci zdravotnictví** | Národní infrastruktura elektronického zdravotnictví a národní standardy interoperability. | České FHIR profily (HL7 CZ) jsou základ pilíře DATA. |

### 12.3 Technické standardy

| Standard | Stav a směr | Role v TheraHUB |
|---|---|---|
| **HL7 FHIR R4** | dnešní průmyslový standard, většina implementací | základ všech rozhraní |
| **FHIR R5 / R6** | R5 vydáno 2023; R6 se připravuje jako výrazně normativní verze | architektura připravená na více verzí FHIR souběžně (verze v manifestu aplikace) |
| **HL7 Europe FHIR IG** (Base, Patient Summary, Laboratory Report, Hospital Discharge Report, Imaging Report, ePrescription) | vznikají jako technický podklad EEHRxF (projekty Xt-EHR) | přebírat přednostně před vlastními profily |
| **HL7 CZ FHIR IG** (CZ Core a odvozené) | české národní profily | závazné pro české nemocnice |
| **IPS** – International Patient Summary (ISO 27269) | globální standard pacientského souhrnu, základ evropského | podpora v Node |
| **SMART on FHIR 2.x**, SMART Backend Services | standard autorizace a spouštění aplikací | autorizace v Node |
| **CDS Hooks** | rozhodovací podpora přímo v NIS | Workflow, AI aplikace |
| **FHIR Subscriptions (topic-based)** | události v reálném čase | spouštěče Workflow |
| **FHIR Bulk Data ($export)** | hromadný export | Science, analytika |
| **IHE profily** (MHD, PIXm, PDQm, BALP pro audit) | ověřené vzory pro dokumenty, identitu, audit | audit log, výměna dokumentů |
| **DICOM / DICOMweb** | standard obrazové dokumentace | radiologické aplikace |
| **openEHR** | archetypy pro klinická úložiště dat; roste v několika evropských regionech | kompatibilita: Node umí převádět z/do FHIR, pokud nemocnice openEHR používá |
| **OMOP CDM (OHDSI)** | standard pro výzkum na reálných datech (EHDEN, DARWIN EU) | výzkumná vrstva Science |
| **SNOMED CT, LOINC, MKN-11, ATC, EDQM, UCUM** | terminologie; přechod na MKN-11 se v Evropě postupně připravuje | terminologický server v Node, mapování |
| **SMART Health Links** | sdílení dat pacientem přes odkaz / QR | budoucí pacientské aplikace |

### 12.4 Co z toho plyne pro návrh (future-proof pravidla)
1. **Evropské profily mají přednost** před vlastními. Vlastní profil TheraHUB vznikne jen tam, kde evropský ani český neexistuje, a bude navržen tak, aby se dal později nahradit.
2. **Verze FHIR jsou parametr**, ne natvrdo zadrátovaný předpoklad.
3. **Logování ve formátu kompatibilním s EHDS** (IHE BALP / FHIR AuditEvent) od prvního dne.
4. **Science je od začátku navržena jako budoucí bezpečné zpracovatelské prostředí** podle EHDS – s datovými povoleními, opt-outem pacienta a kontrolou výstupů.
5. **Framework se verzuje a mapuje na předpisy** – u každého požadavku je uvedeno, ze kterého předpisu nebo standardu plyne, aby šel rychle aktualizovat.
6. **Sledování legislativy je služba platformy** – změna předpisu → změna Frameworku → upozornění dotčeným dodavatelům a nemocnicím.

---

## 13. Veřejné zakázky

Online smlouva **nenahrazuje** zákon o zadávání veřejných zakázek. Platforma zakázky **usnadňuje, ne obchází**.

| Cesta | Kdy | Role TheraHUB |
|---|---|---|
| **Zakázka malého rozsahu (VZMR)** | piloty a menší nasazení pod zákonným limitem (aktuální limit ověřit) | katalog = průzkum trhu; podklady pro poptávku více dodavatelům |
| **Dynamický nákupní systém (DNS)** | opakované nákupy standardizovaných řešení | **hlavní dlouhodobý model:** kvalifikační kritéria DNS = Framework, kvalifikace dodavatele = certifikace TheraHUB |
| **Rámcová dohoda / centralizované zadávání** | skupiny nemocnic, kraj, ministerstvo | technická specifikace z Frameworku |
| **Inovační partnerství / předobchodní zadávání** | řešení, která na trhu ještě nejsou | formulace potřeby a propojení se startupy |
| **Soukromé nemocnice** | ZZVZ se neuplatní | přímá online smlouva |

**Zadávací dokumentace se generuje z profilu nemocnice** (včetně schválených smluvních variant) a **kvalifikace se dokládá certifikací TheraHUB**.

> ⚠️ TheraHUB sám zakázky nezadává. Zda smí vystupovat jako administrátor zakázek pro nemocnice, je otázka na právní analýzu.

---

## 14. Organizace a governance

- **Právní forma:** k prověření – zapsaný ústav (z. ú.) nebo spolek (z. s.).
- **Správní rada:** převaha zástupců nemocnic, dále akademie, pacientské organizace, nezávislí odborníci.
- **Standardizační komise:** spravuje Framework, smluvní moduly a FHIR profily – otevřeně a s veřejným připomínkováním.
- **Etický a klinický výbor:** AI, safety, výzkum.
- **Dodavatelé** mají hlas poradní, ne rozhodovací.
- **Financování (nákladové):** certifikační poplatky (startupy méně), členské příspěvky nemocnic, granty (EU programy pro digitální zdravotnictví, národní zdroje). **Žádné provize z obchodů.**
- **Nezávislost:** otevřené standardy, platforma ukazuje fakta a kompatibilitu, ne doporučení; střet zájmů v certifikaci je vyloučen.

---

## 15. Role

| Role | Co dělá |
|---|---|
| Nemocnice – admin | profil, uživatelé, schvalovací workflow |
| Nemocnice – klinik / manažer | App Store, sandbox, žádosti o pilot, Workflow |
| Nemocnice – DPO, KB manažer, právník | schvalují varianty a smlouvy, vidí audit a compliance |
| Nemocnice – IT | Node, NIS profil, readiness, hosting |
| Nemocnice – věda a výzkum, etická komise | Science, schvalování projektů |
| Výzkumník | návrh projektu, feasibility, analýza v SPE / federovaně |
| Dodavatel / startup | profil, certifikace, nabízené varianty, poptávky, hodnocení |
| TheraHUB – certifikace a dohled | hodnocení dodavatelů, odznaky |
| TheraHUB – správce Frameworku | standard, moduly, profily, sledování legislativy |
| Důvěryhodná třetí strana | pseudonymizační klíče pro propojení mezi nemocnicemi |

---

## 16. Příběhy end-to-end

### 16.1 Nasazení aplikace
1. Primář kardiologie hledá telemonitoring. Ze 3 aplikací má jedna 🟢 pravidla, 🟢 smlouvu i 🟢 readiness s jejich NIS a už ji provozují 2 nemocnice se stejným NIS (hodnocení 4,6/5).
2. Vyzkouší ji v sandboxu.
3. **Požádá o pilot** → pilotní smlouva vznikne z průniku variant; jediné kritérium „po schválení“ (anonymizovaná data pro zlepšení produktu) jde k DPO.
4. DPO schválí, ředitel podepíše elektronicky.
5. Node automaticky zapne přístup k datům pro jedno oddělení na 3 měsíce.
6. Pilot splní kritéria → podklady pro DNS → produkční smlouva → aplikace se objeví v Dashboardu jako „produkce“.

### 16.2 Workflow
Kardiologie z workflow store převezme šablonu „Péče po infarktu“ od jiné nemocnice. Validátor ukáže, že chybí smlouva s aplikací na edukaci pacientů a že AI krok potřebuje lidské potvrzení. Po doplnění workflow běží.

### 16.3 Výzkum napříč nemocnicemi
Výzkumnice z fakultní nemocnice navrhne studii o rehospitalizacích po infarktu. Feasibility dotaz ukáže 1 240 pacientů v 5 nemocnicích. Research agreement vznikne z variant, které nemocnice schválily („pseudonymizovaná data, federovaná analýza, společné spoluautorství“). Po schválení etickými komisemi běží analýza federovaně nad OMOP daty – data nikdy neopustí nemocnice, ven jdou jen výsledky.

---

## 17. Rizika

| Riziko | Mitigace |
|---|---|
| Nedůvěra nemocnic k nové neziskovce | zakládající nemocnice ve správní radě, otevřený standard, spolupráce s MZ ČR, NÚKIB, ÚZIS |
| Dodavatelé NIS budou blokovat integraci | začít tam, kde je spolupráce možná; argument EHDS a právo nemocnice na vlastní data; sdílené adaptéry |
| Rozpor se ZZVZ | engine nikdy neobchází zadávací řízení; právní analýza; DNS jako hlavní model |
| Odpovědnost za certifikaci | jasně definovat, co certifikace znamená; pojištění; externí auditoři |
| Licenční závislost na IRIS | standardní rozhraní, vyměnitelný uzel, partnerství s InterSystems |
| Slepice-vejce | start s 2–3 nemocnicemi a 5–10 startupy podle jejich reálných potřeb |
| Reidentifikace ve výzkumu | pseudonymizace v Node, projektové pseudonymy, důvěryhodná třetí strana, kontrola výstupů, federace jako výchozí režim |
| Manipulace s hodnocením | hodnotí jen ověřené nemocnice se smlouvou; objektivní metriky z provozu |
| Platforma jako úzké hrdlo | automatizace od začátku: self-assessment, conformance testy, policy as code |
| Změny regulace | Framework mapovaný na předpisy, sledování legislativy jako služba |

---

## 18. Mimo rozsah (vědomě nebudeme dělat)

- Nestaneme se NIS ani jeho náhradou.
- Nebudeme centrálně shromažďovat zdravotní data.
- Nebudeme brát provize z obchodů ani prodávat data.
- Nebudeme vydávat CE značení ani nahrazovat notifikované osoby nebo úřady – certifikace TheraHUB je doplňková.

---

## 19. Otevřené otázky

1. **Rozsah první verze:** začít jen s aplikacemi, které nejsou zdravotnickým prostředkem, a MDR/AI přidat později?
2. **Právní forma** neziskovky a **zakládající partneři** (zatím žádní – hledáme).
3. **Licence IRIS** – jednání s InterSystems.
4. **Důvěryhodná třetí strana** pro pseudonymizaci – kdo (univerzita, ÚZIS, specializovaná firma)?
5. **Pacientské aplikace** – budou v App Store i aplikace pro pacienty, nebo jen pro personál?
6. **Geografie** – nejprve ČR, později SK a EU?
7. **Role TheraHUB v zakázkách** – jen nástroj, nebo i administrátor?

---

## 20. Cesta k endgame – po jednom kroku

Každý krok má jasný výstup, dá se dokončit samostatně a před dalším krokem ho zhodnotíme. Software stavíme tak, aby se dal ukázat nemocnicím a startupům co nejdřív – i před prvním reálným napojením.

### Fáze 1 – Základy (dokumenty a datové modely)
- **1.1** Framework v1.0 – 6 pilířů, úrovně, kontrolní seznamy, mapování na předpisy.
- **1.2** Schéma compliance profilu aplikace (vč. funkcí, datových požadavků, nabízených variant).
- **1.3** Schéma profilu nemocnice (vč. NIS, matice dostupnosti dat, hostingu, schválených variant).
- **1.4** Katalog smluvních modulů, kritérií a variant (Licence, GDPR, Security, Research, Pilot).
- **1.5** TheraHUB FHIR Implementation Guide v0.1 – postavený na HL7 Europe a HL7 CZ.

### Fáze 2 – App Store MVP (centrální část)
- **2.1** Kostra aplikace (navigace, design systém) a klikací prototyp klinického pracovního prostoru (kap. 6.3) na demo datech. ✅ *(prototyp)*
- **2.2** Katalog aplikací + karta aplikace.
- **2.3** Profil dodavatele a aplikace (formuláře podle schématu 1.2).
- **2.4** Profil nemocnice (formuláře podle schématu 1.3, šablony).
- **2.5** Matching engine: pravidla → semafor.
- **2.6** Matching engine: průnik smluvních variant.
- **2.7** Matching engine: readiness vůči NIS (deklarovaná data).
- **2.8** Compatibility report (PDF).
- **2.9** Generování smlouvy z variant + schvalovací workflow.

### Fáze 3 – Sandbox
- **3.1** IRIS for Health FHIR server se syntetickými daty v českých profilech.
- **3.2** SMART on FHIR spouštění aplikací v sandboxu.
- **3.3** Automatické conformance testy.

### Fáze 4 – Dashboard a hodnocení
- **4.1** Dashboard nemocnice (aplikace, smlouvy, compliance, termíny).
- **4.2** Dashboard dodavatele.
- **4.3** Ověřená hodnocení a „kde běží“.

### Fáze 5 – První reálný Node
- **5.1** TheraHUB Node v pilotní nemocnici.
- **5.2** Adaptér na její NIS (read-only, omezený rozsah) + automatické měření dostupnosti dat.
- **5.3** Autorizace řízená smlouvou, policy enforcement, audit log.
- **5.4** První pilot jedné aplikace na jednom oddělení.

### Fáze 6 – Workflow
- **6.1** Model workflow (FHIR PlanDefinition / Task) a validátor.
- **6.2** Vizuální editor.
- **6.3** Spouštění v Node (Subscriptions, HL7 v2 události).
- **6.4** Workflow store (sdílené šablony).

### Fáze 7 – Science
- **7.1** Převod FHIR → OMOP v Node.
- **7.2** Federovaný feasibility dotaz (jen počty).
- **7.3** Research agreement z variant + schvalování.
- **7.4** Pseudonymizace s projektovými pseudonymy a důvěryhodnou třetí stranou.
- **7.5** Federovaná analýza a bezpečné zpracovatelské prostředí.

### Fáze 8 – Škálování
- Elektronický podpis a registr smluv, podklady pro DNS, další NIS adaptéry, další nemocnice, EHDS certifikace, SK / EU.

---

## Slovníček

- **FHIR** – HL7 Fast Healthcare Interoperability Resources, standard výměny zdravotních dat přes REST API.
- **SMART on FHIR** – standard autorizace a spouštění aplikací nad FHIR (OAuth 2.0).
- **IRIS for Health** – datová a integrační platforma InterSystems s nativní podporou FHIR.
- **NIS** – nemocniční informační systém.
- **NIS2** – evropská směrnice o kybernetické bezpečnosti (v ČR zákon č. 264/2025 Sb.).
- **EHDS** – European Health Data Space, Nařízení (EU) 2025/327.
- **EEHRxF** – evropský formát výměny elektronických zdravotních záznamů.
- **IPS** – International Patient Summary.
- **OMOP CDM** – společný datový model pro výzkum (OHDSI).
- **SPE** – bezpečné zpracovatelské prostředí (secure processing environment).
- **DPA** – smlouva o zpracování osobních údajů (čl. 28 GDPR).
- **DPIA** – posouzení vlivu na ochranu osobních údajů (čl. 35 GDPR).
- **MDR** – Nařízení (EU) 2017/745 o zdravotnických prostředcích.
- **AI Act** – Nařízení (EU) 2024/1689 o umělé inteligenci.
- **CRA** – Cyber Resilience Act, Nařízení (EU) 2024/2847.
- **SBOM** – seznam softwarových komponent produktu.
- **ZZVZ** – zákon č. 134/2016 Sb., o zadávání veřejných zakázek.
- **DNS** – dynamický nákupní systém.
- **VZMR** – veřejná zakázka malého rozsahu.
- **Readiness** – připravenost aplikace k provozu s daty, která nemocnice reálně poskytuje.
