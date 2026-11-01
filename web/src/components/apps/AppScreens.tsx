import type { ReactNode } from 'react';
import { screens, type Screen } from '../../data/screens';
import type { CatalogApp } from '../../data/types';

// Náhled obrazovky aplikace na šířku ve viewBoxu 160 × 100: lišta okna, hlavička aplikace, obsah.
const INK = '#1a2433';
const MUTED = '#8a90a6';
const SOFT = '#f3f4f8';
const TOP = 28;
const BOTTOM = 94;

type Row = [string, string];

function Rows({ rows, x, w, y0, tint, step = 13 }: { rows: Row[]; x: number; w: number; y0: number; tint: string; step?: number }) {
  return (
    <>
      {rows.map(([label, value], i) => {
        const y = y0 + i * step;
        const alert = value === value.toUpperCase() && /[A-Z]/.test(value);
        return (
          <g key={label + i}>
            <rect x={x} y={y - 5.5} width={w} height="10" rx="2.5" fill={SOFT} />
            <circle cx={x + 4.5} cy={y - 0.5} r="1.6" fill={tint} />
            <text x={x + 8.5} y={y + 1.3} fontSize="4.6" fill={INK}>
              {label}
            </text>
            {value && (
              <text x={x + w - 3} y={y + 1.3} fontSize="4.4" fill={alert ? '#c24343' : MUTED} textAnchor="end" fontWeight={600}>
                {value}
              </text>
            )}
          </g>
        );
      })}
    </>
  );
}

function Button({ label, tint, x = 112, w = 42 }: { label: string; tint: string; x?: number; w?: number }) {
  return (
    <>
      <rect x={x} y={BOTTOM - 10} width={w} height="10" rx="3" fill={tint} />
      <text x={x + w / 2} y={BOTTOM - 3.6} fontSize="4.6" fill="#fff" textAnchor="middle" fontWeight={600}>
        {label}
      </text>
    </>
  );
}

function chartPoints(values: number[], x0: number, x1: number, top: number, bottom: number): [number, number][] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values.map((v, i) => [x0 + (i * (x1 - x0)) / (values.length - 1), bottom - ((v - min) / span) * (bottom - top)]);
}

/** Panel s grafem vlevo (x 6–102). */
function ChartPanel({ children, tint }: { children: ReactNode; tint: string }) {
  return (
    <>
      <rect x="6" y={TOP} width="96" height={BOTTOM - TOP} rx="3" fill={tint} opacity="0.08" />
      {[44, 60, 76].map((y) => (
        <line key={y} x1="10" x2="98" y1={y} y2={y} stroke={tint} strokeOpacity="0.15" strokeWidth="0.4" />
      ))}
      {children}
    </>
  );
}

const days = ['P', 'Ú', 'S', 'Č', 'P', 'S', 'N'];

