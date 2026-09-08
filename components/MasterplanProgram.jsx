'use client';

import { useEffect, useRef, useState } from 'react';

const items = [
  {
    title: 'Programmable',
    image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=85',
    intro: 'A flexible coastal framework designed to evolve with season, community, and place.',
    detail: 'Placeholder — mixed-use districts, adaptable public spaces, and carefully phased amenities create a destination that can respond naturally over time.',
    meta: ['Flexible districts', 'Phased delivery', 'Year-round activation'],
  },
  {
    title: 'Stewardship',
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="100%" height="100%" fill="%23e2e2e2"/></svg>',
    intro: 'Long-term care for the landscape is embedded in every planning decision.',
    detail: 'Placeholder — habitat protection, restoration programs, and ongoing monitoring place environmental responsibility at the center of the masterplan.',
    meta: ['Habitat protection', 'Native restoration', 'Long-term monitoring'],
  },
  {
    title: 'Low Density',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=85',
    intro: 'Architecture sits lightly within the coast, preserving openness, privacy, and horizon.',
    detail: 'Placeholder — a restrained development footprint protects view corridors, limits building height, and allows the natural landscape to remain dominant.',
    meta: ['Limited footprint', 'Protected views', 'Landscape-led planning'],
  },
  {
    title: 'Active Mobility',
    image: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=900&q=85',
    intro: 'A quiet network of shaded paths connects the coast without interrupting it.',
    detail: 'Placeholder — walking, cycling, and discreet electric mobility reduce vehicle dependence while making movement through Sazan intuitive and enjoyable.',
    meta: ['Walkable routes', 'Cycle connections', 'Electric mobility'],
  },
];

export default function MasterplanProgram() {
  const [openIndex, setOpenIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const previewRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  const movePreview = (event) => {
    if (!previewRef.current || event.pointerType === 'touch') return;
    const x = Math.min(window.innerWidth - 245, Math.max(24, event.clientX + 24));
    const y = Math.min(window.innerHeight - 315, Math.max(24, event.clientY + 24));
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      previewRef.current?.style.setProperty('transform', `translate3d(${x}px, ${y}px, 0)`);
    });
  };

  return (
    <section className="masterplan-program" onPointerMove={movePreview} onPointerLeave={() => setHoveredIndex(null)}>
      <div className="container">
        <div className="masterplan-program-heading">
          <span className="eia-eyebrow">The Program</span>
          <p>Four principles shape a masterplan led by landscape, movement, and long-term value.</p>
        </div>
        <div className="masterplan-program-list">
          {items.map((item, index) => {
            const open = openIndex === index;
            return (
              <article className={`masterplan-program-item ${open ? 'is-open' : ''}`} key={item.title}>
                <button
                  className="masterplan-program-trigger"
                  type="button"
                  aria-expanded={open}
                  aria-controls={`masterplan-program-panel-${index}`}
                  onPointerEnter={(event) => {
                    if (event.pointerType !== 'touch') {
                      setHoveredIndex(index);
                      movePreview(event);
                    }
                  }}
                  onFocus={() => setHoveredIndex(index)}
                  onBlur={() => setHoveredIndex(null)}
                  onClick={() => setOpenIndex(open ? null : index)}
                >
                  <span className="masterplan-program-number">0{index + 1}</span>
                  <span className="masterplan-program-title">{item.title}</span>
                  <span className="masterplan-program-action">{open ? 'Close' : 'Explore'} <i aria-hidden="true">{open ? '−' : '+'}</i></span>
                </button>
                <div className="masterplan-program-panel" id={`masterplan-program-panel-${index}`}>
                  <div className="masterplan-program-panel-inner">
                    <p className="masterplan-program-intro">{item.intro}</p>
                    <p className="masterplan-program-detail">{item.detail}</p>
                    <ul>{item.meta.map((value) => <li key={value}>{value}</li>)}</ul>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <div ref={previewRef} className={`masterplan-cursor-preview ${hoveredIndex !== null ? 'is-visible' : ''}`} aria-hidden="true">
        {items.map((item, index) => <img className={hoveredIndex === index ? 'is-visible' : ''} key={item.title} src={item.image} alt="" />)}
      </div>
    </section>
  );
}
