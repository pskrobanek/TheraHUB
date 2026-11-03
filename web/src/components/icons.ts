import { createLucideIcon } from 'lucide-react';

/** Ikona Workflow: dvě větve, které se sbíhají do jednoho kroku. */
export const FlowBranch = createLucideIcon('flow-branch', [
  ['circle', { cx: '6', cy: '5', r: '2.5', key: 'a' }],
  ['circle', { cx: '18', cy: '5', r: '2.5', key: 'b' }],
  ['circle', { cx: '6', cy: '19', r: '2.5', key: 'c' }],
  ['path', { d: 'M6 7.5v9', key: 'd' }],
  ['path', { d: 'M18 7.5c0 6-12 4.5-12 9', key: 'e' }],
]);

/** Ikona „most“: otevření externí aplikace (podle podkladu od autora projektu). */
export const OpenBridge = createLucideIcon('open-bridge', [
  ['circle', { cx: '6', cy: '18', r: '3.5', key: 'a' }],
  ['path', { d: 'M10.4 13.6l2.2-2.2', opacity: '0.5', key: 'b' }],
  ['rect', { x: '13.5', y: '2.5', width: '8', height: '8', rx: '3', fill: 'currentColor', stroke: 'none', key: 'c' }],
]);

/** Ikona „pečeť“: žádosti o pilotní provoz (podle podkladu od autora projektu). */
export const RequestSeal = createLucideIcon('request-seal', [
  ['path', { d: 'M3 9.41A9.36 9.36 0 0 1 9.41 3', key: 'a' }],
  ['path', { d: 'M14.59 3A9.36 9.36 0 0 1 21 9.41', key: 'b' }],
  ['path', { d: 'M21 14.59A9.36 9.36 0 0 1 14.59 21', key: 'c' }],
  ['path', { d: 'M9.41 21A9.36 9.36 0 0 1 3 14.59', opacity: '0.5', key: 'd' }],
  ['path', { d: 'M8.2 12.29l2.63 2.63 4.97-5.26', key: 'e' }],
]);
