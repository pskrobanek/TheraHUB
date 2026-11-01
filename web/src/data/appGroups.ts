// Funkční kategorie aplikací (k čemu aplikace v nemocnici slouží), nezávislé na specializaci.
import { Activity, Building2, FileText, FlaskConical, HeartHandshake, ScanSearch, type LucideIcon } from 'lucide-react';

export interface AppGroup {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  appIds: string[];
}

export const appGroups: AppGroup[] = [
  {
    id: 'monitorace',
    label: 'Monitorace pacienta',
    hint: 'Pacient hlásí obtíže a měří se doma, tým vidí změny včas.',
    icon: Activity,
    appIds: ['oncoready', 'toxitrack', 'cardiowatch', 'bolestdenik', 'dermafoto'],
  },
  {
    id: 'podpora',
    label: 'Podpora léčby',
    hint: 'Rehabilitace, výživa, pohyb a užívání léků mezi návštěvami.',
    icon: HeartHandshake,
    appIds: ['polykej', 'nutriplan', 'lekyhlidac', 'krokomer'],
  },
  {
    id: 'screening',
    label: 'Screening a diagnostika',
    hint: 'Vyhledání rizik a podpora diagnostiky.',
    icon: ScanSearch,
    appIds: ['klid', 'radiotriage', 'sepsisalert'],
  },
  {
    id: 'administrativa',
    label: 'Dokumentace a administrativa',
    hint: 'Záznamy návštěv, souhlasy a papírování.',
    icon: FileText,
    appIds: ['visitscribe'],
  },
  {
    id: 'provoz',
    label: 'Provoz',
    hint: 'Lůžka, směny a chod oddělení.',
    icon: Building2,
    appIds: ['bedflow', 'smenaplan'],
  },
  {
    id: 'vyzkum',
    label: 'Výzkum a data',
    hint: 'Kohorty a data pro studie.',
    icon: FlaskConical,
    appIds: ['onkokohorta'],
  },
];
