// SPECIALIST (buck obverse, portrait round) — D12 look.
// Renders the note obverse at every tier at true device size and at an
// integer nearest-neighbour zoom, plus a big crop of the vignette only.
// CONTROL FIRST (§3 D12 / Q5 / R6): the quarter obverse, which this round
// does not touch and which shares struck()/sw()/HEAD.*/PALETTE machinery.
//   node coloringbook/judge/_sw1look.mjs
import sharp from 'sharp';
const M = await import('../../src/art/coins.js');

async function tile(id, side, size, zoom) {
  const box = M.coinPx(id, size);
  const w = Math.round(box.w), h = Math.round(box.h);
  const svg = M.coinSVG(id, size, { side });
  if (/undefined|NaN/.test(svg)) throw new Error(`${id}/${side}/${size}: undefined/NaN`);
  const png = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' }).resize(w, h, { fit: 'fill' }).png().toBuffer();
  const k = zoom || Math.max(1, Math.round(520 / w));
  return { buf: await sharp(png).resize(w * k, h * k, { kernel: 'nearest' }).png().toBuffer(), w: w * k, h: h * k, label: `${id} ${side.slice(0, 3)} ${size} (${w}x${h} x${k})` };
}

async function sheet(rows, out, caption) {
  const W = Math.max(...rows.map((r) => r.tiles.reduce((s, t) => s + t.w + 12, 12)));
  let y = 44; const comp = []; let labels = '';
  for (const r of rows) {
    let x = 12; const hh = Math.max(...r.tiles.map((t) => t.h));
    labels += `<text x="12" y="${y - 8}" fill="#ffe000" font-size="17" font-family="monospace">${r.name}</text>`;
    for (const t of r.tiles) {
      comp.push({ input: t.buf, left: x, top: y });
      labels += `<text x="${x}" y="${y + hh + 16}" fill="#9ad" font-size="15" font-family="monospace">${t.label}</text>`; x += t.w + 12;
    }
    y += hh + 46;
  }
  const H = y + 8;
  labels = `<text x="12" y="24" fill="#fff" font-size="18" font-family="monospace">${caption}</text>` + labels;
  const base = await sharp({ create: { width: W, height: H, channels: 3, background: '#101010' } }).png().toBuffer();
  await sharp(base).composite([...comp, { input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${labels}</svg>`), top: 0, left: 0 }]).png().toFile(out);
  console.log(out);
}

await sheet([{ name: 'CONTROL quarter obverse (untouched this round)',
  tiles: [await tile('quarter', 'obverse', 38), await tile('quarter', 'obverse', 47), await tile('quarter', 'obverse', 84), await tile('quarter', 'obverse', 190, 3)] }],
'coloringbook/judge/_swout/_sw1-control.png', 'CONTROL rendered first');

await sheet([{ name: 'buck obverse', tiles: [await tile('buck', 'obverse', 38), await tile('buck', 'obverse', 47), await tile('buck', 'obverse', 84)] },
  { name: 'buck obverse full', tiles: [await tile('buck', 'obverse', 190, 3)] }],
'coloringbook/judge/_swout/_sw1-buck-obv.png', 'SUBJECT buck obverse, all tiers');

// vignette crop: oval is cx 50.05 cy 30.3 rx 9.75 ry 14 in a 100x56 viewBox
for (const size of [38, 47, 84, 190]) {
  const box = M.coinPx('buck', size); const w = Math.round(box.w), h = Math.round(box.h);
  const png = await sharp(Buffer.from(M.coinSVG('buck', size, { side: 'obverse' }))).flatten({ background: '#fff' }).resize(w, h, { fit: 'fill' }).png().toBuffer();
  const sx = w / 100, sy = h / 56;
  const L = Math.max(0, Math.floor((50.05 - 12) * sx)), T = Math.max(0, Math.floor((30.3 - 16) * sy));
  const CW = Math.min(w - L, Math.ceil(24 * sx)), CH = Math.min(h - T, Math.ceil(32 * sy));
  const k = Math.max(1, Math.round(600 / CW));
  await sharp(png).extract({ left: L, top: T, width: CW, height: CH }).resize(CW * k, CH * k, { kernel: 'nearest' }).png()
    .toFile(`coloringbook/judge/_swout/_sw1-vig-${size}.png`);
  console.log(`_sw1-vig-${size}.png  crop ${CW}x${CH} x${k}`);
}
