'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar({ onOpenMenu }) {
  const [scrolled, setScrolled] = useState(false);
  const [light, setLight] = useState(false);

  useEffect(() => {
    let frame = 0;

    const isDarkSurface = () => {
      const sampleY = Math.min(44, window.innerHeight - 1);
      const layers = document.elementsFromPoint(window.innerWidth / 2, sampleY);
      const surface = layers.find((element) => !element.closest('.site-header, .menu-drawer, .impact-nav, .eia-subnav'));
      if (!surface) return false;

      let element = surface;
      while (element && element !== document.documentElement) {
        if (element.dataset?.navTheme) return element.dataset.navTheme === 'light';
        if (element.matches?.('img, video, .hero-section, .experiences-hero-section-130, .eia-hero-section, .panoramic-section, .masterplan-hero-stage, .environment-principles, .economic-local')) return true;

        const styles = window.getComputedStyle(element);
        if (styles.backgroundImage && styles.backgroundImage !== 'none') return true;
        const values = styles.backgroundColor.match(/[\d.]+/g)?.map(Number);
        if (values && values.length >= 3 && (values[3] ?? 1) > .2) {
          const luminance = values[0] * .299 + values[1] * .587 + values[2] * .114;
          return luminance < 145;
        }
        element = element.parentElement;
      }
      return false;
    };

    const handleScroll = () => {
      frame = 0;
      setScrolled(window.scrollY > 60);
      setLight(isDarkSurface());
    };

    const scheduleUpdate = () => {
      if (!frame) frame = requestAnimationFrame(handleScroll);
    };
    handleScroll();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''} ${light ? 'navbar-light' : ''}`}>
      <div className="header-container">
        <div className="nav-left">
          <button className="nav-button btn-menu-text" onClick={onOpenMenu} aria-label="Open Menu">
            <span className="menu-icon-bars">
              <span></span>
              <span></span>
            </span>
            <span className="menu-label">MENU</span>
          </button>
        </div>

        <Link href="/" className="brand-logo">
          <img src="/svg/sazan.svg" alt="SAZAN" className="sazan-navbar-logo" />
        </Link>

        <div className="nav-right">
          <button className="nav-link lang-select">
            <span>ENGLISH</span>
            <svg className="nav-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <a href="#inquiries" className="nav-button btn-sharp">RESERVE</a>
        </div>
      </div>
    </header>
  );
}
