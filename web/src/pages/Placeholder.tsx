import { FlaskConical, Home, LayoutGrid, SlidersHorizontal, Users, type LucideIcon } from 'lucide-react';
import { FlowBranch } from '../components/icons';
import PageHeader from '../components/PageHeader';
import type { SectionId } from '../lib/route';

const icons: Record<SectionId, LucideIcon> = {
  domu: Home,
  pacienti: Users,
  aplikace: LayoutGrid,
  workflow: FlowBranch,
  science: FlaskConical,
  nastaveni: SlidersHorizontal,
};

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
      <PageHeader icon={icons[section]} title={title} subtitle="Připravujeme v dalších krocích." />
      <div className="empty glass">
        <p>{text}</p>
      </div>
    </div>
  );
}
