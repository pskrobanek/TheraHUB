import { useId } from 'react';

/** Obecná značka moderní nemocnice (budova s křížem). Nejde o logo žádné konkrétní nemocnice. */
export default function HospitalMark({ size = 22 }: { size?: number }) {
  const mask = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <defs>
        <mask id={mask}>
          <rect width="24" height="24" fill="#fff" />
          {/* kříž, vchod a okna jako výřezy */}
          <rect x="11.2" y="6" width="1.6" height="5.6" rx="0.4" fill="#000" />
          <rect x="9.2" y="8" width="5.6" height="1.6" rx="0.4" fill="#000" />
          <rect x="10.7" y="16.2" width="2.6" height="4.5" rx="0.6" fill="#000" />
          <rect x="4.6" y="13" width="1.8" height="1.3" rx="0.4" fill="#000" />
          <rect x="4.6" y="16.2" width="1.8" height="1.3" rx="0.4" fill="#000" />
          <rect x="17.6" y="13" width="1.8" height="1.3" rx="0.4" fill="#000" />
          <rect x="17.6" y="16.2" width="1.8" height="1.3" rx="0.4" fill="#000" />
        </mask>
      </defs>
      <g fill="currentColor" mask={`url(#${mask})`}>
        <rect x="8.4" y="3" width="7.2" height="17.5" rx="1.6" />
        <rect x="3.2" y="10.4" width="4.4" height="10.1" rx="1.2" />
        <rect x="16.4" y="10.4" width="4.4" height="10.1" rx="1.2" />
      </g>
    </svg>
  );
}
