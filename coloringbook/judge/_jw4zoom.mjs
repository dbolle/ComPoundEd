// R4 dime jaw — the two ZOOMS, drawn on the source and read at magnification.
//
// §4.3: every located feature gets an overlay and somebody looks at it. The two
// features this round is about are
//   FEATURE=jaw    the jaw shadow, local (19.4,21.4) back to (-12.6,11.6)
//   FEATURE=trunc  the bust truncation corner, D7's only over-75 knot, at
//                  local (-2.31, 41.34)
// Both are cropped in HEAD-LOCAL units and upscaled, so the same window can be
// drawn on any reference regardless of its pixel size.
//
// GRID=1 adds a 2-local-unit ladder so a reader can measure off the picture by
// hand (Appendix R3's move: a hand annotation is a legitimate frozen target).
// BARE=1 draws nothing but the ladder, so the photograph can be read without a
// magenta line sitting on the feature and telling the eye where it is.
//
// This instrument LOCATES nothing and computes no scalar; it is a viewer. Its
// response test is the registration check in _jw4reg.mjs, which it imports
// unedited and which prints a residual with bounds.
//
// Run: FEATURE=jaw node coloringbook/judge/_jw4zoom.mjs dime-obv-2.jpg
import sharp from 'sharp';
import { busted, discFor, makeMap } from './_jw4reg.mjs';
import { marks } from './_jqgeom.mjs';

const REFDIR = new URL('../ref/', import.meta.url).pathname;
const WINDOWS = {
  jaw: { x0: -18, x1: 26, y0: 4, y1: 32 },
  trunc: { x0: -12, x1: 10, y0: 28, y1: 46 },
  full: { x0: -40, x1: 30, y0: -34, y1: 46 },
};

const ref = process.argv[2] || 'dime-obv-2.jpg';
const F = process.env.FEATURE || 'jaw';
const W = WINDOWS[F];
const B = await busted();
const disc = discFor(ref);
const M = makeMap(B, disc);

// local-frame window -> photo bbox (x is mirrored by SX<0, so corners swap)
const cs = [[W.x0, W.y0], [W.x1, W.y0], [W.x0, W.y1], [W.x1, W.y1]].map(([x, y]) => M.toPx(x, y));
const L = Math.floor(Math.min(...cs.map((c) => c.px))), R2 = Math.ceil(Math.max(...cs.map((c) => c.px)));
const T = Math.floor(Math.min(...cs.map((c) => c.py))), Bo = Math.ceil(Math.max(...cs.map((c) => c.py)));
const md = await sharp(REFDIR + ref).metadata();
const left = Math.max(0, L), top = Math.max(0, T);
const w = Math.min(md.width - left, R2 - left), h = Math.min(md.height - top, Bo - top);
const K = Math.max(1, Math.round(900 / w)); // integer upscale

const P = (x, y) => { const p = M.toPx(x, y); return { x: (p.px - left) * K, y: (p.py - top) * K }; };
let g = '';
if (process.env.GRID) {
  for (let x = Math.ceil(W.x0 / 2) * 2; x <= W.x1; x += 2) {
    const a = P(x, W.y0), b = P(x, W.y1);
    g += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#ffcc00" stroke-width="${x % 10 === 0 ? 1.6 : 0.6}" opacity="0.7"/>`;
    if (x % 10 === 0) g += `<text x="${a.x + 2}" y="${a.y + 14}" fill="#ffcc00" font-size="13">${x}</text>`;
  }
  for (let y = Math.ceil(W.y0 / 2) * 2; y <= W.y1; y += 2) {
    const a = P(W.x0, y), b = P(W.x1, y);
    g += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#ffcc00" stroke-width="${y % 10 === 0 ? 1.6 : 0.6}" opacity="0.7"/>`;
    if (y % 10 === 0) g += `<text x="${a.x + 2}" y="${a.y - 3}" fill="#ffcc00" font-size="13">${y}</text>`;
  }
}
if (!process.env.BARE) {
  const draw = (d, col, wd) => {
    const m = marks(`<svg><path d="${d}"/></svg>`)[0];
    const pts = m.pts.map((p) => P(p.x, p.y));
    g += `<polyline points="${pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}" fill="none" stroke="${col}" stroke-width="${wd}"/>`;
  };
  draw(B.headD, '#00ff66', 1.8);
  const jaw = B.svg.match(/<path d="(M 19\.4 21\.4[^"]*)"/);
  if (jaw) draw(jaw[1], '#ff00cc', 2.2);
}
const ov = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w * K}" height="${h * K}">${g}</svg>`)).png().toBuffer();
const out = new URL(`./_jw4zoom-${F}-${ref.replace(/\./g, '-')}${process.env.BARE ? '-bare' : ''}${process.env.GRID ? '-grid' : ''}.png`, import.meta.url).pathname;
await sharp(REFDIR + ref).extract({ left, top, width: w, height: h })
  .resize({ width: w * K, height: h * K, kernel: 'nearest' })
  .composite([{ input: ov, left: 0, top: 0 }]).png().toFile(out);
console.log(`${ref} ${F}: crop px [${left},${top}] ${w}x${h}, upscale ${K}x, `
  + `${(M.pxPerUnit * K).toFixed(1)} output px per local unit -> ${out}`);
