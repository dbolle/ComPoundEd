// PENNY ROUND 0, TASK 4c — the unwrap, zoomed, with a HALF-UNIT ladder.
//
// Both automatic band readers (`_jp5band.mjs` absolute-ink, `_jp5band-v2.mjs`
// local-variance) correctly reported themselves AT a search bound on the cent
// (§4.1) — on the reverse because the memorial's own relief runs inboard of
// ONE CENT with no gap, on the obverse because the bust does. That is the
// detector failing, not the artefact: Appendix R3 says the verdict is then
// `UNMEASURED` and the work is the judge's, and §2.1 says a hand annotation
// read off the source IS a legitimate frozen target.
//
// So this is the source, in the coordinates the question is asked in, at a
// zoom where a half viewBox unit is ~14 screen px. Every radius quoted in
// `penny-r0.md` for a legend or the rim was read off one of these.
//
// Run: node coloringbook/judge/_jp6zoom.mjs <ref> [rLo rHi] [aLo aHi]
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { unwrap } from './_jp4unwrap.mjs';

const D = JSON.parse(readFileSync(new URL('./_jp1discs.json', import.meta.url)));
const f = process.argv[2] || 'penny-rev-2.png';
const rLo = +(process.argv[3] || 32), rHi = +(process.argv[4] || 46);
const aLo = +(process.argv[5] || 0), aHi = +(process.argv[6] || 360);

const u = await unwrap(f);
const rowR = (j) => (u.RB - (u.RB - u.RA) * j / (u.H - 1)) * 47;
const j0 = Math.max(0, Math.round((u.RB - rHi / 47) / (u.RB - u.RA) * (u.H - 1)));
const j1 = Math.min(u.H - 1, Math.round((u.RB - rLo / 47) / (u.RB - u.RA) * (u.H - 1)));
const i0 = Math.round(u.W * aLo / 360), i1 = Math.round(u.W * aHi / 360);
const CW = i1 - i0, CH = j1 - j0;
const crop = Buffer.alloc(CW * CH);
for (let j = 0; j < CH; j++) for (let i = 0; i < CW; i++) crop[j * CW + i] = u.buf[(j0 + j) * u.W + i0 + i];

const SCX = Math.min(3, Math.max(1, Math.round(1600 / CW)));
const SCY = Math.max(2, Math.round(700 / CH));
const OW = CW * SCX, OH = CH * SCY;
const y = (vbu) => ((u.RB - vbu / 47) / (u.RB - u.RA) * (u.H - 1) - j0) * SCY;
let g = '';
for (let vbu = Math.ceil(rLo * 2) / 2; vbu <= rHi; vbu += 0.5) {
  const whole = Number.isInteger(vbu), maj = whole && vbu % 5 === 0;
  g += `<path d="M0 ${y(vbu).toFixed(1)}H${OW}" stroke="${maj ? '#ff2d55' : whole ? '#00e5ff' : '#00e5ff'}" stroke-width="${maj ? 1.6 : whole ? 1.0 : 0.5}" opacity="${whole ? 0.85 : 0.4}"/>`;
  if (whole) g += `<text x="4" y="${(y(vbu) - 3).toFixed(1)}" font-family="monospace" font-size="16" fill="#ffe600">${vbu}</text>`
    + `<text x="${OW - 30}" y="${(y(vbu) - 3).toFixed(1)}" font-family="monospace" font-size="16" fill="#ffe600">${vbu}</text>`;
}
for (let a = Math.ceil(aLo / 15) * 15; a <= aHi; a += 15) {
  const x = OW * (a - aLo) / (aHi - aLo);
  g += `<path d="M${x} 0V${OH}" stroke="#ffffff" stroke-width="0.6" opacity="${a % 90 === 0 ? 0.8 : 0.3}"/>`
    + `<text x="${x + 3}" y="16" font-family="monospace" font-size="13" fill="#fff">${a}</text>`;
}
const grey = await sharp(crop, { raw: { width: CW, height: CH, channels: 1 } })
  .resize(OW, OH, { kernel: 'nearest' }).png().toBuffer();
const rgb = await sharp(grey).toColourspace('srgb').png().toBuffer();
const out = new URL(`./_jp6zoom-${f.replace(/\..*/, '')}-r${rLo}-${rHi}-a${aLo}-${aHi}.png`, import.meta.url).pathname;
await sharp(rgb).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${OW}" height="${OH}">${g}</svg>`) }]).toFile(out);
console.log(`${f} disc ${JSON.stringify(D[f])}  r ${rLo}..${rHi}, angle ${aLo}..${aHi} -> ${out}`);
console.log(`cyan = 1 viewBox unit, faint cyan = 0.5, red = 5;  ${(y(rLo) - y(rLo + 1)).toFixed(1)} px per unit`);