function body(screen: Screen, tint: string): ReactNode {
  switch (screen.kind) {
    case 'form':
      return (
        <>
          {screen.rows.map(([label, level], i) => {
            const y = TOP + 8 + i * 13;
            return (
              <g key={label}>
                <rect x="6" y={y - 6} width="96" height="11" rx="2.5" fill={SOFT} />
                <text x="10" y={y + 1.3} fontSize="4.8" fill={INK}>
                  {label}
                </text>
                {[0, 1, 2, 3].map((d) => (
                  <circle key={d} cx={72 + d * 7.5} cy={y - 0.5} r="2.4" fill={d < level ? tint : '#e3e6ee'} />
                ))}
              </g>
            );
          })}
          <rect x="108" y={TOP} width="46" height="42" rx="3" fill={tint} opacity="0.08" />
          <text x="131" y={TOP + 22} fontSize="12" fontWeight={700} fill={tint} textAnchor="middle">
            {screen.rows.filter(([, l]) => l >= 2).length}/{screen.rows.length}
          </text>
          <text x="131" y={TOP + 32} fontSize="4.2" fill={MUTED} textAnchor="middle">
            zhoršené
          </text>
          {screen.button && <Button label={screen.button} tint={tint} />}
        </>
      );
    case 'line': {
      const pts = chartPoints(screen.values, 12, 96, TOP + 8, BOTTOM - 8);
      return (
        <>
          <ChartPanel tint={tint}>
            <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={tint} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
            <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2" fill={tint} />
          </ChartPanel>
          {screen.rows && <Rows rows={screen.rows} x={108} w={46} y0={TOP + 6} tint={tint} />}
        </>
      );
    }
    case 'bars': {
      const max = Math.max(...screen.values);
      return (
        <>
          <ChartPanel tint={tint}>
            {screen.values.map((v, i) => {
              const h = (v / max) * 48;
              return <rect key={i} x={14 + i * 12} y={BOTTOM - 10 - h} width="7" height={h} rx="1.3" fill={tint} opacity={i === screen.values.length - 1 ? 1 : 0.55} />;
            })}
            {days.map((d, i) => (
              <text key={i} x={17.5 + i * 12} y={BOTTOM - 4} fontSize="3.4" fill={MUTED} textAnchor="middle">
                {d}
              </text>
            ))}
          </ChartPanel>
          {screen.rows && <Rows rows={screen.rows} x={108} w={46} y0={TOP + 6} tint={tint} />}
        </>
      );
    }
    case 'list':
      return (
        <>
          <Rows rows={screen.rows} x={6} w={148} y0={TOP + 6} tint={tint} step={14} />
          {screen.button && <Button label={screen.button} tint={tint} />}
        </>
      );
    case 'stat':
      return (
        <>
          <rect x="6" y={TOP} width="70" height={BOTTOM - TOP} rx="3" fill={tint} opacity="0.08" />
          <text x="41" y={TOP + 32} fontSize={screen.value.length > 3 ? 13 : 18} fontWeight={700} fill={tint} textAnchor="middle">
            {screen.value}
            <tspan fontSize="6" fill={MUTED} fontWeight={500}>
              {screen.unit && ` ${screen.unit}`}
            </tspan>
          </text>
          <rect x="16" y={TOP + 42} width="50" height="2.6" rx="1.3" fill="#e3e6ee" />
          <rect x="16" y={TOP + 42} width="32" height="2.6" rx="1.3" fill={tint} />
          <Rows rows={screen.rows} x={82} w={72} y0={TOP + 6} tint={tint} />
        </>
      );
    case 'ecg': {
      let d = `M8 ${TOP + 22}`;
      for (let b = 0; b < 7; b++) {
        const x = 8 + b * 20.5;
        const y = TOP + 22;
        d += ` L${x + 5} ${y} L${x + 6.5} ${y - 3} L${x + 8} ${y} L${x + 10} ${y} L${x + 11} ${y + 2} L${x + 12.5} ${y - 17} L${x + 14} ${y + 6} L${x + 15} ${y} L${x + 17} ${y} L${x + 19} ${y - 4} L${x + 20.5} ${y}`;
      }
      return (
        <>
          <rect x="6" y={TOP} width="148" height="36" rx="3" fill={tint} opacity="0.08" />
          <path d={d} fill="none" stroke={tint} strokeWidth="1" strokeLinejoin="round" />
          <text x="8" y={BOTTOM - 6} fontSize="16" fontWeight={700} fill={INK}>
            {screen.value}
            <tspan fontSize="5.5" fill={MUTED} fontWeight={500}>
              {` ${screen.unit}`}
            </tspan>
          </text>
          <Rows rows={screen.rows} x={60} w={94} y0={TOP + 46} tint={tint} step={12} />
        </>
      );
    }
    case 'record':
      return (
        <>
          <rect x="6" y={TOP} width="52" height={BOTTOM - TOP} rx="3" fill={tint} opacity="0.08" />
          <text x="32" y={TOP + 26} fontSize="12" fontWeight={700} fill={INK} textAnchor="middle">
            {screen.time}
          </text>
          <circle cx="32" cy={TOP + 46} r="9" fill="#e5484d" />
          <rect x="28.5" y={TOP + 42.5} width="7" height="7" rx="1.3" fill="#fff" />
          {Array.from({ length: 24 }, (_, i) => {
            const h = 4 + Math.abs(Math.sin(i * 1.7)) * 30;
            return <rect key={i} x={64 + i * 3.8} y={(TOP + BOTTOM) / 2 - h / 2} width="2.1" height={h} rx="1" fill={tint} opacity="0.75" />;
          })}
        </>
      );
    case 'camera':
      return (
        <>
          <rect x="6" y={TOP} width="100" height={BOTTOM - TOP} rx="3" fill="#2a2f3a" />
          <ellipse cx="56" cy="61" rx="30" ry="22" fill="#c99a7a" opacity="0.55" />
          <ellipse cx="60" cy="58" rx="10" ry="6" fill="#d9534f" opacity="0.5" />
          {[`M12 ${TOP + 10}v-5h5`, `M95 ${TOP + 5}h5v5`, `M100 ${BOTTOM - 10}v5h-5`, `M17 ${BOTTOM - 5}h-5v-5`].map((p) => (
            <path key={p} d={p} fill="none" stroke="#fff" strokeWidth="1" />
          ))}
          {[0, 1].map((i) => (
            <rect key={i} x="112" y={TOP + i * 22} width="42" height="18" rx="2.5" fill="#d4b8a4" opacity={0.5 + i * 0.2} />
          ))}
          <Button label={screen.button} tint={tint} />
        </>
      );
    case 'scan':
      return (
        <>
          <rect x="6" y={TOP} width="86" height={BOTTOM - TOP} rx="3" fill="#111827" />
          <ellipse cx="34" cy="61" rx="17" ry="26" fill="#6b7280" opacity="0.55" />
          <ellipse cx="64" cy="61" rx="17" ry="26" fill="#6b7280" opacity="0.55" />
          <rect x="48" y={TOP + 4} width="2" height="58" fill="#9ca3af" opacity="0.5" />
          <rect x="20" y={TOP + 10} width="22" height="18" fill="none" stroke="#f87171" strokeWidth="1" rx="1" />
          <Rows rows={screen.rows} x={98} w={56} y0={TOP + 6} tint={tint} />
        </>
      );
    case 'calendar':
      return (
        <>
          {days.map((d, i) => (
            <text key={i} x={12 + i * 14} y={TOP + 3} fontSize="4" fill={MUTED} textAnchor="middle">
              {d}
            </text>
          ))}
          {Array.from({ length: 28 }, (_, i) => {
            const col = i % 7;
            const row = Math.floor(i / 7);
            const shift = (i * 5 + 3) % 4;
            return (
              <rect key={i} x={6 + col * 14} y={TOP + 6 + row * 15} width="12" height="12" rx="2" fill={shift === 0 ? tint : shift === 1 ? `${tint}66` : '#eef0f5'} />
            );
          })}
          <Rows rows={[['Ranní', '6'], ['Noční', '4'], ['Volno', '3']]} x={108} w={46} y0={TOP + 8} tint={tint} />
        </>
      );
  }
}

function Window({ screen, app }: { screen: Screen; app: CatalogApp }) {
  const gid = `scr-${app.id}`;
  return (
    <svg className="app-screen" viewBox="0 0 160 100" role="img" aria-label={`${app.name}: ${screen.title} (ilustrační náhled)`}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={app.tint} />
          <stop offset="1" stopColor={app.tint} stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <rect width="160" height="100" rx="5" fill="#fff" />
      {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
        <circle key={c} cx={6 + i * 4.5} cy="4.5" r="1.4" fill={c} />
      ))}
      <rect x="0" y="9" width="160" height="14" fill={`url(#${gid})`} />
      <text x="7" y="18.4" fontSize="6" fill="#fff" fontWeight={700}>
        {app.name}
      </text>
      <text x="153" y="18.4" fontSize="4.6" fill="#fff" opacity="0.85" textAnchor="end">
        {screen.title}
      </text>
      {body(screen, app.tint)}
    </svg>
  );
}

export default function AppScreens({ app }: { app: CatalogApp }) {
  const list = screens[app.id];
  if (!list) return null;
  return (
    <div className="app-screens">
      {list.map((s) => (
        <Window key={s.title} screen={s} app={app} />
      ))}
    </div>
  );
}
