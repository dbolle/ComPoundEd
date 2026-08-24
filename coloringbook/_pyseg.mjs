// §2.2's plateau test on every penny reference. For each threshold, segment the
// portrait inside 0.93R, keep the largest 4-connected component, fill holes, and
// report the equivalent radius. A usable reference has a PLATEAU; if the number
// drifts monotonically there is no edge, only a ramp.
import sharp from 'sharp';
import { discFit } from './_nkdisc.mjs';

export async function greyOf(file) {
  const { data, info } = await sharp(`coloringbook/ref/${file}`)
    .flatten({ background: '#ffffff' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  return { d: data, W: info.width, H: info.height };
}

// segment INSIDE the disc: zero everything outside rFrac*R, threshold, largest
// component, fill holes.
export function segIn(g, disc, T, rFrac = 0.93, above = true) {
  const { d, W, H } = g;
  const m = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x;
    if (Math.hypot(x - disc.cx, y - disc.cy) > rFrac * disc.R) continue;
    m[i] = above ? (d[i] >= T ? 1 : 0) : (d[i] <= T ? 1 : 0);
  }
  const lab = new Int32Array(W * H).fill(-1); const st = new Int32Array(W * H);
  let best = -1, bestN = 0, nl = 0;
  for (let i = 0; i < W * H; i++) {
    if (!m[i] || lab[i] >= 0) continue;
    let sp = 0; st[sp++] = i; lab[i] = nl; let n = 0;
    while (sp > 0) {
      const p = st[--sp]; n++; const x = p % W, y = (p - x) / W;
      if (x > 0 && m[p - 1] && lab[p - 1] < 0) { lab[p - 1] = nl; st[sp++] = p - 1; }
      if (x < W - 1 && m[p + 1] && lab[p + 1] < 0) { lab[p + 1] = nl; st[sp++] = p + 1; }
      if (y > 0 && m[p - W] && lab[p - W] < 0) { lab[p - W] = nl; st[sp++] = p - W; }
      if (y < H - 1 && m[p + W] && lab[p + W] < 0) { lab[p + W] = nl; st[sp++] = p + W; }
    }
    if (n > bestN) { bestN = n; best = nl; } nl++;
  }
  const keep = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) keep[i] = lab[i] === best ? 1 : 0;
  const bg = new Uint8Array(W * H); let sp = 0;
  for (let x = 0; x < W; x++) for (const y of [0, H - 1]) { const p = y * W + x; if (!keep[p] && !bg[p]) { bg[p] = 1; st[sp++] = p; } }
  for (let y = 0; y < H; y++) for (const x of [0, W - 1]) { const p = y * W + x; if (!keep[p] && !bg[p]) { bg[p] = 1; st[sp++] = p; } }
  while (sp > 0) {
    const p = st[--sp], x = p % W, y = (p - x) / W;
    if (x > 0 && !keep[p - 1] && !bg[p - 1]) { bg[p - 1] = 1; st[sp++] = p - 1; }
    if (x < W - 1 && !keep[p + 1] && !bg[p + 1]) { bg[p + 1] = 1; st[sp++] = p + 1; }
    if (y > 0 && !keep[p - W] && !bg[p - W]) { bg[p - W] = 1; st[sp++] = p - W; }
    if (y < H - 1 && !keep[p + W] && !bg[p + W]) { bg[p + W] = 1; st[sp++] = p + W; }
  }
  const out = new Uint8Array(W * H); let area = 0;
  for (let i = 0; i < W * H; i++) { out[i] = bg[i] ? 0 : 1; area += out[i]; }
  return { mask: out, area, eqR: Math.sqrt(area / Math.PI), W, H };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const FILES = ['penny-obv.jpg', 'penny-obv-2.jpg', 'penny-obv-3.jpg', 'penny-obv-4.png'];
  for (const f of FILES) {
    const g = await greyOf(f);
    // disc: use the ray-cast circle from _pyellipse for robustness
    const { coinMask } = await import('./_pyellipse.mjs');
    const cm = await coinMask(f);
    let sx = 0, sy = 0; for (let i = 0; i < cm.W * cm.H; i++) if (cm.m[i]) { sx += i % cm.W; sy += (i / cm.W) | 0; }
    sx /= cm.area; sy /= cm.area;
    const disc = { cx: sx, cy: sy, R: Math.sqrt(cm.area / Math.PI) };
    // histogram inside 0.9R
    const hist = new Array(26).fill(0);
    for (let y = 0; y < g.H; y++) for (let x = 0; x < g.W; x++) {
      if (Math.hypot(x - disc.cx, y - disc.cy) > 0.9 * disc.R) continue;
      hist[Math.min(25, g.d[y * g.W + x] >> 3)]++;
    }
    console.log(`\n== ${f}  disc cx ${disc.cx.toFixed(1)} cy ${disc.cy.toFixed(1)} R ${disc.R.toFixed(1)}`);
    console.log('   histogram (bins of 8):', hist.map((v, i) => v > 0.01 * hist.reduce((a, b) => a + b) ? `${i * 8}:${(100 * v / hist.reduce((a, b) => a + b)).toFixed(0)}%` : '').filter(Boolean).join(' '));
    const row = [];
    for (let T = 40; T <= 230; T += 10) {
      const s = segIn(g, disc, T);
      row.push(`${T}:${(s.eqR / disc.R).toFixed(3)}`);
    }
    console.log('   eqR/R vs T (above):', row.join(' '));
  }
}
