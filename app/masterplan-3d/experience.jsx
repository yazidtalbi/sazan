'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { sceneLocations as locations } from '@/lib/masterplan3-locations';
import styles from './masterplan-3d.module.css';

export default function MasterplanExperience() {
  const host=useRef(null),markers=useRef([]),navigation=useRef(null),zoomLabel=useRef(null),selection=useRef(null),zone=useRef(null);
  const closeButton=useRef(null),selectControl=useRef(null);
  const [status,setStatus]=useState('loading'),[selected,setSelected]=useState(null),[motion,setMotion]=useState(true),[reduced,setReduced]=useState(false),[pins,setPins]=useState(true),[retry,setRetry]=useState(0);
  const [quality,setQuality]=useState(''),[credits,setCredits]=useState(false);
  selection.current=selected;
  useEffect(()=>{
    let cancelled=false,dispose;
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    const change=()=>{setReduced(media.matches);navigation.current?.setReduced(media.matches);};
    change();media.addEventListener('change',change);
    setStatus('loading');
    import('@/lib/masterplan-3d/scene').then(({mountMasterplan})=>{
      if(cancelled)return;
      const scene=mountMasterplan({host:host.current,markers:markers.current,zoomLabel:zoomLabel.current,zone:zone.current,locations,getSelected:()=>selection.current,onReady:()=>setStatus('ready'),onError:()=>setStatus('fallback'),onQuality:setQuality,reduced:media.matches});
      dispose=scene.dispose;navigation.current=scene;
    }).catch(()=>{if(!cancelled)setStatus('fallback');});
    return()=>{cancelled=true;media.removeEventListener('change',change);dispose?.();navigation.current=null;};
  },[retry]);
  useEffect(()=>{navigation.current?.setMotion(motion);},[motion,status]);
  useEffect(()=>{
    if(selected!==null)closeButton.current?.focus({preventScroll:true});
  },[selected]);
  const close=()=>{setSelected(null);selectControl.current?.focus({preventScroll:true});};
  const reset=()=>{setSelected(null);navigation.current?.reset();};
  const select=index=>{setSelected(index);if(index!==null)navigation.current?.focus(...locations[index].anchor);};
  const location=selected===null?null:locations[selected];
  return <main className={styles.page} onKeyDown={event=>{if(event.key==='Escape'){setCredits(false);close();}}}>
    <div className={styles.fallback} aria-hidden={status==='ready'}>
      <picture>
        <source srcSet="/masterplan-3d/preview.webp" type="image/webp" />
        <img src="/8K.png" alt="The complete Sazan Coast masterplan, with its original coastline, villas, lagoons and marina" fetchPriority="high" width="8058" height="4248" />
      </picture>
    </div>
    <div ref={host} className={`${styles.scene} ${status==='ready'?styles.ready:''}`} data-lenis-prevent tabIndex={status==='ready'?0:-1} role="region" aria-label="Interactive island. Drag to pan; scroll or pinch to zoom. Arrow keys move, plus and minus zoom, Home resets." />
    <div className={styles.vignette} aria-hidden="true" />
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label="Sazan Coast home">SAZAN<span>COAST</span></Link>
      <span className={styles.headerLabel}>A PRIVATE MEDITERRANEAN SANCTUARY</span>
      <Link className={styles.exit} href="/masterplan">Masterplan <span aria-hidden="true">↗</span></Link>
    </header>
    <div className={styles.intro}>
      <p className={styles.eyebrow}>ALBANIA · THE ADRIATIC COAST</p>
      <h1>A different perspective.</h1>
      <p>Discover a place shaped by the sea.</p>
    </div>
    <svg className={styles.zone} style={{visibility:status==='ready'?'visible':'hidden'}} aria-hidden="true"><path ref={zone} /></svg>
    <div className={`${styles.markers} ${status==='ready'&&pins?styles.visible:''}`} inert={status!=='ready'||!pins}>
      {locations.map((item,index)=><button key={item.name} ref={el=>{markers.current[index]=el;}} className={`${styles.marker} ${selected===index?styles.active:''}`} aria-label={`Explore ${item.name}`} aria-expanded={selected===index} aria-controls="island-location-details" onClick={()=>select(selected===index?null:index)}><span>{String(index+1).padStart(2,'0')}</span><i>{item.name}</i></button>)}
    </div>
    <div className={styles.bearing} aria-label="Map orientation is fixed"><span aria-hidden="true">↑</span><small>FIXED VIEW</small></div>
    {location&&<aside id="island-location-details" className={styles.details} aria-label={`${location.name} details`} data-lenis-prevent>
      <button ref={closeButton} className={styles.close} onClick={close} aria-label="Close location details">×</button>
      <img src={location.image} alt={location.name} width="480" height="320" />
      <div className={styles.detailBody}><p className={styles.eyebrow}>EXPLORE SAZAN · {String(selected+1).padStart(2,'0')}</p><h2>{location.name}</h2><dl>{location.stats.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><button className={styles.back} onClick={reset}>Back to the island <span aria-hidden="true">↗</span></button></div>
    </aside>}
    <footer className={styles.footer}>
      <div className={styles.destination}>
        <span className={styles.eyebrow}>EXPLORE THE ISLAND</span>
        <label><span className={styles.srOnly}>Explore a location</span><select aria-label="Explore a location" ref={selectControl} value={selected??''} onChange={event=>select(event.target.value===''?null:Number(event.target.value))}><option value="">All destinations</option>{locations.map((item,i)=><option key={item.name} value={i}>{String(i+1).padStart(2,'0')} — {item.name}</option>)}</select></label>
      </div>
      <div className={styles.hint}><span className={styles.statusDot} data-ready={status==='ready'} /><span role="status">{status==='loading'?'Preparing your island view…':status==='fallback'?'Explore the island using the destination menu':'Drag to explore · Scroll or pinch to get closer'}</span></div>
      <div className={styles.controls} aria-label="Map controls">
        <button onClick={reset} disabled={status!=='ready'} className={styles.reset}>Reset view <span aria-hidden="true">↺</span></button>
        <div className={styles.zoom} role="group" aria-label="Zoom controls"><button aria-label="Zoom out" onClick={()=>navigation.current?.zoom(1/1.35)} disabled={status!=='ready'}>−</button><output ref={zoomLabel} aria-label="Zoom level">1.0×</output><button aria-label="Zoom in" onClick={()=>navigation.current?.zoom(1.35)} disabled={status!=='ready'}>+</button></div>
      </div>
    </footer>
    <div className={styles.secondary}>
      <span>SAZAN COAST <span className={styles.separator}>/</span> THE ISLAND COLLECTION</span>
      <div><button onClick={()=>setPins(!pins)} aria-pressed={pins} disabled={status!=='ready'}>{pins?'Hide':'Show'} places</button><button onClick={()=>setMotion(!motion)} aria-pressed={motion&&!reduced} disabled={reduced||status!=='ready'}>{reduced?'Reduced motion':motion?'Pause motion':'Resume motion'}</button><button onClick={()=>setCredits(!credits)} aria-expanded={credits} aria-controls="island-credits">Credits</button></div>
    </div>
    {quality&&status==='ready'&&<span className={styles.quality} role="status">{quality}</span>}
    {status==='fallback'&&<div className={styles.recovery}><span>Static masterplan view</span><button onClick={()=>setRetry(retry+1)}>Retry 3D</button><a href="/8K.png" target="_blank" rel="noreferrer">Open original plan ↗</a></div>}
    {credits&&<aside id="island-credits" className={styles.credits} aria-label="Asset credits"><button onClick={()=>setCredits(false)} aria-label="Close credits">×</button><h2>Model credits</h2><p><a href="https://poly.pizza/m/d_k2teZePG6" target="_blank" rel="noreferrer">Modern House</a> by henry ham; <a href="https://poly.pizza/m/9znU2c-dTSR" target="_blank" rel="noreferrer">Yacht</a> by Alex Safayan. Adapted and optimized under <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer">CC BY 3.0</a>.</p><p>Original masterplan: Sazan Coast. Modular architecture and vegetation created for this experience.</p></aside>}
  </main>;
}
