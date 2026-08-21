// BUCK r9 (specialist) — D1, D2a/b/c/d and D4, re-derived from the SVG the app
// ACTUALLY EMITS rather than from a literal restating what the source is
// believed to draw.
//
// WHY THIS EXISTS AND `_jb3seal.mjs` / `_jb14d1.mjs` ARE NOT ENOUGH. Both of
// the judge's round-0 instruments carry our own geometry as a hard-coded
// `OURS` table — correct and deliberate at round 0 (§6.1 wants the locus
// frozen), but it means neither can see a change to the drawing at all: they
// would report round 0's numbers on any revision of `coins.js`. This reads
// OURS out of `coinSVG()` and takes the TARGET, unchanged and unre-fitted,
// from the judge's frozen `_jb4target.json` and `_jb14d1.mjs`'s published
// literal. Nothing on the target side of any number here is computed from our
// art (§6.1's reference-invariance rule), and that is asserted below by
// scoring two different revisions of the drawing against it.
//
// SUBJECTS COVERED (PY3): id `buck`, BOTH sides, tiers icon/mid/full.
//
//   node coloringbook/judge/_jk9score.mjs [before.js]
import { readFileSync } from 'node:fs';
import { marks } from './_jqgeom.mjs';
const mod = await import('../../src/art/coins.js');

// ── TARGETS, all frozen before this round and read, never recomputed ────────
const T = JSON.parse(readFileSync(new URL('./_jb4target.json', import.meta.url), 'utf8'));
const D2 = { pyramid: T.mean.pyramid, eagle: T.mean.eagle, sep: T.separation };
// `_jb14d1.mjs`'s published locus: read off the reference at a 1-unit ladder
// on a 3840px source, +-0.5 units. Restated here as a literal, not imported,
// because that file prints a verdict at module top level (§1.1's retirement
// rule: never let a scoring instrument run as a side effect of an import).
const D1 = { cx: 50.05, cy: 30.30, rx: 9.75, ry: 14.00 };
// D2d's fixed side: the anisotropy the registration predicts. It is NOT
// derived from our drawing (R2: name which side of a ratio is fixed).
const ANISO = 1.3145;
// D4's counts, read off the reference: four corner numerals on the obverse,
// thirteen courses on the pyramid.
const D4T = { corners: 4, courses: 13 };
const SIZES = { icon: 38, mid: 54, full: 190 };

const iou = (a, b) => {
  const st = 0.02;
  const x0 = Math.min(a.cx - a.rx, b.cx - b.rx), x1 = Math.max(a.cx + a.rx, b.cx + b.rx);
  const y0 = Math.min(a.cy - a.ry, b.cy - b.ry), y1 = Math.max(a.cy + a.ry, b.cy + b.ry);
  let inter = 0, uni = 0;
  for (let y = y0; y <= y1; y += st) for (let x = x0; x <= x1; x += st) {
    const ia = ((x - a.cx) / a.rx) ** 2 + ((y - a.cy) / a.ry) ** 2 <= 1;
    const ib = ((x - b.cx) / b.rx) ** 2 + ((y - b.cy) / b.ry) ** 2 <= 1;
    if (ia && ib) inter++; if (ia || ib) uni++;
  }
  return inter / uni;
};

