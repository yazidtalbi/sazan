'use client';

import { useState } from 'react';
import Link from 'next/link';
import SmoothScroll from '@/components/SmoothScroll';
import Navbar from '@/components/Navbar';
import MenuDrawer from '@/components/MenuDrawer';
import PerspectiveCollage from '@/components/PerspectiveCollage';
import DestinationMap from '@/components/DestinationMap';
import InquiryForm from '@/components/InquiryForm';
import Footer from '@/components/Footer';
import ParallaxImage from '@/components/ParallaxImage';

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <SmoothScroll>
      <Navbar onOpenMenu={() => setMenuOpen(true)} />
      <MenuDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <main id="main-content">
        {/* Hero Section */}
        <section id="resort" className="hero-section">
          <div className="hero-frame">
            <div className="hero-bg-wrapper">
              <video
                src="/intro.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="hero-bg-img"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div className="hero-overlay"></div>
            </div>
            <div className="hero-content">
              <h1 className="hero-title" style={{ letterSpacing: '-0.02em', textAlign: 'center' }}>
                An ecosystem where<br />
                nature, architecture and<br />
                life exist in <em>harmony</em>
              </h1>
              <div className="scroll-indicator">
                <span>Scroll to Discover</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3D Perspective Floating Collage */}
        <PerspectiveCollage />

        <div className="home-transition-image" aria-hidden="true">
          <img src="/transition.png" alt="" />
        </div>

        {/* Destination Map */}
        <DestinationMap />

        {/* Masterplan Showcase Banner linking to /masterplan */}
        <section id="masterplan" className="panoramic-section" style={{ height: '70vh' }}>
          <div className="panoramic-wrapper">
            <video
              src="/island.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="panoramic-img"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div className="panoramic-overlay"></div>
          </div>
          <div className="panoramic-content">
            <h2 className="section-title" style={{ color: '#ffffff', marginBottom: '2rem', letterSpacing: '-0.02em' }}>
              Homes inspired by the<br />
              rhythm of the <em>Mediterranean</em>
            </h2>
            <Link href="/masterplan" className="btn-sharp" style={{ backgroundColor: '#ffffff', color: '#191816', padding: '1rem 2.5rem' }}>
              EXPLORE HOMES
            </Link>
          </div>
        </section>

        {/* Inquiry Registration */}
        <InquiryForm />
      </main>

      <Footer />
    </SmoothScroll>
  );
}
