// TASK 2, step 1 — §13's INVENTORY OF THE INTERIOR, BOTH DIRECTIONS, BEFORE
// any patch is chosen. Round 1 left D3-reverse UNMEASURED with the note "no
// acquisition needed — the judge must freeze a reverse patch set and a
// normaliser." §13.1 is explicit that a brief cannot replace the sweep, so the
// sweep comes first and the patches are chosen from what it shows.
//
// Two sweeps, on BOTH independent references:
//   radial  — median grey on each circle r = 0.05 .. 0.90 R
//   angular — median grey on each ray, 0 .. 360 deg, inside 0.80R
// Reported as a ratio to the whole-interior median, so the two photographs are
// comparable despite different exposure (that division is the same move §12.2
// makes, one level up).
import sharp from 'sharp';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
export const REFS = [
  ['rev-3', 'quarter-rev-3.jpg', { cx: 999.50, cy: 999.45, R: 999.49 }],
  ['rev-2', 'quarter-rev-2.png', { cx: 374.50, cy: 374.37, R: 374.98 }],
];

export async function load(file) {
  const { data, info } = await sharp(P(file)).flatten({ background: '#808080' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, h: info.height };
}
export function at(g, x, y) {
  const { d, w, h } = g;
  if (x < 0 || y < 0 || x >= w - 1 || y >= h - 1) return 255;
  const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0;
  return d[y0 * w + x0] * (1 - fx) * (1 - fy) + d[y0 * w + x0 + 1] * fx * (1 - fy)
    + d[(y0 + 1) * w + x0] * (1 - fx) * fy + d[(y0 + 1) * w + x0 + 1] * fx * fy;
}
const med = (a) => { const s = [...a].sort((p, q) => p - q); return s[s.length >> 1]; };

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = {};
  for (const [tag, file, D] of REFS) {
    const g = await load(file);
    const inner = [];
    for (let j = -D.R * 0.8; j <= D.R * 0.8; j += D.R / 120)
      for (let i = -D.R * 0.8; i <= D.R * 0.8; i += D.R / 120)
        if (Math.hypot(i, j) <= 0.8 * D.R) inner.push(at(g, D.cx + i, D.cy + j));
    const M = med(inner);
    const rad = [], ang = [];
    for (let r = 0.05; r <= 0.901; r += 0.05) {
      const v = [];
      for (let k = 0; k < 720; k++) { const t = k * Math.PI / 360; v.push(at(g, D.cx + r * D.R * Math.cos(t), D.cy + r * D.R * Math.sin(t))); }
      rad.push([+r.toFixed(2), med(v) / M]);
    }
    for (let a = 0; a < 360; a += 15) {
      const v = [];
      for (let r = 0.10; r <= 0.80; r += 0.005) { const t = a * Math.PI / 180; v.push(at(g, D.cx + r * D.R * Math.cos(t), D.cy + r * D.R * Math.sin(t))); }
      ang.push([a, med(v) / M]);
    }
    out[tag] = { M, rad, ang };
    console.log(`${tag} (${file}) interior median grey ${M.toFixed(1)}`);
  }
  console.log('\n=== RADIAL sweep: median grey on the circle r, / interior median ===');
  console.log('  r/R  ' + out['rev-3'].rad.map((x) => x[0].toFixed(2).padStart(6)).join(''));
  for (const t of ['rev-3', 'rev-2']) console.log(t.padEnd(7) + out[t].rad.map((x) => x[1].toFixed(3).padStart(6)).join(''));
  const dr = out['rev-3'].rad.map((x, i) => Math.abs(x[1] - out['rev-2'].rad[i][1]));
  console.log(`|rev-3 - rev-2| mean ${(dr.reduce((a, b) => a + b) / dr.length).toFixed(4)}  max ${Math.max(...dr).toFixed(4)}`);

  console.log('\n=== ANGULAR sweep: median grey on the ray at angle a (r 0.10..0.80), / interior median ===');
  console.log('  deg  ' + out['rev-3'].ang.map((x) => String(x[0]).padStart(6)).join(''));
  for (const t of ['rev-3', 'rev-2']) console.log(t.padEnd(7) + out[t].ang.map((x) => x[1].toFixed(3).padStart(6)).join(''));
  const da = out['rev-3'].ang.map((x, i) => Math.abs(x[1] - out['rev-2'].ang[i][1]));
  console.log(`|rev-3 - rev-2| mean ${(da.reduce((a, b) => a + b) / da.length).toFixed(4)}  max ${Math.max(...da).toFixed(4)}`);
  console.log('\nTHE ANGULAR SPREAD IS THE ILLUMINATION SIGNATURE. A normaliser must be chosen');
  console.log('so that it does not sit where these two references disagree most.');
}
