// _jn16over — the §4.3 overlay for _jn16back's determination.
//
// _jn16back concludes that the five back samples at d(edge) < 5 carry genuine
// two-reference strand agreement. §4.3 says a located feature is not published
// until it has been drawn on the source and read back, because an in-bounds,
// response-tested, bound-checked number has been the WRONG FEATURE four times
// in this project. So: draw, on BOTH photographs, at the same five places,
//
//   RED    the angle the tensor reports on nickel-obv-unc2004.jpg  (ref A)
//   BLUE   the angle the tensor reports on nickel-obv-5.JPG        (ref B)
//   GREEN  the frozen D1 outline, so the reader can see how far the
//          silhouette edge actually is from each sample
//   the sample disc at RAD=1.0, dashed, which is the disc T3b's surviving
//   agreement was measured in — if the edge is inside that circle the
//   determination is wrong.
//
// Both angle sets are drawn on BOTH photographs deliberately: a tick measured
// on A and drawn on B must still lie along B's strands if the two references
// are seeing the same physical hair.
//
// Run: node coloringbook/judge/_jn16over.mjs
import sharp from 'sharp';
import { localToPx, pxPerLocal, REFP } from './_jn14map.mjs';
import { OUTLINE } from './_jn15locus.mjs';

const HERE = (f) => new URL('./' + f, import.meta.url).pathname;
const REFS = ['nickel-obv-unc2004.jpg', 'nickel-obv-5.JPG'];

// the five points and the two angle sets, at RAD=1.0 (T3b's surviving row)
const PTS = [
  { k: '-24,-26', x: -24, y: -26 },
  { k: '-32,2', x: -32, y: 2 },
  { k: '-32,-2', x: -32, y: -2 },
  { k: '-28,-14', x: -28, y: -14 },
  { k: '-28,10', x: -28, y: 10 },
];
// measured by _jn15strand.mjs at the frozen RAD=3.0 (the published values)
const A = { '-24,-26': -41.9, '-32,2': -76.1, '-32,-2': -59.3, '-28,-14': -54.9, '-28,10': 74.2 };
const B = { '-24,-26': -35.9, '-32,2': -79.7, '-32,-2': -68.1, '-28,-14': -62.7, '-28,10': 77.4 };

for (const file of REFS) {
  const ppl = pxPerLocal(file);
  const m = await sharp(REFP(file)).metadata();
  const P = (lx, ly) => localToPx(file, lx, ly);
  const seg = (lx, ly, deg, L, col, w) => {
    const a = deg * Math.PI / 180;
    const p1 = P(lx - L * Math.cos(a), ly - L * Math.sin(a));
    const p2 = P(lx + L * Math.cos(a), ly + L * Math.sin(a));
    return `<line x1="${p1[0].toFixed(1)}" y1="${p1[1].toFixed(1)}" x2="${p2[0].toFixed(1)}" y2="${p2[1].toFixed(1)}" stroke="${col}" stroke-width="${(w * ppl).toFixed(2)}" stroke-linecap="round"/>`;
  };
  const parts = [];
  // the frozen outline
  parts.push(`<polygon points="${OUTLINE.map(([x, y]) => P(x, y).map((v) => v.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="#00c853" stroke-width="${(0.18 * ppl).toFixed(2)}"/>`);
  for (const p of PTS) {
    const c = P(p.x, p.y);
    // the RAD=1.0 sample disc that T3b's agreement was measured in
    parts.push(`<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${(1.0 * ppl).toFixed(1)}" fill="none" stroke="#ffffff" stroke-width="${(0.10 * ppl).toFixed(2)}" stroke-dasharray="${(0.3 * ppl).toFixed(1)},${(0.3 * ppl).toFixed(1)}"/>`);
    parts.push(seg(p.x, p.y, A[p.k], 2.2, '#ff2d55', 0.26));
    parts.push(seg(p.x, p.y, B[p.k], 2.2, '#2979ff', 0.26));
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${m.width}" height="${m.height}">${parts.join('')}</svg>`;
  const buf = await sharp(REFP(file)).composite([{ input: Buffer.from(svg) }]).png().toBuffer();
  // crop to the back of the wig
  const a = P(-18, -32), b = P(-38, 16);
  const L = Math.max(0, Math.round(Math.min(a[0], b[0]))), T = Math.max(0, Math.round(Math.min(a[1], b[1])));
  const W = Math.min(m.width - L, Math.round(Math.abs(b[0] - a[0]))), H = Math.min(m.height - T, Math.round(Math.abs(b[1] - a[1])));
  if (!(W > 4 && H > 4 && Number.isFinite(W) && Number.isFinite(H))) throw new Error(`_jn16over: crop is not finite for ${file} (${W}x${H}) — N3 says assert before rasterising`);
  const out = HERE(`_jn16over-${file.replace(/[^a-z0-9]/gi, '_')}.png`);
  await sharp(buf).extract({ left: L, top: T, width: W, height: H }).resize({ width: 900 }).png().toFile(out);
  console.log(`${file}: ${ppl.toFixed(2)} px/local, crop ${W}x${H} -> ${out.split('/').pop()}`);
}
console.log('RED = angle measured on unc2004; BLUE = angle measured on obv-5; GREEN = frozen D1 outline;');
console.log('dashed white = the RAD=1.0 sample disc T3b measured the surviving agreement in.');
