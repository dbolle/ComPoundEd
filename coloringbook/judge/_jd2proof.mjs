// Do the three proof dimes unblock D2 (and D4) on the dime reverse?
//
// D2 has sat BLOCKED on this coin since round 0 for a reason about the
// ARTEFACTS, not the instrument: `dime-rev.jpg` and `dime-rev-2.jpg` are the
// SAME photograph (NCC 0.9931), so "two independent references agree" could
// not even be attempted. The owner supplied three proofs — see
// `coloringbook/ref/PROVENANCE-dime-proofs.md` for sources and for the
// tone-vs-shape restriction that governs all three.
//
// `dime-gates.md` states the freeze criteria, stated before any value existed,
// so this run is a test and not a negotiation:
//
//   (1) min pairwise IoU across the threshold sweep >= 0.97
//   (2) two INDEPENDENT references agree >= 0.95
//   (3) motif = the connected component of {grey >= T} containing the centre,
//       T = Tv +- 15 step 5, Tv the histogram valley floor OF THE PHOTOGRAPH
//
// ── V1 OF THIS FILE RETURNED 0.0000 ON EVERY REFERENCE, AND WAS WRONG ───────
// Recorded rather than quietly fixed, because it is the failure §4 exists to
// catch and I walked into it by skipping the response test:
//
//   · the valley finder searched one mode in [0,128) and the other in
//     [128,256) — an arbitrary split. On a proof the interior histogram is a
//     large dark mode (mirror field) and a bright mode (frosted device), and
//     on the 1968 file that rule put Tv at 225, above all but the specular
//     highlights;
//   · the flood fill seeded on the EXACT centre pixel. At Tv 225 that pixel
//     is not lit, so the fill returned an empty mask — area 0.00%, IoU 0.0000,
//     "GATE NOT MET" — a confident number that was about my seed and not
//     about the artefact.
//
// Both are fixed below and both fixes are auditable in the output: the two
// modes are found by peak-picking with a minimum separation and printed, the
// seed rule that fired is printed, and there is a response test.
//
// Run: node coloringbook/judge/_jd2proof.mjs
//      RESPONSE=1  the response test only
import sharp from 'sharp';

const N = 700; // disc-normalised grid, as D2 specifies
const RLOCUS = 0.862; // D2's locus: r <= 0.862 R

// reverse-side window of each pair image, as a fraction of width/height, read
// off the images and frozen here as literals (never derived from our drawing)
const REFS = [
  { file: 'dime-pcgs2015-pair.jpg', win: [0.5, 1.0, 0.0, 1.0], note: '2015-P, reverse RIGHT — INVERTED contrast' },
  { file: 'dime-proof2010-pair.png', win: [0.0, 0.5, 0.0, 1.0], note: '2010-S cameo proof, reverse LEFT' },
  { file: 'dime-proof1960-pair.png', win: [0.0, 1.0, 0.5, 1.0], note: '1960 cameo proof, reverse BOTTOM' },
  { file: 'dime-proof1968-pair.jpg', win: [0.5, 1.0, 0.0, 1.0], note: '1968 cameo proof, reverse RIGHT' },
];

// ── POLARITY, declared before any value exists ──────────────────────────────
// D2's rule says "the connected component of {grey >= T}", which assumes the
// DEVICE is brighter than the field. That holds for a cameo proof (frosted
// device, mirror field) and it is FALSE for the 2015-P reference, where the
// device reads dark against a satin field. Scoring that file with a fixed
// `>=` would segment the FIELD and call it the motif — an in-bounds,
// response-testing, confidently wrong answer of exactly the kind §4.3 is
// about.
//
// So polarity is detected and PRINTED, and the comparison is `>=` or `<=`
// accordingly. This is the same generalisation `_jd5rim.mjs` made for the
// same reason ("the test is |m - L|, not L - m, because a cameo proof's
// mirror field photographs near-black"), declared here BEFORE any dime D2
// value exists rather than after one disagreed.
//
// The detector: mean grey inside r < 0.45 R (device territory on this design —
// torch and branches) against a bare-field annulus at r 0.70..0.80 R chosen
// off the REFERENCES' own layout, never from our drawing (§6.1).
function polarity(g, D) {
  const { d, w, h } = g;
  let inS = 0, inN = 0, anS = 0, anN = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const u = (x - D.cx) / D.R, v = (y - D.cy) / D.R;
    const r = Math.hypot(u, v);
    if (r < 0.45) { inS += d[y * w + x]; inN++; }
    else if (r >= 0.70 && r <= 0.80) { anS += d[y * w + x]; anN++; }
  }
  const inner = inS / Math.max(1, inN), field = anS / Math.max(1, anN);
  return { inner: +inner.toFixed(1), field: +field.toFixed(1), deviceBrighter: inner > field };
}

