'use client';

import { useState } from 'react';

export default function DestinationMap() {
  const [activeTarget, setActiveTarget] = useState('vlore');

  const tabs = [
    { id: 'vlore', tag: 'DESTINATION', name: 'City of Vlorë', meta: '📍 12nm • 🚢 20 mins' },
    { id: 'airport', tag: 'AIRPORT', name: 'Vlorë Airport', meta: '🚁 15 mins • 🛥️ 30 mins' },
    { id: 'tirana', tag: 'INTL AIRPORT', name: 'Tirana Airport', meta: '🚁 35 mins • 🚘 1.5 hrs' },
    { id: 'corfu', tag: 'ISLAND', name: 'Island of Corfu', meta: '🚢 45nm • 🛥️ 1.2 hrs' },
  ];

  return (
    <>
      {/* 100VH FULL VIEWPORT EDITORIAL HEADLINE SECTION */}
      <section className="enhanced-experience-viewport-section">
        <div className="container text-center">
          <div className="rediscover-editorial-wrapper">
            <div className="enhanced-editorial-container">
              <div className="enhanced-headline-stack">
                <h2 className="enhanced-line-main enhanced-line-an">An</h2>
                <div className="enhanced-line-with-icon">
                  <h2 className="enhanced-line-main">enhanced</h2>
                  <div className="enhanced-olive-icon">
                    <img
                      alt="Mediterranean Olive Branch Engraving"
                      className="olive-engraving-img-inline"
                      src="/olive-branch-transparent.png"
                    />
                  </div>
                </div>
                <h2 className="enhanced-line-italic enhanced-line-mediterranean">Mediterranean</h2>
                <div className="enhanced-experience-line">
                  <h2 className="enhanced-line-main">experience</h2>
                </div>
              </div>
              <p className="enhanced-top-right-desc">
                Perfectly positioned between the Adriatic and Ionian Seas, Sazan Coast offers effortless access to Europe while remaining beautifully protected by nature. Close to everything. Unlike anywhere else.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MAP WIDGET SECTION */}
      <section id="art-of-living" className="art-section">
        <div className="container">

        <div className="map-widget">
          <div className="map-graphic-wrapper">
            <div className="map-bg">
              <img src="/masterp.png?v=2" alt="Sazan Coast destination map" className="map-bg-img" />
              <div className="map-pin pin-sazan active" style={{ left: '50%', top: '50%' }}>
                <div className="pin-pulse"></div>
                <div className="pin-dot"></div>
                <span className="pin-label">Sazan Island</span>
              </div>

              <div className={`map-pin pin-vlore ${activeTarget === 'vlore' ? 'active' : ''}`} style={{ left: '38%', top: '33.3%' }} onClick={() => setActiveTarget('vlore')}>
                <div className="pin-dot"></div>
                <span className="pin-label">City of Vlorë</span>
              </div>

              <div className={`map-pin pin-airport ${activeTarget === 'airport' ? 'active' : ''}`} style={{ left: '32%', top: '60%' }} onClick={() => setActiveTarget('airport')}>
                <div className="pin-dot"></div>
                <span className="pin-label">Vlorë Airport</span>
              </div>

              <div className={`map-pin pin-tirana ${activeTarget === 'tirana' ? 'active' : ''}`} style={{ left: '68%', top: '30%' }} onClick={() => setActiveTarget('tirana')}>
                <div className="pin-dot"></div>
                <span className="pin-label">Tirana Airport</span>
              </div>

              <div className={`map-pin pin-corfu ${activeTarget === 'corfu' ? 'active' : ''}`} style={{ left: '62%', top: '73.3%' }} onClick={() => setActiveTarget('corfu')}>
                <div className="pin-dot"></div>
                <span className="pin-label">Island of Corfu</span>
              </div>
            </div>
          </div>

          <div className="map-locations-grid">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`location-tab ${activeTarget === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTarget(tab.id)}
              >
                <div className="location-tab-content">
                  <span className="loc-tag">{tab.tag}</span>
                  <span className="loc-name">{tab.name}</span>
                  <span className="loc-meta">{tab.meta}</span>
                </div>
                <div className="loc-chevron">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
