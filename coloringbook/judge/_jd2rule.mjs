// D2 on the dime reverse: the frozen segmentation RULE, and a declared
// alternative — tested before either has a published value.
//
// ── WHAT `_jd2proof.mjs` ESTABLISHED ───────────────────────────────────────
// The owner supplied four independent reverse references (1960, 1968, 2010,
// 2015 — see ref/PROVENANCE-dime-proofs.md), which removes the reason D2 was
// BLOCKED: "the dime's two reverse files are the same photograph". With
// correct disc fits (verified by overlay, `_jd2fit-*.png`) the frozen rule
// still cannot produce a stable mask on ANY of them:
//
//     min pairwise IoU across the sweep   1960 0.7981   1968 0.0048
//     cross-reference IoU, every pair     0.2450 .. 0.5197
//
// against gates of 0.97 and 0.95. The 1968 file collapses from 26.77% of the
// locus to 0.22% between T=104 and T=109.
//
// The references are not the problem. The RULE is. Look at
// `_jd2fit-dime-proof1960-pair.png`: this design's motif is THREE DISJOINT
// ELEMENTS — torch, olive branch, oak branch — and the frozen rule is "the
// connected component of {grey >= T} containing the centre". That rule can
// only ever return the torch, or, when a specular bridge joins something to
// it, the torch plus whatever it touched. 500+ components at every threshold
// is not noise in the photograph; it is the rule being asked to describe a
// multi-component device with a single-component definition.
//
// The rule was never validated on this coin. It was inherited from a design
// whose device IS one blob, and this dimension has been BLOCKED ever since,
// so no value has ever tested it.
//
// ── THE DECLARED ALTERNATIVE, STATED BEFORE ITS VALUE ──────────────────────
// §8 forbids relaxing a gate to fit a result. This does not relax a gate — the
// gates (0.97 and 0.95) stand untouched. It changes the METRIC's segmentation
// definition, in the open, with the reason recorded, and before any number
// exists. If the alternative also fails, that is the answer and D2 stays
// BLOCKED with a sharper reason than it had.
//
//   MOTIF = the union of every connected component of {device-side of T}
//           whose area is >= 0.2% of the locus and whose centroid lies inside
//           the locus.
//   LOCUS = r <= 0.70 R, not 0.862 R.
//
// Two reasons for the tighter locus, both about what belongs to which
// dimension. The legends (UNITED STATES OF AMERICA, ONE DIME, E PLURIBUS
// UNUM) sit between 0.70 R and the rim, they are plainly inside the old
// 0.862 R locus, and they are LETTERING — D5's subject, scored there with its
// own cap, band and span gates. Including them in a silhouette metric double-
// counts them and makes D2 move when D5 is repaired, which is precisely the
// coupling round 1 would have tripped over. The dime's own D13 row already
// uses "r < 33" (0.70 of 47) for the same reason and calls it "inside every
// legend, §22.8" — so the radius is not invented here, it is borrowed from a
// locus this coin already carries.
//
// Run: node coloringbook/judge/_jd2rule.mjs
import sharp from 'sharp';

const N = 700;
const REFS = [
  { file: 'dime-pcgs2015-pair.jpg', win: [0.5, 1.0, 0.0, 1.0] },
  { file: 'dime-proof2010-pair.png', win: [0.0, 0.5, 0.0, 1.0] },
  { file: 'dime-proof1960-pair.png', win: [0.0, 1.0, 0.5, 1.0] },
  { file: 'dime-proof1968-pair.jpg', win: [0.5, 1.0, 0.0, 1.0] },
];
const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
const greyOf = async (p) => {
  const { data, info } = await sharp(p).greyscale().raw().toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, h: info.height };
};

function fitDisc(g, win) {
  const { d, w, h } = g;
  const [fx0, fx1, fy0, fy1] = win;
  const X0 = Math.round(fx0 * w), X1 = Math.round(fx1 * w);
  const Y0 = Math.round(fy0 * h), Y1 = Math.round(fy1 * h);
  const W = X1 - X0, H = Y1 - Y0;
  const px = (x, y) => d[(Y0 + y) * w + (X0 + x)];
  const border = [];
  for (let x = 0; x < W; x++) border.push(px(x, 0), px(x, H - 1));
  for (let y = 0; y < H; y++) border.push(px(0, y), px(W - 1, y));
  border.sort((a, b) => a - b);
  const bg = border[(border.length / 2) | 0];
  const on = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (Math.abs(px(x, y) - bg) > 25) on[y * W + x] = 1;
  const lab = new Int32Array(W * H).fill(-1);
  let best = null;
  for (let s0 = 0; s0 < W * H; s0++) {
    if (!on[s0] || lab[s0] >= 0) continue;
    const st = [s0]; lab[s0] = s0;
    let area = 0, sx = 0, sy = 0;
    while (st.length) {
      const p = st.pop(); area++;
      const x = p % W, y = (p / W) | 0; sx += x; sy += y;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const q = ny * W + nx;
        if (on[q] && lab[q] < 0) { lab[q] = s0; st.push(q); }
      }
    }
    if (!best || area > best.area) best = { area, cx: sx / area, cy: sy / area };
  }
  return { cx: X0 + best.cx, cy: Y0 + best.cy, R: Math.sqrt(best.area / Math.PI) };
}

