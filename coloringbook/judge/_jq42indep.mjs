// ROUND 4, TASK 1 — INDEPENDENCE OF EVERY QUARTER REFERENCE PAIR.
//
// The same-photograph trap has hit FOUR times out of four: two dime references
// at NCC 0.9931; quarter-rev.jpg vs quarter-rev-5.jpg at 0.9850; a byte-
// identical duplicate; and quarter-rev-6.jpg, which is a Nebraska state
// quarter and not this design at all. The round-4 acquisition adds four files
// from TWO plates by ONE publisher, so the specific question is whether the
// 1963 and 1964 plates share a photographic setup.
//
// Method is round 2's (`_jq20indep.mjs`, imported unedited and re-used at its
// published hash), with round 4's disc table:
//   raw NCC on disc-normalised grey  -> "is this the same PHOTOGRAPH"
//   registered NCC on blurred |grad| -> "is this the same DESIGN"
// The second exists because raw NCC is registration-limited: 0.01R of shift
// costs 0.55 of correlation on quarter-rev-3, so two honest photographs of one
// die at 2 deg of relative rotation score like two different coins.
//
// Round 4 adds a THIRD statistic that round 2 did not have and that the
// question "same photographic setup" actually needs: the correlation of the
// two images' BACKGROUNDS (outside 1.02R), and their illumination azimuth,
// estimated from the direction of the mean grey gradient inside the device.
// Two plates from one publisher shot on one copy stand will agree on those
// even when the coins are different.
//
// §4.1: NCC is bounded [-1,1]; a value at a bound is a failure report. The
// registration search prints its bounds; a best-fit at a bound is a failure.
// §4.2: this instrument SELECTS nothing — the whole matrix is printed.
import { normalise, N, SPAN } from '../_rvnorm.mjs';
import { ncc, bestReg, energyGrid } from './_jq20indep.mjs';
import { readFileSync } from 'node:fs';
import { fit } from '../_rvdisc.mjs';

const D4 = JSON.parse(readFileSync(new URL('./_jq4discs.json', import.meta.url)));

export const QREV = ['quarter-rev.jpg', 'quarter-rev-2.png', 'quarter-rev-3.jpg',
  'quarter-rev-5.jpg', 'quarter-rev-6.jpg', 'q1995d-rev.png',
  'qp1963-rev-pad.png', 'qp1964-rev-pad.png'];
export const QOBV = ['quarter-obv.jpg', 'quarter-obv-2.jpg', 'quarter-obv-3.png',
  'quarter-obv-4.jpg', 'qp1963-obv-pad.png', 'qp1964-obv-pad.png', 'quarter-proof-ebay.jpg'];
export const CONTROLS = ['nickel-rev-2.png', 'penny-rev-2.png', 'dime-rev-2.jpg'];

