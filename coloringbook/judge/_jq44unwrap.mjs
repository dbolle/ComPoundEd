// ROUND 4 — POLAR UNWRAP OF THE REVERSE, WITH A LABELLED RADIUS LADDER.
//
// §4.3 in its strongest form: instead of asking a detector where the legend
// band is and then checking it, DRAW the coin in the coordinates the question
// is asked in (angle x radius) and read the band off. Round 0, 1 and 2 each
// shipped a band finder that returned an in-bounds, response-tested, confident
// answer to the wrong question (bust edge, bust edge, E PLURIBUS UNUM + the
// wreath). An unwrap cannot be wrong about where a feature is; it IS the
// picture.
//
// Output: `_jq44unwrap-<ref>.png`, x = angle 0..360 deg (270 = twelve
// o'clock, angle = atan2(v, u) with v downward), y = r/R from 1.00 at the top
// to 0.50 at the bottom, with a viewBox-unit ladder every 1.0 unit and labels
// every 5. Rows are exact bilinear samples of the disc-normalised reference.
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
const D4 = JSON.parse(readFileSync(new URL('./_jq4discs.json', import.meta.url)));
const RA = 0.50, RB = 1.02;

export async function unwrap(file, W = 1440, H = 520) {
  const d = D4[file];
  const { data, info } = await sharp(P(file)).flatten({ background: '#808080' })
    .greyscale().raw().toBuffer({ resolveWithObject: true });
  const IW = info.width, IH = info.height;
  const at = (x, y) => {
    if (x < 0 || y < 0 || x >= IW - 1 || y >= IH - 1) return 0;
    const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0;
    return data[y0 * IW + x0] * (1 - fx) * (1 - fy) + data[y0 * IW + x0 + 1] * fx * (1 - fy)
      + data[(y0 + 1) * IW + x0] * (1 - fx) * fy + data[(y0 + 1) * IW + x0 + 1] * fx * fy;
  };
  const buf = Buffer.alloc(W * H);
  for (let j = 0; j < H; j++) {
    const r = RB - (RB - RA) * j / (H - 1);
    for (let i = 0; i < W; i++) {
      const th = (360 * i / W) * Math.PI / 180;
      buf[j * W + i] = Math.max(0, Math.min(255, Math.round(at(d.cx + r * d.R * Math.cos(th), d.cy + r * d.R * Math.sin(th)))));
    }
  }
  return { buf, W, H };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const refs = process.argv.slice(2).length ? process.argv.slice(2)
    : ['qp1963-rev-pad.png', 'qp1964-rev-pad.png', 'quarter-rev-3.jpg'];
  for (const f of refs) {
    const { buf, W, H } = await unwrap(f);
    const y = (r) => (RB - r) / (RB - RA) * (H - 1);
    let g = '';
    for (let vbu = 24; vbu <= 47; vbu++) {
      const r = vbu / 47; if (r < RA || r > RB) continue;
      const maj = vbu % 5 === 0;
      g += `<path d="M0 ${y(r).toFixed(1)}H${W}" stroke="${maj ? '#ff2d55' : '#00e5ff'}" stroke-width="${maj ? 1.4 : 0.7}" opacity="${maj ? 0.95 : 0.55}"/>`;
      if (maj || vbu % 1 === 0) g += `<text x="3" y="${(y(r) - 2).toFixed(1)}" font-family="monospace" font-size="12" fill="#ffe600">${vbu}</text>`;
    }
    for (let a = 0; a < 360; a += 30) {
      const x = W * a / 360;
      g += `<path d="M${x} 0V${H}" stroke="#ffffff" stroke-width="0.7" opacity="0.45"/>` +
        `<text x="${x + 3}" y="14" font-family="monospace" font-size="12" fill="#ffffff">${a}${a === 270 ? ' (12 o clock)' : a === 90 ? ' (6 o clock)' : ''}</text>`;
    }
    const grey = await sharp(buf, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
    const out = new URL(`./_jq44unwrap-${f.replace(/\..*/, '')}.png`, import.meta.url).pathname;
    await sharp(grey).toColourspace('srgb').png().toBuffer()
      .then((rgb) => sharp(rgb).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${g}</svg>`) }]).toFile(out));
    console.log(`${f} -> ${out}   x = angle (270 = 12 o'clock), y = viewBox radius, red rules every 5 units`);
  }
}