// ── OURS, read out of the emitted string ───────────────────────────────────
// SELECTION TEST (§4.2): print the WHOLE candidate set and throw when the
// choice is ambiguous. The candidates are every <ellipse>/<circle> the side
// emits; the pick is by nearest centre to the target, and the runner-up's
// distance is printed so a coin-flip is visible.
// `minR` is a FROZEN LITERAL, not a tuning knob: a roundel or a vignette is at
// least 5 units across in this box on any revision, and the only smaller
// circles the note has ever drawn are the pyramid's eye (r 1.5 before this
// round, 0.55 after). Without it the eye at (30,24.6) sits 0.78 units behind
// the old (30,28) roundel and the selection test correctly refuses to choose —
// which is the test working, and also why the filter is stated rather than the
// threshold loosened.
function pickShape(svg, want, label, minR = 5) {
  const cand = [];
  for (const m of svg.match(/<(?:ellipse|circle)[^>]*>/g) || []) {
    const n = (a) => { const r = m.match(new RegExp(`\\s${a}="([-\\d.]+)"`)); return r ? Number(r[1]) : null; };
    const cx = n('cx'), cy = n('cy');
    const rx = n('rx') ?? n('r'), ry = n('ry') ?? n('r');
    if (cx == null || rx == null || rx < minR) continue;
    cand.push({ cx, cy, rx, ry, d: Math.hypot(cx - want.cx, cy - want.cy) });
  }
  const uniq = [...new Map(cand.map((c) => [`${c.cx},${c.cy},${c.rx},${c.ry}`, c])).values()]
    .sort((a, b) => a.d - b.d);
  if (!uniq.length) throw new Error(`${label}: no candidate shape`);
  console.log(`    SELECT ${label}: ${uniq.length} distinct candidates ${uniq.map((c) => `(${c.cx},${c.cy},${c.rx}x${c.ry})d${c.d.toFixed(1)}`).join(' ')}`);
  if (uniq.length > 1 && uniq[1].d - uniq[0].d < 1) throw new Error(`${label}: ambiguous pick, runner-up within 1 unit`);
  return uniq[0];
}

function score(svg, tier, side) {
  const rows = [];
  if (side === 'obverse') {
    const o = pickShape(svg, D1, 'D1 vignette');
    const v = iou(o, D1);
    rows.push({ id: 'D1', tier, ours: o, target: D1, iou: v,
      dcx: o.cx - D1.cx, dcy: o.cy - D1.cy, rxr: o.rx / D1.rx, ryr: o.ry / D1.ry, gate: 0.95 });
  } else {
    for (const [tag, t] of [['D2a pyramid', D2.pyramid], ['D2b eagle', D2.eagle]]) {
      const o = pickShape(svg, t, tag);
      rows.push({ id: tag, tier, ours: o, target: t, iou: iou(o, t),
        dcx: o.cx - t.cx, dcy: o.cy - t.cy, rxr: o.rx / t.rx, ryr: o.ry / t.ry, gate: 0.95 });
    }
  }
  return rows;
}

const out = [];
console.log('D1 / D2 — ours read from coinSVG(), target frozen. Gate IoU >= 0.95, centre +-1.0, semi-axes +-5%.');
for (const side of ['obverse', 'reverse']) for (const [tier, size] of Object.entries(SIZES)) {
  const svg = mod.coinSVG('buck', size, { side, value: false });
  for (const r of score(svg, tier, side)) {
    out.push(r);
    console.log(`  ${r.id.padEnd(12)} ${tier.padEnd(4)} ours (${r.ours.cx},${r.ours.cy}) ${r.ours.rx}x${r.ours.ry}  vs (${r.target.cx},${r.target.cy}) ${r.target.rx}x${r.target.ry}` +
      `  ->  IoU ${r.iou.toFixed(4)}  dcx ${r.dcx.toFixed(2)}  dcy ${r.dcy.toFixed(2)}  rx x${r.rxr.toFixed(3)}  ry x${r.ryr.toFixed(3)}`);
  }
}
// D2c / D2d
console.log('\nD2c separation (gate +-5% of the measured 53.75)   D2d shape (gate ry/rx within +-5% of 1.3145)');
for (const [tier, size] of Object.entries(SIZES)) {
  const svg = mod.coinSVG('buck', size, { side: 'reverse', value: false });
  const py = pickShape(svg, D2.pyramid, 'sep pyr'), ea = pickShape(svg, D2.eagle, 'sep eag');
  const sep = ea.cx - py.cx;
  console.log(`  ${tier.padEnd(4)} separation ours ${sep.toFixed(2)}  measured ${D2.sep}  -> ${(100 * (sep / D2.sep - 1)).toFixed(2)}%`);
  for (const [tag, o, t] of [['pyramid', py, D2.pyramid], ['eagle', ea, D2.eagle]])
    console.log(`       shape ${tag.padEnd(8)} ours ry/rx ${(o.ry / o.rx).toFixed(3)}  the note's own rim ${(t.ry / t.rx).toFixed(3)}  predicted ${ANISO}  -> ${(100 * ((o.ry / o.rx) / ANISO - 1)).toFixed(2)}%`);
}

