// NICKEL round 0 — THE DISC FIT FOR EVERY NICKEL REFERENCE.
//
// Every radial locus on a coin is expressed in units of a fitted disc, and the
// fit is itself a LOCATED FEATURE. Round 4 on the quarter found an instrument
// that had fitted a padding rectangle on three files and nobody could see it,
// because no fit in four rounds had ever been drawn on its own source. So:
//
//   §4.2  every strategy's answer for every file is printed, never just the
//         chosen one (this imports `best()` from _jq41disc.mjs UNEDITED, at
//         its published hash — the judge may not edit an instrument to get an
//         answer, and _jq41disc already prints grey / hough / chroma).
//   §4.3  `_jn1disc-overlay.png` draws the chosen fit on its own source.
//   §S1   the p95 boundary residual as a % of R is printed, because a
//         reference that fits to 11% of R cannot carry a +-1.5-unit geometric
//         gate at r 40 (that is +-4.5 units of registration error alone).
//
// Two nickel references need handling `best()` cannot do:
//   nickel-obv-3.png       Schlag's PLASTER MODEL, cut out on alpha. It has no
//                          disc at all (§11.2) and is not fitted here.
//   nickel-proof-both.jpg  a two-coin plate. Split at the midline first, into
//                          _jn-proofboth-obv.png / -rev.png, then fitted.
//
// Run: node coloringbook/judge/_jn1disc.mjs
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { best } from './_jq41disc.mjs';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
const HERE = (f) => new URL('./' + f, import.meta.url).pathname;

// ── split the two-coin plate, once, into the ref directory's sibling ────────
export async function splitPlate() {
  const src = P('nickel-proof-both.jpg');
  const m = await sharp(src).metadata();
  const half = Math.floor(m.width / 2);
  const out = [];
  for (const [tag, left] of [['obv', 0], ['rev', half]]) {
    const p = P(`_jn-proofboth-${tag}.png`);
    await sharp(src).extract({ left, top: 0, width: half, height: m.height })
      // pad with the plate's own corner background so a flood can SEE background
      .extend({ top: 60, bottom: 60, left: 60, right: 60, background: '#ffffff' })
      .png().toFile(p);
    out.push(`_jn-proofboth-${tag}.png`);
  }
  return { size: [m.width, m.height], files: out };
}

const FILES = [
  'nickel-obv.jpg', 'nickel-obv-4.jpg', 'nickel-obv-5.JPG', 'nickel-obv-proof.png',
  'nickel-rev.jpg', 'nickel-rev-2.png', 'nickel-rev-proof.png',
  '_jn-proofboth-obv.png', '_jn-proofboth-rev.png',
];

if (import.meta.url === `file://${process.argv[1]}`) {
  const plate = await splitPlate();
  console.log(`nickel-proof-both.jpg is ${plate.size[0]}x${plate.size[1]}; split at the midline -> ${plate.files.join(', ')}\n`);

  const out = {}, tiles = [], tile = 460;
  const S = (d) => (d ? `cx${d.cx.toFixed(0)} cy${d.cy.toFixed(0)} R${d.R.toFixed(1)}` : '—');
  console.log('§4.2 — EVERY candidate fit for EVERY nickel reference.\n');
  console.log('file                        grey flood/alpha      hough outer edge      chroma flood          chosen  agree%   p95resid%R');
  for (const f of FILES) {
    let b;
    try { b = await best(f); } catch (e) { console.log(`${f.padEnd(28)} FAILED: ${e.message}`); continue; }
    const d = b.chosen;
    const p95 = d.p95 != null ? (100 * d.p95 / d.R) : null;
    out[f] = { cx: +d.cx.toFixed(2), cy: +d.cy.toFixed(2), R: +d.R.toFixed(2),
      via: b.chroma ? 'chroma' : b.grey ? 'grey' : 'hough',
      p95resid_pctR: p95 == null ? null : +p95.toFixed(2), ambiguous: b.ambiguous };
    console.log(`${f.padEnd(28)}${S(b.grey).padEnd(22)}${S(b.hough).padEnd(22)}${S(b.chroma).padEnd(22)}` +
      `${(b.chroma ? 'chroma' : b.grey ? 'grey' : 'hough').padEnd(8)}${(b.agreePc.join('/')).padEnd(9)}` +
      `${p95 == null ? '  —' : p95.toFixed(2)}` +
      (b.ambiguous ? '   <-- AMBIGUOUS (§4.2): no other strategy within 2% — LOOK' : ''));

    const W = b.hough.W, H = b.hough.H;
    const s = tile / Math.max(W, H), ox = (tile - W * s) / 2, oy = (tile - H * s) / 2;
    const cc = (r, col, w) => `<circle cx="${ox + d.cx * s}" cy="${oy + d.cy * s}" r="${d.R * s * r}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
    const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${tile}" height="${tile}">` +
      cc(1, '#00ff6a', 2) + cc(0.862, '#ff2d55', 1.2) + cc(0.9404, '#ffd60a', 1.2) +
      `<text x="4" y="14" font-family="monospace" font-size="13" fill="#fff">${f}  R=${d.R.toFixed(1)}</text></svg>`);
    tiles.push(await sharp(P(f)).flatten({ background: '#808080' })
      .resize(tile, tile, { fit: 'contain', background: '#202020' }).composite([{ input: svg }]).png().toBuffer());
  }
  const cols = 3, rows = Math.ceil(tiles.length / cols);
  await sharp({ create: { width: cols * tile, height: rows * tile, channels: 3, background: '#404040' } })
    .composite(tiles.map((b, i) => ({ input: b, left: (i % cols) * tile, top: ((i / cols) | 0) * tile })))
    .png().toFile(HERE('_jn1disc-overlay.png'));
  console.log(`\noverlay: _jn1disc-overlay.png  green = fitted R, red = 0.862R (viewBox 40.5, our mid field circle), yellow = 0.9404R (viewBox 44.2, the quarter's MEASURED rim seat, for scale)`);
  writeFileSync(HERE('_jn1discs.json'), JSON.stringify(out, null, 1));
  console.log('\nwrote _jn1discs.json');
}
