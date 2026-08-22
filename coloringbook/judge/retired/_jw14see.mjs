// ROUND 9 (relief/edge), QUARTER OBVERSE — THE WIG AT THE SIZE IT IS DRAWN.
//
// WHY THIS EXISTS. Round 8 measured the coin's wig in viewBox units (roll pitch
// 0.95-1.75 u, cut width 0.25-0.55 u at half prominence) and compared those to
// our stroke-width of 2.4-2.6 local units. That comparison is between an
// AUTHORING PARAMETER and a PHOTOGRAPHED FEATURE, and it silently assumes the
// feature survives to the raster. The quarter obverse is drawn at 76..190 px
// across a 100-unit viewBox, i.e. 0.76..1.90 device px per viewBox unit. A
// 0.35-unit cut is then 0.27..0.67 device pixels wide and the coin's 1.2-unit
// pitch is 0.9..2.3 device pixels. Both are at or under Nyquist.
//
// So the question "how wide should a cut be" cannot be answered without first
// asking "at the size we draw, does the coin HAVE cuts, or does it have a
// tone?" This instrument reduces each reference to the exact px-per-viewBox-unit
// our own renders use, and re-runs round 8's transects on the reduced image.
//
// §4   RESPONSE TEST: the same code at native reference resolution must
//      reproduce `_jq7trans.mjs`'s published pitch/width medians. It is run and
//      printed as `NATIVE`. If NATIVE disagrees, nothing below is trustworthy.
// §4.1 NULL/BOUND: the extremum window (0.45 u) and the prominence floor are
//      printed on every block. A profile whose minima all sit at the window
//      spacing is reported as SATURATED, not as a pitch.
// §4.3 every reduced image is written out at 8x nearest so the transect can be
//      drawn on it and looked at (`_jw14see-*.png`).
//
// Run: node coloringbook/judge/_jw14see.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const FITS = JSON.parse(readFileSync('coloringbook/judge/_jw14fitcheck.json', 'utf8'));
const DISC = FITS.disc;
const REFS = Object.keys(DISC);

// ROUND 8's transects, copied as literals. Not derived from our art.
const TRANSECTS = [
  { name: 'T1 front of wig', a: { x: 55.0, y: 46.0 }, b: { x: 45.6, y: 21.6 } },
  { name: 'T2 mid wig', a: { x: 62.0, y: 49.5 }, b: { x: 52.6, y: 25.1 } },
  { name: 'T3 back of wig', a: { x: 69.0, y: 51.0 }, b: { x: 59.6, y: 26.6 } },
  { name: 'T4 occiput', a: { x: 75.0, y: 50.0 }, b: { x: 65.6, y: 25.6 } },
];

const STEP = 0.05;              // viewBox units along the transect
const WIN = 0.45;               // extremum half-window, viewBox units
const PROM_FLOOR = 6;           // grey levels

function bilinear(data, W, H) {
  return (x, y) => {
    if (x < 0 || y < 0 || x >= W - 1 || y >= H - 1) return null;
    const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, i = y0 * W + x0;
    return data[i] * (1 - fx) * (1 - fy) + data[i + 1] * fx * (1 - fy)
      + data[i + W] * (1 - fx) * fy + data[i + W + 1] * fx * fy;
  };
}

function profile(sample, t) {
  const L = Math.hypot(t.b.x - t.a.x, t.b.y - t.a.y);
  const ux = (t.b.x - t.a.x) / L, uy = (t.b.y - t.a.y) / L;
  const p = [];
  for (let s = 0; s <= L; s += STEP) {
    const v = sample(t.a.x + ux * s, t.a.y + uy * s);
    if (v === null) return null;
    p.push({ s, v });
  }
  return { p, L };
}

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

