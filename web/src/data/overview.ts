// Souhrnné přehledy zakoupených aplikací za celou nemocnici (demo, fiktivní pacienti).
// Každá aplikace dodává vlastní souhrnný widget stejně jako widget u pacienta;
// data zůstávají v nemocnici, TheraHUB je jen zobrazuje.

export type Severity = 'critical' | 'warning' | 'info';

export interface OverviewRow {
  patient: string;
  detail: string;
  meta: string;
  severity: Severity;
}

export type OverviewWidget =
  | { kind: 'list'; title: string; rows: OverviewRow[] }
  | {
      kind: 'trend';
      title: string;
      /** Formát hodnoty, např. „{v} %“. */
      unit: string;
      values: number[];
      labels: string[];
      /** Jak číst trend, např. „nižší je lepší“. */
      note?: string;
      /** Hlavní číslo nad grafem; výchozí je poslední hodnota. */
      headline?: string;
    };

export interface AppOverview {
  appId: string;
  patients: number;
  alerts: number;
  stat: { label: string; value: string };
  widget: OverviewWidget;
  last: { patient: string; text: string; time: string };
  actions: [string, string];
}

const week = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];

export const overviews: Record<string, AppOverview> = {
  toxitrack: {
    appId: 'toxitrack',
    patients: 24,
    alerts: 3,
    stat: { label: 'Vyplněnost', value: '87 %' },
    widget: {
      kind: 'list',
      title: 'Vyžaduje pozornost',
      rows: [
        { patient: 'Karel Dvořák', detail: 'Orální mukozitida G3', meta: '07:40', severity: 'critical' },
        { patient: 'Marie Novotná', detail: 'Dysfagie G3', meta: 'včera', severity: 'critical' },
        { patient: 'Petr Svoboda', detail: '2 dotazníky nevyplněny', meta: '3 dny', severity: 'warning' },
      ],
    },
    last: { patient: 'Jana Veselá', text: 'vyplnila dotazník', time: '08:12' },
    actions: ['Otevřít přehled', 'Poslat dotazníky'],
  },
  cardiowatch: {
    appId: 'cardiowatch',
    patients: 11,
    alerts: 1,
    stat: { label: 'Záznamy dnes', value: '9' },
    widget: {
      kind: 'list',
      title: 'Události',
      rows: [
        { patient: 'Alena Černá', detail: 'Epizoda FS, 14 min', meta: '03:22', severity: 'critical' },
        { patient: 'Jiří Procházka', detail: 'QTc 486 ms', meta: 'včera', severity: 'warning' },
        { patient: 'Karel Dvořák', detail: '7 dní bez událostí', meta: 'včera', severity: 'info' },
      ],
    },
    last: { patient: 'Karel Dvořák', text: 'odeslal EKG', time: 'včera 21:14' },
    actions: ['Otevřít EKG', 'Pacienti'],
  },
  visitscribe: {
    appId: 'visitscribe',
    patients: 38,
    alerts: 0,
    stat: { label: 'Ušetřený čas', value: '4,2 h' },
    widget: {
      kind: 'trend',
      title: 'Nahrané návštěvy tento týden',
      unit: '{v}',
      values: [6, 8, 5, 9, 7],
      labels: week.slice(0, 5),
      headline: '35 celkem',
    },
    last: { patient: 'Karel Dvořák', text: 'kontrolní konzultace', time: '19. 9.' },
    actions: ['Nahrát návštěvu', 'Zprávy ke kontrole'],
  },
  polykej: {
    appId: 'polykej',
    patients: 9,
    alerts: 2,
    stat: { label: 'Adherence', value: '76 %' },
    widget: {
      kind: 'trend',
      title: 'Adherence ke cvičení',
      unit: '{v} %',
      values: [82, 79, 74, 80, 71, 77, 76],
      labels: week,
    },
    last: { patient: 'Hana Kučerová', text: 'dokončila cvičení', time: '09:30' },
    actions: ['Otevřít přehled', 'Pacienti'],
  },
  nutriplan: {
    appId: 'nutriplan',
    patients: 14,
    alerts: 3,
    stat: { label: 'Ø úbytek', value: '−3,1 %' },
    widget: {
      kind: 'list',
      title: 'Úbytek hmotnosti nad 5 %',
      rows: [
        { patient: 'Josef Marek', detail: '−6,8 % za 4 týdny', meta: '62,1 kg', severity: 'critical' },
        { patient: 'Karel Dvořák', detail: '−5,4 % od začátku RT', meta: '71,4 kg', severity: 'warning' },
        { patient: 'Hana Kučerová', detail: '−5,1 % za 6 týdnů', meta: '54,8 kg', severity: 'warning' },
      ],
    },
    last: { patient: 'Josef Marek', text: 'zapsal hmotnost', time: '07:55' },
    actions: ['Otevřít přehled', 'Odeslat k nutričnímu'],
  },
  dermafoto: {
    appId: 'dermafoto',
    patients: 7,
    alerts: 1,
    stat: { label: 'K posouzení', value: '3' },
    widget: {
      kind: 'list',
      title: 'Ke zhodnocení',
      rows: [
        { patient: 'Jana Veselá', detail: 'Dermatitida, nová fotka', meta: '09:05', severity: 'warning' },
        { patient: 'Lenka Pokorná', detail: 'Kontrolní fotka', meta: 'včera', severity: 'info' },
        { patient: 'Zdeňka Fialová', detail: 'Kontrolní fotka', meta: 'včera', severity: 'info' },
      ],
    },
    last: { patient: 'Jana Veselá', text: 'nahrála fotku', time: '09:05' },
    actions: ['Posoudit fotky', 'Pacienti'],
  },
  klid: {
    appId: 'klid',
    patients: 12,
    alerts: 1,
    stat: { label: 'Ø distres', value: '4,1' },
    widget: {
      kind: 'trend',
      title: 'Průměrný distres (0–10) po týdnech',
      unit: '{v}',
      values: [5.8, 5.6, 5.1, 4.9, 4.6, 4.4, 4.3, 4.1],
      labels: ['T33', 'T34', 'T35', 'T36', 'T37', 'T38', 'T39', 'T40'],
      note: 'nižší je lepší',
    },
    last: { patient: 'Lenka Pokorná', text: 'vyplnila screening', time: '10:20' },
    actions: ['Otevřít přehled', 'Pacienti'],
  },
  bolestdenik: {
    appId: 'bolestdenik',
    patients: 16,
    alerts: 2,
    stat: { label: 'Ø bolest', value: 'NRS 3,8' },
    widget: {
      kind: 'list',
      title: 'Silná bolest (NRS 7+)',
      rows: [
        { patient: 'Martin Beneš', detail: 'NRS 8, průlomová bolest', meta: '06:10', severity: 'critical' },
        { patient: 'Karel Dvořák', detail: 'NRS 7 při polykání', meta: 'včera', severity: 'warning' },
      ],
    },
    last: { patient: 'Martin Beneš', text: 'zapsal bolest', time: '06:10' },
    actions: ['Otevřít deník', 'Pacienti'],
  },
  lekyhlidac: {
    appId: 'lekyhlidac',
    patients: 31,
    alerts: 2,
    stat: { label: 'Adherence', value: '91 %' },
    widget: {
      kind: 'list',
      title: 'Vynechané dávky',
      rows: [
        { patient: 'Tomáš Král', detail: '3 dávky warfarinu', meta: '2 dny', severity: 'critical' },
        { patient: 'Alena Černá', detail: 'Pozdní užití 4×', meta: 'týden', severity: 'warning' },
        { patient: 'Josef Marek', detail: 'Nevyzvednutý recept', meta: 'včera', severity: 'info' },
      ],
    },
    last: { patient: 'Tomáš Král', text: 'potvrdil ranní dávku', time: '08:47' },
    actions: ['Otevřít přehled', 'Pacienti'],
  },
  krokomer: {
    appId: 'krokomer',
    patients: 19,
    alerts: 0,
    stat: { label: 'Medián kroků', value: '4 820' },
    widget: {
      kind: 'trend',
      title: 'Medián kroků za den',
      unit: '{v} kroků',
      values: [4100, 4500, 4300, 5200, 4900, 4600, 4820],
      labels: week,
    },
    last: { patient: 'Tomáš Král', text: 'synchronizoval hodinky', time: '07:02' },
    actions: ['Otevřít přehled', 'Pacienti'],
  },
};
