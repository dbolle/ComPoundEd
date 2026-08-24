// BUCK obverse round — rectify each obverse photograph INTO OUR viewBox through
// the printed border fitted by `_bx2fit.mjs`, at 10 px per viewBox unit, and
// draw our own frame literals on top so every claim below is readable.
// REPORTS ONLY. Writes only to the directory named on the command line.
import sharp from 'sharp';
import { join } from 'node:path';
import { REF } from './_paths.mjs';
import { fit2 } from './_bx2fit.mjs';

export const S = 10;                       // px per viewBox unit
export const VB = { x0: 0, x1: 100, y0: 0, y1: 56 };
export const W = (VB.x1 - VB.x0) * S, H = (VB.y1 - VB.y0) * S;
export const FRAME = { x0: 5, x1: 95, y0: 5, y1: 51 };

/** Rectified greyscale plane in OUR viewBox units. r.at(X,Y) -> 0..255 */
export async function rectify(f) {
  const r = await fit2(f);
  const [L, T, R, B] = r.border;
  const src = sharp(join(REF, f));
  const { width: SW, height: SH } = await src.metadata();
  const g = await src.clone().greyscale().raw().toBuffer();
  const rgb = await src.clone().raw().toBuffer();
  const sample = (buf, ch, x, y) => {
    if (x < 0 || y < 0 || x >= SW - 1 || y >= SH - 1) return 255;
    const i = x | 0, j = y | 0, fx = x - i, fy = y - j, n = ch;
    const p = (jj, ii) => buf[(jj * SW + ii) * n + (ch === 3 ? 0 : 0)];
    if (ch === 1) return g[j * SW + i] * (1 - fx) * (1 - fy) + g[j * SW + i + 1] * fx * (1 - fy) +
      g[(j + 1) * SW + i] * (1 - fx) * fy + g[(j + 1) * SW + i + 1] * fx * fy;
    return p(j, i);
  };
  const toSrc = (X, Y) => [L + ((X - FRAME.x0) / (FRAME.x1 - FRAME.x0)) * (R - L),
                           T + ((Y - FRAME.y0) / (FRAME.y1 - FRAME.y0)) * (B - T)];
  const plane = new Uint8Array(W * H);
  const colour = Buffer.alloc(W * H * 3);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const X = VB.x0 + (i + 0.5) / S, Y = VB.y0 + (j + 0.5) / S;
    const [sx, sy] = toSrc(X, Y);
    plane[j * W + i] = Math.max(0, Math.min(255, Math.round(sample(g, 1, sx, sy))));
    const ii = Math.max(0, Math.min(SW - 1, sx | 0)), jj = Math.max(0, Math.min(SH - 1, sy | 0));
    for (let c = 0; c < 3; c++) colour[(j * W + i) * 3 + c] = rgb[(jj * SW + ii) * 3 + c];
  }
  return { f, fit: r, plane, colour, W, H, S,
    at: (X, Y) => plane[Math.max(0, Math.min(H - 1, Math.round((Y - VB.y0) * S - 0.5))) * W + Math.max(0, Math.min(W - 1, Math.round((X - VB.x0) * S - 0.5)))] };
}

if (process.argv[1] && process.argv[1].endsWith('_bx3rect.mjs')) {
  const dir = process.argv[2];
  for (const f of ['bill-obv.jpg', 'bill-obv-2.jpg']) {
    const r = await rectify(f);
    const ladder = [];
    for (let X = 0; X <= 100; X += 10) ladder.push(`<line x1="${X * S}" y1="0" x2="${X * S}" y2="${H}" stroke="#ff00ff" stroke-width="1" opacity="0.55"/><text x="${X * S + 2}" y="12" font-size="11" fill="#ff00ff">${X}</text>`);
    for (let Y = 0; Y <= 56; Y += 10) ladder.push(`<line x1="0" y1="${Y * S}" x2="${W}" y2="${Y * S}" stroke="#ff00ff" stroke-width="1" opacity="0.55"/><text x="2" y="${Y * S - 2}" font-size="11" fill="#ff00ff">${Y}</text>`);
    const ours = `<rect x="${5 * S}" y="${5 * S}" width="${90 * S}" height="${46 * S}" fill="none" stroke="#00c8ff" stroke-width="2"/>
      <rect x="${1.4 * S}" y="${1.4 * S}" width="${97.2 * S}" height="${53.2 * S}" rx="${5 * S}" fill="none" stroke="#00c8ff" stroke-width="2"/>
      <ellipse cx="${50.05 * S}" cy="${30.3 * S}" rx="${9.75 * S}" ry="${14 * S}" fill="none" stroke="#ff2020" stroke-width="2"/>
      ${[[8.8, 12.0], [90.4, 12.0], [8.8, 42.1], [90.4, 42.1]].map(([x, y]) => `<circle cx="${x * S}" cy="${y * S}" r="4" fill="#ff2020"/>`).join('')}
      <text x="${77.5 * S}" y="${33 * S}" text-anchor="middle" font-size="${11 * S}" font-weight="800" fill="none" stroke="#ff2020" stroke-width="1.5" letter-spacing="${1.6 * S}">ONE</text>`;
    const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${ladder.join('')}${ours}</svg>`;
    const base = await sharp(r.colour, { raw: { width: W, height: H, channels: 3 } }).png().toBuffer();
    const ov = await sharp(Buffer.from(svg)).resize(W, H).png().toBuffer();
    await sharp(base).composite([{ input: ov }]).png().toFile(join(dir, 'bx3-' + f.replace('.jpg', '.png')));
    await sharp(base).png().toFile(join(dir, 'bx3-plain-' + f.replace('.jpg', '.png')));
    console.log('rectified', f, '-> bx3-' + f.replace('.jpg', '.png'), 'border', r.fit.border.join(','));
  }
}
