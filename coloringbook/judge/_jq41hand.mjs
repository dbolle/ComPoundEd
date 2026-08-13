// ROUND 4 — HAND-SEEDED DISC FITS, and the frozen disc table for the proofs.
//
// COIN-JUDGE.md §2.1: "a hand annotation is a legitimate frozen target". Three
// of the new references defeat every automatic fitter in the repo (see
// `_jq41disc.mjs`'s header and `_jq4-discs.png`), because the 1963/1964 plates
// place a silver coin on a *parchment* ground whose chroma varies more than the
// step at the coin's edge, and the ebay 1998-S is a close-up with visible
// perspective on the reeding.
//
// So the SEED comes from my eye, off a labelled 50 px ladder drawn on the
// source (`_jq41grid.mjs`), and the instrument only REFINES it:
//   1. from the seed centre, walk 720 rays and take the radius of maximum
//      |d grey / d r| inside +-15% of the seed radius;
//   2. Kasa-fit those, twice, rejecting > 2.5 sigma;
//   3. report p95 residual as % of R, and the per-30-deg residual, so an
//      oblique shot shows up as a sinusoid rather than as a bad number.
//
// §4.1: the ray search window is printed; an edge found at the window end is
// dropped, and the count dropped is printed. §4.3: `_jq41hand-overlay.png`.
import sharp from 'sharp';
import { kasa } from '../_qtdisc.mjs';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;

// SEEDS read by eye off the 50px ladder. cx, cy, R in source pixels.
export const SEED = {
  'qp1963-obv-pad.png':    { cx: 469, cy: 499, R: 290 },   // grey flood and hough agreed to 0.7%; seed = their mean
  'qp1963-rev-pad.png':    { cx: 461, cy: 504, R: 288 },   // chroma and grey agreed to 0.47%
  'qp1964-obv-pad.png':    { cx: 461.5, cy: 501.5, R: 288.5 }, // hand: L178 R745 T208 B795
  'qp1964-rev-pad.png':    { cx: 461.5, cy: 502.5, R: 295.5 }, // hand: L168 R755 T205 B800
  'quarter-proof-ebay.jpg':{ cx: 595, cy: 617.5, R: 536 },  // hand: L50 R1140 T90 B1145
  'dime-obv-2.jpg':        { cx: 475, cy: 475, R: 468 },
  'q1995d-rev.png':        { cx: 258, cy: 254, R: 253 },
  'quarter-rev-2.png':     { cx: 374.5, cy: 374.4, R: 375 },
  'quarter-rev-3.jpg':     { cx: 999.5, cy: 999.5, R: 999.5 },
};

