# Image-based masterplan

`/masterplan3` uses the user-supplied `public/8K.png` (8058 × 4248)
directly. It does not play or load a video. Existing masterplan routes are preserved.

`node scripts/build-masterplan-depth.mjs` builds `public/masterplan/island-depth.png`
and a small CPU sampling grid for the projected location pins. The script uses
the installed Sharp image processor to classify pixel colors: water is black,
sand/flat surfaces dark gray, vegetation mid gray, warm roofs light gray, and
the central hotel footprint receives the brightest values. This is approximate
artistic relief, not measured building heights. Beige roofs, shadows, and shallow
water can be misclassified. The deliberately small displacement limits artifacts.
For finer control, replace the depth PNG with a manually painted, registered map
and regenerate the matching CPU grid (the last two lines of the script).

The source image is untouched. Three.js renders a subdivided plane with slight
vertex relief, depth-dependent UV displacement, and a perspective camera. DOM
pins use that same camera and an inverse UV offset. Anchors in
`lib/masterplan3-locations.js` are specific to this image; video tracking is not used.
Location names, metrics, and reference thumbnails are reused from masterplan2.

GSAP ScrollTrigger initially drives a 1–1.3x approach toward the central district.
Dragging, zooming, or selecting a location takes manual control, so the scroll
animation cannot fight the user. Wheel/trackpad, pinch, and +/− buttons zoom from
100% to 500%; pointer-centered zoom preserves the location under the cursor until
a pan boundary is reached. Pointer capture supports mouse and touch dragging,
with frame-rate-independent damping and release inertia. Pan bounds keep the map covering the viewport, including during zoom easing and resize. Full plan resets zoom, pan, and inertia. Keyboard users can focus the
map and use arrows, +/−, and Home. Reduced motion keeps direct navigation but
removes interpolation and release inertia.

Zoom uses a slower 3/s exponential easing (about one second to settle 95%) for
wheel, pinch, buttons, and keyboard input. Wheel sensitivity is reduced, and all
manual zoom factors are softened to 75% in log space. Focal-point movement eases
with zoom; single-pointer dragging and mouse tilt retain their own response.

Selecting a location redirects the camera toward its anchor. Subtle mouse
UV parallax is limited to 3 screen pixels at maximum depth to preserve fine roof
outlines; the perspective camera supplies the broader movement.
Three independent transparent clouds cross the map, including one near the top. Their
shared alpha texture is projected by the map shader as offset, softly sampled
shadows restricted to registered island estates and clipped away from water.
Cloud passes take 174/228/200 seconds, with shadows following at 0.22/s for a gentle
lag. Both cloud paths cross the island; wrap resets happen offscreen. Pause and
reduced motion disable both layers. Warm depth/color-masked sun glitter and slow camera drift
provide ambient motion. The passing bird reuses masterplan2's SVG and flight/wing
animations. Circular location markers explicitly override the site's global
square-corner rule, as requested. The site template already supplies Lenis;
map gestures bypass it, while page controls and drawers retain normal scrolling.

The reflection has its own full-resolution `public/masterplan/island-water-mask.png`.
Rebuild it with `node scripts/build-masterplan-water-mask.mjs`. Connected water
regions retain the sea, lagoon, and canals; isolated blue roof/pool regions are
excluded. Two-pixel erosion and inward-only feathering keep banks and buildings
black. The mask is independent of the artistic depth map and is sampled as linear
data without mipmaps, at the exact same displaced UV as the original image.

`lib/masterplan3-glitter.js` adds only masked specular peaks to the base color.
Three independently moving noise fields form small irregular highlights within
a long, soft diagonal trail. There is no continuous glow beneath the highlights.
The central axis is denser/brighter and highlights are almost white with a warm
tint. Mouse X shifts the axis; mouse Y changes length and brightness. The glitter starts at a subtle 0.32 strength and fades with zoom to the power
of 1.5; scroll no longer boosts its brightness. Camera offsets move the trail in the opposite direction.
Reflection uniforms ease at 1.4/s, behind the camera's 8/s response. Pause and
reduced motion turn off the additive layer. A missing mask falls back to the
original static image rather than rendering unmasked glitter.

The image covers portrait screens; the location selector gives access to
all locations even when projected pins fall outside the viewport. Reduced motion
removes ambient and scroll motion. The motion control, Full plan reset, keyboard
selection, and Escape dismissal are available. Texture/WebGL failures or context
loss reveal the original static image; the selector and details remain usable.
Renderer, textures, geometry, listeners, and the scroll trigger are disposed on
unmount. Rendering suspends while the browser tab is hidden.

No villa close-up or geographic morph is invented. Manual zoom enlarges the same
source pixels; sharper deep views still require exact higher-resolution renders.

Location selection uses the same soft dark overlay and bright zone treatment as
masterplan2. `lib/masterplan3-zones.json` registers the reference outlines to the
static image using 167 SIFT/RANSAC inlier matches. Rebuild with
`python scripts/register-masterplan3-zones.py '/path/to/MAP HOVER (20).png'`
(OpenCV and NumPy required). The script also prints the reference pin anchors.
An SVG mask projects every zone vertex with the same camera, depth, and UV offset
as the pins on each animation frame, so pan/zoom and ambient movement stay aligned.
The overlay covers the ambient clouds too; controls and the active pin remain above
it. Nonselected pins hide while details are open. The card sits opposite the zone
on desktop and uses the existing mobile layout. When WebGL is unavailable, the
mask follows the fallback image's centered cover sizing through viewport resizes.

The page has no navbar or introductory headline. The camera uses cover sizing with
5% overscan, a 100% minimum zoom, and an inset pan boundary reserved for tilt.
Both target and rendered camera positions are clamped, preventing exposed edges
while zooming out, resizing, or easing after a drag. The static fallback also
uses cover sizing. Portrait viewports crop the map; pan or use the location selector
to explore offscreen zones.

The 8K map shares the original image crop and aspect ratio (exactly double its
width and height). Existing normalized pins, zones, depth, and water masks remain
aligned. Both the WebGL texture and static fallback use `/8K.png`.

A masked 8px backdrop blur softly defocuses the top and bottom when zoomed in.
Its opacity follows the rendered zoom from 100% to 260%, preserving the central
36% as a sharp focus band. Pins, details, and controls remain above the blur.
Full plan fades it away; the static fallback disables it.
