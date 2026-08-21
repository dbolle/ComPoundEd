// Is a candidate reference USABLE FOR TONE? The one test that matters.
//
// Round 2 established the fault: D13 divides by the p90 of the disc interior,
// which is a FIELD level only if the brightest tenth of the interior is field.
// On three of the four reverse references it is a specular highlight ON THE
// DEVICE, so the coin's own field is classified as ink and the gate is
// unreachable however the art is drawn.
//
// So the acceptance test for a new tone reference is not resolution and not
// independence. It is: does p90(interior) equal the bare field?
//
//     ratio = mean(bare-field patches) / p90(interior)
//
// A usable tone reference has ratio near 1. `nickel-rev-2.png` — the one clean
// reference we already hold — reads 0.949. The dime's current one reads 0.514.
//
// The six patch centres are frozen literals in DISC-NORMALISED coordinates,
// chosen off the Roosevelt reverse's own layout (bare field between the
// legend ring and the device) and therefore valid for any photograph of that
// design, at any resolution. They are NEVER derived from our drawing (§6.1),
// and they are DRAWN on every source so the judge can check the patches are
// actually on bare field (§4.3) — the previous round's first attempt put two
// of them on E PLURIBUS UNUM and only the picture caught it.
import sharp from 'sharp';

const PATCHES = [
  [-0.30, -0.52], [0.30, -0.52],   // upper, either side of the flame
  [-0.58, 0.02], [0.58, 0.02],     // flanks, inboard of the legend ring
  [-0.30, 0.45], [0.30, 0.45],     // lower, between E PLURIBUS UNUM and ONE DIME
];
const PATCH_R = 0.035; // of R
const INK = 0.85;      // _x6dark's frozen ink threshold
const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;

const files = process.argv.slice(2);
if (!files.length) throw new Error('usage: node _jl4fieldtest.mjs <ref.png> [more...]');

const greyOf = async (p) => {
  const { data, info } = await sharp(p).greyscale().raw().toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, h: info.height };
};

// disc by background differencing, as _jd2rule.mjs (polarity-agnostic)
function fitDisc(g) {
  const { d, w, h } = g;
  const border = [];
  for (let x = 0; x < w; x++) border.push(d[x], d[(h - 1) * w + x]);
  for (let y = 0; y < h; y++) border.push(d[y * w], d[y * w + w - 1]);
  border.sort((a, b) => a - b);
  const bg = border[(border.length / 2) | 0];
  const on = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) if (Math.abs(d[i] - bg) > 25) on[i] = 1;
  const lab = new Int32Array(w * h).fill(-1);
  let best = null;
  for (let s0 = 0; s0 < w * h; s0++) {
    if (!on[s0] || lab[s0] >= 0) continue;
    const st = [s0]; lab[s0] = s0;
    let area = 0, sx = 0, sy = 0;
    while (st.length) {
      const p = st.pop(); area++;
      const x = p % w, y = (p / w) | 0; sx += x; sy += y;
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const q = ny * w + nx;
        if (on[q] && lab[q] < 0) { lab[q] = s0; st.push(q); }
      }
    }
    if (!best || area > best.area) best = { area, cx: sx / area, cy: sy / area };
  }
  return { cx: best.cx, cy: best.cy, R: Math.sqrt(best.area / Math.PI), bg };
}

console.log('reference                      p90  p50   bare-field patch means            patchMean  ratio  patches counted as INK');
for (const f of files) {
  const g = await greyOf(P(f));
  const D = fitDisc(g);
  const { d, w, h } = g;
  const RAD = 0.851 * D.R; // r < 40 of 47, _x6dark's interior
  const inside = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (Math.hypot(x - D.cx, y - D.cy) <= RAD) inside.push(d[y * w + x]);
  }
  inside.sort((a, b) => a - b);
  const p90 = inside[(inside.length * 0.9) | 0], p50 = inside[(inside.length * 0.5) | 0];
  const means = PATCHES.map(([u, v]) => {
    let s = 0, n = 0;
    const px = D.cx + u * D.R, py = D.cy + v * D.R, pr = PATCH_R * D.R;
    for (let y = Math.floor(py - pr); y <= py + pr; y++) for (let x = Math.floor(px - pr); x <= px + pr; x++) {
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      if (Math.hypot(x - px, y - py) <= pr) { s += d[y * w + x]; n++; }
    }
    return n ? s / n : NaN;
  });
  const patchMean = means.reduce((a, b) => a + b, 0) / means.length;
  const inkT = INK * p90;
  const asInk = means.filter((m) => m < inkT).length;
  console.log(
    `${f.padEnd(30)} ${String(p90).padStart(3)}  ${String(p50).padStart(3)}   ` +
    means.map((m) => String(Math.round(m)).padStart(4)).join('') +
    `   ${patchMean.toFixed(1).padStart(6)}  ${(patchMean / p90).toFixed(3)}   ${asInk} of 6  (ink threshold ${inkT.toFixed(1)})`
  );
  // draw the patches and the interior circle on the source, and LOOK
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <circle cx="${D.cx.toFixed(1)}" cy="${D.cy.toFixed(1)}" r="${RAD.toFixed(1)}" fill="none" stroke="#00c000" stroke-width="${Math.max(2, w/500)}"/>
    ${PATCHES.map(([u, v], i) => {
      const px = D.cx + u * D.R, py = D.cy + v * D.R, pr = PATCH_R * D.R;
      return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${pr.toFixed(1)}" fill="none" stroke="#ff0000" stroke-width="${Math.max(2, w/500)}"/>` +
             `<text x="${(px + pr + 4).toFixed(1)}" y="${py.toFixed(1)}" fill="#ff0000" font-size="${Math.max(14, w/45)}" font-family="monospace">${Math.round(means[i])}</text>`;
    }).join('')}
  </svg>`;
  const out = `_jl4field-${f.replace(/\.[a-z]+$/i, '')}.png`;
  await sharp(P(f)).composite([{ input: Buffer.from(svg) }]).png().toFile(new URL('./' + out, import.meta.url).pathname);
  console.log(`${' '.repeat(30)} overlay -> ${out}`);
}
