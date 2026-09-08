'use client';

import { useEffect, useRef } from 'react';

export default function HorizontalFilmStrip() {
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !trackRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.top <= windowHeight && rect.bottom >= 0) {
        const totalDistance = windowHeight + rect.height;
        const currentProgress = Math.max(0, Math.min(1, (windowHeight - rect.top) / totalDistance));
        
        // Start flush at 0px offset at top of scroll, translating left smoothly as user scrolls
        const maxTranslate = trackRef.current.scrollWidth - window.innerWidth;
        const translateX = -currentProgress * Math.min(maxTranslate, 1400);
        
        trackRef.current.style.transform = `translate3d(${translateX}px, 0, 0)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filmFrames = [
    { src: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1000&q=85', title: 'SAZAN COAST • FRAME 18' },
    { src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=85', title: 'SAZAN COAST • FRAME 19' },
    { src: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=85', title: 'SAZAN COAST • FRAME 20' },
    { src: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1000&q=85', title: 'SAZAN COAST • FRAME 21' },
    { src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="750"><rect width="100%" height="100%" fill="%23e2e2e2"/></svg>', title: 'SAZAN COAST • FRAME 22' },
    { src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="750"><rect width="100%" height="100%" fill="%23e2e2e2"/></svg>', title: 'SAZAN COAST • FRAME 23' },
    { src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="750"><rect width="100%" height="100%" fill="%23e2e2e2"/></svg>', title: 'SAZAN COAST • FRAME 24' },
  ];

  return (
    <section className="film-strip-section-full" ref={containerRef}>
      <div className="film-strip-viewport-full">
        <div className="film-strip-track-attached" ref={trackRef}>
          {filmFrames.map((frame, i) => (
            <div key={i} className="film-frame-attached">
              <div className="film-frame-media">
                <img src={frame.src} alt={frame.title} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
