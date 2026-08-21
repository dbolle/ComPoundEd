// BUCK r9 (specialist) — the eagle's fit, as a picture and as a number at the
// same time. §4.3 in its strongest form: the measured whole-device fill makes
// every number right and the render wrong (the wings collapse into a dart), so
// the candidates are rendered side by side with their containment printed on
// them and the choice is made by looking.
//
//   node coloringbook/judge/_jk9variants.mjs
import sharp from 'sharp';
import { marks } from './_jqgeom.mjs';
const mod = await import('../../src/art/coins.js');

const EAG = { cx: 76.875, cy: 27.75, rx: 8.875, ry: 12.375 };
const BB = { cx: 70.0, cy: 28.55 };                 // our seal massing's own bbox centre
const CANDS = [
  [0.4264, 0.7667, 'A measured whole-device fill 0.845w x 0.909h, k 0.84'],
  [0.4600, 0.7200, 'B'],
  [0.5000, 0.6600, 'C'],
  [0.5154, 0.5154, 'D uniform, the largest that inscribes in the ellipse'],
];
const rad = (p) => Math.hypot((p.x - EAG.cx) / EAG.rx, (p.y - EAG.cy) / EAG.ry);
// the shipped transform may be uniform `scale(s)` or anisotropic `scale(sx sy)`
const cur = mod.coinSVG('buck', 190, { side: 'reverse' }).match(/translate\([\d.]+ [\d.]+\) scale\([\d. ]+\)/);
if (!cur) throw new Error('no seal transform found in the emitted SVG');
const CUR = cur[0];

function meas(svg) {
  const M = marks(svg).filter((m) => m.el === 'path' && (m.bbox.x0 + m.bbox.x1) / 2 > 50);
  let tot = 0, out = 0, worst = 0;
  for (const m of M) for (let i = 1; i < m.pts.length; i++) {
    const a = m.pts[i - 1], b = m.pts[i], seg = Math.hypot(b.x - a.x, b.y - a.y);
    if (!seg) continue;
    for (let k = 0; k < 8; k++) {
      const t = (k + 0.5) / 8, q = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      const r = rad(q); tot += seg / 8; if (r > 1) out += seg / 8; worst = Math.max(worst, r);
    }
  }
  return { frac: out / tot, worst };
}

const rows = [];
for (const [sx, sy, note] of CANDS) {
  const tx = +(EAG.cx - sx * BB.cx).toFixed(3), ty = +(EAG.cy - sy * BB.cy).toFixed(3);
  const T = `translate(${tx} ${ty}) scale(${sx} ${sy})`;
  const tiles = [];
  let line = '';
  for (const size of [38, 190]) {
    const svg = mod.coinSVG('buck', size, { side: 'reverse' }).replaceAll(CUR, T);
    if (/undefined|NaN/.test(svg)) throw new Error('bad svg');
    const m = meas(svg);
    if (size === 190) line = `${T}   full outside ${(100 * m.frac).toFixed(3)}% worst r ${m.worst.toFixed(4)}`;
    else line = `icon outside ${(100 * m.frac).toFixed(3)}% worst r ${m.worst.toFixed(4)}  |  ` + line;
    const box = mod.coinPx('buck', size), w = Math.round(box.w), h = Math.round(box.h);
    const k = Math.max(1, Math.round(420 / w));
    const png = await sharp(Buffer.from(svg)).flatten({ background: '#fff' }).resize(w, h, { fit: 'fill' }).png().toBuffer();
    tiles.push({ buf: await sharp(png).resize(w * k, h * k, { kernel: 'nearest' }).png().toBuffer(), w: w * k, h: h * k });
  }
  rows.push({ tiles, label: `${note}  —  ${line}` });
  console.log(`${note.padEnd(56)} ${line}`);
}
const W = Math.max(...rows.map((r) => r.tiles.reduce((s, t) => s + t.w + 12, 12)));
let y = 12, comp = [], lab = '';
for (const r of rows) {
  let x = 12; const hh = Math.max(...r.tiles.map((t) => t.h));
  for (const t of r.tiles) { comp.push({ input: t.buf, left: x, top: y }); x += t.w + 12; }
  lab += `<text x="12" y="${y + hh + 18}" fill="#ffe000" font-size="15" font-family="monospace">${r.label}</text>`;
  y += hh + 40;
}
await sharp({ create: { width: W, height: y, channels: 3, background: '#101010' } }).png().toBuffer()
  .then((b) => sharp(b).composite([...comp, { input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${y}">${lab}</svg>`), top: 0, left: 0 }])
    .png().toFile('coloringbook/judge/_jk9out/_jk9-eagle-variants.png'));
console.log('coloringbook/judge/_jk9out/_jk9-eagle-variants.png');
