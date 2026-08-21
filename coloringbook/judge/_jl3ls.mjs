// SPECIALIST INSTRUMENT — round 3, D5 lettering. DOES THE RENDERER HONOUR
// *NEGATIVE* letter-spacing, AND WHAT DOES THE RESULT LOOK LIKE?
//
// `_jl1ls.mjs` (round 1) established that librsvg honours `letter-spacing` and
// ignores `textLength`, and that it centres the INK. It only ever tested
// POSITIVE spacing, because the two flat legends round 1 drew — MONTICELLO and
// the dime's E PLURIBUS UNUM — are both set LOOSER than our face's natural
// advance.
//
// The cent's E PLURIBUS is the first flat legend that is TIGHTER. Measured on
// `penny-rev-2.png` (`_jl3ink.mjs`): its glyph ink is 3.05 viewBox units on an
// advance of 3.02, i.e. the letters very nearly touch, while our face at the
// same cap height wants an advance of 3.87 for the same 3.11 of ink. Holding
// the coin's extent therefore needs ls < 0, and "librsvg honours positive
// spacing" is not evidence that it honours negative spacing — that is the
// assumption §4 exists to stop.
//
// §4 RESPONSE: ink width must fall by exactly (n-1) x |ls|, the same law
//   `_jl1ls.mjs` checked upward, and it must keep falling past the point where
//   glyphs overlap (a renderer that clamps at zero advance would flatten there).
// §4.1 NULL: the ink box is a full-canvas scan; the canvas is checked for
//   bound contact and a string touching it is reported, not measured.
//
// Run: node coloringbook/judge/_jl3ls.mjs
import sharp from 'sharp';

const FONT = "ui-rounded, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const S = 3000, H = 500, SIZE = 100;

async function box(text, ls) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${H}">`
    + `<rect width="${S}" height="${H}" fill="#fff"/>`
    + `<text x="${S / 2}" y="360" text-anchor="middle" font-family="${FONT}" font-size="${SIZE}"`
    + ` font-weight="700" fill="#000"${ls ? ` letter-spacing="${ls}"` : ''}>${text}</text></svg>`;
  const { data, info } = await sharp(Buffer.from(svg)).greyscale().raw().toBuffer({ resolveWithObject: true });
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (let j = 0; j < info.height; j++) for (let i = 0; i < info.width; i++)
    if (data[j * info.width + i] < 128) {
      if (i < x0) x0 = i; if (i > x1) x1 = i;
      if (j < y0) y0 = j; if (j > y1) y1 = j;
    }
  return { x0, x1, w: x1 - x0 + 1, capH: y1 - y0 + 1, mid: (x0 + x1) / 2,
    atBound: x0 <= 0 || x1 >= S - 1 || y0 <= 0 || y1 >= H - 1, svg };
}

const TEXT = 'E PLURIBUS';
const n = TEXT.length;
console.log(`=== negative letter-spacing, "${TEXT}" (${n} chars, ${n - 1} advances) at font-size ${SIZE} ===`);
const plain = await box(TEXT, 0);
console.log(`  ls    0   ink width ${plain.w}   cap ${plain.capH}   ink mid ${plain.mid.toFixed(1)} (anchor ${S / 2})${plain.atBound ? '  *** AT CANVAS BOUND ***' : ''}`);
for (const ls of [-5, -10, -19, -25, -40]) {
  const b = await box(TEXT, ls);
  const expect = plain.w + (n - 1) * ls;
  console.log(`  ls ${String(ls).padStart(4)}   ink width ${b.w}   expected ${expect}   ${b.w === expect ? 'HONOURED exactly' : `differs by ${b.w - expect}`}`
    + `   cap ${b.capH}   ink mid ${b.mid.toFixed(1)}${b.atBound ? '  *** AT CANVAS BOUND ***' : ''}`);
}
// The value the cent needs, at the file's scale: size 5.02, ls -0.95 viewBox
// units => at font-size 100 that is 100/5.02 x -0.95 = -18.9.
const target = await box(TEXT, -18.9);
console.log(`\n  the cent's value, ls -18.9 at size 100 (= -0.95 at size 5.02): ink width ${target.w}`
  + `  -> ${(target.w / SIZE * 5.02).toFixed(2)} viewBox units at size 5.02, against the coin's measured 29.30`);
await sharp(Buffer.from(target.svg)).png().toFile(new URL('./_jl3ls-eplurribus-neg.png', import.meta.url).pathname);
console.log('  wrote _jl3ls-eplurribus-neg.png — LOOK at it before using the number (§3 D12)');
const loose = await box('UNUM', 4.2);
console.log(`\n  UNUM at ls +4.2 (= +0.21 at size 5.02): ink width ${loose.w} -> ${(loose.w / SIZE * 5.02).toFixed(2)} viewBox units, against the coin's measured 16.05`);
