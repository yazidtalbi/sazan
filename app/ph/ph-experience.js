'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './ph.module.css';

const FRAME_COUNT = 120;
const frameUrl = (index) => `/ph/frames/straw-${String(index + 1).padStart(3, '0')}.jpg`;
const chapters = [
  { label: 'A closer look', title: <>Nature.<br />Unfiltered.</>, note: 'There’s more to a berry\nthan meets the eye.', copy: 'Perfectly imperfect. Beautifully complex. Take a closer look at the little things that make nature extraordinary.', bottom: <>The real<br />good stuff.</>, side: <>A little<br />closer.</> },
  { label: 'A little transformation', title: <>Good things<br />take time.</>, note: 'A little change.\nA whole new perspective.', copy: 'Nothing in nature stands still. Follow the transformation, and see something familiar in a completely different light.', bottom: <>Let nature<br />do its thing.</>, side: <>Every<br />little detail.</> },
  { label: 'A fresh perspective', title: <>Fresh look.<br />Same nature.</>, note: 'Small berry.\nWonderful little world.', copy: 'From a different angle, a new appreciation. Here’s to slowing down, looking closer, and finding the extraordinary in the everyday.', bottom: <>Simply<br />extraordinary.</>, side: <>Rooted<br />in nature.</> },
];

function Botanical({ className }) {
  return <svg className={className} viewBox="0 0 240 260" fill="currentColor" aria-hidden="true"><path d="M118 260C137 174 119 92 96 20l6-2c35 85 41 164 23 242z" /><path d="M111 82C39 100 17 53 8 22c53-7 91 9 103 60ZM126 123C167 66 213 69 237 79c-16 43-49 65-111 44ZM124 170C55 174 32 130 30 101c51 4 79 26 94 69ZM133 62C119 22 139 4 157 0c20 32 10 49-24 62ZM130 215C170 156 209 157 239 170c-22 39-57 56-109 45Z" /></svg>;
}

export default function PhExperience() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const progressRef = useRef(null);
  const textRailRef = useRef(null);
  const [chapter, setChapter] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const frames = new Map();
    const requested = new Set();
    let disposed = false;
    let active = 0;
    let target = 0;
    let drawn = -1;
    let raf = 0;
    let currentChapter = -1;

    function paint() {
      raf = 0;
      if (disposed) return;
      const distance = root.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -root.getBoundingClientRect().top / Math.max(1, distance)));
      target = motion.matches ? 0 : Math.round(progress * (FRAME_COUNT - 1));
      progressRef.current.style.setProperty('--progress', progress);
      textRailRef.current.style.setProperty('--text-progress', progress);
      const nextChapter = Math.min(2, Math.floor(progress * 3));
      if (nextChapter !== currentChapter) {
        currentChapter = nextChapter;
        setChapter(nextChapter);
      }
      let nearest = -1;
      for (const index of frames.keys()) {
        if (nearest === -1 || Math.abs(index - target) < Math.abs(nearest - target)) nearest = index;
      }
      if (nearest !== -1 && nearest !== drawn) {
        context.drawImage(frames.get(nearest), 0, 0, canvas.width, canvas.height);
        drawn = nearest;
      }
      loadNext();
    }

    function schedule() {
      if (!raf && !disposed) raf = requestAnimationFrame(paint);
    }

    function loadNext() {
      // Keep downloads bounded, prioritizing the user's current scroll position.
      while (!disposed && active < 4 && requested.size < (motion.matches ? 1 : FRAME_COUNT)) {
        let next = -1;
        for (let index = 0; index < FRAME_COUNT; index++) {
          if (!requested.has(index) && (next === -1 || Math.abs(index - target) < Math.abs(next - target))) next = index;
        }
        if (next === -1) break;
        requested.add(next);
        active++;
        const img = new Image();
        img.onload = () => {
          active--;
          if (disposed) return;
          frames.set(next, img);
          schedule();
          loadNext();
        };
        img.onerror = () => { active--; if (!disposed) loadNext(); };
        img.src = frameUrl(next);
      }
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    motion.addEventListener('change', schedule);
    schedule();
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      motion.removeEventListener('change', schedule);
      frames.clear();
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event) => {
      if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); }
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [menuOpen]);

  function goToChapter(index) {
    setMenuOpen(false);
    const root = rootRef.current;
    const top = window.scrollY + root.getBoundingClientRect().top;
    window.scrollTo({ top: top + (root.offsetHeight - window.innerHeight) * [0, 0.5, 1][index], behavior: 'instant' });
  }

  return (
    <main className={styles.page} ref={rootRef}>
      <div className={styles.stage}>
        <div className={styles.backdrop}>
          <canvas ref={canvasRef} width="1440" height="810" className={styles.canvas} role="img" aria-label="A strawberry slowly transforms from weathered to fresh as you scroll." />
        </div>
        <Botanical className={styles.botanical} />
        <header className={styles.header}>
          <a className={styles.logo} href="/ph" aria-label="PH home">ph<span>®</span></a>
          <span className={styles.headerNote}>A fresh perspective on nature</span>
          <button ref={menuButton} className={styles.menuButton} aria-expanded={menuOpen} aria-controls="ph-menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Close' : 'Menu'}<span>{menuOpen ? '−' : '+'}</span></button>
          {menuOpen && <nav id="ph-menu" className={styles.menu} aria-label="Chapters">{chapters.map((item, index) => <button key={item.label} onClick={() => goToChapter(index)}><small>0{index + 1}</small>{item.label}<span>↗</span></button>)}</nav>}
        </header>

        <div className={styles.annotation}>
          <svg viewBox="0 0 100 100" fill="none" aria-hidden="true"><path d="M87 9C36 4 20 39 30 79m-12-9 12 11 9-16" stroke="currentColor" strokeWidth="1.4" /></svg>
          <p>{chapters[0].note}</p>
          <span>No two are the same.</span>
        </div>

        <div className={styles.textRail} ref={textRailRef}>
          {chapters.map((item, index) => (
            <section className={styles.textPanel} key={item.label} aria-label={item.label}>
              <div className={styles.headline}>
                <span className={styles.eyebrow}>The everyday, reimagined</span>
                <h1>{item.title}</h1>
              </div>
              <div className={styles.story}>
                <span className={styles.storyIndex}>0{index + 1} / A small wonder</span>
                <p>{item.copy}</p>
                <button className={styles.outlineButton} onClick={() => goToChapter(index === 2 ? 0 : index + 1)}>{index === 2 ? 'Take another look' : 'Explore the good'}<span>↗</span></button>
              </div>
              <div className={styles.bottomTitles} aria-hidden="true"><span>{item.bottom}</span><span>{item.side}</span></div>
            </section>
          ))}
        </div>
        <footer className={styles.footer}>
          <span className={styles.footerLabel}><i /> Little things. Big wonder.</span>
          <div className={styles.progressGroup}>
            <span className={styles.scrollIcon}>↓</span><span>Scroll to discover</span>
            <div className={styles.track} ref={progressRef}><span /></div><span>0{chapter + 1} — 03</span>
          </div>
          <span className={styles.edition}>Nature study — Nº 001</span>
        </footer>
      </div>
    </main>
  );
}