function polarity(g, D) {
  const { d, w, h } = g;
  let a = 0, an = 0, b = 0, bn = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const r = Math.hypot((x - D.cx) / D.R, (y - D.cy) / D.R);
    if (r < 0.45) { a += d[y * w + x]; an++; } else if (r >= 0.72 && r <= 0.80) { b += d[y * w + x]; bn++; }
  }
  return a / an > b / bn;
}

function valley(g, D, LOC) {
  const hist = new Array(256).fill(0);
  const { d, w, h } = g;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const r = Math.hypot((x - D.cx) / D.R, (y - D.cy) / D.R);
    if (r <= LOC) hist[d[y * w + x]]++;
  }
  const sm = hist.map((_, i) => {
    let s = 0, n = 0;
    for (let k = Math.max(0, i - 5); k <= Math.min(255, i + 5); k++) { s += hist[k]; n++; }
    return s / n;
  });
  let m1 = 0;
  for (let i = 0; i < 256; i++) if (sm[i] > sm[m1]) m1 = i;
  let m2 = -1;
  for (let i = 0; i < 256; i++) if (Math.abs(i - m1) >= 40 && (m2 < 0 || sm[i] > sm[m2])) m2 = i;
  const lo = Math.min(m1, m2), hi = Math.max(m1, m2);
  let v = lo;
  for (let i = lo; i <= hi; i++) if (sm[i] < sm[v]) v = i;
  return v;
}

// union of components >= AREA_MIN of the locus, centroid inside the locus
const AREA_MIN = 0.002;
function maskUnion(g, D, T, bright, LOC) {
  const { d, w, h } = g;
  const on = new Uint8Array(N * N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const u = (2 * (i + 0.5)) / N - 1, v = (2 * (j + 0.5)) / N - 1;
    if (Math.hypot(u, v) > LOC) continue;
    const x = Math.round(D.cx + u * D.R), y = Math.round(D.cy + v * D.R);
    if (x < 0 || y < 0 || x >= w || y >= h) continue;
    const val = d[y * w + x];
    if (bright ? val >= T : val <= T) on[j * N + i] = 1;
  }
  const lab = new Int32Array(N * N).fill(-1);
  const comps = [];
  for (let s0 = 0; s0 < N * N; s0++) {
    if (!on[s0] || lab[s0] >= 0) continue;
    const id = comps.length;
    const st = [s0]; lab[s0] = id;
    let area = 0, sx = 0, sy = 0;
    while (st.length) {
      const p = st.pop(); area++;
      const x = p % N, y = (p / N) | 0; sx += x; sy += y;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
        const q = ny * N + nx;
        if (on[q] && lab[q] < 0) { lab[q] = id; st.push(q); }
      }
    }
    comps.push({ id, area, cx: sx / area, cy: sy / area });
  }
  const locusPx = Math.PI * ((N / 2) * LOC) ** 2;
  const keep = new Set(
    comps.filter((c) => c.area >= AREA_MIN * locusPx &&
      Math.hypot(c.cx - N / 2, c.cy - N / 2) <= LOC * (N / 2)).map((c) => c.id)
  );
  const mask = new Uint8Array(N * N);
  let area = 0;
  for (let k = 0; k < N * N; k++) if (keep.has(lab[k])) { mask[k] = 1; area++; }
  return { mask, frac: area / locusPx, kept: keep.size, total: comps.length };
}

const iou = (a, b) => {
  let i = 0, u = 0;
  for (let k = 0; k < a.length; k++) { const x = a[k], y = b[k]; if (x || y) u++; if (x && y) i++; }
  return u ? i / u : 0;
};

for (const LOC of [0.862, 0.70]) {
  console.log(`\n########## LOCUS r <= ${LOC} R   (${LOC === 0.862 ? "D2's frozen locus — legends INCLUDED" : 'declared alternative — legends excluded'})`);
  const mids = [];
  for (const R of REFS) {
    const g = await greyOf(P(R.file));
    const D = fitDisc(g, R.win);
    const bright = polarity(g, D);
    const Tv = valley(g, D, LOC);
    const ms = [];
    for (let T = Tv - 15; T <= Tv + 15; T += 5) ms.push({ T, ...maskUnion(g, D, T, bright, LOC) });
    let mn = 1;
    for (let i = 0; i < ms.length; i++) for (let j = i + 1; j < ms.length; j++) mn = Math.min(mn, iou(ms[i].mask, ms[j].mask));
    const mid = ms[(ms.length / 2) | 0];
    mids.push({ file: R.file, mask: mid.mask });
    console.log(`  ${R.file.padEnd(26)} Tv ${String(Tv).padStart(3)}  motif ${(mid.frac * 100).toFixed(2)}%  kept ${mid.kept}/${mid.total} comps  min pairwise IoU ${mn.toFixed(4)} ${mn >= 0.97 ? 'MET' : 'not met'}`);
  }
  console.log(`  -- cross-reference:`);
  let worst = 1;
  for (let i = 0; i < mids.length; i++) for (let j = i + 1; j < mids.length; j++) {
    const v = iou(mids[i].mask, mids[j].mask);
    worst = Math.min(worst, v);
    console.log(`     ${mids[i].file.slice(5, 22).padEnd(18)} vs ${mids[j].file.slice(5, 22).padEnd(18)} IoU ${v.toFixed(4)}`);
  }
  console.log(`  -- worst cross-reference IoU ${worst.toFixed(4)}  GATE >= 0.95 -> ${worst >= 0.95 ? 'MET' : 'NOT MET'}`);
}
