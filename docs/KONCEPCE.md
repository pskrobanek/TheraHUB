# TheraHUB – koncepce platformy

> **Stav:** pracovní koncept v0.1 (nic se zatím nestaví)
> **Účel dokumentu:** sjednotit myšlenku, pojmy a architekturu dřív, než začneme stavět – a rozdělit stavbu na malé samostatné kroky.

---

## 1. Problém, který řešíme

Startup s dobrou zdravotnickou aplikací dnes do nemocnice typicky leze 12–24 měsíců. Ne kvůli technologii, ale kvůli tomu, že **každá nemocnice znovu a jinak řeší stejné otázky**:

| Bariéra | Co to v praxi znamená |
|---|---|
| **Legal** | Každá nemocnice má vlastní smluvní vzory, právní oddělení prochází smlouvu od nuly. |
| **GDPR** | Zdravotní data = zvláštní kategorie (čl. 9). Nutná zpracovatelská smlouva (čl. 28), často DPIA (čl. 35), řešení předávání mimo EU, subdodavatelů, logování. |
| **Kybernetická bezpečnost** | Nemocnice spadají pod zákon o kybernetické bezpečnosti (transpozice NIS2). Musí řídit **bezpečnost dodavatelského řetězce** – tj. prověřovat každého dodavatele. |
| **Napojení na NIS** | Každý nemocniční informační systém má jiná rozhraní, integrace se platí znovu a znovu, dodavatel NIS je úzké hrdlo. |
| **Regulace produktu** | Software se zdravotnickým účelem = zdravotnický prostředek (MDR), u AI navíc AI Act. Nemocnice to neumí rychle ověřit. |
| **Veřejné zakázky** | Veřejné nemocnice musí postupovat podle ZZVZ (zákon č. 134/2016 Sb.). Startup neumí soutěžit, nemocnice neumí rychle nakoupit malou věc. |
| **Důvěra** | Nemocnice neví, s kým jedná – jestli firma za rok bude existovat, kde má data, kdo k nim má přístup. |

**Důsledek:** obě strany platí obrovské transakční náklady za každý jednotlivý vztah. Inovace se do nemocnic nedostávají, nebo jen do těch několika největších.

## 2. Řešení v jedné větě

**TheraHUB je neziskový „důvěryhodný prostředník“ – app store pro nemocnice, kde každá aplikace je předem prověřená proti společnému frameworku (data, bezpečnost, GDPR, regulace) a každá nemocnice má předem nastavený profil svých požadavků, takže zkoušení, smlouva i napojení probíhá standardizovaně a opakovatelně.**

Princip: **jednou se certifikuje dodavatel, jednou se nastaví nemocnice – a pak každé spojení „nemocnice × aplikace“ stojí zlomek dnešní práce.**

Z N×M jednání (každá nemocnice s každým startupem) uděláme N+M (každý se jednou napojí na společný standard).

## 3. Základní stavební kameny

```
┌────────────────────────────────────────────────────────────────────┐
│                         TheraHUB (non-profit)                      │
│                                                                    │
│  ① TheraHUB Framework   – společná pravidla (data, safety, GDPR,   │
│                           security, legal) = "ústava" platformy    │
│                                                                    │
│  ② Katalog / App Store  – certifikované aplikace + jejich          │
│                           compliance profil                        │
│                                                                    │
│  ③ Profil nemocnice     – požadavky nemocnice (legal, GDPR,        │
│                           security, technické, nákupní)            │
│                                                                    │
│  ④ Matching engine      – automaticky porovná ② a ③               │
│                           ("je aplikace X v nemocnici Y možná?")   │
│                                                                    │
│  ⑤ Sandbox & pilot      – vyzkoušení na syntetických, pak reálných │
│                           datech v řízeném režimu                  │
│                                                                    │
│  ⑥ Smluvní engine       – online smlouva z předem schválených      │
│                           modulů, elektronický podpis              │
│                                                                    │
│  ⑦ Integrační vrstva    – FHIR na InterSystems IRIS for Health,    │
│                           jeden konektor na NIS místo N konektorů  │
└────────────────────────────────────────────────────────────────────┘
```

Detailně níže.

---

