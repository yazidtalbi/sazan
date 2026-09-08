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

      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cardsData = [
    {
      className: 'card-top-left',
      dirX: -110,
      dirY: -180,
      speed: 0.7,
      scale: 0.08,
      src: '/intro/01.png',
      alt: 'Rocky Mediterranean coast at sunset'
    },
    {
      className: 'card-mid-left',
      dirX: -130,
      dirY: 130,
      speed: 0.85,
      scale: 0.22,
      src: '/intro/03.png',
      alt: 'Mediterranean sea framed by stone architecture'
    },
    {
      className: 'card-mid-right',
      dirX: 105,
      dirY: -145,
      speed: 0.65,
      scale: 0.04,
      src: '/intro/people.png',
      alt: 'People in Mediterranean luxury sanctuary'
    },
    {
      className: 'card-bottom-right',
      dirX: 135,
      dirY: 165,
      speed: 0.9,
      scale: 0.35,
      src: '/intro/04.png',
      alt: 'Mediterranean table overlooking the sea'
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
