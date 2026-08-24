// BUCK r17 — §4.3. DRAW WHAT WE SHIP BACK ONTO THE PHOTOGRAPH, IN THE SEAL'S
// OWN FRAME, AND LOOK.
//
// This is the instrument that found round 17's defect, and it found it because
// of two choices:
//
//   1. IT PARSES THE EMITTED SVG. Nothing here is a literal restated from
//      `coins.js`; the paths are pulled out of `coinSVG('buck', 190,
//      {side:'reverse'})`, so the overlay cannot drift from the drawing. A
//      restated copy is exactly how round 14's "wing span / rim width 0.8242"
//      survived three rounds without anyone drawing it on a wing.
//   2. IT REGISTERS ON THE SEAL RIM, NOT THE BORDER (`_jb16rim.mjs`). The map
//      is x_photo = cx + (x_vb - PYR.cx)/PYR.rx * r and the same in y through
//      ry, so the anisotropy the border argument turns on cancels: whatever
//      the border ratio really is, our ellipse IS our roundel and the seal's
//      circle IS its rim, and the question "is the device in the right place
//      inside the ring it lives in" is asked directly.
//
// WHAT IT SHOWS, on both references. The eagle's HEAD, SHIELD and TAIL land on
// their features. Before r17 the two wing crescents did not land on the wings:
// their tips sat past the E PLURIBUS ribbon in bare hatched sky and their
// outer edge ran through open ground for the top half of its length. The
// pyramid's trapezoid and capstone sit on the masonry.
//
//   node coloringbook/judge/_jb16over.mjs
import sharp from 'sharp';
import { join } from 'node:path';
import { REF, JUDGE, ROOT } from './_paths.mjs';
import { RIM } from './_jb16rim.mjs';
const { coinSVG } = await import(join(ROOT, 'src/art/coins.js'));

// the two roundels, pulled out of the emitted SVG so they cannot be restated wrong
const svg = coinSVG('buck', 190, { side: 'reverse' });
const els = [...svg.matchAll(/<ellipse cx="([\d.]+)" cy="([\d.]+)" rx="([\d.]+)" ry="([\d.]+)"/g)]
  .map((m) => ({ cx: +m[1], cy: +m[2], rx: +m[3], ry: +m[4] }));
if (els.length !== 2) throw new Error(`expected 2 roundels in the emitted reverse, found ${els.length}`);
const [PYR, EAG] = els;
const SEAL_T = 'transform="translate(76.88 27.75) scale(1)">';
const s0 = svg.indexOf(SEAL_T) + SEAL_T.length, s1 = svg.indexOf('</g>', s0);
if (s0 < SEAL_T.length) throw new Error('seal massing group not found — the emitted string changed shape');
const sealPaths = [...svg.slice(s0, s1).matchAll(/<path d="([^"]*)"/g)].map((m) => m[1]);
const p0 = svg.indexOf(`<ellipse cx="${EAG.cx}"`), p1 = svg.indexOf(SEAL_T);
const pyrPaths = [...svg.slice(p0, p1).matchAll(/<path d="([^"]*)"/g)].map((m) => m[1]);
console.log(`parsed from the emitted reverse: roundels ${els.length}, pyramid paths ${pyrPaths.length}, seal paths ${sealPaths.length}`);
console.log(`  PYR ${JSON.stringify(PYR)}\n  EAG ${JSON.stringify(EAG)}`);

const COL = ['#ffe000', '#00e0ff', '#00e0ff', '#ff8000', '#00ff80', '#ff00ff'];  // head, wing, wing, shield, tail
async function over(file, which) {
  const [cx, cy, r] = RIM[file][which];
  const R = which === 'pyr' ? PYR : EAG, paths = which === 'pyr' ? pyrPaths : sealPaths;
  const local = which === 'eag';                      // seal paths are in the roundel's own frame
  const half = Math.round(r * 1.2), S = 2 * half, K = Math.max(1, Math.round(1000 / S)), W = S * K;
  const sx = r / R.rx * K, sy = r / R.ry * K, o = half * K;
  const lw = Math.max(1.4, r * K / 240);
  let g = `<circle cx="${o}" cy="${o}" r="${r * K}" fill="none" stroke="#ff0080" stroke-width="${lw}"/>`;
  g += `<g transform="translate(${o} ${o}) scale(${sx.toFixed(5)} ${sy.toFixed(5)})">`;
  for (const [i, d] of paths.entries()) {
    const inner = local ? `<path d="${d}"/>` : `<g transform="translate(${-R.cx} ${-R.cy})"><path d="${d}"/></g>`;
    g += inner.replace('<path', `<path fill="none" stroke="${COL[i % COL.length]}" stroke-width="${(lw / sx).toFixed(4)}"`);
  }
  g += '</g>';
  const base = await sharp(join(REF, file)).extract({ left: cx - half, top: cy - half, width: S, height: S }).resize(W, W).png().toBuffer();
  const out = join(JUDGE, `_jb16-over-${which}-${file.replace(/\W/g, '_')}.png`);
  await sharp(base).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${W}">${g}</svg>`) }]).png().toFile(out);
  console.log('  drawn', out.slice(ROOT.length + 1), `  (1 local unit = ${(r / R.rx).toFixed(2)} px in x, ${(r / R.ry).toFixed(2)} px in y)`);
}
for (const file of Object.keys(RIM)) { console.log(file); for (const w of ['pyr', 'eag']) await over(file, w); }
console.log('\n§4.3: these four files are the evidence. A number in this round that is not visible in one of them is not a result.');
