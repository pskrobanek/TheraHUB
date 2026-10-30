import {
  Activity,
  Brain,
  Building2,
  Dna,
  FileText,
  Flame,
  HandHeart,
  HeartPulse,
  Microscope,
  Pill,
  Ribbon,
  ScanLine,
  Utensils,
  type LucideIcon,
} from 'lucide-react';

export interface Specialty {
  icon: LucideIcon;
  color: string;
}

/** Ikona a barva pro každou specializaci (kategorii aplikace). */
export const specialties: Record<string, Specialty> = {
  Onkologie: { icon: Ribbon, color: '#7c3aed' },
  Kardiologie: { icon: HeartPulse, color: '#dc2626' },
  Radiologie: { icon: ScanLine, color: '#1d4ed8' },
  'Intenzivní péče': { icon: Activity, color: '#c2410c' },
  Dermatologie: { icon: Dna, color: '#b45309' },
  'Duševní zdraví': { icon: Brain, color: '#6d28d9' },
  'Léčba bolesti': { icon: Flame, color: '#be123c' },
  Farmakoterapie: { icon: Pill, color: '#0e7490' },
  Rehabilitace: { icon: HandHeart, color: '#15803d' },
  Výživa: { icon: Utensils, color: '#4d7c0f' },
  Dokumentace: { icon: FileText, color: '#475569' },
  Výzkum: { icon: Microscope, color: '#0f766e' },
  Provoz: { icon: Building2, color: '#334155' },
};

const fallback: Specialty = { icon: Building2, color: '#475569' };

export const specialtyOf = (category: string): Specialty => specialties[category] ?? fallback;
