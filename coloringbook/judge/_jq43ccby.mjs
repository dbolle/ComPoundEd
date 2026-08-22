// Is `quarter-obv-1963ccby.jpg` an independent, same-design reference for the
// quarter OBVERSE — and should it be in the D3 candidate set?
//
// WHY THIS FILE EXISTS INSTEAD OF AN EDIT. `_jq42indep.mjs`'s `QOBV` list omits
// this file, and it omits `quarter-obv-1932ngc.jpg` too. Extending that list
// means editing a hashed artefact while other rounds are in flight, which
// voids them. So this runs the SAME COMPARISON CODE on a different subject
// list: `normalise`, `ncc`, `bestReg`, `energyGrid` and `discOf` are all
// imported from the very modules `_jq42indep.mjs` imports them from. Nothing is
// re-implemented except the radial mask, which is a circle test.
//
// A SECOND IMPLEMENTATION IS A SECOND CHANCE TO BE WRONG, so before it reports
// anything new it REPRODUCES `_jq42indep.mjs`'s published figures on pairs that
// file already scored. If those do not match to the published precision it
// prints the mismatch and exits non-zero rather than reporting a new number.
//
// WHY IT MATTERS. Judge ruling of 2026-08-22: the quarter obverse D3 candidate
// set is four files that are really ONE piece of usable evidence —
// `quarter-obv-4.jpg` is the 1999+ state quarter, and `quarter-obv.jpg` and
// `quarter-obv-2.jpg` are the same photograph at design NCC 0.9959. Meanwhile
// `quarter-obv-1963ccby.jpg` is a 1963 STRUCK business strike under flat
// diffuse light, CC BY 2.0, acquired for tone, and sitting unused. If it is
// independent and same-design, the quarter obverse goes from n=1 to n=2 with
// nothing acquired.
//
// Run: node coloringbook/judge/_jq43ccby.mjs
import { normalise, N, SPAN } from '../_rvnorm.mjs';
import { ncc, bestReg, energyGrid } from './_jq20indep.mjs';
import { discOf, QOBV, CONTROLS } from './_jq42indep.mjs';

const CANDIDATE = process.argv[2] || 'quarter-obv-1963ccby.jpg';
const EXTRA = [CANDIDATE, 'quarter-obv-1932ngc.jpg'].filter((v, i, a) => a.indexOf(v) === i);
const SET = [...QOBV, ...EXTRA];
const FILES = [...SET, ...CONTROLS];

// The only thing not imported: the radial mask. Transcribed EXACTLY from
// _jq42indep.mjs's private `mask`, including SPAN (1.02, not 1) and the
// endpoint sampling `-SPAN + 2*SPAN*i/(N-1)` rather than pixel centres. My
// first version used neither and the equivalence check below caught it —
// three of four published figures failed to reproduce. That check existing is
// the only reason this file is trustworthy at all.
const mask = (rmax) => {
  const m = new Uint8Array(N * N);
  for (let j = 0; j < N; j++) {
    const v = -SPAN + 2 * SPAN * j / (N - 1);
    for (let i = 0; i < N; i++) {
      const u = -SPAN + 2 * SPAN * i / (N - 1);
      m[j * N + i] = Math.hypot(u, v) <= rmax ? 1 : 0;
    }
  }
  return m;
};

const discs = {}; for (const f of FILES) discs[f] = await discOf(f);
const G = {}; for (const f of FILES) G[f] = await normalise(f, discs[f]);
const feat = {}; for (const f of FILES) feat[f] = await energyGrid(f, discs[f], 0.02);
const mIn = mask(0.90), mDes = mask(0.86);
const ROT = []; for (let d = -8; d <= 8; d += 2) ROT.push(d);
const TR = []; for (let t = -0.03; t <= 0.0301; t += 0.015) TR.push(+t.toFixed(3));

const raw = (a, b) => ncc(G[a], G[b], mIn);
const des = (a, b) => bestReg(feat[a], feat[b], mDes, ROT, TR);

// ── PY6 EQUIVALENCE FIRST. Published by _jq42indep.mjs on 2026-08-22.
console.log('=== equivalence check against _jq42indep.mjs\'s published figures ===');
const PUB = [
  ['quarter-obv.jpg', 'quarter-obv-2.jpg', 0.9542, 0.9959],
  ['quarter-obv.jpg', 'quarter-obv-3.png', -0.1081, 0.6437],
  ['quarter-obv.jpg', 'quarter-obv-4.jpg', 0.0703, 0.2881],
  ['quarter-obv-3.png', 'qp1963-obv-pad.png', 0.3555, 0.7627],
];
let bad = 0;
for (const [a, b, wantRaw, wantDes] of PUB) {
  const r = raw(a, b), d = des(a, b).ncc;
  const ok = Math.abs(r - wantRaw) < 5e-4 && Math.abs(d - wantDes) < 5e-4;
  if (!ok) bad++;
  console.log(`  ${a} vs ${b}\n    raw ${r.toFixed(4)} (published ${wantRaw})   design ${d.toFixed(4)} (published ${wantDes})   ${ok ? 'MATCH' : '!! MISMATCH'}`);
}
if (bad) {
  console.log(`\n!! ${bad} of ${PUB.length} published figures did not reproduce. This file is NOT equivalent to _jq42indep.mjs and reports nothing further.`);
  process.exit(1);
}
console.log(`  ${PUB.length}/${PUB.length} reproduce — same comparison, different subject list.\n`);