## 4. ① TheraHUB Framework – společný standard

Framework je jádro celé myšlenky. Platforma bez něj je jen další marketplace. **S ním je to důkaz důvěry.**

Framework má pět pilířů. Každý pilíř má **úrovně** (např. Base / Standard / High), protože aplikace na objednávání pacientů nepotřebuje stejný režim jako AI diagnostika v radiologii.

### 4.1 Pilíř DATA (interoperabilita)
- Výměna dat výhradně přes **HL7 FHIR R4** (výhledově R5), přes české profily (HL7 CZ – CZ Core) a vlastní TheraHUB profily tam, kde národní chybí.
- Autorizace aplikací přes **SMART on FHIR** (OAuth 2.0 / OpenID Connect), granularní scopes – aplikace dostane jen ta data, která deklarovala.
- Terminologie: SNOMED CT, LOINC, MKN-10, číselníky ÚZIS/VZP tam, kde je to relevantní.
- Princip **minimalizace dat** zabudovaný v technice: aplikace deklaruje datový „manifest“ (jaké FHIR zdroje, čtení/zápis, účel), platforma pustí jen to.
- Soulad s budoucím **EHDS** (Nařízení o evropském prostoru pro zdravotní data) – ať certifikace u nás znamená náskok i v EU.

### 4.2 Pilíř SECURITY (kybernetická bezpečnost)
- Mapováno na požadavky zákona o kybernetické bezpečnosti (NIS2) a vyhlášek NÚKIB, které nemocnice musí plnit vůči dodavatelům.
- Minimální požadavky: šifrování v přenosu i v klidu, MFA, řízení přístupů, auditní logy, správa zranitelností, SBOM (seznam softwarových komponent), incident response s definovanými lhůtami hlášení, penetrační test.
- Úroveň High: ISO/IEC 27001 (nebo ekvivalent), pravidelný externí pentest, hosting výhradně v EU.
- Platforma udržuje **dodavatelský bezpečnostní dotazník jednou pro všechny** – nemocnice ho nemusí posílat znovu.

### 4.3 Pilíř GDPR / PRIVACY
- Standardní **zpracovatelská smlouva (DPA, čl. 28)** jako modul – jednou právně vyladěná, nemocnice ji jen parametrizuje.
- **Šablona DPIA** předvyplněná dodavatelem; nemocnice doplňuje jen svou část.
- Registr subdodavatelů (sub-processors), lokalita dat, předávání mimo EU (default: zakázáno nebo jen s explicitním souhlasem v profilu nemocnice).
- Role jsou jasné: nemocnice = správce, aplikace = zpracovatel, TheraHUB = ideálně **nevidí zdravotní data vůbec** (viz architektura) – tím se platforma vyhne roli zpracovatele u citlivých dat.

### 4.4 Pilíř SAFETY / REGULACE PRODUKTU
- Klasifikace aplikace: wellness / administrativní software / **zdravotnický prostředek (MDR)** – třída I, IIa, IIb, III.
- Pro zdravotnické prostředky: CE značka, prohlášení o shodě, IFU, řízení rizik (ISO 14971), životní cyklus SW (IEC 62304), ideálně ISO 13485.
- Pro AI: klasifikace dle **AI Act** (vysoce rizikové AI ve zdravotnictví), dokumentace modelu, dohled člověka, monitoring výkonu po nasazení.
- Postmarketový dohled: povinnost hlásit incidenty i do platformy → všechny nemocnice s danou aplikací se to dozví.

### 4.5 Pilíř LEGAL & BUSINESS
- Standardní smluvní moduly (viz kap. 9).
- Finanční a provozní stabilita: pojištění odpovědnosti, **exit plán** (export dat ve FHIR při ukončení), případně escrow zdrojového kódu u kritických aplikací.
- Transparentní cenotvorba ve standardní struktuře (licence / uživatel / lůžko / transakce), aby se ceny daly porovnat.

### 4.6 Výsledek pro aplikaci: Compliance profil
Každá aplikace v katalogu má strojově čitelný **compliance profil**, např.:

