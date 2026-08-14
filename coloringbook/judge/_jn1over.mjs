// NICKEL round 0 — the disc-fit overlay, §4.3, done in a way that actually draws.
//
// BUG FOUND IN A PUBLISHED JUDGE INSTRUMENT, REPORTED NOT FIXED (§1.1 runs both
// ways; I may not edit the quarter's instruments to get my answer either):
//
//   _jq41disc.mjs `best()` returns
//       const h = { cx: hb.cx, cy: hb.cy, R: hb.R, via: 'hough' };
//   with NO W/H, and its own runner then does
//       const d = b.chosen, W = b.hough.W, H = b.hough.H;
//       const s = tile / Math.max(W, H);
//   so s is NaN, every circle attribute is NaN, and libvips silently drops the
//   circles. The <text> label is at a literal (4,14) and DOES render, so the
//   overlay looks like it worked. `_jq41disc-overlay.png` — the artefact §4.3
//   requires and round 4's S1 cites — has never contained a circle.
//   Reproduction: node -e "import('./coloringbook/judge/_jq41disc.mjs')
//     .then(m=>m.best('nickel-rev-2.png')).then(b=>console.log(b.hough))"
//
// This file takes W/H from sharp's own metadata and draws:
//   green   the fitted disc R                     (r/R = 1.000)
//   red     r/R = 0.8617  -> viewBox 40.5, our field circle at `mid`
//   cyan    r/R = 0.8723  -> viewBox 41.0, our field circle at `full`
//   yellow  r/R = 0.9404  -> viewBox 44.2, the quarter's MEASURED rim seat,
//           drawn only so the eye can see how far out of our band the nickel's
//           own legends actually sit. It is NOT a nickel measurement.
//
// Run: node coloringbook/judge/_jn1over.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
const HERE = (f) => new URL('./' + f, import.meta.url).pathname;
const D = JSON.parse(readFileSync(HERE('_jn1discs.json')));

const tile = 520;
const tiles = [];
for (const [f, d] of Object.entries(D)) {
  const m = await sharp(P(f)).metadata();
  const s = tile / Math.max(m.width, m.height);
  const ox = (tile - m.width * s) / 2, oy = (tile - m.height * s) / 2;
  const cx = ox + d.cx * s, cy = oy + d.cy * s;
  if (!Number.isFinite(cx) || !Number.isFinite(cy) || !Number.isFinite(d.R * s)) throw new Error(`non-finite overlay geometry for ${f}`);
  const cc = (r, col, w) => `<circle cx="${cx}" cy="${cy}" r="${d.R * s * r}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${tile}" height="${tile}">` +
    cc(1, '#00ff6a', 2) + cc(0.8617, '#ff2d55', 1.4) + cc(0.8723, '#00e5ff', 1.0) + cc(0.9404, '#ffd60a', 1.4) +
    `<line x1="${cx - 12}" y1="${cy}" x2="${cx + 12}" y2="${cy}" stroke="#00ff6a" stroke-width="1.5"/>` +
    `<line x1="${cx}" y1="${cy - 12}" x2="${cx}" y2="${cy + 12}" stroke="#00ff6a" stroke-width="1.5"/>` +
    `<rect x="0" y="0" width="${tile}" height="18" fill="#000" opacity="0.62"/>` +
    `<text x="4" y="13" font-family="monospace" font-size="12" fill="#fff">${f}  ${m.width}x${m.height}  R=${d.R.toFixed(1)}  p95=${d.p95resid_pctR}%  via ${d.via}</text></svg>`);
  tiles.push(await sharp(P(f)).flatten({ background: '#808080' })
    .resize(tile, tile, { fit: 'contain', background: '#202020' }).composite([{ input: svg }]).png().toBuffer());
  console.log(`${f.padEnd(26)} ${String(m.width).padStart(5)}x${String(m.height).padEnd(5)} R=${d.R.toFixed(1)}  p95resid ${d.p95resid_pctR}% of R  via ${d.via}`);
}
const cols = 3, rows = Math.ceil(tiles.length / cols);
await sharp({ create: { width: cols * tile, height: rows * tile, channels: 3, background: '#404040' } })
  .composite(tiles.map((b, i) => ({ input: b, left: (i % cols) * tile, top: ((i / cols) | 0) * tile })))
  .png().toFile(HERE('_jn1disc-overlay.png'));
console.log('\nwrote _jn1disc-overlay.png');
