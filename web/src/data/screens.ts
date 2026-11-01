// Ilustrační obrazovky demo aplikací pro náhledy v App Store. Nejde o screenshoty reálných produktů.

type Row = [label: string, value: string];

export type Screen =
  | { kind: 'form'; title: string; rows: [string, number][]; button?: string }
  | { kind: 'line' | 'bars'; title: string; values: number[]; rows?: Row[] }
  | { kind: 'list'; title: string; rows: Row[]; button?: string }
  | { kind: 'stat'; title: string; value: string; unit: string; rows: Row[] }
  | { kind: 'ecg'; title: string; value: string; unit: string; rows: Row[] }
  | { kind: 'record'; title: string; time: string }
  | { kind: 'camera'; title: string; button: string }
  | { kind: 'scan'; title: string; rows: Row[] }
  | { kind: 'calendar'; title: string };

export const screens: Record<string, [Screen, Screen]> = {
  toxitrack: [
    { kind: 'form', title: 'Dotazník toxicity', rows: [['Mukozitida', 3], ['Dysfagie', 2], ['Únava', 2], ['Kůže', 1]], button: 'Odeslat' },
    { kind: 'line', title: 'Vývoj příznaků', values: [1, 1, 2, 2, 3, 3, 2], rows: [['Nejvyšší', 'G3'], ['Další', 'pá']] },
  ],
  cardiowatch: [
    { kind: 'ecg', title: 'EKG záznam', value: '72', unit: 'bpm', rows: [['QTc', '418 ms'], ['PR', '162 ms']] },
    { kind: 'list', title: 'Události', rows: [['Sinusový rytmus', 'dnes'], ['Bez arytmie', '7 dní'], ['QTc v normě', 'včera']] },
  ],
  visitscribe: [
    { kind: 'record', title: 'Nahrávání', time: '12:04' },
    { kind: 'list', title: 'AI souhrn', rows: [['Bolest při polykání', ''], ['Analgezie navýšena', ''], ['Hmotnost −4,1 kg', '']], button: 'Uložit do NIS' },
  ],
  polykej: [
    { kind: 'list', title: 'Cvičení dne', rows: [['Shakerův cvik', '3×'], ['Masako', '10×'], ['Polknutí s úsilím', '5×']], button: 'Začít' },
    { kind: 'bars', title: 'Pokrok', values: [2, 3, 3, 4, 4, 5, 5], rows: [['Splněno', '6/7']] },
  ],
  nutriplan: [
    { kind: 'line', title: 'Hmotnost', values: [75.5, 75, 74.2, 73.5, 72.8, 72, 71.4], rows: [['Dnes', '71,4 kg'], ['Změna', '−4,1 kg']] },
    { kind: 'form', title: 'Příjem jídla', rows: [['Snídaně', 3], ['Oběd', 2], ['Večeře', 2], ['Svačiny', 1]], button: 'Uložit' },
  ],
  dermafoto: [
    { kind: 'camera', title: 'Nová fotografie', button: 'Vyfotit' },
    { kind: 'list', title: 'Vývoj kůže', rows: [['Týden 3', 'G1'], ['Týden 4', 'G2'], ['Týden 5', 'G2']] },
  ],
  klid: [
    { kind: 'stat', title: 'Teploměr distresu', value: '4', unit: '/10', rows: [['Spánek', 'horší'], ['Nálada', 'stabilní']] },
    { kind: 'list', title: 'Doporučení', rows: [['Psycholog', 'návrh'], ['Podpůrná skupina', ''], ['Relaxace', 'denně']] },
  ],
  bolestdenik: [
    { kind: 'stat', title: 'Bolest dnes', value: '6', unit: '/10', rows: [['Analgetikum', '08:00'], ['Další dávka', '14:00']] },
    { kind: 'bars', title: 'Tento týden', values: [4, 5, 6, 6, 5, 7, 6], rows: [['Průměr', '5,6']] },
  ],
  lekyhlidac: [
    { kind: 'list', title: 'Dnešní léky', rows: [['Metformin 500', '08:00 ✓'], ['Omeprazol 20', '07:00 ✓'], ['Atorvastatin', '20:00']] },
    { kind: 'stat', title: 'Adherence', value: '92', unit: '%', rows: [['Vynecháno', '2 dávky'], ['Období', '30 dní']] },
  ],
  krokomer: [
    { kind: 'stat', title: 'Kroky dnes', value: '6 240', unit: '', rows: [['Cíl', '8 000'], ['Vzdálenost', '4,3 km']] },
    { kind: 'bars', title: 'Týden', values: [5, 6, 4, 7, 6, 8, 6], rows: [['Průměr', '6 100']] },
  ],
  radiotriage: [
    { kind: 'list', title: 'Pracovní seznam', rows: [['RTG hrudníku', 'AKUTNÍ'], ['RTG hrudníku', 'vysoká'], ['CT plic', 'běžná']] },
    { kind: 'scan', title: 'Nález AI', rows: [['Pneumothorax', '94 %']] },
  ],
  sepsisalert: [
    { kind: 'stat', title: 'Riziko sepse', value: '78', unit: '%', rows: [['Laktát', '3,1'], ['Tep', '112/min']] },
    { kind: 'line', title: 'Vývoj rizika', values: [20, 25, 30, 42, 55, 68, 78], rows: [['Alarm', 'před 2 h']] },
  ],
  bedflow: [
    { kind: 'bars', title: 'Obsazenost', values: [80, 85, 92, 88, 95, 90, 86], rows: [['Dnes', '86 %']] },
    { kind: 'list', title: 'Oddělení', rows: [['Interna', '28/30'], ['Chirurgie', '22/24'], ['JIP', '8/8']] },
  ],
  onkokohorta: [
    { kind: 'stat', title: 'Kohorta', value: '1 240', unit: '', rows: [['Nemocnice', '5'], ['Období', '2019–25']] },
    { kind: 'bars', title: 'Věkové skupiny', values: [2, 4, 6, 8, 7, 5, 3], rows: [['Medián', '63 let']] },
  ],
  smenaplan: [
    { kind: 'calendar', title: 'Rozpis směn' },
    { kind: 'list', title: 'Výměny', rows: [['Po → St', 'Nováková'], ['Pá noc', 'Dvořák'], ['So den', 'volné']] },
  ],
};
