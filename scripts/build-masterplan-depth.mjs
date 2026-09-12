// Deterministic relief data, never generated replacement geography.
// Rebuild with: node scripts/build-masterplan-depth.mjs
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const width = 1920, height = Math.round(width * 2124 / 4029);
const { data } = await sharp('public/final-masterplan.png').resize(width, height).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const depth = Buffer.alloc(width * height);
for (let i = 0; i < depth.length; i++) {
  const [r, g, b] = data.subarray(i * 3, i * 3 + 3);
  const water = b > r * 1.12 && g > r * 1.08;
  if (water) continue;
  const roof = r > g * 1.08 && r > b * 1.2;
  const vegetation = g > r * 1.03 && g > b * 1.12;
  const x = (i % width) / width, y = Math.floor(i / width) / height;
  // Only the large hotel footprints receive the highest relief. This is an
  // artistic approximation, not surveyed building heights or semantic AI.
  const hotel = ((x - .798) / .023) ** 2 + ((y - .557) / .057) ** 2 < 1;
  const tall = hotel && Math.min(r, g, b) > 100 && Math.max(r, g, b) - Math.min(r, g, b) < 45;
  const sand = r > 170 && g > 155 && b > 125;
  depth[i] = tall ? 255 : sand ? 55 : roof ? 205 : vegetation ? 120 : 55;
}
await sharp(depth, { raw: { width, height, channels: 1 } }).blur(1.2).png().toFile('public/masterplan/island-depth.png');
// Small matching depth grid lets DOM markers share the WebGL projection.
const grid = await sharp('public/masterplan/island-depth.png').resize(240, 135).greyscale().raw().toBuffer();
await writeFile('lib/masterplan3-depth.json', JSON.stringify({ width: 240, height: 135, values: [...grid] }));
