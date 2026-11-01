import { useId } from 'react';

/**
 * Logo přihlášeného poskytovatele jako bílý otisk (silueta budovy s věží),
 * překreslené podle podkladu, který dodal uživatel. Určeno do tmavého kruhu.
 */
export default function HospitalMark({ width = 30 }: { width?: number }) {
  const mask = useId();
  const vb = { x: 75, y: 17, w: 355, h: 210 };
  return (
    <svg width={width} height={(width * vb.h) / vb.w} viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} aria-hidden>
      <defs>
        <mask id={mask}>
          <rect x={vb.x} y={vb.y} width={vb.w} height={vb.h} fill="#fff" />
          <circle cx="285" cy="37" r="7" fill="#000" />
        </mask>
      </defs>
      <g fill="currentColor" mask={`url(#${mask})`}>
        {/* spodní pás */}
        <rect x="80" y="168" width="345" height="54" />
        {/* levé křídlo se šikmou střechou */}
        <polygon points="80,170 80,104 88,100 118,100 120,111 245,128 258,131 258,170" />
        {/* tenká linka vlevo od věže */}
        <polygon points="249,84 262,84 262,90 255,90 255,130 249,130" />
        {/* věž */}
        <polygon points="266,170 266,32 275,22 296,22 302,30 302,170" />
        <rect x="302" y="84" width="14" height="16" />
        <rect x="310" y="100" width="6" height="40" />
        {/* pravé křídlo a malá věžička */}
        <polygon points="316,170 316,137 346,137 398,143 398,170" />
        <rect x="406" y="143" width="19" height="27" />
      </g>
    </svg>
  );
}
