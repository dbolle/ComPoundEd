// BUCK r17 — D12, AT THE SIZES THE APP DRAWS, CONTROL FIRST.
//
// `_jb15look.mjs` sheets 26 / 54 / 190 — the three sizes of the tier system
// v1.78.0 removed. `src/screens/money.js` draws 38, 48, 54 and 84. Two of the
// three sizes the old sheet showed are sizes no child ever sees, and the one
// size that matters most (84, the naming draw) was not on it.
//
// The CONTROL is the QUARTER, both faces, same pipeline, and it is rendered
// FIRST (§3 D12 / R6): it shares `struck()`, `sw()` and the palette machinery
// with the note, so anything that appears in both is shared machinery and not
// a note defect. Round 17 removed `struck()` from the note's reverse, so the
// control is also the check that the four coins' bevel is untouched.
//
//   node coloringbook/judge/_jb16look.mjs control
//   node coloringbook/judge/_jb16look.mjs subject
import sharp from 'sharp';
import { join } from 'node:path';
import { JUDGE, ROOT } from './_paths.mjs';
const { coinSVG, coinPx } = await import(join(ROOT, 'src/art/coins.js'));
const SIZES = [38, 48, 54, 84];
const OUT = JUDGE;
const K = 8;
async function sheet(id, sides, out, tag) {
  const rows = [];
  for (const side of sides) {
    const tiles = [];
    for (const size of SIZES) {
      const box = coinPx(id, size);
      const w = Math.round(box.w), h = Math.round(box.h);
      const svg = coinSVG(id, size, { side });
      if (/undefined|NaN/.test(svg)) throw new Error(`${id}/${side}/${size}: undefined/NaN`);
      const png = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' }).resize(w, h, { fit: 'fill' }).png().toBuffer();
      const big = await sharp(png).resize(w * K, h * K, { kernel: 'nearest' }).png().toBuffer();
      const m = await sharp(big).metadata();
      const label = `<svg xmlns="http://www.w3.org/2000/svg" width="${m.width}" height="24"><rect width="${m.width}" height="24" fill="#101010"/><text x="6" y="18" fill="#ffe000" font-size="16" font-family="monospace">${id} ${side} size=${size} -> ${w}x${h}px x${K}</text></svg>`;
      tiles.push(await sharp({ create: { width: m.width, height: m.height + 24, channels: 3, background: '#101010' } })
        .composite([{ input: Buffer.from(label), top: 0, left: 0 }, { input: big, top: 24, left: 0 }]).png().toBuffer());
    }
    const ms = await Promise.all(tiles.map((t) => sharp(t).metadata()));
    const W = ms.reduce((s, m) => s + m.width + 10, 10), H = Math.max(...ms.map((m) => m.height));
    let x = 10;
    const comp = tiles.map((t, i) => { const o = { input: t, left: x, top: 0 }; x += ms[i].width + 10; return o; });
    rows.push(await sharp({ create: { width: W, height: H, channels: 3, background: '#101010' } }).composite(comp).png().toBuffer());
  }
  const ms = await Promise.all(rows.map((r) => sharp(r).metadata()));
  const W = Math.max(...ms.map((m) => m.width)), H = ms.reduce((s, m) => s + m.height + 10, 10);
  let y = 10;
  const comp = rows.map((r, i) => { const o = { input: r, left: 0, top: y }; y += ms[i].height + 10; return o; });
  await sharp({ create: { width: W, height: H, channels: 3, background: '#101010' } }).composite(comp).png().toFile(join(OUT, out));
  console.log(tag, out, `${W}x${H}`);
}
const which = process.argv[2] || 'control';
const suffix = process.argv[3] || '';
if (which === 'control') await sheet('quarter', ['obverse', 'reverse'], `_jb16-control-quarter${suffix}.png`, 'CONTROL');
else await sheet('buck', ['obverse', 'reverse'], `_jb16-subject-buck${suffix}.png`, 'SUBJECT');
