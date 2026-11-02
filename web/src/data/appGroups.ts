// Funkční kategorie aplikací (k čemu aplikace v nemocnici slouží), nezávislé na specializaci.
import { Activity, Building2, FileText, FlaskConical, HeartHandshake, ScanSearch, type LucideIcon } from 'lucide-react';

export interface AppGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  appIds: string[];
}

export const appGroups: AppGroup[] = [
  {
    id: 'monitorace',
    label: 'Monitorace pacienta',
    icon: Activity,
    appIds: ['oncoready', 'toxitrack', 'cardiowatch', 'bolestdenik', 'dermafoto'],
  },
  {
    id: 'podpora',
    label: 'Podpora léčby',
    icon: HeartHandshake,
    appIds: ['polykej', 'nutriplan', 'lekyhlidac', 'krokomer'],
  },
  {
    id: 'screening',
    label: 'Screening a diagnostika',
    icon: ScanSearch,
    appIds: ['klid', 'radiotriage', 'sepsisalert'],
  },
  {
    id: 'administrativa',
    label: 'Dokumentace a administrativa',
    icon: FileText,
    appIds: ['visitscribe'],
  },
  {
    id: 'provoz',
    label: 'Provoz',
    icon: Building2,
    appIds: ['bedflow', 'smenaplan'],
  },
  {
    id: 'vyzkum',
    label: 'Výzkum a data',
    icon: FlaskConical,
    appIds: ['onkokohorta'],
  },
];
