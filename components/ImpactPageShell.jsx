'use client';

import { useState } from 'react';
import Navbar from './Navbar';
import MenuDrawer from './MenuDrawer';
import InquiryForm from './InquiryForm';
import Footer from './Footer';
import ImpactNav from './ImpactNav';

export default function ImpactPageShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="impact-page">
      <Navbar onOpenMenu={() => setMenuOpen(true)} />
      <MenuDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <ImpactNav />
      <main>{children}</main>
      <div className="home-inquiry-map">
        <InquiryForm />
      </div>
      <Footer />
    </div>
  );
}
