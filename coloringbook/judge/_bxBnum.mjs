// BUCK obverse round — the CORNER NUMERALS: our INK extent, measured by
// rendering the live obverse with the glyphs and with them suppressed and
// diffing the pixels (the `_jk9text.mjs` method), never estimated from a font
// advance; and the note's, read off a 1-unit ladder on BOTH obverse
// photographs through the printed-border fiducial.
//
// r0's comment justifies the numerals' COUNT (four, not two) and their
// CENTRES. It says nothing about their SIZE: `font-size="10"` is an authored
// value and no instrument in the library has ever compared it to the note.
//
// SUBJECTS  id `buck`, OBVERSE only.
// RESPONSE  `--response` re-runs at font-size 9 and 13 and prints how far the
//           measured ink moves, so the diff is shown to be measuring the glyph.
// REPORTS ONLY.
import sharp from 'sharp';
import { join } from 'node:path';
import { ROOT } from './_paths.mjs';
const { coinSVG } = await import(join(ROOT, 'src/art/coins.js'));
const S = 10, W = 1000, H = 560;

async function raster(svg) {
  return sharp(Buffer.from(svg.replace(/width="[\d.]+" height="[\d.]+"/, `width="${W}" height="${H}"`)))
    .resize(W, H).removeAlpha().raw().toBuffer();
}
async function inkOf(sizeOverride = null) {
  let svg = coinSVG('buck', 380, { side: 'obverse', decorative: true });
  if (sizeOverride) svg = svg.replace(/font-size="10"/g, `font-size="${sizeOverride}"`);
  // suppress ONLY the four corner <text> elements: they are the ones whose
  // font-size is 10. Assert we removed exactly four.
  const re = /<text x="[\d.]+" y="[\d.]+" text-anchor="middle" font-family="[^"]*" font-size="(?:10|9|13)"[\s\S]*?<\/text>/g;
  const hits = svg.match(re) || [];
  if (hits.length !== 4) throw new Error(`expected 4 corner <text> elements, found ${hits.length} — this instrument is invalid`);
  const without = svg.replace(re, '');
  const [a, b] = await Promise.all([raster(svg), raster(without)]);
  const boxes = [];
  const seen = new Uint8Array(W * H);
  const diff = new Uint8Array(W * H);
  for (let k = 0; k < W * H; k++) if (Math.abs(a[k * 3] - b[k * 3]) + Math.abs(a[k * 3 + 1] - b[k * 3 + 1]) + Math.abs(a[k * 3 + 2] - b[k * 3 + 2]) > 24) diff[k] = 1;
  for (let k = 0; k < W * H; k++) {
    if (!diff[k] || seen[k]) continue;
    const st = [k]; seen[k] = 1; let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1, n = 0;
    while (st.length) { const q = st.pop(); n++; const qi = q % W, qj = (q / W) | 0;
      if (qi < x0) x0 = qi; if (qi > x1) x1 = qi; if (qj < y0) y0 = qj; if (qj > y1) y1 = qj;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const ni = qi + dx, nj = qj + dy;
        if (ni < 0 || nj < 0 || ni >= W || nj >= H) continue; const nk = nj * W + ni; if (diff[nk] && !seen[nk]) { seen[nk] = 1; st.push(nk); } } }
    if (n > 40) boxes.push({ x0: x0 / S, x1: (x1 + 1) / S, y0: y0 / S, y1: (y1 + 1) / S, n });
  }
  boxes.sort((p, q) => (p.y0 - q.y0) || (p.x0 - q.x0));
  return boxes;
}

const boxes = await inkOf();
console.log(`our four corner numerals, INK extent measured by render-diff (viewBox units), font-size 10:`);
for (const b of boxes) console.log(`  X ${b.x0.toFixed(2)}..${b.x1.toFixed(2)} (w ${(b.x1 - b.x0).toFixed(2)}, centre ${((b.x0 + b.x1) / 2).toFixed(2)})   Y ${b.y0.toFixed(2)}..${b.y1.toFixed(2)} (h ${(b.y1 - b.y0).toFixed(2)}, centre ${((b.y0 + b.y1) / 2).toFixed(2)})`);
if (boxes.length !== 4) console.log(`  ** ${boxes.length} components, not 4 — a numeral is touching something **`);
const h = boxes.reduce((s, b) => s + (b.y1 - b.y0), 0) / boxes.length;
console.log(`  mean cap height ${h.toFixed(2)} viewBox units = ${(100 * h / 46).toFixed(1)}% of the printed border's height`);
if (process.argv.includes('--response')) for (const fs of [9, 13]) {
  const q = await inkOf(fs);
  const hq = q.reduce((s, b) => s + (b.y1 - b.y0), 0) / q.length;
  console.log(`  response font-size ${fs}: mean cap height ${hq.toFixed(2)} units (x${(hq / h).toFixed(3)} of font-size 10)`);
}
console.log(`
the note, read off a 1-unit ladder on BOTH obverse photographs rectified
through the printed-border fiducial (_bx3rect.mjs; crops bxA-corners-*.png).
Both photographs give the same read to the ladder's own 0.25-unit resolution:

  TOP pair     cap top Y  8.1     baseline Y 19.5    cap height 11.4
  BOTTOM pair  cap top Y 39.6     baseline Y 47.8    cap height  8.2
  LEFT  pair   glyph centre X 11.0        RIGHT pair  glyph centre X 89.4
  the four are mirror-symmetric about X 50.2

This is a HAND READ off a published ladder, not a segmenter: the numerals sit
on dense scrollwork of their own tone and every threshold tried put the
cartouche in the mask with them. It is reported at the ladder's resolution
(+-0.25 units) and no better.`);
