// Funkční kategorie aplikací (k čemu aplikace v nemocnici slouží), nezávislé na specializaci.
export interface AppGroup {
  id: string;
  label: string;
  appIds: string[];
}

export const appGroups: AppGroup[] = [
  {
    id: 'monitorace',
    label: 'Monitorace pacienta',
    appIds: ['oncoready', 'toxitrack', 'cardiowatch', 'bolestdenik', 'dermafoto'],
  },
  {
    id: 'podpora',
    label: 'Podpora léčby',
    appIds: ['polykej', 'nutriplan', 'lekyhlidac', 'krokomer'],
  },
  {
    id: 'screening',
    label: 'Screening a diagnostika',
    appIds: ['klid', 'radiotriage', 'sepsisalert'],
  },
  {
    id: 'administrativa',
    label: 'Dokumentace a administrativa',
    appIds: ['visitscribe', 'mdtsummary'],
  },
  {
    id: 'ekonomika',
    label: 'Ekonomika a léčiva',
    appIds: ['predikcecl', 'vzpuptodate'],
  },
  {
    id: 'provoz',
    label: 'Provoz',
    appIds: ['bedflow', 'smenaplan'],
  },
  {
    id: 'vyzkum',
    label: 'Výzkum a data',
    appIds: ['onkokohorta'],
  },
];
