'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { masterplan2Locations as locations, masterplan2Tracking as tracking } from '@/lib/masterplan2-locations';
import zones from '@/lib/masterplan2-zones.json';
import { getTrackedPosition } from '@/lib/tracked-position';
import styles from './Masterplan2Locations.module.css';

function zonePath(index, time) {
  const upper = zones.findIndex((frame) => frame.time > time);
  const lower = upper === -1 ? zones.length - 1 : Math.max(0, upper - 1);
  const a = zones[lower];
  const b = zones[upper === -1 ? lower : upper];
  const blend = a === b ? 0 : Math.max(0, (time - a.time) / (b.time - a.time));
  return a.zones[index].map((polygon, p) => polygon.map(([x, y], v) => {
    const target = b.zones[index][p][v];
    return `${v ? 'L' : 'M'}${(x + (target[0] - x) * blend).toFixed(2)},${(y + (target[1] - y) * blend).toFixed(2)}`;
  }).join(' ') + 'Z').join(' ');
}

export default function Masterplan2Locations({ visible, videoRef, heroRef, onSelectionChange }) {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [host, setHost] = useState(null);
  const [side, setSide] = useState('right');
  const rootRef = useRef(null);
  const pathRef = useRef(null);
  const cutoutRef = useRef(null);
  const activeRef = useRef(null);
  const resumeRef = useRef(false);
  const closeTimer = useRef(null);
  const suppressFocusRef = useRef(false);
  const maskId = useId().replaceAll(':', '');
  const active = hovered ?? selected;
  activeRef.current = active;

  useEffect(() => {
    setHost(heroRef.current);
    return () => clearTimeout(closeTimer.current);
  }, [heroRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active !== null) {
      if (!video.paused) resumeRef.current = true;
      video.pause();
    } else if (resumeRef.current) {
      resumeRef.current = false;
      video.play().catch(() => {});
    }
  }, [active, videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    let callback;
    const hasVideoFrames = typeof video.requestVideoFrameCallback === 'function';
    const update = (time = video.currentTime) => {
      rootRef.current?.querySelectorAll('button').forEach((marker, index) => {
        const position = getTrackedPosition(tracking, index, time);
        marker.style.left = position.left;
        marker.style.top = position.top;
        const x = parseFloat(position.left), y = parseFloat(position.top);
        const inFrame = x >= 0 && x <= 100 && y >= 0 && y <= 100;
        marker.style.visibility = inFrame ? '' : 'hidden';
        marker.tabIndex = visible && inFrame ? 0 : -1;
      });
      if (activeRef.current !== null) {
        const d = zonePath(activeRef.current, time);
        pathRef.current?.setAttribute('d', d);
        cutoutRef.current?.setAttribute('d', d);
      }
    };
    const frame = (_, metadata) => {
      update(metadata?.mediaTime ?? video.currentTime);
      callback = hasVideoFrames ? video.requestVideoFrameCallback(frame) : requestAnimationFrame(frame);
    };
    const seek = () => update();
    update();
    callback = hasVideoFrames ? video.requestVideoFrameCallback(frame) : requestAnimationFrame(frame);
    video.addEventListener('seeked', seek);
    video.addEventListener('ended', seek);
    return () => {
      if (hasVideoFrames) video.cancelVideoFrameCallback(callback);
      else cancelAnimationFrame(callback);
      video.removeEventListener('seeked', seek);
      video.removeEventListener('ended', seek);
    };
  }, [videoRef, visible, active]);

  const close = (restoreFocus = false) => {
    clearTimeout(closeTimer.current);
    const index = selected ?? hovered;
    setHovered(null);
    setSelected(null);
    onSelectionChange?.(null);
    if (restoreFocus && index !== null) {
      const marker = rootRef.current?.querySelectorAll('button')[index];
      if (marker && document.activeElement !== marker) {
        suppressFocusRef.current = true;
        marker.focus({ preventScroll: true });
      }
    }
  };

  useEffect(() => {
    const escape = (event) => { if (event.key === 'Escape') close(true); };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  });

  const enter = (index, element) => {
    clearTimeout(closeTimer.current);
    setSide(element.getBoundingClientRect().left < window.innerWidth / 2 ? 'right' : 'left');
    setHovered(index);
  };
  const leave = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setHovered(null), 180);
  };
  const location = active === null ? null : locations[active];
  const d = active === null ? '' : zonePath(active, videoRef.current?.currentTime || 0);

  return <>
    <svg className={`${styles.zones} ${active !== null ? styles.zoneVisible : ''}`} viewBox="0 0 1440 810" aria-hidden="true">
      <defs><mask id={maskId}><rect width="1440" height="810" fill="white" /><path ref={cutoutRef} d={d} fill="black" /></mask></defs>
      <rect width="1440" height="810" fill="#102329" fillOpacity=".38" mask={`url(#${maskId})`} />
      <path ref={pathRef} d={d} fill="#fff" fillOpacity=".2" stroke="#fff8de" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
    </svg>
    <div ref={rootRef} className={`masterplan-locations ${visible ? 'markers-visible' : ''} ${styles.markers} ${active !== null ? styles.hasActive : ''}`}>
      {locations.map((item, index) => <button
        key={item.name}
        className={`masterplan-location-dot is-tracked ${active === index ? styles.active : ''}`}
        style={item.position}
        type="button"
        aria-label={`Explore ${item.name}`}
        aria-expanded={active === index}
        aria-controls={`${maskId}-details`}
        tabIndex={visible ? 0 : -1}
        onPointerDown={(event) => event.stopPropagation()}
        onPointerMove={(event) => event.stopPropagation()}
        onPointerUp={(event) => event.stopPropagation()}
        onPointerEnter={(event) => { if (event.pointerType === 'mouse') enter(index, event.currentTarget); }}
        onPointerLeave={leave}
        onFocus={(event) => {
          if (suppressFocusRef.current) { suppressFocusRef.current = false; return; }
          if (event.currentTarget.matches(':focus-visible')) enter(index, event.currentTarget);
        }}
        onBlur={leave}
        onClick={(event) => {
          if (selected === index) { close(); return; }
          enter(index, event.currentTarget);
          setSelected(index);
          onSelectionChange?.(getTrackedPosition(tracking, index, videoRef.current.currentTime));
        }}
      ><span aria-hidden="true" /><i>{item.name}</i></button>)}
    </div>
    {host && location && createPortal(
      <aside data-masterplan-details id={`${maskId}-details`} className={`${styles.drawer} ${styles[side]}`} aria-label={`${location.name} details`} aria-live="polite"
        onPointerDown={(event) => event.stopPropagation()}
        onPointerMove={(event) => event.stopPropagation()}
        onPointerUp={(event) => event.stopPropagation()}
        onPointerEnter={() => clearTimeout(closeTimer.current)} onPointerLeave={leave}
        onKeyDown={(event) => { if (event.key === 'Escape') event.stopPropagation(); if (event.key === 'Escape') close(true); }}>
        <button className={styles.close} type="button" aria-label="Close location details" onClick={() => close(true)}>×</button>
        <img src={location.image} alt={location.name} width="240" height="240" />
        <h2>{location.name}</h2>
        <dl>{location.stats.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      </aside>, host,
    )}
  </>;
}
