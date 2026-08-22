// SPECIALIST working instrument (dime obverse, D7 round) — the protractor.
//
// §4.3 / Appendix S2's method: put a LABELLED LADDER on the source in the
// coordinate system the feature is defined in, and read the feature off it.
// Five band finders across three coins failed where a picture with a ladder
// worked, so this round does not build a sixth detector.
//
// Here the feature is an ANGLE: the wedge the hair mass makes where its two
// boundaries meet, at the front lock's tip and at the nape. The ladder is a fan
// of rays drawn from that vertex, every 10 degrees, labelled in the coin's own
// local coordinates (the frame HEAD/HAIR are authored in), so a reading off the
// picture can be typed straight into the path.
//
// Angle convention, stated before any reading: theta is measured in LOCAL
// coordinates (x forward toward the face, y down), atan2(dy, dx) in degrees. It
// is NOT screen angle — the emitted transform mirrors x — and the fan is drawn
// through the same transform as the outline so the two cannot disagree.
//
// Run: node coloringbook/judge/_sd7fan.mjs <ref.jpg> <localX> <localY> <out.png>
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const ROOT = new URL('../../', import.meta.url).pathname;
const [REF, LX, LY, OUT] = [process.argv[2], Number(process.argv[3]), Number(process.argv[4]), process.argv[5]];
const disc = JSON.parse(readFileSync(`${ROOT}coloringbook/judge/_jd1discs.json`, 'utf8'))[REF];
if (!disc) { console.log(`no frozen disc fit for ${REF}`); process.exit(1); }
const { cx, cy, R } = disc;
const { coinSVG } = await import(`${ROOT}src/art/coins.js`);
const svg = coinSVG('dime', 600, { side: 'obverse' });
const g = svg.match(/transform="translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+) ([-\d.]+)\)">/);
const [tx, ty, sx, sy] = g.slice(1).map(Number);
const toPx = (x, y) => [cx + (R * (tx + sx * x - 50)) / 47, cy + (R * (ty + sy * y - 50)) / 47];

const meta = await sharp(`${ROOT}coloringbook/ref/${REF}`).metadata();
const LEN = 6; // local units — long enough to read, short enough to stay local
const rays = [];
for (let a = -180; a < 180; a += 10) {
  const rad = (a * Math.PI) / 180;
  const [x0, y0] = toPx(LX, LY);
  const [x1, y1] = toPx(LX + LEN * Math.cos(rad), LY + LEN * Math.sin(rad));
  const [xl, yl] = toPx(LX + (LEN + 1.4) * Math.cos(rad), LY + (LEN + 1.4) * Math.sin(rad));
  const major = a % 30 === 0;
  rays.push(`<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="${major ? '#f0f' : '#0ff'}" stroke-width="${major ? 1.6 : 0.8}" opacity="0.9"/>`);
  if (major) rays.push(`<text x="${xl}" y="${yl}" font-size="${R * 0.03}" font-family="monospace" fill="#ff0" text-anchor="middle">${a}</text>`);
}
const over = `<svg xmlns="http://www.w3.org/2000/svg" width="${meta.width}" height="${meta.height}">${rays.join('')}</svg>`;
const flat = await sharp(`${ROOT}coloringbook/ref/${REF}`).composite([{ input: Buffer.from(over) }]).png().toBuffer();
const [px, py] = toPx(LX, LY);
const half = Math.round(R * 0.22);
const left = Math.max(0, Math.round(px) - half), top = Math.max(0, Math.round(py) - half);
const w = Math.min(2 * half, meta.width - left), h = Math.min(2 * half, meta.height - top);
const bare = await sharp(`${ROOT}coloringbook/ref/${REF}`).extract({ left, top, width: w, height: h }).resize(620).png().toBuffer();
const drawn = await sharp(flat).extract({ left, top, width: w, height: h }).resize(620).png().toBuffer();
await sharp({ create: { width: 2 * 620 + 12, height: 620, channels: 3, background: '#fff' } })
  .composite([{ input: bare, left: 0, top: 0 }, { input: drawn, left: 632, top: 0 }]).png().toFile(OUT);
console.log(`${OUT}  ${REF}  vertex local (${LX}, ${LY}) -> px (${px.toFixed(1)}, ${py.toFixed(1)})  ${(R / 47).toFixed(2)} px per local unit`);
console.log(`  fan: -180..170 by 10 deg, ray length ${LEN} local units, labels every 30 deg, LOCAL angle atan2(dy,dx)`);
