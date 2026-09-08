'use client';

import { useEffect, useRef } from 'react';

export default function ParallaxImage({ src, alt = '', speed = 0.45, className = '', style = {} }) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;

    const handleScroll = () => {
      frame = 0;
      if (!containerRef.current || !imgRef.current) return;
      if (reducedMotion.matches) {
        imgRef.current.style.transform = 'none';
        return;
      }
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      if (rect.bottom >= -250 && rect.top <= viewportHeight + 250) {
        const centerY = rect.top + (rect.height / 2);
        const viewportCenter = viewportHeight / 2;
        const distanceFromCenter = centerY - viewportCenter;
        const translateY = distanceFromCenter * speed;
        imgRef.current.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0)`;
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(handleScroll);
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reducedMotion.addEventListener('change', schedule);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reducedMotion.removeEventListener('change', schedule);
      cancelAnimationFrame(frame);
    };
  }, [speed]);

  return (
    <div ref={containerRef} className={`parallax-container ${className}`} style={{ overflow: 'hidden', position: 'relative', width: '100%', height: '100%', ...style }}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="parallax-img"
        style={{
          width: '100%',
          height: '160%',
          objectFit: 'cover',
          position: 'absolute',
          top: '-30%',
          left: 0,
          willChange: 'transform'
        }}
      />
    </div>
  );
}
