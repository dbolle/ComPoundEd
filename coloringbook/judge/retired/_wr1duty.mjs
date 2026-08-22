// ROUND 10 (specialist), QUARTER OBVERSE — THE GENERATOR for the lit-roll
// width question. Does narrowing `RELIEF.Washington.base` move RIDGE duty
// toward the coin's band or away from it?
//
// WHY IT EXISTS. The brief inherits two statements that cannot both be true:
//   (a) ours reads ridge duty 0.348, the coin reads 0.350-0.443, so we sit
//       just BELOW the band; and
//   (b) round 9's unshipped "variant B" narrowed the lit rolls to 0.92 and
//       reported ridge duty CLOSER to the coin.
// Narrowing a bright band should shrink its full-width-at-half-prominence and
// push ridge duty DOWN, i.e. further below the band. This script settles it by
// sweeping the width and printing the curve, rather than testing one point.
//
// METHOD. The profile / extrema / cuts / ridges functions are COPIED VERBATIM
// from `_jw14cross.mjs` (frozen, hash 4d2d...; not imported, because that
// module runs its whole report at import time — Appendix R4's rule about
// side-effecting instruments applies to live ones too). Equivalence is proved
// rather than asserted: run with no argument and the shipped-art row must
// reproduce `_jw14cross.mjs`'s published OURS line to the last digit
// (CUT duty median 0.322, RIDGE duty median 0.348, FWHP 0.90u). That identity
// is printed as SELFTEST and a mismatch is a failure report, not a value.
//
// §4   RESPONSE: the sweep IS the response test — the number must move, and it
//      must move monotonically in the direction geometry predicts.
// §4.1 NULL: every line prints its ridge count and how many candidates were
//      dropped at a bracketing bound. A duty computed from fewer than 3 ridges
//      is printed with a `!` and is a failure report, not a value.
// §4.2 SELECTION: the median over lines is printed with the WHOLE per-line set
//      beside it, so a median resting on three numbers is visible as such.
// §6.1 LOCUS: the seven lines are `_jw14cross.mjs`'s frozen literals, unchanged.
//      Nothing here is computed from our own drawing.
//
// Run: node coloringbook/judge/_wr1duty.mjs [w1,w2,...]
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const FITS = JSON.parse(readFileSync('coloringbook/judge/_jw14fitcheck.json', 'utf8'));
const DISC = FITS.disc;

// ---- verbatim from _jw14cross.mjs -----------------------------------------
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
    if (a === lm || b === rm) { dropped++; continue; }
    out.push({ at: p[i].s, w: p[b].s - p[a].s, prom });
  }
  return { out, dropped };
}
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
const f2 = (v, d = 2) => (v === null || !Number.isFinite(v) ? '  -  ' : v.toFixed(d).padStart(5));
// ---- end verbatim ----------------------------------------------------------

// THE FIVE LIT ROLLS, by their literal path data, so the substitution can never
// hit a groove or a face light by accident. Widths as shipped.
const ROLLS = [
  ['M -8.6 -22.8 C -6 -23.6 -3 -23.7 3.3 -22.6', '1.9'],
  ['M -13.4 -21 C -10 -21.9 -6 -21.9 0.9 -20.5', '1.9'],
  ['M -16.6 -17.2 C -13.4 -17.8 -10.2 -18.4 -5.0 -19.2', '1.8'],
  ['M -20 -12.4 C -16.4 -13.2 -12.4 -14.0 -5.3 -15.4', '1.1'],
  ['M -21.8 -3.2 C -18.4 -4.2 -14.4 -5.6 -7.5 -7.6', '1.1'],
];
const SRC = readFileSync('src/art/coins.js', 'utf8');
mkdirSync('coloringbook/_pv/wr1', { recursive: true });

async function moduleAt(width) {
  if (width === null) return import('../../src/art/coins.js');
  let s = SRC;
  for (const [d, w] of ROLLS) {
    const from = `<path d="${d}" fill="none" stroke-width="${w}"/>`;
    const to = `<path d="${d}" fill="none" stroke-width="${width}"/>`;
    if (!s.includes(from)) throw new Error(`SUBSTITUTION MISS — not found: ${from}`);
    s = s.replace(from, to);
  }
  // the copy lives beside the original's own relative imports, rewritten to
  // absolute-from-here, so the only difference from the shipped module is the
  // five stroke widths.
  s = s.replace("from '../engine/money.js'", "from '../../../src/engine/money.js'");
  const f = `coloringbook/_pv/wr1/coins-${String(width).replace('.', 'p')}.js`;
  writeFileSync(f, s);
  return import(`../_pv/wr1/coins-${String(width).replace('.', 'p')}.js`);
}

async function oursSampler(px, mod) {
  const svg = mod.coinSVG('quarter', px, { side: 'obverse' });
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  const { data, info } = await sharp(buf).greyscale().raw().toBuffer({ resolveWithObject: true });
  const ppu = info.width / 100;
  return { sample: (vx, vy) => at(data, info, vx * ppu, vy * ppu), upp: ppu, buf };
  function at(d, i, x, y) { return bil(d, i.width, i.height)(x, y); }
}

