// D2 — DIAGNOSTIC: where does the legend ring actually start, and can the
// relief motif be separated from the lettering by something other than radius?
//
// _jd2trace.mjs used a hard LOCUS = 0.70 circle. The owner looked at the
// overlays and caught two faults in one sentence: the traces catch
// E-PLURIBUS-UNUM, and everything "seems to be based off of a circle mask that
// clips the image". Both are real, and the second is the worse of the two — a
// circular locus chosen by hand TRUNCATES the olive and oak branches, so the
// candidate targets were the wrong SHAPE, not merely contaminated.
//
// This file measures rather than guesses. It prints (a) a radial profile of
// device ink so the legend ring's inner edge can be READ OFF instead of
// assumed, and (b) the complete connected-component table inside a generous
// locus, with area, bounding box and centroid for every component. No
// selection is made here. This is the selection test (§4) run before, and
// separately from, any selection: publish the whole candidate set first.
//
// Run: node coloringbook/judge/_jd2sep.mjs
import sharp from 'sharp';

const N = 700;
const REFS = [
  { file: 'dime-proof2010-pair.png', win: [0.0, 0.5, 0.0, 1.0], label: '2010-S' },
  { file: 'dime-proof1960-pair.png', win: [0.0, 1.0, 0.5, 1.0], label: '1960' },
  { file: 'dime-proof1968-pair.jpg', win: [0.5, 1.0, 0.0, 1.0], label: '1968' },
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
  for (let s = 0; s < W * H; s++) {
    if (!on[s] || lab[s] >= 0) continue;
    const st = [s]; lab[s] = s;
    let a = 0, sx = 0, sy = 0;
    while (st.length) {
      const p = st.pop(); a++;
      const x = p % W, y = (p / W) | 0; sx += x; sy += y;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const q = ny * W + nx;
        if (on[q] && lab[q] < 0) { lab[q] = s; st.push(q); }
      }
    }
    if (!best || a > best.a) best = { a, cx: sx / a, cy: sy / a };
  }
  return { cx: X0 + best.cx, cy: Y0 + best.cy, R: Math.sqrt(best.a / Math.PI) };
}

// threshold from the histogram valley, computed over the whole disc
function valley(g, D, rMax) {
  const hist = new Array(256).fill(0);
  const { d, w, h } = g;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (Math.hypot((x - D.cx) / D.R, (y - D.cy) / D.R) <= rMax) hist[d[y * w + x]]++;
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

// sample the source onto the disc-normalised grid
function sample(g, D, T, rMax) {
  const { d, w, h } = g;
  const on = new Uint8Array(N * N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const u = (2 * (i + 0.5)) / N - 1, v = (2 * (j + 0.5)) / N - 1;
    if (Math.hypot(u, v) > rMax) continue;
    const x = Math.round(D.cx + u * D.R), y = Math.round(D.cy + v * D.R);
    if (x < 0 || y < 0 || x >= w || y >= h) continue;
    if (d[y * w + x] >= T) on[j * N + i] = 1;
  }
  return on;
}

function components(on) {
  const lab = new Int32Array(N * N).fill(-1);
  const comps = [];
  for (let s = 0; s < N * N; s++) {
    if (!on[s] || lab[s] >= 0) continue;
    const id = comps.length;
    const st = [s]; lab[s] = id;
    let a = 0, sx = 0, sy = 0, x0 = N, x1 = -1, y0 = N, y1 = -1;
    while (st.length) {
      const p = st.pop(); a++;
      const x = p % N, y = (p / N) | 0;
      sx += x; sy += y;
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
        const q = ny * N + nx;
        if (on[q] && lab[q] < 0) { lab[q] = id; st.push(q); }
      }
    }
    const u = (2 * (sx / a + 0.5)) / N - 1, v = (2 * (sy / a + 0.5)) / N - 1;
    comps.push({ id, a, bw: x1 - x0 + 1, bh: y1 - y0 + 1, cr: Math.hypot(u, v), cu: u, cv: v });
  }
  return { lab, comps };
}

const RMAX = 0.94; // generous: inside the rim, outside anything we might want
for (const R of REFS) {
  const g = await greyOf(P(R.file));
  const D = fitDisc(g, R.win);
  const T = valley(g, D, RMAX);
  console.log(`\n${'='.repeat(72)}\n${R.label}   disc R ${D.R.toFixed(1)}   threshold ${T}`);

  // (a) RADIAL PROFILE — read the legend ring's inner edge off this.
  const on = sample(g, D, T, RMAX);
  const BINS = 47;
  const num = new Array(BINS).fill(0), den = new Array(BINS).fill(0);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const u = (2 * (i + 0.5)) / N - 1, v = (2 * (j + 0.5)) / N - 1;
    const r = Math.hypot(u, v);
    if (r > RMAX) continue;
    const b = Math.min(BINS - 1, Math.floor((r / RMAX) * BINS));
    den[b]++; if (on[j * N + i]) num[b]++;
  }
  console.log('radial ink profile (fraction of each annulus that is device):');
  for (let b = 0; b < BINS; b++) {
    const r0 = (b / BINS) * RMAX, r1 = ((b + 1) / BINS) * RMAX;
    const f = den[b] ? num[b] / den[b] : 0;
    console.log(`  r ${r0.toFixed(3)}-${r1.toFixed(3)}  ${(f * 100).toFixed(1).padStart(5)}%  ${'#'.repeat(Math.round(f * 60))}`);
  }

  // (b) THE WHOLE CANDIDATE SET, no selection applied.
  const { comps } = components(on);
  const locusPx = Math.PI * (N / 2) ** 2 * RMAX * RMAX;
  const sorted = comps.slice().sort((x, y) => y.a - x.a);
  console.log(`\ncomponents: ${comps.length} total. Every one with area >= 0.0005 of the locus:`);
  console.log('    rank      area   %locus    bbox w x h   centroid r   centroid (u,v)');
  for (let k = 0; k < sorted.length; k++) {
    const c = sorted[k];
    if (c.a / locusPx < 0.0005) break;
    console.log(`    ${String(k).padStart(4)}  ${String(c.a).padStart(8)}  ${(c.a / locusPx * 100).toFixed(3).padStart(7)}  ${String(c.bw).padStart(5)} x ${String(c.bh).padStart(4)}  ${c.cr.toFixed(3).padStart(10)}   (${c.cu.toFixed(3)}, ${c.cv.toFixed(3)})`);
  }
  const shown = sorted.filter((c) => c.a / locusPx >= 0.0005).length;
  console.log(`  (${comps.length - shown} smaller components not printed)`);
}
