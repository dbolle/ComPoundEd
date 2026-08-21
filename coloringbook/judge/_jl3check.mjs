// SPECIALIST INSTRUMENT — round 3, D5 lettering. DOES THE DRAWING ACTUALLY
// COME OUT AT THE MEASURED SIZE?
//
// `_jl3derive.mjs` computes `size` and `ls` from the reference. That arithmetic
// leans on one number rendered once — the face's natural ink width per string —
// and on the assumption that `letter-spacing` composes linearly with it. Both
// are checkable in one render, so they are checked rather than assumed: this
// draws the exact string at the exact size and spacing `coins.js` will use, in
// the same pipeline, and reports the ink box in VIEWBOX units against the
// number measured off the photograph.
//
// §4 RESPONSE: each row is also drawn at ls +- 0.2 viewBox units; the ink width
//   must move by (n-1) x 0.2 and the cap must not move at all.
// §4.1 NULL: the ink box is a full-canvas scan and canvas contact is reported.
//
// Run: node coloringbook/judge/_jl3check.mjs
import sharp from 'sharp';

const FONT = "ui-rounded, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const PX = 40;                    // device px per viewBox unit — a big render

async function ink(text, size, ls) {
  const W = 3600, H = 900;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`
    + `<rect width="${W}" height="${H}" fill="#fff"/>`
    + `<text x="${W / 2}" y="${H * 0.7}" text-anchor="middle" font-family="${FONT}"`
    + ` font-size="${size * PX}" font-weight="700" fill="#000"${ls ? ` letter-spacing="${ls * PX}"` : ''}>${text}</text></svg>`;
  const { data, info } = await sharp(Buffer.from(svg)).greyscale().raw().toBuffer({ resolveWithObject: true });
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (let j = 0; j < info.height; j++) for (let i = 0; i < info.width; i++)
    if (data[j * info.width + i] < 128) {
      if (i < x0) x0 = i; if (i > x1) x1 = i; if (j < y0) y0 = j; if (j > y1) y1 = j;
    }
  return { w: (x1 - x0 + 1) / PX, cap: (y1 - y0 + 1) / PX,
    atBound: x0 <= 0 || x1 >= W - 1 || y0 <= 0 || y1 >= H - 1 };
}

const ROWS = [
  // text, size, ls, target ink width, target cap  (targets from _jl3derive.mjs)
  ['E PLURIBUS', 5.49, -0.6789, 29.30, 4.13],
  ['UNUM', 5.49, -0.6414, 16.05, 4.10],
];
console.log(`render check at ${PX} device px per viewBox unit, same pipeline as the coin`);
console.log('text          size    ls        ink w    target   d        cap     target  d');
for (const [t, size, ls, tw, tc] of ROWS) {
  const b = await ink(t, size, ls);
  console.log(`${t.padEnd(12)}  ${size.toFixed(2)}  ${ls.toFixed(4).padStart(8)}  ${b.w.toFixed(3).padStart(6)}   ${tw.toFixed(2).padStart(6)}`
    + `  ${(b.w - tw).toFixed(3).padStart(7)}  ${b.cap.toFixed(3).padStart(6)}  ${tc.toFixed(2).padStart(5)}  ${(b.cap - tc).toFixed(3).padStart(6)}`
    + `${b.atBound ? '  *** AT CANVAS BOUND ***' : ''}`);
}
// §3 D12 — the numbers say the width is right; they cannot say whether a
// negative letter-spacing has run the glyphs into each other. So write the
// picture and look at it.
{
  const W = 3600, H = 700;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/>`;
  ROWS.forEach(([t, size, ls], i) => {
    svg += `<text x="${W / 2}" y="${240 + i * 280}" text-anchor="middle" font-family="${FONT}"`
      + ` font-size="${size * PX}" font-weight="700" fill="#111" letter-spacing="${ls * PX}">${t}</text>`;
    svg += `<text x="40" y="${240 + i * 280}" font-family="monospace" font-size="34" fill="#c00">ls ${ls.toFixed(3)}</text>`;
  });
  svg += '</svg>';
  await sharp(Buffer.from(svg)).png().toFile(new URL('./_jl3check-penny-epu.png', import.meta.url).pathname);
  console.log('\nwrote _jl3check-penny-epu.png — the two cent lines at the derived spacing, LOOK at it (§3 D12)');
}

console.log('\n§4 RESPONSE — ls +- 0.2 viewBox units');
for (const [t, size, ls] of ROWS) {
  const n = t.length - 1;
  const a = await ink(t, size, ls - 0.2), b = await ink(t, size, ls), c = await ink(t, size, ls + 0.2);
  console.log(`${t.padEnd(12)}  ink w ${a.w.toFixed(3)} / ${b.w.toFixed(3)} / ${c.w.toFixed(3)}`
    + `   steps ${(b.w - a.w).toFixed(3)} and ${(c.w - b.w).toFixed(3)} against ${(n * 0.2).toFixed(3)} expected`
    + `   cap ${a.cap.toFixed(3)} / ${b.cap.toFixed(3)} / ${c.cap.toFixed(3)} (must not move)`);
}
