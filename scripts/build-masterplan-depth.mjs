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
// Fitted to the three oval Atlantis roofs in the 8K source. Coordinates below
// use a 1000px inspection crop of source rect (5900, 1700, 1300, 1300).
// Separate semantic profiles prevent pale roof panels/shadows becoming holes.
const atlantisRoofs = [
  { cx: 258, cy: 356, rx: 63, ry: 32, angle: .16, rim: 195, crown: 238 },
  { cx: 410, cy: 312, rx: 32, ry: 73, angle: -.12, rim: 210, crown: 255 },
  { cx: 494, cy: 405, rx: 43, ry: 24, angle: .06, rim: 185, crown: 228 },
];
const refined = await sharp(depth, { raw: { width, height, channels: 1 } })
  .blur(1.2).greyscale().raw().toBuffer();
for (const roof of atlantisRoofs) {
  const cos = Math.cos(roof.angle), sin = Math.sin(roof.angle);
  const reach = Math.max(roof.rx, roof.ry) + 2;
  const x0 = Math.max(0, Math.floor((5900 + (roof.cx - reach) * 1.3) / 8058 * width));
  const x1 = Math.min(width - 1, Math.ceil((5900 + (roof.cx + reach) * 1.3) / 8058 * width));
  const y0 = Math.max(0, Math.floor((1700 + (roof.cy - reach) * 1.3) / 4248 * height));
  const y1 = Math.min(height - 1, Math.ceil((1700 + (roof.cy + reach) * 1.3) / 4248 * height));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const dx = ((x + .5) / width * 8058 - 5900) / 1.3 - roof.cx;
    const dy = ((y + .5) / height * 4248 - 1700) / 1.3 - roof.cy;
    const radius = Math.hypot((dx * cos + dy * sin) / roof.rx,
      (-dx * sin + dy * cos) / roof.ry);
    if (radius >= 1) continue;
    // A raised rim and gently rounded crown, with feathering inside the roof
    // only: surrounding pools and paths retain their existing depth.
    const edge = Math.min(1, (1 - radius) / .12);
    const blend = edge * edge * (3 - 2 * edge);
    const value = roof.rim + (roof.crown - roof.rim) * (1 - radius * radius);
    const i = y * width + x;
    refined[i] = Math.round(refined[i] * (1 - blend) + value * blend);
  }
}
await sharp(refined, { raw: { width, height, channels: 1 } }).png().toFile('public/masterplan/island-depth.png');
// Small matching depth grid lets DOM markers share the WebGL projection.
const grid = await sharp('public/masterplan/island-depth.png').resize(240, 135).greyscale().raw().toBuffer();
await writeFile('lib/masterplan3-depth.json', JSON.stringify({ width: 240, height: 135, values: [...grid] }));
