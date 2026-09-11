// Fit the sea plane to the same ten landmarks used by the location zones.
// Run with: node scripts/track-masterplan2-sea.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const tracking = JSON.parse(readFileSync(new URL('../lib/masterplan2-tracking.json', import.meta.url)));
const source = tracking.frames[0];
const frames = tracking.frames.map((points) => {
  const rows = [];
  const targets = [];
  source.forEach(([sx, sy], index) => {
    const x = sx / 100, y = sy / 100;
    const u = points[index][0] / 100, v = points[index][1] / 100;
    rows.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    targets.push(u);
    rows.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    targets.push(v);
  });
  const matrix = Array.from({ length: 8 }, (_, i) => [
    ...Array.from({ length: 8 }, (_, j) => rows.reduce((sum, row) => sum + row[i] * row[j], 0)),
    rows.reduce((sum, row, k) => sum + row[i] * targets[k], 0),
  ]);
  for (let col = 0; col < 8; col++) {
    let pivot = col;
    for (let row = col + 1; row < 8; row++) {
      if (Math.abs(matrix[row][col]) > Math.abs(matrix[pivot][col])) pivot = row;
    }
    [matrix[col], matrix[pivot]] = [matrix[pivot], matrix[col]];
    const divisor = matrix[col][col];
    if (Math.abs(divisor) < 1e-12) throw new Error('Degenerate landmark fit');
    for (let j = col; j <= 8; j++) matrix[col][j] /= divisor;
    for (let row = 0; row < 8; row++) {
      if (row === col) continue;
      const factor = matrix[row][col];
      for (let j = col; j <= 8; j++) matrix[row][j] -= factor * matrix[col][j];
    }
  }
  return [...matrix.map((row) => Number(row[8].toFixed(9))), 1];
});
writeFileSync(new URL('../lib/masterplan2-sea-tracking.json', import.meta.url), JSON.stringify({ fps: tracking.fps, frames }));
