'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function EiaSubNav() {
  const pathname = usePathname();

  const tabs = [
    { name: 'EIA Overview', href: '/eia' },
    { name: 'Environmental Stewardship', href: '/eia/environmental-stewardship' },
  ];

  return (
    <nav className="eia-subnav">
      <div className="eia-subnav-container">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`eia-subnav-link ${isActive ? 'active' : ''}`}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
