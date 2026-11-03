// Stavy shody a verdikty: vždy ikona + text, barvy z tokenů --st-* (REQ-MAT-001, REQ-UI-001).
import {
  CircleCheck,
  CircleDashed,
  CircleMinus,
  CircleQuestionMark,
  CircleX,
  Contrast,
  FileClock,
  Flag,
  Hourglass,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestionMark,
  ShieldX,
  type LucideIcon,
} from 'lucide-react';
import type { ItemStatus, Verdict } from '../../data/trial/match';

export const statusInfo: Record<ItemStatus, { label: string; icon: LucideIcon; tone: string }> = {
  match: { label: 'Splněno', icon: CircleCheck, tone: 'match' },
  partial: { label: 'Částečně', icon: CircleDashed, tone: 'partial' },
  gap: { label: 'Rozpor', icon: CircleX, tone: 'gap' },
  missing: { label: 'Chybí', icon: CircleQuestionMark, tone: 'missing' },
  expired: { label: 'Prošlé', icon: Hourglass, tone: 'expired' },
  review: { label: 'K posouzení', icon: Contrast, tone: 'review' },
  waived: { label: 'Výjimka', icon: Flag, tone: 'waived' },
  na: { label: 'Nevztahuje se', icon: CircleMinus, tone: 'na' },
};

export const verdictInfo: Record<Verdict | 'pripravuje', { label: string; icon: LucideIcon; tone: string }> = {
  splnuje: { label: 'Splňuje', icon: ShieldCheck, tone: 'match' },
  vyhrady: { label: 'Splňuje s výhradami', icon: ShieldAlert, tone: 'partial' },
  nesplnuje: { label: 'Nesplňuje', icon: ShieldX, tone: 'gap' },
  nelze: { label: 'Nelze posoudit', icon: ShieldQuestionMark, tone: 'na' },
  pripravuje: { label: 'Dossier se připravuje', icon: FileClock, tone: 'na' },
};

export function StatusChip({ status, compact = false }: { status: ItemStatus; compact?: boolean }) {
  const { label, icon: Icon, tone } = statusInfo[status];
  return (
    <span className={`st-chip tone-${tone}${compact ? ' compact' : ''}`}>
      <Icon size={compact ? 13 : 14} aria-hidden />
      {label}
    </span>
  );
}

export function VerdictBadge({ verdict, size = 'md', title }: { verdict: Verdict | 'pripravuje'; size?: 'sm' | 'md' | 'lg'; title?: string }) {
  const { label, icon: Icon, tone } = verdictInfo[verdict];
  return (
    <span className={`verdict-badge tone-${tone} size-${size}`} title={title}>
      <Icon size={size === 'lg' ? 18 : size === 'sm' ? 13 : 15} aria-hidden />
      {label}
    </span>
  );
}

/** „✓ 12 · ~ 1 · ✗ 1 · ? 2“ – počty, ne procento (REQ-MAT-004). Nulové stavy se neukazují. */
export function Counts({ counts }: { counts: Record<ItemStatus, number> }) {
  const order: ItemStatus[] = ['match', 'partial', 'gap', 'missing', 'expired', 'review', 'waived', 'na'];
  return (
    <span className="st-counts">
      {order
        .filter((s) => counts[s] > 0)
        .map((s) => {
          const { label, icon: Icon, tone } = statusInfo[s];
          return (
            <span key={s} className={`st-count tone-${tone}`} title={`${label}: ${counts[s]}`}>
              <Icon size={13} aria-hidden />
              <b>{counts[s]}</b>
              <span className="sr-only">{label}</span>
            </span>
          );
        })}
    </span>
  );
}
