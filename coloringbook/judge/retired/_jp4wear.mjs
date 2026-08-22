// DOES PRESERVATION STATE CHANGE THE TONE RATIOS? — the owner's question.
//
// The owner supplied a heavily toned circulated cent and said, in effect: real
// pennies vary enormously in colour depending on how they have aged.
//
// FIRST, WHAT "TONE" MEANS IN THIS PROJECT, because I had been using the word
// loosely. `_qtlib.ratioVector` computes `median(patch) / median(cheek)` on a
// GREYSCALE raster. Colour is discarded outright by `.greyscale()`, and overall
// brightness cancels in the ratio. So D3 never compared colours, and a brown
// cent and a red cent both normalise to their own cheek. On its face the
// owner's concern is already handled.
//
// BUT THE UNDERLYING INSTINCT SURVIVES THAT, and this file is the test. Toning
// and wear are NOT UNIFORM ACROSS THE RELIEF. Oxidation and grime collect in the
// recesses — the deepest cuts, which on this coin are the beard and the hair
// grooves — while circulation rubs the raised fields bright. If that is real,
// then a circulated cent has a LARGER deep-to-cheek spread than a pristine one,
// and that is a change in the RATIO, which normalising to the cheek does not
// remove. The references would then not be measuring the same quantity, and
// averaging them would be wrong.
//
// It would also explain a finding this project has been treating as noise: the
// cent's mid-jaw round reported that its two struck references DISAGREE IN SIGN
// there. Different preservation states would be a mechanism for exactly that.
//
// THE PREDICTION, stated before looking: if the effect is real, the DEEP patches
// (beardJaw, beardChin, hairMid, hairBack) should spread much more across
// references than the SHALLOW ones (forehead, temple, brow), because shallow
// relief has nowhere for grime to sit. If instead every patch spreads about the
// same, the variance is lighting or registration and the owner's mechanism is
// not what is driving it.
//
// Run: node coloringbook/judge/_jp4wear.mjs
import * as L from '../_qtlib.mjs';
import { discOf } from './_jq42indep.mjs';
import { readFileSync } from 'node:fs';

const TP = JSON.parse(readFileSync(new URL('../_tonepatches-penny.json', import.meta.url).pathname, 'utf8'));
const P = TP.patches ?? TP;
const DISCS = JSON.parse(readFileSync(new URL('./_jp1discs.json', import.meta.url).pathname, 'utf8'));

// Ordered by preservation state, worst-preserved first. The label is what the
// coin IS, not a quality judgement about the photograph.
const REFS = [
  ['penny-obv.jpg', 'circulated'],
  ['penny-obv-2.jpg', 'circulated'],
  ['penny-obv-3.jpg', 'circulated'],
  ['penny-obv-4.png', 'uncirculated?'],
  ['penny-obv-1991d.png', '1991-D red unc'],
  ['penny-obv-usmint-flat.png', '2013-S proof'],
  ['penny-obv-proof2021.jpg', '2021-S deep cameo proof'],
];

// DEPTH CLASS, declared before any number is read. Deep = the cut recesses
// where grime collects. Shallow = raised or near-field relief.
const DEEP = new Set(['beardJaw', 'beardChin', 'hairMid', 'hairBack', 'hairOverEar']);
const SHALLOW = new Set(['forehead', 'temple', 'brow']);

