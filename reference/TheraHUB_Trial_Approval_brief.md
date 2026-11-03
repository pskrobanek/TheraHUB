# TheraHUB App Store — Trial Request & Approval: Build Brief

3. 11. 2026 · @Pavel

> Uloženo do repozitáře pro další session. Text je převzatý ze zadání beze změny obsahu; jen převedený do Markdownu.
> Diagram „Preset A as seeded“ (§5.4) v originále byl obrázek, zde není.
> Rozhodnutí k tomuto briefu (terminologie „pilotní provoz“, FN Demo, Adoption index, repozitář) jsou v `docs/DECISIONS.md`.

## 0. How to use this brief

This brief adds the trial request and approval module to the TheraHUB app store. Paste it as the first message to the coding agent, together with the OncoReady build brief (`OncoReady_AI_build_prompt.md`) in `/reference`. Reuse that brief's stack, conventions, documentation set and quality bar; this brief overrides it only where it says so.

Your role: a senior full-stack engineer and product designer who has shipped workflow, procurement or GRC software for public hospitals in the EU. Hospital lawyers, the DPO and the IT security manager must accept the result on first review.

### Working rules

1. Read this brief, the OncoReady brief and everything in `/reference`. Reply with your understanding (at most 15 bullets), open questions split into blocking and non-blocking, and the phase plan from §14 with proposed changes. Wait for my answers.
2. Work in phases. Stop after each one and report what was built, how to demo it, test results and deviations.
3. Never invent legal, GDPR or security requirement content. Requirement presets, contract templates and thresholds are configuration with obviously fake placeholders, marked `TODO(legal)`, `TODO(dpo)` or `TODO(security)` in code and in `docs/OPEN_QUESTIONS.md`.
4. The system prepares, people decide. No step completes without a named human decision, except where a hospital has explicitly enabled an auto-clear rule (§8). Every automatic completion is logged with the rule version.
5. Seed data is fictional (Nemocnice Demo, Startup Demo s.r.o.). No real hospital or vendor documents in the repository.
6. Maintain `docs/DECISIONS.md`, `docs/OPEN_QUESTIONS.md`, `docs/RISKS.md` and `docs/REQUIREMENTS.md` with IDs such as REQ-MAT-004 (matching), REQ-WFL-012 (workflow) or REQ-TRL-020 (trial), referenced from tests.
7. Scope discipline: build what is specified and keep a list of ideas for me.

## 1. Product in one paragraph

A physician finds an app in the TheraHUB app store, sees at once how well it meets their own hospital's requirements, and asks for a free trial in one click. The platform then runs the approval chain that the hospital has configured, so that people only review and decide.

TheraHUB is a consortium and app store of digital-health apps (for example OncoReady, Auris One, Kardi AI). Its core value for hospitals is matching the hospital's requirements against each vendor's parameters once, instead of every new tool going through its own round of contracts, DPA, security questionnaires and e-mails.

**Today:** a trial means e-mails, Word attachments, the same questionnaire answered again for every hospital, and nobody knows where the request is stuck.

**Target:**

- The vendor fills a standardised compliance dossier once, with evidence documents.
- The hospital defines its requirement profile once, in four domains: Legal, GDPR, Security, Ostatní (Others).
- Matching is automatic and explained item by item: where the app complies and where it does not.
- The request travels through the hospital's configurable approval chain. Each reviewer gets a ready document pack for their domain, decides and forwards it.
- Everyone can see which step the request is in, who has it now and who is next.

The module must deliver three outcomes:

1. Transparency for the requester: where the request is, who is next, how long each step takes.
2. Less work for reviewers: they see only the gaps and open items in their domain, each with its evidence.
3. Speed: parallel reviews, automatic chasing of the vendor, and evidence reused across hospitals.

**Autonomy principle:** automate everything except judgement. The system collects, matches, routes, reminds, drafts and records; named experts review and decide.

## 2. Users and roles

Roles are scoped to a hospital (tenant) and, where relevant, to a department. Assignees are resolved from the hospital's org structure, never typed in by hand.

| Role | Czech label | What they do |
|---|---|---|
| Requester | Žadatel (lékař) | Finds the app, submits the request, supplies clinical context and KPIs. Becomes the trial guarantor (odborný garant) by default. |
| Head of department | Primář | Approves the clinical need and the department's capacity. Resolved automatically from the requester's department. |
| Deputy director / Director | Náměstek / Ředitel | Strategic and financial approval. Which of them applies is a configurable rule (e.g. by price or risk class). |
| Legal reviewer | Právník / právní oddělení | Reviews the Legal domain and the trial agreement. |
| GDPR reviewer | Pověřenec (DPO) | Reviews the GDPR domain, DPA, DPIA and sub-processors. |
| Security reviewer | Manažer kybernetické bezpečnosti / IT bezpečnost | Reviews the Security domain. |
| Others reviewer(s) | Ostatní | Configurable: IT and integration, biomedical engineering, procurement, etc. |
| Vendor | Firma / dodavatel | Maintains the dossier, answers clarifications, accepts conditions, signs, reports KPIs. Sees only its own requests and never internal comments. |
| Procurement | Nákup / veřejné zakázky | Handles the purchase step after a positive decision. |
| Hospital admin | Správce nemocnice | Org structure, users, requirement profiles, approval templates. |
| Observer | Pozorovatel | Read-only (e.g. co-requesters, quality department). |
| Platform admin | Admin TheraHUB | Maintains the requirement catalogue, verifies vendor evidence, onboards vendors. No access to hospitals' internal comments except break-glass, logged and visible to the hospital. |

