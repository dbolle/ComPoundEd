// DIME r0, TASK 3 — POLAR UNWRAP WITH A LABELLED viewBox LADDER.
//
// Quarter r4 (Appendix S2) and cent r0 (PY7): before building a detector for a
// radial feature, render the artefact in the coordinate system the feature is
// DEFINED in and read it off. Five band finders across two coins have now
// failed with in-bounds, response-tested, confident answers to the wrong
// question; one picture has worked twice. An unwrap cannot be wrong about
// where a feature is — it IS the picture.
//
// x = angle 0..360 deg, angle = atan2(v, u) with v DOWNWARD, so 0 = 3 o'clock,
//                       90 = 6 o'clock, 180 = 9 o'clock, 270 = 12 o'clock.
// y = radius, top RB to bottom RA, ladder every 1.0 viewBox unit, red every 5.
// Rows are exact bilinear samples of the source through the FROZEN disc.
//
// Construction is `_jp4unwrap.mjs`'s (cent r0), reimplemented against
// `_jd1discs.json` so this round's outputs and its disc table stay together.
// Both are hashed.
//
// Run: node coloringbook/judge/_jd3unwrap.mjs [ref ...]
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
const D = JSON.parse(readFileSync(new URL('./_jd1discs.json', import.meta.url)));
export const RA = 0.60, RB = 1.06;

export async function unwrap(file, disc = D[file], W = 1800, H = 640) {
  const { data, info } = await sharp(P(file)).flatten({ background: '#808080' })
    .greyscale().raw().toBuffer({ resolveWithObject: true });
  const IW = info.width, IH = info.height;
  // OUT OF FRAME IS NOT BLACK. `_jp4unwrap.mjs` returns 0 outside the image,
  // which puts a 255-level step at the frame edge; on four of the dime's six
  // references the frame cuts inside RB, and the edge finder locked onto that
  // step instead of the coin. Fixed here BEFORE any value was published:
  // out-of-frame samples are marked invalid in `ok` and every consumer skips
  // them. (Recorded in dime-r0.md §Instruments I distrust.)
  const at = (x, y) => {
    if (x < 0 || y < 0 || x >= IW - 1 || y >= IH - 1) return NaN;
    const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0;
    return data[y0 * IW + x0] * (1 - fx) * (1 - fy) + data[y0 * IW + x0 + 1] * fx * (1 - fy)
      + data[(y0 + 1) * IW + x0] * (1 - fx) * fy + data[(y0 + 1) * IW + x0 + 1] * fx * fy;
  };
  const buf = Buffer.alloc(W * H);
  const ok = new Uint8Array(W * H);
  for (let j = 0; j < H; j++) {
    const r = RB - (RB - RA) * j / (H - 1);
    for (let i = 0; i < W; i++) {
      const th = (360 * i / W) * Math.PI / 180;
      const v = at(disc.cx + r * disc.R * Math.cos(th), disc.cy + r * disc.R * Math.sin(th));
      if (Number.isNaN(v)) { buf[j * W + i] = 0; ok[j * W + i] = 0; }
      else { buf[j * W + i] = Math.max(0, Math.min(255, Math.round(v))); ok[j * W + i] = 1; }
    }
  }
  return { buf, ok, W, H, RA, RB };
}

export function ladder(u, extra = [], rLo = 33, rHi = 49) {
  const { W, H } = u;
  const y = (vbu) => (u.RB - vbu / 47) / (u.RB - u.RA) * (H - 1);
  let g = '';
  for (let vbu = rLo; vbu <= rHi; vbu++) {
    const r = vbu / 47; if (r < u.RA || r > u.RB) continue;
    const maj = vbu % 5 === 0;
    g += `<path d="M0 ${y(vbu).toFixed(1)}H${W}" stroke="${maj ? '#ff2d55' : '#00e5ff'}" stroke-width="${maj ? 1.4 : 0.7}" opacity="${maj ? 0.95 : 0.5}"/>`
      + `<text x="3" y="${(y(vbu) - 2).toFixed(1)}" font-family="monospace" font-size="14" fill="#ffe600">${vbu}</text>`
      + `<text x="${W - 26}" y="${(y(vbu) - 2).toFixed(1)}" font-family="monospace" font-size="14" fill="#ffe600">${vbu}</text>`;
  }
  for (let a = 0; a < 360; a += 30) {
    const x = W * a / 360;
    g += `<path d="M${x} 0V${H}" stroke="#ffffff" stroke-width="0.7" opacity="0.45"/>`
      + `<text x="${x + 3}" y="14" font-family="monospace" font-size="12" fill="#fff">${a}${a === 270 ? " (12h)" : a === 90 ? " (6h)" : a === 0 ? ' (3h)' : a === 180 ? ' (9h)' : ''}</text>`;
  }
  for (const e of extra) g += e;
  return g;
}

export async function draw(u, g, out) {
  const grey = await sharp(u.buf, { raw: { width: u.W, height: u.H, channels: 1 } }).png().toBuffer();
  const rgb = await sharp(grey).toColourspace('srgb').png().toBuffer();
  await sharp(rgb).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${u.W}" height="${u.H}">${g}</svg>`) }]).toFile(out);
  return out;
}

export function profile(u, sect = [[0, 360]], step = 0.25) {
  const { buf, W, H } = u;
  const rows = [];
  for (let j = 0; j < H; j++) {
    const r = u.RB - (u.RB - u.RA) * j / (H - 1);
    const vals = [];
    for (let i = 0; i < W; i++) {
      const a = 360 * i / W;
      if (!sect.some(([s0, s1]) => (s0 <= s1 ? (a >= s0 && a <= s1) : (a >= s0 || a <= s1)))) continue;
      if (!u.ok[j * W + i]) continue;
      vals.push(buf[j * W + i]);
    }
    if (!vals.length) { rows.push([r * 47, NaN, NaN, 0]); continue; }
    const mean = vals.reduce((p, q) => p + q, 0) / vals.length;
    const sorted = vals.slice().sort((p, q) => p - q);
    rows.push([r * 47, mean, sorted[sorted.length >> 1], vals.length]);
  }
  const out = [];
  for (let vbu = Math.ceil(u.RA * 47 / step) * step; vbu <= u.RB * 47; vbu += step) {
    let best = rows[0], bd = 1e9;
    for (const r of rows) { const d = Math.abs(r[0] - vbu); if (d < bd) { bd = d; best = r; } }
    out.push([+vbu.toFixed(2), +best[1].toFixed(1), +best[2].toFixed(1), best[3]]);
  }
  return out;   // [radius, angular MEAN, angular MEDIAN, n valid samples]
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const refs = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(D).filter((f) => D[f].R);
  for (const f of refs) {
    if (!D[f] || !D[f].R) { console.log(`${f}: no frozen disc — skipped`); continue; }
    const u = await unwrap(f);
    const out = await draw(u, ladder(u), new URL(`./_jd3unwrap-${f.replace(/\..*/, '')}.png`, import.meta.url).pathname);
    console.log(`${f} disc ${JSON.stringify(D[f])} -> ${out}`);
    const pr = profile(u, [[0, 360]], 0.5);
    console.log('   mean grey by viewBox radius, whole circle:');
    console.log('   ' + pr.filter(([r]) => r >= 33).map(([r, v]) => `${r}:${v.toFixed(0)}`).join(' '));
  }
}