const rows = [];
for (const [f, state] of REFS) {
  try {
    const g = await L.grey(P0(f));
    // Frozen fit where one exists; otherwise fit it the same way the
    // independence instruments do. Which was used is PRINTED, because a fit
    // chosen at run time is not the same evidence as a frozen one.
    let d = DISCS[f], via = 'frozen';
    if (!d) { d = await discOf(f); via = 'fitted now'; }
    const rv = L.ratioVector(g, d, P);   // returns { meds, rat } — not a flat map

    // NORMALISER SANITY CHECK, and it is the whole reason this file can be
    // trusted. If the disc fit is wrong the cheek patch lands somewhere that is
    // not the cheek, and EVERY ratio inflates or deflates by one common factor
    // — which looks exactly like a dramatic tone finding. Guard: compare the
    // cheek median against the median of the whole disc, a yardstick the patch
    // placement cannot bias. On a correctly registered cent the cheek is the
    // brightest open skin and reads 0.84-1.39 of the disc median.
    const { d: px, w, h } = g;
    const vals = [];
    for (let y = 0; y < h; y += 3) for (let x = 0; x < w; x += 3) {
      const u = (x - d.cx) / d.R, v = (y - d.cy) / d.R;
      if (Math.hypot(u, v) <= 0.85) vals.push(px[y * w + x]);
    }
    vals.sort((a, b) => a - b);
    const discMed = vals[vals.length >> 1];
    const cd = rv.meds.cheek / discMed;
    const ok = cd >= 0.75 && cd <= 1.40;
    console.log(`${f.padEnd(28)} R ${String(d.R).padStart(8)}  ${via.padEnd(10)}  cheek/disc ${cd.toFixed(3)}${ok ? '' : '   !! NORMALISER OUT OF FAMILY — EXCLUDED, this is a registration failure not a tone reading'}`);
    if (ok) rows.push({ f, state, rat: rv.rat, via });
  } catch (e) {
    console.log(`${f.padEnd(28)} UNMEASURED — ${String(e.message).slice(0, 70)}`);
  }
}
function P0(f) { return new URL('../ref/' + f, import.meta.url).pathname; }

if (rows.length < 2) { console.log('\nfewer than two references measurable — nothing to compare.'); process.exit(1); }

const names = (Array.isArray(P) ? P : Object.values(P)).map((p) => p.name).filter((n) => n !== 'cheek');
console.log('\ncheek-normalised ratio, per reference (colour discarded; brightness cancels)\n');
console.log('patch'.padEnd(13) + rows.map((r) => r.f.slice(0, 11).padStart(13)).join(''));
for (const r of rows) console.log(''.padEnd(13) + rows.map((x) => (x === r ? '' : '')).join(''));
console.log(''.padEnd(13) + rows.map((r) => r.state.slice(0, 11).padStart(13)).join('') + '\n');

const spread = {};
for (const n of names) {
  const vs = rows.map((r) => r.rat[n]).filter((v) => Number.isFinite(v));
  if (!vs.length) continue;
  const lo = Math.min(...vs), hi = Math.max(...vs);
  spread[n] = hi - lo;
  const cls = DEEP.has(n) ? 'DEEP ' : SHALLOW.has(n) ? 'shall' : '     ';
  console.log(`${cls}${n.padEnd(12)}` + rows.map((r) => (Number.isFinite(r.rat[n]) ? r.rat[n].toFixed(3) : '  -  ').padStart(13)).join('') + `   spread ${(hi - lo).toFixed(3)}`);
}

const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
const deepS = names.filter((n) => DEEP.has(n) && spread[n] != null).map((n) => spread[n]);
const shalS = names.filter((n) => SHALLOW.has(n) && spread[n] != null).map((n) => spread[n]);
console.log(`\nmean spread across references — DEEP patches ${mean(deepS).toFixed(3)}   SHALLOW patches ${mean(shalS).toFixed(3)}`);
if (!deepS.length || !shalS.length || !Number.isFinite(mean(deepS)) || !Number.isFinite(mean(shalS))) {
  console.log('\n!! NO USABLE SPREADS — deep or shallow set is empty or NaN. This is a FAILURE REPORT,');
  console.log('   not a verdict. The first version of this file printed a confident "NOT SUPPORTED"');
  console.log('   from exactly this state, which is the fault this project keeps catching in others.');
  process.exit(1);
}
const ratio = mean(deepS) / mean(shalS);
console.log(`deep/shallow = ${ratio.toFixed(2)}x`);
console.log(ratio > 1.5
  ? `  -> THE OWNER'S MECHANISM IS SUPPORTED. The deep cuts disagree between references far more\n     than the shallow relief does, which is what differential toning and wear predict and what\n     uniform lighting error does NOT. Cheek-normalisation removes overall colour and brightness\n     but NOT this. References at different preservation states are not measuring the same\n     quantity, and averaging them is averaging two different coins.`
  : ratio < 0.8
    ? `  -> CONTRADICTED: the shallow patches disagree MORE. Whatever drives the spread, it is not\n     grime in the recesses.`
    : `  -> NOT SUPPORTED and not refuted: deep and shallow spread about equally, which points at\n     lighting or registration rather than at preservation state. The owner's mechanism is not\n     what is driving the disagreement here.`);
