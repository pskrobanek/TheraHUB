import { Ban, CircleCheck, CirclePause, CirclePlay, Clock4, FilePen, Gavel, LogOut, ShoppingCart, Undo2, type LucideIcon } from 'lucide-react';
import { stateLabel, type TrialState } from '../../data/trial/requests';

const info: Record<TrialState, { icon: LucideIcon; tone: string }> = {
  draft: { icon: FilePen, tone: 'na' },
  submitted: { icon: Clock4, tone: 'active' },
  in_approval: { icon: Clock4, tone: 'active' },
  waiting_vendor: { icon: CirclePause, tone: 'partial' },
  approved_for_trial: { icon: CircleCheck, tone: 'match' },
  contracting: { icon: Gavel, tone: 'active' },
  trial_active: { icon: CirclePlay, tone: 'match' },
  evaluating: { icon: Clock4, tone: 'active' },
  purchased: { icon: ShoppingCart, tone: 'match' },
  exited: { icon: LogOut, tone: 'na' },
  rejected: { icon: Ban, tone: 'gap' },
  withdrawn: { icon: Undo2, tone: 'na' },
  on_hold: { icon: CirclePause, tone: 'partial' },
};

/** Stav žádosti: ikona + text (REQ-MAT-001). */
export default function StateBadge({ state }: { state: TrialState }) {
  const { icon: Icon, tone } = info[state];
  return (
    <span className={`st-chip tone-${tone}`}>
      <Icon size={14} aria-hidden />
      {stateLabel[state]}
    </span>
  );
}
