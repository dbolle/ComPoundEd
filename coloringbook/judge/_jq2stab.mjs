// D2, step 2: is the traced contour independent of the flood threshold once it
// is pushed to the ridge crest (§21.2)? The AREA of the flood mask drifts by
// design — that drift is the ridge's width. The frozen thing is the contour.
import { energy } from '../_qtedge.mjs';
import { trace } from '../_nktrace.mjs';
import { toCrest } from '../_qttrace.mjs';
import { FILE, DISC, GUARD, guarded, components, notReached } from './_jq2seg.mjs';
import sharp from 'sharp';

const { G, W, H, grey } = await energy(FILE, DISC);

function fillHoles(mask, W, H) {
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

const smooth = (P, passes) => {
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

const N = 1024, SPAN = 1.05;
async function rasterUV(poly) {
  const d = 'M ' + poly.map((p) => p[0].toFixed(5) + ' ' + p[1].toFixed(5)).join(' L ') + ' Z';
  const { data, info } = await sharp(Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${N}" height="${N}" viewBox="${-SPAN} ${-SPAN} ${2 * SPAN} ${2 * SPAN}"><path d="${d}" fill="#000"/></svg>`))
    .flatten({ background: '#fff' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  if (data.length !== N * N) throw new Error(`raster buffer ${data.length} != ${N * N} (channels ${info.channels}) — UNTRUSTED`);
  const m = new Uint8Array(N * N);
  for (let i = 0; i < N * N; i++) m[i] = data[i] < 128 ? 1 : 0;
  return m;
}
const iou = (a, b) => {
  let inter = 0, uni = 0;
  for (let i = 0; i < a.length; i++) { if (a[i] && b[i]) inter++; if (a[i] || b[i]) uni++; }
  return inter / uni;
};

const out = {};
for (const T of [2.5, 3.0, 3.5]) {
  const Gg = guarded(G, W, H, DISC);
  let m = notReached(Gg, W, H, DISC, T);
  const { lab, comps } = components(m, W, H);
  const keep = comps[0].id;
  const only = new Uint8Array(W * H);
  for (let p = 0; p < W * H; p++) if (lab[p] === keep) only[p] = 1;
  const filled = fillHoles(only, W, H);
  let P = trace(filled, W, H).map((p) => [p[0], p[1]]);
  P = smooth(P, 6);
  for (let k = 0; k < 8; k++) P = smooth(toCrest(P, G, W, H, 6, null), 1);
  const uv = P.map((p) => [(p[0] - DISC.cx) / DISC.R, (p[1] - DISC.cy) / DISC.R]);
  out[T] = { uv, area: filled.reduce((a, b) => a + b, 0), n: P.length };
  console.log(`T ${T}: largest component ${comps[0].area}px, holes filled -> ${out[T].area}px, ${P.length} contour points`);
}

const R = {};
for (const T of [2.5, 3.0, 3.5]) R[T] = await rasterUV(out[T].uv);
console.log(`\ncontour agreement after crest refinement (IoU between thresholds):`);
console.log(`  T2.5 vs T3.0 ${iou(R[2.5], R[3.0]).toFixed(4)}`);
console.log(`  T3.0 vs T3.5 ${iou(R[3.0], R[3.5]).toFixed(4)}`);
console.log(`  T2.5 vs T3.5 ${iou(R[2.5], R[3.5]).toFixed(4)}`);
console.log(`\n(the quarter obverse's equivalent, published: contour moves 0.112% of diameter for T 3.5->4)`);
