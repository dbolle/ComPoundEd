// BUCK r9 (specialist) — §4.3's overlay obligation: draw every located feature
// on the source it was located in, and look at it.
//
// Renders the rectified reference in OUR viewBox units through the printed-
// border fiducial (the same `rectify` + FRAME chain `_jb6crop.mjs` uses), then
// paints on top of it: the frozen D2 rim ellipses, whatever geometry is passed
// on the command line, and a 1-unit ladder.
//
//   node coloringbook/judge/_jk9over.mjs <file> <X0> <X1> <Y0> <Y1> <zoom> <out> [shapes.json]
//
// `shapes.json` is a list of {kind:'line'|'ellipse'|'poly', ...} in viewBox
// units. The geometry is asserted finite before rasterising (N3) and the PNG
// is read back by the caller.
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { rectify } from '../_blnorm.mjs';

const [file, a, b, c, d, Z, out, shapesFile] =
  [process.argv[2], +process.argv[3], +process.argv[4], +process.argv[5], +process.argv[6], +process.argv[7], process.argv[8], process.argv[9]];
const F = { x0: 5, y0: 5, x1: 95, y1: 51 };
const S = 26, W = Math.round((F.x1 - F.x0) * S), H = Math.round((F.y1 - F.y0) * S);
const R = await rectify(file, W, H);
const buf = Buffer.alloc(W * H);
for (let i = 0; i < W * H; i++) buf[i] = Math.max(0, Math.min(255, Math.round(R.out[i])));

const left = Math.round((a - F.x0) * S), top = Math.round((c - F.y0) * S);
const ww = Math.round((b - a) * S), hh = Math.round((d - c) * S);
if (![left, top, ww, hh].every(Number.isFinite) || ww <= 0 || hh <= 0) throw new Error('bad crop');
const OW = Math.round(ww * Z), OH = Math.round(hh * Z);
const px = (X) => (X - a) * S * Z, py = (Y) => (Y - c) * S * Z;

let s = '';
for (let X = Math.ceil(a); X <= b + 1e-9; X += 1) {
  const x = px(X), maj = X % 5 === 0;
  s += `<line x1="${x}" y1="0" x2="${x}" y2="${OH}" stroke="#ff2000" stroke-width="${maj ? 1.4 : 0.5}" opacity="${maj ? 0.75 : 0.3}"/>`;
  if (maj) s += `<text x="${x + 3}" y="16" fill="#ff2000" font-size="15" font-family="monospace">${X}</text>`;
}
for (let Y = Math.ceil(c); Y <= d + 1e-9; Y += 1) {
  const y = py(Y), maj = Y % 5 === 0;
  s += `<line x1="0" y1="${y}" x2="${OW}" y2="${y}" stroke="#ff2000" stroke-width="${maj ? 1.4 : 0.5}" opacity="${maj ? 0.75 : 0.3}"/>`;
  if (maj) s += `<text x="4" y="${y - 4}" fill="#ff2000" font-size="15" font-family="monospace">${Y}</text>`;
}
if (shapesFile) {
  const shapes = JSON.parse(readFileSync(shapesFile, 'utf8'));
  for (const sh of shapes) {
    const col = sh.colour || '#00ff40', wd = sh.w || 2.5;
    const fin = (...v) => { if (!v.every(Number.isFinite)) throw new Error('non-finite geometry: ' + JSON.stringify(sh)); };
    if (sh.kind === 'line') { fin(sh.x1, sh.y1, sh.x2, sh.y2);
      s += `<line x1="${px(sh.x1)}" y1="${py(sh.y1)}" x2="${px(sh.x2)}" y2="${py(sh.y2)}" stroke="${col}" stroke-width="${wd}" opacity="0.95"/>`; }
    else if (sh.kind === 'ellipse') { fin(sh.cx, sh.cy, sh.rx, sh.ry);
      s += `<ellipse cx="${px(sh.cx)}" cy="${py(sh.cy)}" rx="${sh.rx * S * Z}" ry="${sh.ry * S * Z}" fill="none" stroke="${col}" stroke-width="${wd}" opacity="0.95"/>`; }
    else if (sh.kind === 'poly') { sh.pts.forEach((p) => fin(p[0], p[1]));
      s += `<polygon points="${sh.pts.map((p) => `${px(p[0])},${py(p[1])}`).join(' ')}" fill="none" stroke="${col}" stroke-width="${wd}" opacity="0.95"/>`; }
    if (sh.label) s += `<text x="${px(sh.lx ?? sh.x1 ?? sh.cx)}" y="${py(sh.ly ?? sh.y1 ?? sh.cy)}" fill="${col}" font-size="18" font-family="monospace">${sh.label}</text>`;
  }
}
const base = await sharp(buf, { raw: { width: W, height: H, channels: 1 } })
  .extract({ left, top, width: ww, height: hh }).resize(OW, OH).toColourspace('srgb').png().toBuffer();
await sharp(base).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${OW}" height="${OH}">${s}</svg>`), top: 0, left: 0 }])
  .png().toFile(out);
console.log(out, `X ${a}..${b} Y ${c}..${d} zoom ${Z}  ${shapesFile || 'ladder only'}`);
