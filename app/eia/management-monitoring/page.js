'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import MenuDrawer from '@/components/MenuDrawer';
import EiaSubNav from '@/components/EiaSubNav';
import EiaInquirySection from '@/components/EiaInquirySection';
import Footer from '@/components/Footer';

export default function ManagementMonitoringPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Navbar onOpenMenu={() => setMenuOpen(true)} />
      <MenuDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <EiaSubNav />

      <main className="eia-page">
        {/* HERO SECTION */}
        <section className="eia-hero-section">
          <div className="eia-hero-bg">
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=90"
              alt="Management & Monitoring Hero Coast"
              className="eia-hero-img"
            />
            <div className="eia-hero-overlay"></div>
          </div>
          <div className="eia-hero-content">
            <h1 className="eia-hero-title">
              Management<br />
              &amp;<br />
              Monitoring
            </h1>
          </div>
        </section>

        {/* OVERVIEW SECTION (EXACT MASTERPLAN QUOTE SECTION STYLING & CLASSES) */}
        <section className="masterplan-quote-section" style={{ padding: '7rem 0' }}>
          <div className="container">
            <span className="eia-eyebrow">OVERVIEW</span>
            <h2 className="masterplan-big-quote">
              Sazan Coast is committed to ensuring that environmental responsibility continues throughout the life of the development.
            </h2>
            <div className="quote-cols-grid">
              <p>
                A comprehensive management and monitoring framework will guide mitigation measures, track key environmental and social conditions, and measure performance over time.
              </p>
              <p>
                Through ongoing evaluation and adaptation, the project aims to respond to changing conditions, strengthen environmental outcomes, and uphold its commitments from development through long-term operation.
              </p>
            </div>
          </div>
        </section>

        {/* MEASURING WHAT MATTERS SPLIT SECTION */}
        <section className="eia-split-section">
          <div className="container">
            <div className="eia-split-grid">
              <div className="eia-split-text-col">
                <h2 className="eia-split-title">
                  Measuring<br />
                  What <em>Matters</em>
                </h2>
                <div className="eia-split-paragraphs">
                  <p className="eia-body-text">
                    The project will establish a comprehensive framework for environmental management and monitoring to support responsible development throughout the project lifecycle.
                  </p>
                  <p className="eia-body-text">
                    This framework will guide the implementation of mitigation measures, monitor key environmental and social conditions, and provide a basis for continuously evaluating and improving the project's environmental performance.
                  </p>
                </div>
              </div>
              <div className="eia-split-media-col">
                <img
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85"
                  alt="Coastal Flowers & Sea"
                  className="eia-split-img"
                />
              </div>
            </div>
          </div>
        </section>

        {/* INQUIRIES & MAP SECTION */}
        <EiaInquirySection />
      </main>

      <Footer />
    </>
  );
}
