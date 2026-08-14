// BUCK r0 — the hand ladder (Appendix R3 / PY7). Five automatic extent
// readings across two instruments returned their own window bounds on this
// subject, at every one of 5 darkness levels x 3 density levels x 2
// references (`_jb4read.mjs`, `_jb5text.mjs`). That is a statement about
// detectors, not about the artefacts, so: draw the coordinate system on the
// source at a resolution where a feature edge is unambiguous, and read it off.
//
// An overlay reading is EVIDENCE, not a frozen value (R3) — every number taken
// off this picture is published with the picture and the picture's generator.
//
//   node coloringbook/judge/_jb6ladder.mjs [file] [side] [S]
import sharp from 'sharp';
import { fitBorder, grey } from '../_blfit.mjs';
import { homography, uv2px, at } from '../_blnorm.mjs';

const file = process.argv[2] || 'bill-rev-2.jpg';
const side = process.argv[3] || 'reverse';
const S = +(process.argv[4] || 26);
const FID = process.env.FID || (side === 'reverse' ? 'border' : 'paper');
const F = FID === 'paper' ? { x0: 1.4, y0: 1.4, x1: 98.6, y1: 54.6 } : { x0: 5, y0: 5, x1: 95, y1: 51 };
const FW = F.x1 - F.x0, FH = F.y1 - F.y0;
const W = Math.round(FW * S), H = Math.round(FH * S);

const fit = await fitBorder(file), g = await grey(file);
const p = fit.paperBox;
const corners = FID === 'paper'
  ? { TL: [p.px0, p.py0], TR: [p.px1, p.py0], BR: [p.px1, p.py1], BL: [p.px0, p.py1] }
  : fit.corners;
for (const c of Object.values(corners)) if (!c.every(Number.isFinite)) throw new Error('non-finite corner');
const Hm = homography(corners);
const buf = Buffer.alloc(W * H);
for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
  const [px, py] = uv2px(Hm, (i + 0.5) / W, (j + 0.5) / H);
  buf[j * W + i] = Math.max(0, Math.min(255, Math.round(at(g, px, py))));
}

// two halves, each with a 1-unit ladder labelled every 5
const halves = [[F.x0, F.x0 + FW / 2], [F.x0 + FW / 2, F.x1]];
const tiles = [];
for (const [a, b] of halves) {
  const left = Math.round((a - F.x0) * S), ww = Math.min(Math.round((b - a) * S), W - Math.round((a - F.x0) * S));
  let s = '';
  for (let X = Math.ceil(a); X <= b + 1e-9; X += 1) {
    const x = (X - a) * S, major = X % 5 === 0;
    s += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#ff2000" stroke-width="${major ? 1.4 : 0.5}" opacity="${major ? 0.85 : 0.4}"/>`;
    if (major) s += `<text x="${x + 3}" y="16" fill="#ff2000" font-size="15" font-family="monospace">${X}</text>` +
      `<text x="${x + 3}" y="${H - 5}" fill="#ff2000" font-size="15" font-family="monospace">${X}</text>`;
  }
  for (let Y = Math.ceil(F.y0); Y <= F.y1 + 1e-9; Y += 1) {
    const y = (Y - F.y0) * S, major = Y % 5 === 0;
    s += `<line x1="0" y1="${y}" x2="${ww}" y2="${y}" stroke="#ff2000" stroke-width="${major ? 1.4 : 0.5}" opacity="${major ? 0.85 : 0.4}"/>`;
    if (major) s += `<text x="4" y="${y - 3}" fill="#ff2000" font-size="15" font-family="monospace">${Y}</text>` +
      `<text x="${ww - 28}" y="${y - 3}" fill="#ff2000" font-size="15" font-family="monospace">${Y}</text>`;
  }
  const crop = await sharp(buf, { raw: { width: W, height: H, channels: 1 } })
    .extract({ left, top: 0, width: ww, height: H }).toColourspace('srgb').png().toBuffer();
  tiles.push(await sharp(crop).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${ww}" height="${H}">${s}</svg>`), top: 0, left: 0 }]).png().toBuffer());
}
const ms = await Promise.all(tiles.map((t) => sharp(t).metadata()));
const out = `coloringbook/judge/_jb6-ladder-${side}-${file.replace(/\W+/g, '_')}.png`;
await sharp({ create: { width: Math.max(...ms.map((m) => m.width)) + 16, height: ms.reduce((s2, m) => s2 + m.height + 8, 8), channels: 3, background: '#101010' } })
  .composite(tiles.map((t, i) => ({ input: t, left: 8, top: 8 + i * (ms[0].height + 8) }))).png().toFile(out);
console.log(out, `FID=${FID}  grid = OUR viewBox units, 1-unit ladder, labelled every 5`);
console.log(`fiducial maps to X ${F.x0}..${F.x1}  Y ${F.y0}..${F.y1};  border ratio ${fit.ratio.toFixed(4)}  paper ${p.ratio.toFixed(4)}`);
