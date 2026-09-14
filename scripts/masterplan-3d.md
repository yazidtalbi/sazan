# `/masterplan-3d`

The route is a server-rendered page with a small interactive client shell. The
Three.js renderer loads through a dynamic import. No additional runtime package
was needed: this project already uses Three.js. The existing masterplan routes
are unchanged. There is no `/masterplan4` in this checkout; the new page reuses
the ten locations, names, metrics, images, normalized anchors and estate outlines
registered for `/masterplan3`.

## Source and registration

`public/8K.png` (8058 × 4248) is unchanged. The preview, 4K and 8K WebP textures
are derived directly from that image without cropping or changing geography.
The preview is 282 KB, the initial 4K texture 2.6 MB, and the deferred 8K texture
13 MB. The WebP encodings use qualities 88, 94 and 96 respectively. Original
PNG access is available from the static fallback. Every texture uses the same
UVs. There is no texture parallax, UV warp, generative replacement, or CSS 3D
transform of the image.

Coordinates use image UVs with a top-left origin:

```
x = (u - 0.5) * 200
z = (v - 0.5) * (200 * 4248 / 8058)
```

`build-masterplan-3d.mjs` deterministically identifies 515 terracotta roof
regions, conservatively fits oriented rectangles inside those regions, and
samples 1,111 green vegetation patches. The script rejects thin paths and
ambiguous large complexes. `registration-review.png` is the visual review
overlay. The registration is **pixel-derived artistic geometry, not surveyed
building footprints or construction documentation**. Heights and architectural
details are restrained interpretations: a raster image cannot establish actual
elevations, hidden facades, or rooftop furniture. In particular, the original
artwork contains pitched roof shading; the supplied art is retained even though
the new modular geometry uses flat slabs as requested. Unclassified buildings
remain visible in the source texture rather than receiving guessed geometry.

The land surface uses a smooth distance-from-water elevation grid. Its registered
water mask is the existing mask derived from `final-masterplan.png`, which has
the same crop at half the source resolution. No coastline is redrawn. Water,
ground, rooftops, pools and marina decks are real geometries. Coastline relief
is deliberately small; these are not bathymetric or topographic measurements.
The three hotel oval roof slabs reuse the measured registrations documented for
masterplan3. The marina piers, three boats and five foreground pools are fitted
to image inspection coordinates. Existing water colors retain the source's
shallow/deep gradients; masked procedural highlights provide restrained motion.

## Assets and performance

The original five-type villa kit is Meshopt-compressed (25 KB). Modern House by
henry ham (70 KB optimized) and Yacht by Alex Safayan (20 KB) were sourced from
Poly Pizza under CC BY 3.0. Download links, modifications and notices are in
`public/masterplan-3d/ATTRIBUTION.md` and the visible Credits panel. Source GLBs
are included for reproducible optimization. The source house's lawn is removed.

Buildings, foliage and palm fronds use `InstancedMesh`. Roof materials sample
the registered source texture. Near-view pergolas, glass, planted rooftop
elements, palms and pools are enabled only after 1.9× zoom. Imported houses
replace their selected modular instances; they are not stacked on top of them.
Static daylight shadows are rendered on demand rather than every frame. Mobile
uses fewer terrain segments, one-third vegetation density, reduced pixel ratio,
no structural shadow maps or cursor sway, lighter cloud shadows, and no automatic
8K download. Desktop high-resolution
loading starts above 2× only when hardware supports 8192 textures and Save-Data
is not enabled. Its failure retains the 4K texture. GPU memory for an 8K RGBA
texture is still substantial; this path is intentionally desktop-only.

## Camera, interaction and fallback

The perspective camera maintains a fixed bearing and zero roll. Overview pitch
is 58° downward, smoothly tilting to 34° at maximum 5.56× dolly zoom. FOV smoothly
narrows from 46° in overview to 32° close up, adding a lens change to the dolly.
The entire source
image fits in overview on desktop and portrait. Wheel and pinch update dolly
distance, preserve the pointer's ground-plane focal point on every frame even
as FOV changes, and ease independently of frame rate. Logarithmic distance uses
a critically damped response at 1.9/s: less than 2% travel in the first 100ms,
about 95% at 2.5 seconds, and a gentle tail to rest. Repeated wheel events retain
velocity instead of restarting the ease-in. Both directions, location focus and
reset share this heavy movement; dragging retains its faster response.
Drag, arrow keys, +/−, Home, location selection and Reset view all
use the same camera rig. Restrained mouse sway does not change orientation.

DOM markers and estate paths are projected with the same camera and terrain
height sampling. Offscreen pins leave the keyboard tab order; all ten places
remain available through the destination selector. Details are a nonmodal
panel with focus management and Escape dismissal. The view orientation is
labelled “fixed view”; no unsurveyed north direction is asserted.

The preview exists in server HTML before WebGL loading. Asset failures and
context loss reveal it and keep the location selector/details usable. Retry
destroys the old renderer before creating another one. Textures, image bitmaps,
GLB geometry/materials, instance buffers, listeners, resize observer, shadow
resources and the animation frame are released on route exit. Fetches abort.
Hidden tabs skip rendering; reduced motion removes sway, water motion and camera
interpolation while preserving direct navigation.

Three elevated cloud planes reuse `public/masterplan/cloud.webp` and drift on
235–310 second paths, fading before wrapping beyond the map. Mobile uses two.
Their alpha silhouettes are projected along the daylight direction onto terrain,
water in the base image, roofs, buildings and vegetation. Five texture samples
soften each shadow's edge. Cloud geometry and shadow uniforms share positions
and heights, so shadows stay attached to the clouds through zoom and tilt.
No per-frame shadow-map render is needed for this simulated cloud lighting.
Close zoom lowers cloud opacity to preserve detail. Pause freezes positions;
reduced motion keeps static clouds and shadows. Loading failure leaves the map
usable. Cloud geometry/materials and the shared texture are disposed on exit.

## Rebuild and verification

```
npm run assets:masterplan-3d
npm run test:masterplan-3d:camera
node --test tests/masterplan-3d-clouds.test.mjs
npm run build
# With the site running locally:
npm run test:masterplan-3d
```

Browser tests use `http://localhost:3000` by default. Set `MASTERPLAN_TEST_URL`
for another server and `PLAYWRIGHT_CHROMIUM_EXECUTABLE` for an installed Chromium.
Otherwise run `npx playwright install chromium` once. Tests cover all ten location
details, reset and keyboard controls, mobile pinch/reduced motion, source asset
failure/retry, and WebGL context loss/retry. Camera math separately checks
uncropped framing, focal-point stability, clamps and reset. Screenshots are
written to ignored `test-results/`. Headless software WebGL validates behavior;
it is not a representative hardware frame-rate benchmark.

The Primland reference was inspected in Chromium, including its map entry,
drag-to-move and scroll-to-zoom interaction. Its brand and content are not used.