```yaml
app: CardioWatch
vendor: Example s.r.o.
framework_version: 1.0
levels:
  data: standard        # FHIR R4, SMART on FHIR
  security: high        # ISO 27001, pentest 2026-05
  privacy: standard     # DPA v1.0, DPIA template, EU hosting
  safety: mdr-class-IIa # CE, ISO 13485
  ai_act: high-risk
data_manifest:
  read:  [Patient, Observation(vital-signs), Encounter]
  write: [Observation, Flag]
hosting: [hospital-onprem, therahub-eu-cloud]
data_location: EU
subprocessors: [Hetzner DE]
pricing_model: per-bed-month
certified_until: 2027-10-01
```

---

## 5. ② Katalog / App Store

Pro nemocnici vypadá jako app store, pod kapotou je to **registr ověřených produktů**.

Každá karta aplikace obsahuje:
- popis, klinický use-case, cílová oddělení, reference (které nemocnice už používají),
- **compliance odznaky** (Data / Security / Privacy / Safety / AI) s úrovní a datem platnosti,
- datový manifest – co přesně aplikace z NIS čte a zapisuje,
- **„semafor kompatibility“** s profilem přihlášené nemocnice (zelená = lze nasadit hned, oranžová = chybí X, červená = v rozporu s pravidlem Y),
- tlačítka: **Vyzkoušet v sandboxu** → **Požádat o pilot** → **Uzavřít smlouvu**.

Klíčové: aplikace jsou **stand-alone** – nežijí uvnitř NIS, ale běží samostatně a s NIS mluví jen přes integrační vrstvu TheraHUB. Díky tomu nezávisí na dodavateli NIS.

---

## 6. ③ Profil nemocnice

Nemocnice si **jednou** nastaví svá pravidla. Profil je strojově čitelný (aby ho mohl číst matching engine) a zároveň srozumitelný pro právníka, DPO a manažera kyberbezpečnosti.

### 6.1 Sekce profilu

| Sekce | Příklady parametrů | Kdo vyplňuje |
|---|---|---|
| **Legal** | akceptované smluvní moduly, rozhodné právo, limit odpovědnosti, smluvní pokuty, výpovědní lhůty, požadavek pojištění | právní oddělení |
| **GDPR** | povolená lokalita dat (ČR / EU), přenos mimo EU ano/ne, schválení subdodavatelů, lhůty výmazu, povinnost DPIA | DPO (pověřenec) |
| **Security** | minimální úroveň Security pilíře, požadované certifikace, povinný pentest, lhůty hlášení incidentů, VPN/on-prem požadavky | manažer KB / CISO |
| **Safety** | povolené třídy MDR, přístup k AI (zakázáno / jen s dohledem / povoleno), požadavek klinické validace | náměstek LPP, etická komise |
| **Technika** | nasazení on-prem vs. cloud, typ NIS, dostupné FHIR zdroje, SSO (AD/Entra) | IT oddělení |
| **Nákup** | režim veřejných zakázek, limity schvalování, kdo podepisuje, interní schvalovací workflow | nákup / ekonomika |

### 6.2 Šablony profilů
Aby nemocnice nezačínala z nuly, platforma nabídne **předpřipravené šablony** (např. „Fakultní nemocnice – přísná“, „Krajská nemocnice – standard“, „Soukromá klinika“), které si nemocnice upraví. Časem z toho vznikne de facto oborový standard.

### 6.3 Pravidla = policy as code
Každé pravidlo profilu je zapsané jako vyhodnotitelná podmínka, např.:

```yaml
hospital: Nemocnice Příklad
rules:
  - id: SEC-01
    require: app.levels.security >= "standard"
  - id: GDPR-03
    require: app.data_location in ["CZ", "EU"]
  - id: GDPR-04
    require: not app.transfers_outside_eu
  - id: SAF-02
    require: app.ai_act != "high-risk" or approval("etická komise")
  - id: LEG-05
    contract_param: liability_cap = "2x roční cena"
```

---

## 7. ④ Matching engine

Srdce automatizace. Pro každou dvojici *nemocnice × aplikace* vyhodnotí:

