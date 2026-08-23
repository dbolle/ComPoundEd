// D12 — LOOK AT IT, AT THE SIZES THE APP DRAWS, WITH THE CONTROL RENDERED
// FIRST. §0.1: "every wrong-in-kind defect ever found here was found this way
// and none was found by a number", and a 380 px overlay is not a substitute.
//
// The control row is rendered from a CHECKOUT of the pinned commit, not from
// memory and not from a copy of one file (coins.js imports src/engine/money.js,
// so a single-file copy will not load):
//
//   mkdir -p /tmp/ctl && git archive <commit> src | tar -x -C /tmp/ctl
//   node coloringbook/judge/_nk17look.mjs /tmp/ctl/src/art/coins.js
//
// Sizes are the four `src/screens/money.js` actually draws. Nearest-neighbour
// upscale by 10, so what is shown is the device pixels and nothing invented.
import sharp from 'sharp';
const SIZES = [38, 48, 54, 84];
const SCALE = 10;
const SIDE = process.env.NK_SIDE || 'obverse';
const CONTROL = process.argv[2];
if (!CONTROL) { console.log('usage: _nk17look.mjs <path to the control coins.js>  (see the header)'); process.exit(1); }
const rows = [];
for (const [label, mod] of [[`CONTROL  ${CONTROL}`, CONTROL.startsWith('/') ? CONTROL : '../../' + CONTROL], ['CANDIDATE  working tree', '../../src/art/coins.js']]) {
  const { coinSVG, coinPx } = await import(mod);
  const tiles = [];
  for (const S of SIZES) {
    const b0 = coinPx('nickel', S);
    const box = { w: Math.round(b0.w), h: Math.round(b0.h) };
    const png = await sharp(Buffer.from(coinSVG('nickel', S, { side: SIDE }))).resize(box.w, box.h).flatten({ background: '#ffffff' }).png().toBuffer();
    tiles.push({ big: await sharp(png).resize(box.w * SCALE, box.h * SCALE, { kernel: 'nearest' }).png().toBuffer(), w: box.w * SCALE, h: box.h * SCALE });
  }
  rows.push({ label, tiles });
}
const PAD = 14, colX = []; let x = PAD;
for (const t of rows[0].tiles) { colX.push(x); x += t.w + PAD; }
const rowH = Math.max(...rows[0].tiles.map((t) => t.h)) + 26;
const comps = []; let txt = '';
rows.forEach((r, ri) => {
  txt += `<text x="${PAD}" y="${ri * rowH + 16}" font-family="monospace" font-size="15" fill="#111">${r.label} — nickel ${SIDE} at ${SIZES.join(', ')} px</text>`;
  r.tiles.forEach((t, i) => comps.push({ input: t.big, left: colX[i], top: ri * rowH + 22 }));
});
const out = new URL(`./_nk17-look-${SIDE}.png`, import.meta.url).pathname;
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${x}" height="${rows.length * rowH + PAD}"><rect width="${x}" height="${rows.length * rowH + PAD}" fill="#f2f2f2"/>${txt}</svg>`))
  .composite(comps).png().toFile(out);
console.log('wrote', out);
