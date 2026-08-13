// ROUND 2, TASK 1b — CAN D2 (quarter REVERSE motif silhouette) BE BUILT NOW?
//
// Round 0 tried this on quarter-rev-2.png with the plain energy flood and got
// contours that agreed WITH EACH OTHER at IoU 0.4705..0.6869 over T 2.5..3.5.
// A target that disagrees with itself by 0.3 IoU cannot measure art to 0.05, so
// D2 was BLOCKED on "a square-on, evenly-lit reverse photograph with the device
// separable from the field".
//
// quarter-rev-3.jpg is that acquisition, and it is a real one: 2000x2000, disc
// fit p95 residual 0.05% of R (the best in the whole ref/ directory), and
// independent of quarter-rev-2.png at registered design-NCC 0.509 against a
// 0.198 control floor (_jq20indep.mjs).
//
// This script does NOT freeze anything. It measures self-agreement and reports
// it. _jq21freeze.mjs freezes, and only if this says the target is worth
// freezing. Honest failure is a legitimate output: if the contours still
// disagree, D2 stays BLOCKED and says so.
//
// Two segmenters are run, not one, because "the answer does not depend on the
// method" is a stronger claim than "the answer does not depend on the knob":
//   A. the plain energy flood (§21.1) — what round 0 used, so it is the control
//   B. the BARRIER map (_qtedge.barrier): Bar(p) = min over paths from the rim
//      of max|grad| along the path. Bar is constant inside a closed ridge, so
//      {Bar > T} has a genuine plateau where a flood has only a ramp.
import { energy, barrier, largestFilled } from '../_qtedge.mjs';
import { trace } from '../_nktrace.mjs';
import { toCrest } from '../_qttrace.mjs';
import sharp from 'sharp';

export const FILE = 'quarter-rev-3.jpg';
export const DISC = { cx: 999.50, cy: 999.45, R: 999.49 };   // _jq20indep step 1, p95 0.05% of R

// The guard, in units of R, read off judge/_jq-rev3-grid.png (§4.3 — the grid
// is published so this is auditable, not asserted):
//   left/right wing tips        ~X 12 / 88 at Y 44..52   -> r ~ 0.81 R
//   UNITED STATES OF AMERICA    inner edge of the caps   -> r ~ 0.86 R
//   QUARTER DOLLAR (bottom)     inner edge of the caps   -> r ~ 0.80 R
//   wreath, lowest point of the device, ~ (50, 79)       -> r ~ 0.62 R
// so a main guard at 0.835 R (between wing tip and top legend) and a tighter
// 0.72 R across the bottom sector, where the legend comes further in than the
// device does.
export const GUARD = { main: 0.835, bottom: 0.72, bottomFrom: 35, bottomTo: 145 };

export function guarded(G, W, H, disc, g = GUARD) {
  const out = Float32Array.from(G);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = x - disc.cx, dy = y - disc.cy;
    const r = Math.hypot(dx, dy) / disc.R;
    const th = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
    const inBottom = th >= g.bottomFrom && th <= g.bottomTo;
    if (r > g.main || (inBottom && r > g.bottom)) out[y * W + x] = 0;
  }
  return out;
}

export function fillHoles(mask, W, H) {
  const out = Uint8Array.from(mask);
  const seen = new Uint8Array(W * H); const st = new Int32Array(W * H); let sp = 0;
  const push = (p) => { if (p >= 0 && p < W * H && !seen[p] && !mask[p]) { seen[p] = 1; st[sp++] = p; } };
  for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
  while (sp > 0) {
    const p = st[--sp], x = p % W, y = (p - x) / W;
    if (x > 0) push(p - 1); if (x < W - 1) push(p + 1);
    if (y > 0) push(p - W); if (y < H - 1) push(p + W);
  }
  for (let p = 0; p < W * H; p++) if (!mask[p] && !seen[p]) out[p] = 1;
  return out;
}

export const smooth = (P, passes) => {
  let Q = P.map((p) => p.slice());
  const n = Q.length;
  for (let k = 0; k < passes; k++) {
    const R = new Array(n);
    for (let i = 0; i < n; i++) {
      const a = Q[(i - 1 + n) % n], b = Q[i], c = Q[(i + 1) % n];
      R[i] = [(a[0] + 2 * b[0] + c[0]) / 4, (a[1] + 2 * b[1] + c[1]) / 4];
    }
    Q = R;
  }
  return Q;
};

export const RN = 1024, RSPAN = 1.05;
export async function rasterUV(poly) {
  const d = 'M ' + poly.map((p) => p[0].toFixed(5) + ' ' + p[1].toFixed(5)).join(' L ') + ' Z';
  const { data, info } = await sharp(Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${RN}" height="${RN}" viewBox="${-RSPAN} ${-RSPAN} ${2 * RSPAN} ${2 * RSPAN}"><path d="${d}" fill="#000"/></svg>`))
    .flatten({ background: '#fff' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  if (data.length !== RN * RN) throw new Error(`raster buffer ${data.length} != ${RN * RN} (channels ${info.channels}) — UNTRUSTED`);
  const m = new Uint8Array(RN * RN);
  for (let i = 0; i < RN * RN; i++) m[i] = data[i] < 128 ? 1 : 0;
  return m;
}
export const iou = (a, b) => {
  let inter = 0, uni = 0;
  for (let i = 0; i < a.length; i++) { if (a[i] && b[i]) inter++; if (a[i] || b[i]) uni++; }
  return inter / uni;
};

// flood segmenter: field = everything reachable from just inside the rim
// through G <= T; device = largest not-reached component, holes filled.
export function floodMask(G, W, H, disc, T, rFrac = 0.93) {
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
  const raw = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = y * W + x; if (!seen[p] && inD(x, y)) raw[p] = 1;
  }
  return largestFilled(raw, W, H);
}

// mask -> disc-normalised contour, crest-refined (§21.2)
export function contour(m, W, H, G, disc, crestPasses = 8) {
  const filled = fillHoles(m, W, H);
  let P = trace(filled, W, H).map((p) => [p[0], p[1]]);
  P = smooth(P, 6);
  for (let k = 0; k < crestPasses; k++) P = smooth(toCrest(P, G, W, H, 6, null), 1);
  return { uv: P.map((p) => [(p[0] - disc.cx) / disc.R, (p[1] - disc.cy) / disc.R]), n: P.length, area: filled.reduce((a, b) => a + b, 0) };
}
