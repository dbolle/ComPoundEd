// BUCK r0 — D12. The CONTROL is written to its own file and is read FIRST
// (§3 D12, Q5, R6): the judge holds priors of its own manufacture from every
// number above, and R6 extends the control rule to exactly that case.
//
// Control choice: the QUARTER, both sides, at the same three tiers. It shares
// `struck()`, `sw()`, `fitOff()`, `HEAD.*` and the palette machinery with the
// note and this round did not touch it, so anything that appears in both is
// shared machinery and not a note defect.
//
//   node coloringbook/judge/_jb15look.mjs control
//   node coloringbook/judge/_jb15look.mjs subject
import sharp from 'sharp';
const { coinSVG, coinPx } = await import('../../src/art/coins.js');

const TIERS = [['icon', 26], ['mid', 54], ['full', 190]];
const TARGET_W = 460; // every tile blown up to the same width, nearest, no invention

async function sheet(id, out) {
  const rows = [];
  for (const side of ['obverse', 'reverse']) {
    const tiles = [];
    for (const [tier, size] of TIERS) {
      const box = coinPx(id, size);
      const w = Math.round(box.w), h = Math.round(box.h);
      const svg = coinSVG(id, size, { side });
      if (/undefined|NaN/.test(svg)) throw new Error(`${id}/${side}/${tier}: undefined/NaN`);
      const k = Math.max(1, Math.round(TARGET_W / w));
      const png = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
        .resize(w, h, { fit: 'fill' }).png().toBuffer();
      const big = await sharp(png).resize(w * k, h * k, { kernel: 'nearest' }).png().toBuffer();
      const label = `<svg xmlns="http://www.w3.org/2000/svg" width="${w * k}" height="26">
        <rect width="${w * k}" height="26" fill="#101010"/>
        <text x="6" y="19" fill="#ffe000" font-size="17" font-family="monospace">${id} ${side} ${tier} size=${size} -> ${w}x${h}px, x${k}</text></svg>`;
      const m = await sharp(big).metadata();
      tiles.push(await sharp({ create: { width: m.width, height: m.height + 26, channels: 3, background: '#101010' } })
        .composite([{ input: Buffer.from(label), top: 0, left: 0 }, { input: big, top: 26, left: 0 }]).png().toBuffer());
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
  await sharp({ create: { width: W, height: H, channels: 3, background: '#101010' } }).composite(comp).png().toFile(out);
  console.log(out, `${W}x${H}`);
}

const which = process.argv[2] || 'control';
if (which === 'control') await sheet('quarter', 'coloringbook/judge/_jb15-control-quarter.png');
else await sheet('buck', 'coloringbook/judge/_jb15-subject-buck.png');
