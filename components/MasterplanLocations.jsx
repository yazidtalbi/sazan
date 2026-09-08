'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const DEFAULT_LOGOS = [
  '/logos/Atlantis-The-Royal-Logo 1-white.png',
  '/logos/aliee-logo-white.svg',
  '/logos/Raffles_Hotels_&_Resorts_logo.svg-white.png',
  '/logos/LOGO-CHEVAL-BLANC-white.png',
  null,
];

const locations = [
  {
    name: 'Atlantis The Royal',
    type: 'Hospitality & Luxury Living',
    position: { left: '71.47%', top: '26.20%' },
    image: '/masterplan/places/atlantis.png',
    description: 'An iconic resort experience alive with exceptional dining, entertainment, and aquatic discovery.',
    facts: ['Ultra-luxury resort', 'Private beach & pools', 'World-class dining'],
  },
  {
    name: 'Aliée',
    type: 'Boutique Living & Resort',
    position: { left: '82.10%', top: '21.36%' },
    image: '/masterplan/places/aliee.png',
    description: 'A design-led escape where culture, creativity, and contemporary Mediterranean energy converge.',
    facts: ['Boutique hospitality', 'Lagoon setting', 'Private wellness'],
  },
  {
    name: 'Raffles',
    type: 'Ultra-Luxury Hospitality',
    position: { left: '45.00%', top: '51.08%' },
    image: '/masterplan/places/raffles.png',
    description: 'A refined coastal retreat where timeless elegance meets Raffles’ legendary, intuitive service.',
    facts: ['Legendary service', 'Landscape-led design', 'Private amenities'],
  },
  {
    name: 'Cheval Blanc',
    type: 'Maison & Resort',
    position: { left: '23.80%', top: '56.08%' },
    image: '/masterplan/places/cheval-blanc.png',
    description: 'An intimate coastal maison defined by rare privacy, exceptional artistry, and deeply personal service.',
    facts: ['Exclusive maison', 'Waterfront dining', 'Members’ spaces'],
  },
  {
    name: 'South Beach & Hill Estate',
    type: 'Coast & Landscape',
    position: { left: '11.03%', top: '58.26%' },
    image: '/island/south-beach.png',
    description: 'A coastal estate connecting the southern beach with secluded homes across the surrounding hillside.',
    facts: ['Natural beach', 'Hillside homes', 'Coastal trails'],
  },
];

export default function MasterplanLocations({ visible = false, onSelectionChange, logos = DEFAULT_LOGOS, editorKey, showTools = false }) {
  const [selected, setSelected] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [positions, setPositions] = useState(() => locations.map((item) => item.position));
  const [toolbarHost, setToolbarHost] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const markersRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    if (!editorKey) return;
    setToolbarHost(markersRef.current?.closest('section'));
    try {
      const saved = JSON.parse(localStorage.getItem(editorKey));
      if (Array.isArray(saved) && saved.length === locations.length && saved.every((position) =>
        ['left', 'top'].every((axis) => typeof position?.[axis] === 'string' && /^\d+(\.\d+)?%$/.test(position[axis]) && parseFloat(position[axis]) <= 100)
      )) setPositions(saved);
    } catch { /* Keep the default placements when storage is unavailable. */ }
  }, [editorKey]);

  const startMarkerDrag = (event, index) => {
    event.stopPropagation();
    if (!editing || event.button !== 0) return;
    event.preventDefault();
    const rect = markersRef.current.getBoundingClientRect();
    dragRef.current = {
      index,
      pointerId: event.pointerId,
      offsetX: (event.clientX - rect.left) / rect.width * 100 - parseFloat(positions[index].left),
      offsetY: (event.clientY - rect.top) / rect.height * 100 - parseFloat(positions[index].top),
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setSaveStatus('');
  };

  const moveMarker = (event) => {
    event.stopPropagation();
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const rect = markersRef.current.getBoundingClientRect();
    const percent = (value) => `${Math.max(0, Math.min(100, value)).toFixed(2)}%`;
    const position = {
      left: percent((event.clientX - rect.left) / rect.width * 100 - drag.offsetX),
      top: percent((event.clientY - rect.top) / rect.height * 100 - drag.offsetY),
    };
    setPositions((current) => current.map((item, index) => index === drag.index ? position : item));
  };

  const endMarkerDrag = (event) => {
    event.stopPropagation();
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

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
      {showTools && toolbarHost && visible && createPortal(
        <div className="masterplan-placement-tools" onPointerDown={(event) => event.stopPropagation()}>
          <button type="button" aria-pressed={editing} onClick={() => {
            if (!editing) closeDrawer();
            setEditing(!editing);
            setSaveStatus('');
          }}>{editing ? 'Done editing' : 'Edit placements'}</button>
          {editing && <>
            <button type="button" onClick={() => {
              try {
                localStorage.setItem(editorKey, JSON.stringify(positions));
                setSaveStatus('Saved in this browser');
              } catch { setSaveStatus('Browser storage unavailable'); }
            }}>Save positions</button>
            <button type="button" onClick={async () => {
              const exported = JSON.stringify(locations.map((item, index) => ({ name: item.name, ...positions[index] })), null, 2);
              try {
                await navigator.clipboard.writeText(exported);
                setSaveStatus('Positions copied — paste them into the chat');
              } catch {
                window.prompt('Copy these placement positions:', exported);
              }
            }}>Copy positions</button>
            <button type="button" onClick={() => {
              setPositions(locations.map((item) => item.position));
              setSaveStatus('Defaults restored — save to keep');
            }}>Reset</button>
            <span>Drag a circle or logo</span>
          </>}
          <span role="status">{saveStatus}</span>
        </div>, toolbarHost
      )}
      <div ref={markersRef} className={`masterplan-locations ${visible ? 'markers-visible' : ''} ${editing ? 'is-editing' : ''} ${selected !== null ? 'has-selected-location' : ''}`}>
        {locations.map((item, index) => (
          <button
            key={item.name}
            type="button"
            className={`masterplan-location-dot ${logos ? 'has-logo' : ''} ${selected === index ? 'is-active' : ''}`}
            style={positions[index]}
            aria-label={`${editing ? 'Move' : 'Explore'} ${item.name}`}
            aria-expanded={selected === index}
            onPointerDown={(event) => startMarkerDrag(event, index)}
            onPointerMove={moveMarker}
            onPointerUp={endMarkerDrag}
            onPointerCancel={endMarkerDrag}
            onLostPointerCapture={() => { dragRef.current = null; }}
            onClick={() => {
              if (editing) return;
              setSelected(index);
              onSelectionChange?.(positions[index]);
            }}
          >
            <span aria-hidden="true" />
            {logos?.[index] && (
              <div className="masterplan-marker-mast" aria-hidden="true">
                <img src={logos[index]} alt="" draggable={false} className="masterplan-marker-logo" />
              </div>
            )}
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
