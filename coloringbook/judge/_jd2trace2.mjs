// D2 — TRACING the dime reverse RELIEF, with the lettering separated from it
// structurally rather than by radius.
//
// Two faults the owner found in _jd2trace.mjs by looking at its overlays:
//   1. the traces caught E-PLURIBUS-UNUM, and
//   2. everything was "based off of a circle mask that clips the image".
// The second is the worse one, and it was right: a hand-chosen LOCUS = 0.70
// circle cut the TORCH FLAME flat across the top. Those candidates were the
// wrong SHAPE, not merely contaminated with letters. §6.1's spirit applies —
// a locus picked because it looks right is a locus fitted to the artefact.
//
// THERE IS NO LOCUS CIRCLE IN THIS FILE. Three measurements replace it, in
// this order:
//
// (a) THE LEGEND RING IS DROPPED BY CONNECTED COMPONENT, not by radius. The
//     relief is one merged mass and the legend letters are separate
//     components, so selecting the dominant component excludes the whole ring
//     without bounding the flame. The complete candidate set is printed and
//     the gap is stated (§4's selection test): it runs 16.9x to 26.3x between
//     the largest component and the second, on the three references. If that
//     gap ever collapses the relief has merged with the legend and the script
//     says so instead of returning a number.
//
// (b) THE INTERIOR LETTERING IS LOCATED BY ITS OWN BASELINE. Selecting the
//     dominant mass already drops every FREE-STANDING E-PLURIBUS-UNUM letter,
//     and those dropped components carry the baseline with them. Cluster them
//     on it — median centre row, median letter height, keep what sits within
//     1.5 heights — and the band falls out. Nobody declares where the text is;
//     the photographs do, and they agree: median row 464.5 / 466.5 / 463 and
//     letter height 39 / 40 / 42 across three independent images. Min/max over
//     every interior component was tried first and is fragile — one speckle on
//     the mirror field stretched the band to 300 and 370 rows against 53.
//
// (c) LETTERS TOUCHING THE RELIEF ARE CUT BY A PLAIN OPENING, INSIDE THAT BAND
//     ONLY. A letter that touches the torch survives opening-by-reconstruction,
//     because reconstruction re-grows anything connected to a surviving core.
//     Inside the band the only relief is the torch shaft, which is thick enough
//     to survive a plain opening, so a plain opening is safe THERE and cuts the
//     joins. Outside the band the branch twigs are thin and need the
//     reconstruction, which is what they get. The two are unioned.
//
// The erosion radius is swept and the whole sweep is printed, so the chosen
// value is a selection from a published candidate set rather than a constant
// that appeared from nowhere.
//
// THIS TRACE IS FOR SHAPE ONLY. All three references are cameo proofs — frosted
// device on a mirror field is the highest device/field contrast a coin
// photograph can have, and §20.3 says that makes them the best SHAPE reference
// and the worst tone one. Never use this output for D3 or D13.
//
// Run: node coloringbook/judge/_jd2trace2.mjs
import sharp from 'sharp';

export const N = 700;
export const REFS = [
  { file: 'dime-proof2010-pair.png', win: [0.0, 0.5, 0.0, 1.0], label: '2010-S' },
  { file: 'dime-proof1960-pair.png', win: [0.0, 1.0, 0.5, 1.0], label: '1960' },
  { file: 'dime-proof1968-pair.jpg', win: [0.5, 1.0, 0.0, 1.0], label: '1968' },
];
export const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
export const OUT = (f) => new URL('./' + f, import.meta.url).pathname;
export const ERODE_R = 7;          // grid px; ~ half a letter stroke, swept below
const LOCUS_LO = 0.60, LOCUS_HI = 0.85; // search bounds for the trough

export const greyOf = async (p) => {
  const { data, info } = await sharp(p).greyscale().raw().toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, h: info.height };
};

