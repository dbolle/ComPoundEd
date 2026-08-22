// SPECIALIST, quarter reverse (eagle) — §4.3 overlay: draw the candidate
// reference pool disc-normalised, at one scale, and LOOK at it. The
// independence matrix from _jq42indep.mjs says quarter-rev.jpg / -5.jpg sit
// at design-NCC 0.02..0.12 against the four-file cluster, which is either
// "different design" or "the registration failed". Only the eye settles that.
//
// Generator for: coloringbook/judge/_sq1-refpool.png
import sharp from 'sharp';
import { normalise, N, SPAN } from '../_rvnorm.mjs';
import { discOf, QREV } from './_jq42indep.mjs';

const TILE = 340;
const files = QREV;

const tiles = [];
for (const f of files) {
  const d = await discOf(f);
  const g = await normalise(f, d);
  const buf = Buffer.alloc(N * N);
  for (let p = 0; p < N * N; p++) buf[p] = Math.max(0, Math.min(255, Math.round(g[p])));
  const png = await sharp(buf, { raw: { width: N, height: N, channels: 1 } })
    .resize(TILE, TILE).png().toBuffer();
  tiles.push({ f, png, d });
  console.log(`${f.padEnd(24)} disc cx ${d.cx} cy ${d.cy} R ${d.R}`);
}

const COLS = 4, ROWS = Math.ceil(tiles.length / COLS), LBL = 20;
const W = COLS * TILE, H = ROWS * (TILE + LBL);
const comps = [];
let svg = `<svg width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/>`;
tiles.forEach((t, k) => {
  const c = k % COLS, r = (k / COLS) | 0;
  comps.push({ input: t.png, left: c * TILE, top: r * (TILE + LBL) });
  svg += `<text x="${c * TILE + 4}" y="${r * (TILE + LBL) + TILE + 15}" font-family="monospace" font-size="13" fill="#000">${t.f}</text>`;
});
svg += '</svg>';
await sharp(Buffer.from(svg)).composite(comps).png()
  .toFile(new URL('./_sq1-refpool.png', import.meta.url).pathname);
console.log(`\nwrote _sq1-refpool.png  (${W}x${H}, span +-${SPAN}R)`);
