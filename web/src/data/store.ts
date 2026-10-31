// Demo data App Store – fiktivní aplikace, ceny, hodnocení i záštity. Neodpovídají žádné reálné firmě ani organizaci.
import type { StoreApp } from './types';

export const storeApps: StoreApp[] = [
  {
    id: 'toxitrack', name: 'ToxiTrack', tagline: 'Telemonitoring toxicity', category: 'Onkologie', icon: 'onco', tint: '#3b4cf5',
    store: {
      pitch: 'Pacient hlásí nežádoucí účinky léčby z mobilu, lékař vidí závažné stavy dřív, než přijde na kontrolu.',
      audience: ['pacient', 'lekar', 'sestra'],
      regulatory: { kind: 'mdr', label: 'MDR IIa' }, ai: 'none',
      trial: { days: 60, kpis: ['≥ 70 % vyplněných dotazníků', 'Neplánované hospitalizace −15 %'] },
      price: { amount: 190, per: 'pacient', period: 'měsíc' },
      rating: 4.7, reviews: 38, hospitals: 14, activeUsers: 3850,
      compliance: {
        hospital: { legal: 'ok', gdpr: 'ok', security: 'ok' }, nis: 92,
        therahub: { widget: true, science: true, workflow: true },
        intersystems: 'ok', euStandard: 'ok', aiAssociation: null, society: 'Společnost radiační onkologie (demo)',
      },
    },
  },
  {
    id: 'cardiowatch', name: 'CardioWatch', tagline: 'Monitoring srdce', category: 'Kardiologie', icon: 'heart', tint: '#b0306a',
    store: {
      pitch: 'Domácí EKG s AI vyhodnocením rytmu, upozorní na arytmie a prodloužení QTc během léčby.',
      audience: ['pacient', 'lekar'],
      regulatory: { kind: 'mdr', label: 'MDR IIb · AI' }, ai: 'assisted',
      trial: { days: 30, kpis: ['Zachycené arytmie na 100 pacientů', 'Doba do reakce lékaře < 24 h'] },
      price: { amount: 320, per: 'pacient', period: 'měsíc' },
      rating: 4.5, reviews: 21, hospitals: 9, activeUsers: 1420,
      compliance: {
        hospital: { legal: 'ok', gdpr: 'ok', security: 'ok' }, nis: 78,
        therahub: { widget: true, science: true, workflow: false },
        intersystems: 'ok', euStandard: 'partial', aiAssociation: 'ok', society: 'Kardiologická společnost (demo)',
      },
    },
  },
  {
    id: 'visitscribe', name: 'VisitScribe', tagline: 'Záznam návštěvy a AI souhrn', category: 'Dokumentace', icon: 'scribe', tint: '#1f2a44',
    store: {
      pitch: 'Nahraje konzultaci a připraví strukturovaný zápis do NIS, lékař jen zkontroluje a podepíše.',
      audience: ['lekar', 'sestra'],
      regulatory: { kind: 'admin', label: 'Administrativní · AI' }, ai: 'guided',
      trial: { days: 30, kpis: ['Čas na dokumentaci −30 %', '≥ 80 % zápisů bez větších úprav'] },
      price: { amount: 1490, per: 'uživatel', period: 'měsíc' },
      rating: 4.8, reviews: 64, hospitals: 22, activeUsers: 640,
      compliance: {
        hospital: { legal: 'ok', gdpr: 'partial', security: 'ok' }, nis: 85,
        therahub: { widget: true, science: false, workflow: true },
        intersystems: 'ok', euStandard: 'ok', aiAssociation: 'ok', society: null,
      },
    },
  },
  {
    id: 'polykej', name: 'Polykej', tagline: 'Rehabilitace polykání', category: 'Rehabilitace', icon: 'droplet', tint: '#3b4cf5',
    store: {
      pitch: 'Videocviky polykání podle logopeda, pacient cvičí doma a terapeut vidí pokrok.',
      audience: ['pacient', 'lekar'],
      regulatory: { kind: 'mdr', label: 'MDR I' }, ai: 'none',
      trial: { days: 45, kpis: ['≥ 4 cvičení týdně', 'Zlepšení skóre dysfagie o 1 stupeň'] },
      price: { amount: 90, per: 'pacient', period: 'měsíc' },
      rating: 4.4, reviews: 12, hospitals: 6, activeUsers: 380,
      compliance: {
        hospital: { legal: 'ok', gdpr: 'ok', security: 'partial' }, nis: 60,
        therahub: { widget: true, science: false, workflow: true },
        intersystems: 'partial', euStandard: 'partial', aiAssociation: null, society: null,
      },
    },
  },
  {
    id: 'nutriplan', name: 'NutriPlán', tagline: 'Výživa a hmotnost', category: 'Výživa', icon: 'leaf', tint: '#15803d',
    store: {
      pitch: 'Hlídá hmotnost a příjem během léčby a včas pošle pacienta k nutričnímu terapeutovi.',
      audience: ['pacient', 'sestra'],
      regulatory: { kind: 'wellness', label: 'Wellness' }, ai: 'none',
      trial: { days: 30, kpis: ['Úbytek hmotnosti > 5 % zachycen do 7 dní'] },
      price: { amount: 60, per: 'pacient', period: 'měsíc' },
      rating: 4.2, reviews: 9, hospitals: 5, activeUsers: 510,
      compliance: {
        hospital: { legal: 'ok', gdpr: 'ok', security: 'ok' }, nis: 70,
        therahub: { widget: true, science: true, workflow: false },
        intersystems: 'ok', euStandard: 'partial', aiAssociation: null, society: null,
      },
    },
  },
  {
    id: 'dermafoto', name: 'DermaFoto', tagline: 'Fotodeník kůže', category: 'Dermatologie', icon: 'camera', tint: '#b45309',
    store: {
      pitch: 'Pacient fotí ozářenou kůži podle návodu, sestra porovná vývoj v čase.',
      audience: ['pacient', 'sestra'],
      regulatory: { kind: 'mdr', label: 'MDR I' }, ai: 'none',
      trial: { days: 30, kpis: ['≥ 2 fotografie týdně', 'Dermatitida G3 zachycena do 48 h'] },
      price: { amount: 2900, per: 'nemocnice', period: 'měsíc' },
      rating: 4.1, reviews: 7, hospitals: 4, activeUsers: 290,
      compliance: {
        hospital: { legal: 'ok', gdpr: 'ok', security: 'ok' }, nis: 55,
        therahub: { widget: true, science: false, workflow: false },
        intersystems: 'partial', euStandard: 'no', aiAssociation: null, society: null,
      },
    },
  },
  {
    id: 'klid', name: 'Klid', tagline: 'Screening distresu', category: 'Duševní zdraví', icon: 'smile', tint: '#7c3aed',
    store: {
      pitch: 'Krátký screening distresu před každou návštěvou a doporučení psychologické podpory.',
      audience: ['pacient', 'lekar'],
      regulatory: { kind: 'mdr', label: 'MDR I' }, ai: 'none',
      trial: { days: 60, kpis: ['≥ 60 % pacientů vyplní screening', 'Počet doporučení k psychologovi'] },
      price: { amount: 40, per: 'pacient', period: 'měsíc' },
      rating: 4.6, reviews: 15, hospitals: 8, activeUsers: 1120,
      compliance: {
        hospital: { legal: 'ok', gdpr: 'ok', security: 'ok' }, nis: 80,
        therahub: { widget: true, science: true, workflow: true },
        intersystems: 'ok', euStandard: 'ok', aiAssociation: null, society: 'Psychoonkologická sekce (demo)',
      },
    },
  },
  {
    id: 'bolestdenik', name: 'Bolest deník', tagline: 'Deník bolesti', category: 'Léčba bolesti', icon: 'gauge', tint: '#be123c',
    store: {
      pitch: 'Denní záznam bolesti a analgetik, lékař vidí, kdy upravit léčbu.',
      audience: ['pacient', 'lekar'],
      regulatory: { kind: 'mdr', label: 'MDR I' }, ai: 'none',
      trial: null,
      price: { amount: 50, per: 'pacient', period: 'měsíc' },
      rating: 4.0, reviews: 11, hospitals: 7, activeUsers: 760,
      compliance: {
        hospital: { legal: 'ok', gdpr: 'ok', security: 'ok' }, nis: 65,
        therahub: { widget: true, science: false, workflow: false },
        intersystems: 'ok', euStandard: 'partial', aiAssociation: null, society: null,
      },
    },
  },
  {
    id: 'lekyhlidac', name: 'LékyHlídač', tagline: 'Adherence k lékům', category: 'Farmakoterapie', icon: 'pill', tint: '#0e7490',
    store: {
      pitch: 'Připomíná užití léků podle e-receptu a hlásí vynechané dávky.',
      audience: ['pacient', 'sestra'],
      regulatory: { kind: 'mdr', label: 'MDR I' }, ai: 'none',
      trial: { days: 30, kpis: ['Adherence ≥ 85 %'] },
      price: { amount: 35, per: 'pacient', period: 'měsíc' },
      rating: 4.3, reviews: 19, hospitals: 11, activeUsers: 2310,
      compliance: {
        hospital: { legal: 'ok', gdpr: 'ok', security: 'ok' }, nis: 88,
        therahub: { widget: true, science: true, workflow: true },
        intersystems: 'ok', euStandard: 'ok', aiAssociation: null, society: null,
      },
    },
  },
  {
    id: 'krokomer', name: 'Krokoměr', tagline: 'Sledování aktivity', category: 'Rehabilitace', icon: 'watch', tint: '#334155',
    store: {
      pitch: 'Načte kroky z hodinek nebo telefonu a ukáže trend fyzické aktivity během léčby.',
      audience: ['pacient'],
      regulatory: { kind: 'wellness', label: 'Wellness' }, ai: 'none',
      trial: { days: 90, kpis: ['≥ 50 % pacientů sdílí data'] },
      price: { amount: 20, per: 'pacient', period: 'měsíc' },
      rating: 3.9, reviews: 6, hospitals: 3, activeUsers: 340,
      compliance: {
        hospital: { legal: 'ok', gdpr: 'partial', security: 'ok' }, nis: 40,
        therahub: { widget: true, science: true, workflow: false },
        intersystems: 'partial', euStandard: 'partial', aiAssociation: null, society: null,
      },
    },
  },
  {
    id: 'radiotriage', name: 'RadioTriage AI', tagline: 'AI triáž snímků', category: 'Radiologie', icon: 'scan', tint: '#1d4ed8',
    store: {
      pitch: 'AI seřadí snímky hrudníku podle naléhavosti, akutní nálezy má radiolog na prvním místě.',
      audience: ['lekar'],
      regulatory: { kind: 'mdr', label: 'MDR IIb · AI' }, ai: 'guided',
      trial: { days: 90, kpis: ['Doba do popisu akutního nálezu −40 %', 'Senzitivita ≥ 95 % na místních datech'] },
      price: { amount: 18, per: 'událost', period: 'jednorázově' },
      rating: 4.6, reviews: 17, hospitals: 10, activeUsers: 85,
      compliance: {
        hospital: { legal: 'ok', gdpr: 'ok', security: 'ok' }, nis: 95,
        therahub: { widget: true, science: true, workflow: true },
        intersystems: 'ok', euStandard: 'ok', aiAssociation: 'ok', society: 'Radiologická společnost (demo)',
      },
    },
  },
  {
    id: 'sepsisalert', name: 'SepsisAlert', tagline: 'Včasné varování sepse', category: 'Intenzivní péče', icon: 'activity', tint: '#c2410c',
    store: {
      pitch: 'Z laboratoře a vitálních funkcí odhadne riziko sepse hodiny před klinickými příznaky.',
      audience: ['lekar', 'sestra'],
      regulatory: { kind: 'mdr', label: 'MDR IIa · AI' }, ai: 'assisted',
      trial: { days: 60, kpis: ['Čas do podání ATB −1 h', 'Falešné poplachy < 3 na lůžko/týden'] },
      price: { amount: 450, per: 'lůžko', period: 'měsíc' },
      rating: 4.4, reviews: 13, hospitals: 6, activeUsers: 210,
      compliance: {
        hospital: { legal: 'ok', gdpr: 'ok', security: 'partial' }, nis: 62,
        therahub: { widget: true, science: true, workflow: true },
        intersystems: 'ok', euStandard: 'partial', aiAssociation: 'partial', society: null,
      },
    },
  },
  {
    id: 'bedflow', name: 'BedFlow', tagline: 'Plánování lůžek', category: 'Provoz', icon: 'bed', tint: '#0f766e',
    store: {
      pitch: 'Živý přehled obsazenosti lůžek a predikce propuštění pro plánování příjmů.',
      audience: ['admin', 'sestra'],
      regulatory: { kind: 'admin', label: 'Administrativní' }, ai: 'none',
      trial: { days: 30, kpis: ['Čekání na lůžko −20 %', 'Obsazenost ≥ 90 %'] },
      price: { amount: 24000, per: 'nemocnice', period: 'měsíc' },
      rating: 4.5, reviews: 26, hospitals: 18, activeUsers: 1060,
      compliance: {
        hospital: { legal: 'ok', gdpr: 'ok', security: 'ok' }, nis: 90,
        therahub: { widget: false, science: false, workflow: true },
        intersystems: 'ok', euStandard: 'partial', aiAssociation: null, society: null,
      },
    },
  },
  {
    id: 'onkokohorta', name: 'OnkoKohorta', tagline: 'Výzkumné kohorty', category: 'Výzkum', icon: 'database', tint: '#6d28d9',
    store: {
      pitch: 'Sestaví pseudonymizovanou kohortu napříč nemocnicemi a spustí analýzu bez přesunu dat.',
      audience: ['vyzkumnik', 'lekar'],
      regulatory: { kind: 'research', label: 'Pouze pro výzkum' }, ai: 'none',
      trial: { days: 90, kpis: ['Feasibility dotaz < 1 den', 'Schválení projektu < 6 týdnů'] },
      price: { amount: 150000, per: 'nemocnice', period: 'rok' },
      rating: 4.7, reviews: 8, hospitals: 5, activeUsers: 48,
      compliance: {
        hospital: { legal: 'partial', gdpr: 'ok', security: 'ok' }, nis: 75,
        therahub: { widget: false, science: true, workflow: false },
        intersystems: 'ok', euStandard: 'ok', aiAssociation: null, society: null,
      },
    },
  },
  {
    id: 'smenaplan', name: 'SměnaPlán', tagline: 'Plánování směn', category: 'Provoz', icon: 'calendar', tint: '#475569',
    store: {
      pitch: 'Rozpis směn sester podle kvalifikací a zákonných limitů, výměny směn v mobilu.',
      audience: ['sestra', 'admin'],
      regulatory: { kind: 'admin', label: 'Administrativní' }, ai: 'none',
      trial: { days: 60, kpis: ['Čas na tvorbu rozpisu −50 %'] },
      price: { amount: 39, per: 'uživatel', period: 'měsíc' },
      rating: 4.2, reviews: 31, hospitals: 15, activeUsers: 1930,
      compliance: {
        hospital: { legal: 'ok', gdpr: 'ok', security: 'ok' }, nis: 30,
        therahub: { widget: false, science: false, workflow: true },
        intersystems: 'no', euStandard: 'no', aiAssociation: null, society: null,
      },
    },
  },
];

/** Aplikace, které má nemocnice zakoupené (licencované). */
export const purchasedIds = new Set([
  'toxitrack', 'cardiowatch', 'visitscribe', 'polykej', 'nutriplan', 'dermafoto', 'klid', 'bolestdenik', 'lekyhlidac', 'krokomer',
]);
