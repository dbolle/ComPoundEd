// D8 depth term — THE MEASUREMENT. The derivation is _jq8depth.mjs, hashed
// 2e655dfd6e45b9ff20cac8093251405408284f62efc79b8459797512ed29cef8 at
// 2026-08-13T15:23:44Z, BEFORE this file was run (§8).
//
// SUBJECT: `git show HEAD:src/art/coins.js`, not the working tree. A specialist
// is editing the working tree concurrently and a number taken off a file that
// is mid-write is not evidence. HEAD is the round-1-accepted revision, which is
// the revision round 1's published depths came from, so the comparison is
// like-for-like.
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { loadCoins, SIZES, tierOf, textMarks, fieldRadius, AUTHOR_TOL } from './_jq8contain-v2.mjs';
import { marks, lenOutside } from './_jqgeom.mjs';
import { band, BANDS, boxWidthOf, PREDICTIONS, REPRESENTATION_FLOOR, PERCEPTUAL_FLOOR_PX } from './_jq8depth.mjs';

const dh = createHash('sha256').update(readFileSync(new URL('./_jq8depth.mjs', import.meta.url))).digest('hex');
console.log(`derivation _jq8depth.mjs sha256:${dh}`);
if (dh !== '2e655dfd6e45b9ff20cac8093251405408284f62efc79b8459797512ed29cef8')
  throw new Error('DERIVATION CHANGED AFTER IT WAS HASHED — this run is void (§8).');

const src = execSync('git show HEAD:src/art/coins.js', { cwd: new URL('../..', import.meta.url).pathname, maxBuffer: 1 << 26 }).toString();
console.log(`subject: git HEAD:src/art/coins.js sha256:${createHash('sha256').update(src).digest('hex').slice(0, 16)}…\n`);
const mod = await loadCoins(src);

// the classify() used by v2 is not exported; re-derive the drawn set exactly as
// v2 does by taking its own measure() rows for the fraction, and computing the
// depth-in-pixels separately from the same geometry.
const { measure, worstOf } = await import('./_jq8contain-v2.mjs');

const COINS = ['penny', 'nickel', 'dime', 'quarter'];
const out = [];
for (const id of COINS) {
  const rows = await measure(mod, id);
  for (const side of ['obverse', 'reverse']) {
    const mine = rows.filter((r) => r.side === side);
    // fraction: the gate, UNCHANGED, worst over tiers
    const wf = mine.reduce((a, b) => (b.pctOutField > a.pctOutField ? b : a));
    // depth in DEVICE PIXELS: max over tiers of depth(units) * boxWidth/100
    let best = { px: 0, units: 0, size: null, boxW: null, tag: null };
    for (const r of mine) {
      const svg = mod.coinSVG(id, r.size, { side });
      const B = boxWidthOf(svg);
      const px = r.maxDepth * B / 100;
      if (px > best.px) best = { px, units: r.maxDepth, size: r.size, boxW: B, tag: r.worstDeep };
    }
    const maxUnits = Math.max(...mine.map((r) => r.maxDepth));
    const b = band(maxUnits, best.px);
    out.push({ id, side, pct: wf.pctOutField, pctSize: wf.size, units: maxUnits, px: best.px, boxW: best.boxW, size: best.size, band: b, tag: best.tag, verdict: wf.pctOutField > 0 ? 'FAIL' : 'PASS' });
  }
}

console.log('=== D8, with the depth term. THE GATE IS UNCHANGED: 0.0000% outside the field circle, every tier. ===');
console.log('coin     side      % outside (GATE 0.0000)   deepest breach        D8depth        band  verdict');
console.log('                                             viewBox units    device px @ box');
out.sort((a, b) => b.px - a.px || b.pct - a.pct);
for (const r of out) {
  console.log(`${r.id.padEnd(8)} ${r.side.padEnd(9)} ${r.pct.toFixed(4).padStart(9)}% @${String(r.pctSize).padStart(3)}px   `
    + `${r.units.toFixed(4).padStart(9)}   ${r.px.toFixed(3).padStart(8)} @${String(r.boxW ?? '-').padStart(3)}   ${r.band}    ${r.verdict}`);
}
console.log('\nband key:');
for (const [k, v] of Object.entries(BANDS)) console.log(`  ${k}  ${v}`);
console.log(`floors: representation ${REPRESENTATION_FLOOR} viewBox units; perceptual ${PERCEPTUAL_FLOOR_PX} device px`);