1. **Splňuje aplikace všechna tvrdá pravidla nemocnice?** → zelená / červená.
2. **Co chybí a dá se to dořešit?** → oranžová + konkrétní seznam („chybí pentest mladší 12 měsíců“, „vyžaduje schválení etické komise“).
3. **Jaké smluvní parametry se použijí?** → podklad pro smluvní engine.
4. **Jaký nákupní postup je potřeba?** → podle odhadované ceny a profilu nemocnice (viz kap. 10).

Výstupem je **„Compatibility report“** – jeden dokument, který nemocnice může rovnou předložit vedení, DPO a KB manažerovi. Toto samo o sobě ušetří týdny.

---

## 8. ⑤ Vyzkoušení: Sandbox → Pilot → Produkce

Tři stupně se zvyšující se důvěrou:

| Stupeň | Data | Smlouva | Typická délka |
|---|---|---|---|
| **Sandbox** | pouze **syntetická data** (generovaná, např. Synthea, v českých FHIR profilech) | žádná / klikací podmínky | ihned, dny |
| **Pilot** | reálná data, omezený rozsah (1 oddělení, omezený počet pacientů / uživatelů) | **Pilotní smlouva** – standardní, krátká, s DPA | 1–3 měsíce |
| **Produkce** | plný provoz | **Provozní smlouva** – plná verze z modulů | dlouhodobě |

- Sandbox běží v infrastruktuře TheraHUB – nemocnice si aplikaci „osahá“ bez jakéhokoli rizika a bez zapojení IT.
- Pilot už běží přes integrační uzel nemocnice (kap. 11) s reálnými daty, ale s omezeným datovým manifestem.
- Přechod pilot → produkce je předem definován (kritéria úspěchu nastavená na začátku pilotu).

---

## 9. ⑥ Smluvní engine – online smlouva

### 9.1 Princip
Smlouva se **neskládá od nuly**, ale z předem právně schválených modulů. Moduly vytvoří a udržuje TheraHUB ve spolupráci s právníky nemocnic a dodavatelů (konsenzus = legitimita).

```
Smlouva = Rámcové podmínky TheraHUB (společné pro všechny)
        + Modul: Licence / SaaS
        + Modul: DPA (zpracování osobních údajů)
        + Modul: Bezpečnostní příloha (NIS2 požadavky na dodavatele)
        + Modul: SLA (dostupnost, podpora, lhůty)
        + Modul: Zdravotnický prostředek / AI (pokud relevantní)
        + Modul: Exit plán a export dat
        + Parametry z profilu nemocnice (limity, pokuty, lhůty)
        + Parametry z nabídky dodavatele (cena, rozsah)
```

### 9.2 Workflow
1. Matching engine vygeneruje návrh smlouvy s parametry.
2. Dodavatel potvrdí (parametry v rámci jeho akceptovaných rozsahů = automaticky).
3. Nemocnice projde **interní schvalovací workflow** definované v profilu (DPO ✓, KB manažer ✓, právník ✓, ředitel ✓).
4. Podpis **kvalifikovaným elektronickým podpisem** (eIDAS).
5. **Zveřejnění v registru smluv** (zákon č. 340/2015 Sb.) – nad 50 000 Kč bez DPH je to u veřejných nemocnic povinné; platforma to může připravit automaticky.
6. Smlouva je uložena, platforma hlídá termíny (expirace certifikace, obnovy, výpovědní lhůty).

### 9.3 Proč to funguje
Právník nemocnice nekontroluje 40stránkovou smlouvu, ale jen **odchylky od schváleného standardu** – a ty jsou ve standardním případě nulové.

---

## 10. Veřejné zakázky – jak to udělat legálně

**Důležité:** online smlouva **nenahrazuje** zákon o zadávání veřejných zakázek. Platforma musí zakázky *usnadnit*, ne obcházet. Proto počítáme s několika cestami podle velikosti a typu nákupu:

