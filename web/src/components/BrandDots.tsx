/** Malá značka TheraHUB (mřížka teček) pro tlačítka a odkazy do TheraHUB. */
export default function BrandDots({ size = 14 }: { size?: number }) {
  const step = size / 4;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="brand-dots" aria-hidden>
      {Array.from({ length: 16 }, (_, i) => (
        <circle key={i} cx={step / 2 + (i % 4) * step} cy={step / 2 + Math.floor(i / 4) * step} r={step * 0.32} fill="currentColor" opacity={i % 2 ? 1 : 0.55} />
      ))}
    </svg>
  );
}
