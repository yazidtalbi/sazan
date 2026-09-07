'use client';

import { useEffect, useRef } from 'react';

export default function ParallaxImage({ src, alt = '', speed = 0.25, className = '', style = {} }) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let currentOffset = null;
    const handleScroll = () => {
      frame = 0;
      if (!containerRef.current || !imgRef.current) return;
      if (reducedMotion.matches) {
        imgRef.current.style.transform = 'none';
        currentOffset = null;
        return;
      }
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      if (rect.bottom >= -100 && rect.top <= viewportHeight + 100) {
        const centerY = rect.top + (rect.height / 2);
        const viewportCenter = viewportHeight / 2;
        const distanceFromCenter = centerY - viewportCenter;
        const maxOffset = rect.height * 0.21;
        const translateY = Math.max(-maxOffset, Math.min(maxOffset, distanceFromCenter * speed));
        currentOffset = currentOffset === null ? translateY : currentOffset + (translateY - currentOffset) * 0.14;
        if (Math.abs(translateY - currentOffset) < 0.1) currentOffset = translateY;
        imgRef.current.style.transform = `translate3d(0, ${currentOffset}px, 0)`;
        if (currentOffset !== translateY) frame = requestAnimationFrame(handleScroll);
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
          height: '145%',
          objectFit: 'cover',
          position: 'absolute',
          top: '-22%',
          left: 0,
          willChange: 'transform'
        }}
      />
    </div>
  );
}
