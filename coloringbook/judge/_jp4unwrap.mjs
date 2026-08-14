// PENNY ROUND 0, TASK 3 — POLAR UNWRAP WITH A LABELLED viewBox LADDER.
//
// Round 4 on the quarter (Appendix S2, proposed): before building a detector
// for a radial feature, render the artefact in the coordinate system the
// feature is DEFINED in and read it off. Four band finders in four rounds each
// returned an in-bounds, response-tested, confident answer to the wrong
// question. An unwrap cannot be wrong about where a feature is; it IS the
// picture.
//
// This round needs three radii off the cent and none of them has ever been
// measured on this coin:
//   * the RIM SEAT — where the field stops and the raised rim begins. This is
//     what `EDGE.penny.field.full = 41.0` claims to be, and that literal is
//     shared by all four coins and was never measured on any of them
//     (`scripts/coin-shared-claims.mjs` flags it).
//   * the LEGEND BAND baseline and cap-top radius, obverse and reverse.
//   * the legend's ANGULAR SPAN.
//
// Output `_jp4unwrap-<ref>.png`: x = angle 0..360 deg (270 = twelve o'clock,
// angle = atan2(v, u) with v downward), y = radius, top RB to bottom RA, with
// a viewBox-unit ladder every 1.0 unit, labelled every unit, red every 5.
// Rows are exact bilinear samples of the source through the FROZEN disc.
//
// Construction is `_jq44unwrap.mjs`'s (round 4, quarter), reimplemented against
// `_jp1discs.json` so this round's outputs and its disc table stay together.
//
// Run: node coloringbook/judge/_jp4unwrap.mjs [ref ...]
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
const D = JSON.parse(readFileSync(new URL('./_jp1discs.json', import.meta.url)));
const RA = 0.62, RB = 1.06;

export async function unwrap(file, disc = D[file], W = 1800, H = 620) {
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
      buf[j * W + i] = Math.max(0, Math.min(255, Math.round(
        at(disc.cx + r * disc.R * Math.cos(th), disc.cy + r * disc.R * Math.sin(th)))));
    }
  }
  return { buf, W, H, RA, RB };
}

// The RADIAL PROFILE the unwrap is a picture of: mean grey at each radius over
// a stated angular sector, in viewBox units. Printed as numbers beside the
// picture so a radius can be read to better than the ladder's 1 unit.
export function profile(u, sect = [0, 360], step = 0.25) {
  const { buf, W, H } = u;
  const rows = [];
  for (let j = 0; j < H; j++) {
    const r = u.RB - (u.RB - u.RA) * j / (H - 1);
    const vbu = r * 47;
    let s = 0, n = 0;
    for (let i = 0; i < W; i++) {
      const a = 360 * i / W;
      const inSect = sect[0] <= sect[1] ? (a >= sect[0] && a <= sect[1]) : (a >= sect[0] || a <= sect[1]);
      if (!inSect) continue;
      s += buf[j * W + i]; n++;
    }
    rows.push([+vbu.toFixed(3), s / n]);
  }
  // resample onto a `step`-unit grid
  const out = [];
  for (let vbu = Math.ceil(u.RA * 47 / step) * step; vbu <= u.RB * 47; vbu += step) {
    let best = rows[0], bd = 1e9;
    for (const r of rows) { const d = Math.abs(r[0] - vbu); if (d < bd) { bd = d; best = r; } }
    out.push([+vbu.toFixed(2), +best[1].toFixed(1)]);
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const refs = process.argv.slice(2).length ? process.argv.slice(2)
    : ['penny-obv-3.jpg', 'penny-rev-2.png', 'penny-obv.jpg', 'penny-obv-2.jpg', 'penny-rev.jpg'];
  for (const f of refs) {
    if (!D[f] || !D[f].R) { console.log(`${f}: no frozen disc — skipped`); continue; }
    const u = await unwrap(f);
    const { buf, W, H } = u;
    const y = (vbu) => (RB - vbu / 47) / (RB - RA) * (H - 1);
    let g = '';
    for (let vbu = 30; vbu <= 49; vbu++) {
      const r = vbu / 47; if (r < RA || r > RB) continue;
      const maj = vbu % 5 === 0;
      g += `<path d="M0 ${y(vbu).toFixed(1)}H${W}" stroke="${maj ? '#ff2d55' : '#00e5ff'}" stroke-width="${maj ? 1.4 : 0.7}" opacity="${maj ? 0.95 : 0.5}"/>`
        + `<text x="3" y="${(y(vbu) - 2).toFixed(1)}" font-family="monospace" font-size="13" fill="#ffe600">${vbu}</text>`
        + `<text x="${W - 24}" y="${(y(vbu) - 2).toFixed(1)}" font-family="monospace" font-size="13" fill="#ffe600">${vbu}</text>`;
    }
    for (let a = 0; a < 360; a += 30) {
      const x = W * a / 360;
      g += `<path d="M${x} 0V${H}" stroke="#ffffff" stroke-width="0.7" opacity="0.45"/>`
        + `<text x="${x + 3}" y="14" font-family="monospace" font-size="12" fill="#fff">${a}${a === 270 ? " (12 o'clock)" : a === 90 ? " (6 o'clock)" : ''}</text>`;
    }
    const grey = await sharp(buf, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
    const rgb = await sharp(grey).toColourspace('srgb').png().toBuffer();
    const out = new URL(`./_jp4unwrap-${f.replace(/\..*/, '')}.png`, import.meta.url).pathname;
    await sharp(rgb).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${g}</svg>`) }]).toFile(out);
    console.log(`${f} disc ${JSON.stringify(D[f])} -> ${out}`);
    const pr = profile(u, [0, 360], 0.5);
    console.log('   mean grey by viewBox radius, whole circle:');
    console.log('   ' + pr.map(([r, v]) => `${r}:${v.toFixed(0)}`).join(' '));
  }
}