**Deputies and absences:** every role holder can have a deputy (zástup) and an absence period. Tasks route to the deputy automatically during an absence and on escalation.

**Domain owners:** each of the four domains has an owner role, a deputy and optionally a team ("any one of" or "all of" must decide).

## 3. Requirements: catalogue, hospital profiles, vendor dossiers

Matching works because hospitals and vendors refer to the same catalogue of requirements with stable IDs. Hospitals choose items and set their parameters; vendors answer each item once.

### 3.1 Canonical requirement catalogue (maintained by TheraHUB)

Each catalogue item has:

- a stable ID (e.g. SEC-014), a domain (Legal, GDPR, Security, Ostatní) and a subcategory;
- the question the vendor answers, and its answer type: yes/no, single or multiple choice, number with unit, date, free text, or document only;
- a parameter schema saying how a hospital can tune it (minimum value, allowed options, maximum age of evidence);
- the evidence types that can prove it (certificate, report, contract template, declaration);
- help text and references to the law or standard behind it;
- a version. Published items are never mutated.

Hospitals can add custom requirements. The system sends them to the vendor automatically as extra questions. The vendor answers once and can choose to publish the answer for all hospitals.

The catalogue should be able to map to external frameworks, so a hospital can import a framework as a preset (for example a payer's entry conditions for digital-health apps, or the hospital's own cybersecurity checklist).

Illustrative items. These only show the shape; the real content is `TODO(legal)`, `TODO(dpo)` and `TODO(security)`.

| Domain | Example requirement | Typical hospital parameter |
|---|---|---|
| Legal | Regulatory status declared (not a medical device / MDR class) | Allowed classes |
| Legal | Product liability insurance | Minimum cover |
| Legal | Trial creates no obligation to buy; no automatic conversion to paid | Required yes |
| Legal | Exit terms: data return and deletion | Maximum days |
| GDPR | Roles defined (controller / processor) and a DPA under Art. 28 GDPR available | Required yes |
| GDPR | Hosting in the EU/EEA; list of sub-processors | Allowed regions |
| GDPR | DPIA available | Required for health data |
| Security | Information-security certification (e.g. ISO/IEC 27001) | Required / preferred |
| Security | Penetration test | Not older than N months |
| Security | MFA for staff, encryption in transit and at rest | Required yes |
| Security | Security-incident notification | Within N hours |
| Ostatní | Integration with the hospital information system (FHIR / HL7) | Required / optional |
| Ostatní | SSO, Czech language, accessibility | Required yes |
| Ostatní | Support hours and response SLA | Minimum |
| Ostatní | Clinical evidence and references from other hospitals | Informative |

### 3.2 Hospital requirement profile

- One profile per hospital with four tabs: Legal, GDPR, Security, Ostatní.
- For each included item the hospital sets:
  - criticality: Blokující (must), Důležité (should) or Informativní;
  - the expected value or threshold;
  - the evidence it requires and its maximum age;
  - the owner role who reviews it.
- Start from a preset, copy another version, or build from scratch. Presets are placeholders until clinically and legally reviewed.
- Versioned: draft → published. A request freezes the profile version it started with. The app store listing always uses the latest published version and shows "profil změněn od podání" where they differ.
- Visibility setting: private, visible to vendors in TheraHUB, or public. Visible profiles let vendors close gaps before anyone asks for a trial.

### 3.3 Vendor compliance dossier

- One dossier per app version, answering every catalogue item, plus evidence documents.
- Each document has a type, issuer, issue date, valid until, SHA-256 hash and confidentiality (public / NDA / shared only within a request).
- "Fill once, reuse everywhere": the same dossier serves every hospital.
- TheraHUB can verify evidence (e.g. check a certificate with its issuer). The match view shows Ověřeno TheraHUB or Čestné prohlášení (self-declared) on every item.
- Dossier changes are versioned. A material change notifies every hospital with an active request, trial or subscription for that app.
- Expiry monitoring: the vendor is reminded 60, 30 and 7 days before evidence expires. Expired evidence counts as missing.

## 4. Compliance matching engine

The engine compares one hospital profile version with one vendor dossier version and returns, for every requirement, a status, a human-readable reason and the evidence used. Missing, expired or unparseable evidence is never a match.

### 4.1 Item statuses

Colour is never the only carrier: every status also has an icon and a label.

| Status | Label (CZ) | Meaning |
|---|---|---|
| MATCH | ✓ Splněno | The answer meets the parameter and valid evidence is present. |
| PARTIAL | ~ Částečně | A Důležité item is only partly met, or the vendor has committed to a fix by a date. |
| GAP | ✗ Rozpor | The answer contradicts the hospital's parameter. |
| MISSING | ? Chybí | No answer, or no required evidence. |
| EXPIRED | ⏳ Prošlé | Evidence is past its validity. Treated as MISSING for the verdict. |
| REVIEW | ◐ K posouzení | Cannot be judged automatically (free text, document only). A human must decide. |
| WAIVED | ⚑ Výjimka | A gap accepted by a reviewer, with reason and scope (§7). Only set by a person. |
| NOT_APPLICABLE | – Nevztahuje se | Excluded by an explicit rule (e.g. GDPR items when no personal data is processed). Never a default. |

