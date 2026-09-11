"""Place South Beach's display pin farther up the estate, inside the final view.
Keeps the original landmark tracks intact because they calibrate zone boundaries.
Run from the repo root with OpenCV and NumPy installed.
"""
import json
from pathlib import Path
import cv2
import numpy as np

tracking = json.loads(Path('lib/masterplan2-tracking.json').read_text())
scale = np.float32([14.4, 8.1])
source = np.float32(tracking['frames'][0]) * scale
# Opening-frame pixels (equivalent to 410,405 in the supplied cropped reference).
anchor = np.float32([[[410, 410]]])
positions = []
for frame in tracking['frames']:
    transform, _ = cv2.findHomography(source, np.float32(frame) * scale, 0)
    point = cv2.perspectiveTransform(anchor, transform)[0, 0] / scale
    positions.append([round(float(value), 4) for value in point])
Path('lib/masterplan2-south-beach-track.json').write_text(json.dumps(positions, separators=(',', ':')) + '\n')
