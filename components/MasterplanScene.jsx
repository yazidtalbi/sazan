'use client';

import { useEffect, useId, useRef, useState } from 'react';
import * as THREE from 'three';
import localFont from 'next/font/local';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { sceneLocations as locations } from '@/lib/masterplan3-locations';
import zones from '@/lib/masterplan3-zones.json';
import depthGrid from '@/lib/masterplan3-depth.json';
import { waterGlitterShader } from '@/lib/masterplan3-glitter';
import styles from '@/app/masterplan3/masterplan3.module.css';

const ivyMode = localFont({ src: '../public/fonts/IvyMode-Light.ttf', weight: '300', display: 'swap', variable: '--font-serif' });
const gilroy = localFont({ src: '../public/fonts/Gilroy-Medium.ttf', weight: '500', display: 'swap', variable: '--font-sans' });

const ASPECT = 8058 / 4248;
function depthAt(x, y) {
  const ix = Math.max(0, Math.min(depthGrid.width - 1, Math.round(x * (depthGrid.width - 1))));
  const iy = Math.max(0, Math.min(depthGrid.height - 1, Math.round(y * (depthGrid.height - 1))));
  return depthGrid.values[iy * depthGrid.width + ix] / 255;
}

const vertexShader = `
  varying vec2 vUv;
  uniform sampler2D uDepth;
  uniform float uRelief;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z += texture2D(uDepth, uv).r * uRelief;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const fragmentShader = `
  varying vec2 vUv;
  uniform sampler2D uImage;
  uniform sampler2D uDepth;
  uniform vec2 uPointer;
  uniform float uTime;
  uniform float uMotion;
  uniform sampler2D uCloudTexture;
  uniform sampler2D uIslandMask;
  uniform vec4 uCloudShadows[3];
  uniform float uCloudShadowStrength;
  float cloudAlpha(vec2 uv) {
    float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
    return texture2D(uCloudTexture, clamp(uv, 0.0, 1.0)).a * inside;
  }
  float cloudShadow(vec2 world, vec4 cloud) {
    vec2 uv = (world - cloud.xy) / cloud.zw + .5;
    // Sample the same cloud silhouette with a soft penumbra.
    vec2 blur = vec2(.018, .03);
    return cloudAlpha(uv) * .4
      + (cloudAlpha(uv + vec2(blur.x, 0.0)) + cloudAlpha(uv - vec2(blur.x, 0.0))
      + cloudAlpha(uv + vec2(0.0, blur.y)) + cloudAlpha(uv - vec2(0.0, blur.y))) * .15;
  }
  ${waterGlitterShader}
  void main() {
    float depth = texture2D(uDepth, vUv).r;
    vec2 uv = clamp(vUv + uPointer * depth, .001, .999);
    vec4 color = texture2D(uImage, uv);
    // Add the independent, water-masked specular layer in linear color space.
    color.rgb += waterGlitter(uv, uTime) * uMotion;
    if (uCloudShadowStrength > 0.0 && uMotion > 0.0) {
      vec2 world = (vUv - .5) * vec2(${(8058 / 4248) * 2}, 2.0);
      float a = cloudShadow(world, uCloudShadows[0]);
      float b = cloudShadow(world, uCloudShadows[1]);
      float c = cloudShadow(world, uCloudShadows[2]);
      float shadow = 1.0 - (1.0 - a) * (1.0 - b) * (1.0 - c);
      // Restrict shadows to the island estates, excluding the sea and canals.
      float land = texture2D(uIslandMask, uv).r * (1.0 - smoothstep(.05, .5, texture2D(uWaterMask, uv).r));
      color.rgb *= 1.0 - shadow * land * uCloudShadowStrength;
    }
    gl_FragColor = color;
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export default function MasterplanScene() {
  const maskId = useId().replaceAll(':', '');
  const zoneSvgRef = useRef(null);
  const zonePathRef = useRef(null);
  const zoneCutoutRef = useRef(null);
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const canvasHost = useRef(null);
  const markerRefs = useRef([]);
  const progressRef = useRef(null);
  const selectedRef = useRef(null);
  const motionRef = useRef(true);
  const reducedRef = useRef(false);
  const navigationRef = useRef(null);
  const zoomLabelRef = useRef(null);
  const focusBlurRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [motion, setMotion] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);
  selectedRef.current = selected;
  motionRef.current = motion && !reduced;
  reducedRef.current = reduced;

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const escape = event => {
      if (event.key === 'Escape' && selectedRef.current !== null) {
        markerRefs.current[selectedRef.current]?.focus({ preventScroll: true });
        setSelected(null);
      }
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, []);

  useEffect(() => {
    if (ready || !viewportRef.current) return;
    const update = () => {
      const { clientWidth: width, clientHeight: height } = viewportRef.current;
      const mapWidth = Math.max(width, height * ASPECT), mapHeight = mapWidth / ASPECT;
      const d = selected === null ? '' : zones[selected].map(polygon => polygon.map(([x, y], i) =>
        `${i ? 'L' : 'M'}${(width - mapWidth) / 2 + x * mapWidth},${(height - mapHeight) / 2 + y * mapHeight}`
      ).join(' ') + 'Z').join(' ');
      zoneSvgRef.current?.setAttribute('viewBox', `0 0 ${width} ${height}`);
      zonePathRef.current?.setAttribute('d', d);
      zoneCutoutRef.current?.setAttribute('d', d);
    };
    const observer = new ResizeObserver(update);
    observer.observe(viewportRef.current);
    update();
    return () => observer.disconnect();
  }, [ready, selected]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const host = canvasHost.current, viewport = viewportRef.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch {
      return; // The original image and location selector remain usable.
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, .1, 40);
    const group = new THREE.Group();
    scene.add(group);
    const loader = new THREE.TextureLoader();
    const textures = [], materials = [], geometries = [];
    let disposed = false, loaded = false, failed = false, width = 1, height = 1, baseDistance = 4;
    const pointer = new THREE.Vector2(), smoothed = new THREE.Vector2();
    const scroll = { progress: 0 };
    const state = { zoom: 1, x: 0, y: 0 };
    const target = { zoom: 1, x: 0, y: 0 };
    const velocity = new THREE.Vector2();
    const touches = new Map();
    let manual = false, lastGesture = null;
    const halfHeight = zoom => baseDistance / zoom * Math.tan(THREE.MathUtils.degToRad(20));
    const boundTarget = () => {
      const halfY = halfHeight(target.zoom), halfX = halfY * camera.aspect;
      // Reserve a small image border for perspective tilt and UV parallax.
      const maxX = Math.max(0, ASPECT - halfX - .045);
      const maxY = Math.max(0, 1 - halfY - .045);
      const x = THREE.MathUtils.clamp(target.x, -maxX, maxX);
      const y = THREE.MathUtils.clamp(target.y, -maxY, maxY);
      if (x !== target.x) velocity.x = 0;
      if (y !== target.y) velocity.y = 0;
      target.x = x; target.y = y;
    };
    const takeControl = () => {
      if (!manual) Object.assign(target, state);
      manual = true;
      velocity.set(0, 0);
    };
    const zoomAt = (factor, clientX, clientY) => {
      takeControl();
      const rect = viewport.getBoundingClientRect();
      const nx = clientX === undefined ? 0 : (clientX - rect.left) / width * 2 - 1;
      const ny = clientY === undefined ? 0 : 1 - (clientY - rect.top) / height * 2;
      const before = halfHeight(target.zoom);
      target.zoom = THREE.MathUtils.clamp(target.zoom * Math.pow(factor, .75), 1, 5);
      const after = halfHeight(target.zoom);
      target.x += nx * (before - after) * camera.aspect;
      target.y += ny * (before - after);
      boundTarget();
    };
    navigationRef.current = {
      zoom: factor => zoomAt(factor),
      reset: () => { takeControl(); Object.assign(target, { zoom: 1, x: 0, y: 0 }); },
      focus: index => {
        takeControl();
        const [x, y] = locations[index].anchor;
        target.zoom = Math.max(target.zoom, 1.6);
        target.x = (x - .5) * ASPECT * 2;
        target.y = (.5 - y) * 2;
        boundTarget();
      },
    };
    // Use the registered estate outlines as a land-only shadow receiver.
    const islandCanvas = document.createElement('canvas');
    islandCanvas.width = 2048;
    islandCanvas.height = Math.round(2048 / ASPECT);
    const islandContext = islandCanvas.getContext('2d');
    islandContext.fillStyle = '#000';
    islandContext.fillRect(0, 0, islandCanvas.width, islandCanvas.height);
    islandContext.fillStyle = '#fff';
    zones.forEach(zone => zone.forEach(polygon => {
      islandContext.beginPath();
      polygon.forEach(([x, y], index) => islandContext[index ? 'lineTo' : 'moveTo'](x * islandCanvas.width, y * islandCanvas.height));
      islandContext.closePath();
      islandContext.fill();
    }));
    const islandMask = new THREE.CanvasTexture(islandCanvas);
    textures.push(islandMask);
    const uniforms = {
      uIslandMask: { value: islandMask },
      uCloudTexture: { value: null }, uCloudShadowStrength: { value: 0 },
      uCloudShadows: { value: [new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4()] },
      uImage: { value: null }, uDepth: { value: null },
      uPointer: { value: new THREE.Vector2() }, uTime: { value: 0 },
      uRelief: { value: .008 }, uMotion: { value: 1 },
      uWaterMask: { value: null }, uSunPosition: { value: new THREE.Vector2(.48, .52) },
      uGlitterLength: { value: 1 }, uGlitterStrength: { value: .32 },
    };
    const clouds = [];
    const load = url => new Promise((resolve, reject) => {
      const texture = loader.load(url, result => {
        if (disposed) { result.dispose(); return; }
        resolve(result);
      }, undefined, reject);
      textures.push(texture);
    });
    const fail = () => {
      failed = true;
      setReady(false);
      renderer.setAnimationLoop(null);
    };
    Promise.all([load('/8K.png'), load('/masterplan/island-depth.png'), load('/masterplan/island-water-mask.png')]).then(([image, depth, waterMask]) => {
      if (disposed) return;
      image.colorSpace = THREE.SRGBColorSpace;
      image.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      uniforms.uImage.value = image;
      uniforms.uDepth.value = depth;
      // A data texture, not an sRGB image. Avoid coarse mipmaps averaging land
      // into water at wide zooms; the full-resolution inset mask stays exact.
      waterMask.colorSpace = THREE.NoColorSpace;
      waterMask.generateMipmaps = false;
      waterMask.minFilter = THREE.LinearFilter;
      waterMask.magFilter = THREE.LinearFilter;
      uniforms.uWaterMask.value = waterMask;
      const geometry = new THREE.PlaneGeometry(ASPECT * 2, 2, 256, 136);
      const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader });
      geometries.push(geometry); materials.push(material);
      group.add(new THREE.Mesh(geometry, material));
      loaded = true;
      setReady(true);
    }).catch(() => { if (!disposed) fail(); });
    load('/island/cloud-overlay.png').then(texture => {
      if (disposed) return;
      texture.colorSpace = THREE.SRGBColorSpace;
      uniforms.uCloudTexture.value = texture;
      uniforms.uCloudShadowStrength.value = .38;
      // The cloud texture is also projected onto the map by its surface shader.
      for (let i = 0; i < 3; i++) {
        const geometry = new THREE.PlaneGeometry(1.5, .8);
        geometries.push(geometry);
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true,
          opacity: .36, color: '#ffffff', depthWrite: false });
        materials.push(material);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(i === 0 ? -1.35 : 1.2, [-.15, -.45, .7][i], .09 + i * .02);
        clouds.push({ mesh, y: mesh.position.y, direction: i === 1 ? -1 : 1, phase: [.12, .64, .4][i], duration: [174, 228, 200][i], shadow: new THREE.Vector2(), previousPass: null });
        group.add(mesh);
      }
    }).catch(() => {}); // Ambient layers are optional if the asset is unavailable.

    const tween = gsap.to(scroll, { progress: 1, ease: 'none', scrollTrigger: {
      trigger: sectionRef.current, start: 'top top', end: 'bottom bottom', scrub: .8,
    } });
    const resize = () => {
      width = viewport.clientWidth; height = viewport.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      // Cover the viewport with a small overscan for the mouse-driven tilt.
      baseDistance = Math.min(1, ASPECT / camera.aspect) / Math.tan(THREE.MathUtils.degToRad(20)) * .95;
      camera.updateProjectionMatrix();
      boundTarget();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(viewport);
    resize();
    const move = event => {
      if (touches.has(event.pointerId)) {
        event.preventDefault();
        touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
        const points = [...touches.values()];
        const current = { x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
          y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
          distance: points.length > 1 ? Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y) : 0,
          time: performance.now() };
        if (lastGesture) {
          if (current.distance && lastGesture.distance) zoomAt(current.distance / lastGesture.distance, current.x, current.y);
          const units = halfHeight(target.zoom) * 2 / height;
          const dx = -(current.x - lastGesture.x) * units;
          const dy = (current.y - lastGesture.y) * units;
          target.x += dx; target.y += dy;
          const seconds = Math.max(.008, (current.time - lastGesture.time) / 1000);
          velocity.lerp(new THREE.Vector2(dx / seconds, dy / seconds), .35);
          boundTarget();
        }
        lastGesture = current;
        return;
      }
      if (event.pointerType !== 'mouse') return;
      const bounds = viewport.getBoundingClientRect();
      pointer.set((event.clientX - bounds.left) / width * 2 - 1, 1 - (event.clientY - bounds.top) / height * 2);
    };
    const leave = () => pointer.set(0, 0);
    const down = event => {
      if (event.button !== 0 || !loaded || failed) return;
      event.preventDefault();
      takeControl();
      touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const points = [...touches.values()];
      lastGesture = { x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
        y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
        distance: points.length > 1 ? Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y) : 0,
        time: performance.now() };
      host.setPointerCapture(event.pointerId);
      host.classList.add(styles.dragging);
      pointer.set(0, 0);
    };
    const up = event => {
      if (!touches.has(event.pointerId)) return;
      touches.delete(event.pointerId);
      if (event.type !== 'pointerup' || performance.now() - (lastGesture?.time ?? 0) > 100 || reducedRef.current) velocity.set(0, 0);
      const remaining = [...touches.values()][0];
      lastGesture = remaining ? { ...remaining, distance: 0, time: performance.now() } : null;
      if (!touches.size) host.classList.remove(styles.dragging);
      if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId);
    };
    const wheel = event => {
      if (!loaded || failed || event.target.closest('select, aside, header, footer')) return;
      event.preventDefault();
      event.stopPropagation();
      const pixels = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? height : 1);
      zoomAt(Math.exp(-THREE.MathUtils.clamp(pixels, -150, 150) * .0012), event.clientX, event.clientY);
    };
    const keydown = event => {
      const step = halfHeight(target.zoom) * .16;
      if (['+', '=', '-', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) {
        event.preventDefault(); takeControl();
        if (event.key === '+' || event.key === '=') zoomAt(1.25);
        if (event.key === '-') zoomAt(.8);
        if (event.key === 'ArrowLeft') target.x -= step;
        if (event.key === 'ArrowRight') target.x += step;
        if (event.key === 'ArrowUp') target.y += step;
        if (event.key === 'ArrowDown') target.y -= step;
        if (event.key === 'Home') navigationRef.current.reset();
        boundTarget();
      }
    };
    host.addEventListener('pointerdown', down);
    host.addEventListener('pointerup', up);
    host.addEventListener('pointercancel', up);
    host.addEventListener('lostpointercapture', up);
    host.addEventListener('keydown', keydown);
    viewport.addEventListener('wheel', wheel, { passive: false });
    viewport.addEventListener('pointermove', move);
    viewport.addEventListener('pointerleave', leave);
    const lost = event => { event.preventDefault(); fail(); };
    renderer.domElement.addEventListener('webglcontextlost', lost);
    let previous = 0, elapsed = 0;
    const projected = new THREE.Vector3();
    const animate = time => {
      if (!loaded || failed) return;
      const dt = Math.min((time - previous) / 1000 || .016, .05);
      previous = time;
      const enabled = motionRef.current;
      if (enabled) elapsed += dt;
      const blend = reducedRef.current ? 1 : 1 - Math.exp(-dt * (touches.size ? 18 : 8));
      smoothed.lerp(enabled ? pointer : new THREE.Vector2(), blend);
      const active = selectedRef.current;
      const destination = active === null ? [.64, .64] : locations[active].anchor;
      const progress = enabled ? scroll.progress : 0;
      const amount = active === null ? progress : 1;
      if (manual) {
        if (reducedRef.current) velocity.set(0, 0);
        if (!touches.size) {
          const friction = Math.exp(-dt * 6);
          target.x += velocity.x * (1 - friction) / 6;
          target.y += velocity.y * (1 - friction) / 6;
          velocity.multiplyScalar(friction);
          if (velocity.lengthSq() < .00001) velocity.set(0, 0);
        }
        boundTarget();
      } else {
        target.zoom = 1 + amount * .30;
        target.x = (destination[0] - .5) * ASPECT * 2 * amount * .33;
        target.y = (.5 - destination[1]) * 2 * amount * .33;
      }
      boundTarget();
      // Ease zoom and its focal-point movement together, independently of mouse tilt.
      const zoomBlend = reducedRef.current ? 1 : 1 - Math.exp(-dt * 3);
      const cameraBlend = Math.abs(target.zoom - state.zoom) > .0001 && touches.size !== 1 ? zoomBlend : blend;
      state.zoom = THREE.MathUtils.lerp(state.zoom, target.zoom, zoomBlend);
      state.x = THREE.MathUtils.lerp(state.x, target.x, cameraBlend);
      state.y = THREE.MathUtils.lerp(state.y, target.y, cameraBlend);
      // Clamp the rendered camera too: zooming out or resizing shrinks pan limits
      // before the slower position easing has finished catching up.
      const visibleHalfY = halfHeight(state.zoom);
      const limitX = Math.max(0, ASPECT - visibleHalfY * camera.aspect - .045);
      const limitY = Math.max(0, 1 - visibleHalfY - .045);
      state.x = THREE.MathUtils.clamp(state.x, -limitX, limitX);
      state.y = THREE.MathUtils.clamp(state.y, -limitY, limitY);
      if (zoomLabelRef.current) zoomLabelRef.current.textContent = `${Math.round(state.zoom * 100)}%`;
      if (focusBlurRef.current) {
        focusBlurRef.current.style.opacity = String(THREE.MathUtils.smoothstep(state.zoom, 1, 2.6));
      }
      const drift = enabled ? Math.sin(elapsed * .13) * .002 : 0;
      camera.position.set(state.x + smoothed.x * .040 + drift, state.y + smoothed.y * .030, baseDistance / state.zoom);
      camera.lookAt(state.x, state.y, 0);
      camera.updateMatrixWorld();
      uniforms.uTime.value = elapsed;
      uniforms.uMotion.value = enabled ? 1 : 0;
      uniforms.uRelief.value = enabled ? .008 + amount * .008 : 0;
      const planePixels = height / (Math.tan(THREE.MathUtils.degToRad(20)) * camera.position.z);
      // Fine roof outlines cannot tolerate a large per-pixel warp. Most of
      // the movement comes from the camera; UV relief is limited to 3px.
      uniforms.uPointer.value.set(smoothed.x * 3 / (planePixels * ASPECT), smoothed.y * 3 / planePixels);
      // The reflection follows more slowly than the camera (8/s vs 1.4/s).
      // Subtracting the view offset moves its axis against the camera motion.
      const glitterBlend = 1 - Math.exp(-dt * 1.4);
      const glitterAttenuation = 1 / Math.pow(Math.max(1, state.zoom), 1.5);
      uniforms.uSunPosition.value.x = THREE.MathUtils.lerp(uniforms.uSunPosition.value.x,
        .48 + smoothed.x * .018 - camera.position.x / (ASPECT * 2) * .12, glitterBlend);
      uniforms.uSunPosition.value.y = THREE.MathUtils.lerp(uniforms.uSunPosition.value.y,
        .52 - camera.position.y * .045, glitterBlend);
      uniforms.uGlitterLength.value = THREE.MathUtils.lerp(uniforms.uGlitterLength.value,
        1 + smoothed.y * .16, glitterBlend);
      uniforms.uGlitterStrength.value = THREE.MathUtils.lerp(uniforms.uGlitterStrength.value,
        (.32 + smoothed.y * .025) * glitterAttenuation, glitterBlend);
      clouds.forEach((cloud, index) => {
        const { mesh, y, direction, phase, duration, shadow } = cloud;
        mesh.visible = enabled;
        // Cross the complete map; wrap only after the cloud is offscreen.
        const pass = (elapsed / duration + phase) % 1;
        mesh.position.x = (pass * (ASPECT * 2 + 2) - ASPECT - 1) * direction;
        mesh.position.y = y + Math.sin(pass * Math.PI * 2) * .12;
        // Follow the slower clouds with a long, gentle lag. Reset offscreen on wrap.
        const shadowX = mesh.position.x + .10, shadowY = mesh.position.y - .08;
        if (cloud.previousPass === null || pass < cloud.previousPass) shadow.set(shadowX, shadowY);
        else if (enabled) {
          const follow = 1 - Math.exp(-dt * .22);
          shadow.x = THREE.MathUtils.lerp(shadow.x, shadowX, follow);
          shadow.y = THREE.MathUtils.lerp(shadow.y, shadowY, follow);
        }
        cloud.previousPass = pass;
        uniforms.uCloudShadows.value[index].set(shadow.x, shadow.y, 1.5 * 1.08, .8 * 1.08);
      });
      zoneSvgRef.current?.setAttribute('viewBox', `0 0 ${width} ${height}`);
      if (active !== null) {
        // Project image-space boundaries through the same relief and camera as the pins.
        const d = zones[active].map(polygon => polygon.map(([x, y], i) => {
          const depth = depthAt(x, y);
          projected.set((x - .5 - uniforms.uPointer.value.x * depth) * ASPECT * 2,
            (.5 - y - uniforms.uPointer.value.y * depth) * 2, depth * uniforms.uRelief.value).project(camera);
          return `${i ? 'L' : 'M'}${((projected.x + 1) * width / 2).toFixed(2)},${((1 - projected.y) * height / 2).toFixed(2)}`;
        }).join(' ') + 'Z').join(' ');
        zonePathRef.current?.setAttribute('d', d);
        zoneCutoutRef.current?.setAttribute('d', d);
      }
      locations.forEach((location, i) => {
        const marker = markerRefs.current[i];
        if (!marker) return;
        const [x, y] = location.anchor;
        const depth = depthAt(x, y);
        // Invert the shader's UV offset, then use the same camera projection.
        projected.set((x - .5 - uniforms.uPointer.value.x * depth) * ASPECT * 2,
          (.5 - y - uniforms.uPointer.value.y * depth) * 2, depth * uniforms.uRelief.value).project(camera);
        const px = (projected.x + 1) * width / 2, py = (1 - projected.y) * height / 2;
        marker.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, -50%)`;
        const visible = (active === null || active === i) && px > 20 && px < width - 20 && py > 90 && py < height - 90;
        marker.style.visibility = visible ? 'visible' : 'hidden';
        marker.tabIndex = visible ? 0 : -1;
      });
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${scroll.progress})`;
      renderer.render(scene, camera);
    };
    const visibility = () => {
      previous = 0;
      renderer.setAnimationLoop(document.hidden || failed ? null : animate);
    };
    document.addEventListener('visibilitychange', visibility);
    visibility();
    return () => {
      disposed = true;
      renderer.setAnimationLoop(null);
      tween.scrollTrigger?.kill(); tween.kill(); observer.disconnect();
      viewport.removeEventListener('pointermove', move);
      viewport.removeEventListener('pointerleave', leave);
      viewport.removeEventListener('wheel', wheel);
      host.removeEventListener('pointerdown', down);
      host.removeEventListener('pointerup', up);
      host.removeEventListener('pointercancel', up);
      host.removeEventListener('lostpointercapture', up);
      host.removeEventListener('keydown', keydown);
      navigationRef.current = null;
      document.removeEventListener('visibilitychange', visibility);
      renderer.domElement.removeEventListener('webglcontextlost', lost);
      textures.forEach(texture => texture.dispose());
      materials.forEach(material => material.dispose());
      geometries.forEach(geometry => geometry.dispose());
      renderer.dispose(); renderer.domElement.remove();
    };
  }, []);

  const reset = () => {
    setSelected(null);
    navigationRef.current?.reset();
    window.scrollTo({ top: sectionRef.current.offsetTop, behavior: reduced ? 'instant' : 'smooth' });
  };
  const location = selected === null ? null : locations[selected];
  const selectLocation = index => {
    setSelected(index);
    if (index !== null) navigationRef.current?.focus(index);
  };
  return <>
    <main id="main-content" className={`${styles.page} ${ivyMode.variable} ${gilroy.variable}`}>
      <section ref={sectionRef} className={styles.journey} aria-label="Interactive Sazan masterplan">
        <div ref={viewportRef} className={styles.viewport}>
          <img className={`${styles.fallback} ${ready ? styles.hidden : ''}`} src="/8K.png" alt="Sazan masterplan showing the coastline, lagoon, residences, hotels and marina" />
          <div ref={canvasHost} className={`${styles.canvas} ${ready ? '' : styles.hidden}`} data-lenis-prevent
            tabIndex={ready ? 0 : -1} role="region" aria-label="Map. Drag to pan, scroll or pinch to zoom. Arrow keys pan, plus and minus zoom, Home resets." />
          {ready && motion && !reduced && <div className={`masterplan-passing-bird ${styles.bird}`} aria-hidden="true">
            <svg viewBox="0 0 80 40" focusable="false">
              <path className="bird-wing bird-wing-left" d="M40 25C29 9 15 8 2 12C18 12 28 22 40 28Z" />
              <path className="bird-wing bird-wing-right" d="M40 25C51 9 65 8 78 12C62 12 52 22 40 28Z" />
              <path d="M38 23Q40 19 42 23L43 31L40 29L37 31Z" />
            </svg>
          </div>}
          <div ref={focusBlurRef} className={`${styles.focusBlur} ${ready ? '' : styles.hidden}`} aria-hidden="true" />
          <svg ref={zoneSvgRef} className={`${styles.zones} ${location ? styles.zoneVisible : ''}`} aria-hidden="true">
            <defs>
              <filter id={`${maskId}-soft`} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
                <feGaussianBlur stdDeviation="8" />
              </filter>
              <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
                <rect width="100%" height="100%" fill="white" />
                <path ref={zoneCutoutRef} fill="black" filter={`url(#${maskId}-soft)`} />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="#102329" fillOpacity=".6" mask={`url(#${maskId})`} />
            <path ref={zonePathRef} fill="white" fillOpacity=".2" filter={`url(#${maskId}-soft)`} />
          </svg>
          <div className={`${styles.markers} ${ready ? '' : styles.hidden}`} aria-label="Masterplan locations" inert={!ready}>
            {locations.map((item, index) => <button key={item.name} ref={el => { markerRefs.current[index] = el; }}
              type="button" className={`${styles.marker} ${selected === index ? styles.active : ''}`}
              aria-label={`Explore ${item.name}`} aria-expanded={selected === index} aria-controls="masterplan3-details"
              onClick={() => selectLocation(selected === index ? null : index)}><span aria-hidden="true">{selected === index ? '×' : '+'}</span><i>{item.name}</i></button>)}
          </div>
          {location && <button type="button" className={styles.close} aria-label="Close location details" onClick={() => {
              markerRefs.current[selected]?.focus({ preventScroll: true }); setSelected(null);
            }}>×</button>}
          {location && <aside id="masterplan3-details" className={`${styles.details} ${location.anchor[0] > .5 ? styles.detailsLeft : ''}`} aria-label={`${location.name} details`} aria-live="polite">
            <img src={location.image} alt={location.name} width="240" height="240" />
            <h2>{location.name}</h2>
            <dl>{location.stats.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
          </aside>}
          <footer className={styles.controls}>
            <div className={styles.buttons}>
              <button type="button" onClick={reset}>Full plan <span aria-hidden="true">↗</span></button>
              <div className={styles.zoomControls} role="group" aria-label="Map zoom">
                <button type="button" disabled={!ready} aria-label="Zoom out" onClick={() => navigationRef.current?.zoom(.8)}>−</button>
                <output ref={zoomLabelRef} aria-label="Map zoom level">100%</output>
                <button type="button" disabled={!ready} aria-label="Zoom in" onClick={() => navigationRef.current?.zoom(1.25)}>+</button>
              </div>
              <button type="button" aria-pressed={motion && !reduced} disabled={reduced || !ready} onClick={() => setMotion(!motion)}>{motion && !reduced ? 'Pause motion' : 'Motion off'}</button>
            </div>
            <label className={styles.select}><span className={styles.srOnly}>Explore a location</span><select value={selected ?? ''} onChange={event => selectLocation(event.target.value === '' ? null : Number(event.target.value))}>
              <option value="">Explore a location</option>{locations.map((item, index) => <option key={item.name} value={index}>{item.name}</option>)}
            </select></label>
            <p className={styles.hint}>{!ready ? 'Select a location to explore' : 'Drag to explore · Scroll or pinch to zoom'}</p>
          </footer>
          <div className={styles.progress} aria-hidden="true"><span ref={progressRef} /></div>
        </div>
      </section>
    </main>
  </>;
}
