// Co umí jednotlivé kroky workflow: funkce z API aplikací (spouštěče, akce, vyhledání) a nastavení obecných nástrojů.
// Inspirace make.com: krok má funkci, připojení, vstupy (zadané ručně nebo namapované z výstupů dřívějších kroků),
// výstupy pro další kroky a chování při chybě. Data mezi kroky jdou vždy přes TheraHUB Node ve FHIR (ENDGAME 8.2).
// Ukázková API – skutečné funkce a datové manifesty dodají dodavatelé aplikací.

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'bool' | 'patient' | 'file';

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  /** FHIR zdroj, ve kterém se hodnota předává. */
  fhir?: string;
  /** Nápověda pod polem. */
  hint?: string;
}

export interface ApiModule {
  id: string;
  kind: 'trigger' | 'action' | 'search';
  label: string;
  desc: string;
  inputs: Field[];
  outputs: Field[];
}

export interface AppApi {
  /** Připojení aplikace k nemocnici. */
  connection: string;
  scopes: string[];
  modules: ApiModule[];
}

export const moduleKindLabel: Record<ApiModule['kind'], string> = { trigger: 'Spouštěče', action: 'Akce', search: 'Vyhledání' };

const patient: Field = { key: 'pacient', label: 'Pacient', type: 'patient', required: true, fhir: 'Patient' };
const patientOut: Field = { key: 'pacient', label: 'Pacient', type: 'patient', fhir: 'Patient' };
const when: Field = { key: 'datum', label: 'Datum a čas', type: 'date' };

const trig = (id: string, label: string, desc: string, outputs: Field[], inputs: Field[] = []): ApiModule => ({ id, kind: 'trigger', label, desc, inputs, outputs: [patientOut, ...outputs, when] });
const act = (id: string, label: string, desc: string, inputs: Field[], outputs: Field[]): ApiModule => ({ id, kind: 'action', label, desc, inputs: [patient, ...inputs], outputs });
const find = (id: string, label: string, desc: string, inputs: Field[], outputs: Field[]): ApiModule => ({ id, kind: 'search', label, desc, inputs: [patient, ...inputs], outputs });

const smart = (scopes: string[]): Pick<AppApi, 'connection' | 'scopes'> => ({ connection: 'SMART on FHIR (backend services) přes TheraHUB Node', scopes });