### 4.2 Verdicts

- Domain verdict:
  - **Splňuje:** every Blokující item is MATCH or WAIVED, and nothing is GAP, MISSING or EXPIRED.
  - **Splňuje s výhradami:** no blocking problem, but some Důležité items are GAP/PARTIAL, or REVIEW items are open.
  - **Nesplňuje:** any Blokující item is GAP, MISSING or EXPIRED.
- Overall verdict = the worst domain verdict.
- Show counts, not a single percentage: "12 splněno · 1 rozpor · 2 k posouzení". A score invites false precision.

### 4.3 Engine rules

- A pure, deterministic, versioned function: `match(profile_version, dossier_version, as_of) → MatchResult`. Rules are data, not code branches.
- Reasons are concrete, e.g. "Penetrační test: požadováno max. 12 měsíců, doloženo 18 měsíců (zpráva ze 4. 5. 2025)".
- Fail-safe, tested with property-based tests (Hypothesis): missing, expired or unparseable input never yields MATCH, and adding a failing item can never improve a domain or overall verdict.
- Snapshot at submission: the match result is frozen with the request. Reviews always refer to that snapshot.
- Live re-match: when the vendor updates the dossier or answers a clarification, the engine re-runs and shows the diff against the snapshot ("2 položky se od podání změnily"). If a domain's result got worse, that domain's decision reopens automatically (§6).
- 100% branch coverage with table-driven tests.

## 5. Configurable approval workflow

Each hospital builds its own approval chain by drag and drop from a fixed palette of step types. The four domain reviews run as one parallel block by default.

### 5.1 Step types