export function fitDisc(g, win) {
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

export function valley(g, D, rMax) {
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

export const sample = (g, D, T, rMax) => {
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
};

// Find the trough between the relief and the legend ring. Bounds printed.
export function findLocus(on, label) {
  const BINS = 100;
  const num = new Array(BINS).fill(0), den = new Array(BINS).fill(0);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const u = (2 * (i + 0.5)) / N - 1, v = (2 * (j + 0.5)) / N - 1;
    const r = Math.hypot(u, v);
    if (r > 1) continue;
    const b = Math.min(BINS - 1, Math.floor(r * BINS));
    den[b]++; if (on[j * N + i]) num[b]++;
  }
  const f = num.map((n, b) => (den[b] ? n / den[b] : 0));
  const sm = f.map((_, b) => {
    let s = 0, n = 0;
    for (let k = Math.max(0, b - 2); k <= Math.min(BINS - 1, b + 2); k++) { s += f[k]; n++; }
    return s / n;
  });
  const b0 = Math.round(LOCUS_LO * BINS), b1 = Math.round(LOCUS_HI * BINS);
  let best = b0;
  for (let b = b0; b <= b1; b++) if (sm[b] < sm[best]) best = b;
  const r = (best + 0.5) / BINS;
  const onBound = best === b0 || best === b1;
  console.log(`  locus trough: r = ${r.toFixed(3)}  (searched ${LOCUS_LO}..${LOCUS_HI}; ink there ${(sm[best] * 100).toFixed(1)}%)` +
    (onBound ? '  !! ON A SEARCH BOUND — FAILURE REPORT, not a value' : ''));
  return { r, onBound };
}

// binary morphology on the N x N grid
export function erode(m, rad) {
  const out = new Uint8Array(N * N);
  const off = [];
  for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++) if (dx * dx + dy * dy <= rad * rad) off.push([dx, dy]);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    if (!m[j * N + i]) continue;
    let keep = 1;
    for (const [dx, dy] of off) {
      const x = i + dx, y = j + dy;
      if (x < 0 || y < 0 || x >= N || y >= N || !m[y * N + x]) { keep = 0; break; }
    }
    out[j * N + i] = keep;
  }
  return out;
}

export function components(on) {
  const lab = new Int32Array(N * N).fill(-1);
  const comps = [];
  for (let s = 0; s < N * N; s++) {
    if (!on[s] || lab[s] >= 0) continue;
    const id = comps.length;
    const st = [s]; lab[s] = id;
    let a = 0, sx = 0, sy = 0, y0 = N, y1 = -1;
    while (st.length) {
      const p = st.pop(); a++;
      const x = p % N, y = (p / N) | 0; sx += x; sy += y;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
        const q = ny * N + nx;
        if (on[q] && lab[q] < 0) { lab[q] = id; st.push(q); }
      }
    }
    const u = (2 * (sx / a + 0.5)) / N - 1, v = (2 * (sy / a + 0.5)) / N - 1;
    comps.push({ id, a, cr: Math.hypot(u, v), y0, y1 });
  }
  return { lab, comps };
}

export function dilate(m, rad) {
  const out = new Uint8Array(N * N);
  const off = [];
  for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++) if (dx * dx + dy * dy <= rad * rad) off.push([dx, dy]);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    if (!m[j * N + i]) continue;
    for (const [dx, dy] of off) {
      const x = i + dx, y = j + dy;
      if (x >= 0 && y >= 0 && x < N && y < N) out[y * N + x] = 1;
    }
  }
  return out;
}

// geodesic reconstruction by dilation of `seed` under `mask` (flood fill)
export function reconstruct(seed, mask) {
  const out = new Uint8Array(N * N);
  const st = [];
  for (let k = 0; k < N * N; k++) if (seed[k] && mask[k]) { out[k] = 1; st.push(k); }
  while (st.length) {
    const p = st.pop();
    const x = p % N, y = (p / N) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
      const q = ny * N + nx;
      if (mask[q] && !out[q]) { out[q] = 1; st.push(q); }
    }
  }
  return out;
}

export const area = (m) => { let a = 0; for (let k = 0; k < N * N; k++) if (m[k]) a++; return a; };

export const outline = (m) => {
  const o = new Uint8Array(N * N);
  for (let j = 1; j < N - 1; j++) for (let i = 1; i < N - 1; i++) {
    if (!m[j * N + i]) continue;
    if (!m[(j - 1) * N + i] || !m[(j + 1) * N + i] || !m[j * N + i - 1] || !m[j * N + i + 1]) o[j * N + i] = 1;
  }
  return o;
};

