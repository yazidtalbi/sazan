// Derive an independent water-only mask from the exact source pixels.
// Keep connected sea, lagoon and canal regions; reject isolated blue roofs/pools.
import sharp from 'sharp';

const { data, info } = await sharp('public/final-masterplan.png').removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;
const candidate = new Uint8Array(width * height);
for (let i = 0; i < candidate.length; i++) {
  const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
  candidate[i] = b - r > 14 && g - r > 20 && b > r * 1.12 && g > r * 1.15 ? 1 : 0;
}
const queue = new Int32Array(candidate.length);
const mask = Buffer.alloc(candidate.length);
const regions = [];
for (let start = 0; start < candidate.length; start++) {
  if (!candidate[start]) continue;
  let head = 0, tail = 1;
  queue[0] = start; candidate[start] = 0;
  let minX = width, minY = height, maxX = 0, maxY = 0;
  while (head < tail) {
    const i = queue[head++], x = i % width, y = Math.floor(i / width);
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    const visit = n => { if (candidate[n]) { candidate[n] = 0; queue[tail++] = n; } };
    if (x) visit(i - 1);
    if (x < width - 1) visit(i + 1);
    if (y) visit(i - width);
    if (y < height - 1) visit(i + width);
  }
  // A real waterway occupies a substantial connected area in this 4K plan.
  if (tail < 20000) continue;
  regions.push({ pixels: tail, bounds: [minX, minY, maxX, maxY] });
  for (let j = 0; j < tail; j++) mask[queue[j]] = 255;
}
// Inset the mask two source pixels. Feather only within the original mask:
// no blur halo can spill across a bank, beach, boat, or roof boundary.
const inset = await sharp(mask, { raw: { width, height, channels: 1 } }).erode(2).greyscale().raw().toBuffer();
const soft = await sharp(inset, { raw: { width, height, channels: 1 } }).blur(.65).greyscale().raw().toBuffer();
for (let i = 0; i < soft.length; i++) soft[i] = Math.min(soft[i], inset[i]);
await sharp(soft, { raw: { width, height, channels: 1 } }).png().toFile('public/masterplan/island-water-mask.png');
console.log(JSON.stringify({ width, height, regions: regions.sort((a, b) => b.pixels - a.pixels) }));
