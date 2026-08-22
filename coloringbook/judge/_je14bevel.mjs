// BUCK r14 (specialist) — IS THE BEVEL OVERHANG A PROPERTY OF THE BIRD, OR OF
// `struck()`?
//
// Raising the wingtips to where the photograph puts them made `struck()`'s
// white offset copy hang further outside the roundel, and introduced an
// overhang at `full` where round 12 had none. Before that is called a defect
// in the drawing, the question has to be asked the other way round: given the
// offset `struck()` applies at each tier, WHICH wingtips could it contain?
//
// The offset is a viewBox constant per box width — `reliefOff(boxW) =
// min(1.7, max(0.55, 118/boxW))`, translated by (-o, -o) — and `fitOff()`
// cannot clamp it here because this subject passes `rField = 0` (a note has no
// field circle) and `spendOf()` bounds against a circle centred at (50,50)
// anyway, which two off-centre ellipses are not. That is `_jk9fitseal.mjs`'s
// own published finding, and it is a shared helper this round may not touch.
//
// So: for each tier, solve for the largest wingtip height b (units above the
// roundel centre) that keeps the bevelled tip inside, at the note's own
// measured span — and compare it with the note's own wingtip.
//
//   ((a + o)/rx)^2 + ((b + o)/ry)^2 <= 1,  a = span/2
//
// This is target-side arithmetic plus one constant read out of coins.js's own
// exported box width. It contains no opinion.
//
//   node coloringbook/judge/_je14bevel.mjs
const mod = await import('../../src/art/coins.js');

const EAG = { rx: 8.875, ry: 12.375 };                 // frozen `_jb4target.json`
const SPAN = 0.8242, TIP = 0.5112;                     // `_je14anat.mjs`, mean of two refs
const SPAN_LO = 0.8211, SPAN_HI = 0.8273;              // the two references' own values
const TIP_LO = 0.445, TIP_HI = 0.506;                  // the three UNCONTAMINATED tip readings
const SIZES = { icon: 38, mid: 54, full: 190 };
const reliefOff = (boxW) => Math.min(1.7, Math.max(0.55, 118 / boxW));

console.log('The bevel offset against the note\'s own wingtip. a = half-span, b = tip height above centre.');
console.log('tier  boxW    o     | max b the bevel can contain at a = 0.8242*rx | the NOTE\'s b | verdict');
for (const [tier, size] of Object.entries(SIZES)) {
  const boxW = mod.coinPx('buck', size).w;
  const o = reliefOff(boxW);
  const a = SPAN * EAG.rx;
  const term = 1 - ((a + o) / EAG.rx) ** 2;
  const bMax = term <= 0 ? null : Math.sqrt(term) * EAG.ry - o;
  const bNote = TIP * EAG.ry;
  console.log(`${tier.padEnd(5)} ${boxW.toFixed(1).padStart(6)} ${o.toFixed(2)}  | ` +
    (bMax === null
      ? '  NONE — the SPAN alone already breaches, at any tip height '
      : `${bMax.toFixed(2).padStart(6)}u (dy ${(bMax / EAG.ry).toFixed(3)})                    `) +
    `| ${bNote.toFixed(2)}u  | ${bMax !== null && bNote <= bMax ? 'containable' : 'NOT CONTAINABLE'}`);
}
console.log('\nSame question the other way: what UNIFORM shrink f about the roundel centre would');
console.log('contain the bevel, applied to a bird drawn at the measured proportions?');
for (const [tier, size] of Object.entries(SIZES)) {
  const o = reliefOff(mod.coinPx('buck', size).w);
  let f = 1;
  for (; f > 0.3; f -= 0.001)
    if (((SPAN * EAG.rx * f + o) / EAG.rx) ** 2 + ((TIP * EAG.ry * f + o) / EAG.ry) ** 2 <= 1) break;
  console.log(`  ${tier.padEnd(5)} f ${f.toFixed(3)}  -> the bird would be ${(100 * (1 - f)).toFixed(1)}% smaller than the note's,` +
    ` span ${(SPAN * f).toFixed(4)} against the note's ${SPAN}`);
}
console.log('\nSENSITIVITY — the same question at each reference\'s own span and tip, not the mean.');
for (const [tier, size] of Object.entries(SIZES)) {
  const o = reliefOff(mod.coinPx('buck', size).w);
  const rows = [];
  for (const s of [SPAN_LO, SPAN_HI]) for (const t of [TIP_LO, TIP_HI]) {
    const r = Math.hypot((s * EAG.rx + o) / EAG.rx, (t * EAG.ry + o) / EAG.ry);
    rows.push(`s${s.toFixed(4)}/t${t.toFixed(3)} r${r.toFixed(3)}`);
  }
  console.log(`  ${tier.padEnd(5)} ${rows.join('  ')}   ${rows.every((r) => Number(r.slice(r.indexOf('r', 8) + 1)) > 1) ? 'ALL FOUR CORNERS BREACH' : 'some corner is containable'}`);
}

// RESPONSE TEST — shrink the span and the frontier must move out.
{
  const o = reliefOff(mod.coinPx('buck', 190).w);
  const b = (s) => { const t = 1 - ((s * EAG.rx + o) / EAG.rx) ** 2; return t <= 0 ? NaN : Math.sqrt(t) * EAG.ry - o; };
  console.log(`\nRESPONSE TEST — span 0.8242 -> 0.7000 at full: max containable b ${b(0.8242).toFixed(2)}u -> ${b(0.7).toFixed(2)}u` +
    `  ${b(0.7) > b(0.8242) ? 'MOVED as expected' : '*** UNTRUSTED ***'}`);
}
// NULL TEST — with o = 0 the constraint is the roundel itself, and the note's
// own wingtip must come back containable, because the note's bird fits its own
// roundel by construction.
{
  const a = SPAN * EAG.rx, bMax = Math.sqrt(1 - (a / EAG.rx) ** 2) * EAG.ry;
  console.log(`NULL TEST — with the bevel offset set to 0: max b ${bMax.toFixed(2)}u vs the note's ${(TIP * EAG.ry).toFixed(2)}u` +
    `  ${TIP * EAG.ry <= bMax ? 'containable — the note\'s bird does fit its own roundel, so a breach is the offset\'s' : '*** the note\'s own bird does not fit its own roundel — the rim or the tip is wrong ***'}`);
}
