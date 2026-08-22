// ROUND 9 (relief/edge), QUARTER OBVERSE — OUR wig and the COIN's wig measured
// by the SAME method, on the SAME lines, in the same units.
//
// WHY THIS EXISTS. Round 8's headline comparison is `stroke-width 2.4-2.6`
// against `cut width 0.25-0.55 at half prominence`. Those are not the same
// quantity: the first is an authoring parameter, the second is a full width at
// half prominence read off a photograph. Before a round spends its budget on a
// 7x ratio it should check the ratio is between two of the same thing. So this
// runs the half-prominence width finder over OUR OWN RENDER as well as over the
// three references, on identical lines.
//
// THE LINES. Round 8's four transects are kept verbatim (they are the frozen
// ones) and three more are added, laid NORMAL TO OUR OWN GROOVE DIRECTION so
// that our marks cannot be missed. Our grooves run screen (-15.97, -2.74), so
// the normal is (0.169, -0.985). C1..C3 are stated as literals below.
//
// §6.1 these three lines are a locus for a DESCRIPTION of our own drawing and
//      of the coin side by side; no ratio scored against a frozen target is
//      taken here. The frozen T1..T4 remain the comparison of record.
// §4.1 the half-prominence search is bounded by the bracketing maxima; a cut
//      whose half-crossing reaches a bracketing maximum is DROPPED and counted,
//      never reported as a width.
// §4.3 every line is drawn on every image it is measured on — three references
//      and our own render — and the sheet is looked at.
//
// Run: node coloringbook/judge/_jw14cross.mjs [tag]
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const FITS = JSON.parse(readFileSync('coloringbook/judge/_jw14fitcheck.json', 'utf8'));
const DISC = FITS.disc;
const REFS = Object.keys(DISC);
const TAG = process.argv[2] || 'now';

const TRANSECTS = [
  { name: 'T1 front of wig', a: { x: 55.0, y: 46.0 }, b: { x: 45.6, y: 21.6 } },
  { name: 'T2 mid wig', a: { x: 62.0, y: 49.5 }, b: { x: 52.6, y: 25.1 } },
  { name: 'T3 back of wig', a: { x: 69.0, y: 51.0 }, b: { x: 59.6, y: 26.6 } },
  { name: 'T4 occiput', a: { x: 75.0, y: 50.0 }, b: { x: 65.6, y: 25.6 } },
  { name: 'C1 our normal lo', a: { x: 57.0, y: 46.0 }, b: { x: 61.7, y: 18.4 } },
  { name: 'C2 our normal mid', a: { x: 62.0, y: 48.0 }, b: { x: 66.7, y: 20.4 } },
  { name: 'C3 our normal hi', a: { x: 66.5, y: 49.0 }, b: { x: 71.2, y: 21.4 } },
];

const STEP = 0.05, WIN = 0.45, PROM = 6;

