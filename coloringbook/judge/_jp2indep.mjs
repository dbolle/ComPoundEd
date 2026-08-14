// PENNY ROUND 0, TASK 1 — INDEPENDENCE OF EVERY CENT REFERENCE PAIR.
//
// The same-photograph trap has now hit FIVE times out of five, most recently on
// a quarter OBVERSE pair that nobody had ever correlated (round 4, raw NCC
// 0.9542). The cent's four obverse references have never been correlated
// either, and `penny-obv.md` §2.2 quotes them as three independent coins
// (1909 / 2002 / 2025) on the strength of an ICP residual, not a correlation.
// This runs the check before any number in this round leans on "two references
// agree".
//
// Method is round 2's, imported UNEDITED at its published hash from
// `_jq20indep.mjs` (ncc / bestReg / energyGrid) and round 4's `azimuth` from
// `_jq42indep.mjs`. The judge may not edit an instrument to get an answer.
//
//   raw NCC on disc-normalised grey inside 0.90R   -> "same PHOTOGRAPH?"
//   registered NCC on blurred |grad| energy         -> "same DESIGN?"
//   background NCC outside the coin (1.10R..1.40R)  -> "same photographic SETUP?"
//   illumination azimuth inside 0.80R               -> independent FOR TONE?
//
// §4.1: NCC is bounded [-1,+1]; a value at a bound is a failure report, and the
// registration search prints its bounds.
// §4.2: this instrument SELECTS nothing — the whole matrix is printed.
//
// Run: node coloringbook/judge/_jp2indep.mjs obv
//      node coloringbook/judge/_jp2indep.mjs rev
import { normalise, N, SPAN } from '../_rvnorm.mjs';
import { ncc, bestReg, energyGrid } from './_jq20indep.mjs';
import { azimuth } from './_jq42indep.mjs';
import { fit } from '../_rvdisc.mjs';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

// penny-rev-artwork.jpg is Gasparro's PLASTER MODEL: `_rvtarget.json` records
// 19.3% disc residual, i.e. there is no disc to normalise against, so it cannot
// enter a disc-normalised correlation at all. It is listed here so its absence
// is a stated exclusion rather than an omission.
export const POBV = ['penny-obv.jpg', 'penny-obv-2.jpg', 'penny-obv-3.jpg', 'penny-obv-4.png'];
export const PREV = ['penny-rev.jpg', 'penny-rev-2.png'];
export const EXCLUDED = { 'penny-rev-artwork.jpg': 'plaster model, no fittable disc (19.3% residual)' };
// controls: KNOWN-different designs, so the "different design" floor is measured
// rather than assumed.
export const CTL_OBV = ['quarter-obv-2.jpg', 'nickel-obv.jpg', 'dime-obv-2.jpg'];
export const CTL_REV = ['nickel-rev-2.png', 'dime-rev-2.jpg', 'quarter-rev-2.png'];

const CACHE = new URL('./_jp1discs.json', import.meta.url).pathname;
const HAVE = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE)) : {};

export async function discOf(f) {
  if (HAVE[f] && HAVE[f].R) return { cx: HAVE[f].cx, cy: HAVE[f].cy, R: HAVE[f].R };
  const r = await fit(f);
  return { cx: +r.cx.toFixed(2), cy: +r.cy.toFixed(2), R: +r.R.toFixed(2) };
}

function mask(rmax) {
  const m = new Uint8Array(N * N);
  for (let j = 0; j < N; j++) { const v = -SPAN + 2 * SPAN * j / (N - 1);
    for (let i = 0; i < N; i++) { const u = -SPAN + 2 * SPAN * i / (N - 1);
      m[j * N + i] = Math.hypot(u, v) <= rmax ? 1 : 0; } }
  return m;
}
function ring(rmin, rmax) {
  const m = new Uint8Array(N * N);
  for (let j = 0; j < N; j++) { const v = -SPAN + 2 * SPAN * j / (N - 1);
    for (let i = 0; i < N; i++) { const u = -SPAN + 2 * SPAN * i / (N - 1);
      const r = Math.hypot(u, v); m[j * N + i] = (r >= rmin && r <= rmax) ? 1 : 0; } }
  return m;
}

const side = process.argv[2] === 'rev' ? 'rev' : 'obv';
const SET = side === 'obv' ? POBV : PREV;
const CONTROLS = side === 'obv' ? CTL_OBV : CTL_REV;
const files = [...SET, ...CONTROLS];

const discs = {}; for (const f of files) discs[f] = await discOf(f);
const G = {}; for (const f of files) G[f] = await normalise(f, discs[f]);
const mIn = mask(0.90), mDes = mask(0.86), mBg = ring(1.10, 1.40);