export async function draw(file, D, layers, out, title) {
  const meta = await sharp(P(file)).metadata();
  const s = (2 * D.R) / N;
  const parts = [];
  for (const { m, colour } of layers) {
    const o = outline(m);
    const fill = [];
    for (let j = 0; j < N; j += 2) for (let i = 0; i < N; i += 2) {
      if (!m[j * N + i]) continue;
      const u = (2 * (i + 0.5)) / N - 1, v = (2 * (j + 0.5)) / N - 1;
      fill.push(`<rect x="${(D.cx + u * D.R).toFixed(1)}" y="${(D.cy + v * D.R).toFixed(1)}" width="${Math.max(2, s * 2).toFixed(1)}" height="${Math.max(2, s * 2).toFixed(1)}" fill="${colour}" opacity="0.30"/>`);
    }
    const pts = [];
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      if (!o[j * N + i]) continue;
      const u = (2 * (i + 0.5)) / N - 1, v = (2 * (j + 0.5)) / N - 1;
      pts.push(`<rect x="${(D.cx + u * D.R).toFixed(1)}" y="${(D.cy + v * D.R).toFixed(1)}" width="${Math.max(2, s * 1.6).toFixed(1)}" height="${Math.max(2, s * 1.6).toFixed(1)}" fill="${colour}"/>`);
    }
    parts.push(fill.join('') + pts.join(''));
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${meta.width}" height="${meta.height}">${parts.join('')}
    <text x="12" y="30" font-family="monospace" font-size="24" fill="#ff0">${title}</text></svg>`;
  await sharp(P(file)).composite([{ input: Buffer.from(svg) }]).png().toFile(OUT(out));
  return out;
}

export const iou = (a, b) => {
  let i = 0, u = 0;
  for (let k = 0; k < a.length; k++) { const x = a[k], y = b[k]; if (x || y) u++; if (x && y) i++; }
  return u ? i / u : 0;
};

// ONE reference, the whole settled pipeline. Exported so the freeze step and
// the three-reference comparison run the SAME code — a second implementation
// is a second chance to be wrong, and this project has been bitten by that.
export async function traceOne(R) {
  const g = await greyOf(P(R.file));
  const D = fitDisc(g, R.win);
  const T = valley(g, D, 0.94);
  const wide = sample(g, D, T, 0.94);
  const { r: LOC, onBound } = findLocus(wide, R.label);

  // THE CIRCLE IS GONE. A single radius cannot bound this design: the trough
  // finder puts the relief/legend boundary near r 0.70, but the TORCH FLAME
  // reaches past it, so clipping there cut the flame flat across the top —
  // which is what the owner saw. The legend ring does not need a radius to be
  // excluded, because its letters are SEPARATE CONNECTED COMPONENTS while the
  // relief is one merged mass. Select by component with the whole candidate
  // set printed and the gap stated (§4's selection test), and the flame keeps
  // its shape.
  const all = sample(g, D, T, 0.94);
  const { lab, comps } = components(all);
  const discPx = Math.PI * ((N / 2) * 0.94) ** 2;
  const sorted = comps.slice().sort((a, b) => b.a - a.a);
  console.log(`    components inside r<=0.94: ${comps.length}. Six largest, as % of the disc:`);
  for (let k = 0; k < Math.min(6, sorted.length); k++)
    console.log(`      #${k}  ${(sorted[k].a / discPx * 100).toFixed(3).padStart(7)}%  centroid r ${sorted[k].cr.toFixed(3)}`);
  const gap = sorted.length > 1 ? sorted[0].a / sorted[1].a : Infinity;
  console.log(`      largest/second = ${gap.toFixed(1)}x  ${gap >= 5 ? '— one dominant mass, selection unambiguous' : '!! NO CLEAR GAP — the relief may have merged with the legend ring; DO NOT TRUST THIS TRACE'}`);
  const raw = new Uint8Array(N * N);
  for (let k = 0; k < N * N; k++) if (lab[k] === sorted[0].id) raw[k] = 1;

  // RESPONSE TEST on the erosion radius: sweep it and print the whole set, so
  // the chosen radius is a selection from a printed candidate set (§4), and so
  // a radius that changes nothing is visible.
  console.log('    erode r | kept area %locus | removed vs raw');
  let chosen = null;
  for (const rad of [3, 5, 7, 9, 11]) {
    const rec = reconstruct(erode(raw, rad), raw);
    const a = area(rec), a0 = area(raw);
    console.log(`      ${String(rad).padStart(2)}    |      ${(a / discPx * 100).toFixed(1).padStart(5)}      |   ${((1 - a / a0) * 100).toFixed(1).padStart(5)}%`);
    if (rad === ERODE_R) chosen = rec;
  }
  const a0 = area(raw);
  console.log(`    raw (no separation): ${(a0 / discPx * 100).toFixed(1)}% of the disc`);

  // WHAT RECONSTRUCTION CANNOT DO, and the second pass that finishes it.
  // Reconstruction removes only the letters that stand FREE of the relief; a
  // letter touching the torch is re-grown through the join. The pixels it DID
  // remove are therefore a sample of the lettering, and their rows locate the
  // E-PLURIBUS-UNUM baseline without anyone declaring where it is.
  // Selecting the dominant component ALREADY dropped every free-standing
  // letter, so nothing is left for the reconstruction to remove and the band
  // cannot be read from its leavings. But those dropped components are exactly
  // the interior lettering, and they carry the baseline with them: take the
  // small components whose centroid lies inside the relief's radius, and their
  // row extent IS the E-PLURIBUS-UNUM band. Nobody declares where the text is;
  // the photograph does, three times independently.
  const letters = comps.filter((c) => c.id !== sorted[0].id && c.cr < 0.75 && c.a / discPx >= 0.0003);
  // Min/max over every interior component is fragile: one speckle on the
  // mirror field drags the band across the whole coin, which is exactly what
  // it did on two of the three references (300 and 370 rows against 53). The
  // letters of one line share a BASELINE, so cluster on it — take the median
  // centre row and the median letter height, keep only components sitting
  // within 1.5 heights of that median, and let those define the band.
  let j0 = -1, j1 = -1;
  if (letters.length) {
    const med = (xs) => { const a = xs.slice().sort((p, q) => p - q); return a[(a.length / 2) | 0]; };
    const mid = med(letters.map((c) => (c.y0 + c.y1) / 2));
    const hgt = med(letters.map((c) => c.y1 - c.y0 + 1));
    const line = letters.filter((c) => Math.abs((c.y0 + c.y1) / 2 - mid) <= 1.5 * hgt);
    j0 = Math.min(...line.map((c) => c.y0));
    j1 = Math.max(...line.map((c) => c.y1));
    console.log(`    baseline cluster: median row ${mid}, median letter height ${hgt}, ${line.length}/${letters.length} components on the line`);
  }
  console.log(`    interior free-standing components (the dropped letters): ${letters.length}`);
  const bandV = (j) => (2 * (j + 0.5)) / N - 1;
  console.log(`    text band located from the removed pixels: rows ${j0}..${j1}  (v ${bandV(j0).toFixed(3)}..${bandV(j1).toFixed(3)}, ${j1 - j0 + 1} rows)`);

  // Inside that band the only relief is the torch shaft, which is thick, so a
  // PLAIN opening is safe there and does cut letters that touch it. Outside
  // it, twigs are thin and need the reconstruction. Union the two.
  const opened = dilate(erode(raw, ERODE_R), ERODE_R);
  const mask = new Uint8Array(N * N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const k = j * N + i;
    mask[k] = (j >= j0 && j <= j1) ? (opened[k] & chosen[k]) : chosen[k];
  }
  const a2 = area(mask);
  console.log(`    after the band pass: ${(a2 / discPx * 100).toFixed(1)}% of locus  (removed ${((1 - a2 / a0) * 100).toFixed(1)}% of raw in total)`);

  return { ...R, D, LOC, raw, mask, onBound, discPx, j0, j1, T };
}

