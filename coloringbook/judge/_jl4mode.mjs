// A candidate FIX for D13's normaliser, declared before it is used.
//
// Round 2's finding: D13 divides by the p90 of the disc interior, which is a
// FIELD level only when the brightest tenth of the interior is field. On a
// cameo proof, or any lighting that throws a specular highlight onto the
// device, the p90 is the DEVICE and the coin's own field is then classified as
// ink. Measured: dime-rev-2.jpg bare field / p90 = 0.487.
//
// Hand-placed bare-field patches were the first workaround and they are not
// good enough either — on the Roosevelt reverse four of six frozen patch
// centres land on leaves (`_jl4field-dime-rev-unc2005.png` shows it), which is
// the same wrong-feature failure round 2 hit and the overlay caught. A
// measurement that needs six hand-chosen literals per design does not scale to
// five denominations.
//
// THE CANDIDATE: field level = the MODE of the interior histogram.
//
// The field is the largest single-tone region on any struck coin, so the most
// common grey in the interior IS the field, for either polarity, with no
// patches and no per-design literals. This is testable rather than plausible:
// the mode should agree with the two patch centres that the overlay confirms
// are genuinely on bare field, and it should agree with p90 on the ONE
// reference already known to be clean (nickel-rev-2.png, patch/p90 0.909).
//
// Declared here BEFORE any re-scored D13 value exists. If adopted it changes
// published numbers on four coins and needs a retraction beside each (§1.1),
// which is why this file only REPORTS the comparison and scores nothing.
import sharp from 'sharp';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
// the two patch centres the overlay confirms are on bare field on the
// Roosevelt reverse; used as ground truth, not as the estimator
const CLEAN = [[-0.30, -0.52], [0.30, -0.52]];
const PATCH_R = 0.035;

const greyOf = async (p) => {
  const { data, info } = await sharp(p).greyscale().raw().toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, h: info.height };
};

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
  return { cx: best.cx, cy: best.cy, R: Math.sqrt(best.area / Math.PI) };
}

console.log('reference                      p90  MODE  clean-patch mean   patch/p90   patch/MODE   verdict');
for (const f of process.argv.slice(2)) {
  const g = await greyOf(P(f));
  const D = fitDisc(g);
  const { d, w, h } = g;
  const RAD = 0.851 * D.R;
  const hist = new Array(256).fill(0);
  const vals = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (Math.hypot(x - D.cx, y - D.cy) <= RAD) { const v = d[y * w + x]; hist[v]++; vals.push(v); }
  }
  vals.sort((a, b) => a - b);
  const p90 = vals[(vals.length * 0.9) | 0];
  const sm = hist.map((_, i) => {
    let s = 0, n = 0;
    for (let k = Math.max(0, i - 3); k <= Math.min(255, i + 3); k++) { s += hist[k]; n++; }
    return s / n;
  });
  let mode = 0;
  for (let i = 0; i < 256; i++) if (sm[i] > sm[mode]) mode = i;
  const patch = CLEAN.map(([u, v]) => {
    let s = 0, n = 0;
    const px = D.cx + u * D.R, py = D.cy + v * D.R, pr = PATCH_R * D.R;
    for (let y = Math.floor(py - pr); y <= py + pr; y++) for (let x = Math.floor(px - pr); x <= px + pr; x++) {
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      if (Math.hypot(x - px, y - py) <= pr) { s += d[y * w + x]; n++; }
    }
    return n ? s / n : NaN;
  });
  const pm = patch.reduce((a, b) => a + b, 0) / patch.length;
  const rp = pm / p90, rm = pm / mode;
  console.log(
    `${f.padEnd(30)} ${String(p90).padStart(3)}  ${String(mode).padStart(4)}   ${pm.toFixed(1).padStart(14)}   ` +
    `${rp.toFixed(3).padStart(9)}   ${rm.toFixed(3).padStart(10)}   ` +
    // Compare in GREY LEVELS, not in ratio distance from 1. A ratio is
    // asymmetric about 1 — 0.202 looks "closer" than 1.875 while being 171
    // levels wrong against 20 — and the first version of this line said "p90
    // closer" on the one reference where p90 is catastrophically wrong.
    `|mode-field| ${Math.abs(mode - pm).toFixed(0).padStart(3)}  |p90-field| ${Math.abs(p90 - pm).toFixed(0).padStart(3)}  -> ${Math.abs(mode - pm) < Math.abs(p90 - pm) ? 'MODE' : 'p90'} is the better field estimator`
  );
}
console.log('\nA ratio near 1.000 means the estimator IS the field level. The clean-patch mean is');
console.log('ground truth only on the Roosevelt reverse, where the overlay confirmed those two centres.');
