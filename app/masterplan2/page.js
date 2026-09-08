'use client';

import { useState, useEffect, useRef } from 'react';
import SmoothScroll from '@/components/SmoothScroll';
import Navbar from '@/components/Navbar';
import MenuDrawer from '@/components/MenuDrawer';
import InquiryForm from '@/components/InquiryForm';
import Footer from '@/components/Footer';
import ParallaxImage from '@/components/ParallaxImage';
import MasterplanProgram from '@/components/MasterplanProgram';
import MasterplanLocations from '@/components/MasterplanLocations';

export default function MasterplanPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navbarVisible, setNavbarVisible] = useState(false);
  const [stage, setStage] = useState('video');
  const [markersVisible, setMarkersVisible] = useState(true);
  const [mapReady, setMapReady] = useState(true);
  const [mapDragging, setMapDragging] = useState(false);
  const [mapGliding, setMapGliding] = useState(false);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });
  const [focusPosition, setFocusPosition] = useState(null);
  const videoRef = useRef(null);
  const mapDragRef = useRef(null);
  const mapPanRef = useRef({ x: 0, y: 0 });
  const inertiaFrameRef = useRef(null);
  const zoomTimerRef = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => { });
    }
  }, []);

  useEffect(() => () => {
    if (inertiaFrameRef.current) window.cancelAnimationFrame(inertiaFrameRef.current);
    if (zoomTimerRef.current) window.clearTimeout(zoomTimerRef.current);
  }, []);

  useEffect(() => {
    let frame = 0;
    const updateNavbar = () => {
      frame = 0;
      const heroHeight = heroRef.current?.offsetHeight || window.innerHeight;
      setNavbarVisible(window.scrollY >= heroHeight - 2);
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateNavbar);
    };
    updateNavbar();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const setBoundedPan = (x, y, focused = Boolean(focusPosition)) => {
    const maxX = window.innerWidth * (focused ? 0.2 : 0.15);
    const maxY = window.innerHeight * (focused ? 0.2 : 0.15);
    const next = {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
    mapPanRef.current = next;
    setMapPan(next);
    return { next, maxX, maxY };
  };

  const handleMapPointerDown = (event) => {
    if (!mapReady || event.button !== 0) return;
    event.preventDefault();
    if (inertiaFrameRef.current) window.cancelAnimationFrame(inertiaFrameRef.current);
    inertiaFrameRef.current = null;
    setMapGliding(false);
    event.currentTarget.setPointerCapture(event.pointerId);
    mapDragRef.current = {
      pointerId: event.pointerId,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: performance.now(),
      velocityX: 0,
      velocityY: 0,
    };
    setMapDragging(true);
  };

  const handleMapPointerMove = (event) => {
    const drag = mapDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dragSensitivity = 0.42;
    const now = performance.now();
    const elapsed = Math.max(8, now - drag.lastTime);
    const deltaX = (event.clientX - drag.lastX) * dragSensitivity;
    const deltaY = (event.clientY - drag.lastY) * dragSensitivity;
    const instantVelocityX = deltaX / elapsed;
    const instantVelocityY = deltaY / elapsed;
    drag.velocityX = drag.velocityX * 0.78 + instantVelocityX * 0.22;
    drag.velocityY = drag.velocityY * 0.78 + instantVelocityY * 0.22;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.lastTime = now;
    setBoundedPan(mapPanRef.current.x + deltaX, mapPanRef.current.y + deltaY);
  };

  const stopMapDrag = (event) => {
    const drag = mapDragRef.current;
    if (drag?.pointerId !== event.pointerId) return;
    mapDragRef.current = null;
    setMapDragging(false);

    let velocityX = Math.max(-8, Math.min(8, drag.velocityX * 16.667));
    let velocityY = Math.max(-8, Math.min(8, drag.velocityY * 16.667));
    let previousTime = performance.now();
    if (Math.hypot(velocityX, velocityY) < 0.35) return;
    setMapGliding(true);

    const glide = (time) => {
      const frameRatio = Math.min(2, Math.max(0.5, (time - previousTime) / 16.667));
      previousTime = time;
      const proposedX = mapPanRef.current.x + velocityX * frameRatio;
      const proposedY = mapPanRef.current.y + velocityY * frameRatio;
      const { next, maxX, maxY } = setBoundedPan(proposedX, proposedY);

      if (Math.abs(next.x) >= maxX && Math.sign(velocityX) === Math.sign(next.x)) velocityX = 0;
      if (Math.abs(next.y) >= maxY && Math.sign(velocityY) === Math.sign(next.y)) velocityY = 0;
      const friction = Math.pow(0.955, frameRatio);
      velocityX *= friction;
      velocityY *= friction;

      if (Math.hypot(velocityX, velocityY) > 0.08) {
        inertiaFrameRef.current = window.requestAnimationFrame(glide);
      } else {
        inertiaFrameRef.current = null;
        setMapGliding(false);
      }
    };

    inertiaFrameRef.current = window.requestAnimationFrame(glide);
  };

  const handleLocationSelection = (position) => {
    if (inertiaFrameRef.current) window.cancelAnimationFrame(inertiaFrameRef.current);
    inertiaFrameRef.current = null;
    setMapGliding(false);
    setFocusPosition(position);
    if (position) {
      const locationX = Number.parseFloat(position.left) / 100;
      const locationY = Number.parseFloat(position.top) / 100;
      const canvasWidth = Math.max(window.innerWidth, window.innerHeight * (16 / 9));
      const canvasHeight = Math.max(window.innerHeight, window.innerWidth * (9 / 16));
      const drawerShift = -window.innerWidth * 0.07;
      const targetX = drawerShift + (0.5 - locationX) * canvasWidth * 0.55;
      const targetY = (0.5 - locationY) * canvasHeight * 0.45;
      setBoundedPan(targetX, targetY, true);
    } else {
      mapPanRef.current = { x: 0, y: 0 };
      setMapPan({ x: 0, y: 0 });
    }
  };

  return (
    <SmoothScroll>
      <Navbar standalone hidden={!navbarVisible} onOpenMenu={() => setMenuOpen(true)} />
      <MenuDrawer standalone isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <main id="main-content" className="masterplan-page">

        {/* FULL VIEWPORT HERO STAGE (100VW x 100VH) */}
        <section ref={heroRef} className="masterplan-hero-stage">

          {/* Full Viewport Video Layer */}
          <div
            className={`masterplan-video-layer ${stage === 'video' ? 'active' : ''} ${mapReady ? 'is-interactive' : ''}`}
            onPointerDown={handleMapPointerDown}
            onPointerMove={handleMapPointerMove}
            onPointerUp={stopMapDrag}
            onPointerCancel={stopMapDrag}
          >
            <div
              className={`masterplan-map-canvas ${mapReady ? 'is-zoomed' : ''} ${mapDragging || mapGliding ? 'is-moving' : ''} ${focusPosition ? 'has-selection' : ''}`}
              style={{
                '--map-pan-x': `${mapPan.x}px`,
                '--map-pan-y': `${mapPan.y}px`,
              }}
            >
              <div className="masterplan-map-breath">
                <video
                  ref={videoRef}
                  src="/island2.mp4"
                  muted
                  playsInline
                  preload="auto"
                  className="full-viewport-video"
                  onPlay={(event) => {
                    if (event.currentTarget.currentTime < 0.25) {
                      setMarkersVisible(false);
                      setMapReady(false);
                      mapPanRef.current = { x: 0, y: 0 };
                      setMapPan({ x: 0, y: 0 });
                      if (zoomTimerRef.current) window.clearTimeout(zoomTimerRef.current);
                      zoomTimerRef.current = window.setTimeout(() => {
                        setMapReady(true);
                        zoomTimerRef.current = null;
                      }, 1000);
                    } else {
                      setMapReady(true);
                    }
                  }}
                  onTimeUpdate={(event) => {
                    const { currentTime, duration } = event.currentTarget;
                    setMarkersVisible(Number.isFinite(duration) && duration > 0 && currentTime >= Math.max(0, duration - 2.5));
                  }}
                  onEnded={(event) => {
                    event.currentTarget.pause();
                    setMarkersVisible(true);
                  }}
                />

                <div className="masterplan-cloud" aria-hidden="true">
                  <img src="/island/cloud-overlay.png" alt="" />
                </div>

                <MasterplanLocations
                  editorKey="sazan-masterplan2-placements"
                  visible={markersVisible}
                  onSelectionChange={handleLocationSelection}
                  logos={[
                    '/logos/Atlantis-The-Royal-Logo 1-white.png',
                    '/logos/aliee-logo-white.svg',
                    '/logos/Raffles_Hotels_&_Resorts_logo.svg-white.png',
                    '/logos/LOGO-CHEVAL-BLANC-white.png',
                    null,
                  ]}
                />
              </div>
            </div>

            {stage === 'video' && (
              <div className="masterplan-passing-bird" aria-hidden="true">
                <svg viewBox="0 0 80 40" focusable="false">
                  <path className="bird-wing bird-wing-left" d="M40 25C29 9 15 8 2 12C18 12 28 22 40 28Z" />
                  <path className="bird-wing bird-wing-right" d="M40 25C51 9 65 8 78 12C62 12 52 22 40 28Z" />
                  <path d="M38 23Q40 19 42 23L43 31L40 29L37 31Z" />
                </svg>
              </div>
            )}
            <span className={`masterplan-drag-hint ${mapReady ? 'is-visible' : ''}`}>Drag to explore</span>
          </div>

        </section>

        {/* SECTION 3: Big Statement Callout & 2-Column Description */}
        <section className="masterplan-quote-section masterplan-intro-section">
          <div className="container">
            <h2 className="masterplan-intro-title">The Masterplan</h2>
            <h3 className="masterplan-big-quote">
              The masterplan encompasses approximately 4.5 kilometres of beachfront,
              creating one of the most significant mixed-use waterfront destinations
              in the Mediterranean.
            </h3>

            <div className="quote-cols-grid">
              <p>
                Each island home is an architectural expression of privacy and sanctuary.
                Integrating seamlessly into coastal topography, residences benefit from natural sea breezes,
                panoramic sunset views, and private water access directly from private docks.
              </p>
              <p>
                Designed with a strict environmental charter, 100% of energy requirements are fulfilled
                through hidden solar arrays, while advanced marine engineering preserves local reef habitats
                and tidal water circulation.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: Interactive Masterplan Program */}
        <MasterplanProgram showHeading={false} />

        {/* SECTION 5: Grid Sections (Green Infrastructure & Masterplan Vision) */}
        <section className="masterplan-grid-section">
          <div className="container">
            <div className="masterplan-two-cols">

              {/* Left Column */}
              <div className="masterplan-col-card">
                <div className="masterplan-col-img">
                  <ParallaxImage
                    src="/masterplan/green-infrastructure.png"
                    alt="Green Infrastructure"
                    speed={0.45}
                  />
                </div>
                <div className="masterplan-col-content">
                  <h3>Green Infrastructure</h3>
                  <p>
                    Shaded pedestrian pathways, car-free electric mobility networks, and lush indigenous botanical gardens connect every quarter of the island, prioritizing wellness and tranquility.
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="masterplan-col-card">
                <div className="masterplan-col-img">
                  <ParallaxImage
                    src="/masterplan/masterplan-vision.png"
                    alt="Masterplan Vision"
                    speed={0.45}
                  />
                </div>
                <div className="masterplan-col-content">
                  <h3>Masterplan Vision</h3>
                  <p>
                    A unified architectural philosophy grounded in natural limestone, timber, and glass, creating seamless indoor-outdoor living spaces that honor Mediterranean heritage.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 6: Benchmark Statement */}
        <section className="benchmark-statement-section">
          <div className="container">
            <h2 className="benchmark-text">
              By combining low-density development, land-scaped planning, ecological restoration,
              sustainable engineering, public accessibility, high-quality architecture and responsible infrastructure,
              the masterplan establishes a <em>new benchmark</em> for Mediterranean coastal development.
            </h2>
          </div>
        </section>

        {/* Inquiries Registration */}
        <div className="home-inquiry-map">
          <InquiryForm />
        </div>

      </main>

      <Footer standalone />
    </SmoothScroll>
  );
}
