// D2 — building a frozen target for the QUARTER REVERSE motif, which has
// never had one. Method: §21.1's gradient-ENERGY flood (the quarter is a lit,
// struck coin, so no level threshold and no darkness flood can enclose the
// device), §21.3's GUARD where the device's gradient skirt merges with the
// legend's, §21.2's crest refinement, and §2.2's plateau test applied to what
// is actually frozen.
//
// This script only MEASURES and reports stability. It writes nothing.
// _jq2freeze.mjs does the freezing, and refuses to overwrite.
import { energy, segment } from '../_qtedge.mjs';
import { trace } from '../_nktrace.mjs';
import sharp from 'sharp';

export const FILE = 'quarter-rev-2.png';
export const DISC = { cx: 374.50, cy: 374.37, R: 374.98 };   // _rvnorm.DISCS, p95 residual 0.15% of R

// The guard, in units of R. Read off the labelled grid in judge/_jq-rev-ref.png:
//   wing tip        X 12.5 / 87.5  ->  r = 37.5 viewBox = 0.80 R
//   UNITED / AMERICA letters at the same angle, X 8..20 -> r = 0.85..0.90 R
//   lower legend QUARTER DOLLAR    ->  reaches in to r = 0.79 R
//   wreath, the lowest thing in the device, meets at (50, 79.5) -> r = 0.63 R
// so: a main guard between 0.80 and 0.85 R, and a tighter one in the bottom
// sector where the legend comes further in and the device does not.
export const GUARD = { main: 0.835, bottom: 0.70, bottomFrom: 40, bottomTo: 140 };

export function guarded(G, W, H, disc, g = GUARD) {
  const out = Float32Array.from(G);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = x - disc.cx, dy = y - disc.cy;
    const r = Math.hypot(dx, dy) / disc.R;
    const th = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
    const inBottom = th >= g.bottomFrom && th <= g.bottomTo;
    if (r > g.main || (inBottom && r > g.bottom)) out[y * W + x] = 0;   // force "field": floodable
  }
  return out;
}

// every not-reached component, largest first
export function components(mask, W, H) {
  const lab = new Int32Array(W * H).fill(-1);
  const comps = [];
  const st = new Int32Array(W * H);
  for (let p = 0; p < W * H; p++) {
    if (!mask[p] || lab[p] >= 0) continue;
    const id = comps.length; let sp = 0, area = 0;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    st[sp++] = p; lab[p] = id;
    while (sp > 0) {
      const q = st[--sp], x = q % W, y = (q - x) / W;
      area++;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      for (const nq of [q - 1, q + 1, q - W, q + W]) {
        if (nq < 0 || nq >= W * H) continue;
        if (mask[nq] && lab[nq] < 0) { lab[nq] = id; st[sp++] = nq; }
      }
    }
    comps.push({ id, area, bbox: [x0, y0, x1, y1] });
  }
  comps.sort((a, b) => b.area - a.area);
  return { lab, comps };
}

export function notReached(G, W, H, disc, T, rFrac = 0.93) {
  // segment() returns the largest filled component; here we want all of them,
  // so the flood is repeated locally.
  const seen = new Uint8Array(W * H); const st = new Int32Array(W * H); let sp = 0;
  const inD = (x, y) => Math.hypot(x - disc.cx, y - disc.cy) <= rFrac * disc.R;
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const p = y * W + x;
    if (seen[p] || !inD(x, y) || G[p] > T) return;
    seen[p] = 1; st[sp++] = p;
  };
  for (let a = 0; a < 7200; a++) {
    const t = (a * Math.PI) / 3600;
    push(Math.round(disc.cx + rFrac * disc.R * 0.995 * Math.cos(t)), Math.round(disc.cy + rFrac * disc.R * 0.995 * Math.sin(t)));
  }
  while (sp > 0) {
    const p = st[--sp], x = p % W, y = (p - x) / W;
    push(x - 1, y); push(x + 1, y); push(x, y - 1); push(x, y + 1);
  }
  const m = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = y * W + x;
    if (!seen[p] && inD(x, y)) m[p] = 1;
  }
  return m;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { G, W, H, grey } = await energy(FILE, DISC);
  const gs = [];
  for (const gm of [0.815, 0.835, 0.855]) {
    for (const T of [2.5, 3.0, 3.5, 4.0, 4.5, 5.0]) {
      const Gg = guarded(G, W, H, DISC, { ...GUARD, main: gm });
      const m = notReached(Gg, W, H, DISC, T);
      const { comps } = components(m, W, H);
      const big = comps.filter((c) => c.area > 0.0005 * Math.PI * DISC.R * DISC.R);
      const c0 = comps[0];
      const eqR = Math.sqrt(c0.area / Math.PI) / DISC.R;
      gs.push({ gm, T, area: c0.area, eqR, n: big.length });
      console.log(`guard ${gm}  T ${T.toFixed(1)}  largest comp area ${c0.area}  eqR/R ${eqR.toFixed(4)}  bbox ${c0.bbox.map((v) => ((v - (v > W / 2 ? 0 : 0)) | 0)).join(',')}  components>0.05% ${big.length}`);
    }
  }
  const base = gs.filter((x) => x.gm === 0.835);
  const lo = Math.min(...base.map((x) => x.eqR)), hi = Math.max(...base.map((x) => x.eqR));
  console.log(`\nT-stability at guard 0.835: eqR/R ${lo.toFixed(4)}..${hi.toFixed(4)} = ${(100 * (hi - lo) / ((hi + lo) / 2)).toFixed(2)}% drift over T 2.5..5.0`);
  const atT = gs.filter((x) => x.T === 3.5);
  console.log(`guard sensitivity at T 3.5: ${atT.map((x) => `${x.gm}->${x.eqR.toFixed(4)}`).join('  ')}`);
}