const greyOf = async (p) => {
  const { data, info } = await sharp(p).greyscale().raw().toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, h: info.height };
};
const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;

// ── the disc, by BACKGROUND DIFFERENCING ────────────────────────────────────
//
// V2. The first version selected the (cx, cy, R) with the greatest mean radial
// gradient across the edge, and it is recorded here as a failure rather than
// deleted, because it is the §4.3 mistake in its purest form: an in-bounds,
// bound-checked, response-testing answer to the WRONG QUESTION.
//
// Mean radial gradient is maximised by any small, sharp, high-contrast feature
// — a letter, the torch head — not by the coin's own edge. On
// `dime-proof1960-pair.png` it returned **R 56** in a window whose coin is
// about R 235, with the correct answer sitting FOURTH in the candidate list at
// R 248. The candidate set was printed, as §4.2 requires, and printing it is
// what makes the fault visible: three of the top four candidates are the same
// tiny blob. Everything downstream then measured an 81.73%-of-locus "motif",
// which is what segmenting a letter at 25x magnification looks like.
//
// V2 uses the one thing every reference here has in common: a plain, uniform
// surround. The background level is the median of the window's border pixels;
// the coin is the largest connected region differing from it by more than 25
// grey levels; the centre is that region's centroid and R is taken from its
// area. Polarity-agnostic by construction, because it tests |grey - bg|
// rather than a direction — the same reason `_jd5rim.mjs` tests |m - L|.
//
// AND IT DRAWS WHAT IT FOUND. §4.3 is the highest-yield rule in the judge
// spec: every located feature is published as an overlay and looked at. The
// gradient fitter would have been caught in one glance.
function fitDisc(g, win, tag) {
  const { d, w, h } = g;
  const [fx0, fx1, fy0, fy1] = win;
  const X0 = Math.round(fx0 * w), X1 = Math.round(fx1 * w);
  const Y0 = Math.round(fy0 * h), Y1 = Math.round(fy1 * h);
  const W = X1 - X0, H = Y1 - Y0;
  const px = (x, y) => d[(Y0 + y) * w + (X0 + x)];

  // background = median of the border ring of the window
  const border = [];
  for (let x = 0; x < W; x++) { border.push(px(x, 0), px(x, H - 1)); }
  for (let y = 0; y < H; y++) { border.push(px(0, y), px(W - 1, y)); }
  border.sort((a, b) => a - b);
  const bg = border[(border.length / 2) | 0];

  const on = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (Math.abs(px(x, y) - bg) > 25) on[y * W + x] = 1;

  // largest connected component
  const lab = new Int32Array(W * H).fill(-1);
  let best = null;
  for (let s0 = 0; s0 < W * H; s0++) {
    if (!on[s0] || lab[s0] >= 0) continue;
    const id = s0;
    const st = [s0]; lab[s0] = id;
    let area = 0, sx = 0, sy = 0, x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
    while (st.length) {
      const p = st.pop(); area++;
      const x = p % W, y = (p / W) | 0;
      sx += x; sy += y;
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const q = ny * W + nx;
        if (on[q] && lab[q] < 0) { lab[q] = id; st.push(q); }
      }
    }
    if (!best || area > best.area) best = { area, cx: sx / area, cy: sy / area, bbox: [x0, x1, y0, y1] };
  }
  const R_area = Math.sqrt(best.area / Math.PI);
  const R_bbox = (best.bbox[1] - best.bbox[0] + best.bbox[3] - best.bbox[2]) / 4;
  // The two estimates must agree: a blob that is not a disc (the coin merged
  // with a shadow, two coins joined) shows up as a mismatch rather than as a
  // confident wrong radius.
  const agree = Math.abs(R_area - R_bbox) / R_bbox;
  return {
    best: { cx: X0 + best.cx, cy: Y0 + best.cy, R: R_area },
    bg,
    R_area: +R_area.toFixed(1),
    R_bbox: +R_bbox.toFixed(1),
    disagreePct: +(agree * 100).toFixed(1),
    circular: agree < 0.04,
    fillPct: +((best.area / (W * H)) * 100).toFixed(1),
    tag,
  };
}