| Cesta | Kdy | Role TheraHUB |
|---|---|---|
| **Zakázka malého rozsahu (VZMR)** | piloty a menší nasazení pod zákonným limitem (aktuální limit ověřit dle platného znění ZZVZ) | Katalog slouží jako průzkum trhu; platforma vygeneruje podklad pro poptávku více dodavatelům a dokumentaci pro interní směrnici nemocnice |
| **Dynamický nákupní systém (DNS)** | opakované nákupy standardizovaných řešení | **Nejvhodnější dlouhodobý model.** Kvalifikační kritéria DNS = kritéria TheraHUB Frameworku. Nemocnice (nebo centrální zadavatel) zavede DNS, certifikovaní dodavatelé se do něj kvalifikují. |
| **Rámcová dohoda / centralizované zadávání** | skupina nemocnic, kraj, ministerstvo | Platforma připraví technickou specifikaci a kvalifikaci z Frameworku |
| **Inovační partnerství / předobchodní zadávání (PCP)** | řešení, které na trhu ještě není | Platforma pomůže nemocnici formulovat potřebu a propojí ji se startupy |
| **Soukromé nemocnice / kliniky** | ZZVZ se neuplatní | Přímá online smlouva |

Klíčový trik: **zadávací dokumentace se dá generovat z profilu nemocnice** a **kvalifikace dodavatele se dá doložit certifikací TheraHUB**. Tím se soutěž zkrátí z měsíců na týdny.

> ⚠️ TheraHUB jako neziskový subjekt sám zakázky nezadává (není veřejným zadavatelem). Je to nástroj a „standard“, který zadavatelé používají. Zda může vystupovat jako administrátor zakázek pro nemocnice, je otázka na právní analýzu.

---

## 11. ⑦ Technická architektura (FHIR + IRIS)

### 11.1 Hlavní princip: data zůstávají v nemocnici
TheraHUB **centrálně neshromažďuje zdravotní data**. Centrální část řeší katalog, certifikace, profily, smlouvy. Zdravotní data tečou jen mezi **uzlem v nemocnici** a **aplikací**.

```
                     ┌──────────────────────────────────┐
                     │      TheraHUB Central (cloud EU) │
                     │  katalog · profily · matching ·  │
                     │  smlouvy · certifikace · sandbox │
                     │  (BEZ reálných zdravotních dat)  │
                     └──────────────┬───────────────────┘
                                    │ konfigurace, politiky,
                                    │ registr aplikací, audit metadata
          ┌─────────────────────────┼──────────────────────────┐
          ▼                         ▼                          ▼
┌───────────────────┐     ┌───────────────────┐      ┌───────────────────┐
│ Nemocnice A       │     │ Nemocnice B       │      │ Nemocnice C       │
│ ┌───────────────┐ │     │ ┌───────────────┐ │      │                   │
│ │ TheraHUB Node │ │     │ │ TheraHUB Node │ │      │       ...         │
│ │ (IRIS for     │ │     │ │ (IRIS for     │ │      │                   │
│ │  Health)      │ │     │ │  Health)      │ │      │                   │
│ │ • FHIR server │ │     │ │               │ │      │                   │
│ │ • SMART auth  │ │     │ │               │ │      │                   │
│ │ • policy/     │ │     │ │               │ │      │                   │
│ │   consent     │ │     │ │               │ │      │                   │
│ │ • audit log   │ │     │ │               │ │      │                   │
│ └──┬────────▲───┘ │     │ └───────────────┘ │      │                   │
│    │ HL7v2, │     │     │                   │      │                   │
│    │ DB,API │     │     │                   │      │                   │
│ ┌──▼────────┴───┐ │     │                   │      │                   │
│ │   NIS         │ │     │                   │      │                   │
│ └───────────────┘ │     │                   │      │                   │
└────────▲──────────┘     └───────────────────┘      └───────────────────┘
         │ FHIR API (SMART on FHIR, jen datový manifest)
┌────────┴──────────┐
│  Aplikace         │  běží buď v nemocnici (kontejner na Node),
│  (startup)        │  nebo jako SaaS v EU cloudu dodavatele
└───────────────────┘
```

### 11.2 Proč InterSystems IRIS for Health
- Nativní **FHIR server** a FHIR transformace (HL7 v2 → FHIR, CDA → FHIR, SQL → FHIR).
- **Interoperabilní engine** (dříve Ensemble/HealthShare) – umí mluvit se starými NIS přes HL7 v2, databázové pohledy, soubory, SOAP/REST.
- V českých nemocnicích už technologie InterSystems historicky existuje → známé prostředí pro IT.
- Jeden „TheraHUB adaptér“ pro každý typ NIS se napíše **jednou** a použije ve všech nemocnicích s tímto NIS.

