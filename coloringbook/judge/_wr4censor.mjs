// ROUND 10 (specialist), QUARTER OBVERSE — AN INSTRUMENT FAULT REPORT, under
// COIN-JUDGE.md section 1.1. Nothing here edits an instrument; this reproduces
// one and shows it disagreeing with itself.
//
// THE CLAIM. `_jw14cross.mjs`'s RIDGE duty, applied to OUR art, is not a
// measurement of our lit rolls. NOT ONE of the five `RELIEF.Washington.base`
// rolls contributes a single kept ridge, on any of the three lines, at any
// width from 1.1 to 1.9. Every kept ridge sits either on one of the two
// `RELIEF.Washington.fine` rolls (stroke-width 1.0, which this round does not
// touch) or on bare wig between two cuts.
//
// THE MECHANISM, and it is not the bracket-bound rule I first guessed. It is
// `extrema` (_jw14cross.mjs:65-79) meeting the prominence floor
// (_jw14cross.mjs:110-111):
//
//   · a lit roll is a FLAT-TOPPED band of one palette tone, not a peak;
//   · `extrema` marks every sample that is maximal within +-0.45u, so a flat
//     top wider than the 0.9u window yields SEVERAL co-equal maxima, and
//     `dedupe` keeps more than one of them;
//   · between two co-equal maxima on the same plateau the bracketing "minimum"
//     has the SAME grey, so `prom = p[i].v - shoulder` is exactly 0.0;
//   · 0.0 < PROM (6), so the roll is discarded — the whole roll, not one edge.
//
// A roll narrow enough to make a single peak survives; that is why the sw 1.0
// `fine` rolls are kept and the sw 1.1-1.9 `base` rolls are not. The instrument
// is well behaved on the photographs, where the coin's bright bands are 0.40 to
// 0.60u and never plateau. It is reporting a real property of our drawing — our
// lit bands are flat plateaus — but it is reporting it as a duty cycle of the
// lit rolls, which it is not.
//
// THE REPRODUCTION, which needs no trust in me:
//   1. node coloringbook/judge/_wr1duty.mjs 1.9,1.1
//      Every lit roll set to 1.9, then every lit roll set to 1.1 — a 1.7x change
//      in the drawn light — returns BIT-IDENTICAL per-line ridge duty
//      0.369 / 0.348 / 0.312 and identical ridge FWHP 0.90u. Section 4: "two
//      bit-identical answers from two different inputs is not agreement."
//   2. node coloringbook/judge/_wr2where.mjs
//      Shows C1 crosses six lit rolls including the sw 1.8 and sw 1.9 ones, and
//      C2 crosses two of the sw 1.1 ones — so the changed marks are on the lines.
//   3. this script, which pairs every ridge candidate with the roll crossing it
//      sits on and prints the instrument's own rejection reason for each, so
//      the count "0 of the kept ridges sit on a `base` roll" can be checked by
//      eye rather than believed.
//
// This is a report, not a verdict, and not a fix. The affected published number
// is "ridge duty 0.348 against 0.350-0.443" in quarter-history.jsonl round 9.
//
// Run: node coloringbook/judge/_wr4censor.mjs [width]
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { marks } from './_jqgeom.mjs';

