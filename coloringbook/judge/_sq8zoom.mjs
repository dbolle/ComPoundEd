// SPECIALIST, quarter reverse — §4.3, the deciding picture.
// _sq7width2.mjs could not separate the wingtip from UNITED STATES OF AMERICA
// with EITHER de-leak (opening to 1.2 units, or a radial cut at r 36), so the
// half-widths it printed are device-PLUS-legend and must not be quoted. Before
// anything else, look at the left wingtip at full resolution with a radius
// ladder on it and read the boundary off by hand.
//
// Generator for: coloringbook/judge/_sq8-zoom-*.png
import sharp from 'sharp';
import { normalise, N, SPAN } from '../_rvnorm.mjs';
import { discOf } from './_jq42indep.mjs';

const FILES = process.argv.slice(2).length ? process.argv.slice(2)
  : ['qp1963-rev-pad.png', 'qp1964-rev-pad.png', 'quarter-rev-3.jpg', 'quarter-rev-2.png'];
// crop window in viewBox units — the LEFT wing, from its apex to below the tip
const X0 = +(process.env.SQ_X0 ?? 8), X1 = +(process.env.SQ_X1 ?? 52);
const Y0 = +(process.env.SQ_Y0 ?? 16), Y1 = +(process.env.SQ_Y1 ?? 72);
const SC = +(process.env.SQ_SC ?? 18);                                     // output px per viewBox unit

for (const f of FILES) {
  const d = await discOf(f);
  const g = await normalise(f, d);
  const buf = Buffer.alloc(N * N);
  for (let p = 0; p < N * N; p++) buf[p] = Math.max(0, Math.min(255, Math.round(g[p])));
  // full frame at high resolution, then crop the window
  const FULL = Math.round(2 * SPAN * 47 * SC);      // px across the +-SPAN frame
  const X2p = (X) => ((X - 50) / 47 + SPAN) * FULL / (2 * SPAN);
  const big = await sharp(buf, { raw: { width: N, height: N, channels: 1 } })
    .resize(FULL, FULL, { kernel: 'cubic' }).toColourspace('srgb').png().toBuffer();
  const left = Math.round(X2p(X0)), top = Math.round(X2p(Y0));
  const w = Math.round(X2p(X1)) - left, h = Math.round(X2p(Y1)) - top;

  let ov = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">`;
  // radius rings every 2 units from r 26 to r 40, centred on the disc centre
  for (let r = 26; r <= 42; r += 2) {
    const R = X2p(50 + r) - X2p(50);
    const col = r === 36 ? '#ffe600' : (r % 4 === 0 ? '#00c8ff' : '#00c8ff');
    ov += `<circle cx="${X2p(50) - left}" cy="${X2p(50) - top}" r="${R}" fill="none" stroke="${col}" stroke-width="${r === 36 ? 2 : 1}" opacity="${r === 36 ? 0.95 : 0.5}"/>`;
    ov += `<text x="${X2p(50 - r) - left + 3}" y="${X2p(50) - top - 4}" font-family="monospace" font-size="13" fill="${col}">${r}</text>`;
  }
  // viewBox grid every 5 units
  for (let X = Math.ceil(X0/5)*5; X <= X1; X += 5) ov += `<line x1="${X2p(X) - left}" y1="0" x2="${X2p(X) - left}" y2="${h}" stroke="#ff8800" stroke-width="0.6" opacity="0.45"/><text x="${X2p(X) - left + 2}" y="13" font-family="monospace" font-size="12" fill="#ff8800">${X}</text>`;
  for (let Y = Math.ceil(Y0/5)*5; Y <= Y1; Y += 5) ov += `<line x1="0" y1="${X2p(Y) - top}" x2="${w}" y2="${X2p(Y) - top}" stroke="#ff8800" stroke-width="0.6" opacity="0.45"/><text x="2" y="${X2p(Y) - top - 3}" font-family="monospace" font-size="12" fill="#ff8800">${Y}</text>`;
  ov += '</svg>';

  const out = `_sq8-zoom${process.env.SQ_TAG || ''}-${f.replace(/\W+/g, '_')}.png`;
  await sharp(big).extract({ left, top, width: w, height: h })
    .composite([{ input: Buffer.from(ov) }]).png()
    .toFile(new URL('./' + out, import.meta.url).pathname);
  console.log(`${f.padEnd(24)} -> ${out}  (${w}x${h}, X ${X0}..${X1}, Y ${Y0}..${Y1}, rings r26..42 step 2, r36 in yellow)`);
}