export const appApis: Record<string, AppApi> = {
  oncoready: {
    ...smart(['patient/Patient.read', 'patient/QuestionnaireResponse.write', 'patient/Observation.write']),
    modules: [
      act('odeslat-dotaznik', 'Odeslat dotazník pacientovi', 'Pošle pacientovi SMS odkaz na adaptivní dotazník.', [
        { key: 'dotaznik', label: 'Dotazník', type: 'select', required: true, options: ['PRO-CTCAE (adaptivní)', 'EORTC QLQ-C30', 'EORTC QLQ-H&N35', 'Vlastní dotazník oddělení'] },
        { key: 'pripominka', label: 'Připomenout po', type: 'select', options: ['24 hodinách', '48 hodinách', 'Nepřipomínat'] },
      ], [{ key: 'odeslano', label: 'Odesláno', type: 'bool' }, { key: 'odkaz', label: 'ID odeslání', type: 'text' }]),
      trig('vyplneny-dotaznik', 'Vyplněný dotazník', 'Spustí se, když pacient dotazník odešle.', [
        { key: 'dotaznik', label: 'Dotazník', type: 'text', fhir: 'QuestionnaireResponse' },
        { key: 'nejvyssi-stupen', label: 'Nejvyšší stupeň toxicity', type: 'number', fhir: 'Observation', hint: 'Stupeň 0–4 podle hlášení pacienta.' },
        { key: 'symptomy', label: 'Hlášené symptomy', type: 'text', fhir: 'Observation' },
      ]),
      act('prescreening', 'Prescreening do studie', 'Vyhodnotí, zda pacient může odpovídat kritériím otevřené studie.', [
        { key: 'studie', label: 'Studie', type: 'select', required: true, options: ['Otevřené studie oddělení', 'Konkrétní studie (vybrat)'] },
      ], [{ key: 'vhodny', label: 'Může být vhodný', type: 'bool' }, { key: 'duvody', label: 'Důvody', type: 'text' }]),
      {
        id: 'preruseni', kind: 'search', label: 'Přerušení a odklady léčby', desc: 'Souhrn za oddělení: kolik cyklů bylo odloženo nebo přerušeno pro toxicitu.',
        inputs: [{ key: 'obdobi', label: 'Období', type: 'select', options: ['Posledních 7 dní', 'Posledních 30 dní'] }],
        outputs: [{ key: 'pacienti', label: 'Pacienti s přerušením', type: 'number' }, { key: 'cykly', label: 'Odložené cykly', type: 'number', fhir: 'CarePlan' }],
      },
      find('posledni-vysledky', 'Získat poslední výsledky', 'Načte poslední vyplněný dotazník a trend.', [], [{ key: 'skore', label: 'Skóre', type: 'number', fhir: 'Observation' }, { key: 'trend', label: 'Trend', type: 'select', options: ['zlepšení', 'beze změny', 'zhoršení'] }]),
    ],
  },
  toxitrack: {
    ...smart(['patient/Observation.read', 'patient/Observation.write']),
    modules: [
      act('zahajit', 'Zahájit telemonitoring', 'Zařadí pacienta do telemonitoringu toxicity.', [
        { key: 'rezim', label: 'Režim léčby', type: 'text', hint: 'Lze namapovat z NIS (MedicationRequest / CarePlan).' },
        { key: 'delka', label: 'Délka sledování', type: 'select', options: ['Do konce léčby', '4 týdny', '12 týdnů'] },
      ], [{ key: 'zarazen', label: 'Zařazen', type: 'bool' }]),
      trig('nove-hlaseni', 'Nové hlášení toxicity', 'Spustí se při každém hlášení pacienta.', [
        { key: 'symptom', label: 'Symptom', type: 'text', fhir: 'Observation' },
        { key: 'stupen', label: 'Stupeň (CTCAE)', type: 'number', fhir: 'Observation' },
      ]),
    ],
  },
  cardiowatch: {
    ...smart(['patient/Observation.read', 'patient/Device.read']),
    modules: [
      act('zahajit', 'Zahájit monitoring', 'Spáruje zařízení a začne přijímat měření.', [
        { key: 'zarizeni', label: 'Zařízení', type: 'select', options: ['Hrudní pás EKG', 'Tlakoměr', 'Hodinky'] },
        { key: 'frekvence', label: 'Frekvence měření', type: 'select', options: ['Průběžně', '2× denně', '1× denně'] },
      ], [{ key: 'sparovano', label: 'Zařízení spárováno', type: 'bool', fhir: 'Device' }]),
      trig('odchylka', 'Odchylka měření', 'Spustí se, když AI vyhodnotí měření jako odchylku.', [
        { key: 'typ', label: 'Typ měření', type: 'select', options: ['EKG', 'Tlak', 'Tep'], fhir: 'Observation' },
        { key: 'hodnota', label: 'Hodnota', type: 'text', fhir: 'Observation' },
        { key: 'riziko', label: 'AI hodnocení rizika', type: 'select', options: ['nízké', 'střední', 'vysoké'], hint: 'Asistující AI – rozhoduje lékař.' },
      ]),
    ],
  },
  visitscribe: {
    ...smart(['patient/Encounter.read', 'patient/DocumentReference.write']),
    modules: [
      act('zaznam', 'Vytvořit záznam návštěvy', 'Připraví návrh zprávy z návštěvy; lékař ho schválí.', [
        { key: 'typ', label: 'Typ návštěvy', type: 'select', options: ['Kontrola během léčby', 'Kontrola po léčbě', 'Telefonická konzultace'] },
        { key: 'podklady', label: 'Podklady z workflow', type: 'text', hint: 'Namapujte výstupy dřívějších kroků.' },
      ], [{ key: 'navrh', label: 'Návrh zprávy (ke schválení)', type: 'file', fhir: 'DocumentReference' }]),
      act('souhrn', 'Shrnout data pro lékaře', 'Krátký souhrn výsledků z aplikací před návštěvou.', [{ key: 'data', label: 'Data', type: 'text' }], [{ key: 'souhrn', label: 'Souhrn', type: 'text' }]),
    ],
  },
  polykej: {
    ...smart(['patient/Observation.write']),
    modules: [
      act('program', 'Přiřadit program cvičení', 'Pacient dostane program rehabilitace polykání.', [{ key: 'program', label: 'Program', type: 'select', options: ['Prevence během RT', 'Rehabilitace po léčbě'] }], [{ key: 'prirazeno', label: 'Přiřazeno', type: 'bool' }]),
      trig('vysledek', 'Výsledek cvičení', 'Spustí se po týdenním vyhodnocení.', [
        { key: 'skore', label: 'Skóre polykání', type: 'number', fhir: 'Observation' },
        { key: 'bolest', label: 'Bolest při polykání (0–10)', type: 'number', fhir: 'Observation' },
      ]),
    ],
  },
  nutriplan: {
    ...smart(['patient/Observation.read', 'patient/Observation.write']),
    modules: [
      act('zahajit', 'Zahájit nutriční sledování', 'Vážení a jídelníček v aplikaci pacienta.', [{ key: 'cil', label: 'Cíl', type: 'select', options: ['Udržet hmotnost', 'Nabrat hmotnost'] }], [{ key: 'zarazen', label: 'Zařazen', type: 'bool' }]),
      trig('hmotnost', 'Nová hmotnost', 'Spustí se po zadání hmotnosti.', [
        { key: 'hmotnost', label: 'Hmotnost (kg)', type: 'number', fhir: 'Observation' },
        { key: 'zmena', label: 'Změna za 7 dní (%)', type: 'number', fhir: 'Observation' },
      ]),
    ],
  },
  dermafoto: {
    ...smart(['patient/Media.write', 'patient/Observation.write']),
    modules: [
      act('pozadat', 'Požádat o fotografii', 'Pacient dostane výzvu vyfotit ozařovanou oblast.', [{ key: 'oblast', label: 'Oblast', type: 'select', options: ['Krk', 'Prs', 'Pánev', 'Jiná'] }], [{ key: 'odeslano', label: 'Výzva odeslána', type: 'bool' }]),
      trig('fotografie', 'Nová fotografie kůže', 'Spustí se, když pacient nahraje fotografii.', [
        { key: 'foto', label: 'Fotografie', type: 'file', fhir: 'Media' },
        { key: 'stupen', label: 'Hlášený stupeň dermatitidy', type: 'number', fhir: 'Observation' },
      ]),
    ],
  },
  klid: {
    ...smart(['patient/QuestionnaireResponse.write']),
    modules: [
      act('odeslat', 'Odeslat screening distresu', 'Krátký dotazník distresu pro pacienta.', [], [{ key: 'odeslano', label: 'Odesláno', type: 'bool' }]),
      trig('vyplneno', 'Vyplněný screening', 'Spustí se po vyplnění.', [
        { key: 'skore', label: 'Skóre distresu (0–10)', type: 'number', fhir: 'QuestionnaireResponse' },
        { key: 'oblasti', label: 'Oblasti problémů', type: 'text' },
      ]),
    ],
  },
  bolestdenik: {
    ...smart(['patient/Observation.write']),
    modules: [
      act('zahajit', 'Zahájit deník bolesti', 'Pacient zapisuje bolest a analgetika.', [], [{ key: 'zarazen', label: 'Zařazen', type: 'bool' }]),
      trig('zaznam', 'Záznam bolesti', 'Spustí se po každém zápisu.', [
        { key: 'intenzita', label: 'Intenzita (0–10)', type: 'number', fhir: 'Observation' },
        { key: 'lokalizace', label: 'Lokalizace', type: 'text' },
      ]),
    ],
  },
  lekyhlidac: {
    ...smart(['patient/MedicationRequest.read', 'patient/MedicationAdministration.write']),
    modules: [
      act('pripominky', 'Nastavit připomínky léků', 'Připomínky podle předepsaných léků z NIS.', [{ key: 'leky', label: 'Léky', type: 'text', fhir: 'MedicationRequest', hint: 'Výchozí: aktuální preskripce z NIS.' }], [{ key: 'nastaveno', label: 'Nastaveno', type: 'bool' }]),
      trig('vynechana', 'Vynechaná dávka', 'Spustí se, když pacient dávku nepotvrdí.', [
        { key: 'lek', label: 'Lék', type: 'text', fhir: 'MedicationAdministration' },
        { key: 'pocet', label: 'Vynecháno za týden', type: 'number' },
      ]),
    ],
  },
  krokomer: {
    ...smart(['patient/Observation.write']),
    modules: [
      act('propojit', 'Propojit zařízení', 'Propojí telefon nebo hodinky pacienta.', [], [{ key: 'propojeno', label: 'Propojeno', type: 'bool' }]),
      trig('souhrn', 'Denní souhrn aktivity', 'Spustí se každý den večer.', [
        { key: 'kroky', label: 'Kroky', type: 'number', fhir: 'Observation' },
        { key: 'minuty', label: 'Aktivní minuty', type: 'number', fhir: 'Observation' },
      ]),
    ],
  },
  mdtsummary: {
    ...smart(['patient/CarePlan.read', 'patient/Condition.read', 'patient/DocumentReference.write']),
    modules: [
      trig('rozhodnuti', 'Nové rozhodnutí MDT', 'Spustí se po podpisu souhrnu z jednání multidisciplinárního týmu.', [
        { key: 'lecba', label: 'Rozhodnutá léčba', type: 'text', fhir: 'CarePlan' },
        { key: 'centrove', label: 'Centrové léčivo', type: 'bool', fhir: 'MedicationRequest' },
        { key: 'centrum', label: 'Centrum', type: 'select', options: ['ONKO', 'PNEU', 'NEU'] },
        { key: 'cykly', label: 'Plánovaný počet cyklů', type: 'number', fhir: 'CarePlan' },
      ]),
      act('podklady', 'Připravit podklady pro MDT', 'Souhrn pacienta z NIS a aplikací před jednáním.', [{ key: 'jednani', label: 'Jednání', type: 'select', options: ['Nejbližší MDT oddělení', 'Vybrat termín'] }], [{ key: 'podklad', label: 'Podklad', type: 'file', fhir: 'DocumentReference' }]),
    ],
  },
  vzpuptodate: {
    connection: 'Veřejné číselníky léčiv a úhrad + SMART on FHIR přes TheraHUB Node',
    scopes: ['system/Medication.read', 'system/MedicationKnowledge.read'],
    modules: [
      {
        id: 'uhrada', kind: 'search', label: 'Aktuální cena a úhrada', desc: 'Najde platnou cenu, úhradu a podmínky úhrady léčiva.',
        inputs: [{ key: 'lecba', label: 'Léčivo / léčba', type: 'text', required: true, fhir: 'Medication' }, { key: 'k-datu', label: 'K datu', type: 'date' }],
        outputs: [{ key: 'cena', label: 'Cena za cyklus', type: 'number', fhir: 'MedicationKnowledge' }, { key: 'uhrada', label: 'Úhrada', type: 'number', fhir: 'MedicationKnowledge' }, { key: 'podminky', label: 'Podmínky úhrady', type: 'text' }],
      },
      {
        id: 'zmena', kind: 'trigger', label: 'Změna ceny nebo úhrady', desc: 'Spustí se, když se změní cena nebo úhrada sledovaného léčiva.',
        inputs: [{ key: 'skupina', label: 'Sledovat', type: 'select', options: ['Centrová léčiva nemocnice', 'Vše předepisované'] }],
        outputs: [{ key: 'lecivo', label: 'Léčivo', type: 'text', fhir: 'Medication' }, { key: 'platnost', label: 'Platnost od', type: 'date' }, { key: 'zmena', label: 'Změna úhrady (%)', type: 'number' }],
      },
    ],
  },
  predikcecl: {
    ...smart(['system/MedicationAdministration.read', 'system/CarePlan.read']),
    modules: [
      // Pracuje s agregovanými částkami za centrum, ne s jedním pacientem – bez vstupu Pacient.
      {
        id: 'prepocet', kind: 'action', label: 'Přepočítat predikci', desc: 'Přepočte predikci čerpání centra do konce roku.',
        inputs: [
          { key: 'centrum', label: 'Centrum', type: 'select', required: true, options: ['ONKO', 'PNEU', 'NEU', 'Všechna centra'] },
          { key: 'nove', label: 'Nové indikace', type: 'text', hint: 'Namapujte z MDT summary.' },
          { key: 'preruseni', label: 'Přerušení léčby', type: 'text', hint: 'Namapujte z OncoReady.' },
          { key: 'cena', label: 'Cena a úhrada', type: 'text', hint: 'Namapujte z VZP uptodate.' },
        ],
        outputs: [
          { key: 'predikce', label: 'Predikce k 31. 12. (mil. Kč)', type: 'number' },
          { key: 'procento', label: '% ročního limitu', type: 'number' },
          { key: 'rozdil', label: 'Rozdíl proti limitu (mil. Kč)', type: 'number' },
        ],
      },
      {
        id: 'riziko', kind: 'trigger', label: 'Riziko překročení limitu', desc: 'Spustí se, když predikce centra přesáhne nastavený podíl limitu.',
        inputs: [{ key: 'prah', label: 'Upozornit od (% limitu)', type: 'number', hint: 'Např. 95.' }],
        outputs: [{ key: 'centrum', label: 'Centrum', type: 'text' }, { key: 'procento', label: '% ročního limitu', type: 'number' }, when],
      },
    ],
  },
};

