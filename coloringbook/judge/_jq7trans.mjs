// ROUND 7, QUARTER OBVERSE — TRANSECTS across the wig, in viewBox units.
//
// WHY THIS EXISTS. `_jq7prof.mjs` measures a width perpendicular to one of OUR
// centrelines, searching +-2.0 viewBox units for the coin's feature. It failed
// its own response test — 7 of 25 marks tracked a 1.5-unit displacement, the
// rest jumped — and the reason is a number nobody had measured: the PITCH of
// the coin's wig rolls. If the pitch is smaller than the search window, the
// window contains more than one roll and the extremum finder is free to pick a
// different one after any displacement. A confident answer to the wrong
// question, spec 4.3, produced by an instrument that would have passed a naive
// response test on a synthetic ridge.
//
// So: measure the pitch first, off the photograph, with no reference to our
// drawing at all. A transect is a straight line laid across the rolls; the
// profile along it is a train of dark cuts and bright ridges, and its minima
// give the pitch and its half-depth crossings give each cut's width.
//
// §4.1 the transect's endpoints are printed; a peak found at either end is
//      reported as an end effect and excluded from the pitch statistics.
// §4.3 every transect is drawn on the source (`_jq7trans-<ref>.png`) and looked
//      at, so a transect that is running ALONG a roll instead of across it is
//      visible rather than averaged in.
//
// Run: node coloringbook/judge/_jq7trans.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const FITS = JSON.parse(readFileSync('coloringbook/judge/_jq7fit.json'));
const DISC = {
  'quarter-obv-1932ngc.jpg': FITS['quarter-obv-1932ngc.jpg'],
  'quarter-obv-2.jpg': { cx: 374.41, cy: 374.36, R: 373.67 },
  'quarter-obv-4.jpg': FITS['quarter-obv-4.jpg'],
};
const REFS = Object.keys(DISC);

// TRANSECTS, in viewBox units, chosen to run roughly NORMAL to the wig rolls.
// Our own grooves run from screen (72.1, 46.3) to (56.1, 40.2) and parallel —
// direction (-16.0, -6.1), so the normal is (6.1, -16.0) normalised, i.e. very
// nearly straight up the screen and tilted 21 deg forward. These four cross the
// wig at four heights and are stated as literals here, NOT derived from our art
// beyond that one direction; each is drawn on the source and looked at.
const TRANSECTS = [
  { name: 'T1 front of wig', a: { x: 55.0, y: 46.0 }, b: { x: 45.6, y: 21.6 } },
  { name: 'T2 mid wig', a: { x: 62.0, y: 49.5 }, b: { x: 52.6, y: 25.1 } },
  { name: 'T3 back of wig', a: { x: 69.0, y: 51.0 }, b: { x: 59.6, y: 26.6 } },
  { name: 'T4 occiput', a: { x: 75.0, y: 50.0 }, b: { x: 65.6, y: 25.6 } },
];

async function load(f) {
  const D = DISC[f];
  const upp = D.R / 47;
  const { data, info } = await sharp(`coloringbook/ref/${f}`).greyscale().blur(Math.max(0.6, 0.08 * upp)).raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const at = (x, y) => {
    if (x < 0 || y < 0 || x >= W - 1 || y >= H - 1) return null;
    const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, i = y0 * W + x0;
    return data[i] * (1 - fx) * (1 - fy) + data[i + 1] * fx * (1 - fy)
      + data[i + W] * (1 - fx) * fy + data[i + W + 1] * fx * fy;
  };
  return { f, D, upp, W, H,
    sample: (vx, vy) => at(D.cx + (D.R * (vx - 50)) / 47, D.cy + (D.R * (vy - 50)) / 47) };
}

const STEP = 0.05;    // viewBox units along the transect

function profile(img, t) {
  const L = Math.hypot(t.b.x - t.a.x, t.b.y - t.a.y);
  const ux = (t.b.x - t.a.x) / L, uy = (t.b.y - t.a.y) / L;
  const p = [];
  for (let s = 0; s <= L; s += STEP) {
    const v = img.sample(t.a.x + ux * s, t.a.y + uy * s);
    if (v === null) return null;
    p.push({ s, v });
  }
  return { p, L };
}

