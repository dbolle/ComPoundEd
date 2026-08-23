// DIME REVERSE — round 1. Raw gradient-peak dump along scanlines, so the
// window choices in `_dr5edge.mjs` are visible rather than assumed.
// Reports only. Run: node coloringbook/judge/_dr6peaks.mjs [y ...]
import { samplerFor } from './_dr2grid.mjs';
const STEP = 0.02;
function prof(at, y, x0, x1) {
  const n = Math.round((x1 - x0) / STEP) + 1, v = new Float64Array(n);
  for (let i = 0; i < n; i++) { const X = x0 + i * STEP; v[i] = (at(X, y - 0.1) + at(X, y) + at(X, y + 0.1)) / 3; }
  const k = 6, s = new Float64Array(n);
  for (let i = 0; i < n; i++) { let a = 0, c = 0; for (let j = -k; j <= k; j++) { const t = i + j; if (t >= 0 && t < n) { a += v[t]; c++; } } s[i] = a / c; }
  return s;
}
const peaks = (s, x0, minSep = 0.5) => {
  const g = [];
  for (let i = 1; i < s.length - 1; i++) g.push({ x: x0 + i * STEP, v: (s[i + 1] - s[i - 1]) / (2 * STEP) });
  const out = [];
  const sorted = [...g].sort((a, b) => Math.abs(b.v) - Math.abs(a.v));
  for (const p of sorted) { if (out.every((q) => Math.abs(q.x - p.x) > minSep)) out.push(p); if (out.length >= 8) break; }
  return out.sort((a, b) => a.x - b.x);
};
const FILES = process.env.FILES ? process.env.FILES.split(',') : ['dime-rev-2.jpg', 'dime-rev-proofbright.png', 'dime-rev-unc2005.png', 'ours'];
const ROWS = process.argv.slice(2).map(Number);
const X0 = Number(process.env.X0 ?? 40), X1 = Number(process.env.X1 ?? 60);
for (const f of FILES) {
  const s = await samplerFor(f);
  console.log('\n== ' + f);
  for (const y of ROWS) {
    const p = peaks(prof(s.at, y, X0, X1), X0);
    console.log(`  y=${String(y).padStart(4)} ` + p.map((q) => `${q.x.toFixed(2)}${q.v > 0 ? '+' : '-'}${Math.abs(q.v).toFixed(0)}`).join('  '));
  }
}
