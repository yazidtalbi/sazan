'use client';

import { useState } from 'react';
import SmoothScroll from '@/components/SmoothScroll';
import Navbar from '@/components/Navbar';
import MenuDrawer from '@/components/MenuDrawer';
import InquiryForm from '@/components/InquiryForm';
import Footer from '@/components/Footer';
import ParallaxImage from '@/components/ParallaxImage';

import HorizontalFilmStrip from '@/components/HorizontalFilmStrip';
import ConnectedExperiences from '@/components/ConnectedExperiences';
import RediscoverAdventureSection from '@/components/RediscoverAdventureSection';
import ImpactNav from '@/components/ImpactNav';

export default function ExperiencesPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <SmoothScroll>
      <Navbar onOpenMenu={() => setMenuOpen(true)} />
      <MenuDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <ImpactNav />
      <main id="main-content" className="experiences-page">

        {/* 1. HERO SECTION: 130vh Full Width Flush (No outer frame margin) */}
        <section id="experiences-hero" className="experiences-hero-section-130">
          <div className="experiences-hero-bg-wrapper">
            <ParallaxImage
              src="https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=2400&q=90"
              alt="Sazan Island Experiences Yacht"
              speed={0.3}
            />
            <div className="hero-overlay"></div>
          </div>
          <div className="hero-content experiences-hero-content">
            <div className="luxury-vertical-line"></div>
            <h1 className="experiences-main-title">
              Where Nature<br />
              Shapes the<br />
              <em>Extraordinary</em>
            </h1>
            <div className="scroll-indicator">
              <span>ONCE-IN-A-LIFETIME ISLAND EXPERIENCES</span>
            </div>
          </div>
        </section>

        {/* 2. CENTERED STATEMENT BLOCK */}
        <section className="experiences-statement-section">
          <div className="container text-center experiences-contained-text">
            <h2 className="experiences-statement-title">
              Sazan Coast is where people come<br />
              not to escape life, but to feel<br />
              more <em>alive within it.</em>
            </h2>
            <p className="sans-paragraph experiences-statement-desc">
              Sazan Coast is built on a conviction that the fullest human experiences live in the 
              tension between opposites - adventure and retreat, connection and solitude, 
              activation and restoration. Every experience is thoughtfully designed to reconnect 
              guests with nature, culture, community, and themselves.
            </p>
          </div>
        </section>

        {/* 3. LUXURY HORIZONTAL FILM STRIP (Moving on scroll) */}
        <HorizontalFilmStrip />

        {/* 4. STORY ABOUT THE NAME SECTION */}
        <section className="experiences-story-section">
          <div className="container text-center experiences-contained-text">
            <span className="experiences-story-sub">STORY</span>
            <h2 className="experiences-story-content-text">
              Sazan Coast takes its name from its unique position along the Zvërnec Peninsula, across from Sazan Island. From the coast, the island is visible across the water, creating a beautiful and unobstructed relationship between the two landscapes.
            </h2>
          </div>
        </section>

        {/* 5. WHERE LIVING BECOMES AN EXPERIENCE (White Card + Edge Images + Vertical Line) */}
        <section className="experiences-living-section">
          <div className="living-section-inner">
            
            {/* LEFT IMAGE TOUCHING VIEWPORT LEFT EDGE */}
            <div className="living-edge-img living-left-img">
              <ParallaxImage
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=85"
                alt="Sazan Coast Dining & Sea"
                speed={0.2}
              />
            </div>

            {/* CENTER WHITE CONTAINER */}
            <div className="living-white-card">
              <h2 className="living-card-title">
                Where living becomes<br />an <em>experience</em>
              </h2>
              
              {/* VERTICAL SEPARATING LINE */}
              <div className="living-card-line"></div>

              <p className="living-card-desc">
                Sazan Coast is shaped by the balance of opposites — adventure and stillness, 
                connection and solitude, energy and restoration. Every experience is thoughtfully 
                composed to draw guests closer to nature, culture, community, and themselves.
              </p>
            </div>

            {/* RIGHT IMAGE TOUCHING VIEWPORT RIGHT EDGE */}
            <div className="living-edge-img living-right-img">
              <ParallaxImage
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=85"
                alt="Sazan Coast Yacht Sailing"
                speed={0.2}
              />
            </div>

          </div>
        </section>


        {/* 7. PHILOSOPHY SECTION (Headline + 2-Column Paragraphs) */}
        <section className="experiences-philosophy-section">
          <div className="container text-center experiences-contained-text">
            <h2 className="experiences-philosophy-title">
              A rare convergence of wild landscape and refined hospitality
            </h2>
            <div className="quote-cols-grid">
              <p className="sans-paragraph">
                Every element of Sazan Coast honors the surrounding ecosystem. From hidden solar grids to sustainable 
                limestone masonry, the development establishes a benchmark for ecological luxury.
              </p>
              <p className="sans-paragraph">
                Designed for those who seek sanctuary, private anchorages, and direct access to uncrowded waters, 
                the island offers an unmatched sense of freedom and quiet luxury.
              </p>
            </div>
          </div>
        </section>

        {/* 8. FULL-WIDTH 2X2 SQUARE CHECKERBOARD GRID */}
        <section className="experiences-square-grid-full">
          <div className="square-grid-2x2">
            {/* Tile 1: Photo Top-Left */}
            <div className="square-grid-tile media-tile">
              <ParallaxImage
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85"
                alt="Yacht Gliding"
                speed={0.2}
              />
            </div>

            {/* Tile 2: White Text Card Top-Right */}
            <div className="square-grid-tile text-tile white-card-tile">
              <h3 className="square-tile-title">
                Nature leads<br />
                <em>everything</em>
              </h3>
              <p className="sans-paragraph square-tile-desc">
                Architecture defers to the natural contours of the coastline, creating living spaces 
                that open fully to ocean horizons and sea breezes.
              </p>
            </div>

            {/* Tile 3: White Text Card Bottom-Left */}
            <div className="square-grid-tile text-tile white-card-tile">
              <h3 className="square-tile-title">
                Luxury without<br />
                <em>pretension</em>
              </h3>
              <p className="sans-paragraph square-tile-desc">
                Understated materials, intuitive service, and thoughtful privacy define an atmosphere 
                of relaxed elegance.
              </p>
            </div>

            {/* Tile 4: Photo Bottom-Right */}
            <div className="square-grid-tile media-tile">
              <ParallaxImage
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=85"
                alt="Resort Life"
                speed={0.2}
              />
            </div>
          </div>
        </section>

        {/* 9. REDISCOVER YOUR SENSE OF ADVENTURE EDITORIAL SECTION */}
        <RediscoverAdventureSection />

        {/* 10. CONNECTED TO WHAT MATTERS MOST (Sticky Scroll Vertical Image Transition) */}
        <ConnectedExperiences />

        {/* 11. MAP & NATURE DECISIONS SECTION */}
        <section className="experiences-map-section">
          <div className="container text-center">
            <h2 className="experiences-map-title">
              Every decision at Sazan Coast<br />begins with nature
            </h2>
          </div>
          <div className="experiences-map-wrapper">
            <img src="/svg/map1.svg" alt="Sazan Island Map" className="sazan-map-svg" />
          </div>
        </section>

        {/* 12. INQUIRIES & REGISTRATION (Last element before Footer) */}
        <InquiryForm />

      </main>

      <Footer />
    </SmoothScroll>
  );
}
