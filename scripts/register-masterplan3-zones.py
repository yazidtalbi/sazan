"""Register the supplied MAP HOVER (20).png to the static masterplan.
Usage: python scripts/register-masterplan3-zones.py '/path/to/MAP HOVER (20).png'
Requires opencv-python-headless and NumPy. Writes normalized zone polygons;
prints pin anchors for lib/masterplan3-locations.js. Source images are unchanged.
"""
import json
import sys
from pathlib import Path

import cv2
import numpy as np

root = Path(__file__).resolve().parents[1]
reference = cv2.imread(sys.argv[1])
image = cv2.imread(str(root / 'public/final-masterplan.png'))
image = cv2.resize(image, (2015, 1062))
sift = cv2.SIFT_create(nfeatures=12000)
a, descriptors_a = sift.detectAndCompute(reference, None)
b, descriptors_b = sift.detectAndCompute(image, None)
matches = cv2.BFMatcher().knnMatch(descriptors_a, descriptors_b, k=2)
good = [m for m, n in matches if m.distance < .7 * n.distance]
matrix, inliers = cv2.findHomography(
    np.float32([a[m.queryIdx].pt for m in good]),
    np.float32([b[m.trainIdx].pt for m in good]), cv2.RANSAC, 3,
)
if matrix is None or int(inliers.sum()) < 40:
    raise RuntimeError('Insufficient image matches to register zones reliably')


def transform(points):
    projected = cv2.perspectiveTransform(np.float32(points).reshape(-1, 1, 2), matrix)[:, 0]
    return (projected / [2015, 1062]).round(6).tolist()


zones = json.loads((root / 'lib/masterplan2-zones-source.json').read_text())
(root / 'lib/masterplan3-zones.json').write_text(json.dumps(
    [[transform(polygon) for polygon in zone] for zone in zones], separators=(',', ':'),
) + '\n')
print(f'Registered with {int(inliers.sum())} inlier matches')
print('Anchors:', transform([
    [327, 458], [476, 357], [613, 400], [476, 515], [923, 423],
    [839, 473], [959, 515], [1135, 400], [1298, 333], [1246, 493],
]))
