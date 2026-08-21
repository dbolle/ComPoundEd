// SPECIALIST INSTRUMENT — round 1, D5 lettering. THE FONT'S OWN METRICS,
// measured by rasterising, because every cap-height and span number in D5 is a
// statement about this font and round 0 used three different guesses for it.
//
// Two quantities, both measured, neither taken from memory or from a table:
//
//   CAP RATIO   ink height from the baseline to the cap top, ÷ font-size, for
//               FLAT-TOPPED capitals (H, E, I, L, T). Round letters (O, C, G,
//               S) overshoot the cap line by design and are reported
//               separately so the overshoot is visible rather than folded in.
//   ADV RATIO   mean advance ÷ font-size for the strings the coins actually
//               carry. Measured as (ink width of the whole string) ÷ (number
//               of advances), which understates the advance by the two outer
//               side bearings; the same number is therefore also measured the
//               other way, by rendering "HH" and "H" and differencing, which
//               is the advance exactly. Both are printed.
//
// Why ADV matters: `arcText`'s `advF` sets the ANGULAR SPAN, and D5-span gates
// it against the coin. `_jq4band.json` freezes the quarter's top legend at cap
// 6.9 and span 170° over 23 advances at r 40 — 5.16 units per advance, i.e.
// the coin's own face advances 0.748 × its cap height. If our face advances
// materially wider than that, then hitting the coin's cap AND the coin's span
// at once is only possible with the glyphs CONDENSED, and the amount of
// condensation is (coin's advance/cap) ÷ (our advance/cap). That ratio is what
// this file exists to supply, and both of its inputs are outside our drawing:
// one is the frozen target, one is the font.
//
// §4 RESPONSE: the ratios are scale-free, so the test is that they are
//   INVARIANT under font-size — measured at 100, 200 and 400 and required to
//   agree to better than one raster pixel's worth. A metric that moved with
//   size would be measuring the rasteriser, not the face.
// §4.1 NULL: the ink-box search is over the whole canvas; the canvas bounds are
//   printed and a box touching one is a failure report (it means the string
//   overflowed the canvas — which it did on the first attempt at a 1000px
//   canvas, and is why the canvas is now sized from the string length).
// §4.3 OVERLAY: writes _jl1font-overlay.png — the measured cap line, baseline
//   and ink box drawn on the rendered string, to be looked at.
//
// Run: node coloringbook/judge/_jl1font.mjs
import sharp from 'sharp';

export const FONT = "ui-rounded, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

async function ink(text, size, W, H, baselineY, x) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
    + `<rect width="${W}" height="${H}" fill="#fff"/>`
    + `<text x="${x}" y="${baselineY}" text-anchor="middle" font-family="${FONT}" font-size="${size}" font-weight="700" fill="#000">${text}</text></svg>`;
  const { data, info } = await sharp(Buffer.from(svg)).greyscale().raw().toBuffer({ resolveWithObject: true });
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (let j = 0; j < info.height; j++) {
    for (let i = 0; i < info.width; i++) {
      if (data[j * info.width + i] < 128) { if (i < x0) x0 = i; if (i > x1) x1 = i; if (j < y0) y0 = j; if (j > y1) y1 = j; }
    }
  }
  const atBound = x0 <= 0 || y0 <= 0 || x1 >= info.width - 1 || y1 >= info.height - 1;
  return { x0, x1, y0, y1, w: x1 - x0 + 1, h: y1 - y0 + 1, atBound, W, H };
}

