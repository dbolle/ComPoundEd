// DIME r0, TASK 5b — E3, THE PICTURE, AT READING MAGNIFICATION.
//
// WHY THIS EXISTS. E1 and E2 (`_jd5rim.mjs`) disagree across the dime's
// references by 3.4 units against a 1.0-unit gate, and the unwrap PICTURE says
// why: on `dime-obv-2.jpg`, a 2015-W cameo proof, the MIRROR field throws
// lens-shaped SPECULAR HIGHLIGHTS at r 41.5-43.5 over roughly a third of the
// circle. Those are field, not rim, and every profile-threshold estimator locks
// onto them — §4.3's wrong-feature failure, for the sixth time in this project,
// caught for the sixth time by drawing what was found and looking at it.
//
// So the value of record is read off the coin redrawn in (angle, radius) with a
// 0.25-unit ladder, per reference, over three angle thirds, exactly as Appendix
// R3 permits and quarter r4 (S2) and cent r0 (PY7) both did. A hand annotation
// read off the source IS a legitimate frozen target; a detector's failure is
// not the artefact's failure.
//
// Radii are corrected by `_jd6edge.json`'s estimator B so the coin's own
// silhouette is 47.00 in these units (cent PY7).
//
// Run: node coloringbook/judge/_jd7seat.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { unwrap } from './_jd3unwrap.mjs';

const HERE = (f) => new URL('./' + f, import.meta.url).pathname;
const D = JSON.parse(readFileSync(HERE('_jd1discs.json')));
const E = JSON.parse(readFileSync(HERE('_jd6edge.json')));
const R0 = 41.5, R1 = 46.0;           // frozen reading window

for (const f of ['dime-obv.jpg', 'dime-obv-2.jpg', 'dime-obv-3.jpg', 'dime-rev-2.jpg']) {
  const k = E[f].B_correction, u = await unwrap(f);
  const W = 1800, H = 960;
  const b = Buffer.alloc(W * H);
  for (let j = 0; j < H; j++) {
    const vbu = R1 - (R1 - R0) * j / (H - 1);
    const src = Math.round((u.RB - vbu / (47 * k)) / (u.RB - u.RA) * (u.H - 1));
    for (let i = 0; i < W; i++) b[j * W + i] = u.buf[Math.max(0, Math.min(u.H - 1, src)) * u.W + Math.round(i * u.W / W)];
  }
  const y = (v) => (R1 - v) / (R1 - R0) * (H - 1);
  let g = '';
  for (let v = R0; v <= R1 + 1e-9; v += 0.25) {
    const maj = Math.abs(v - Math.round(v)) < 1e-9, half = Math.abs(v * 2 - Math.round(v * 2)) < 1e-9;
    g += `<path d="M0 ${y(v).toFixed(1)}H${W}" stroke="${maj ? '#ff2d55' : half ? '#ffa000' : '#00e5ff'}" stroke-width="${maj ? 1.5 : 0.7}" opacity="${maj ? 0.95 : 0.5}"/>`;
    if (half) g += `<text x="4" y="${(y(v) - 3).toFixed(1)}" font-family="monospace" font-size="17" fill="#ffe600">${v.toFixed(1)}</text>`
      + `<text x="${W - 52}" y="${(y(v) - 3).toFixed(1)}" font-family="monospace" font-size="17" fill="#ffe600">${v.toFixed(1)}</text>`;
  }
  for (let a = 0; a < 360; a += 60) g += `<path d="M${W * a / 360} 0V${H}" stroke="#fff" stroke-width="1" opacity="0.5"/>`
    + `<text x="${W * a / 360 + 4}" y="18" font-family="monospace" font-size="15" fill="#fff">${a}deg</text>`;
  g += `<text x="${W / 2 - 340}" y="${H - 12}" font-family="monospace" font-size="21" fill="#0ff">${f} — 0.25-unit ladder; coin silhouette corrected to 47.00 (x${k})</text>`;
  const grey = await sharp(b, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
  const rgb = await sharp(grey).toColourspace('srgb').png().toBuffer();
  await sharp(rgb).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${g}</svg>`) }])
    .toFile(HERE(`_jd7seat-${f.replace(/\..*/, '')}.png`));
  console.log(`-> _jd7seat-${f.replace(/\..*/, '')}.png   window r ${R0}..${R1}, correction x${k}`);
}
