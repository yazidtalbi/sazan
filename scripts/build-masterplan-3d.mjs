// Reproducible, non-generative registration from the user's original image.
// Coordinates are normalized image pixels, origin at the top left.
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

const out = 'public/masterplan-3d';
await mkdir(out, { recursive: true });
const width = 4029, height = 2124;
const { data } = await sharp('public/8K.png').resize(width, height).removeAlpha().raw().toBuffer({ resolveWithObject: true });
await Promise.all([
  sharp('public/8K.png').resize(1600).webp({ quality: 88 }).toFile(`${out}/preview.webp`),
  sharp('public/8K.png').resize(4096).webp({ quality: 94 }).toFile(`${out}/map-4k.webp`),
  sharp('public/8K.png').webp({ quality: 96, effort: 5 }).toFile(`${out}/map-8k.webp`),
]);
const roofMask = new Uint8Array(width * height);
const vegetationMask = new Uint8Array(width * height);
for (let i = 0; i < roofMask.length; i++) {
  const [r,g,b] = data.subarray(i*3,i*3+3);
  const x = i % width / width, y = Math.floor(i / width) / height;
  // Terracotta roof pigment, restricted to developed estates (exclude fields).
  roofMask[i] = x < .91 && y > .39 && y < .84 && r > 133 && r > g * 1.23 && g > b * 1.12 && r - b > 50 ? 1 : 0;
  vegetationMask[i] = x < .95 && y > .35 && y < .87 && g > r * 1.04 && g > b * 1.3 && g > 46 && g < 145 ? 1 : 0;
}
const queue = new Int32Array(width * height), buildings = [];
for (let start = 0; start < roofMask.length; start++) {
  if (!roofMask[start]) continue;
  let head = 0, tail = 1;
  queue[0] = start; roofMask[start] = 0;
  while (head < tail) {
    const i = queue[head++], x = i % width, y = Math.floor(i / width);
    for (const n of [x ? i-1 : -1, x < width-1 ? i+1 : -1, y ? i-width : -1, y < height-1 ? i+width : -1]) {
      if (n >= 0 && roofMask[n]) { roofMask[n] = 0; queue[tail++] = n; }
    }
  }
  if (tail < 25 || tail > 2100) continue;
  let cx = 0, cy = 0;
  for (let j=0;j<tail;j++) { cx += queue[j]%width; cy += Math.floor(queue[j]/width); }
  cx /= tail; cy /= tail;
  let xx=0, yy=0, xy=0;
  for (let j=0;j<tail;j++) { const x=queue[j]%width-cx,y=Math.floor(queue[j]/width)-cy; xx+=x*x; yy+=y*y; xy+=x*y; }
  const angle=.5*Math.atan2(2*xy,xx-yy), c=Math.cos(angle),s=Math.sin(angle);
  let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
  for(let j=0;j<tail;j++) { const dx=queue[j]%width-cx,dy=Math.floor(queue[j]/width)-cy,x=dx*c+dy*s,y=-dx*s+dy*c; left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y); }
  const w=right-left,h=bottom-top;
  // Reject paths, thin pergola slats, scattered flowers, and ambiguous complexes.
  if(w<6 || h<4 || w>68 || h>45 || w/h>4.5 || tail/(w*h)<.5) continue;
  const dx=(left+right)/2,dy=(top+bottom)/2;
  buildings.push({ u:(cx+dx*c-dy*s)/width, v:(cy+dx*s+dy*c)/height, w:w/width*.88, d:h/height*.88, angle, type:buildings.length%5 });
}
// Conservative vegetation sampling: every crown fits inside a green pixel patch.
const trees=[];
let seed=3107;
const random=()=>{ seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296; };
for(let y=760;y<1800;y+=10) for(let x=20;x<3800;x+=10) {
  const px=x+Math.floor(random()*7),py=y+Math.floor(random()*7),r=3;
  if(![[-r,-r],[r,-r],[-r,r],[r,r],[0,0]].every(([dx,dy])=>vegetationMask[(py+dy)*width+px+dx])) continue;
  if(buildings.some(b=>Math.abs(b.u-px/width)<b.w*.75+.001 && Math.abs(b.v-py/height)<b.d*.75+.002))continue;
  trees.push([px/width,py/height,.7+random()*.55,random()*Math.PI*2,trees.length%4]);
}
const mask = await sharp('public/masterplan/island-water-mask.png').resize(512,270).greyscale().raw().toBuffer();
// Water mask is registered to the identical uncropped source. Heights are visual
// relief, not survey data. Smooth distance from water retains channels and banks.
const gw=512,gh=270,dist=new Float32Array(gw*gh);
for(let i=0;i<dist.length;i++) dist[i]=mask[i]>90?0:20;
for(let y=1;y<gh;y++)for(let x=1;x<gw;x++){const i=y*gw+x;dist[i]=Math.min(dist[i],dist[i-1]+1,dist[i-gw]+1);}
for(let y=gh-2;y>=0;y--)for(let x=gw-2;x>=0;x--){const i=y*gw+x;dist[i]=Math.min(dist[i],dist[i+1]+1,dist[i+gw]+1);}
const elevations=Array.from(dist,d=>Math.round(Math.min(1,d/4)*(.16+Math.min(d,18)*.024)*1000));
const round=(value)=>JSON.parse(JSON.stringify(value,(_,v)=>typeof v==='number'?+v.toFixed(6):v));
await writeFile(`${out}/registration.json`,JSON.stringify(round({source:'8K.png',width:8058,height:4248,buildings,trees,terrain:{width:gw,height:gh,values:elevations}})));
const boxes=buildings.map(b=>`<rect x="${b.u*1600-b.w*800}" y="${b.v*1600*height/width-b.d*800*height/width}" width="${b.w*1600}" height="${b.d*1600*height/width}" fill="none" stroke="#00ffff" stroke-width=".7" transform="rotate(${b.angle*180/Math.PI},${b.u*1600},${b.v*1600*height/width})"/>`).join('');
await sharp(`${out}/preview.webp`).composite([{input:Buffer.from(`<svg width="1600" height="${Math.round(1600*height/width)}">${boxes}</svg>`)}]).png().toFile(`${out}/registration-review.png`);
console.log({buildings:buildings.length,trees:trees.length});
