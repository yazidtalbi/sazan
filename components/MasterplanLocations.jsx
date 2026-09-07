'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const locations = [
  {
    name: 'Pine & Lagoon Villas',
    type: 'Private Living',
    position: { left: '58%', top: '70%' },
    image: '/island/pine-lagoon.jpg',
    description: 'A collection of private villas shaped by pine woodland, calm water, and generous outdoor living.',
    facts: ['Low-density villas', 'Lagoon setting', 'Private gardens'],
  },
  {
    name: 'Waterpark Hotel',
    type: 'Hospitality & Leisure',
    position: { left: '80%', top: '51%' },
    image: '/island/waterpark.png',
    description: 'A lively resort destination bringing family hospitality, water experiences, and coastal recreation together.',
    facts: ['Resort hospitality', 'Family recreation', 'Water experiences'],
  },
  {
    name: 'North Residences',
    type: 'Elevated Living',
    position: { left: '55%', top: '56%' },
    image: '/island/north-residences.png',
    description: 'Private residences set within the northern landscape, with open views and a quiet relationship to nature.',
    facts: ['Panoramic outlook', 'Landscape-led design', 'Private amenities'],
  },
  {
    name: 'Sazan Boat Club',
    type: 'Marina & Social',
    position: { left: '35%', top: '54%' },
    image: '/island/sazan-boat.png',
    description: 'A relaxed waterside meeting place for boating, dining, and life around the island’s marina.',
    facts: ['Boat services', 'Waterfront dining', 'Members’ spaces'],
  },
  {
    name: 'South Beach & Hill Estate',
    type: 'Coast & Landscape',
    position: { left: '29%', top: '54%' },
    image: '/island/south-beach.png',
    description: 'A coastal estate connecting the southern beach with secluded homes across the surrounding hillside.',
    facts: ['Natural beach', 'Hillside homes', 'Coastal trails'],
  },
];

export default function MasterplanLocations({ visible = false, onSelectionChange }) {
  const [selected, setSelected] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setSelected(null);
        onSelectionChange?.(null);
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onSelectionChange]);

  const location = selected === null ? null : locations[selected];
  const closeDrawer = () => {
    setSelected(null);
    onSelectionChange?.(null);
  };

  return (
    <>
      <div className={`masterplan-locations ${visible ? 'markers-visible' : ''}`}>
        {locations.map((item, index) => (
          <button
            key={item.name}
            type="button"
            className={`masterplan-location-dot ${selected === index ? 'is-active' : ''}`}
            style={item.position}
            aria-label={`Explore ${item.name}`}
            aria-expanded={selected === index}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => {
              setSelected(index);
              onSelectionChange?.(item.position);
            }}
          >
            <span aria-hidden="true" />
            <i>{item.name}</i>
          </button>
        ))}
      </div>

      {mounted && createPortal(
        <aside className={`masterplan-location-drawer ${location ? 'is-open' : ''}`} aria-hidden={!location} aria-live="polite">
          <button className="masterplan-location-close" type="button" tabIndex={location ? 0 : -1} onPointerDown={(event) => event.stopPropagation()} onClick={closeDrawer} aria-label="Close location details">Close <span aria-hidden="true">×</span></button>
          {location && (
            <div className="masterplan-location-content">
              <div className="masterplan-location-image"><img src={location.image} alt={location.name} /></div>
              <span className="eia-eyebrow">{location.type}</span>
              <h2>{location.name}</h2>
              <p>{location.description}</p>
              <ul>{location.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
            </div>
          )}
        </aside>,
        document.body,
      )}
    </>
  );
}
