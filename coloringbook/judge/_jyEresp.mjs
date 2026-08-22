// ROUND (cent obverse, mid-jaw) — RESPONSE + NULL test for `_jy3cheek.mjs`,
// on a SYNTHETIC subject whose answer is known in advance.
//
// The obvious response test — translate the sampling grid and require the
// answer to translate with it — does NOT work for this instrument, and the
// failed attempt is recorded rather than hidden: `_jy3cheek.mjs --shift 2`
// moves the two frozen normaliser patches as well as the profile, so the seed
// lands on the beard, the threshold inverts, and the run correctly refuses. An
// instrument whose threshold is derived from its own subject cannot be tested
// by moving the subject.
//
// So the test is built the other way. Generate an image in `penny-obv-2.jpg`'s
// frame that is SMOOTH above a chosen local y and STRIPED below it, put a
// smooth disc where the frozen `cheek` patch is and a striped one where
// `beardJaw` is, and require the instrument to return the chosen y (less the
// texture-window radius, which is the estimator's known bias). Sweep the chosen
// y: the answer must track it 1:1. That is the response test.
//
// The null half: an image that is smooth EVERYWHERE must return "no crossing"
// in every column rather than a number, and an image that is striped everywhere
// must refuse at the seed check.
//
// Run: node coloringbook/judge/_jyEresp.mjs
import sharp from 'sharp';
import { DISCS, localToDisc, PENNY } from '../_pylib.mjs';
import { cheekFloor } from './_jy3cheek.mjs';

const D = DISCS['penny-obv-2.jpg'];
const W = 903, H = 901;
const S = PENNY.s / 47 * D.R;                    // px per local unit

async function synth(mode, y0, file) {
  const d = Buffer.alloc(W * H, 200);
  for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
    const ly = ((py - D.cy) / D.R * 47 + 50 - PENNY.CY) / PENNY.s;
    const striped = mode === 'all' ? true : mode === 'none' ? false : ly >= y0;
    // 1.6-local-unit stripes, the spacing the cent's whiskers actually run at
    d[py * W + px] = striped ? (Math.floor(py / (0.8 * S)) % 2 ? 120 : 235) : 200;
  }
  await sharp(d, { raw: { width: W, height: H, channels: 1 } }).png().toFile(file);
  return file;
}

console.log('RESPONSE TEST — a synthetic subject whose boundary is known.');
console.log(`  frame = penny-obv-2.jpg's disc (R ${D.R}, ${S.toFixed(2)} px per local unit); stripes 1.6 local units`);
console.log('  the instrument measures where the SMOOTH region ends, with a known bias of one texture-window radius (1.2)\n');
console.log('   true boundary   returned floor at x=+4   returned + 1.2   error');
let worst = 0;
for (const y0 of [-6, -3, 0, 3, 6]) {
  const f = await synth('split', y0, `coloringbook/_pv/_jyEresp-${y0}.png`);
  const r = await cheekFloor('SYNTH', 0, true, D, f);
  if (!r) {
    // Expected, and it is the seed check doing its job: the frozen `cheek`
    // centre is at local y -1.5, so a boundary at or above that puts the seed
    // inside the striped region and the reference is correctly refused. The
    // sweep therefore only exercises boundaries BELOW the normaliser, which is
    // where the real one is (-3.6 to +2.5). Recorded, not hidden.
    console.log(`   ${String(y0).padStart(6)}          refused at the seed check — the boundary is ABOVE the frozen cheek centre (y -1.5), so there is no smooth seed. Correct refusal, not a value.`);
    continue;
  }
  const got = r.floor[4];
  const err = got === null ? NaN : (got + 1.2) - y0;
  if (Math.abs(err) > worst) worst = Math.abs(err);
  console.log(`   ${String(y0).padStart(6)}          ${got === null ? 'no crossing' : got.toFixed(2).padStart(8)}          ${got === null ? '   —' : (got + 1.2).toFixed(2).padStart(6)}   ${Number.isNaN(err) ? 'n/a' : err.toFixed(2)}`);
}
console.log(`\n  worst error over the sweep: ${worst.toFixed(2)} local units — the answer tracks the boundary 1:1 if this is small.`);

console.log('\nNULL TEST — degenerate subjects must refuse, not return a number.');
for (const mode of ['none', 'all']) {
  const f = await synth(mode, 0, `coloringbook/_pv/_jyEresp-${mode}.png`);
  const r = await cheekFloor('SYNTH', 0, true, D, f);
  if (mode === 'none') {
    const cols = r ? Object.values(r.floor).filter((v) => v !== null).length : 0;
    const all = r ? Object.keys(r.floor).length : 0;
    console.log(`  smooth everywhere: ${r ? `flood covered ${(100 * r.frac).toFixed(1)}% of the locus -> ${r.frac > 0.9 ? 'DEGENERATE, refused (correct)' : `returned ${cols}/${all} columns *** should have been refused as degenerate ***`}` : 'refused (correct)'}`);
  } else {
    console.log(`  striped everywhere: ${r ? '*** returned a value — WRONG, the seed is not smooth ***' : 'refused at the seed check (correct)'}`);
  }
}
