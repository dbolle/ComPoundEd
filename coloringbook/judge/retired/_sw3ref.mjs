// SPECIALIST (buck obverse) — look at the REFERENCE PHOTOGRAPHS of the note's
// portrait vignette, at full resolution, before drawing anything (§7 RULES:
// never describe the coin from memory).
//   node coloringbook/judge/_sw3ref.mjs whole      -> both obverses, downscaled
//   node coloringbook/judge/_sw3ref.mjs crop x0 y0 x1 y1 ref  -> fractional crop
import sharp from 'sharp';
const REFS = ['coloringbook/ref/bill-obv.jpg', 'coloringbook/ref/bill-obv-2.jpg'];
const mode = process.argv[2] || 'whole';

if (mode === 'whole') {
  for (const r of REFS) {
    const im = sharp(r); const m = await im.metadata();
    console.log(r, m.width + 'x' + m.height);
    await im.resize(1100).png().toFile(`coloringbook/judge/_swout/_sw3-${r.split('/').pop().replace(/\..*/, '')}.png`);
  }
} else {
  const [x0, y0, x1, y1, which = '1'] = process.argv.slice(3);
  const r = REFS[Number(which) - 1];
  const m = await sharp(r).metadata();
  const L = Math.round(m.width * x0), T = Math.round(m.height * y0);
  const W = Math.round(m.width * (x1 - x0)), H = Math.round(m.height * (y1 - y0));
  const out = `coloringbook/judge/_swout/_sw3-crop${which}.png`;
  await sharp(r).extract({ left: L, top: T, width: W, height: H }).resize(Math.min(1200, W * 4)).png().toFile(out);
  console.log(out, `src ${W}x${H} of ${m.width}x${m.height}`);
}
