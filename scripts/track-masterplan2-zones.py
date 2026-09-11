"""Project reference outlines through the ten verified video landmark tracks.
Run from the repo root with opencv-python-headless and NumPy installed.
A per-frame perspective fit keeps the boundaries coherent across water, clouds
and offscreen areas, where independently tracked edge features can drift.
"""
import cv2, numpy as np, json
from pathlib import Path
zones=json.loads(Path('lib/masterplan2-zones-source.json').read_text())
tracking=json.loads(Path('lib/masterplan2-tracking.json').read_text())
source=np.float32(tracking['frames'][0])*np.float32([14.4,8.1])
rows=[]
for idx in [*range(0,192,6),191]:
 target=np.float32(tracking['frames'][idx])*np.float32([14.4,8.1])
 matrix,_=cv2.findHomography(source,target,0)
 projected=[]
 for zone in zones:
  polygons=[]
  for polygon in zone:
   vertices=np.float32(polygon)+np.float32([0,5])
   result=cv2.perspectiveTransform(vertices.reshape(-1,1,2),matrix)[:,0]
   polygons.append(np.round(result,2).tolist())
  projected.append(polygons)
 rows.append({'time':idx/tracking['fps'],'zones':projected})
Path('lib/masterplan2-zones.json').write_text(json.dumps(rows,separators=(',',':')))
print(f'Projected ten zones across {len(rows)} keyframes')