async function measure(width, verbose) {
  const mod = await moduleAt(width);
  const img = await oursSampler(2126, mod);
  const rows = [];
  for (const t of TRANSECTS) {
    const pr = profile(img.sample, t);
    if (!pr) { rows.push({ t, off: true }); continue; }
    const { mins, maxs } = extrema(pr.p, WIN);
    const C = cuts(pr.p, mins, maxs);
    const cspan = C.out.length > 1 ? C.out[C.out.length - 1].at - C.out[0].at : NaN;
    const duty = C.out.reduce((a, c) => a + c.w, 0) / cspan;
    const R = ridges(pr.p, mins, maxs);
    const rspan = R.out.length > 1 ? R.out[R.out.length - 1].at - R.out[0].at : NaN;
    const rduty = R.out.reduce((a, c) => a + c.w, 0) / rspan;
    rows.push({ t, nc: C.out.length, cdrop: C.dropped, duty, cw: med(C.out.map((c) => c.w)),
      nr: R.out.length, rdrop: R.dropped, rduty, rw: med(R.out.map((c) => c.w)),
      rsum: R.out.reduce((a, c) => a + c.w, 0), rspan });
    if (verbose) {
      console.log(`   ${t.name.padEnd(18)} ${String(rows.at(-1).nc).padStart(2)} cuts (${C.dropped} dropped at bound)  `
        + `FWHP ${f2(rows.at(-1).cw)}u  duty ${f2(duty, 3)}  `
        + `| ${String(R.out.length).padStart(2)} ridges${R.out.length < 3 ? '!' : ' '}(${R.dropped} dropped) `
        + `FWHP ${f2(med(R.out.map((c) => c.w)))}u  sum ${f2(rows.at(-1).rsum)}u  span ${f2(rspan)}u  duty ${f2(rduty, 3)}`);
    }
  }
  const ds = rows.map((r) => r.duty).filter((x) => Number.isFinite(x));
  const rs = rows.map((r) => r.rduty).filter((x) => Number.isFinite(x));
  const rws = rows.map((r) => r.rw).filter((x) => Number.isFinite(x));
  return { rows, cutMed: med(ds), nCut: ds.length, ridgeMed: med(rs), nRidge: rs.length,
    ridgeFWHP: med(rws), perLine: rs };
}

console.log('### _wr1duty — RIDGE duty against lit-roll stroke width, quarter obverse @2126px');
console.log(`### method copied verbatim from _jw14cross.mjs: step ${STEP}u window ${WIN}u prominence ${PROM} grey`);
console.log('### locus: _jw14cross.mjs\'s seven frozen lines, unchanged.\n');
console.log('## SHIPPED ART (per line) — this must reproduce _jw14cross.mjs\'s OURS block exactly');
const base = await measure(null, true);
const ok = base.cutMed.toFixed(3) === '0.322' && base.ridgeMed.toFixed(3) === '0.348' && base.ridgeFWHP.toFixed(2) === '0.90';
console.log(`   -> CUT duty median ${f2(base.cutMed, 3)} over ${base.nCut} lines | RIDGE duty median `
  + `${f2(base.ridgeMed, 3)} FWHP ${f2(base.ridgeFWHP)}u over ${base.nRidge} lines`);
console.log(`SELFTEST  reproduces _jw14cross.mjs OURS (0.322 / 0.348 / 0.90u): ${ok ? 'OK' : 'FAIL — this is a failure report, not a value'}\n`);

const SWEEP = (process.argv[2] || '1.9,1.6,1.4,1.2,1.1,1.0,0.92,0.8,0.6,0.4').split(',').map(Number);
console.log('## SWEEP — every lit roll set to ONE width (the shipped set is 1.9/1.9/1.8/1.1/1.1)');
console.log('   w      RIDGE duty  (per line C1 C2 C3)      ridge FWHP   n lines   CUT duty   coin band 0.350-0.443');
const res = [];
for (const w of SWEEP) {
  const m = await measure(w, false);
  res.push({ w, m });
  const inband = m.ridgeMed >= 0.350 && m.ridgeMed <= 0.443;
  console.log(`   ${w.toFixed(2)}   ${f2(m.ridgeMed, 3)}      (${m.perLine.map((x) => x.toFixed(3)).join(' ')})`
    .padEnd(62) + `${f2(m.ridgeFWHP)}u       ${m.nRidge}       ${f2(m.cutMed, 3)}    ${inband ? 'IN BAND' : (m.ridgeMed < 0.350 ? 'below' : 'above')}`);
}
console.log('\n## direction of travel, from the shipped 1.9/1.9/1.8/1.1/1.1 at ridge duty '
  + `${base.ridgeMed.toFixed(3)}:`);
for (const { w, m } of res) {
  const d = m.ridgeMed - base.ridgeMed;
  const near = Math.abs(m.ridgeMed - 0.350) < Math.abs(base.ridgeMed - 0.350);
  console.log(`   w ${w.toFixed(2)}  ridge duty ${m.ridgeMed.toFixed(3)}  d ${(d >= 0 ? '+' : '')}${d.toFixed(3)}  `
    + `distance to the band's near edge (0.350): ${Math.abs(m.ridgeMed - 0.350).toFixed(3)} `
    + `${near ? 'CLOSER' : 'FURTHER'} than shipped (${Math.abs(base.ridgeMed - 0.350).toFixed(3)})`);
}