// draw the fitted circle on the source so the fit can be LOOKED at (§4.3)
async function overlay(file, win, fit, out) {
  const meta = await sharp(P(file)).metadata();
  const { cx, cy, R } = fit.best;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${meta.width}" height="${meta.height}">
    <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${R.toFixed(1)}" fill="none" stroke="#ff0000" stroke-width="3"/>
    <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(R * 0.862).toFixed(1)}" fill="none" stroke="#00c0ff" stroke-width="2" stroke-dasharray="8 6"/>
    <line x1="${(cx - 12).toFixed(1)}" y1="${cy.toFixed(1)}" x2="${(cx + 12).toFixed(1)}" y2="${cy.toFixed(1)}" stroke="#ff0000" stroke-width="2"/>
    <line x1="${cx.toFixed(1)}" y1="${(cy - 12).toFixed(1)}" x2="${cx.toFixed(1)}" y2="${(cy + 12).toFixed(1)}" stroke="#ff0000" stroke-width="2"/>
  </svg>`;
  await sharp(P(file)).composite([{ input: Buffer.from(svg) }]).png()
    .toFile(new URL('./' + out, import.meta.url).pathname);
  return out;
}

// ── the valley floor of THE PHOTOGRAPH's disc interior ──────────────────────
// Two modes by peak-picking with a minimum separation, then the minimum
// between them. Everything printed so the choice can be audited.
function valley(g, D) {
  const hist = new Array(256).fill(0);
  const { d, w, h } = g;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const u = (x - D.cx) / D.R, v = (y - D.cy) / D.R;
    if (u * u + v * v <= RLOCUS * RLOCUS) hist[d[y * w + x]]++;
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
  return { Tv: v, modes: [lo, hi], atBound: v <= lo + 1 || v >= hi - 1, contrast: sm[hi] ? sm[lo] / sm[hi] : 0 };
}

// ── the motif mask ─────────────────────────────────────────────────────────
// D2's rule is "the connected component containing the centre". The centre
// PIXEL is a brittle seed — v1 of this file returned an empty mask from it —
// so the seed rule is widened and WHICH RULE FIRED IS PRINTED: the component
// containing the centre if the centre is lit, otherwise the largest component
// whose centroid lies within 0.15 R of the centre.
function maskAt(g, D, T, deviceBrighter = true) {
  const { d, w, h } = g;
  const on = new Uint8Array(N * N);
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const u = (2 * (i + 0.5)) / N - 1, v = (2 * (j + 0.5)) / N - 1;
      if (u * u + v * v > RLOCUS * RLOCUS) continue;
      const x = Math.round(D.cx + u * D.R), y = Math.round(D.cy + v * D.R);
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      const val = d[y * w + x];
      if (deviceBrighter ? val >= T : val <= T) on[j * N + i] = 1;
    }
  }
  const lab = new Int32Array(N * N).fill(-1);
  const comps = [];
  for (let s = 0; s < N * N; s++) {
    if (!on[s] || lab[s] >= 0) continue;
    const id = comps.length;
    const st = [s]; lab[s] = id;
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
  const cIdx = ((N / 2) | 0) * N + ((N / 2) | 0);
  let pick = null, rule = '';
  if (lab[cIdx] >= 0) { pick = comps[lab[cIdx]]; rule = 'centre pixel lit'; }
  else {
    const near = comps.filter((c) => Math.hypot(c.cx - N / 2, c.cy - N / 2) <= 0.15 * (N / 2));
    near.sort((a, b) => b.area - a.area);
    pick = near[0] || null;
    rule = near.length ? 'largest component with centroid within 0.15R' : 'NONE — no component near the centre';
  }
  const mask = new Uint8Array(N * N);
  if (pick) for (let k = 0; k < N * N; k++) if (lab[k] === pick.id) mask[k] = 1;
  const discPx = Math.PI * ((N / 2) * RLOCUS) ** 2;
  return { mask, area: pick ? pick.area : 0, frac: pick ? pick.area / discPx : 0, rule, nComps: comps.length };
}

const iou = (a, b) => {
  let i = 0, u = 0;
  for (let k = 0; k < a.length; k++) { const x = a[k], y = b[k]; if (x || y) u++; if (x && y) i++; }
  return u ? i / u : 0;
};

const results = [];
for (const R of REFS) {
  const g = await greyOf(P(R.file));
  const fit = fitDisc(g, R.win, R.file);
  const D = fit.best;
  const ovl = await overlay(R.file, R.win, fit, '_jd2fit-' + R.file.replace(/\.[a-z]+$/, '') + '.png');
  const val = valley(g, D);
  const pol = polarity(g, D);
  console.log(`\n=== ${R.file}  ${g.w}x${g.h}   (${R.note})`);
  console.log(`  disc: cx ${D.cx.toFixed(1)} cy ${D.cy.toFixed(1)}  R(area) ${fit.R_area}  R(bbox) ${fit.R_bbox}  disagree ${fit.disagreePct}%  ${fit.circular ? 'circular' : 'NOT CIRCULAR — FAILURE REPORT'}`);
  console.log(`  background level ${fit.bg}, coin fills ${fit.fillPct}% of the window;  overlay -> ${ovl}`);
  console.log(`  polarity: inner ${pol.inner} vs bare-field annulus ${pol.field}  ->  device is ${pol.deviceBrighter ? 'BRIGHTER (>= T)' : 'DARKER (<= T)'}`);
  console.log(`  histogram modes ${val.modes[0]} / ${val.modes[1]}, valley Tv = ${val.Tv}${val.atBound ? '  AT A MODE — FAILURE REPORT' : ''}`);
  const masks = [];
  for (let T = val.Tv - 15; T <= val.Tv + 15; T += 5) {
    const m = maskAt(g, D, T, pol.deviceBrighter);
    masks.push({ T, ...m });
    console.log(`    T=${String(T).padStart(3)}  motif ${(m.frac * 100).toFixed(2)}% of locus, ${m.nComps} comps, seed: ${m.rule}`);
  }
  let minI = 1, worst = '';
  for (let i = 0; i < masks.length; i++) for (let j = i + 1; j < masks.length; j++) {
    const v = iou(masks[i].mask, masks[j].mask);
    if (v < minI) { minI = v; worst = `T${masks[i].T} vs T${masks[j].T}`; }
  }
  console.log(`  (1) min pairwise IoU across the sweep = ${minI.toFixed(4)}  (${worst})  GATE >= 0.97 -> ${minI >= 0.97 ? 'MET' : 'NOT MET'}`);
  results.push({ file: R.file, D, Tv: val.Tv, mid: masks[(masks.length / 2) | 0], minI });
}

console.log('\n=== (2) cross-reference agreement, every pair, at each reference’s own Tv');
for (let i = 0; i < results.length; i++) {
  for (let j = i + 1; j < results.length; j++) {
    const v = iou(results[i].mid.mask, results[j].mid.mask);
    console.log(`  ${results[i].file.padEnd(28)} vs ${results[j].file.padEnd(28)} IoU ${v.toFixed(4)}  GATE >= 0.95 -> ${v >= 0.95 ? 'MET' : 'NOT MET'}`);
  }
}

// ── §4 response test ───────────────────────────────────────────────────────
// Shrink the disc radius by 5%: every mask must change, and the fraction must
// move. A number that does not move when the input does is not a measurement.
console.log('\n=== RESPONSE TEST — disc R shrunk 5% on the 2010 reference');
{
  const g = await greyOf(P(REFS[0].file));
  const fit = fitDisc(g, REFS[0].win, REFS[0].file);
  const D = fit.best;
  const val = valley(g, D);
  const pol = polarity(g, D);
  const a = maskAt(g, D, val.Tv, pol.deviceBrighter);
  const b = maskAt(g, { ...D, R: D.R * 0.95 }, val.Tv, pol.deviceBrighter);
  const moved = iou(a.mask, b.mask);
  console.log(`  motif fraction ${(a.frac * 100).toFixed(2)}% -> ${(b.frac * 100).toFixed(2)}%   mask IoU ${moved.toFixed(4)}`);
  console.log(`  ${moved < 0.99 && a.frac !== b.frac ? 'MOVED as expected — PASS' : 'DID NOT MOVE — the instrument is UNTRUSTED'}`);
}
