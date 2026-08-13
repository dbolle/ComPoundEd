// ROUND 4, step 0 — DISC FITS for the new proof references, WITH AN OVERLAY.
//
// COIN-JUDGE.md §4.3: an instrument that LOCATES a feature must emit what it
// found, and the judge overlays it and looks. A disc fit is a located feature.
// _jqvalley.mjs fits a disc and prints only R; nothing has ever been drawn.
//
// §4.1: `fit()` ray-casts to a search bound of min(W,H); a radius equal to that
// bound, or a p95 residual above 1% of R, is reported as a failure not a value.
// §4.2: coinMask SELECTS a background polarity from the border median; both the
// polarity and the median are printed for every file.
import sharp from 'sharp';
import { fit } from '../_rvdisc.mjs';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;

export const QREV = ['quarter-rev.jpg', 'quarter-rev-2.png', 'quarter-rev-3.jpg',
  'quarter-rev-5.jpg', 'quarter-rev-6.jpg', 'q1995d-rev.png',
  'qp1963-rev-pad.png', 'qp1964-rev-pad.png'];
export const QOBV = ['quarter-obv.jpg', 'quarter-obv-2.jpg', 'quarter-obv-3.png',
  'quarter-obv-4.jpg', 'qp1963-obv-pad.png', 'qp1964-obv-pad.png',
  'quarter-proof-ebay.jpg'];
export const CONTROLS = ['nickel-rev-2.png', 'penny-rev-2.png', 'dime-rev-2.jpg'];

export async function fits(files) {
  const out = {};
  for (const f of files) {
    const r = await fit(f);
    out[f] = { cx: +r.cx.toFixed(2), cy: +r.cy.toFixed(2), R: +r.R.toFixed(2),
      W: r.W, H: r.H, via: r.via, p95pc: +(100 * r.p95 / r.R).toFixed(2),
      bound: Math.min(r.W, r.H) };
  }
  return out;
}

// draw the fitted circle, the 0.90R analysis mask and the centre cross on the
// source, scaled to 360px. One PNG per file, tiled into a contact sheet.
export async function overlay(files, D, outPath, tile = 360, cols = 4) {
  const tiles = [];
  for (const f of files) {
    const d = D[f];
    // draw in RESIZED space so the annotation can never exceed the canvas
    const s = tile / Math.max(d.W, d.H);
    const ox = (tile - d.W * s) / 2, oy = (tile - d.H * s) / 2;
    const cx = ox + d.cx * s, cy = oy + d.cy * s, R = d.R * s;
    const svg = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${tile}" height="${tile}">` +
      `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#ff2d55" stroke-width="2"/>` +
      `<circle cx="${cx}" cy="${cy}" r="${R * 0.90}" fill="none" stroke="#00e5ff" stroke-width="1.2"/>` +
      `<circle cx="${cx}" cy="${cy}" r="${R * 0.80}" fill="none" stroke="#ffe600" stroke-width="1.2"/>` +
      `<path d="M${cx - 8} ${cy}h16M${cx} ${cy - 8}v16" stroke="#ff2d55" stroke-width="1.5"/>` +
      `<text x="4" y="14" font-family="monospace" font-size="12" fill="#ffffff">${f}</text>` +
      `</svg>`);
    const buf = await sharp(P(f)).flatten({ background: '#808080' })
      .resize(tile, tile, { fit: 'contain', background: '#202020' })
      .composite([{ input: svg }]).png().toBuffer();
    tiles.push(buf);
  }
  const rows = Math.ceil(tiles.length / cols);
  await sharp({ create: { width: cols * tile, height: rows * tile, channels: 3, background: '#404040' } })
    .composite(tiles.map((b, i) => ({ input: b, left: (i % cols) * tile, top: ((i / cols) | 0) * tile })))
    .png().toFile(outPath);
  return outPath;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const files = [...QREV, ...QOBV, ...CONTROLS];
  const D = await fits(files);
  console.log('=== round 4 disc fits (§2.1). p95 = 95th pct |boundary residual| as % of R ===');
  console.log('null test (§4.1): rayCast bound = min(W,H); R at the bound is a failure report.\n');
  for (const f of files) {
    const d = D[f];
    const flags = [];
    if (d.p95pc > 1.0) flags.push('NOT SQUARE-ON');
    if (d.R >= d.bound * 0.499) flags.push(`R ${d.R} at/near raycast bound ${d.bound}`);
    console.log(`${f.padEnd(24)} ${String(d.W).padStart(4)}x${String(d.H).padEnd(4)} via ${d.via.padEnd(16)} ` +
      `cx ${String(d.cx).padStart(8)} cy ${String(d.cy).padStart(8)} R ${String(d.R).padStart(8)}  p95 ${String(d.p95pc).padStart(5)}%` +
      (flags.length ? '   <-- ' + flags.join('; ') : ''));
  }
  const out = new URL('./_jq4-fits.png', import.meta.url).pathname;
  await overlay(files, D, out);
  console.log(`\noverlay written: ${out}   (red = fitted R, cyan = 0.90R, yellow = 0.80R)`);
  console.log('\nDISCS:');
  console.log(JSON.stringify(Object.fromEntries(files.map((f) => [f, { cx: D[f].cx, cy: D[f].cy, R: D[f].R }])), null, 1));
}
