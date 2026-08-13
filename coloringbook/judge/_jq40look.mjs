// ROUND 4, §4.3 — DRAW BOTH DISC FITS ON THE SOURCE AND LOOK.
// red   = _rvdisc.fit()  (background flood / alpha), the fit round 0-2 used
// green = _jq40disc.houghDisc() (outer-edge Hough), round 4's
// yellow = the 0.80R histogram sampling circle of _jqvalley.mjs, drawn on the
//          fit _jqvalley ITSELF computed, which is a third fit again.
import sharp from 'sharp';
import { fit } from '../_rvdisc.mjs';
import { houghDisc } from './_jq40disc.mjs';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;

// _jqvalley.mjs's fitDisc, re-implemented verbatim for audit. NOT imported:
// that file runs its report at module top level (COIN-JUDGE §1.1/R4).
export async function valleyFit(file) {
  const { data: d, info } = await sharp(P(file)).greyscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;
  const corner = [];
  for (const [x, y] of [[2, 2], [w - 3, 2], [2, h - 3], [w - 3, h - 3]])
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) corner.push(d[(y + dy) * w + (x + dx)]);
  corner.sort((a, b) => a - b);
  const bg = corner[corner.length >> 1], tol = 26;
  const seen = new Uint8Array(w * h); const st = [];
  const push = (x, y) => { const i = y * w + x; if (!seen[i] && Math.abs(d[i] - bg) <= tol) { seen[i] = 1; st.push(i); } };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (st.length) { const i = st.pop(), x = i % w, y = (i / w) | 0;
    if (x > 0) push(x - 1, y); if (x < w - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1); if (y < h - 1) push(x, y + 1); }
  let x0 = w, x1 = 0, y0 = h, y1 = 0, n = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!seen[y * w + x]) {
    n++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const R = ((x1 - x0) + (y1 - y0)) / 4;
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, R, bg, n,
    aspect: (x1 - x0) / Math.max(1, y1 - y0), fill: n / (Math.PI * R * R) };
}

const FILES = process.argv.slice(2).length ? process.argv.slice(2)
  : ['dime-obv-2.jpg', 'qp1963-obv-pad.png', 'qp1963-rev-pad.png', 'qp1964-obv-pad.png',
     'qp1964-rev-pad.png', 'quarter-proof-ebay.jpg', 'q1995d-rev.png', 'quarter-rev-2.png'];

const tile = 460, cols = 4, tiles = [];
console.log('file                      flood/alpha fit          hough fit               _jqvalley fitDisc');
for (const f of FILES) {
  const a = await fit(f).catch(() => null);
  const b = await houghDisc(f);
  const c = await valleyFit(f);
  console.log(`${f.padEnd(24)} ${a ? `cx${a.cx.toFixed(0)} cy${a.cy.toFixed(0)} R${a.R.toFixed(1)}`.padEnd(24) : '(failed)'.padEnd(24)}` +
    `cx${b.cx.toFixed(0)} cy${b.cy.toFixed(0)} R${b.R.toFixed(1)}`.padEnd(24) +
    `cx${c.cx.toFixed(0)} cy${c.cy.toFixed(0)} R${c.R.toFixed(1)} bg${c.bg} aspect${c.aspect.toFixed(2)} fill${c.fill.toFixed(2)}`);
  const s = tile / Math.max(b.W, b.H), ox = (tile - b.W * s) / 2, oy = (tile - b.H * s) / 2;
  const C = (d, col, wid, mul = 1) => d ? `<circle cx="${ox + d.cx * s}" cy="${oy + d.cy * s}" r="${d.R * s * mul}" fill="none" stroke="${col}" stroke-width="${wid}"/>` : '';
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${tile}" height="${tile}">` +
    C(a, '#ff2d55', 2) + C(b, '#00ff6a', 2) + C(c, '#ffe600', 1.4, 0.80) +
    `<text x="4" y="14" font-family="monospace" font-size="13" fill="#fff">${f}</text></svg>`);
  tiles.push(await sharp(P(f)).flatten({ background: '#808080' })
    .resize(tile, tile, { fit: 'contain', background: '#202020' }).composite([{ input: svg }]).png().toBuffer());
}
const rows = Math.ceil(tiles.length / cols);
const out = new URL('./_jq4-discs.png', import.meta.url).pathname;
await sharp({ create: { width: cols * tile, height: rows * tile, channels: 3, background: '#404040' } })
  .composite(tiles.map((b, i) => ({ input: b, left: (i % cols) * tile, top: ((i / cols) | 0) * tile })))
  .png().toFile(out);
console.log('\nwritten ' + out + '   red=_rvdisc  green=hough  yellow=_jqvalley 0.80R sampling circle');
