import { sections, type Section } from '../components/Sidebar';

const plans: Partial<Record<Section, string>> = {
  appstore: 'Katalog certifikovaných aplikací, kompatibilita s profilem nemocnice a NIS, hodnocení, sandbox a pilot (ENDGAME kap. 6).',
  workflow: 'Propojování aplikací do klinických a provozních celků (ENDGAME kap. 8).',
  science: 'Pseudonymizovaná data na vyžádání pro výzkumné projekty, i napříč nemocnicemi (ENDGAME kap. 9).',
  profil: 'Pravidla nemocnice: legal, GDPR, security, NIS a dostupnost dat, hosting, schválené smluvní varianty (ENDGAME kap. 4).',
};

export default function Placeholder({ section }: { section: Section }) {
  const meta = sections.find((s) => s.id === section)!;
  return (
    <div className="placeholder">
      <h1>
        <span aria-hidden>{meta.icon}</span> {meta.label}
      </h1>
      <p className="muted">Připravujeme v dalších krocích.</p>
      <p>{plans[section]}</p>
    </div>
  );
}