> Otevřená otázka: licenční model IRIS pro neziskovou platformu a uzly v nemocnicích – nutno vyjednat s InterSystems (partnerství / komunitní licence / Health Connect). Architekturu držet tak, aby rozhraní byla čistě FHIR a uzel byl teoreticky vyměnitelný.

### 11.3 Komponenty TheraHUB Node
1. **NIS adaptér** – převod z NIS do FHIR (per typ NIS, sdílený napříč nemocnicemi).
2. **FHIR fasáda** – jednotné API pro aplikace.
3. **Autorizační server (SMART on FHIR)** – aplikace dostane token jen se scopes ze svého manifestu a ze smlouvy.
4. **Policy enforcement** – vynucuje pravidla z profilu nemocnice za běhu (např. „aplikace X nesmí číst diagnózy psychiatrie“).
5. **Audit log** – každý přístup aplikace k datům, nepodvržitelně; nemocnice ho vidí, DPO ho může exportovat.
6. **SSO** – napojení na identitu nemocnice (AD / Entra ID), uživatel se nepřihlašuje zvlášť do každé aplikace.
7. **App runtime (volitelně)** – kontejnery pro aplikace provozované on-prem.

### 11.4 Vazba smlouvy na techniku
Velmi silný prvek: **smlouva přímo řídí přístupová práva.** Po podpisu smlouvy se v uzlu automaticky aktivují scopes dle datového manifestu. Po skončení smlouvy se přístup automaticky vypne. Pilotní smlouva = pilotní rozsah dat. Žádná ruční konfigurace, žádné „zapomenuté“ přístupy.

---

## 12. Certifikace dodavatelů (onboarding startupu)

1. **Registrace** a základní due diligence firmy (IČO, majitelé, sankční seznamy, pojištění).
2. **Self-assessment** proti Frameworku (online dotazník + nahrání dokumentů).
3. **Technická validace** – automatické testy proti FHIR profilům a SMART on FHIR v sandboxu (conformance testy).
4. **Review** – bezpečnostní a privacy review (interní tým nebo akreditovaní externí auditoři).
5. **Vydání odznaků** s platností (např. 12 měsíců) + průběžný monitoring (expirace certifikátů, hlášené incidenty, zranitelnosti v SBOM).
6. **Recertifikace** při významné změně produktu.

Cílem je, aby startup prošel certifikací **jednou za rok**, místo aby vyplňoval bezpečnostní dotazníky pro každou nemocnici zvlášť.

---

## 13. Organizace a governance (non-profit)

### 13.1 Právní forma
Doporučení k prověření: **zapsaný ústav (z. ú.)** – vhodný pro provozování obecně prospěšné služby se správní radou. Alternativa: **spolek (z. s.)** s členy (nemocnice, asociace startupů, akademie).

### 13.2 Řízení
- **Správní rada** – zástupci nemocnic (převaha), akademie, pacientských organizací, nezávislí odborníci.
- **Technická a standardizační komise** – spravuje Framework (otevřeně, verzovaně, s veřejným připomínkováním).
- **Etický / klinický poradní výbor** – AI, safety.
- **Dodavatelé** mají hlas poradní, ne rozhodovací – aby platforma nebyla vnímána jako lobby startupů.

### 13.3 Financování (nákladové, ne ziskové)
- Certifikační poplatky dodavatelů (odstupňované – startup platí méně).
- Členské příspěvky nemocnic (symbolické nebo dle velikosti).
- Granty a veřejné zdroje (EU programy pro digitální zdravotnictví, národní programy pro elektronizaci zdravotnictví, TA ČR apod.).
- **Žádná provize z obchodů** – kvůli nezávislosti i kvůli veřejným zakázkám.

### 13.4 Nezávislost a důvěra
- Framework, smluvní moduly a FHIR profily jsou **veřejné a otevřené** (open standard).
- Platforma nedoporučuje konkrétní produkty – zobrazuje fakta a kompatibilitu.
- Střet zájmů: osoby z dodavatelů nesedí v certifikačních rozhodnutích.