// ── D4 ─────────────────────────────────────────────────────────────────────
console.log('\nD4 structural rhythm — count error 0.');
for (const [tier, size] of Object.entries(SIZES)) {
  const ob = mod.coinSVG('buck', size, { side: 'obverse', value: false });
  const n = (ob.match(/<text[^>]*font-size="10"[^>]*>1<\/text>/g) || []).length;
  const xs = [...ob.matchAll(/<text x="([-\d.]+)" y="([-\d.]+)"[^>]*font-size="10"[^>]*>1<\/text>/g)]
    .map((m) => `(${m[1]},${m[2]})`);
  console.log(`  obverse ${tier.padEnd(4)} corner numerals ${n} against ${D4T.corners}  error ${Math.abs(n - D4T.corners)}   at ${xs.join(' ') || '—'}`);
}
for (const [tier, size] of Object.entries(SIZES)) {
  const rv = mod.coinSVG('buck', size, { side: 'reverse', value: false });
  const M = marks(rv).filter((m) => m.el === 'path' && m.isStroke &&
    (m.bbox.y1 - m.bbox.y0) < 0.01 && (m.bbox.x0 + m.bbox.x1) / 2 < 40);
  const lines = [...new Map(M.map((m) => [m.tag, m])).values()];
  const courses = lines.length ? lines.length + 1 : 1;
  console.log(`  reverse ${tier.padEnd(4)} pyramid courses ${courses} (from ${lines.length} cut lines) against ${D4T.courses}  error ${Math.abs(courses - D4T.courses)}` +
    `   pitch ${lines.length ? (9.3 / courses).toFixed(3) : '—'} units = ${lines.length ? (9.3 / courses * mod.coinPx('buck', size).w / 100).toFixed(2) : '—'} device px`);
}

// ── §4 RESPONSE TEST ───────────────────────────────────────────────────────
{
  const svg = mod.coinSVG('buck', 190, { side: 'reverse', value: false });
  const moved = svg.replace(/cx="23.13"/g, 'cx="20.13"');
  const a = score(svg, 'full', 'reverse')[0], b = score(moved, 'full', 'reverse')[0];
  console.log(`\nRESPONSE TEST — pyramid roundel cx 23.13 -> 20.13 in a generated copy: D2a IoU ${a.iou.toFixed(4)} -> ${b.iou.toFixed(4)}` +
    `  ${b.iou < a.iou - 0.05 ? 'MOVED as expected' : '*** DID NOT MOVE — UNTRUSTED ***'}`);
}
// ── §6.1 REFERENCE-INVARIANCE ──────────────────────────────────────────────
// Score the SAME frozen target against a DIFFERENT revision of our art and
// require every target-side number to be bit-identical.
if (process.argv[2]) {
  const before = await import(process.argv[2]);
  const t = (r) => `${r.target.cx}|${r.target.cy}|${r.target.rx}|${r.target.ry}|${r.gate}`;
  const A = [], B = [];
  for (const side of ['obverse', 'reverse']) for (const size of Object.values(SIZES)) {
    for (const r of score(mod.coinSVG('buck', size, { side, value: false }), 'x', side)) A.push(t(r));
    for (const r of score(before.coinSVG('buck', size, { side, value: false }), 'x', side)) B.push(t(r));
  }
  const same = A.length === B.length && A.every((v, i) => v === B[i]);
  console.log(`\nREFERENCE-INVARIANCE (§6.1) — ${A.length} target-side tuples scored against two revisions of coins.js` +
    ` (${process.argv[2]} and the working tree): ${same ? 'BIT-IDENTICAL — the locus is not a function of the artefact' : '*** THE TARGET MOVED — UNTRUSTED ***'}`);
}