export async function refine(file, seed = SEED[file], win = 0.15) {
  const { data, info } = await sharp(P(file)).flatten({ background: '#808080' })
    .greyscale().blur(2).raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const at = (x, y) => (x < 0 || y < 0 || x >= W - 1 || y >= H - 1) ? NaN
    : data[(y | 0) * W + (x | 0)];
  const r0 = seed.R * (1 - win), r1 = seed.R * (1 + win);
  const pts = []; let atBound = 0;
  for (let a = 0; a < 720; a++) {
    const th = a * Math.PI / 360, dx = Math.cos(th), dy = Math.sin(th);
    // The OUTERMOST significant edge, not the strongest one. On a proof the
    // rim's INNER edge (field -> flat rim) is a bigger grey step than the
    // coin's outer silhouette against the ground, so "max |grad|" walks inboard
    // by ~7% and returns the rim seat. Control: on dime-obv-2.jpg, whose grey
    // flood fit is reliable (white ground, p95 0.6%), max-|grad| returns
    // R 434.7 against a true 468.4 — a 7.2% error that looks like a fit.
    const prof = [];
    for (let r = r0; r <= r1; r += 0.5) {
      const v0 = at(seed.cx + dx * (r - 2), seed.cy + dy * (r - 2));
      const v1 = at(seed.cx + dx * (r + 2), seed.cy + dy * (r + 2));
      prof.push([r, (Number.isNaN(v0) || Number.isNaN(v1)) ? 0 : Math.abs(v1 - v0)]);
    }
    const gmax = Math.max(...prof.map((p) => p[1]));
    let br = NaN;
    for (const [r, g] of prof) if (g >= 0.5 * gmax) br = r;
    if (!Number.isFinite(br)) continue;
    if (br <= r0 + 0.5 || br >= r1 - 0.5) { atBound++; continue; }  // §4.1
    pts.push([a / 2, seed.cx + dx * br, seed.cy + dy * br]);
  }
  let use = pts, f = kasa(use);
  for (let it = 0; it < 2; it++) {
    const res = use.map(([, x, y]) => Math.hypot(x - f.cx, y - f.cy) - f.R);
    const sd = Math.sqrt(res.reduce((p, q) => p + q * q, 0) / res.length);
    use = use.filter((p, i) => Math.abs(res[i]) <= 2.5 * sd);
    f = kasa(use);
  }
  const res = pts.map(([a, x, y]) => [a, Math.hypot(x - f.cx, y - f.cy) - f.R]);
  const abs = res.map((r) => Math.abs(r[1])).sort((a, b) => a - b);
  const sect = Array.from({ length: 12 }, (_, b) => {
    const s = res.filter(([a]) => a >= b * 30 && a < (b + 1) * 30).map((r) => r[1]);
    return s.length ? s.reduce((p, q) => p + q, 0) / s.length : NaN; });
  return { file, W, H, cx: +f.cx.toFixed(2), cy: +f.cy.toFixed(2), R: +f.R.toFixed(2),
    seed, window: [+r0.toFixed(1), +r1.toFixed(1)], atBound, kept: use.length, rays: pts.length,
    p95: +abs[(abs.length * 0.95) | 0].toFixed(2), med: +abs[abs.length >> 1].toFixed(2), sect };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const files = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SEED);
  const out = {}, tiles = [], tile = 470;
  for (const f of files) {
    const r = await refine(f);
    out[f] = { cx: r.cx, cy: r.cy, R: r.R };
    console.log(`${f.padEnd(24)} seed R ${String(r.seed.R).padStart(6)}  window [${r.window[0]}, ${r.window[1]}]  ` +
      `-> cx ${String(r.cx).padStart(7)} cy ${String(r.cy).padStart(7)} R ${String(r.R).padStart(7)}  ` +
      `p95 ${String(r.p95).padStart(6)} = ${(100 * r.p95 / r.R).toFixed(2)}% of R   rays ${r.rays}/720 (${r.atBound} at window end, dropped)`);
    console.log(`   sector mean residual (px, 30 deg bins): ${r.sect.map((v) => (Number.isNaN(v) ? '  —' : v.toFixed(1).padStart(6))).join('')}`);
    const s = tile / Math.max(r.W, r.H), ox = (tile - r.W * s) / 2, oy = (tile - r.H * s) / 2;
    const cc = (m, col, w, dash = '') => `<circle cx="${ox + r.cx * s}" cy="${oy + r.cy * s}" r="${r.R * s * m}" fill="none" stroke="${col}" stroke-width="${w}" ${dash}/>`;
    const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${tile}" height="${tile}">` +
      cc(1, '#00ff6a', 2) + cc(40.5 / 47, '#ff2d55', 1.4) + cc(0.80, '#ffe600', 1.2, 'stroke-dasharray="4 4"') +
      `<text x="4" y="14" font-family="monospace" font-size="12" fill="#fff">${f} R=${r.R}</text></svg>`);
    tiles.push(await sharp(P(f)).flatten({ background: '#808080' })
      .resize(tile, tile, { fit: 'contain', background: '#202020' }).composite([{ input: svg }]).png().toBuffer());
  }
  const cols = 3, rows = Math.ceil(tiles.length / cols);
  const png = new URL('./_jq41hand-overlay.png', import.meta.url).pathname;
  await sharp({ create: { width: cols * tile, height: rows * tile, channels: 3, background: '#404040' } })
    .composite(tiles.map((b, i) => ({ input: b, left: (i % cols) * tile, top: ((i / cols) | 0) * tile })))
    .png().toFile(png);
  console.log(`\noverlay: ${png}   green = fitted blank r47, red = field circle r40.5, dashed yellow = 0.80R`);
  console.log('\nDISCS:'); console.log(JSON.stringify(out, null, 1));
}