console.log(`=== penny round 0 independence, ${side === 'obv' ? 'OBVERSE' : 'REVERSE'} set ===`);
console.log('discs: ' + files.map((f) => `${f}=R${discs[f].R}`).join('  '));
for (const [f, why] of Object.entries(EXCLUDED)) console.log(`EXCLUDED: ${f} — ${why}`);

console.log('\n--- raw NCC on disc-normalised grey inside 0.90R ("same PHOTOGRAPH?") ---');
console.log('bounds [-1,+1]; a value AT a bound is a failure report (§4.1)');
const M = {};
console.log('                        ' + SET.map((f) => f.slice(0, 7).padStart(9)).join(''));
for (const a of files) {
  const row = SET.map((b) => { const v = ncc(G[a], G[b], mIn); M[a + '|' + b] = v; M[b + '|' + a] = v; return v.toFixed(4).padStart(9); });
  console.log(a.padEnd(24) + row.join(''));
}

console.log('\n--- registered NCC on blurred |grad| energy ("same DESIGN?") ---');
const feat = {}; for (const f of files) feat[f] = await energyGrid(f, discs[f], 0.02);
const ROT = [], TR = [];
for (let d = -8; d <= 8; d += 2) ROT.push(d);
for (let t = -0.03; t <= 0.0301; t += 0.015) TR.push(+t.toFixed(3));
console.log(`search bounds: rot ${ROT[0]}..${ROT[ROT.length - 1]} deg, translation ${TR[0]}..${TR[TR.length - 1]}R`);
const Dm = {};
console.log('                        ' + SET.map((f) => f.slice(0, 7).padStart(9)).join(''));
for (const a of files) {
  const row = SET.map((b) => {
    const k = a + '|' + b;
    if (!Dm[k]) { const r = bestReg(feat[a], feat[b], mDes, ROT, TR); Dm[k] = r; Dm[b + '|' + a] = { ...r, rot: -r.rot }; }
    return Dm[k].ncc.toFixed(3).padStart(9); });
  console.log(a.padEnd(24) + row.join(''));
}
let atBound = 0;
for (const k of Object.keys(Dm)) if (Math.abs(Dm[k].rot) === 8 || Math.abs(Dm[k].du) >= 0.03 || Math.abs(Dm[k].dv) >= 0.03) atBound++;
console.log(`registrations landing AT a search bound: ${atBound} (any non-zero is a failure report, §4.1)`);

console.log('\n--- background NCC outside the coin (1.10R..1.40R) — "same photographic SETUP?" ---');
console.log('                        ' + SET.map((f) => f.slice(0, 7).padStart(9)).join(''));
const B = {};
for (const a of SET) {
  const row = SET.map((b) => { const v = ncc(G[a], G[b], mBg); B[a + '|' + b] = v; return v.toFixed(3).padStart(9); });
  console.log(a.padEnd(24) + row.join(''));
}

console.log('\n--- illumination azimuth inside 0.80R (deg; 0 = from the right, 90 = from below) ---');
for (const f of files) { const z = azimuth(G[f]); console.log(`${f.padEnd(24)} ${String(z.deg).padStart(8)} deg   |mean grad| ${z.mag}`); }

console.log('\n--- verdicts ---');
const ctl = [];
for (const a of SET) for (const c of CONTROLS) ctl.push((Dm[a + '|' + c] || Dm[c + '|' + a] || {}).ncc);
const FLOOR = Math.max(...ctl.filter(Number.isFinite));
console.log(`design floor (max registered design-NCC vs a KNOWN-different design) = ${FLOOR.toFixed(4)}`);
const seen = new Set();
for (const a of SET) for (const b of SET) {
  if (a === b || seen.has(b + '|' + a)) continue; seen.add(a + '|' + b);
  const raw = M[a + '|' + b], d = Dm[a + '|' + b], bg = B[a + '|' + b];
  let call;
  if (raw > 0.95) call = 'SAME PHOTOGRAPH — must NOT count as two references';
  else if (raw > 0.70) call = 'SHARED SETUP suspect — not the same photograph, not two observations for TONE';
  else if (d.ncc > FLOOR + 0.15) call = `same design, different photograph — INDEPENDENT (rot ${d.rot} deg)`;
  else call = 'DIFFERENT DESIGN? — one-sided, MUST be confirmed by looking (round 4 §1.3)';
  console.log(`${a.padEnd(18)} vs ${b.padEnd(18)} raw ${raw.toFixed(4)}  design ${d.ncc.toFixed(4)}  bg ${bg.toFixed(3)}   ${call}`);
}