| Step type | Label (CZ) | Who | Completes when | Outcomes |
|---|---|---|---|---|
| Request | Žádost | Requester | Form submitted | Submitted |
| Approval | Schválení | Role from org structure (primář of the requester's department, náměstek, ředitel) | The assignee decides | Approved, approved with condition, returned, rejected |
| Vendor | Firma | Vendor | Confirms interest and trial terms, completes missing dossier items, accepts the hospital's conditions | Accepted, declined |
| Domain review block | Posouzení 4 oblastí | Legal ∥ GDPR ∥ Security ∥ Ostatní | Every domain has decided | Per domain, as Approval |
| Contract | Smlouva | Legal, vendor, hospital signatory | Trial agreement and DPA signed | Signed |
| Ethics committee (optional) | Etická komise | Requester | Reference and date recorded | Approved, rejected |
| Trial | Zkušební provoz | Guarantor | End date reached or ended early | Ended |
| KPI evaluation | Vyhodnocení KPI | Guarantor, primář | KPI report reviewed | Recommend purchase, extension or exit |
| Final decision | Rozhodnutí | Náměstek / ředitel | Decision recorded | Purchase, extend, exit |
| Purchase | Nákup (měsíční předplatné) | Procurement | Procurement route and contract recorded | Purchased |
| Exit | Odchod | Guarantor, vendor, DPO | Offboarding checklist done, deletion certificate received | Closed |
| Notify | Informovat | Any role | Delivered | — |

### 5.2 Step configuration

Every step on the canvas has:

- name and type;
- assignee rule: an org-structure role (e.g. "head of requester's department"), a named person, or a group with "any one of" / "all of";
- deputy rule and SLA in working days;
- required inputs and documents, and what the assignee sees;
- allowed actions, and where Vrátit (return) goes: requester, vendor or previous step;
- inclusion condition: always, or only if the app processes personal data, has an MDR class, exceeds a monthly price, is part of research, etc.;
- optional auto-clear rule (§8);
- notifications.

### 5.3 Drag-and-drop builder (Nastavení → Schvalovací proces)

- Palette of step types on the left, the chain on a vertical canvas, and an inspector panel on the right.
- Drag to reorder. Drop a step onto another to make a parallel group. The Final decision step branches into Purchase, Extend (back to Trial) and Exit.
- Simulate: pick an example app and see the path, who would be assigned today (from the real org structure) and the expected duration from SLAs.
- Validation blocks publishing when:
  - the chain does not start with Request;
  - Trial is not preceded by Contract and by every step marked "required before trial" (Legal, GDPR and Security at minimum);
  - KPI evaluation does not follow Trial, or a Final decision branch does not end in Purchase or Exit;
  - a step has no resolvable assignee or deputy;
  - there is a cycle other than an explicit return edge.
- Versioned like profiles. A request stays on the template version it started with. An admin can migrate an in-flight request explicitly; the migration is audit-logged.
- Several templates per hospital with selection rules, e.g. "Bez osobních údajů — zkrácený proces" and "Zdravotnický prostředek — plný proces".
- Keyboard alternative for every drag action (move up/down, group, ungroup), for WCAG 2.2 AA. Use dnd-kit.

### 5.4 Seed presets

**Preset A — Souhlas vedení napřed** (management agrees before the experts spend time):

Lékař → Primář → Náměstek → Firma → [Legal ∥ GDPR ∥ Security ∥ Ostatní] → Smlouva → Trial → KPI → Rozhodnutí → Nákup (měsíčně) | Odchod

**Preset B — Odborné posouzení napřed** (management decides with the experts' findings in hand):

Lékař → Primář → Firma → [Legal ∥ GDPR ∥ Security ∥ Ostatní] → Náměstek / Ředitel → Smlouva → Trial → KPI → Rozhodnutí → Nákup (měsíčně) | Odchod

*(Original figure: Preset A as seeded. The dashed line is the extension path back to the trial; return edges are omitted for clarity.)*

## 6. Trial request lifecycle

A request moves through one top-level state machine. Each step instance has its own small state machine, and waiting on the vendor or the requester pauses the hospital's SLA clock.

### 6.1 Request form (Požádat o trial)

Pre-filled wherever possible from the app listing, the dossier and the requester's profile:

- app and app version; department (default: the requester's);
- clinical problem and intended use (free text);
- target patient population, expected number of patients and users;
- data processed (pre-filled from the dossier, confirmed by the requester);
- trial length (default from the vendor's offer, capped by a hospital setting) and proposed start;
- trial guarantor (default: the requester) and co-requesters;
- KPIs: chosen from the vendor's suggestions, the hospital's KPI library or custom. Each has a target, a unit and a measurement source (vendor API, user survey, manual);
- resources needed from the hospital (IT, training, integration);
- attachments.

Only one active request per app per department. If one exists, offer "Připojit se k žádosti" (join as co-requester) instead.

### 6.2 Request states

| State | Label (CZ) | Entered when |
|---|---|---|
| draft | Rozpracováno | Created or returned to the requester |
| submitted | Podáno | Requester submits; pre-flight check runs (§8) |
| in_approval | Ve schvalování | First approval step activates |
| waiting_vendor | Čeká na firmu | A clarification or the Vendor step is open |
| approved_for_trial | Schváleno k trialu | Every step before Contract is complete |
| contracting | Smlouva | Contract step active |
| trial_active | Trial probíhá | Contract signed and start date reached |
| evaluating | Vyhodnocení | Trial ended; KPI step active |
| purchased | V předplatném | Purchase step complete |
| exited | Ukončeno | Exit checklist complete |
| rejected | Zamítnuto | A decision-maker rejects |
| withdrawn | Staženo | Requester withdraws (allowed until the trial starts) |
| on_hold | Pozastaveno | Vendor unresponsive past its deadline, or paused by an admin |

Extending a trial moves evaluating back to trial_active through a shortened approval path (configurable; default: primář and náměstek only, unless the dossier changed).

### 6.3 Step-instance states

pending → active → done with the outcome approved, approved_with_conditions, rejected or auto_cleared. Side states: returned, waiting_vendor (SLA paused), skipped (inclusion condition false), delegated. An overdue flag is derived from the SLA.

### 6.4 Rules

- **Parallel block, rejection:** by default the other domains continue ("collect all findings"), so the requester gets every objection at once. A hospital can switch a block to "stop on first rejection".
- **Return to the requester:** the request goes back to draft with the comments. On resubmission, only steps whose inputs changed re-run (configurable: re-run all).
- **Return to the vendor:** the hospital's SLA pauses and the vendor gets its own deadline. After reminders without an answer the request goes on_hold and the requester is told.
- **Dossier change mid-process:** re-match (§4.3). If a domain got worse, its decision reopens and its reviewer is notified. If it improved, the reviewer is notified and the decision stands.
- **Trial:** starts on the agreed date after signature. Reminders 30, 14 and 7 days before the end (configurable).
- **End of trial:** the KPI report is compiled automatically from vendor-reported metrics, a short user survey and incidents, then goes to the KPI step.
- **Exit:** offboarding checklist — user access removed, data returned in the agreed format, vendor's deletion certificate uploaded, DPO confirms; whether patients must be informed is `TODO(dpo)`.

## 7. Review and forwarding

Every reviewer gets a ready-made task: a document pack plus a pre-filled assessment of their domain. They confirm, comment or overrule, then forward it with one action.

### 7.1 The document pack (Balíček ke kontrole)

- Summary card: app, vendor, requester, department, purpose, trial length, data processed, KPIs.
- Match report for this domain only, problems first. Each item shows the hospital's expectation, the vendor's answer, the evidence (opens at the relevant page), validity, and Ověřeno TheraHUB / Čestné prohlášení.
- Domain documents, assembled automatically:
  - Legal: trial agreement draft, licence terms, insurance certificate;
  - GDPR: DPA draft, DPIA, sub-processor list, privacy notice;
  - Security: security architecture, penetration-test summary, certificates;
  - Ostatní: integration specification, support SLA, references.
- Earlier decisions in the chain and their conditions.
- History: previous approvals of the same app in this hospital and the diff since. If the hospital opts in, "Schváleno v N nemocnicích konsorcia" (outcomes only, never another hospital's comments).
- Optional AI pre-assessment (§8), labelled Návrh — ověřte.

### 7.2 Actions

| Action | Label (CZ) | Effect |
|---|---|---|
| Approve and forward | Schválit a předat dál | Completes the step; the next step activates per the template. |
| Approve with condition | Schválit s podmínkou | Adds a condition (contract clause, technical measure, deadline). Conditions flow into the Contract step and the trial checklist and are tracked until closed. |
| Waive a gap | Udělit výjimku | Per item: reason, scope (trial only, or also purchase), expiry. Turns GAP into WAIVED. |
| Ask the vendor | Dotaz na firmu | Clarification on specific items. The vendor answers in its portal; the answer re-runs matching; the thread is kept. |
| Return to requester | Vrátit žadateli | Back to draft with comments. |
| Consult a colleague | Přeposlat ke konzultaci | Sends the pack to anyone in the hospital for an opinion. The decision stays with the step owner; the opinion is attached. |
| Delegate | Delegovat | Hands the step to another person with the right role. |
| Reject | Zamítnout | Reason required (pick-list plus text). |

- A decision that departs from the match result needs a short reason: approving with an open GAP requires a waiver; rejecting despite a full match requires a reason.
- Comments are internal by default. A comment is shown to the vendor only when the author explicitly marks it Pro firmu.
- Final decisions (Rozhodnutí, signatures, waivers on Blokující items) re-prompt for MFA. Qualified e-signature is a later extension (§15).

## 8. Automation

The system does all collecting, matching, routing, chasing and drafting; humans make the judgements.

| Activity | The system does automatically | People do |
|---|---|---|
| Matching | Re-matches on every change and explains each result | Review GAP, REVIEW and PARTIAL items |
| Routing | Resolves assignees from the org structure; uses deputies during absences | — |
| Missing evidence | Pre-flight check asks the vendor for missing and expired items before any reviewer starts | — |
| Document packs | Assembles a pack per domain | Read and decide |
| Clarifications | Proposes questions from the gaps, tracks answers, re-matches | Edit and send the question |
| Reminders | SLA reminders and escalation ladder | — |
| Contracts | Generates the trial agreement and DPA from the hospital's templates; inserts conditions as clauses | Legal edits and approves; signatories sign |
| Trial | Schedules start and end, reminders, KPI collection, end-of-trial survey | Guarantor monitors |
| KPI report | Compiles metrics, survey and incidents into one report | Evaluate and recommend |
| Exit | Runs the offboarding checklist, chases the deletion certificate | DPO confirms |
| Expiry monitoring | Watches certificates and test reports during trial and subscription; opens a re-review task | Reviewer decides |

### 8.1 Pre-flight check (Předkontrola)

Right after submission, before any person reviews anything, the system asks the vendor to fill missing items and replace expired evidence, with a deadline. Reviewers are activated when the dossier is complete or the deadline passes (configurable). Reviewers should never spend time on a dossier the vendor has not finished.

### 8.2 Auto-clear (optional, off by default)

A hospital can enable it per step:

- Applies only when the domain verdict is Splňuje, every item is MATCH from TheraHUB-verified evidence, and the app falls in an allowed class.
- The step completes as "Automaticky splněno pravidlem vX". The owner gets a notice with an objection window (default 2 working days). An objection reopens the step.
- Never allowed for Final decision, Contract signatures, waivers, or any step with GAP, MISSING, EXPIRED or REVIEW items.
- Property-based test: auto-clear never fires when any such item exists.
- `TODO(legal)`: confirm that the hospital's internal rules allow completion by rule.

### 8.3 AI pre-assessment (optional module, later phase)

An LLM reads vendor documents (DPA, security architecture, licence terms) and proposes a status for REVIEW items. It quotes the passage and page, and flags clauses that depart from the hospital's template (e.g. liability cap, governing law, a sub-processor outside the EU).

- Always labelled Návrh — ověřte. It never changes a status by itself; the reviewer confirms each item.
- EU-hosted model; documents are not used for training; model and prompt versions are stored with every proposal.
- Reviewer confirmations and corrections form an evaluation set for measuring the advisor's accuracy.
- Behind a DocumentAdvisor interface and a feature flag, so it can be switched off per hospital.

### 8.4 Reuse across the consortium (opt-in)

- Evidence verified once by TheraHUB counts for every hospital.
- A hospital can allow its anonymised outcomes to be shown to other hospitals. Internal comments are never shared.
- Vendors see an anonymised summary of the most common gaps across hospitals, so they know what to fix first.

### 8.5 Other helpers

- Smart defaults in the request form (§6.1) and KPI suggestions per app category.
- Weekly digest for managers: open requests, overdue steps, bottlenecks.

## 9. UI specification

Desktop-first, usable on a tablet. Reuse the OncoReady design tokens and component library: status tokens with icon and label (never colour alone), Czech date and number formats, WCAG 2.2 AA, and designed empty, loading and error states on every screen.

### 9.1 App detail — box "Shoda s požadavky [název nemocnice]"

Shown to signed-in hospital users, evaluated against their hospital's latest published profile.

- Header: overall verdict badge (Splňuje / Splňuje s výhradami / Nesplňuje / Nelze posoudit), evaluation date, profile version, dossier version.
- Four domain tiles (Legal, GDPR, Security, Ostatní), each with its verdict and counts, e.g. "✓ 12 · ~ 1 · ✗ 1 · ? 2". A tile opens the detail drawer.
- Detail drawer: one row per requirement with columns Požadavek, Kritičnost, Očekávání nemocnice, Odpověď firmy, Doklad (link, validity, Ověřeno / Čestné prohlášení), Stav, Výjimka / poznámka. Filters Jen rozpory and Jen blokující; problems sorted first; PDF export.
- Call to action Požádat o trial. With blocking gaps it shows a warning; whether it is disabled instead is a hospital setting (default: allowed with warning, because gaps can be waived).
- Trial progress (when a request exists for this app in this hospital), below the box:
  - a horizontal stepper with every step of the template;
  - completed steps: ✓, who decided, date, and any condition;
  - the current step highlighted, with assignee name(s), "čeká 3 dny" and the SLA due date;
  - who is next: "Další na řadě: [jméno], náměstek pro LPP";
  - the parallel block as four sub-chips, each with its own status;
  - waiting states spelled out, e.g. "Čeká na odpověď firmy od 2. 11.".
- Badges on app tiles in the store for this hospital: Žádost podána, Trial probíhá, V předplatném.

### 9.2 App store — Žádosti o trial overview

- Tabs: Moje žádosti (requester), Ke kontrole (my tasks), Všechny žádosti nemocnice (managers and admins, scoped by permission).
- Columns: app, requester, department, submitted, current step, who has it, waiting (days, highlighted when past SLA), total days, match verdict, status.
- List view and a kanban view by step. Filters by status, department, domain and overdue; saved filters per user.

### 9.3 Request detail

- Header with status, the same stepper component, and the actions allowed for the current user.
- Tabs:
  - Přehled — form data and KPIs;
  - Shoda — frozen snapshot and diff to the live result;
  - Dokumenty — every document, versioned;
  - Dotazy — clarification threads with the vendor;
  - Rozhodnutí — decision log: who, when, what, reason, conditions;
  - Podmínky a výjimky — tracker with status and owner;
  - Trial — dates, KPI progress;
  - Audit.

### 9.4 Reviewer inbox (Ke kontrole)

- Overdue first, then by due date.
- Split view: list on the left, the task (pack and decision panel) on the right.
- Keyboard: j/k to move, Enter to open, A to approve, R to return, as in OncoReady.
- Target: a reviewer clears a Splňuje review with a complete dossier in under 3 minutes.

### 9.5 Settings — Schvalovací proces

The drag-and-drop builder from §5.3, with template list, versions and diff.

### 9.6 Settings — Požadavky nemocnice

- Tabs Legal | GDPR | Security | Ostatní.
- Per domain: owner and deputy; requirement list with an include toggle, criticality dropdown, a parameter editor matching the answer type, required evidence and maximum age.
- Přidat z katalogu (search the catalogue), Vlastní požadavek, Importovat šablonu.
- Draft → publish, diff between versions.
- Impact preview before publishing: how many apps in the store would change verdict.
- Visibility setting for vendors (§3.2).

### 9.7 Settings — Organizace

Departments with their head, deputies, roles and absences. CSV import.

### 9.8 Vendor portal

- Dossier editor with progress per domain; evidence upload with validity dates.
- Open clarifications from hospitals, with deadlines.
- Requests with step status (role names, not personal names; no internal comments).
- Contract signing, KPI reporting (API or form), expiry warnings.

## 10. Data model

A starting point; refine it and record changes in `docs/DECISIONS.md`. Every content entity that a decision depends on is versioned and immutable once published.

- **Organisation:**
  - Hospital (tenant): settings, visibility and sharing options, holiday calendar.
  - Department: parent, head user.
  - StaffUser, RoleAssignment (role, scope), Absence / Delegation (from, to, start, end).
- **Catalogue:** RequirementCatalogItem (code, domain, subcategory, question, answer_type, param_schema, evidence_types, references, version, status).
- **Hospital profile:**
  - RequirementProfile (hospital, version, status, published_at, published_by, visibility).
  - ProfileRequirement (profile_version, catalogue item or custom, criticality, parameters JSON, evidence_required, max_evidence_age, owner_role).
- **Vendor side:**
  - Vendor, App, AppVersion.
  - Dossier (app_version, version, status), DossierAnswer (catalogue item, value, comment).
  - EvidenceDocument (type, storage key, sha256, issuer, issued_at, valid_until, confidentiality, verified_by_therahub, verified_at).
- **Matching:** MatchRun (profile_version, dossier_version, engine_version, as_of, input_hash), MatchItemResult (requirement, status, reason, evidence ids), DomainVerdict.
- **Workflow definition:**
  - WorkflowTemplate (hospital, name, selection rule, version, status).
  - WorkflowStep (template_version, order, parallel_group, type, name, assignee_rule, deputy_rule, sla_days, inclusion_condition, auto_clear_rule, required_inputs, return_targets).
- **Runtime:**
  - TrialRequest (hospital, department, app_version, requester, template_version, profile_version, dossier_version and match snapshot at submission, status, form data, KPIs).
  - StepInstance (request, step, status, assignees, activated_at, due_at, sla_paused_total, completed_at).
  - Decision (step_instance, actor, outcome, reason, conditions, mfa_confirmed_at, auto_rule_version).
  - Waiver (request, requirement, reason, scope, expires_at, approved_by), Condition (request, text, owner, due, status).
  - Clarification (request, items, question, answer, timestamps), Comment (visibility: internal / vendor), Consultation.
- **Contracts:** ContractTemplate (hospital, kind: trial agreement / DPA, version), ContractDocument (request, generated_from, version, status, signed files).
- **Trial and decision:**
  - Trial (request, start, end, guarantor, extension_of).
  - KpiDefinition (library or custom, unit, target, source), KpiMeasurement, KpiReport.
  - FinalDecision (outcome, reason), Purchase (procurement route, monthly price, start, contract reference), Offboarding (checklist, deletion certificate, dpo_confirmed_at).
- **Platform:** Notification, AuditEvent (append-only, hash-chained, as in OncoReady).

## 11. Security, privacy, audit, notifications and SLA

The module holds no patient data, but it holds confidential vendor documents and staff decisions that internal audit may examine years later. Treat it with the same rigour as OncoReady.

**Access**

- Hospital-scoped and vendor-scoped data, enforced in one query layer. Hospital profiles are private unless shared.
- Automated tests try cross-hospital access and vendor access to internal comments.
- MFA for every staff and vendor user. Design for hospital SSO (OIDC/SAML) and later NIA for physicians.

**Documents**

- S3 in eu-central-1, encrypted, virus-scanned on upload, SHA-256 stored, versioned, never overwritten.
- Short-lived download links. Confidential documents are watermarked with the viewer's name and every view is logged.

**Audit**

- Logged: every view of a confidential document, decision, waiver, condition, delegation, consultation, auto-clear, profile or template publish, and request migration.
- Export of the complete request file (spis žádosti) as PDF/A with a hash, for internal audit and procurement records.

**Personal data:** mostly staff names, roles and decisions. Generate a record of processing activities; retention of request files follows each hospital's records rules (`TODO(dpo)`).

**Notifications**

- E-mail and in-app, with per-user preferences. Messages carry no confidential content, only a link.
- Events: assigned, due soon, overdue, returned, clarification answered, decision made, trial ending, evidence expiring.

**SLA**

- Counted in working days with the Czech public-holiday calendar, per step.
- Paused while waiting on the vendor or the requester.
- Escalation ladder: reminder at 50% and 100% of the SLA, then the deputy, then the hospital admin. Overdue time is visible in the stepper.

**Procurement note:** trials and a later monthly subscription in public hospitals fall under public-procurement rules. The Purchase step must record the procurement route, and no screen or document may suggest that a trial creates a right to a contract. `TODO(legal)`.

## 12. Analytics

Three audiences, each with filters (period, department, domain, app category) and CSV export.

- **Hospital management:**
  - requests by status; median lead time from submission to trial start, and per step;
  - bottlenecks: which steps and roles wait longest, SLA compliance per role;
  - return and rejection reasons; the most frequent gaps per domain;
  - trials converted to purchase vs. exit, and KPI outcomes.
- **Vendors:** their verdicts across hospitals (anonymised) and their most common gaps.
- **TheraHUB:** catalogue items that cause the most gaps (where startups need help), lead-time trends across the consortium.

## 13. Tech stack, module boundaries and quality bar

**Stack:** the same as OncoReady §13 — Python 3.12, Django, DRF + drf-spectacular, PostgreSQL 16, Celery + Redis; TypeScript, React, Vite, TanStack Query, Tailwind + shadcn/ui; AWS eu-central-1, Terraform. Ask before changing it.

**Repository:** assume the TheraHUB platform repository, separate from OncoReady's clinical code, sharing `/packages/ui` (design tokens and components). Confirm in Phase 0.

**Django apps:** orgs, catalogue, profiles, dossiers, matching (pure engine), workflows (definition and runtime), trial_requests, trials, contracts, documents, notifications, audit.

**Workflow engine:**

- Default: a small in-house engine. Templates are data; step instances are rows; every transition goes through one service function with row locks and writes an audit event; timers are idempotent Celery tasks.
- You may propose a library (e.g. django-viewflow) or a BPMN engine instead, with reasons in DECISIONS.md. Auditability and simple data migration matter more than BPMN features.
- Drag and drop: dnd-kit (accessible, keyboard support).

**Tests:**

- matching and workflow transitions: 100% branch coverage, table-driven.
- Property-based tests (Hypothesis):
  - missing, expired or unparseable evidence never yields MATCH; adding a failing item never improves a verdict;
  - no request reaches trial_active without Contract and every step marked "required before trial";
  - auto-clear never fires with any GAP, MISSING, EXPIRED or REVIEW item.
- Playwright end-to-end tests with axe accessibility checks (§14).
- Time-travel tests for SLA, reminders, escalation, trial end and evidence expiry.

**Demo data:** `make demo` seeds Nemocnice Demo with three departments, both presets, and three fictional apps: one Splňuje, one Splňuje s výhradami, one Nesplňuje. Requests exist in every state.

## 14. Phased delivery

Stop after each phase and report (§0). Phase 0 is the one to show hospitals and investors.

**Phase 0 — Clickable demo on seed data**

- Build: app detail with the compliance box and drawer, the trial-progress stepper, the Žádosti o trial overview, the reviewer inbox, the requirement-profile editor and the workflow builder (UI only).
- Acceptance: the whole story can be shown on a laptop with the three demo apps; the stepper shows the current step and who is next in every request state.

**Phase 1 — Catalogue, profiles, dossiers, matching**

- Build: the catalogue with versioning, hospital profiles with presets and publishing, vendor dossiers with evidence and validity, the matching engine, the live box in app detail.
- Acceptance: for fixture profiles and dossiers the verdicts equal an expected table; the property-based fail-safe tests pass; the impact preview is correct.

**Phase 2 — Workflow engine and review**

- Build: templates and the drag-and-drop builder with validation and simulation; request submission; pre-flight check; reviewer tasks with packs; all actions from §7.2; notifications; SLA and escalation; deputies and absences.
- Acceptance — end-to-end with Preset A: request → primář → náměstek → firma → four parallel reviews, where Security asks the vendor a question, the vendor answers, the item re-matches and Security approves with a condition → approved for trial. The stepper is correct at every point and every action is audit-logged.

**Phase 3 — Contract, trial, KPI, decision, exit**

- Build: contract generation from templates and upload of signed files; trial scheduling and reminders; KPI collection (vendor API, survey, manual) and report; final decision; purchase record; offboarding with deletion certificate; evidence-expiry re-review.
- Acceptance: end-to-end trial → KPI report → exit with deletion certificate, and trial → purchase; extension through the shortened path.

**Phase 4 — Automation and analytics**

- Build: auto-clear rules (off by default) with objection window; consortium reuse and sharing settings; weekly digest; analytics (§12); request-file PDF/A export.
- Acceptance: auto-clear property tests pass; bottleneck analytics reproduce the seed data.

**Phase 5 — AI pre-assessment and hardening**

- Build: DocumentAdvisor behind a feature flag; hospital SSO; security hardening to the OncoReady ASVS L2 checklist.
- Acceptance: the advisor never changes a status without a reviewer; its proposals and versions are stored and measurable.

## 15. Out of scope for the MVP (keep extension points)

| Out of scope now | Extension point to keep |
|---|---|
| Qualified e-signature (MVP: upload signed PDF) | ESignatureProvider interface |
| Integration with the hospital's procurement or ERP system | ProcurementConnector interface |
| Billing and payments for subscriptions | Purchase record with price and dates |
| Automatic provisioning of users in the vendor's app | Trial start event (webhook) |
| Public marketplace without sign-in; vendor ratings and reviews | — |
| AI pre-assessment in production use | DocumentAdvisor interface, feature flag (§8.3) |
| Vendor KPI push beyond a simple REST endpoint | OpenAPI KPI ingestion endpoint |

## 16. Open questions

Start `docs/OPEN_QUESTIONS.md` with these. Defaults the agent should assume until answered are in brackets.

**Process**

1. What exactly does the vendor do in the Firma step: confirm interest and terms, complete the dossier, or sign? [confirm terms and complete the dossier; signing happens in Smlouva]
2. Which preset is the default: A (náměstek before the domain reviews) or B (after)? [A]
3. Do the four domain reviews always run in parallel? Can one domain veto the whole request, or only recommend? [parallel; any domain can reject]
4. Who fills Ostatní in a typical hospital (IT and integration, biomedical engineering, procurement, quality)? Should it be split into sub-domains? [one domain, sub-categories inside]
5. Can a physician request a trial for an app with blocking gaps? [yes, with a warning]
6. Does the hospital's internal governance allow auto-clear with an objection window at all? [off by default]
7. Default SLA per step and the escalation ladder. [5 working days per step; ladder as in §11]
8. Who signs the trial agreement on the hospital's side, and is a qualified e-signature required? [director or authorised deputy; signed PDF upload in the MVP]
9. Is an ethics-committee step needed for non-research trials? [optional, conditional on research]

**Trial, KPI and purchase**

10. Maximum trial length and extension rules. [6 months, one extension]
11. Standard KPI library (adoption, time saved, user satisfaction, incidents). Which survey instrument for satisfaction? TODO
12. Procurement route for a monthly subscription in a public hospital, and the thresholds. `TODO(legal)`
13. Exit: deadline for data return and deletion, who confirms, whether patients must be informed. `TODO(dpo)`

**Content and sharing**

14. Initial catalogue content per domain and its sources (hospital checklists, DPIA template, payer entry conditions, national cybersecurity guidance). `TODO(legal)`, `TODO(dpo)`, `TODO(security)`
15. Should vendors see a hospital's requirement profile before any request? Should hospitals see each other's outcomes? [hospital chooses; private by default]
16. Should the vendor see reviewers' names or only roles? [roles only]

**Technical**

17. TheraHUB platform repository separate from OncoReady, sharing `/packages/ui`? [yes]
18. Hospital SSO in the first deployment, or e-mail + password + MFA? [e-mail + password + MFA]