// ── the design floor, exactly as _jq42indep derives it: the best any file here
// scores against a KNOWN-different design.
let floor = -1, floorPair = '';
for (const a of SET) for (const c of CONTROLS) {
  const v = des(a, c).ncc;
  if (v > floor) { floor = v; floorPair = `${a} vs ${c}`; }
}
console.log(`design floor (max vs a known-different design) = ${floor.toFixed(4)}   [${floorPair}]\n`);

console.log(`=== ${CANDIDATE} against every other quarter-obverse file ===`);
const rows = [];
for (const b of SET) {
  if (b === CANDIDATE) continue;
  const r = raw(CANDIDATE, b), D = des(CANDIDATE, b);
  const same = r > 0.90;
  const diffDesign = D.ncc <= floor;
  const onBound = Math.abs(D.rot) >= 8 || Math.abs(D.du) >= 0.03 || Math.abs(D.dv) >= 0.03;
  const verdict = same ? 'SAME PHOTOGRAPH — must not count as two'
    : diffDesign ? 'DIFFERENT DESIGN — not a reference for this coin'
      : 'same design, different photograph — INDEPENDENT';
  rows.push({ b, r, d: D.ncc, rot: D.rot, onBound, verdict });
  console.log(`  vs ${b.padEnd(24)} raw ${r.toFixed(4).padStart(8)}  design ${D.ncc.toFixed(4).padStart(7)}  rot ${String(D.rot).padStart(3)}  ${verdict}${onBound ? '   !! REGISTRATION AT A BOUND — this is a failure report, not a value (§4.1)' : ''}`);
}

const indep = rows.filter((x) => x.verdict.startsWith('same design') && !x.onBound);
console.log(`\n${CANDIDATE} is INDEPENDENT and SAME DESIGN against ${indep.length} of ${rows.length} files.`);
// PROVENANCE IS PER-FILE. The first version hard-coded the 1963 CC BY
// description and printed it for whatever candidate was passed — the identical
// fault I had just fixed in _jp3usmint.mjs and then left standing here.
const PROV = {
  'quarter-obv-1963ccby.jpg': '1963 STRUCK business strike, flat diffuse light, CC BY 2.0 (James St. John / Flickr).',
  'q1995d-obv.png': '1995-D STRUCK business strike, obverse half of quarter-1995d.jpg — a pair image whose obverse half had never been extracted. ⚠️ THE REVERSE HALF OF THIS SAME SOURCE was ruled a POSTERISED RENDERING, not a photograph, by the quarter-reverse round. That ruling and this result are in TENSION and must be resolved before any TONE use.',
};
console.log(indep.length
  ? `  -> Usable for this coin. ${PROV[CANDIDATE] ?? 'PROVENANCE NOT RECORDED — record it before use.'}`
  : `  -> NOT usable. Do not add it.`);

// ── THE ABOVE IS A NON-ANSWER, NOT A VERDICT.
// 7 of 8 comparisons ride the registration bound (rot ±8 or translation ±0.03).
// The coin in this photograph is visibly TILTED, so the search cannot reach it
// and "different design" is what §4.1 calls a failure report. The eagle round
// hit the identical pattern on quarter-rev.jpg and correctly refused to read it
// as a verdict. So: widen the search and print the bounds, and if the argmax
// still rides them, say UNMEASURED rather than inventing a decision.
const ROT2 = []; for (let d = -30; d <= 30; d += 2.5) ROT2.push(d);
const TR2 = []; for (let t = -0.09; t <= 0.0901; t += 0.03) TR2.push(+t.toFixed(3));
console.log(`\n=== WIDENED SEARCH: rot ${ROT2[0]}..${ROT2[ROT2.length - 1]} deg, translation ${TR2[0]}..${TR2[TR2.length - 1]}R ===`);
let best = null;
for (const b of SET) {
  if (b === CANDIDATE) continue;
  const D = bestReg(feat[CANDIDATE], feat[b], mDes, ROT2, TR2);
  const onBound = Math.abs(D.rot) >= 30 || Math.abs(D.du) >= 0.09 || Math.abs(D.dv) >= 0.09;
  if (!best || D.ncc > best.ncc) best = { b, ...D, onBound };
  console.log(`  vs ${b.padEnd(24)} design ${D.ncc.toFixed(4).padStart(7)}  rot ${String(D.rot).padStart(6)}  du ${String(D.du).padStart(6)} dv ${String(D.dv).padStart(6)}${onBound ? '   !! STILL ON A BOUND' : ''}`);
}
console.log(`\nbest: ${best.b} at design ${best.ncc.toFixed(4)}, rot ${best.rot}, floor ${floor.toFixed(4)}`);
console.log(best.ncc > floor && !best.onBound
  ? `  -> SAME DESIGN, INDEPENDENT once the search can reach it. The +-8 deg bound was the whole story.\n     RECOMMEND adding to the D3 candidate set: a 1963 STRUCK business strike, flat diffuse light, CC BY 2.0.`
  : `  -> UNMEASURED. Even widened, the registration cannot place this photograph against the pool\n     (best ${best.ncc.toFixed(4)} vs floor ${floor.toFixed(4)}${best.onBound ? ', argmax still on a bound' : ''}).\n     The coin is the right design BY EYE, but this instrument cannot corroborate it, and\n     "the instrument cannot look here" is not "the answer is no". Do NOT add it on my say-so.`);
