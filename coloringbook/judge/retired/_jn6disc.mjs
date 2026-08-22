// _jn6disc — the disc fit for `nickel-obv-unc2004.jpg`, the reference the r6
// brief says "landed today and is not yet wired into anything".
//
// `_jn1discs.json` is a FROZEN TARGET and is not touched here (§1: editing one
// voids the round). This writes a SEPARATE file, `_jn6discs.json`, carrying
// only the one file `_jn1disc.mjs` never saw.
//
// §4.2 the selection test: `best()` from `_jq41disc.mjs` is imported UNEDITED
//      at its published hash and every strategy's answer is printed, not only
//      the chosen one.
// §4.3 the overlay: `_jn6disc-overlay.png` draws the chosen fit on its own
//      source, beside `nickel-obv.jpg` fitted the same way, so the two can be
//      compared by eye at the same normalised scale.
// §S1  the p95 boundary residual as a % of R is printed, because a fit that is
//      loose cannot carry a tone patch of radius 0.05R.
//
// Run: node coloringbook/judge/_jn6disc.mjs
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { best } from './_jq41disc.mjs';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
const HERE = (f) => new URL('./' + f, import.meta.url).pathname;
const FILES = ['nickel-obv-unc2004.jpg', 'nickel-obv.jpg', 'nickel-obv-5.JPG'];

const out = {}, tiles = [], tile = 500;
const S = (d) => (d ? `cx${d.cx.toFixed(0)} cy${d.cy.toFixed(0)} R${d.R.toFixed(1)}` : '—');
console.log('§4.2 — EVERY candidate fit is printed. nickel-obv.jpg and -5.JPG are here as');
console.log('CONTROLS: they already carry a frozen fit in _jn1discs.json and this run must');
console.log('reproduce it, or the instrument is measuring something else.\n');
console.log('file                        grey flood/alpha      hough outer edge      chroma flood          chosen  agree%   p95resid%R');
for (const f of FILES) {
  const b = await best(f);
  const d = b.chosen;
  const p95 = d.p95 != null ? (100 * d.p95 / d.R) : null;
  out[f] = { cx: +d.cx.toFixed(2), cy: +d.cy.toFixed(2), R: +d.R.toFixed(2),
    via: b.chroma ? 'chroma' : b.grey ? 'grey' : 'hough',
    p95resid_pctR: p95 == null ? null : +p95.toFixed(2), ambiguous: b.ambiguous };
  console.log(`${f.padEnd(28)}${S(b.grey).padEnd(22)}${S(b.hough).padEnd(22)}${S(b.chroma).padEnd(22)}` +
    `${(b.chroma ? 'chroma' : b.grey ? 'grey' : 'hough').padEnd(8)}${(b.agreePc.join('/')).padEnd(9)}` +
    `${p95 == null ? '  —' : p95.toFixed(2)}` +
    (b.ambiguous ? '   <-- AMBIGUOUS (§4.2)' : ''));

  const W = b.hough.W, H = b.hough.H;
  const s = tile / Math.max(W, H), ox = (tile - W * s) / 2, oy = (tile - H * s) / 2;
  const cc = (r, col, w) => `<circle cx="${ox + d.cx * s}" cy="${oy + d.cy * s}" r="${d.R * s * r}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${tile}" height="${tile}">` +
    cc(1, '#00ff6a', 2) + cc(0.9377, '#ff2d55', 1.2) + cc(0.9040, '#ffd60a', 1.2) +
    `<text x="4" y="14" font-family="monospace" font-size="13" fill="#ff2d55">${f}  R=${d.R.toFixed(1)}  p95 ${p95 == null ? '?' : p95.toFixed(2)}%</text></svg>`);
  tiles.push(await sharp(P(f)).flatten({ background: '#808080' })
    .resize(tile, tile, { fit: 'contain', background: '#202020' }).composite([{ input: svg }]).png().toBuffer());
}
await sharp({ create: { width: tiles.length * tile, height: tile, channels: 3, background: '#404040' } })
  .composite(tiles.map((b, i) => ({ input: b, left: i * tile, top: 0 })))
  .png().toFile(HERE('_jn6disc-overlay.png'));
console.log('\noverlay: _jn6disc-overlay.png  green = fitted R, red = 0.9377R (viewBox 44.07, our mid/full field circle), yellow = 0.9040R (viewBox 42.5, our ICON field circle)');
writeFileSync(HERE('_jn6discs.json'), JSON.stringify(out, null, 1));
console.log('wrote _jn6discs.json  (SEPARATE from the frozen _jn1discs.json, which is untouched)');
