'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  ['Environmental Impact', '/eia'],
  ['Economic Impact', '/economic-impact'],
  ['Corporate Social Responsibility', '/corporate-social-responsibility'],
  ['Experiences', '/experiences'],
];

export default function ImpactNav() {
  const pathname = usePathname();
  const environmentalActive = pathname.startsWith('/eia');

  return (
    <nav className="impact-nav" aria-label="Discover Sazan Coast">
      {links.map(([label, href]) => {
        const active = href === '/eia' ? pathname.startsWith('/eia') : pathname === href;
        return (
          <div className="impact-nav-group" key={href}>
            <Link href={href} aria-current={active ? 'page' : undefined}>{label}</Link>
            {href === '/eia' && environmentalActive && (
              <div className="impact-subnav" aria-label="Environmental Impact pages">
                <Link href="/eia" aria-current={pathname === '/eia' ? 'page' : undefined}>— Overview</Link>
                <Link href="/eia/environmental-stewardship" aria-current={pathname === '/eia/environmental-stewardship' ? 'page' : undefined}>— Environmental Stewardship</Link>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
