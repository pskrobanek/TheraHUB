import type { ReactNode } from 'react';
import { screens, type Screen } from '../../data/screens';
import type { CatalogApp } from '../../data/types';

// Náhled obrazovky mobilní aplikace ve viewBoxu 100 × 170.
const INK = '#1a2433';
const MUTED = '#8a90a6';
const SOFT = '#f3f4f8';

function Rows({ rows, y0, tint }: { rows: [string, string][]; y0: number; tint: string }) {
  return (
    <>
      {rows.map(([label, value], i) => {
        const y = y0 + i * 16;
        return (
          <g key={label + i}>
            <rect x="6" y={y - 7} width="88" height="13" rx="3" fill={SOFT} />
            <circle cx="11.5" cy={y - 0.5} r="2" fill={tint} />
            <text x="16" y={y + 1.6} fontSize="5.6" fill={INK}>
              {label}
            </text>
            {value && (
              <text x="90" y={y + 1.6} fontSize="5.4" fill={value === value.toUpperCase() && /[A-Z]/.test(value) ? '#c24343' : MUTED} textAnchor="end" fontWeight={600}>
                {value}
              </text>
            )}
          </g>
        );
      })}
    </>
  );
}

function Button({ label, tint }: { label: string; tint: string }) {
  return (
    <>
      <rect x="8" y="150" width="84" height="12" rx="4" fill={tint} />
      <text x="50" y="158" fontSize="5.6" fill="#fff" textAnchor="middle" fontWeight={600}>
        {label}
      </text>
    </>
  );
}

function chartPoints(values: number[], top: number, bottom: number): [number, number][] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values.map((v, i) => [12 + (i * 76) / (values.length - 1), bottom - ((v - min) / span) * (bottom - top)]);
}

