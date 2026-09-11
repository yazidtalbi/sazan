The `/masterplan2` pins follow the ten markers in the supplied reference.
Names and metrics in `lib/masterplan2-locations.js` are transcribed from the
ten MAP HOVER images supplied by the user. Units are retained verbatim.

The reference matches the opening of `public/island2.mp4`: a 1440 × 800 centre crop
of a 1440 × 810 frame. Reference pin centres, in location-data order:

```
(327,458) (476,357) (613,400) (476,515) (923,423)
(839,473) (959,515) (1135,400) (1298,333) (1246,493)
```

`track-masterplan2.py` adds the 5px crop offset and tracks local features with
forward/backward optical flow and RANSAC affine fitting through all 192 frames
at 24fps. Run it from the repository root in a Python environment containing
`opencv-python-headless` and NumPy. It writes `lib/masterplan2-tracking.json` and
numbered review frames to a temporary directory. Review those frames visually
if the video or reference changes; tracking is an image-space visual match,
not a geographic survey.

The browser interpolates those percentage coordinates on video frame callbacks
(animation frame fallback), including seeks and the held final frame. Video and
markers share their transformed canvas, so panning and zooming keep them aligned.
South Beach uses a separate display track positioned farther up and right within
its estate, keeping the pin visible at the end of the film. Regenerate it with
`python scripts/place-south-beach-pin.py`; the original calibration stays intact.
Full plan returns to the opening frame with all ten pins visible. This route
does not load the old five-pin localStorage placements.

Location preview JPEGs are the 240 × 240 images extracted from the supplied drawer
references, in pin order. No generated replacement imagery is used.

`masterplan2-zones-source.json` contains traced boundaries in reference pixels.
Multiple polygons preserve separated parcels (Forest & Lagoon, Lake, Townhouse).
Edges obscured by the reference cards are continued along visible site boundaries.
Run `python scripts/track-masterplan2-zones.py` after updating marker tracks to
project the boundaries through 33 video keyframes using perspective fits to the
ten tracked landmarks. The browser interpolates vertices between keyframes.

Hover and keyboard focus preview the zone and card; click/tap pins the selection.
The video pauses during inspection and resumes only if it was playing beforehand.
Full plan / Replay film clear the active card. Other masterplan routes continue
using the existing shared location component.
