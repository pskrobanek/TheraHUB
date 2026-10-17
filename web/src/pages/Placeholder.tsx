import type { SectionId } from '../lib/route';

const plans: Partial<Record<SectionId, [string, string]>> = {
  domu: ['Domů', 'Přehled dne: upozornění z aplikací, úkoly a dnešní pacienti.'],
  upozorneni: ['Upozornění', 'Všechna upozornění z aktivních aplikací napříč pacienty.'],
  ukoly: ['Úkoly', 'Úkoly vzniklé z aplikací a workflow (např. z AI souhrnu návštěvy).'],
  plan: ['Plán', 'Kalendář návštěv a frakcí.'],
  appstore: ['App Store', 'Katalog certifikovaných aplikací, kompatibilita s profilem nemocnice a NIS, hodnocení, sandbox a pilot.'],
  analytika: ['Analytika', 'Využití aplikací, výsledky a náklady za nemocnici.'],
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
