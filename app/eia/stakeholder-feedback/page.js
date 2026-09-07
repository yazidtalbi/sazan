'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import MenuDrawer from '@/components/MenuDrawer';
import EiaSubNav from '@/components/EiaSubNav';
import EiaInquirySection from '@/components/EiaInquirySection';
import Footer from '@/components/Footer';

export default function StakeholderFeedbackPage() {
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
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2400&q=90"
              alt="Stakeholder Feedback Hero Coast"
              className="eia-hero-img"
            />
            <div className="eia-hero-overlay"></div>
          </div>
          <div className="eia-hero-content">
            <h1 className="eia-hero-title">
              Stakeholder<br />
              Feedback
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

        {/* EVERY VOICE MATTERS SPLIT SECTION */}
        <section className="eia-split-section">
          <div className="container">
            <div className="eia-split-grid">
              <div className="eia-split-text-col">
                <h2 className="eia-split-title">
                  Every Voice<br />
                  <em>Matters</em>
                </h2>
                <div className="eia-split-paragraphs">
                  <p className="eia-body-text">
                    Stakeholder feedback is an integral part of the EIA process and provides an opportunity for affected communities, public authorities, interested organizations, and other stakeholders to raise questions, provide information, and express concerns regarding the proposed development.
                  </p>
                </div>
              </div>
              <div className="eia-split-media-col">
                <img
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=85"
                  alt="Marina Promenade"
                  className="eia-split-img"
                />
              </div>
            </div>
          </div>
        </section>

        {/* DOCUMENTED FEEDBACK SECTION (EXACT MASTERPLAN QUOTE SECTION STYLING & CLASSES) */}
        <section className="masterplan-quote-section" style={{ padding: '6rem 0 8rem' }}>
          <div className="container">
            <h2 className="masterplan-big-quote">
              Documented <em>Feedback</em>
            </h2>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.4rem, 2.4vw, 2.2rem)', fontWeight: 400, color: 'var(--text-main)', maxWidth: '840px', margin: '0 auto 2.5rem', textAlign: 'center', lineHeight: 1.25 }}>
              Where stakeholder input identifies new information, concerns, or potential impacts, these will be evaluated and incorporated into the EIA where appropriate.
            </h3>
            <div className="quote-cols-grid">
              <p>
                Together, summary of questions, comments, and recommendations received regarding the EIA, management process, or proposed development will be published.
              </p>
              <p>
                A record of all feedback received and how they have been addressed will be documented in EIA supporting documents, and all documentation from stakeholder consultation will be preserved and catalogued for future decision-making.
              </p>
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