// ---------- Nastavení obecných nástrojů ----------

export interface ToolSpec {
  inputs: Field[];
  outputs: Field[];
}

const roles = ['Ošetřující lékař', 'Lékař ve službě', 'Primář', 'Sestra oddělení', 'Nutriční terapeut'];

export const toolSpecs: Record<string, ToolSpec> = {
  start: {
    inputs: [
      { key: 'kdo', label: 'Kdo zařazuje', type: 'select', options: ['Ošetřující lékař', 'Sestra oddělení', 'Kdokoli z oddělení'] },
      { key: 'kriteria', label: 'Kritéria zařazení', type: 'text', hint: 'Zástupné – určí oddělení.' },
    ],
    outputs: [patientOut, { key: 'zaradil', label: 'Zařadil', type: 'text', fhir: 'Practitioner' }, when],
  },
  plan: {
    inputs: [
      { key: 'frekvence', label: 'Frekvence', type: 'select', required: true, options: ['Denně', '1× týdně', 'Den 3 a 10 cyklu', 'Jednorázově'] },
      { key: 'cas', label: 'Čas', type: 'text', hint: 'Např. 9:00' },
    ],
    outputs: [{ key: 'spusteno', label: 'Čas spuštění', type: 'date' }],
  },
  nis: {
    inputs: [
      { key: 'udalost', label: 'Událost', type: 'select', required: true, options: ['Příjem', 'Propuštění', 'Nová diagnóza', 'Nový výsledek laboratoře', 'Nové vyšetření (PACS)'], hint: 'FHIR Subscription nebo HL7 v2 zpráva z NIS.' },
      { key: 'filtr', label: 'Filtr', type: 'text', hint: 'Např. MKN-10 C00–C14 (zástupné).' },
    ],
    outputs: [patientOut, { key: 'zdroj', label: 'Zdroj události', type: 'text', fhir: 'Encounter / Condition' }, when],
  },
  kontrola: {
    inputs: [
      { key: 'resitel', label: 'Řešitel', type: 'select', required: true, options: roles },
      { key: 'lhuta', label: 'Lhůta', type: 'select', options: ['4 hodiny', '24 hodin', '3 pracovní dny'] },
      { key: 'podklady', label: 'Podklady k posouzení', type: 'text', hint: 'Namapujte data z dřívějších kroků.' },
    ],
    outputs: [{ key: 'rozhodnuti', label: 'Rozhodnutí', type: 'select', options: ['pokračovat', 'upravit léčbu', 'ukončit'] }, { key: 'komentar', label: 'Komentář', type: 'text' }, { key: 'kdo', label: 'Kdo rozhodl', type: 'text', fhir: 'Practitioner' }],
  },
  schvaleni: {
    inputs: [
      { key: 'schvaluje', label: 'Schvaluje', type: 'select', required: true, options: roles },
      { key: 'mfa', label: 'Potvrdit MFA', type: 'bool' },
    ],
    outputs: [{ key: 'schvaleno', label: 'Schváleno', type: 'bool' }, { key: 'kdo', label: 'Kdo schválil', type: 'text' }],
  },
  validace: {
    inputs: [
      { key: 'data', label: 'Kontrolovaná data', type: 'text', required: true },
      { key: 'pravidlo', label: 'Pravidlo', type: 'select', options: ['Vyplněno', 'V rozsahu', 'Ne starší než 30 dní'] },
    ],
    outputs: [{ key: 'platne', label: 'Data jsou platná', type: 'bool' }, { key: 'chyby', label: 'Chyby', type: 'text' }],
  },
  souhlas: {
    inputs: [
      { key: 'typ', label: 'Typ souhlasu', type: 'select', required: true, options: ['Účast ve workflow', 'Výzkum (Science)', 'Sdílení dat s aplikací'] },
      { key: 'zpusob', label: 'Způsob', type: 'select', options: ['Elektronicky v aplikaci pacienta', 'Papírově, zapíše sestra'] },
    ],
    outputs: [{ key: 'udelen', label: 'Souhlas udělen', type: 'bool', fhir: 'Consent' }],
  },
  podminka: {
    inputs: [
      { key: 'pole', label: 'Hodnota', type: 'text', required: true, hint: 'Namapujte výstup dřívějšího kroku.' },
      { key: 'operator', label: 'Operátor', type: 'select', options: ['≥', '>', '=', '<', '≤', 'obsahuje'] },
      { key: 'prah', label: 'Práh', type: 'text', hint: 'Zástupné – práh určí lékař.' },
    ],
    outputs: [{ key: 'vysledek', label: 'Splněno (ano / ne)', type: 'bool' }],
  },
  paralelne: { inputs: [{ key: 'cekat', label: 'Další krok počká na všechny větve', type: 'bool' }], outputs: [] },
  cekani: {
    inputs: [{ key: 'doba', label: 'Počkat', type: 'select', options: ['1 den', '3 dny', '7 dní', 'Na odpověď pacienta'] }],
    outputs: [{ key: 'pokracovano', label: 'Pokračováno', type: 'date' }],
  },
  konec: { inputs: [{ key: 'duvod', label: 'Důvod ukončení', type: 'select', options: ['Léčba dokončena', 'Pacient odstoupil', 'Rozhodnutí lékaře'] }], outputs: [] },
  upozorneni: {
    inputs: [
      { key: 'komu', label: 'Komu', type: 'select', required: true, options: roles },
      { key: 'priorita', label: 'Priorita', type: 'select', options: ['Běžná', 'Vysoká', 'Urgentní'] },
      { key: 'text', label: 'Text upozornění', type: 'text', hint: 'Můžete vložit data z dřívějších kroků.' },
    ],
    outputs: [{ key: 'potvrdil', label: 'Potvrdil', type: 'text' }, when],
  },
  zprava: {
    inputs: [
      { key: 'kanal', label: 'Kanál', type: 'select', options: ['SMS', 'Aplikace pacienta'] },
      { key: 'text', label: 'Text zprávy', type: 'text', required: true },
    ],
    outputs: [{ key: 'odeslano', label: 'Odesláno', type: 'bool' }],
  },
  ukol: {
    inputs: [
      { key: 'komu', label: 'Komu', type: 'select', options: roles },
      { key: 'ukol', label: 'Úkol', type: 'text', required: true },
      { key: 'termin', label: 'Termín', type: 'select', options: ['Dnes', 'Do 24 hodin', 'Do 3 dnů'] },
    ],
    outputs: [{ key: 'splneno', label: 'Splněno', type: 'bool', fhir: 'Task' }, { key: 'poznamka', label: 'Poznámka', type: 'text' }],
  },
  zapis: {
    inputs: [
      { key: 'zdroj', label: 'Typ záznamu (FHIR)', type: 'select', required: true, options: ['Observation', 'QuestionnaireResponse', 'DocumentReference', 'Task'] },
      { key: 'data', label: 'Data', type: 'text', required: true },
    ],
    outputs: [{ key: 'id', label: 'ID záznamu v NIS', type: 'text' }],
  },
  report: {
    inputs: [
      { key: 'prijemce', label: 'Příjemce', type: 'select', options: ['Ošetřující lékař', 'Primář', 'Vedení oddělení'] },
      { key: 'obdobi', label: 'Období', type: 'select', options: ['Týden', 'Měsíc', 'Čtvrtletí'] },
      { key: 'obsah', label: 'Obsah', type: 'text' },
    ],
    outputs: [{ key: 'dokument', label: 'Report', type: 'file', fhir: 'DocumentReference' }],
  },
  pseudo: {
    inputs: [
      { key: 'projekt', label: 'Projekt Science', type: 'select', options: ['Vybrat schválený projekt…'] },
      { key: 'data', label: 'Data', type: 'text', required: true },
    ],
    outputs: [{ key: 'pseudonym', label: 'Pseudonym pacienta', type: 'text' }],
  },
};

export const onErrorOptions = ['Zastavit workflow a upozornit správce', 'Opakovat 3× a pak upozornit', 'Přeskočit krok a pokračovat'];
