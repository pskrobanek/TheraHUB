import type { AppStatus, Readiness } from '../data/types';
import { readinessLabel, statusLabel } from '../lib/labels';

export function StatusBadge({ status }: { status: AppStatus }) {
  return <span className={`badge status-${status}`}>{statusLabel[status]}</span>;
}

export function ReadinessBadge({ readiness }: { readiness: Readiness }) {
  const dot = { plny: '🟢', omezeny: '🟡', nelze: '🔴' }[readiness];
  return (
    <span className={`badge readiness-${readiness}`}>
      <span aria-hidden>{dot}</span> {readinessLabel[readiness]}
    </span>
  );
}