const LINES = [
  { name: 'C1 our normal lo', a: { x: 57.0, y: 46.0 }, b: { x: 61.7, y: 18.4 } },
  { name: 'C2 our normal mid', a: { x: 62.0, y: 48.0 }, b: { x: 66.7, y: 20.4 } },
  { name: 'C3 our normal hi', a: { x: 66.5, y: 49.0 }, b: { x: 71.2, y: 21.4 } },
];
const STEP = 0.05, WIN = 0.45, PROM = 6;   // _jw14cross.mjs's own constants

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
  for (let s = 0; s <= L; s += STEP) { const v = sample(t.a.x + ux * s, t.a.y + uy * s); if (v === null) return null; p.push({ s, v }); }
  return { p, L };
}
function extrema(p, win) {
  const n = p.length, k = Math.round(win / STEP); const mins = [], maxs = [];
  for (let i = k; i < n - k; i++) {
    let isMin = true, isMax = true;
    for (let j = i - k; j <= i + k; j++) { if (p[j].v < p[i].v - 1e-9) isMin = false; if (p[j].v > p[i].v + 1e-9) isMax = false; }
    if (isMin) mins.push(i); if (isMax) maxs.push(i);
  }
  const dedupe = (a) => a.filter((i, x) => x === 0 || i - a[x - 1] > k);
  return { mins: dedupe(mins), maxs: dedupe(maxs) };
}
// _jw14cross.mjs's `ridges`, with the disposition of every candidate kept
// instead of thrown away — the only difference.
function ridgesVerbose(p, mins, maxs) {
  const out = [];
  for (const i of maxs) {
    const lm = [...mins].filter((j) => j < i).pop();
    const rm = mins.find((j) => j > i);
    if (lm === undefined || rm === undefined) { out.push({ at: p[i].s, why: 'no bracket' }); continue; }
    const shoulder = Math.max(p[lm].v, p[rm].v);
    const prom = p[i].v - shoulder;
    if (prom < PROM) { out.push({ at: p[i].s, why: `prominence ${prom.toFixed(1)} < ${PROM}` }); continue; }
    const half = p[i].v - prom / 2;
    let a = i; while (a > lm && p[a - 1].v > half) a--;
    let b = i; while (b < rm && p[b + 1].v > half) b++;
    if (a === lm || b === rm) { out.push({ at: p[i].s, why: 'DROPPED at the bracketing minimum', prom, w: p[b].s - p[a].s }); continue; }
    out.push({ at: p[i].s, kept: true, w: p[b].s - p[a].s, prom });
  }
  return out;
}

const dOf = (m) => (m.tag.match(/\sd="([^"]*)"/) || [null, ''])[1];
const isRoll = (m) => m.stroke === '#cfd5da' && Math.abs(m.opacity - 0.85) < 1e-6;
const FACE_LIGHTS = ['M 10 -20.2', 'M 13.4 16.3'];
function rollCrossings(m, t) {
  const L = Math.hypot(t.b.x - t.a.x, t.b.y - t.a.y);
  const ux = (t.b.x - t.a.x) / L, uy = (t.b.y - t.a.y) / L, nx = -uy, ny = ux;
  const side = (p) => (p.x - t.a.x) * nx + (p.y - t.a.y) * ny;
  const o = [];
  for (let i = 1; i < m.pts.length; i++) {
    const s0 = side(m.pts[i - 1]), s1 = side(m.pts[i]);
    if (s0 === 0 || (s0 > 0) !== (s1 > 0)) {
      const f = s0 / (s0 - s1);
      const p = { x: m.pts[i - 1].x + f * (m.pts[i].x - m.pts[i - 1].x), y: m.pts[i - 1].y + f * (m.pts[i].y - m.pts[i - 1].y) };
      const tx = m.pts[i].x - m.pts[i - 1].x, ty = m.pts[i].y - m.pts[i - 1].y, tl = Math.hypot(tx, ty);
      const sinth = Math.abs((tx / tl) * nx + (ty / tl) * ny);
      o.push({ s: (p.x - t.a.x) * ux + (p.y - t.a.y) * uy, sw: m.sw, proj: (m.sw * 0.98) / sinth });
    }
  }
  return o;
}

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
    if (!s.includes(from)) throw new Error(`SUBSTITUTION MISS: ${from}`);
    s = s.replace(from, `<path d="${d}" fill="none" stroke-width="${width}"/>`);
  }
  s = s.replace("from '../engine/money.js'", "from '../../../src/engine/money.js'");
  const f = `coloringbook/_pv/wr1/coins-${String(width).replace('.', 'p')}.js`;
  writeFileSync(f, s);
  return import(`../_pv/wr1/coins-${String(width).replace('.', 'p')}.js`);
}

const W = process.argv[2] === undefined ? null : Number(process.argv[2]);
const mod = await moduleAt(W);
const svg = mod.coinSVG('quarter', 2126, { side: 'obverse' });
const png = await sharp(Buffer.from(svg)).png().toBuffer();
const { data, info } = await sharp(png).greyscale().raw().toBuffer({ resolveWithObject: true });
const ppu = info.width / 100;
const at = bil(data, info.width, info.height);
const sample = (vx, vy) => at(vx * ppu, vy * ppu);
const rolls = marks(svg).filter((m) => m.isStroke && isRoll(m) && !FACE_LIGHTS.some((f) => dOf(m).startsWith(f)));

