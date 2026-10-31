// Fiktivní nemocnice pro demo „kde aplikace běží“. Nejde o reálné instituce ani jejich loga.
// Skutečná loga se sem doplní až u partnerských nemocnic, které s uvedením souhlasí.

export interface DemoHospital {
  id: string;
  name: string;
  /** Zkratka do kulatého loga. */
  mark: string;
  color: string;
}

export const demoHospitals: DemoHospital[] = [
  { id: 'fnd', name: 'Fakultní nemocnice Demo', mark: 'FN', color: '#2f37e8' },
  { id: 'kns', name: 'Krajská nemocnice Sever', mark: 'KS', color: '#0f766e' },
  { id: 'mnj', name: 'Městská nemocnice Jih', mark: 'MJ', color: '#b45309' },
  { id: 'nnk', name: 'Nemocnice Na Kopci', mark: 'NK', color: '#be123c' },
  { id: 'onv', name: 'Oblastní nemocnice Východ', mark: 'OV', color: '#6d28d9' },
  { id: 'kl', name: 'Klinika Lípa', mark: 'KL', color: '#15803d' },
  { id: 'npl', name: 'Nemocnice Pod Lesem', mark: 'PL', color: '#334155' },
  { id: 'knz', name: 'Krajská nemocnice Západ', mark: 'KZ', color: '#0e7490' },
];

/** Prvních `count` nemocnic, kde aplikace běží (v demu deterministicky podle id aplikace). */
export function hospitalsFor(appId: string, count: number): DemoHospital[] {
  let h = 0;
  for (const ch of appId) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return Array.from({ length: Math.min(count, demoHospitals.length) }, (_, i) => demoHospitals[(h + i * 3) % demoHospitals.length]);
}
