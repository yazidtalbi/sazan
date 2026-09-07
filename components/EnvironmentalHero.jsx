'use client';

import { useEffect, useRef } from 'react';

export default function EnvironmentalHero({ src, kicker, title, leftText, rightText }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = reducedMotion.matches ? 1 : Math.min(1, Math.max(0, -rect.top / distance));
      const mobile = window.innerWidth <= 760;
      section.style.setProperty('--hero-media-top', `${progress * (mobile ? 31 : 28)}vh`);
      section.style.setProperty('--hero-media-left', `${progress * (mobile ? 19 : 37)}vw`);
      section.style.setProperty('--hero-media-width', `${100 - progress * (mobile ? 38 : 74)}%`);
      section.style.setProperty('--hero-media-height', `${100 - progress * (mobile ? 48 : 49)}vh`);
      section.style.setProperty('--hero-image-y', `${progress * -16}%`);
      section.style.setProperty('--hero-shade-opacity', Math.max(0, .25 * (1 - progress)).toFixed(3));
      const titleTransition = Math.min(1, Math.max(0, (progress - .08) / .5));
      const titleColor = [
        Math.round(243 + (80 - 243) * titleTransition),
        Math.round(238 + (64 - 238) * titleTransition),
        Math.round(229 + (39 - 229) * titleTransition),
      ];
      const titleEnd = mobile ? 10 : 4;
      section.style.setProperty('--hero-title-top', `${50 + (titleEnd - 50) * titleTransition}vh`);
      section.style.setProperty('--hero-title-y', `${-50 * (1 - titleTransition)}%`);
      section.style.setProperty('--hero-title-color', `rgb(${titleColor.join(' ')})`);
      section.style.setProperty('--hero-copy-opacity', Math.min(1, Math.max(0, (progress - .42) * 4)).toFixed(3));
      section.style.setProperty('--hero-cue-opacity', Math.max(0, 1 - progress * 3).toFixed(3));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reducedMotion.addEventListener('change', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reducedMotion.removeEventListener('change', schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={sectionRef} className="environment-hero">
      <div className="environment-hero-sticky">
        <div className="environment-hero-media">
          <img src={src} alt="Sazan Coast natural landscape" />
          <div className="environment-hero-shade" />
          <span className="environment-hero-kicker">{kicker}</span>
        </div>
        <div className="environment-hero-copy">
          <h1>{title}</h1>
          <p className="environment-hero-copy-left">{leftText}</p>
          <p className="environment-hero-copy-right">{rightText}</p>
        </div>
        <span className="environment-scroll-cue">Scroll to discover</span>
      </div>
    </section>
  );
}
