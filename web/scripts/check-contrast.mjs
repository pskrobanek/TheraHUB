// Kontrola kontrastu barev stavů (REQ-UI-001, DEC-002).
// Čte tokeny --st-*-fg / --st-*-bg ze src/styles.css a ověří WCAG 2.2 AA (text ≥ 4,5 : 1)
// vůči vlastnímu podkladu odznaku i vůči nejsvětlejšímu a nejtmavšímu skleněnému pozadí prototypu.
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const tokens = Object.fromEntries([...css.matchAll(/--(st-[a-z]+-(?:fg|bg)):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// Skleněné pozadí prototypu: bílá 52–100 % přes pozadí #e9ecf4 a barevné skvrny (nejtmavší místo cca #d9dcf3).
const glass = { 'sklo světlé': '#ffffff', 'sklo tmavé': '#dfe2f4' };
let fail = 0;
const names = [...new Set(Object.keys(tokens).map((k) => k.replace(/-(fg|bg)$/, '')))];
for (const n of names) {
  const fg = tokens[`${n}-fg`];
  const bg = tokens[`${n}-bg`];
  const rows = [['podklad odznaku', bg], ...Object.entries(glass)].map(([label, b]) => [label, ratio(fg, b)]);
  const worst = Math.min(...rows.map((r) => r[1]));
  const ok = worst >= 4.5;
  if (!ok) fail++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${n.padEnd(12)} ${fg} ` + rows.map(([l, r]) => `${l} ${r.toFixed(2)}`).join(' · '));
}
console.log(fail ? `\n${fail} token(y) pod 4,5 : 1` : '\nVšechny stavy splňují WCAG 2.2 AA (≥ 4,5 : 1).');
process.exit(fail ? 1 : 0);
