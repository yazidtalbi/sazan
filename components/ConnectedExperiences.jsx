'use client';

import { useState, useEffect, useRef } from 'react';

const CONNECTIONS = [
  {
    id: 'place',
    label: 'To place',
    tagline: 'UNTAMED MEDITERRANEAN TOPOGRAPHY',
    desc: 'Sazan Island is shaped by limestone cliffs, pristine Ionian waters, and wild coastal coves. Living here is a daily dialogue with natural grandeur.',
    image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=85',
    alt: 'Coastal Topography & Sea Cove'
  },
  {
    id: 'people',
    label: 'To people',
    tagline: 'INTIMATE COMMUNITY & SHARED SANCTUARY',
    desc: 'Designed for meaningful gathering — private sunset dinners, quiet coastal walks, and shared moments among visionaries who cherish stillness.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
    alt: 'Island Social Sanctuary'
  },
  {
    id: 'culture',
    label: 'To culture',
    tagline: 'ANCIENT HERITAGE & MODERN REFINEMENT',
    desc: 'Centuries of maritime history fused with contemporary understated architecture. Local artisan stone masonry honors timeless Mediterranean traditions.',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=85',
    alt: 'Mediterranean Heritage & Architecture'
  },
  {
    id: 'nature',
    label: 'To nature',
    tagline: 'PRISTINE REEFS & HIDDEN ECOSYSTEMS',
    desc: '100% clean energy arrays, protected marine reserves, and tidal circulation engineering preserve the island’s thriving underwater wildlife.',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="100%" height="100%" fill="%23e2e2e2"/></svg>',
    alt: 'Marine Life & Coral Reefs'
  },
  {
    id: 'yourself',
    label: 'To yourself',
    tagline: 'RESTORATIVE SOLITUDE & DEEP PEACE',
    desc: 'A place to slow down, disconnect from noise, and reconnect with your inner rhythm through private spa sanctuaries and cliffside meditation.',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="100%" height="100%" fill="%23e2e2e2"/></svg>',
    alt: 'Restorative Spa & Solitude'
  }
];

export default function ConnectedExperiences() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalScrollHeight = rect.height - windowHeight;

      if (totalScrollHeight <= 0) return;

      const currentScroll = Math.max(0, -rect.top);
      const progress = Math.min(1, Math.max(0, currentScroll / totalScrollHeight));

      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const numSteps = CONNECTIONS.length - 1;
  const floatIndex = scrollProgress * numSteps;
  const activeIndex = Math.min(numSteps, Math.round(floatIndex));
  const activeItem = CONNECTIONS[activeIndex];

  return (
    <section className="connected-sticky-wrapper connected-white-bg-section" ref={sectionRef}>
      <div className="connected-sticky-content">
        <div className="container-fluid connected-layout-container">
          <div className="connected-3col-grid">
            
            {/* COLUMN 1: LEFT MAIN TALL IMAGE VIEWPORT */}
            <div className="connected-col-left">
              <div className="connected-main-image-viewport">
                <div className="connected-parallax-stack">
                  {CONNECTIONS.map((item, i) => {
                    let layerYPercent = 0;
                    let innerShift = 0;

                    if (i > 0) {
                      const layerProgress = Math.max(0, Math.min(1, floatIndex - (i - 1)));
                      layerYPercent = (1 - layerProgress) * 100;
                      innerShift = (1 - layerProgress) * -45;
                    } else {
                      innerShift = floatIndex * -15;
                    }

                    return (
                      <div
                        key={i}
                        className="connected-parallax-layer"
                        style={{
                          zIndex: i + 1,
                          transform: `translate3d(0, ${layerYPercent}%, 0)`,
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.alt}
                          style={{
                            transform: `scale(1.1) translate3d(0, ${innerShift}px, 0)`,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* COLUMN 2: CENTER CONNECTIONS TAG & VERTICAL STACK OF LABELS */}
            <div className="connected-col-center">
              <span className="connected-connections-tag">CONNECTIONS</span>
              <div className="connected-labels-stack">
                {CONNECTIONS.map((item, i) => {
                  const isActive = i === activeIndex;
                  return (
                    <h3
                      key={item.id}
                      className={`connected-stack-label ${isActive ? 'active' : 'faded'}`}
                    >
                      {item.label}
                    </h3>
                  );
                })}
              </div>
            </div>

            {/* COLUMN 3: RIGHT TOP DESCRIPTION & BOTTOM SECONDARY IMAGE */}
            <div className="connected-col-right">
              {/* TOP RIGHT SANS-SERIF DESCRIPTION */}
              <div className="connected-desc-top-right">
                <p className="connected-sans-desc">
                  {activeItem.desc}
                </p>
              </div>

              {/* BOTTOM RIGHT SECONDARY OFFSET IMAGE */}
              <div className="connected-secondary-image-viewport">
                <div className="connected-parallax-stack">
                  {CONNECTIONS.map((item, i) => {
                    // Secondary offset image (next item in cycle)
                    const secItem = CONNECTIONS[(i + 1) % CONNECTIONS.length];
                    let layerYPercent = 0;

                    if (i > 0) {
                      const layerProgress = Math.max(0, Math.min(1, floatIndex - (i - 1)));
                      layerYPercent = (1 - layerProgress) * 100;
                    }

                    return (
                      <div
                        key={i}
                        className="connected-parallax-layer"
                        style={{
                          zIndex: i + 1,
                          transform: `translate3d(0, ${layerYPercent}%, 0)`,
                        }}
                      >
                        <img src={secItem.image} alt={secItem.alt} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