// local minima (cuts) and maxima (ridges), with prominence, and the full width
// at half prominence for each minimum.
function extrema(p, win) {
  const n = p.length, k = Math.round(win / STEP);
  const mins = [], maxs = [];
  for (let i = k; i < n - k; i++) {
    let isMin = true, isMax = true;
    for (let j = i - k; j <= i + k; j++) {
      if (p[j].v < p[i].v - 1e-9) isMin = false;
      if (p[j].v > p[i].v + 1e-9) isMax = false;
    }
    if (isMin) mins.push(i);
    if (isMax) maxs.push(i);
  }
  const dedupe = (a) => a.filter((i, x) => x === 0 || i - a[x - 1] > k);
  return { mins: dedupe(mins), maxs: dedupe(maxs) };
}

function cutWidths(p, mins, maxs) {
  const out = [];
  for (const i of mins) {
    const lm = [...maxs].filter((j) => j < i).pop();
    const rm = maxs.find((j) => j > i);
    if (lm === undefined || rm === undefined) continue;   // §4.1 end effect
    const shoulder = Math.min(p[lm].v, p[rm].v);
    const prom = shoulder - p[i].v;
    if (prom < 6) continue;
    const half = p[i].v + prom / 2;
    let a = i; while (a > lm && p[a - 1].v < half) a--;
    let b = i; while (b < rm && p[b + 1].v < half) b++;
    if (a === lm || b === rm) continue;
    out.push({ at: p[i].s, w: p[b].s - p[a].s, prom, depth: p[i].v, shoulder });
  }
  return out;
}

const med = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
const f2 = (v, d = 2) => (v === null ? '  -  ' : v.toFixed(d).padStart(5));

console.log('### _jq7trans — wig roll PITCH and CUT WIDTH, measured on the photograph');
console.log(`### step ${STEP} viewBox units; a minimum with no maximum on both sides is an end effect and dropped`);
console.log('');
const ALL = {};
for (const f of REFS) {
  const img = await load(f);
  console.log(`## ${f}  (disc R ${img.D.R}, ${(img.upp).toFixed(2)} px per viewBox unit, blur sigma ${(0.08 * img.upp).toFixed(2)} px)`);
  ALL[f] = {};
  for (const t of TRANSECTS) {
    const pr = profile(img, t);
    if (!pr) { console.log(`  ${t.name}: off image`); continue; }
    const { mins, maxs } = extrema(pr.p, 0.45);
    const cuts = cutWidths(pr.p, mins, maxs);
    const pitch = [];
    for (let i = 1; i < mins.length; i++) pitch.push(pr.p[mins[i]].s - pr.p[mins[i - 1]].s);
    ALL[f][t.name] = { cuts, pitch };
    console.log(`  ${t.name.padEnd(16)} (${t.a.x},${t.a.y})->(${t.b.x},${t.b.y}) len ${pr.L.toFixed(1)}u:  ${mins.length} minima, ${cuts.length} scored cuts`);
    console.log(`      pitch median ${f2(med(pitch))} u  (all: ${pitch.map((x) => x.toFixed(2)).join(' ')})`);
    console.log(`      cut widths at half prominence: ${cuts.map((c) => c.w.toFixed(2)).join(' ')}   median ${f2(med(cuts.map((c) => c.w)))} u`);
    console.log(`      prominences: ${cuts.map((c) => c.prom.toFixed(0)).join(' ')}   median ${f2(med(cuts.map((c) => c.prom)), 1)} grey`);
    console.log(`      positions along transect (u from a): ${cuts.map((c) => c.at.toFixed(1)).join(' ')}`);
  }
  // §4.3 overlay
  const sc = img.D.R / 373.67;
  const toPx = (p) => ({ x: img.D.cx + (img.D.R * (p.x - 50)) / 47, y: img.D.cy + (img.D.R * (p.y - 50)) / 47 });
  const parts = TRANSECTS.map((t) => {
    const A = toPx(t.a), B = toPx(t.b);
    return `<path d="M ${A.x.toFixed(1)} ${A.y.toFixed(1)} L ${B.x.toFixed(1)} ${B.y.toFixed(1)}" stroke="#ff0000" stroke-width="${2.5 * sc}"/>`
      + `<text x="${(A.x + 4 * sc).toFixed(1)}" y="${(A.y + 14 * sc).toFixed(1)}" font-family="monospace" font-size="${(16 * sc).toFixed(0)}" fill="#ff0000">${t.name}</text>`;
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.W}" height="${img.H}">${parts.join('')}</svg>`;
  await sharp(`coloringbook/ref/${f}`).composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).png()
    .toFile(`coloringbook/judge/_jq7trans-${f.replace(/\..*/, '')}.png`);
  console.log('');
}