---

## 14. Uživatelské role

| Role | Co dělá na platformě |
|---|---|
| **Nemocnice – admin** | spravuje profil, uživatele, schvalovací workflow |
| **Nemocnice – klinik / manažer** | prochází katalog, zkouší sandbox, žádá o pilot |
| **Nemocnice – DPO, KB manažer, právník** | schvalují v workflow, vidí audit logy a compatibility reporty |
| **Nemocnice – IT** | provozuje TheraHUB Node, schvaluje technické nasazení |
| **Dodavatel / startup** | spravuje profil firmy a aplikace, prochází certifikací, odpovídá na poptávky |
| **TheraHUB – certifikační tým / auditor** | hodnotí dodavatele, vydává odznaky |
| **TheraHUB – správce Frameworku** | verzuje standard, smluvní moduly a FHIR profily |

---

## 15. Uživatelská cesta – příklad end-to-end

> *Kardiologie Nemocnice Příklad chce aplikaci pro vzdálený monitoring pacientů po infarktu.*

1. Primář otevře TheraHUB, filtruje „kardiologie / telemonitoring“. Vidí 3 aplikace; 2 mají **zelený semafor** vůči profilu nemocnice.
2. Klikne **Vyzkoušet** → během minut pracuje v sandboxu se syntetickými pacienty.
3. Klikne **Požádat o pilot** → matching engine vygeneruje *compatibility report* + **pilotní smlouvu** + doporučený nákupní postup (VZMR).
4. Workflow: DPO schválí (DPA je standardní, data v EU ✓), KB manažer schválí (Security High ✓), právník vidí „0 odchylek od standardu“ ✓, ředitel podepíše elektronicky.
5. Po podpisu se v TheraHUB Node automaticky aktivuje přístup aplikace k datovému manifestu pro 1 oddělení na 3 měsíce.
6. Pilot běží, audit log je dostupný DPO.
7. Pilot splnil kritéria → platforma připraví podklady pro **DNS / zakázku** na produkční nasazení, kvalifikace dodavatele = certifikace TheraHUB.
8. Produkční smlouva, rozšíření scopes, provoz.

**Cíl:** z 12–24 měsíců na **týdny pro pilot** a **jednotky měsíců pro produkci**.

---

## 16. Hlavní rizika a jak je řešit

| Riziko | Mitigace |
|---|---|
| Nemocnice nebudou důvěřovat nové neziskovce | Zakládající nemocnice ve správní radě od začátku; otevřený standard; spolupráce s MZ ČR / NÚKIB / ÚZIS |
| Dodavatelé NIS budou blokovat integraci | Začít s NIS, kde je spolupráce možná; argumentace EHDS a právem nemocnice na přístup k vlastním datům; adaptéry jako sdílená investice |
| Online smlouva bude v rozporu se ZZVZ | Smluvní engine nikdy neobchází zadávací řízení; právní analýza před spuštěním; DNS jako hlavní model |
| Odpovědnost platformy za certifikaci | Jasně definovat, co certifikace znamená a co ne; pojištění; akreditovaní externí auditoři pro vyšší úrovně |
| Licenční závislost na IRIS | Rozhraní čistě FHIR; uzel vyměnitelný; vyjednat partnerství s InterSystems |
| Slepice-vejce (bez aplikací nepřijdou nemocnice a naopak) | Start s 2–3 pilotními nemocnicemi a 5–10 vybranými startupy; nemocnice si řeknou, jaké problémy chtějí řešit |
| Platforma se stane úzkým hrdlem | Automatizace (self-assessment, conformance testy, policy as code) od začátku |

---

## 17. Plán postupu – „one step at a time“

Každý krok má jasný výstup a dá se dokončit samostatně.

### Fáze 0 – Koncept a validace (bez kódu)
- **0.1** Tento dokument – sjednocení konceptu ✅ *(probíhá)*
- **0.2** Rozhovory: 3–5 nemocnic (IT, DPO, KB manažer, nákup, právník) + 5–10 startupů → ověřit bolesti a priority.
- **0.3** Právní analýza: forma neziskovky, ZZVZ (DNS, VZMR), role platformy vůči GDPR, odpovědnost za certifikaci.
- **0.4** Jednání s InterSystems (licence) a s 1–2 dodavateli NIS.