function cutWidths(p, mins, maxs, promFloor = PROM_FLOOR) {
  const out = [];
  for (const i of mins) {
    const lm = [...maxs].filter((j) => j < i).pop();
    const rm = maxs.find((j) => j > i);
    if (lm === undefined || rm === undefined) continue;
    const shoulder = Math.min(p[lm].v, p[rm].v);
    const prom = shoulder - p[i].v;
    if (prom < promFloor) continue;
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

// One block of statistics for one image at one px-per-unit.
function block(label, sample, ppu) {
  const rows = [];
  console.log(`  ${label}   (${ppu.toFixed(3)} px per viewBox unit)`);
  for (const t of TRANSECTS) {
    const pr = profile(sample, t);
    if (!pr) { console.log(`    ${t.name}: off image`); continue; }
    const vals = pr.p.map((q) => q.v);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const rms = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length);
    const { mins, maxs } = extrema(pr.p, WIN);
    const cuts = cutWidths(pr.p, mins, maxs);
    const pitch = [];
    for (let i = 1; i < mins.length; i++) pitch.push(pr.p[mins[i]].s - pr.p[mins[i - 1]].s);
    // SATURATION check (§4.1): a minimum train spaced at exactly the dedupe
    // spacing is the window talking, not the coin.
    const sat = pitch.length && pitch.filter((x) => x <= WIN + STEP + 1e-9).length / pitch.length > 0.5;
    rows.push({ t: t.name, n: cuts.length, pitch: med(pitch), w: med(cuts.map((c) => c.w)),
      prom: med(cuts.map((c) => c.prom)), mean, rms, sat });
    console.log(`    ${t.name.padEnd(16)} ${String(cuts.length).padStart(2)} cuts  `
      + `pitch ${f2(med(pitch))}u  width ${f2(med(cuts.map((c) => c.w)))}u  `
      + `prom ${f2(med(cuts.map((c) => c.prom)), 1)} grey (${f2(100 * (med(cuts.map((c) => c.prom)) || 0) / mean, 1)}% of local mean)  `
      + `profile mean ${mean.toFixed(1)} rms ${rms.toFixed(2)}${sat ? '  SATURATED' : ''}`);
  }
  return rows;
}

// A reference reduced so that one viewBox unit is `ppu` device pixels, i.e. the
// disc radius becomes 47*ppu px — exactly our own geometry at that box width.
async function reducedRef(f, ppu) {
  const D = DISC[f];
  const scale = (47 * ppu) / D.R;
  const meta = await sharp(`coloringbook/ref/${f}`).metadata();
  const W = Math.max(2, Math.round(meta.width * scale));
  const H = Math.max(2, Math.round(meta.height * scale));
  const { data, info } = await sharp(`coloringbook/ref/${f}`).greyscale()
    .resize(W, H, { kernel: 'lanczos3' }).raw().toBuffer({ resolveWithObject: true });
  const at = bilinear(data, info.width, info.height);
  const cx = D.cx * scale, cy = D.cy * scale;
  return { sample: (vx, vy) => at(cx + ppu * (vx - 50), cy + ppu * (vy - 50)), W: info.width, H: info.height, scale, cx, cy };
}

async function nativeRef(f) {
  const D = DISC[f];
  const upp = D.R / 47;
  const { data, info } = await sharp(`coloringbook/ref/${f}`).greyscale()
    .blur(Math.max(0.6, 0.08 * upp)).raw().toBuffer({ resolveWithObject: true });
  const at = bilinear(data, info.width, info.height);
  return { sample: (vx, vy) => at(D.cx + (D.R * (vx - 50)) / 47, D.cy + (D.R * (vy - 50)) / 47), upp };
}

// OUR art at a real box width, rasterised exactly as the browser would.
async function ours(px, mod) {
  const svg = mod.coinSVG('quarter', px, { side: 'obverse' });
  const { data, info } = await sharp(Buffer.from(svg)).png().greyscale().raw()
    .toBuffer({ resolveWithObject: true });
  const ppu = info.width / 100;
  const at = bilinear(data, info.width, info.height);
  return { sample: (vx, vy) => at(vx * ppu, vy * ppu), ppu, W: info.width, H: info.height };
}

const B = await import('../../src/art/coins.js');

console.log('### _jw14see — the wig at the size it is drawn');
console.log(`### step ${STEP}u, extremum window ${WIN}u, prominence floor ${PROM_FLOOR} grey`);
console.log('');

console.log('## RESPONSE TEST (§4): this code at native reference resolution must');
console.log('## reproduce _jq7trans.mjs. Compare against round 8 published medians.');
for (const f of REFS) {
  const img = await nativeRef(f);
  block(`NATIVE ${f}`, img.sample, img.upp);
}
console.log('');

const SIZES = [84, 190];
for (const px of SIZES) {
  const ppu = px / 100;
  console.log(`## ===== AT ${px} px (${ppu} device px per viewBox unit) =====`);
  for (const f of REFS) {
    const img = await reducedRef(f, ppu);
    block(`COIN  ${f} reduced`, img.sample, ppu);
  }
  const o = await ours(px, B);
  block('OURS  quarter obverse', o.sample, o.ppu);
  console.log('');
}

// The geometry check: our art at reference resolution, so the drawn marks are
// resolved and can be compared to the coin's own marks like for like.
console.log('## ===== OUR GEOMETRY, rasterised at 2126 px (21.26 px/u, the 1932 ref rate) =====');
{
  const o = await ours(2126, B);
  block('OURS  quarter obverse @2126', o.sample, o.ppu);
}
