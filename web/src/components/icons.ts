import { createLucideIcon } from 'lucide-react';

/** Ikona Workflow: dvě větve, které se sbíhají do jednoho kroku. */
export const FlowBranch = createLucideIcon('flow-branch', [
  ['circle', { cx: '6', cy: '5', r: '2.5', key: 'a' }],
  ['circle', { cx: '18', cy: '5', r: '2.5', key: 'b' }],
  ['circle', { cx: '6', cy: '19', r: '2.5', key: 'c' }],
  ['path', { d: 'M6 7.5v9', key: 'd' }],
  ['path', { d: 'M18 7.5c0 6-12 4.5-12 9', key: 'e' }],
]);
