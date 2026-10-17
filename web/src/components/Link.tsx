import type { AnchorHTMLAttributes } from 'react';
import { navigate } from '../lib/route';

/** Interní odkaz: mění obrazovku přes `navigate`, ne přes načtení stránky. */
export default function Link({ href, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        navigate(href);
      }}
      {...rest}
    />
  );
}
