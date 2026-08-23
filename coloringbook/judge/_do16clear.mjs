// §7 ARITHMETIC FOR THE DATE — the clearance between the date's ink and the
// bust's own contour, measured on the emitted render rather than argued.
//
// WHY IT EXISTS. Enlarging the date (see INSCRIPTION.dime) grows the word
// toward the truncation, and on this face the truncation is a DIAGONAL: the
// bust's cut runs from viewBox (49.5, 85.4) up to (77.9, 63.8), straight past
// the date's top-left corner. §7's rule is that two marks need a gap of at
// least (w1 + w2)/2 + 0.4 between their centrelines, i.e. they must not touch;
// the cent's lapel and the dime's own jaw cap are both on record as marks that
// were grown until they overlapped something.
//
// METHOD. Render the face, then render it again with the date's own `<text>`
// element deleted. The pixels that differ ARE the date, exactly, with no
// geometry to get wrong. The bust's contour is every dark pixel in the lower
// right quadrant of the second render. Report the minimum Euclidean distance
// between the two sets, in viewBox units, and where it occurs.
//
// usage: node coloringbook/judge/_do16clear.mjs [px]
import sharp from 'sharp';
import { join } from 'node:path';
import { ROOT } from './_paths.mjs';

const PX = Number(process.argv[2] || 1600);
const { coinSVG } = await import(join(ROOT, 'src/art/coins.js'));
const svg = coinSVG('dime', PX, { side: 'obverse' });
const re = /<text x="[\d.]+" y="[\d.]+"[^>]*>(\d{4})<\/text>/;
if (!re.test(svg)) throw new Error('_do16clear: the date <text> was not found in the emitted dime obverse');
const without = svg.replace(re, '');

const raw = async (s) => {
  const { data, info } = await sharp(Buffer.from(s)).flatten({ background: '#ffffff' })
    .raw().toBuffer({ resolveWithObject: true });
  return { d: data, W: info.width, H: info.height, ch: info.channels };
};
const A = await raw(svg), B = await raw(without);
const W = A.W, H = A.H;
const date = [], bust = [];
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const p = (y * W + x) * A.ch;
  const vx = ((x + 0.5) / W) * 100, vy = ((y + 0.5) / H) * 100;
  if (A.d[p] !== B.d[p] || A.d[p + 1] !== B.d[p + 1] || A.d[p + 2] !== B.d[p + 2]) { date.push([vx, vy]); continue; }
  if (vx < 48 || vx > 90 || vy < 55 || vy > 95) continue;
  // `deep` is #6b737b (107), `motif` #8e969e (142), `rim` #8b939b (139) and the
  // field #cfd5da (207); 150 separates every drawn thing from the field. THE
  // RIM IS EXCLUDED BY RADIUS and reported on its own line: the first run of
  // this instrument lumped the two together and reported a gap of 0.085 that
  // did not move when the date moved DOWN, because the number was the distance
  // to the RIM and not to the bust at all.
  if (B.d[p] < 150 && Math.hypot(vx - 50, vy - 50) <= 42.5) bust.push([vx, vy]);
}
// a uniform grid over the bust set keeps this O(n) without changing the answer
// by more than the grid cell, which is reported
const G = 0.5, grid = new Map();
for (const [x, y] of bust) {
  const k = `${Math.round(x / G)},${Math.round(y / G)}`;
  if (!grid.has(k)) grid.set(k, []);
  grid.get(k).push([x, y]);
}
let best = Infinity, at = null;
for (const [ax, ay] of date) {
  const gi = Math.round(ax / G), gj = Math.round(ay / G);
  for (let a = -4; a <= 4; a++) for (let b = -4; b <= 4; b++) {
    const c = grid.get(`${gi + a},${gj + b}`);
    if (!c) continue;
    for (const [bx, by] of c) {
      const d = (ax - bx) ** 2 + (ay - by) ** 2;
      if (d < best) { best = d; at = [ax, ay, bx, by]; }
    }
  }
}
// clearance to the FIELD CIRCLE, which is where the rim starts
const rimGap = Math.min(...date.map(([x, y]) => 44.07 - Math.hypot(x - 50, y - 50)));
const dx = date.map((p) => p[0]), dy = date.map((p) => p[1]);
console.log(`render ${W}px, one viewBox unit = ${(W / 100).toFixed(2)} px`);
console.log(`date ink   ${date.length} px, box x ${Math.min(...dx).toFixed(2)}..${Math.max(...dx).toFixed(2)}  y ${Math.min(...dy).toFixed(2)}..${Math.max(...dy).toFixed(2)}`);
console.log(`            max radius from centre ${Math.max(...date.map(([x, y]) => Math.hypot(x - 50, y - 50))).toFixed(2)}  (field circle 44.07, blank 47)`);
console.log(`bust dark  ${bust.length} px in x 48..90, y 55..95`);
console.log(`\nMINIMUM GAP date -> BUST (r <= 42.5): ${Math.sqrt(best).toFixed(3)} viewBox units`);
console.log(`  at date (${at[0].toFixed(2)}, ${at[1].toFixed(2)})  bust (${at[2].toFixed(2)}, ${at[3].toFixed(2)})`);
console.log(`MINIMUM GAP date -> the FIELD CIRCLE at r 44.07: ${rimGap.toFixed(3)} viewBox units`);
console.log(`\n§7 wants (w1 + w2)/2 + 0.4 between CENTRELINES; between EDGES, as measured`);
console.log(`here, the same rule is simply "> 0.4". A gap at or under 0 means the two`);
console.log(`marks touch and read as one.`);
