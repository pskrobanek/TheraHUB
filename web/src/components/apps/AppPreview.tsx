import type { StoreApp } from '../../data/types';

/** Deterministické „náhodné“ číslo 0–1 z řetězce, aby měl každý náhled jiné rozložení. */
function seeded(id: string, n: number): number {
  let h = 2166136261;
  for (const ch of `${id}:${n}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return ((h >>> 0) % 1000) / 1000;
}

/** Schematický náhled obrazovky aplikace v její barvě (v demu místo reálného screenshotu). */
export default function AppPreview({ app }: { app: StoreApp }) {
  const tint = app.tint;
  const r = (n: number) => seeded(app.id, n);
  const bars = Array.from({ length: 7 }, (_, i) => 14 + Math.round(r(i) * 30));
  const line = Array.from({ length: 9 }, (_, i) => `${20 + i * 20},${68 - Math.round(r(10 + i) * 26)}`).join(' ');
  const chart = r(20) > 0.5;

  return (
    <svg className="preview" viewBox="0 0 200 96" aria-hidden>
      <rect width="200" height="96" rx="6" fill="#fff" />
      {/* horní lišta */}
      <rect width="200" height="14" fill={tint} opacity="0.9" />
      <circle cx="9" cy="7" r="3" fill="#fff" opacity="0.85" />
      <rect x="16" y="5" width="46" height="4" rx="2" fill="#fff" opacity="0.8" />
      <rect x="170" y="4" width="22" height="6" rx="3" fill="#fff" opacity="0.6" />
      {/* levý panel */}
      <rect x="0" y="14" width="44" height="82" fill={tint} opacity="0.06" />
      {[22, 32, 42, 52].map((y, i) => (
        <rect key={y} x="7" y={y} width={i === 1 ? 30 : 24} height="4" rx="2" fill={tint} opacity={i === 1 ? 0.7 : 0.25} />
      ))}
      {/* obsah */}
      <rect x="52" y="22" width="60" height="5" rx="2" fill="#1a2433" opacity="0.8" />
      <rect x="52" y="31" width="90" height="3" rx="1.5" fill="#1a2433" opacity="0.25" />
      {chart ? (
        <>
          <rect x="52" y="42" width="140" height="46" rx="4" fill={tint} opacity="0.07" />
          <polyline points={line.replace(/(\d+),/g, (_, x) => `${Number(x) + 40},`)} fill="none" stroke={tint} strokeWidth="2" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <rect x="52" y="42" width="140" height="46" rx="4" fill={tint} opacity="0.07" />
          {bars.map((h, i) => (
            <rect key={i} x={60 + i * 18} y={84 - h} width="10" height={h} rx="2" fill={tint} opacity={0.35 + r(30 + i) * 0.5} />
          ))}
        </>
      )}
      <rect x="150" y="20" width="42" height="14" rx="4" fill={tint} opacity="0.9" />
      <rect x="157" y="25" width="28" height="4" rx="2" fill="#fff" opacity="0.9" />
    </svg>
  );
}
