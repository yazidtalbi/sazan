// A DOM image map keeps touch navigation available without WebGL support.
export function mountFlatMap({ host, viewport, image, markers, zones, locations,
  selected, navigation, zoomLabel, zoneSvg, zonePath, zoneCutout, onReady }) {
  const aspect = 8058 / 4248;
  const state = { zoom: 1, x: .5, y: .57 };
  const pointers = new Map();
  let width = 1, height = 1, baseWidth = 1, frame = 0, disposed = false;
  let previousSelection = null, detailRequested = false;
  const preload = new Image();
  const detail = new Image();
  preload.onload = () => { if (!disposed && !detail.naturalWidth) image.src = preload.src; };
  preload.src = '/masterplan/map-mobile.webp';
  detail.onload = () => { if (!disposed) image.src = detail.src; };
  const clamp = () => {
    const halfX = width / (baseWidth * state.zoom) / 2;
    const halfY = height / (baseWidth / aspect * state.zoom) / 2;
    state.x = Math.max(halfX, Math.min(1 - halfX, state.x));
    state.y = Math.max(halfY, Math.min(1 - halfY, state.y));
  };
  const render = () => {
    clamp();
    const mapWidth = baseWidth * state.zoom, mapHeight = mapWidth / aspect;
    const left = width / 2 - state.x * mapWidth, top = height / 2 - state.y * mapHeight;
    Object.assign(image.style, { width: `${mapWidth}px`, height: `${mapHeight}px`, left: `${left}px`, top: `${top}px` });
    const active = selected.current;
    markers.current.forEach((marker, i) => {
      if (!marker) return;
      const [x, y] = locations[i].anchor;
      const px = left + x * mapWidth, py = top + y * mapHeight;
      const visible = (active === null || active === i) && px > 20 && px < width - 20 && py > 24 && py < height - 24;
      marker.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, -50%)`;
      marker.style.visibility = visible ? 'visible' : 'hidden';
      marker.tabIndex = visible ? 0 : -1;
    });
    const d = active === null ? '' : zones[active].map(polygon => polygon.map(([x, y], i) =>
      `${i ? 'L' : 'M'}${left + x * mapWidth},${top + y * mapHeight}`).join(' ') + 'Z').join(' ');
    zoneSvg.current?.setAttribute('viewBox', `0 0 ${width} ${height}`);
    zonePath.current?.setAttribute('d', d);
    zoneCutout.current?.setAttribute('d', d);
    if (zoomLabel.current) zoomLabel.current.textContent = `${Math.round(state.zoom * 100)}%`;
    if (state.zoom > 1.4 && !detailRequested) {
      detailRequested = true;
      detail.src = '/masterplan/map-desktop.webp';
    }
  };
  const zoom = (factor, x = width / 2, y = height / 2) => {
    const before = baseWidth * state.zoom;
    state.zoom = Math.max(1, Math.min(5, state.zoom * factor));
    const after = baseWidth * state.zoom;
    state.x += (x - width / 2) * (1 / before - 1 / after);
    state.y += (y - height / 2) * aspect * (1 / before - 1 / after);
    render();
  };
  navigation.current = {
    zoom,
    reset: () => { Object.assign(state, { zoom: 1, x: .5, y: .57 }); render(); },
    focus: index => {
      const [x, y] = locations[index].anchor;
      Object.assign(state, { zoom: Math.max(1.6, state.zoom), x, y }); render();
    },
  };
  const resize = () => {
    width = viewport.clientWidth; height = viewport.clientHeight;
    baseWidth = Math.max(width, height * aspect) / .704;
    render();
  };
  const gesture = () => {
    const points = [...pointers.values()];
    return { x: points.reduce((s, p) => s + p.x, 0) / points.length,
      y: points.reduce((s, p) => s + p.y, 0) / points.length,
      distance: points.length > 1 ? Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y) : 0 };
  };
  const down = event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.preventDefault();
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    host.setPointerCapture(event.pointerId);
  };
  const move = event => {
    if (!pointers.has(event.pointerId)) return;
    event.preventDefault();
    const before = gesture();
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const after = gesture(), rect = viewport.getBoundingClientRect();
    if (before.distance && after.distance) zoom(after.distance / before.distance, after.x - rect.left, after.y - rect.top);
    state.x -= (after.x - before.x) / (baseWidth * state.zoom);
    state.y -= (after.y - before.y) / (baseWidth / aspect * state.zoom);
    render();
  };
  const up = event => {
    pointers.delete(event.pointerId);
    if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId);
  };
  const wheel = event => {
    event.preventDefault();
    const rect = viewport.getBoundingClientRect();
    zoom(Math.exp(-event.deltaY * .001), event.clientX - rect.left, event.clientY - rect.top);
  };
  const keydown = event => {
    if (!['+', '=', '-', 'Home', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === '+' || event.key === '=') zoom(1.25);
    if (event.key === '-') zoom(.8);
    if (event.key === 'Home') navigation.current.reset();
    if (event.key === 'ArrowLeft') state.x -= .04 / state.zoom;
    if (event.key === 'ArrowRight') state.x += .04 / state.zoom;
    if (event.key === 'ArrowUp') state.y -= .04 / state.zoom;
    if (event.key === 'ArrowDown') state.y += .04 / state.zoom;
    render();
  };
  const events = { pointerdown: down, pointermove: move, pointerup: up,
    pointercancel: up, lostpointercapture: up, wheel, keydown };
  Object.entries(events).forEach(([name, handler]) => host.addEventListener(name, handler, { passive: false }));
  const observer = new ResizeObserver(resize);
  observer.observe(viewport);
  resize();
  onReady();
  // React owns selection; only redraw the map when it changes.
  const watchSelection = () => {
    if (previousSelection !== selected.current) { previousSelection = selected.current; render(); }
    frame = requestAnimationFrame(watchSelection);
  };
  frame = requestAnimationFrame(watchSelection);
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    preload.onload = null; detail.onload = null;
    Object.entries(events).forEach(([name, handler]) => host.removeEventListener(name, handler));
    navigation.current = null;
  };
}