const FLAT = ['H', 'E', 'I', 'L', 'T', 'N', 'U', 'D'];
const ROUND = ['O', 'C', 'G', 'S', 'Q'];
const STRINGS = [
  'UNITED STATES OF AMERICA', 'QUARTER DOLLAR', 'ONE CENT', 'ONE DIME',
  'FIVE CENTS', 'E PLURIBUS UNUM', 'MONTICELLO', 'IN GOD WE TRUST', 'LIBERTY',
];

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('=== cap ratio (ink above baseline ÷ font-size) ===');
  console.log('§4 response: measured at three font-sizes; a ratio that moves with size is measuring the rasteriser.');
  for (const size of [100, 200, 400]) {
    const H = size * 3, W = size * 3, by = size * 2;
    const flat = [], round = [];
    for (const c of FLAT) { const b = await ink(c, size, W, H, by, W / 2); flat.push((by - b.y0) / size); }
    for (const c of ROUND) { const b = await ink(c, size, W, H, by, W / 2); round.push((by - b.y0) / size); }
    const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
    console.log(`  size ${String(size).padStart(3)}  flat caps ${FLAT.join('')} -> ${mean(flat).toFixed(4)}  (spread ${(Math.max(...flat) - Math.min(...flat)).toFixed(4)})`
      + `   round caps ${ROUND.join('')} -> ${mean(round).toFixed(4)}`);
  }

  console.log('\n=== advance ratio (advance ÷ font-size) ===');
  console.log('method A — differencing "XX" against "X": the advance exactly, no side bearings.');
  const size = 400, W = 4000, H = 1600, by = 1100;
  let accA = 0, nA = 0;
  for (const c of [...FLAT, ...ROUND, 'A', 'R', 'M', 'B', 'F', 'P', 'V', 'W', 'Y']) {
    const one = await ink(c, size, W, H, by, W / 2), two = await ink(c + c, size, W, H, by, W / 2);
    if (one.atBound || two.atBound) { console.log(`  ${c}: INK BOX TOUCHES CANVAS BOUND — failure report, not a value`); continue; }
    accA += (two.w - one.w) / size; nA++;
  }
  const advA = accA / nA;
  console.log(`  mean over ${nA} capitals: ${advA.toFixed(4)} × font-size`);

  console.log('method B — whole-string ink width ÷ advances (understates by two side bearings):');
  for (const s of STRINGS) {
    const b = await ink(s, size, W, H, by, W / 2);
    if (b.atBound) { console.log(`  "${s}": INK BOX TOUCHES CANVAS BOUND (canvas ${W}x${H}) — failure report`); continue; }
    console.log(`  "${s}".padEnd  ${(b.w / size / (s.length - 1)).toFixed(4)} × font-size  (${s.length - 1} advances, ink ${(b.w / size).toFixed(3)} em)`);
  }

  console.log('\n=== what this implies for D5 ===');
  const capFlat = (await (async () => {
    const H2 = 1200, W2 = 1200, by2 = 800, s2 = 400;
    const v = []; for (const c of FLAT) { const b = await ink(c, s2, W2, H2, by2, W2 / 2); v.push((by2 - b.y0) / s2); }
    return v.reduce((a, b) => a + b, 0) / v.length;
  })());
  console.log(`  our face: advance ${advA.toFixed(4)} em, cap ${capFlat.toFixed(4)} em  -> advance/cap ${(advA / capFlat).toFixed(4)}`);
  console.log(`  the COIN (from _jq4band.json, frozen, nothing of ours in it): cap 6.9 units, span 170° over 23 advances at r 40`);
  const coinAdv = ((170 * Math.PI) / 180) * 40 / 23;
  console.log(`            -> ${coinAdv.toFixed(3)} units per advance, advance/cap ${(coinAdv / 6.9).toFixed(4)}`);
  console.log(`  CONDENSATION needed to hit both gates at once: ${((coinAdv / 6.9) / (advA / capFlat)).toFixed(4)}`);

  // §4.3 overlay
  const s3 = 300, W3 = 2600, H3 = 700, by3 = 500;
  const b3 = await ink('UNITED STATES', s3, W3, H3, by3, W3 / 2);
  const ov = `<svg xmlns="http://www.w3.org/2000/svg" width="${W3}" height="${H3}"><rect width="${W3}" height="${H3}" fill="#fff"/>`
    + `<text x="${W3 / 2}" y="${by3}" text-anchor="middle" font-family="${FONT}" font-size="${s3}" font-weight="700" fill="#000">UNITED STATES</text>`
    + `<line x1="0" y1="${by3}" x2="${W3}" y2="${by3}" stroke="#0a0" stroke-width="3"/>`
    + `<line x1="0" y1="${by3 - capFlat * s3}" x2="${W3}" y2="${by3 - capFlat * s3}" stroke="#e00" stroke-width="3"/>`
    + `<rect x="${b3.x0}" y="${b3.y0}" width="${b3.w}" height="${b3.h}" fill="none" stroke="#00e" stroke-width="3"/></svg>`;
  await sharp(Buffer.from(ov)).png().toFile(new URL('./_jl1font-overlay.png', import.meta.url).pathname);
  console.log('\nwrote _jl1font-overlay.png — green = baseline, red = measured cap line, blue = ink box. §4.3: look at it.');
}