console.log('### _wr4censor — every ridge candidate on C1..C3, and the lit roll it sits on');
console.log(`### art: ${W === null ? 'AS SHIPPED (1.9/1.9/1.8/1.1/1.1)' : `every lit roll at ${W}`}   @2126px`);
console.log('### rejection reasons are _jw14cross.mjs\'s own: "prominence 0.0 < 6" is a FLAT-TOPPED');
console.log('### roll split into co-equal maxima by `extrema`; "DROPPED at the bracketing minimum"');
console.log('### is line 115.\n');

// `base` rolls are the five this round is scoped to; the two `fine` wig rolls
// are stroke-width 1.0 and are NOT in scope. They are told apart by width here,
// which is exact for the shipped art and for every candidate width tried.
let keptOnRoll = 0, dropOnRoll = 0, keptOffRoll = 0, dropOffRoll = 0, keptOnBase = 0;
const bridge = [];
for (const t of LINES) {
  const pr = profile(sample, t);
  const { mins, maxs } = extrema(pr.p, WIN);
  const cand = ridgesVerbose(pr.p, mins, maxs);
  const rc = rolls.map((m) => rollCrossings(m, t).map((c) => ({ ...c, sw: m.sw }))).flat().sort((a, b) => a.s - b.s);
  console.log(`## ${t.name}   ${cand.length} ridge candidates, ${rc.length} lit-roll crossings`);
  for (const c of cand) {
    const near = rc.filter((r) => Math.abs(r.s - c.at) < 0.8).sort((a, b) => Math.abs(a.s - c.at) - Math.abs(b.s - c.at))[0];
    const tag = near ? `ON a lit roll sw ${near.sw} (centre s ${near.s.toFixed(2)})` : 'on NO lit roll — bare wig between cuts';
    if (c.kept) {
      if (near) {
        keptOnRoll++; if (near.sw !== 1) keptOnBase++;
        bridge.push({ line: t.name.slice(0, 2), at: c.at, fwhp: c.w, auth: near.proj });
      } else keptOffRoll++;
    }
    else if (c.why.startsWith('DROPPED')) { near ? dropOnRoll++ : dropOffRoll++; }
    console.log(`     s ${c.at.toFixed(2).padStart(6)}u  ${c.kept ? `KEPT   FWHP ${c.w.toFixed(2)}u` : c.why.padEnd(32)}   ${tag}`);
  }
  console.log('');
}
// THE BRIDGE. `_wr3roll.mjs` compares an authored-width duty against the coin's
// photometric FWHP duty. Those are the same ratio measured two ways, and this
// is how far apart the two ways are on our own art: for every KEPT ridge that
// sits on a roll, the measured FWHP against the authored width that roll
// presents to the line. A single number would be a lie; the spread is printed.
console.log('## THE BRIDGE — measured FWHP vs authored projected width, on the KEPT ridges');
if (!bridge.length) console.log('   no kept ridge sits on a roll — no bridge can be measured, which is a');
else {
  for (const b of bridge) console.log(`   ${b.line}  s ${b.at.toFixed(2).padStart(6)}u  `
    + `authored ${b.auth.toFixed(3)}u  measured FWHP ${b.fwhp.toFixed(2)}u  ratio ${(b.fwhp / b.auth).toFixed(2)}x`);
  const rs = bridge.map((b) => b.fwhp / b.auth).sort((a, b) => a - b);
  console.log(`   -> ${rs.length} pairs, ratio ${rs[0].toFixed(2)}x .. ${rs[rs.length - 1].toFixed(2)}x, `
    + `median ${rs[rs.length >> 1].toFixed(2)}x`);
  console.log('   The bridge is NOT 1.0 and it is not constant: half prominence is taken against');
  console.log('   whatever shoulder the band has, and a roll beside a cut has a much lower one.');
}
console.log('');

console.log('## THE CENSORING, counted');
console.log(`   ridge candidates sitting ON a lit roll:       ${keptOnRoll} kept, ${dropOnRoll} dropped at the bound`);
console.log(`   ridge candidates on bare wig between cuts:    ${keptOffRoll} kept, ${dropOffRoll} dropped at the bound`);
console.log(`   of the ${keptOnRoll} kept-on-a-roll, how many sit on one of the FIVE \`base\` rolls `
  + `(the subject of this round): ${keptOnBase}`);
console.log('   The duty that _jw14cross.mjs reports for our art is the sum over the KEPT set.');
console.log('   If the kept set is mostly bare wig, that duty is not a measurement of the lit rolls.');
