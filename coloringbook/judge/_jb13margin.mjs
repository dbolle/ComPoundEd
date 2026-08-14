// BUCK r0 — S1: the note's analogue of `EDGE[id].field`.
//
// `EDGE[id].field = 41.0` is ONE literal standing for four coins; three judges
// have now measured it independently at 44.0 / 44.33 / 44.20. The note is not
// in `EDGE`, so the question the gates file asks is: which literal in
// `noteSVG()` encodes a measurable property of a real note and has never been
// measured?
//
// Answer, identified BEFORE measuring: the note's frame is two nested rects —
//   outer <rect x=1.4 y=1.4 width=97.2 height=53.2>   the paper edge
//   inner <rect x=5   y=5   width=90   height=46  >   the printed border
// so our art makes a claim about the MARGIN between the paper edge and the
// printed border, in both axes, and nothing has ever checked it. `_blfit.mjs`
// already reports both rectangles in the same pixels; this only divides them.
//
// SUBJECTS COVERED (PY3): the two references whose paper box is a measurement
// rather than a crop. `bill-obv.jpg` and `bill-rev.jpg` are tight crops whose
// paper runs off the frame (paper ratio 2.4239 / 2.4540 against a true
// 2.3524), and `bill-obv.jpg` additionally has no sound border fit at all
// (_jb1fit.mjs: border == paper, zero residual, exact right angles), so
// neither can carry this measurement. That leaves ONE file, and the row is
// reported as a single-artefact measurement.
//
//   node coloringbook/judge/_jb13margin.mjs
import { readFileSync } from 'node:fs';

const J = JSON.parse(readFileSync(new URL('./_jb1fits.json', import.meta.url), 'utf8'));
const OURS = { outer: { x: 1.4, y: 1.4, w: 97.2, h: 53.2 }, inner: { x: 5, y: 5, w: 90, h: 46 } };
const oursLeft = (OURS.inner.x - OURS.outer.x) / OURS.outer.w;
const oursRight = (OURS.outer.x + OURS.outer.w - (OURS.inner.x + OURS.inner.w)) / OURS.outer.w;
const oursTop = (OURS.inner.y - OURS.outer.y) / OURS.outer.h;
const oursBot = (OURS.outer.y + OURS.outer.h - (OURS.inner.y + OURS.inner.h)) / OURS.outer.h;

console.log('S1 — the printed border\'s inset from the paper edge, as a fraction of the paper');
console.log('file             paperRatio  | left    right   top     bottom  | mean X   mean Y  | usable?');
const usable = [];
for (const [f, r] of Object.entries(J.rows)) {
  const pb = r.paperBox, c = r.corners;
  const pw = pb.px1 - pb.px0, ph = pb.py1 - pb.py0;
  const L = (Math.min(c.TL[0], c.BL[0]) - pb.px0) / pw;
  const R = (pb.px1 - Math.max(c.TR[0], c.BR[0])) / pw;
  const T = (Math.min(c.TL[1], c.TR[1]) - pb.py0) / ph;
  const B = (pb.py1 - Math.max(c.BL[1], c.BR[1])) / ph;
  const paperErr = Math.abs(pb.ratio / 2.35249 - 1);
  // Usable requires BOTH: a paper box that is a measurement rather than a crop,
  // AND a border fit that found the printed border. R0 established that NEITHER
  // obverse fit does — `_jb1-fit.png` shows both quads lying on blank paper —
  // so the obverse files are excluded by name, not by their scalars.
  const ok = !r.degenerate && paperErr < 0.02 && f.includes('-rev');
  if (ok) usable.push({ f, L, R, T, B, X: (L + R) / 2, Y: (T + B) / 2 });
  console.log(`${f.padEnd(16)} ${pb.ratio.toFixed(4)} ${(paperErr * 100).toFixed(1).padStart(5)}% | ` +
    `${(100 * L).toFixed(2).padStart(6)}% ${(100 * R).toFixed(2).padStart(6)}% ${(100 * T).toFixed(2).padStart(6)}% ${(100 * B).toFixed(2).padStart(6)}% | ` +
    `${(100 * (L + R) / 2).toFixed(2).padStart(6)}% ${(100 * (T + B) / 2).toFixed(2).padStart(6)}% | ` +
    (ok ? 'YES' : r.degenerate ? 'no — degenerate border fit' : `no — paper box is a crop (${(paperErr * 100).toFixed(1)}% off the true 2.3525)`));
}
console.log(`\nours (noteSVG frame rects)                ${(100 * oursLeft).toFixed(2).padStart(6)}% ${(100 * oursRight).toFixed(2).padStart(6)}% ${(100 * oursTop).toFixed(2).padStart(6)}% ${(100 * oursBot).toFixed(2).padStart(6)}% | ` +
  `${(100 * (oursLeft + oursRight) / 2).toFixed(2).padStart(6)}% ${(100 * (oursTop + oursBot) / 2).toFixed(2).padStart(6)}%`);

if (!usable.length) { console.log('\nNO USABLE ARTEFACT — S1 is BLOCKED, and the acquisition is a full-paper photograph with a sound border fit.'); process.exit(0); }
const m = usable[0];
console.log(`\nMEASURED on ${usable.length} artefact${usable.length > 1 ? 's' : ''}: ${usable.map((u) => u.f).join(', ')}`);
console.log(`  note   margin X ${(100 * m.X).toFixed(2)}%   margin Y ${(100 * m.Y).toFixed(2)}%   (left/right ${(100 * m.L).toFixed(2)}/${(100 * m.R).toFixed(2)}, top/bottom ${(100 * m.T).toFixed(2)}/${(100 * m.B).toFixed(2)})`);
console.log(`  ours   margin X ${(100 * (oursLeft + oursRight) / 2).toFixed(2)}%   margin Y ${(100 * (oursTop + oursBot) / 2).toFixed(2)}%`);
console.log(`  error  X ${(100 * ((oursLeft + oursRight) / 2 - m.X)).toFixed(2)} points (ours is ${(((oursLeft + oursRight) / 2) / m.X).toFixed(2)}x the note's)` +
  `   Y ${(100 * ((oursTop + oursBot) / 2 - m.Y)).toFixed(2)} points (ours is ${(((oursTop + oursBot) / 2) / m.Y).toFixed(2)}x)`);
console.log(`\n  In our own units, a note-correct border would sit at X ${(OURS.outer.x + m.X * OURS.outer.w).toFixed(2)}..${(OURS.outer.x + OURS.outer.w - m.X * OURS.outer.w).toFixed(2)}` +
  ` and Y ${(OURS.outer.y + m.Y * OURS.outer.h).toFixed(2)}..${(OURS.outer.y + OURS.outer.h - m.Y * OURS.outer.h).toFixed(2)}, against the drawn 5..95 / 5..51.`);
console.log('\n  SINGLE-ARTEFACT MEASUREMENT — there is no second file that can carry it, so this row is an');
console.log('  ESCALATION with its measurement attached, exactly as PY1 requires of a constant measured on');
console.log('  fewer subjects than it governs. It is NOT a specialist dispatch.');