### Fáze 1 – Framework v1 (dokumenty, ne software)
- **1.1** Framework v1.0: 5 pilířů, úrovně, kontrolní seznamy.
- **1.2** Datový model: compliance profil aplikace (schema) a profil nemocnice (schema).
- **1.3** Smluvní moduly v1 (rámcové podmínky, DPA, bezpečnostní příloha, SLA, exit).
- **1.4** TheraHUB FHIR Implementation Guide v0.1 (které zdroje, profily, scopes).

### Fáze 2 – MVP platformy (centrální část)
- **2.1** Katalog aplikací (veřejný výpis + detail karty).
- **2.2** Registrace dodavatele + self-assessment.
- **2.3** Profil nemocnice (formulář + šablony).
- **2.4** Matching engine v1 + compatibility report (PDF).
- **2.5** Generování smlouvy z modulů (zatím bez elektronického podpisu).

### Fáze 3 – Sandbox
- **3.1** IRIS for Health FHIR server se syntetickými daty (české profily).
- **3.2** SMART on FHIR launch pro aplikace v sandboxu.
- **3.3** Automatické conformance testy aplikací.

### Fáze 4 – První reálný uzel
- **4.1** TheraHUB Node v jedné pilotní nemocnici.
- **4.2** Adaptér na její NIS (read-only, omezený rozsah).
- **4.3** Audit log + policy enforcement.
- **4.4** První pilot jedné aplikace na jednom oddělení.

### Fáze 5 – Škálování
- Elektronický podpis, workflow schvalování, registr smluv, DNS podklady, další NIS adaptéry, další nemocnice.

---

## 18. Otevřené otázky k rozhodnutí

1. **Název a právní forma** – TheraHUB? Zapsaný ústav, nebo spolek?
2. **„NIS“ v zadání** – rozumím jako *nemocniční informační systém* (integrace) a zároveň řešíme *NIS2* (kyberbezpečnost). Sedí to?
3. **Kdo jsou zakládající partneři** – máme konkrétní nemocnice / startupy pro fázi 0?
4. **Hosting aplikací** – preferujeme, aby aplikace běžely on-prem v nemocnici (bezpečnější, pomalejší rozjezd), nebo jako SaaS v EU cloudu (rychlejší)? Návrh: obojí, default SaaS v EU.
5. **Rozsah v1** – začít jen s aplikacemi, které **nejsou zdravotnickým prostředkem** (administrativa, logistika, komunikace s pacientem), a MDR/AI přidat ve v2? Výrazně by to zrychlilo start.
6. **Pacientská strana** – budou v katalogu i aplikace pro pacienty (napojené přes nemocnici), nebo jen pro personál?
7. **Geografie** – nejprve ČR, později SK / EU (EHDS)?

---

## Slovníček

- **FHIR** – HL7 Fast Healthcare Interoperability Resources, moderní standard výměny zdravotních dat přes REST API.
- **SMART on FHIR** – standard, jak se aplikace autorizuje a spouští nad FHIR daty (OAuth 2.0).
- **IRIS for Health** – datová a integrační platforma InterSystems s nativní podporou FHIR.
- **NIS** – nemocniční informační systém.
- **NIS2** – evropská směrnice o kybernetické bezpečnosti, v ČR transponovaná novým zákonem o kybernetické bezpečnosti.
- **DPA** – smlouva o zpracování osobních údajů (čl. 28 GDPR).
- **DPIA** – posouzení vlivu na ochranu osobních údajů (čl. 35 GDPR).
- **MDR** – Nařízení EU 2017/745 o zdravotnických prostředcích.
- **AI Act** – Nařízení EU 2024/1689 o umělé inteligenci.
- **EHDS** – Nařízení o evropském prostoru pro zdravotní data.
- **ZZVZ** – zákon č. 134/2016 Sb., o zadávání veřejných zakázek.
- **DNS** – dynamický nákupní systém (§ 138 a násl. ZZVZ).
- **VZMR** – veřejná zakázka malého rozsahu.
