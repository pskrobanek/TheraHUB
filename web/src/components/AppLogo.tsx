// Loga fiktivních demo aplikací: barevný přechod + vlastní symbol podle toho, co aplikace dělá.
// Nejde o loga reálných produktů ani firem.
import type { ReactNode } from 'react';

const W = { stroke: '#fff', strokeWidth: 2.6, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const;

/** Clona fotoaparátu: šestiúhelník a lamely k obvodu. */
function aperture(): ReactNode {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i;
    return [24 + 5.5 * Math.cos(a), 24 + 5.5 * Math.sin(a)];
  });
  return (
    <>
      <circle cx="24" cy="24" r="12" {...W} />
      <polygon points={pts.map((p) => p.join(',')).join(' ')} {...W} strokeWidth={2} />
      {pts.map(([x, y], i) => {
        const a = (Math.PI / 3) * i + Math.PI / 2;
        return <line key={i} x1={x} y1={y} x2={x + 7.2 * Math.cos(a)} y2={y + 7.2 * Math.sin(a)} {...W} strokeWidth={2} />;
      })}
    </>
  );
}

const logos: Record<string, { from: string; to: string; mark: ReactNode }> = {
  toxitrack: {
    from: '#5b6cff',
    to: '#6d28d9',
    mark: (
      <>
        <path d="M14 15h20M24 15v6" {...W} strokeWidth={3} />
        <path d="M24 21c-4.5 5-6.5 8.2-6.5 11a6.5 6.5 0 0 0 13 0c0-2.8-2-6-6.5-11z" fill="#fff" />
      </>
    ),
  },
  cardiowatch: {
    from: '#f43f5e',
    to: '#9d174d',
    mark: (
      <>
        <path d="M24 35s-11.5-6.6-11.5-14.2A6.2 6.2 0 0 1 24 17.3a6.2 6.2 0 0 1 11.5 3.5C35.5 28.4 24 35 24 35z" {...W} />
        <path d="M14 24h5.5l2-4 3 8 2-4H34" {...W} strokeWidth={2.2} />
      </>
    ),
  },
  visitscribe: {
    from: '#475569',
    to: '#0f172a',
    mark: (
      <>
        <path d="M14 13h20a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H23l-6 5v-5h-3a4 4 0 0 1-4-4V17a4 4 0 0 1 4-4z" {...W} />
        <path d="M16.5 20h15M16.5 25h9" {...W} strokeWidth={2.2} />
      </>
    ),
  },
  polykej: {
    from: '#22d3ee',
    to: '#2563eb',
    mark: (
      <>
        {[17, 24, 31].map((y) => (
          <path key={y} d={`M12 ${y}q3-4 6 0t6 0 6 0 6 0`} {...W} />
        ))}
      </>
    ),
  },
  nutriplan: {
    from: '#a3e635',
    to: '#15803d',
    mark: (
      <>
        <path d="M13.5 34.5C13.5 20.5 21.5 13 35 13c0 13.5-7.5 21.5-21.5 21.5z" fill="#fff" />
        <path d="M14 34l14-14" stroke="#15803d" strokeWidth={2} strokeLinecap="round" />
      </>
    ),
  },
  dermafoto: { from: '#fbbf24', to: '#c2410c', mark: aperture() },
  klid: {
    from: '#c4b5fd',
    to: '#6d28d9',
    mark: (
      <>
        <path d="M29 12.5a11.5 11.5 0 1 0 6.5 20.8A9.5 9.5 0 1 1 29 12.5z" fill="#fff" />
        <circle cx="34" cy="16" r="1.6" fill="#fff" />
        <circle cx="37" cy="22" r="1.1" fill="#fff" />
      </>
    ),
  },
  bolestdenik: {
    from: '#fb7185',
    to: '#be123c',
    mark: (
      <>
        <path d="M12.5 31a11.5 11.5 0 0 1 23 0" {...W} strokeWidth={3} />
        <path d="M24 31l6.5-8" {...W} strokeWidth={3} />
        <circle cx="24" cy="31" r="2.6" fill="#fff" />
      </>
    ),
  },
  lekyhlidac: {
    from: '#22d3ee',
    to: '#0e7490',
    mark: (
      <g transform="rotate(-45 24 24)">
        <rect x="13" y="18.5" width="22" height="11" rx="5.5" {...W} />
        <path d="M18.5 18.5H24v11h-5.5a5.5 5.5 0 0 1 0-11z" fill="#fff" />
      </g>
    ),
  },
  krokomer: {
    from: '#94a3b8',
    to: '#1e293b',
    mark: (
      <>
        <ellipse cx="18" cy="22" rx="4.2" ry="6.2" fill="#fff" />
        <circle cx="18.6" cy="32" r="2.8" fill="#fff" />
        <ellipse cx="30" cy="16" rx="4.2" ry="6.2" fill="#fff" />
        <circle cx="30.6" cy="26" r="2.8" fill="#fff" />
      </>
    ),
  },
  radiotriage: {
    from: '#60a5fa',
    to: '#1e3a8a',
    mark: (
      <>
        <path d="M12 18v-3a3 3 0 0 1 3-3h3M30 12h3a3 3 0 0 1 3 3v3M36 30v3a3 3 0 0 1-3 3h-3M18 36h-3a3 3 0 0 1-3-3v-3" {...W} />
        <path d="M22.5 17.5c-4 1-6 6-6 10.5 0 2 1.8 3 3.6 2.2l2.4-1.2z" fill="#fff" />
        <path d="M25.5 17.5c4 1 6 6 6 10.5 0 2-1.8 3-3.6 2.2l-2.4-1.2z" fill="#fff" />
        <path d="M24 14.5v6" {...W} strokeWidth={2} />
      </>
    ),
  },
  sepsisalert: {
    from: '#fb923c',
    to: '#b91c1c',
    mark: (
      <>
        <path d="M24 11.5l13 23H11z" {...W} />
        <path d="M16.5 28.5h4l2-4 2.5 6 2-3h4.5" {...W} strokeWidth={2.1} />
      </>
    ),
  },
  bedflow: {
    from: '#2dd4bf',
    to: '#0f766e',
    mark: (
      <>
        <path d="M11.5 33V15M11.5 27h25v6M36.5 27v-3a4.5 4.5 0 0 0-4.5-4.5H22.5V27" {...W} />
        <circle cx="17" cy="22.5" r="2.6" fill="#fff" />
      </>
    ),
  },
  onkokohorta: {
    from: '#a78bfa',
    to: '#4c1d95',
    mark: (
      <>
        <path d="M24 25L15 16M24 25l9-10M24 25l-9 8M24 25l10 8" stroke="#fff" strokeWidth={2} strokeLinecap="round" opacity={0.8} />
        {[
          [15, 16],
          [33, 15],
          [24, 25],
          [15, 33],
          [34, 33],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={x === 24 ? 4 : 3} fill="#fff" />
        ))}
      </>
    ),
  },
  smenaplan: {
    from: '#94a3b8',
    to: '#334155',
    mark: (
      <>
        <rect x="11.5" y="14" width="25" height="22" rx="3.5" {...W} />
        <path d="M11.5 20.5h25M18 11v5M30 11v5" {...W} />
        {[
          [18, 26],
          [24, 26],
          [30, 26],
          [18, 31],
          [24, 31],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill="#fff" />
        ))}
        <rect x="28" y="29" width="4" height="4" rx="1" fill="#fff" />
      </>
    ),
  },
};

export default function AppLogo({ appId, size }: { appId: string; size: number }) {
  const logo = logos[appId];
  if (!logo) return null;
  const gid = `lg-${appId}`;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className="app-logo" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={logo.from} />
          <stop offset="1" stopColor={logo.to} />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill={`url(#${gid})`} />
      {logo.mark}
    </svg>
  );
}

export const hasLogo = (appId: string): boolean => appId in logos;