const bil = (data, W, H) => (x, y) => {
  if (x < 0 || y < 0 || x >= W - 1 || y >= H - 1) return null;
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, i = y0 * W + x0;
  return data[i] * (1 - fx) * (1 - fy) + data[i + 1] * fx * (1 - fy)
    + data[i + W] * (1 - fx) * fy + data[i + W + 1] * fx * fy;
};

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
function cuts(p, mins, maxs) {
  const out = []; let dropped = 0;
  for (const i of mins) {
    const lm = [...maxs].filter((j) => j < i).pop();
    const rm = maxs.find((j) => j > i);
    if (lm === undefined || rm === undefined) { dropped++; continue; }
    const shoulder = Math.min(p[lm].v, p[rm].v);
    const prom = shoulder - p[i].v;
    if (prom < PROM) continue;
    const half = p[i].v + prom / 2;
    let a = i; while (a > lm && p[a - 1].v < half) a--;
    let b = i; while (b < rm && p[b + 1].v < half) b++;
    if (a === lm || b === rm) { dropped++; continue; }   // §4.1 at the bracket bound
    out.push({ at: p[i].s, w: p[b].s - p[a].s, prom });
  }
  return { out, dropped };
}
// THE RIDGES, by the same rule with the sign flipped. A wig is not a train of
// cuts on a flat ground; it is cuts AND lit roll tops AND the untouched mass
// between them, and a round that balances only the dark half can move the whole
// error into the light half without the dark-side numbers noticing. So the
// bright bands get the identical treatment: bracketing minima, prominence
// floor, full width at half prominence, and a duty cycle of their own.
function ridges(p, mins, maxs) {
  const out = []; let dropped = 0;
  for (const i of maxs) {
    const lm = [...mins].filter((j) => j < i).pop();
    const rm = mins.find((j) => j > i);
    if (lm === undefined || rm === undefined) { dropped++; continue; }
    const shoulder = Math.max(p[lm].v, p[rm].v);
    const prom = p[i].v - shoulder;
    if (prom < PROM) continue;
    const half = p[i].v - prom / 2;
    let a = i; while (a > lm && p[a - 1].v > half) a--;
    let b = i; while (b < rm && p[b + 1].v > half) b++;
    if (a === lm || b === rm) { dropped++; continue; }
    out.push({ at: p[i].s, w: p[b].s - p[a].s, prom });
  }
  return { out, dropped };
}

const med = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
const f2 = (v, d = 2) => (v === null ? '  -  ' : v.toFixed(d).padStart(5));

async function refSampler(f) {
  const D = DISC[f], upp = D.R / 47;
  const { data, info } = await sharp(`coloringbook/ref/${f}`).greyscale()
    .blur(Math.max(0.6, 0.08 * upp)).raw().toBuffer({ resolveWithObject: true });
  const at = bil(data, info.width, info.height);
  return { sample: (vx, vy) => at(D.cx + (D.R * (vx - 50)) / 47, D.cy + (D.R * (vy - 50)) / 47), upp,
    toPx: (vx, vy) => [D.cx + (D.R * (vx - 50)) / 47, D.cy + (D.R * (vy - 50)) / 47], W: info.width, H: info.height, src: `coloringbook/ref/${f}` };
}
async function oursSampler(px, mod) {
  const svg = mod.coinSVG('quarter', px, { side: 'obverse' });
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  const { data, info } = await sharp(buf).greyscale().raw().toBuffer({ resolveWithObject: true });
  const ppu = info.width / 100;
  const at = bil(data, info.width, info.height);
  return { sample: (vx, vy) => at(vx * ppu, vy * ppu), upp: ppu,
    toPx: (vx, vy) => [vx * ppu, vy * ppu], W: info.width, H: info.height, buf };
}

