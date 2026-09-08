'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const eiaLinks = [
  ['Management & Monitoring', '/eia/management-monitoring'],
  ['Public Consultation', '/eia/public-consultation'],
  ['Stakeholder Feedback', '/eia/stakeholder-feedback'],
];

const generalLinks = [
  ['Economic Impact', '/economic-impact'],
  ['Corporate Social Responsibility', '/corporate-social-responsibility'],
  ['Experiences', '/experiences'],
];

export default function ImpactNav() {
  const pathname = usePathname();

  const isEiaPage = pathname ? pathname.startsWith('/eia') : false;
  const links = isEiaPage ? eiaLinks : generalLinks;

  return (
    <nav className="impact-nav" aria-label="Discover Sazan Coast">
      {links.map(([label, href]) => {
        const active = pathname === href || (href === '/eia/management-monitoring' && pathname === '/eia');
        return (
          <div className="impact-nav-group" key={href}>
            <Link href={href} aria-current={active ? 'page' : undefined}>{label}</Link>
          </div>
        );
      })}
    </nav>
  );
}


