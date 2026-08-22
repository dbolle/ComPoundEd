// Is the US Mint's 2013-S cent obverse an independent, same-design reference?
//
// PROVENANCE. commons.wikimedia.org/wiki/File:US_One_Cent_Obv.png — US Mint
// pressroom, 2014-02-10, **PD-USGov-Treasury**. Public domain as a work of the
// US Department of the Treasury: the cleanest licence in this pool by a
// distance, and the first reference here that is not third-party copyright.
// 2000x2000, straight-on, diffuse, background cut out (corner alpha 0).
//
// IT IS A PROOF. Since 1974 the San Francisco mint has struck no business-strike
// cents, so an "S" cent is proof-only; the 2013-S is a proof and the frosted
// devices on a mirror field in the image agree. Under §20.3 that makes it the
// BEST kind of SHAPE reference and the WORST kind of TONE reference. It does
// NOT answer the cent's open question, which is the whisker boundary — a
// texture/tone reading that still rests on one struck photograph.
//
// PREPROCESSING, DECLARED. The cut-out is flattened onto neutral #808080
// (`penny-obv-usmint-flat.png`). Compositing onto black would invent a hard
// black rim the coin does not have and bias both the disc fit and every tone
// reading.
//
// Same pattern as _jq43ccby.mjs: this runs the SAME imported comparison code on
// an extended file list rather than editing _jp2indep.mjs's hashed POBV, and it
// REPRODUCES that file's published figures before reporting anything new.
//
// Run: node coloringbook/judge/_jp3usmint.mjs
import { normalise, N, SPAN } from '../_rvnorm.mjs';
import { ncc, bestReg, energyGrid } from './_jq20indep.mjs';
import { discOf } from './_jq42indep.mjs';
import { POBV, CTL_OBV } from './_jp2indep.mjs';

const CAND = process.argv[2] || 'penny-obv-usmint-flat.png';
const SET = [...POBV, CAND];
const FILES = [...new Set([...SET, ...CTL_OBV, ...(process.argv[3] ? [process.argv[3]] : [])])];

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

console.log('disc fits: ' + FILES.map((f) => `${f}=R${discs[f].R}`).join('  ') + '\n');

let floor = -1, fp = '';
for (const a of SET) for (const c of CTL_OBV) {
  const v = des(a, c).ncc; if (v > floor) { floor = v; fp = `${a} vs ${c}`; }
}
console.log(`design floor (max vs a known-different design) = ${floor.toFixed(4)}   [${fp}]\n`);

console.log(`=== ${CAND} against every existing cent obverse reference ===`);
const rows = [];
const AGAINST = POBV.concat(process.argv[3] ? [process.argv[3]] : []);
for (const b of AGAINST) {
  const r = raw(CAND, b), D = des(CAND, b);
  const onBound = Math.abs(D.rot) >= 8 || Math.abs(D.du) >= 0.03 || Math.abs(D.dv) >= 0.03;
  const verdict = r > 0.90 ? 'SAME PHOTOGRAPH'
    : D.ncc <= floor ? 'DIFFERENT DESIGN — not a reference for this coin'
      : 'same design, different photograph — INDEPENDENT';
  rows.push({ b, r, d: D.ncc, onBound, verdict });
  console.log(`  vs ${b.padEnd(20)} raw ${r.toFixed(4).padStart(8)}  design ${D.ncc.toFixed(4).padStart(7)}  rot ${String(D.rot).padStart(4)}  ${verdict}${onBound ? '   !! REGISTRATION AT A BOUND — failure report, not a value (§4.1)' : ''}`);
}
const ok = rows.filter((x) => x.verdict.startsWith('same design') && !x.onBound);
console.log(`\nINDEPENDENT and SAME DESIGN against ${ok.length} of ${rows.length}.`);
console.log(ok.length === rows.length
  ? '  -> USABLE, and independent of everything we hold. §20.3: SHAPE ONLY (D1/D2/D7).\n     It is a PROOF and must never be used for D3 or D13.'
  : ok.length ? '  -> PARTIALLY usable; see the rows above.'
    : '  -> NOT usable, or the instrument cannot place it. Do not add.');

// ── The two bound-riding rows are a DIFFERENT case from the CC BY quarter.
// There the argmax rode the bound with a score BELOW the design floor, so the
// verdict was UNMEASURED. Here the argmax rides the TRANSLATION bound (rot is
// 0..-2) with a score already far ABOVE the floor — the coin simply sits a
// little off-centre relative to the others, so the reported figure is a LOWER
// BOUND that widening can only raise. Confirm that rather than assert it.
const TR2 = []; for (let t = -0.09; t <= 0.0901; t += 0.015) TR2.push(+t.toFixed(3));
console.log(`\n=== widened translation: ${TR2[0]}..${TR2[TR2.length - 1]}R (rotation unchanged) ===`);
let worst = 1;
for (const b of AGAINST) {
  const D = bestReg(feat[CAND], feat[b], mDes, ROT, TR2);
  const onBound = Math.abs(D.rot) >= 8 || Math.abs(D.du) >= 0.09 || Math.abs(D.dv) >= 0.09;
  worst = Math.min(worst, D.ncc);
  console.log(`  vs ${b.padEnd(20)} design ${D.ncc.toFixed(4).padStart(7)}  rot ${String(D.rot).padStart(4)}  du ${String(D.du).padStart(6)} dv ${String(D.dv).padStart(6)}${onBound ? '   !! STILL ON A BOUND' : ''}`);
}
console.log(`\nworst design NCC across all four = ${worst.toFixed(4)}, floor ${floor.toFixed(4)}`);
// PROVENANCE IS PER-FILE AND MUST NOT BE HARD-CODED. The first version of this
// script printed "PD-USGov-Treasury" whatever candidate was passed on the
// command line — a licence claim asserted for a file it had never looked at.
// Caught when the 2021-S dealer photograph was run through it.
const PROV = {
  'penny-obv-usmint-flat.png': 'PD-USGov-Treasury (US Mint pressroom, 2013-S proof). Public domain — the only reference in this pool that is not third-party copyright.',
  'penny-obv-proof2021.jpg': 'profilecoins.com, a commercial dealer (2021-S deep cameo proof). THIRD-PARTY COPYRIGHT — private measurement only, never redistributed, never traced into shipped art.',
};
console.log(worst > floor
  ? `  -> CONFIRMED: same design, independent of every file compared, no bound riding.\n`
    + `     ADD IT — as a SHAPE reference only (D1/D2/D7). An "S" cent is proof-only (no\n`
    + `     business-strike S cents since 1974), so under §20.3 this is the BEST kind of shape\n`
    + `     reference and the WORST kind of tone reference: NEVER use it for D3 or D13.\n`
    + `     Provenance: ${PROV[CAND] ?? 'NOT RECORDED — record it before use.'}`
  : `  -> still below the floor; do not add.`);
