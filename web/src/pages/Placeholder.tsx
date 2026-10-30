import type { SectionId } from '../lib/route';

const plans: Partial<Record<SectionId, [string, string]>> = {
  domu: ['Domů', 'Přehled dne: upozornění z aplikací, úkoly a dnešní pacienti.'],
  pacienti: ['Pacienti', 'Seznam pacientů. Otevřené pacienty najdete v menu vlevo pod položkou Pacienti.'],
  aplikace: ['Aplikace', 'App Store: katalog certifikovaných aplikací, kompatibilita s profilem nemocnice a NIS, hodnocení, sandbox a pilot.'],
  workflow: ['Workflow', 'Propojování aplikací do klinických a provozních celků.'],
  science: ['Science', 'Výzkumné projekty a pseudonymizovaná data na vyžádání, i napříč nemocnicemi.'],
  nastaveni: ['Nastavení', 'Profil nemocnice: legal, GDPR, security, NIS a dostupná data, hosting, schválené smluvní varianty.'],
};

export default function Placeholder({ section }: { section: SectionId }) {
  const [title, text] = plans[section] ?? [section, ''];
  return (
    <div className="page">
      <div className="empty glass">
        <h1>{title}</h1>
        <p className="muted">Připravujeme v dalších krocích.</p>
        <p>{text}</p>
      </div>
    </div>
  );
}