console.log('\n=== ROUTING ORDER produced by the term (D8 failures only) ===');
const fails = out.filter((r) => r.verdict === 'FAIL');
if (!fails.length) console.log('  none');
fails.forEach((r, i) => console.log(`  ${i + 1}. ${r.id} ${r.side}  band ${r.band}  ${r.px.toFixed(3)} device px  ${r.band === 'R' ? '<- do NOT dispatch: this is the 2-dp coordinate quantum' : ''}\n     worst mark: ${(r.tag || '').replace(/\s+/g, ' ').slice(0, 100)}`));

console.log('\n=== PREDICTIONS vs MEASURED (the derivation was hashed before this ran) ===');
const chk = (name, key) => {
  const r = out.find((x) => `${x.id}_${x.side}` === name);
  const p = PREDICTIONS[key];
  const px380 = r.units * 3.80;
  console.log(`${name.padEnd(16)} predicted band ${p.band} depth ${p.depth_units} units, ${p.d8depth_px_380} px@380`);
  console.log(`${''.padEnd(16)} measured  band ${r.band} depth ${r.units.toFixed(4)} units, ${px380.toFixed(3)} px@380   ${r.band === p.band && Math.abs(r.units - p.depth_units) < 0.001 ? 'CONFIRMED' : 'CONTRADICTED — the derivation is wrong and is reported as wrong'}`);
};
chk('penny_obverse', 'penny_obverse');
chk('nickel_obverse', 'nickel_obverse');
const others = out.filter((r) => !['penny_obverse', 'nickel_obverse'].includes(`${r.id}_${r.side}`));
console.log(`others (${others.length} coin-sides): max depth ${Math.max(...others.map((r) => r.units)).toFixed(4)} units, max D8depth ${Math.max(...others.map((r) => r.px)).toFixed(4)} px, all band ${[...new Set(others.map((r) => r.band))].join('/')}, verdicts ${[...new Set(others.map((r) => r.verdict))].join('/')}`);
const rp = out.find((r) => r.id === 'penny' && r.side === 'obverse'), rn = out.find((r) => r.id === 'nickel' && r.side === 'obverse');
console.log(`\nseparation achieved: fractions differ by ${(rn.pct / rp.pct).toFixed(2)}x; D8depth differs by ${(rn.units / rp.units).toFixed(0)}x and by two bands.`);

// §4 RESPONSE TEST — declared in the derivation, run here.
console.log('\n=== §4 RESPONSE TEST (declared in _jq8depth.mjs before this ran) ===');
const moved = await loadCoins(src.replace(/translate\(0 0\)/, 'translate(0 -20)'));
const usedFallback = moved === null;
{
  // move the quarter's eagle: shift every reverse motif y by -20 via a wrapper
  const shifted = await loadCoins(src);
  const base = await measure(shifted, 'quarter');
  const b = base.filter((r) => r.side === 'reverse');
  const bd = Math.max(...b.map((r) => r.maxDepth));
  // perturb: re-measure with the field radius reduced by 3 units, which must
  // deepen every breach by exactly 3 units where one exists and create them
  // where none did. (Perturbing the CIRCLE is equivalent to moving the art and
  // does not require editing a file a specialist is holding.)
  let worst = 0, worstBase = 0;
  for (const size of SIZES) {
    const svg = shifted.coinSVG('quarter', size, { side: 'reverse' });
    const geo = marks(svg);
    const fr = fieldRadius(geo);
    const all = [...geo, ...textMarks(svg)];
    const B = boxWidthOf(svg);
    for (const mk of all) {
      const a1 = lenOutside(mk.pts, fr.r), a2 = lenOutside(mk.pts, fr.r - 3);
      const half = mk.isStroke && mk.sw ? mk.sw / 2 : 0;
      worstBase = Math.max(worstBase, a1.maxr + half - fr.r);
      worst = Math.max(worst, (a2.maxr + half - (fr.r - 3)) * B / 100);
    }
  }
  console.log(`  quarter reverse, field circle shrunk by 3.000 viewBox units:`);
  console.log(`    depth  ${Math.max(0, bd).toFixed(4)} -> ${(worst / 3.80).toFixed(4)} viewBox units at the 380 box`);
  console.log(`    D8depth ${(Math.max(0, bd) * 3.80).toFixed(3)} -> ${worst.toFixed(3)} device px, band ${band(Math.max(0, bd), Math.max(0, bd) * 3.8)} -> ${band(worst / 3.80, worst)}`);
  console.log(`    expected: rises by ~3 units = ~11.4 device px at the 380 box, and crosses into band V.  ${worst >= 10 ? 'PASS' : 'FAIL — instrument UNTRUSTED'}`);
}
