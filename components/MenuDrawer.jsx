'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MenuDrawer({ isOpen, onClose }) {
  const [previewImg, setPreviewImg] = useState('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=85');

  const menuItems = [
    { num: '01', title: 'The Sanctuary', href: '/', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=85' },
    { num: '02', title: 'Masterplan', href: '/masterplan', image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1000&q=85' },
    { num: '03', title: 'Experiences', href: '/experiences', image: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1000&q=85' },
    { num: '04', title: 'Environmental & EIA', href: '/eia/management-monitoring', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=85' },
    { num: '05', title: 'Mediterranean Beauty', href: '/#beauty', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=85' },
    { num: '06', title: 'Private Inquiries', href: '/#inquiries', image: 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?auto=format&fit=crop&w=1000&q=85' },
    { num: '07', title: 'Economic Impact', href: '/economic-impact', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=85' },
    { num: '08', title: 'Social Responsibility', href: '/corporate-social-responsibility', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=85' },
  ];

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen, onClose]);

  return (
    <div className={`menu-drawer ${isOpen ? 'open' : ''}`}>
      <div className="menu-drawer-bg"></div>
      <div className="menu-drawer-container">
        <button className="menu-simple-close" type="button" onClick={onClose} aria-label="Close menu">Close <span aria-hidden="true">×</span></button>
        <div className="menu-drawer-body">
          <div className="menu-links">
            {menuItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="menu-item"
                onMouseEnter={() => setPreviewImg(item.image)}
                onClick={onClose}
              >
                <span className="title">{item.title}</span>
              </Link>
            ))}
          </div>

          <div className="menu-preview">
            <div className="preview-img-wrapper">
              <img src={previewImg} alt="Preview" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
