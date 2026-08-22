// SPECIALIST, quarter reverse (eagle) — §4.3: draw OUR outline on the SOURCE,
// in viewBox units, and look. No number in this round is quoted without this
// picture behind it.
//
// The reference is disc-normalised onto the same (u,v) frame `_rvnorm` uses,
// then mapped to viewBox by X = 50 + 47u, Y = 50 + 47v — the project's own
// convention (`_rvnorm.uv2XY`). A 5-unit grid is drawn over it so a landmark
// can be read off by hand (COIN-JUDGE R3: the overlay reading is evidence).
//
// Usage: node _sq4grid.mjs [ref ...]
// Generator for: coloringbook/judge/_sq4-grid-<ref>.png
import sharp from 'sharp';
import { normalise, N, SPAN } from '../_rvnorm.mjs';
import { discOf } from './_jq42indep.mjs';
import { coinSVG } from '../../src/art/coins.js';

const FILES = process.argv.slice(2).length ? process.argv.slice(2)
  : ['quarter-rev-3.jpg', 'quarter-rev-2.png', 'qp1963-rev-pad.png', 'qp1964-rev-pad.png'];
const PX = 900;                       // output px across the full +-SPAN frame
const u2px = (u) => (u + SPAN) * PX / (2 * SPAN);
const X2px = (X) => u2px((X - 50) / 47);

// our motif geometry, taken straight out of the emitted SVG at `full`
const ours = coinSVG('quarter', 380, { side: 'reverse', decorative: true });
const inner = ours.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

function gridSVG() {
  let s = '';
  for (let X = 0; X <= 100; X += 5) {
    const p = X2px(X);
    const maj = X % 25 === 0;
    s += `<line x1="${p}" y1="0" x2="${p}" y2="${PX}" stroke="${maj ? '#00e0ff' : '#00e0ff'}" stroke-width="${maj ? 1.2 : 0.5}" opacity="${maj ? 0.8 : 0.35}"/>`;
    s += `<line x1="0" y1="${p}" x2="${PX}" y2="${p}" stroke="#00e0ff" stroke-width="${maj ? 1.2 : 0.5}" opacity="${maj ? 0.8 : 0.35}"/>`;
    s += `<text x="${p + 2}" y="12" font-family="monospace" font-size="11" fill="#00e0ff">${X}</text>`;
    s += `<text x="2" y="${p - 2}" font-family="monospace" font-size="11" fill="#00e0ff">${X}</text>`;
  }
  // field circle r=44.07 and the frozen 40.5, in viewBox units
  for (const [r, col] of [[44.07, '#ffe600'], [40.5, '#ff8800']])
    s += `<circle cx="${X2px(50)}" cy="${X2px(50)}" r="${X2px(50 + r) - X2px(50)}" fill="none" stroke="${col}" stroke-width="1" opacity="0.7"/>`;
  return s;
}

for (const f of FILES) {
  const d = await discOf(f);
  const g = await normalise(f, d);
  const buf = Buffer.alloc(N * N);
  for (let p = 0; p < N * N; p++) buf[p] = Math.max(0, Math.min(255, Math.round(g[p])));
  const base = await sharp(buf, { raw: { width: N, height: N, channels: 1 } })
    .resize(PX, PX).toColourspace('srgb').png().toBuffer();

  // OUR drawing, same frame: viewBox is 0..100 mapped through X2px
  const k = (X2px(100) - X2px(0)) / 100, off = X2px(0);
  const over = `<svg xmlns="http://www.w3.org/2000/svg" width="${PX}" height="${PX}">
    <g transform="translate(${off} ${off}) scale(${k})" fill="none" stroke="#ff2d55" stroke-width="${0.5 / k * 1}" opacity="0.95">
      <g fill="none" stroke="#ff2d55">${inner.replace(/fill="[^"]*"/g, 'fill="none"').replace(/stroke="[^"]*"/g, 'stroke="#ff2d55"').replace(/opacity="[^"]*"/g, 'opacity="0.95"')}</g>
    </g>${gridSVG()}</svg>`;

  const out = `_sq4-grid-${f.replace(/\W+/g, '_')}.png`;
  await sharp(base).composite([{ input: Buffer.from(over) }]).png()
    .toFile(new URL('./' + out, import.meta.url).pathname);
  console.log(`${f.padEnd(24)} -> ${out}   disc R ${d.R}`);
}
