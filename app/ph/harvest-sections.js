'use client';

import { useEffect, useRef } from 'react';
import styles from './harvest-sections.module.css';

const pillars = [
  { id: 'sustainable-sourcing', title: 'Sustainable Sourcing', image: 'Farmers in the field', copy: 'We work with food companies, food service, and retailers to incorporate sustainably sourced produce into new and existing products.', speed: 0.16 },
  { id: 'food-boxes', title: 'Food Boxes', image: 'Fresh food boxes', copy: 'We design and deliver curated food boxes in partnership with healthcare providers, corporate employers, insurers & nonprofit organizations.', speed: 0.34 },
  { id: 'product-integration', title: 'Product Integration', image: 'Harvesting fresh produce', copy: 'We work with food companies, food service, and retailers to incorporate sustainably sourced produce into new and existing products.', speed: 0.24 },
];

function ImagePlaceholder({ label, className = '' }) {
  return <div className={`${styles.imagePlaceholder} ${className}`} role="img" aria-label={`${label} — image placeholder`} />;
}

export default function HarvestSections() {
  const pillarsRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = pillarsRef.current.getBoundingClientRect();
      const mobile = window.innerWidth < 700;
      const travel = window.innerHeight * 0.65 - rect.top;
      cardsRef.current.forEach((card, index) => {
        const limit = mobile ? 35 : 240;
        const shift = motion.matches ? 0 : Math.max(-limit, Math.min(limit, -travel * pillars[index].speed * (mobile ? 0.25 : 1)));
        card.style.setProperty('--card-shift', `${shift}px`);
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    motion.addEventListener('change', schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      motion.removeEventListener('change', schedule);
    };
  }, []);

  return (
    <div className={styles.harvest}>
      <section className={styles.intro} id="our-story" aria-labelledby="harvest-title">
        <h2 id="harvest-title" className={styles.sectionTitle}>Unlocking the Value of<br />Every Whole Harvest</h2>
        <div className={styles.stackingRows}>
          <div className={`${styles.splitRow} ${styles.purposeRow}`}>
            <ImagePlaceholder label="Tractor working a farm" />
            <div className={`${styles.copyPanel} ${styles.darkPanel}`}>
              <h3>Planet Harvest is a purpose-driven company with a vision to maximize the amount of fresh produce that moves from farms to families.</h3>
              <p>We connect farmers with food companies, foodservice and retailers to unlock the value of the whole harvest, optimize the supply chain, &amp; reduce environmental waste.</p>
            </div>
          </div>
          <div className={`${styles.splitRow} ${styles.sourcingRow}`} id="whole-harvest">
            <div className={`${styles.copyPanel} ${styles.lightPanel}`}>
              <h3>Planet Harvest is setting the standard in whole harvest sourcing.</h3>
              <p>Our solution is to work directly with growers to analyze the entire harvest, from #1 grade to excess crops, creating a market that turns waste into opportunity. We deliver end-to-end solutions that are designed for scale, rooted in transparency, and aligned with both farmer realities and buyer needs.</p>
            </div>
            <ImagePlaceholder label="Farmers picking strawberries" className={styles.harvestingImage} />
          </div>
        </div>
      </section>

      <section className={styles.vision} id="our-impact" aria-labelledby="vision-title">
        <div className={styles.fieldMark} aria-hidden="true"><span />✳<span /></div>
        <h2 id="vision-title">Our long term goal is to create<br className={styles.desktopBreak} /> a whole harvest marketplace that aligns farmers supply with real time demand across food &amp; retail sectors, while driving increased revenue back to the farm.</h2>
        <ImagePlaceholder label="A panoramic view of farmland" className={styles.landscape} />
      </section>

      <section className={styles.pillars} id="three-pillars" ref={pillarsRef} aria-labelledby="pillars-title">
        <h2 id="pillars-title" className={styles.pillarsTitle}>Three Pillars</h2>
        <div className={styles.cards}>
          {pillars.map((pillar, index) => <article id={pillar.id} key={pillar.id} ref={(node) => { cardsRef.current[index] = node; }} className={`${styles.card} ${styles[`card${index}`]}`}>
            <ImagePlaceholder label={pillar.image} className={styles.cardImage} />
            <h3>{pillar.title}</h3>
            <p>{pillar.copy}</p>
          </article>)}
        </div>
      </section>

      <section className={styles.callout} aria-labelledby="callout-title">
        <h2 id="callout-title">We source the whole harvest and connect all grades of produce from farmers to communities.</h2>
        <a className={styles.button} href="#whole-harvest">Learn more <span aria-hidden="true">↗</span></a>
      </section>

      <footer className={styles.siteFooter} id="connect">
        <nav className={styles.footerNav} aria-label="Planet Harvest footer">
          <div><span>Company</span><a href="#our-story">Our story</a><a href="#whole-harvest">Our approach</a></div>
          <div><span>What we do</span><a href="#sustainable-sourcing">Sustainable sourcing</a><a href="#product-integration">Product integration</a><a href="#food-boxes">Food boxes</a></div>
          <div><span>Impact</span><a href="#our-impact">Farm to community</a><a href="#our-impact">Our impact</a></div>
          <div><span>Connect</span><p>Let’s build a partnership</p><a className={styles.footerButton} href="#our-story">Learn more ↗</a></div>
        </nav>
        <a href="#" className={styles.wordmark} aria-label="Planet Harvest, back to top">Planet Harvest</a>
        <div className={styles.footerBottom}><span>From farms to communities.</span><span>© {new Date().getFullYear()} Planet Harvest, LLC</span><a href="#">Back to top ↑</a></div>
      </footer>
    </div>
  );
}
