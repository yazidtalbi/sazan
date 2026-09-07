'use client';

import { useEffect, useRef } from 'react';

export default function PerspectiveCollage() {
  const stageRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const handleScroll = () => {
      if (!stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      if (rect.bottom >= -300 && rect.top <= viewportHeight + 300) {
        const stageCenter = rect.top + (rect.height / 2);
        const viewportCenter = viewportHeight / 2;
        // Progress ranges from -0.8 (entering) to +0.8 (leaving)
        const progress = (viewportCenter - stageCenter) / (viewportHeight + rect.height / 2);

        cardsRef.current.forEach(card => {
          if (!card) return;
          const dirX = parseFloat(card.getAttribute('data-dir-x')) || 0;
          const dirY = parseFloat(card.getAttribute('data-dir-y')) || 0;
          const speed = parseFloat(card.getAttribute('data-speed')) || 1.0;
          const scaleMult = parseFloat(card.getAttribute('data-scale')) || 0.15;

          // Asymmetrical multi-layered parallax depth pacing
          const scatterFactor = progress * speed;
          const translateX = dirX * scatterFactor;
          const translateY = dirY * scatterFactor;
          const scale = 1.0 + (progress * scaleMult);

          card.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
        });

        // Smooth fade out as section crosses vertical center of screen
        const fadeDistance = rect.height * 0.45;
        let opacity = 1;
        if (stageCenter < viewportCenter) {
          opacity = Math.max(0, Math.min(1, 1 - (viewportCenter - stageCenter) / fadeDistance));
        }
        stageRef.current.style.opacity = opacity;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cardsData = [
    {
      className: 'card-top-left',
      dirX: -260,
      dirY: -300,
      speed: 0.95,      // Mid-background layer pace
      scale: 0.08,
      src: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=800&q=85',
      alt: 'Yacht Sunset'
    },
    {
      className: 'card-mid-left',
      dirX: -540,
      dirY: 140,
      speed: 1.85,      // Mid-foreground fast lateral explosion
      scale: 0.22,
      src: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=85',
      alt: 'Portrait'
    },
    {
      className: 'card-mid-right',
      dirX: 200,
      dirY: -160,
      speed: 0.55,      // Deep background slow drift
      scale: 0.04,
      src: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=85',
      alt: 'Swimming'
    },
    {
      className: 'card-bottom-right',
      dirX: 620,
      dirY: 340,
      speed: 2.45,      // Close foreground rapid explosion & zoom
      scale: 0.35,
      src: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=85',
      alt: 'Oysters & Cocktail'
    },
  ];

  return (
    <section id="beauty" className="beauty-section perspective-stage" ref={stageRef}>
      <div className="container relative stage-container">
        {cardsData.map((c, i) => (
          <div
            key={i}
            ref={el => cardsRef.current[i] = el}
            className={`perspective-card ${c.className}`}
            data-dir-x={c.dirX}
            data-dir-y={c.dirY}
            data-speed={c.speed}
            data-scale={c.scale}
          >
            <div className="card-img-inner">
              <img src={c.src} alt={c.alt} />
            </div>
          </div>
        ))}

        <div className="beauty-content container text-center experiences-contained-text">
          <h2 className="experiences-statement-title" style={{ letterSpacing: '-0.02em' }}>
            Untamed Mediterranean<br />
            beauty meets <em>timeless luxury</em>
          </h2>
          <p className="sans-paragraph experiences-statement-desc">
            Sazan Coast is a sanctuary designed around the raw beauty of the Mediterranean coast. Every experience is crafted to reconnect you with nature, refine your sense of well-being, and rediscover a sense of wonder and sanctuary. Every experience is crafted to reconnect you with nature, offering a life lived in deeper connection to the land and sea.
          </p>
        </div>
      </div>
    </section>
  );
}
