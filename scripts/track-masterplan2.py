"""Regenerate island2.mp4 marker tracks using OpenCV + NumPy.

Run from the repository root: python scripts/track-masterplan2.py
Install opencv-python-headless in a temporary venv first (not a runtime dependency).
Reference pin centres have a +5px Y offset for the centered 800px crop of 810px video.
Tracks follow local image features; numbered review frames are written to a temp folder.
"""
from pathlib import Path
import tempfile
review_dir = Path(tempfile.mkdtemp(prefix="sazan-tracking-"))
import cv2, numpy as np, json
cap=cv2.VideoCapture('public/island2.mp4')
fps=cap.get(cv2.CAP_PROP_FPS)
ok, frame=cap.read()
frame=cv2.resize(frame,(1440,810)); prev=cv2.cvtColor(frame,cv2.COLOR_BGR2GRAY)
# Reference is a 1440x800 center crop of the video's 1440x810 opening frame.
anchors=np.float32([[327,463],[476,362],[613,405],[476,520],[923,428],[839,478],[959,520],[1135,405],[1298,338],[1246,498]])
tracks=[]
for anchor in anchors:
 mask=np.zeros_like(prev); cv2.circle(mask,tuple(anchor.astype(int)),65,255,-1)
 pts=cv2.goodFeaturesToTrack(prev,100,.015,5,mask=mask)
 tracks.append(pts)
rows=[np.round(anchors/[14.4,8.1],4).tolist()]
quality=[]
idx=0
while True:
 ok, frame=cap.read()
 if not ok: break
 idx+=1
 frame=cv2.resize(frame,(1440,810)); gray=cv2.cvtColor(frame,cv2.COLOR_BGR2GRAY)
 counts=[]
 for j,pts in enumerate(tracks):
  nxt,st,err=cv2.calcOpticalFlowPyrLK(prev,gray,pts,None,winSize=(25,25),maxLevel=3)
  back,bst,_=cv2.calcOpticalFlowPyrLK(gray,prev,nxt,None,winSize=(25,25),maxLevel=3)
  good=(st[:,0]==1)&(bst[:,0]==1)&(np.linalg.norm(pts-back,axis=2)[:,0]<1.0)
  a,b=pts[good],nxt[good]
  if len(a)<5: raise RuntimeError(f'Lost track {j} at {idx}: {len(a)}')
  mat,inliers=cv2.estimateAffinePartial2D(a,b,method=cv2.RANSAC,ransacReprojThreshold=1.5)
  anchors[j]=mat[:,:2]@anchors[j]+mat[:,2]
  counts.append(int(inliers.sum()))
  tracks[j]=b[inliers[:,0]==1].reshape(-1,1,2)
  # Refresh local features to avoid losing a marker as its original features leave view.
  if idx%12==0:
   mask=np.zeros_like(gray); cv2.circle(mask,tuple(anchors[j].astype(int)),65,255,-1)
   fresh=cv2.goodFeaturesToTrack(gray,100,.015,5,mask=mask)
   if fresh is not None and len(fresh)>10: tracks[j]=fresh
 rows.append(np.round(anchors/[14.4,8.1],4).tolist()); quality.append(counts)
 if idx in [48,96,144,191]:
  for j,p in enumerate(anchors):
   cv2.circle(frame,tuple(p.astype(int)),15,(255,255,255),-1)
   cv2.putText(frame,str(j+1),tuple((p+[-8,5]).astype(int)),cv2.FONT_HERSHEY_SIMPLEX,.45,(30,40,40),1,cv2.LINE_AA)
  cv2.imwrite(str(review_dir / f'tracked-{idx}.jpg'),frame)
 prev=gray
with open('lib/masterplan2-tracking.json','w') as f: json.dump({'fps':fps,'frames':rows},f,separators=(',',':'))
print('Frames:',len(rows),'Minimum inliers:',np.min(quality,axis=0).tolist())
print('Final:',rows[-1])

print("Review frames:", review_dir)
