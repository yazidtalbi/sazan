'use client';

import { useState, useEffect, useRef } from 'react';
import SmoothScroll from '@/components/SmoothScroll';
import Navbar from '@/components/Navbar';
import MenuDrawer from '@/components/MenuDrawer';
import Masterplan2Locations from '@/components/Masterplan2Locations';
import styles from './masterplan2.module.css';

export default function MasterplanPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [stage, setStage] = useState('video');
  const [markersVisible, setMarkersVisible] = useState(false);
  const [mapReady, setMapReady] = useState(true);
  const [mapDragging, setMapDragging] = useState(false);
  const [mapGliding, setMapGliding] = useState(false);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });
  const [overview, setOverview] = useState(false);
  const [mapVersion, setMapVersion] = useState(0);
  const videoRef = useRef(null);
  const mapDragRef = useRef(null);
  const mapPanRef = useRef({ x: 0, y: 0 });
  const inertiaFrameRef = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => { });
    }
  }, []);

  useEffect(() => () => {
    if (inertiaFrameRef.current) window.cancelAnimationFrame(inertiaFrameRef.current);
  }, []);

  const setBoundedPan = (x, y) => {
    const canvas = videoRef.current?.parentElement;
    const scale = overview ? 1 : 1.3;
    const maxX = Math.max(0, ((canvas?.offsetWidth || window.innerWidth) * scale - window.innerWidth) / 2);
    const maxY = Math.max(0, ((canvas?.offsetHeight || window.innerHeight) * scale - window.innerHeight) / 2);
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

  const handleLocationSelection = () => {
    if (inertiaFrameRef.current) window.cancelAnimationFrame(inertiaFrameRef.current);
    inertiaFrameRef.current = null;
    setMapGliding(false);
  };

  const changeMapView = (fullPlan) => {
    if (inertiaFrameRef.current) window.cancelAnimationFrame(inertiaFrameRef.current);
    inertiaFrameRef.current = null;
    mapDragRef.current = null;
    setMapDragging(false);
    setMapGliding(false);
    mapPanRef.current = { x: 0, y: 0 };
    setMapPan({ x: 0, y: 0 });
    setMapVersion((version) => version + 1);
    setOverview(fullPlan);
    const video = videoRef.current;
    video.pause();
    video.currentTime = 0;
    if (!fullPlan) video.play().catch(() => {});
  };

  return (
    <SmoothScroll>
      <Navbar standalone hidden onOpenMenu={() => setMenuOpen(true)} />
      <MenuDrawer standalone isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <main id="main-content" className="masterplan-page">

        {/* FULL VIEWPORT HERO STAGE (100VW x 100VH) */}
        <section ref={heroRef} className={`masterplan-hero-stage ${styles.hero} ${overview ? styles.overview : ''}`}>

          {/* Full Viewport Video Layer */}
          <div
            className={`masterplan-video-layer ${stage === 'video' ? 'active' : ''} ${mapReady ? 'is-interactive' : ''}`}
            onPointerDown={handleMapPointerDown}
            onPointerMove={handleMapPointerMove}
            onPointerUp={stopMapDrag}
            onPointerCancel={stopMapDrag}
          >
            <div
              className={`masterplan-map-canvas ${mapReady ? 'is-zoomed' : ''} ${mapDragging || mapGliding ? 'is-moving' : ''}`}
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
                  onLoadedData={() => setMarkersVisible(true)}
                  onPlay={() => {
                    setMapReady(true);
                  }}
                  onEnded={(event) => {
                    event.currentTarget.pause();
                    setMarkersVisible(true);
                  }}
                />

                <div className="masterplan-cloud" aria-hidden="true">
                  <img src="/island/cloud-overlay.png" alt="" />
                </div>

                <Masterplan2Locations
                  key={mapVersion}
                  videoRef={videoRef}
                  heroRef={heroRef}
                  visible={markersVisible}
                  onSelectionChange={handleLocationSelection}
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
            <span className={`masterplan-drag-hint ${mapReady ? 'is-visible' : ''}`}>{overview ? 'Select a location to explore' : 'Drag to explore'}</span>
          </div>
          <div className={styles.controls}>
            <button type="button" aria-pressed={overview} onClick={() => changeMapView(true)}>Full plan</button>
            <button type="button" onClick={() => changeMapView(false)}>Replay</button>
          </div>

        </section>

      </main>
    </SmoothScroll>
  );
}