function body(screen: Screen, tint: string): ReactNode {
  switch (screen.kind) {
    case 'form':
      return (
        <>
          {screen.rows.map(([label, level], i) => {
            const y = 48 + i * 20;
            return (
              <g key={label}>
                <text x="8" y={y} fontSize="5.8" fill={INK}>
                  {label}
                </text>
                {[0, 1, 2, 3].map((d) => (
                  <circle key={d} cx={62 + d * 8.5} cy={y - 2} r="2.8" fill={d < level ? tint : '#e3e6ee'} />
                ))}
              </g>
            );
          })}
          {screen.button && <Button label={screen.button} tint={tint} />}
        </>
      );
    case 'line': {
      const pts = chartPoints(screen.values, 48, 92);
      return (
        <>
          <rect x="6" y="40" width="88" height="60" rx="4" fill={tint} opacity="0.08" />
          {[56, 72, 88].map((y) => (
            <line key={y} x1="10" x2="90" y1={y} y2={y} stroke={tint} strokeOpacity="0.15" strokeWidth="0.5" />
          ))}
          <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={tint} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.4" fill={tint} />
          {screen.rows && <Rows rows={screen.rows} y0={116} tint={tint} />}
        </>
      );
    }
    case 'bars': {
      const max = Math.max(...screen.values);
      return (
        <>
          <rect x="6" y="40" width="88" height="60" rx="4" fill={tint} opacity="0.08" />
          {screen.values.map((v, i) => {
            const h = (v / max) * 46;
            return <rect key={i} x={12 + i * 11} y={94 - h} width="7" height={h} rx="1.5" fill={tint} opacity={i === screen.values.length - 1 ? 1 : 0.55} />;
          })}
          {['P', 'Ú', 'S', 'Č', 'P', 'S', 'N'].map((d, i) => (
            <text key={i} x={15.5 + i * 11} y="99" fontSize="3.6" fill={MUTED} textAnchor="middle">
              {d}
            </text>
          ))}
          {screen.rows && <Rows rows={screen.rows} y0={116} tint={tint} />}
        </>
      );
    }
    case 'list':
      return (
        <>
          <Rows rows={screen.rows} y0={48} tint={tint} />
          {screen.button && <Button label={screen.button} tint={tint} />}
        </>
      );
    case 'stat':
      return (
        <>
          <rect x="6" y="40" width="88" height="48" rx="4" fill={tint} opacity="0.08" />
          <text x="50" y="68" fontSize={screen.value.length > 3 ? 15 : 20} fontWeight={700} fill={tint} textAnchor="middle">
            {screen.value}
            <tspan fontSize="7" fill={MUTED} fontWeight={500}>
              {screen.unit && ` ${screen.unit}`}
            </tspan>
          </text>
          <rect x="18" y="76" width="64" height="3" rx="1.5" fill="#e3e6ee" />
          <rect x="18" y="76" width="40" height="3" rx="1.5" fill={tint} />
          <Rows rows={screen.rows} y0={104} tint={tint} />
        </>
      );
    case 'ecg': {
      let d = 'M8 66';
      for (let b = 0; b < 4; b++) {
        const x = 8 + b * 21;
        d += ` L${x + 5} 66 L${x + 6.5} 63 L${x + 8} 66 L${x + 10} 66 L${x + 11} 68 L${x + 12.5} 48 L${x + 14} 72 L${x + 15} 66 L${x + 17} 66 L${x + 19} 61 L${x + 21} 66`;
      }
      return (
        <>
          <rect x="6" y="40" width="88" height="46" rx="4" fill={tint} opacity="0.08" />
          <path d={d} fill="none" stroke={tint} strokeWidth="1.2" strokeLinejoin="round" />
          <text x="8" y="106" fontSize="16" fontWeight={700} fill={INK}>
            {screen.value}
            <tspan fontSize="6" fill={MUTED} fontWeight={500}>
              {` ${screen.unit}`}
            </tspan>
          </text>
          <Rows rows={screen.rows} y0={124} tint={tint} />
        </>
      );
    }
    case 'record':
      return (
        <>
          <text x="50" y="66" fontSize="16" fontWeight={700} fill={INK} textAnchor="middle">
            {screen.time}
          </text>
          {Array.from({ length: 21 }, (_, i) => {
            const h = 4 + Math.abs(Math.sin(i * 1.7)) * 18;
            return <rect key={i} x={10 + i * 3.9} y={92 - h / 2} width="2.2" height={h} rx="1" fill={tint} opacity="0.75" />;
          })}
          <circle cx="50" cy="138" r="11" fill="#e5484d" />
          <rect x="46" y="134" width="8" height="8" rx="1.5" fill="#fff" />
        </>
      );
    case 'camera':
      return (
        <>
          <rect x="6" y="38" width="88" height="104" rx="4" fill="#2a2f3a" />
          <ellipse cx="50" cy="90" rx="24" ry="30" fill="#c99a7a" opacity="0.55" />
          <ellipse cx="54" cy="86" rx="8" ry="6" fill="#d9534f" opacity="0.5" />
          {[
            'M14 50v-6h6',
            'M80 44h6v6',
            'M86 128v6h-6',
            'M20 134h-6v-6',
          ].map((p) => (
            <path key={p} d={p} fill="none" stroke="#fff" strokeWidth="1.2" />
          ))}
          <Button label={screen.button} tint={tint} />
        </>
      );
    case 'scan':
      return (
        <>
          <rect x="6" y="38" width="88" height="80" rx="4" fill="#111827" />
          <ellipse cx="36" cy="80" rx="15" ry="27" fill="#6b7280" opacity="0.55" />
          <ellipse cx="64" cy="80" rx="15" ry="27" fill="#6b7280" opacity="0.55" />
          <rect x="49" y="46" width="2" height="60" fill="#9ca3af" opacity="0.5" />
          <rect x="22" y="56" width="20" height="18" fill="none" stroke="#f87171" strokeWidth="1.2" rx="1" />
          <Rows rows={screen.rows} y0={132} tint={tint} />
        </>
      );
    case 'calendar':
      return (
        <>
          {['P', 'Ú', 'S', 'Č', 'P', 'S', 'N'].map((d, i) => (
            <text key={i} x={12 + i * 12.5} y="46" fontSize="4.5" fill={MUTED} textAnchor="middle">
              {d}
            </text>
          ))}
          {Array.from({ length: 28 }, (_, i) => {
            const col = i % 7;
            const row = Math.floor(i / 7);
            const shift = (i * 5 + 3) % 4;
            return (
              <rect
                key={i}
                x={7 + col * 12.5}
                y={50 + row * 14}
                width="10"
                height="11"
                rx="2"
                fill={shift === 0 ? tint : shift === 1 ? `${tint}66` : '#eef0f5'}
              />
            );
          })}
          <Rows rows={[['Ranní', '6'], ['Noční', '4']]} y0={116} tint={tint} />
        </>
      );
  }
}

function Phone({ screen, app }: { screen: Screen; app: CatalogApp }) {
  const gid = `scr-${app.id}`;
  return (
    <svg className="app-screen" viewBox="0 0 100 170" role="img" aria-label={`${app.name}: ${screen.title} (ilustrační náhled)`}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={app.tint} />
          <stop offset="1" stopColor={app.tint} stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <rect width="100" height="170" rx="8" fill="#fff" />
      <text x="8" y="7.5" fontSize="4.2" fill={INK} fontWeight={600}>
        9:41
      </text>
      <rect x="80" y="4" width="12" height="4" rx="1.5" fill="none" stroke={INK} strokeWidth="0.6" />
      <rect x="81" y="5" width="8" height="2" rx="0.8" fill={INK} />
      <rect x="0" y="11" width="100" height="21" fill={`url(#${gid})`} />
      <text x="8" y="24.5" fontSize="6.8" fill="#fff" fontWeight={700}>
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
        <Phone key={s.title} screen={s} app={app} />
      ))}
    </div>
  );
}