async function run(label, img) {
  console.log(`## ${label}   ${img.upp.toFixed(2)} px per viewBox unit`);
  const rows = {};
  for (const t of TRANSECTS) {
    const pr = profile(img.sample, t);
    if (!pr) { console.log(`   ${t.name}: off image`); continue; }
    const { mins, maxs } = extrema(pr.p, WIN);
    const { out, dropped } = cuts(pr.p, mins, maxs);
    const pitch = [];
    for (let i = 1; i < mins.length; i++) pitch.push(pr.p[mins[i]].s - pr.p[mins[i - 1]].s);
    // DUTY CYCLE — the fraction of the cut field that is cut. This is the one
    // quantity that survives to every draw size: at 84 px the coin's cuts are
    // 0.3 device px and unresolvable, so all that reaches the child is the mean
    // tone, and the mean tone of a cut train is set by its duty cycle. Measured
    // as (sum of half-prominence widths) / (span from the first cut to the
    // last), so it is independent of where the line was started and stopped.
    const span = out.length > 1 ? out[out.length - 1].at - out[0].at : NaN;
    const duty = out.reduce((a, c) => a + c.w, 0) / span;
    const R = ridges(pr.p, mins, maxs);
    const rspan = R.out.length > 1 ? R.out[R.out.length - 1].at - R.out[0].at : NaN;
    const rduty = R.out.reduce((a, c) => a + c.w, 0) / rspan;
    rows[t.name] = { n: out.length, pitch: med(pitch), w: med(out.map((c) => c.w)), duty, rduty,
      rw: med(R.out.map((c) => c.w)) };
    console.log(`   ${t.name.padEnd(18)} ${String(out.length).padStart(2)} cuts (${dropped} dropped at bound)  `
      + `pitch ${f2(med(pitch))}u  FWHP ${f2(med(out.map((c) => c.w)))}u  duty ${f2(duty, 3)}  `
      + `| ${String(R.out.length).padStart(2)} ridges (${R.dropped} dropped) FWHP ${f2(med(R.out.map((c) => c.w)))}u duty ${f2(rduty, 3)}`);
  }
  const ds = Object.values(rows).map((r) => r.duty).filter((x) => Number.isFinite(x));
  const rs = Object.values(rows).map((r) => r.rduty).filter((x) => Number.isFinite(x));
  const rws = Object.values(rows).map((r) => r.rw).filter((x) => Number.isFinite(x));
  console.log(`   -> CUT duty median ${f2(med(ds), 3)} over ${ds.length} lines | `
    + `RIDGE duty median ${f2(med(rs), 3)} FWHP ${f2(med(rws))}u over ${rs.length} lines`);
  return rows;
}

// §4.3 overlay
async function overlay(img, name) {
  // dimensions from the FILE, not from the raw buffer: a JPEG with an EXIF
  // orientation tag is auto-rotated on decode and the two disagree.
  const base = sharp(img.src ? img.src : img.buf);
  const meta = await base.metadata();
  img = { ...img, W: meta.width, H: meta.height };
  const sc = img.W / 750;
  const parts = TRANSECTS.map((t, i) => {
    const [ax, ay] = img.toPx(t.a.x, t.a.y), [bx, by] = img.toPx(t.b.x, t.b.y);
    const col = i < 4 ? '#ff2020' : '#00c0ff';
    return `<path d="M ${ax.toFixed(1)} ${ay.toFixed(1)} L ${bx.toFixed(1)} ${by.toFixed(1)}" stroke="${col}" stroke-width="${(2 * sc).toFixed(2)}" fill="none"/>`
      + `<text x="${(ax + 3 * sc).toFixed(1)}" y="${(ay + 12 * sc).toFixed(1)}" font-family="monospace" font-size="${Math.max(8, 11 * sc).toFixed(0)}" fill="${col}">${t.name.slice(0, 2)}</text>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.W}" height="${img.H}">${parts}</svg>`;
  // composite THEN resize, in two pipelines: sharp resizes before compositing,
  // so a single chain shrinks the base under a full-size overlay and throws.
  const drawn = await sharp(img.src ? img.src : img.buf)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).png().toBuffer();
  await sharp(drawn).resize({ width: Math.min(900, img.W), kernel: 'lanczos3' }).png()
    .toFile(`coloringbook/judge/_jw14cross-${name}-${TAG}.png`);
  console.log(`   overlay -> _jw14cross-${name}-${TAG}.png`);
}

const B = await import('../../src/art/coins.js');
console.log('### _jw14cross — same method, same lines, ours and the coin');
console.log(`### step ${STEP}u  window ${WIN}u  prominence floor ${PROM} grey`);
console.log('### T1..T4 are round 8\'s frozen transects; C1..C3 are normal to OUR groove direction.\n');
for (const f of REFS) { const img = await refSampler(f); await run(f, img); await overlay(img, f.replace(/\..*/, '')); console.log(''); }
{
  const img = await oursSampler(2126, B);
  await run('OURS quarter obverse @2126px (21.26 px/u)', img);
  await overlay(img, 'ours');
}
