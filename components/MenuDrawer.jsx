'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const groups = {
  impact: {
    title: 'Project Impact',
    items: [
      { title: 'Environmental Impact', href: '/eia', featured: true },
      { title: 'EIA Overview', href: '/eia' },
      { title: 'Environmental Stewardship', href: '/eia/environmental-stewardship' },
      { title: 'Economic Impact', href: '/economic-impact', featured: true },
      { title: 'Corporate Social Responsibility', href: '/corporate-social-responsibility', featured: true },
      { title: 'Celebrating Existing Nature', soon: true, featured: true },
    ],
  },
  governance: {
    title: 'Governance & Engagement',
    items: [
      { title: 'Management & Monitoring', href: '/eia/management-monitoring' },
      { title: 'Public Consultation', href: '/eia/public-consultation' },
      { title: 'Stakeholder Feedback', href: '/eia/stakeholder-feedback' },
    ],
  },
  partners: {
    title: 'Partners',
    items: [
      { title: 'Project Partners', soon: true },
      { title: 'Involved Architects', soon: true },
      { title: 'Involved Specialists', soon: true },
    ],
  },
};

export default function MenuDrawer({ isOpen, onClose }) {
  const [openGroup, setOpenGroup] = useState(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen, onClose]);

  const renderGroup = (id) => {
    const group = groups[id];
    const expanded = openGroup === id;
    return (
      <div className={`menu-accordion ${expanded ? 'is-open' : ''}`} key={id}>
        <button
          type="button"
          className="menu-accordion-trigger"
          aria-expanded={expanded}
          aria-controls={`menu-group-${id}`}
          onClick={() => setOpenGroup(expanded ? null : id)}
        >
          <span>{group.title}</span>
          <i aria-hidden="true">{expanded ? '▴' : '▾'}</i>
        </button>
        <div className="menu-accordion-panel" id={`menu-group-${id}`}>
          <div>
            {group.items.map((item) => item.soon ? (
              <span
                key={item.title}
                className={`menu-subitem is-soon ${item.featured ? 'is-featured' : ''}`}
                aria-disabled="true"
              >
                {item.title} <small>Soon</small>
              </span>
            ) : (
              <Link
                key={item.title}
                href={item.href}
                className={`menu-subitem ${item.featured ? 'is-featured' : ''}`}
                onClick={onClose}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`menu-drawer ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen}>
      <button className="menu-drawer-bg" type="button" onClick={onClose} aria-label="Close menu" />
      <aside className="menu-drawer-container" aria-label="Main menu">
        <button className="menu-simple-close" type="button" onClick={onClose} aria-label="Close menu">
          <span aria-hidden="true">×</span> Close
        </button>

        <nav className="menu-links">
          <span className="menu-item is-soon" aria-disabled="true">About Project <small>Soon</small></span>
          {renderGroup('impact')}
          {renderGroup('governance')}
          {renderGroup('partners')}
          <Link href="/masterplan2" className="menu-item" onClick={onClose}>Masterplan <span className="menu-masterplan-star" aria-hidden="true">★</span></Link>
          <span className="menu-item is-soon" aria-disabled="true">FAQs <small>Soon</small></span>
        </nav>
      </aside>
    </div>
  );
}
