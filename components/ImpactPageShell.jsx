'use client';

import { useState } from 'react';
import Navbar from './Navbar';
import MenuDrawer from './MenuDrawer';
import EiaInquirySection from './EiaInquirySection';
import SmoothScroll from './SmoothScroll';
import ImpactNav from './ImpactNav';

export default function ImpactPageShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <SmoothScroll>
    <div className="impact-page">
      <Navbar onOpenMenu={() => setMenuOpen(true)} />
      <MenuDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <ImpactNav />
      <main>{children}</main>
      <EiaInquirySection parallax />
    </div>
    </SmoothScroll>
  );
}
