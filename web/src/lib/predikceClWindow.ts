// Okno aplikace Predikce CL (otevře se přes „Otevřít“): grafy predikce spotřeby centrových léčiv do konce roku
// a pod nimi stav center ONKO, PNEU, NEU. Samostatná stránka s vloženým SVG, hover vrstvou, tabulkou a tmavým režimem.
// Barvy: kategorie (centra) z validované palety – sloty 1–3, prověřeno skriptem validate_palette (světlý i tmavý).
import { ACTUAL, asOf, centers, cumulative, fmtMil, fmtPct, months, stateOf, statusLabel, type Center } from '../data/centralDrugs';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const num = (v: number, d = 1) => v.toLocaleString('cs-CZ', { minimumFractionDigits: d, maximumFractionDigits: d });

const appLabel = { mdtsummary: 'MDT summary', oncoready: 'OncoReady', vzpuptodate: 'VZP uptodate' } as const;

// ---------- Hlavní graf: čerpání v % ročního limitu (společná osa pro všechna centra) ----------
function mainChart(): string {
  const W = 960, H = 330, L = 44, R = 150, T = 28, B = 34;
  const pw = W - L - R, ph = H - T - B;
  const yMax = 120;
  const x = (i: number) => L + (pw * i) / 11;
  const y = (pct: number) => T + ph - (ph * pct) / yMax;
  const grid = [0, 20, 40, 60, 80, 100, 120]
    .map((v) => `<line x1="${L}" x2="${L + pw}" y1="${y(v)}" y2="${y(v)}" class="grid"/><text x="${L - 8}" y="${y(v) + 4}" class="tick" text-anchor="end">${v}</text>`)
    .join('');
  const xt = months.map((m, i) => `<text x="${x(i)}" y="${H - 10}" class="tick" text-anchor="middle">${m}</text>`).join('');
  const split = (x(ACTUAL - 1) + x(ACTUAL)) / 2;

  // Koncové popisky: zabránit překryvu (min. 16 px).
  const ends = centers.map((c, k) => ({ k, y: y(stateOf(c).pctForecast) })).sort((a, b) => a.y - b.y);
  for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 16) ends[i].y = ends[i - 1].y + 16;
  const labelY = Object.fromEntries(ends.map((e) => [e.k, e.y]));

  const series = centers
    .map((c, k) => {
      const cum = cumulative(c).map((v) => (v / c.limit) * 100);
      let acc = 0;
      const spreadCum = c.monthly.map((_, i) => (i < ACTUAL ? 0 : (acc += c.spread[i - ACTUAL])));
      const actual = cum.slice(0, ACTUAL).map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ');
      const fc = cum.slice(ACTUAL - 1).map((v, j) => `${j ? 'L' : 'M'}${x(ACTUAL - 1 + j)},${y(v)}`).join(' ');
      const up = cum.slice(ACTUAL - 1).map((v, j) => `${x(ACTUAL - 1 + j)},${y(v + (spreadCum[ACTUAL - 1 + j] / c.limit) * 100)}`);
      const lo = cum.slice(ACTUAL - 1).map((v, j) => `${x(ACTUAL - 1 + j)},${y(v - (spreadCum[ACTUAL - 1 + j] / c.limit) * 100)}`).reverse();
      const s = stateOf(c);
      return `<g class="s${k + 1}">
        <polygon points="${[...up, ...lo].join(' ')}" class="band"/>
        <path d="${actual}" class="line"/>
        <path d="${fc}" class="line dash"/>
        <circle cx="${x(11)}" cy="${y(s.pctForecast)}" r="4" class="dot"/>
        <text x="${x(11) + 12}" y="${labelY[k] + 4}" class="dlabel"><tspan class="dl-code">${c.code}</tspan> ${fmtPct(s.pctForecast)}</text>
      </g>`;
    })
    .join('');

  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Čerpání centrových léčiv v procentech ročního limitu po měsících; skutečnost do října, predikce listopad a prosinec.">
    <rect x="${split}" y="${T}" width="${L + pw - split}" height="${ph}" class="fc-zone"/>
    ${grid}
    <line x1="${L}" x2="${L + pw}" y1="${y(100)}" y2="${y(100)}" class="limit"/>
    <text x="${L + 6}" y="${y(100) - 6}" class="limit-label">Roční limit 100 %</text>
    <line x1="${split}" x2="${split}" y1="${T - 6}" y2="${T + ph}" class="today"/>
    <text x="${split - 8}" y="${T - 12}" class="zone-label" text-anchor="end">Skutečnost</text>
    <text x="${split + 8}" y="${T - 12}" class="zone-label">Predikce</text>
    ${xt}
    <line x1="${L}" x2="${L + pw}" y1="${y(0)}" y2="${y(0)}" class="axis"/>
    ${series}
    <line class="cross" x1="0" x2="0" y1="${T}" y2="${T + ph}" style="display:none"/>
    <rect class="hit" x="${L - 20}" y="${T}" width="${pw + 40}" height="${ph}" data-l="${L}" data-pw="${pw}" data-w="${W}"/>
  </svg>`;
}

// ---------- Malý graf centra: měsíční čerpání v mil. Kč ----------
function monthlyBars(c: Center, k: number): string {
  const W = 1000, H = 170, L = 40, R = 6, T = 10, B = 24;
  const pw = W - L - R, ph = H - T - B;
  const max = Math.ceil((Math.max(...c.monthly.map((v, i) => v + (i >= ACTUAL ? c.spread[i - ACTUAL] : 0))) * 1.1) / 5) * 5;
  const slot = pw / 12;
  const bw = Math.min(22, slot - 6);
  const y = (v: number) => T + ph - (ph * v) / max;
  const ticks = [0, max / 2, max].map((v) => `<line x1="${L}" x2="${L + pw}" y1="${y(v)}" y2="${y(v)}" class="grid"/><text x="${L - 6}" y="${y(v) + 4}" class="tick" text-anchor="end">${num(v, v % 1 ? 1 : 0)}</text>`).join('');
  const bars = c.monthly
    .map((v, i) => {
      const bx = L + slot * i + (slot - bw) / 2;
      const top = y(v), h = y(0) - top, r = Math.min(4, h);
      const d = `M${bx},${y(0)} V${top + r} Q${bx},${top} ${bx + r},${top} H${bx + bw - r} Q${bx + bw},${top} ${bx + bw},${top + r} V${y(0)} Z`;
      const fc = i >= ACTUAL;
      const tip = `${months[i]}: ${fmtMil(v)}${fc ? ` (predikce ± ${num(c.spread[i - ACTUAL])})` : ''}`;
      return `<path d="${d}" class="bar${fc ? ' fc' : ''}" data-tip="${esc(tip)}"/><text x="${bx + bw / 2}" y="${H - 7}" class="tick" text-anchor="middle">${months[i]}</text>`;
    })
    .join('');
  return `<svg viewBox="0 0 ${W} ${H}" class="chart mini s${k + 1}" role="img" aria-label="${esc(c.code)} – měsíční čerpání v mil. Kč">${ticks}<line x1="${L}" x2="${L + pw}" y1="${y(0)}" y2="${y(0)}" class="axis"/>${bars}</svg>`;
}

const statusIcon = {
  ok: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 8.2l2 2 4-4.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  risk: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M8 1.8l6.5 11.4H1.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 6.2v3.2M8 11.4v.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  over: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 4.5v4.2M8 11v.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
};

function centerCard(c: Center, k: number): string {
  const s = stateOf(c);
  const drivers = c.drivers
    .map((d) => `<li><span class="app-tag">${appLabel[d.app]}</span><span>${esc(d.text)}</span>${d.effect !== undefined ? `<b class="eff">${d.effect > 0 ? '+' : '−'}${num(Math.abs(d.effect))} mil.</b>` : ''}</li>`)
    .join('');
  const groups = c.groups.map((g) => `<li><span>${esc(g.label)}</span><span class="gbar"><i style="width:${g.share}%"></i></span><b>${g.share} %</b></li>`).join('');
  return `<article class="center s${k + 1}">
    <header>
      <span class="swatch"></span>
      <div><h3>${c.code}</h3><span class="muted">${esc(c.name)}</span></div>
      <span class="status st-${s.status}">${statusIcon[s.status]} ${statusLabel[s.status]}</span>
    </header>
    <dl class="kpis">
      <div><dt>Roční limit</dt><dd>${fmtMil(c.limit)}</dd></div>
      <div><dt>Čerpáno k ${asOf.replace(' 2026', '')}</dt><dd>${fmtMil(s.spent)}<small>${fmtPct(s.pctNow)} limitu</small></dd></div>
      <div><dt>Predikce k 31. 12.</dt><dd>${fmtMil(s.forecast)}<small>rozpětí ${num(s.low)}–${num(s.high)}</small></dd></div>
      <div><dt>Proti limitu</dt><dd class="${s.diff > 0 ? 'neg' : ''}">${s.diff > 0 ? '+' : '−'}${fmtMil(Math.abs(s.diff))}<small>${fmtPct(s.pctForecast)} limitu</small></dd></div>
      <div><dt>Pacienti na CL</dt><dd>${c.patients}<small>+${c.patientsDelta} za říjen</small></dd></div>
    </dl>
    <div class="mini-head"><span>Měsíční čerpání (mil. Kč)</span><span class="key"><i class="k-act"></i>skutečnost <i class="k-fc"></i>predikce</span></div>
    ${monthlyBars(c, k)}
    <div class="two">
      <section><h4>Struktura čerpání</h4><ul class="groups">${groups}</ul></section>
      <section><h4>Vlivy z workflow</h4><ul class="drivers">${drivers}</ul></section>
    </div>
  </article>`;
}

function table(): string {
  const head = centers.map((c) => `<th>${c.code} (mil. Kč)</th><th>${c.code} % limitu</th>`).join('');
  const rows = months
    .map((m, i) => {
      const cells = centers.map((c) => {
        const cum = cumulative(c)[i];
        return `<td>${num(c.monthly[i])}</td><td>${fmtPct((cum / c.limit) * 100)}</td>`;
      });
      return `<tr${i >= ACTUAL ? ' class="fc-row"' : ''}><th scope="row">${m}${i >= ACTUAL ? ' (predikce)' : ''}</th>${cells.join('')}</tr>`;
    })
    .join('');
  return `<details class="tbl"><summary>Tabulka hodnot</summary><div class="tbl-wrap"><table><thead><tr><th>Měsíc</th>${head}</tr></thead><tbody>${rows}</tbody></table></div></details>`;
}

/** Celé HTML okna. Název nemocnice se záměrně neuvádí – čísla jsou smyšlená (DEC-003, OQ-104). */
export interface LinkedWorkflow {
  name: string;
  status: string;
  apps: string[];
}

export function predikceClHtml(user: string, linked: LinkedWorkflow[] = []): string {
  const st = centers.map(stateOf);
  const limit = centers.reduce((a, c) => a + c.limit, 0);
  const forecast = st.reduce((a, s) => a + s.forecast, 0);
  const spent = st.reduce((a, s) => a + s.spent, 0);
  // Data pro hover vrstvu hlavního grafu.
  const data = centers.map((c) => ({ code: c.code, limit: c.limit, cum: cumulative(c), spread: c.spread }));
  const legend = centers.map((c, k) => `<span class="lg s${k + 1}"><i></i>${c.code}</span>`).join('');

  return `<!doctype html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Predikce CL – spuštěno z TheraHUB</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root { color-scheme: light; --page: #f4f5f9; --surface: #fcfcfb; --ink: #0b0b0b; --ink2: #52514e; --muted: #898781; --grid: #e1e0d9; --axis: #c3c2b7; --ring: rgba(11,11,11,.10);
  --s1: #2a78d6; --s2: #eb6834; --s3: #1baf7a; --good: #0ca30c; --warning: #fab219; --critical: #d03b3b; --neg: #b3261e; --accent: #2f37e8; }
@media (prefers-color-scheme: dark) { :root { color-scheme: dark; --page: #0d0d0d; --surface: #1a1a19; --ink: #f0efec; --ink2: #c3c2b7; --muted: #898781; --grid: #2c2c2a; --axis: #383835; --ring: rgba(255,255,255,.10);
  --s1: #3987e5; --s2: #d95926; --s3: #199e70; --neg: #ff8a80; --accent: #8f96ff; } }
* { box-sizing: border-box; }
body { margin: 0; background: var(--page); color: var(--ink); font: 14px/1.5 Inter, system-ui, -apple-system, "Segoe UI", sans-serif; }
main { max-width: 1120px; margin: 0 auto; padding: 24px 16px 40px; display: flex; flex-direction: column; gap: 16px; }
.top { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.mark { width: 44px; height: 44px; border-radius: 10px; background: #0f766e; display: grid; place-items: center; color: #fff; flex-shrink: 0; }
h1 { margin: 0; font-size: 1.45rem; } h2 { margin: 0; font-size: 1.05rem; } h3 { margin: 0; font-size: 1.05rem; } h4 { margin: 0 0 8px; font-size: .78rem; text-transform: uppercase; letter-spacing: .05em; color: var(--muted); }
.muted { color: var(--ink2); }
.card { background: var(--surface); border: 1px solid var(--ring); border-radius: 12px; padding: 18px 20px; }
.tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
.tile { background: var(--surface); border: 1px solid var(--ring); border-radius: 12px; padding: 14px 16px; }
.tile span { display: block; font-size: .78rem; color: var(--ink2); } .tile b { display: block; font-size: 1.5rem; font-weight: 600; margin-top: 2px; } .tile small { color: var(--ink2); }
.chart-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 6px; }
.legend { display: flex; gap: 14px; flex-wrap: wrap; font-size: .82rem; color: var(--ink2); align-items: center; }
.lg i { display: inline-block; width: 14px; height: 3px; border-radius: 2px; margin-right: 6px; vertical-align: middle; background: var(--c); }
.enc { display: inline-flex; align-items: center; gap: 6px; } .enc svg { vertical-align: middle; }
.s1 { --c: var(--s1); } .s2 { --c: var(--s2); } .s3 { --c: var(--s3); }
.chart-box { position: relative; }
.chart { width: 100%; height: auto; display: block; overflow: visible; }
.grid { stroke: var(--grid); stroke-width: 1; } .axis { stroke: var(--axis); stroke-width: 1; }
.tick { fill: var(--muted); font-size: 11px; font-variant-numeric: tabular-nums; }
.fc-zone { fill: var(--ink); opacity: .03; }
.limit { stroke: var(--ink2); stroke-width: 1.5; stroke-dasharray: 6 4; } .limit-label { fill: var(--ink2); font-size: 11px; font-weight: 600; }
.today { stroke: var(--axis); stroke-width: 1; } .zone-label { fill: var(--muted); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; }
.line { fill: none; stroke: var(--c); stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; } .dash { stroke-dasharray: 5 4; }
.band { fill: var(--c); opacity: .16; }
.dot { fill: var(--c); stroke: var(--surface); stroke-width: 2; }
.dlabel { fill: var(--ink); font-size: 12px; font-variant-numeric: tabular-nums; } .dl-code { font-weight: 700; }
.cross { stroke: var(--ink2); stroke-width: 1; stroke-dasharray: 3 3; }
.hit { fill: transparent; cursor: crosshair; }
.tip { position: absolute; pointer-events: none; background: var(--surface); color: var(--ink); border: 1px solid var(--ring); border-radius: 8px; padding: 8px 10px; font-size: .8rem; box-shadow: 0 8px 24px rgba(0,0,0,.14); white-space: nowrap; display: none; z-index: 5; }
.tip b { display: block; margin-bottom: 4px; } .tip .r { display: flex; align-items: center; gap: 6px; } .tip .r i { width: 10px; height: 3px; border-radius: 2px; background: var(--c); }
.tip .r span:last-child { margin-left: auto; padding-left: 14px; font-variant-numeric: tabular-nums; }
.centers { display: flex; flex-direction: column; gap: 14px; }
.center { background: var(--surface); border: 1px solid var(--ring); border-radius: 12px; padding: 18px 20px; display: flex; flex-direction: column; gap: 14px; }
.center header { display: flex; align-items: center; gap: 12px; }
.center header div { flex: 1; display: flex; flex-direction: column; }
.swatch { width: 12px; height: 12px; border-radius: 3px; background: var(--c); flex-shrink: 0; }
.status { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 99px; font-size: .8rem; font-weight: 600; color: var(--ink); border: 1.5px solid var(--sc); background: color-mix(in srgb, var(--sc) 14%, transparent); }
.status svg { color: var(--sc); }
.st-ok { --sc: var(--good); } .st-risk { --sc: var(--warning); } .st-over { --sc: var(--critical); }
.kpis { margin: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px 18px; }
.kpis dt { font-size: .75rem; color: var(--ink2); } .kpis dd { margin: 0; font-weight: 600; font-size: 1.02rem; font-variant-numeric: tabular-nums; } .kpis small { display: block; font-weight: 400; font-size: .75rem; color: var(--ink2); }
.kpis dd.neg { color: var(--neg); }
.mini-head { display: flex; justify-content: space-between; font-size: .78rem; color: var(--ink2); flex-wrap: wrap; gap: 8px; }
.key { display: inline-flex; align-items: center; gap: 6px; } .key i { display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin-left: 8px; }
.k-act { background: var(--c); } .k-fc { background: color-mix(in srgb, var(--c) 30%, transparent); outline: 1.5px dashed var(--c); outline-offset: -1.5px; }
.bar { fill: var(--c); } .bar.fc { fill: color-mix(in srgb, var(--c) 30%, transparent); stroke: var(--c); stroke-width: 1.5; stroke-dasharray: 3 2; }
.bar:hover { opacity: .8; }
.two { display: grid; grid-template-columns: 1fr 1.4fr; gap: 18px; }
.groups, .drivers { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; font-size: .84rem; }
.groups li { display: grid; grid-template-columns: 1fr 90px 40px; gap: 8px; align-items: center; } .groups b { text-align: right; font-variant-numeric: tabular-nums; font-weight: 600; }
.gbar { height: 6px; border-radius: 3px; background: var(--grid); overflow: hidden; } .gbar i { display: block; height: 100%; background: var(--c); border-radius: 3px; }
.drivers li { display: grid; grid-template-columns: auto 1fr auto; gap: 8px; align-items: baseline; }
.app-tag { font-size: .7rem; font-weight: 600; padding: 1px 7px; border-radius: 99px; background: color-mix(in srgb, var(--accent) 12%, transparent); color: var(--accent); white-space: nowrap; }
.eff { font-variant-numeric: tabular-nums; white-space: nowrap; }
.tbl summary { cursor: pointer; font-weight: 600; } .tbl-wrap { overflow-x: auto; margin-top: 10px; }
table { border-collapse: collapse; width: 100%; font-size: .82rem; font-variant-numeric: tabular-nums; }
th, td { padding: 6px 8px; border-bottom: 1px solid var(--grid); text-align: right; } th:first-child, td:first-child { text-align: left; } thead th { color: var(--ink2); font-weight: 500; }
.fc-row { color: var(--ink2); font-style: italic; }
footer { font-size: .78rem; color: var(--ink2); }
.linked { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: .8rem; color: var(--ink2); }
.linked > span:first-child { font-weight: 600; text-transform: uppercase; letter-spacing: .05em; font-size: .7rem; color: var(--muted); }
.lw { padding: 4px 10px; border-radius: 99px; background: var(--surface); border: 1px solid var(--ring); color: var(--ink); }
.demo { display: inline-block; font-size: .72rem; font-weight: 600; padding: 2px 8px; border-radius: 99px; background: color-mix(in srgb, var(--warning) 25%, transparent); color: var(--ink); margin-left: 8px; vertical-align: middle; }
@media (max-width: 720px) { .two { grid-template-columns: 1fr; } .center header { flex-wrap: wrap; } }
</style></head><body><main>
  <div class="top">
    <span class="mark" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/></svg></span>
    <div><h1>Predikce CL <span class="demo">ukázková data</span></h1><span class="muted">Predikce spotřeby centrových léčiv do konce roku 2026 · skutečnost k ${asOf}</span></div>
  </div>

  <div class="tiles">
    <div class="tile"><span>Čerpáno celkem k ${asOf}</span><b>${fmtMil(spent)}</b><small>${fmtPct((spent / limit) * 100)} ročních limitů</small></div>
    <div class="tile"><span>Predikce celkem k 31. 12. 2026</span><b>${fmtMil(forecast)}</b><small>${fmtPct((forecast / limit) * 100)} ročních limitů</small></div>
    <div class="tile"><span>Roční limity center celkem</span><b>${fmtMil(limit)}</b><small>ONKO + PNEU + NEU</small></div>
    <div class="tile"><span>Center s rizikem</span><b>${st.filter((s) => s.status !== 'ok').length} ze ${centers.length}</b><small>${centers.filter((_, i) => st[i].status !== 'ok').map((c) => c.code).join(', ') || 'žádné'}</small></div>
  </div>

  ${linked.length ? `<div class="linked"><span>Navázaná workflow</span>${linked.map((l) => `<span class="lw"><b>${esc(l.name)}</b> · ${esc(l.status)} · aplikace: ${esc(l.apps.join(', '))}</span>`).join('')}</div>` : ''}

  <section class="card">
    <div class="chart-head">
      <h2>Čerpání v % ročního limitu</h2>
      <div class="legend">${legend}
        <span class="enc"><svg width="22" height="6"><line x1="0" y1="3" x2="22" y2="3" stroke="currentColor" stroke-width="2"/></svg>skutečnost</span>
        <span class="enc"><svg width="22" height="6"><line x1="0" y1="3" x2="22" y2="3" stroke="currentColor" stroke-width="2" stroke-dasharray="5 4"/></svg>predikce</span>
        <span class="enc"><svg width="14" height="10"><rect width="14" height="10" rx="2" fill="currentColor" opacity=".18"/></svg>rozpětí predikce</span>
      </div>
    </div>
    <div class="chart-box" id="main">${mainChart()}<div class="tip" id="tip"></div></div>
    ${table()}
  </section>

  <h2>Centra a jejich aktuální stav</h2>
  <div class="centers">${centers.map(centerCard).join('')}</div>

  <footer>
    Ukázková data – smyšlená čísla, nejde o skutečné údaje nemocnice. Výpočet běží v nemocnici (TheraHUB Node) nad agregovanými částkami; data pacientů nemocnici neopouštějí.
    ${linked.length ? `Vstupy dodávají navázané workflows: ${linked.map((l) => `<b>${esc(l.name)}</b> (${esc(l.apps.join(', '))})`).join('; ')}.` : 'Aplikace zatím není zapojená do žádného workflow – predikce běží jen z čerpání v NIS.'}
    Spuštěno z TheraHUB přes SMART on FHIR · ${esc(user)}.
  </footer>
</main>
<div class="tip" id="bartip"></div>
<script>
(function () {
  var D = ${JSON.stringify(data)}, M = ${JSON.stringify(months)}, A = ${ACTUAL};
  var fmt = function (v, d) { return v.toLocaleString('cs-CZ', { minimumFractionDigits: d, maximumFractionDigits: d }); };
  var box = document.getElementById('main'), svg = box.querySelector('svg'), hit = svg.querySelector('.hit'), cross = svg.querySelector('.cross'), tip = document.getElementById('tip');
  var L = +hit.dataset.l, PW = +hit.dataset.pw, W = +hit.dataset.w;
  function show(e) {
    var r = svg.getBoundingClientRect(), sx = (e.clientX - r.left) * W / r.width;
    var i = Math.max(0, Math.min(11, Math.round((sx - L) / (PW / 11)))), px = L + PW * i / 11;
    cross.setAttribute('x1', px); cross.setAttribute('x2', px); cross.style.display = '';
    var fc = i >= A, html = '<b>' + M[i] + (fc ? ' · predikce' : ' · skutečnost') + '</b>';
    D.forEach(function (c, k) {
      var sp = 0; for (var j = A; j <= i; j++) sp += c.spread[j - A];
      html += '<div class="r s' + (k + 1) + '"><i></i><span>' + c.code + '</span><span>' + fmt(c.cum[i] / c.limit * 100, 1) + ' % · ' + fmt(c.cum[i], 1) + (fc ? ' ± ' + fmt(sp, 1) : '') + ' mil. Kč</span></div>';
    });
    tip.innerHTML = html; tip.style.display = 'block';
    var bx = box.getBoundingClientRect(), left = (px * r.width / W) + (r.left - bx.left) + 14;
    if (left + tip.offsetWidth > bx.width) left = (px * r.width / W) + (r.left - bx.left) - tip.offsetWidth - 14;
    tip.style.left = left + 'px'; tip.style.top = Math.max(0, e.clientY - bx.top - tip.offsetHeight / 2) + 'px';
  }
  hit.addEventListener('pointermove', show); hit.addEventListener('pointerdown', show);
  hit.addEventListener('pointerleave', function () { tip.style.display = 'none'; cross.style.display = 'none'; });
  var bt = document.getElementById('bartip');
  document.querySelectorAll('.bar').forEach(function (b) {
    b.addEventListener('pointerenter', function (e) { bt.textContent = b.dataset.tip; bt.style.display = 'block'; move(e); });
    b.addEventListener('pointermove', move);
    b.addEventListener('pointerleave', function () { bt.style.display = 'none'; });
  });
  function move(e) { bt.style.position = 'fixed'; bt.style.left = (e.clientX + 12) + 'px'; bt.style.top = (e.clientY - 34) + 'px'; }
})();
</script>
</body></html>`;
}