export async function discOf(f) {
  if (D4[f] && D4[f].R) return { cx: D4[f].cx, cy: D4[f].cy, R: D4[f].R };
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
// ring mask rmin..rmax
function ring(rmin, rmax) {
  const m = new Uint8Array(N * N);
  for (let j = 0; j < N; j++) { const v = -SPAN + 2 * SPAN * j / (N - 1);
    for (let i = 0; i < N; i++) { const u = -SPAN + 2 * SPAN * i / (N - 1);
      const r = Math.hypot(u, v); m[j * N + i] = (r >= rmin && r <= rmax) ? 1 : 0; } }
  return m;
}

// illumination azimuth: direction of the mean grey gradient inside 0.80R,
// in degrees, 0 = +u (right), 90 = +v (down). A relief lit from the upper left
// has a systematic bright-to-dark ramp across every raised feature.
export function azimuth(g) {
  const m = mask(0.80);
  let sx = 0, sy = 0, n = 0;
  for (let j = 1; j < N - 1; j++) for (let i = 1; i < N - 1; i++) {
    const p = j * N + i; if (!m[p]) continue;
    sx += g[p + 1] - g[p - 1]; sy += g[p + N] - g[p - N]; n++;
  }
  return { deg: +(Math.atan2(sy / n, sx / n) * 180 / Math.PI).toFixed(1),
    mag: +(Math.hypot(sx / n, sy / n)).toFixed(3) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const side = process.argv[2] === 'obv' ? 'obv' : 'rev';
  const SET = side === 'obv' ? QOBV : QREV;
  const files = [...SET, ...CONTROLS];
  const discs = {}; for (const f of files) discs[f] = await discOf(f);
  const G = {}; for (const f of files) G[f] = await normalise(f, discs[f]);
  const mIn = mask(0.90), mDes = mask(0.86), mBg = ring(1.10, 1.40);

  console.log(`=== round 4 independence, quarter ${side === 'obv' ? 'OBVERSE' : 'REVERSE'} set ===`);
  console.log('discs: ' + files.map((f) => `${f}=R${discs[f].R}`).join('  ') + '\n');

  console.log('--- raw NCC on disc-normalised grey inside 0.90R ("same PHOTOGRAPH?") ---');
  console.log('bounds [-1,+1]; a value AT a bound is a failure report (§4.1)');
  const M = {};
  console.log('                        ' + SET.map((f) => f.slice(0, 7).padStart(8)).join(''));
  for (const a of files) {
    const row = SET.map((b) => { const v = ncc(G[a], G[b], mIn); M[a + '|' + b] = v; M[b + '|' + a] = v; return v.toFixed(4).padStart(8); });
    console.log(a.padEnd(24) + row.join(''));
  }

  console.log('\n--- registered NCC on blurred |grad| energy ("same DESIGN?") ---');
  const feat = {}; for (const f of files) feat[f] = await energyGrid(f, discs[f], 0.02);
  const ROT = [], TR = [];
  for (let d = -8; d <= 8; d += 2) ROT.push(d);
  for (let t = -0.03; t <= 0.0301; t += 0.015) TR.push(+t.toFixed(3));
  console.log(`search bounds: rot ${ROT[0]}..${ROT[ROT.length - 1]} deg, translation ${TR[0]}..${TR[TR.length - 1]}R`);
  const Dm = {};
  console.log('                        ' + SET.map((f) => f.slice(0, 7).padStart(8)).join(''));
  for (const a of files) {
    const row = SET.map((b) => {
      const k = a + '|' + b; if (!Dm[k]) { const r = bestReg(feat[a], feat[b], mDes, ROT, TR); Dm[k] = r; Dm[b + '|' + a] = { ...r, rot: -r.rot }; }
      return Dm[k].ncc.toFixed(3).padStart(8); });
    console.log(a.padEnd(24) + row.join(''));
  }

  console.log('\n--- background NCC outside the coin (1.10R..1.40R) — "same photographic SETUP?" ---');
  console.log('                        ' + SET.map((f) => f.slice(0, 7).padStart(8)).join(''));
  const B = {};
  for (const a of SET) {
    const row = SET.map((b) => { const v = ncc(G[a], G[b], mBg); B[a + '|' + b] = v; return v.toFixed(3).padStart(8); });
    console.log(a.padEnd(24) + row.join(''));
  }

  console.log('\n--- illumination azimuth inside 0.80R (deg; 0 = from the right, 90 = from below) ---');
  for (const f of SET) { const z = azimuth(G[f]); console.log(`${f.padEnd(24)} ${String(z.deg).padStart(7)} deg   |mean grad| ${z.mag}`); }

  console.log('\n--- verdicts ---');
  const ctl = [];
  for (const a of SET) for (const c of CONTROLS) ctl.push(Dm[a + '|' + c] ? Dm[a + '|' + c].ncc : (Dm[c + '|' + a] || {}).ncc);
  const FLOOR = Math.max(...ctl.filter(Number.isFinite));
  console.log(`design floor (max registered design-NCC of any file here vs a KNOWN-different design) = ${FLOOR.toFixed(4)}`);
  const seen = new Set();
  for (const a of SET) for (const b of SET) {
    if (a === b || seen.has(b + '|' + a)) continue; seen.add(a + '|' + b);
    const raw = M[a + '|' + b], d = Dm[a + '|' + b], bg = B[a + '|' + b];
    let call;
    if (raw > 0.95) call = 'SAME PHOTOGRAPH — must NOT count as two references';
    else if (d.ncc > FLOOR + 0.15) call = `same design, different photograph — INDEPENDENT (rot ${d.rot} deg)`;
    else call = 'DIFFERENT DESIGN — not a reference for this coin';
    console.log(`${a.padEnd(20)} vs ${b.padEnd(20)} raw ${raw.toFixed(4)}  design ${d.ncc.toFixed(4)}  bg ${bg.toFixed(3)}   ${call}`);
  }
}