// Only run the three-reference comparison when invoked directly; the freeze
// step imports the pipeline above and must not re-run it.
if (process.argv[1] && process.argv[1].endsWith('_jd2trace2.mjs')) {
  console.log('D2 relief trace — measured locus, lettering removed by opening-by-reconstruction\n');
  const traces = [];
  const files = [];
  for (const R of REFS) {
    console.log(`${R.label}:`);
    const t = await traceOne(R);
    traces.push(t);
    files.push(await draw(t.file, t.D, [{ m: t.mask, colour: '#00e0ff' }],
      `_jd2t2-relief-${t.label}.png`, `${t.label} — relief only (locus r=${t.LOC.toFixed(2)}, erode ${ERODE_R})`));
    console.log('');
  }

  console.log('pairwise agreement between the three relief traces:');
  for (let i = 0; i < traces.length; i++)
    for (let j = i + 1; j < traces.length; j++)
      console.log(`  ${traces[i].label} vs ${traces[j].label}   IoU ${iou(traces[i].mask, traces[j].mask).toFixed(4)}`);

  const avg = new Uint8Array(N * N);
  for (let k = 0; k < N * N; k++) if (traces[0].mask[k] + traces[1].mask[k] + traces[2].mask[k] >= 2) avg[k] = 1;
  console.log('\nAVERAGE (>= 2 of 3 photographs):');
  for (const t of traces) console.log(`  average vs ${t.label.padEnd(8)} IoU ${iou(avg, t.mask).toFixed(4)}`);
  for (const t of traces) files.push(await draw(t.file, t.D, [{ m: avg, colour: '#ff2020' }], `_jd2t2-avg-${t.label}.png`, `${t.label} — the AVERAGE relief of all three`));
  console.log('\nwrote: ' + files.join(', '));
}
