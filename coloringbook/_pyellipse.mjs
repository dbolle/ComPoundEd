// §2.1's second half: is the disc actually a CIRCLE? Sub-pixel ray-cast the
// coin/background boundary at 0.25 degree steps and least-squares an ellipse.
// Ratio A/B over ~1.005 means the photograph is tilted out of plane and any
// art fitted to it inherits the distortion.
import sharp from 'sharp';

const FILES = process.argv.slice(2).length ? process.argv.slice(2)
  : ['penny-obv.jpg', 'penny-obv-2.jpg', 'penny-obv-3.jpg', 'penny-obv-4.png'];

// generic background flood: works for a light OR a dark surround. Decide which
// by the median of the frame's own border pixels.
export async function coinMask(file) {
  const { data, info } = await sharp(`coloringbook/ref/${file}`)
    .flatten({ background: '#808080' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const border = [];
  for (let x = 0; x < W; x++) { border.push(data[x], data[(H - 1) * W + x]); }
  for (let y = 0; y < H; y++) { border.push(data[y * W], data[y * W + W - 1]); }
  border.sort((a, b) => a - b);
  const bmed = border[border.length >> 1];
  const light = bmed > 128;
  // tolerance around the border level; flood everything within it
  const tol = 40;
  const isBg = (v) => (light ? v >= bmed - tol : v <= bmed + tol);
  const bg = new Uint8Array(W * H); const st = new Int32Array(W * H); let sp = 0;
  const push = (p) => { if (!bg[p] && isBg(data[p])) { bg[p] = 1; st[sp++] = p; } };
  for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
  while (sp > 0) {
    const p = st[--sp], x = p % W, y = (p - x) / W;
    if (x > 0) push(p - 1); if (x < W - 1) push(p + 1);
    if (y > 0) push(p - W); if (y < H - 1) push(p + W);
  }
  const m = new Uint8Array(W * H); let n = 0;
  for (let i = 0; i < W * H; i++) { m[i] = bg[i] ? 0 : 1; n += m[i]; }
  return { m, W, H, area: n, borderMedian: bmed, light };
}

function fitEllipse(pts) {
  // algebraic conic fit ax^2+bxy+cy^2+dx+ey+f=0 with f = -1, least squares
  const A = [], B = [];
  let mx = 0, my = 0; for (const [x, y] of pts) { mx += x; my += y; }
  mx /= pts.length; my /= pts.length;
  const sc = 500;
  for (const [X, Y] of pts) {
    const x = (X - mx) / sc, y = (Y - my) / sc;
    A.push([x * x, x * y, y * y, x, y]); B.push(1);
  }
  // normal equations
  const N = 5, M = Array.from({ length: N }, () => new Float64Array(N + 1));
  for (let i = 0; i < A.length; i++) for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) M[r][c] += A[i][r] * A[i][c];
    M[r][N] += A[i][r] * B[i];
  }
  for (let c = 0; c < N; c++) {
    let p = c; for (let r = c + 1; r < N; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < N; r++) { if (r === c) continue; const f = M[r][c] / M[c][c]; for (let k = c; k <= N; k++) M[r][k] -= f * M[c][k]; }
  }
  const [a, b, c, d, e] = M.map((r, i) => r[N] / r[i]); const f = -1;
  const den = b * b - 4 * a * c;
  const x0 = (2 * c * d - b * e) / den, y0 = (2 * a * e - b * d) / den;
  const t1 = 2 * (a * e * e + c * d * d - b * d * e + den * f);
  const t2 = Math.sqrt((a - c) ** 2 + b * b);
  const ax1 = -Math.sqrt(t1 * (a + c + t2)) / den, ax2 = -Math.sqrt(t1 * (a + c - t2)) / den;
  const th = 0.5 * Math.atan2(-b, c - a);
  return { cx: x0 * sc + mx, cy: y0 * sc + my, A: Math.max(ax1, ax2) * sc, B: Math.min(ax1, ax2) * sc, thDeg: th * 180 / Math.PI };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const f of FILES) {
    const { m, W, H, area, borderMedian, light } = await coinMask(f);
    // centroid, then ray-cast
    let sx = 0, sy = 0; for (let i = 0; i < W * H; i++) if (m[i]) { sx += i % W; sy += (i / W) | 0; }
    sx /= area; sy /= area;
    const pts = [];
    for (let a = 0; a < 360; a += 0.25) {
      const r = a * Math.PI / 180, dx = Math.cos(r), dy = Math.sin(r);
      let lo = 0, hi = Math.min(W, H);
      for (let i = 0; i < 40; i++) {
        const mid = (lo + hi) / 2, x = Math.round(sx + dx * mid), y = Math.round(sy + dy * mid);
        const inb = x >= 0 && y >= 0 && x < W && y < H && m[y * W + x];
        if (inb) lo = mid; else hi = mid;
      }
      pts.push([sx + dx * lo, sy + dy * lo]);
    }
    const rr = pts.map(([x, y]) => Math.hypot(x - sx, y - sy)).sort((a, b) => a - b);
    const e = fitEllipse(pts);
    console.log(`${f.padEnd(17)} bg ${light ? 'light' : 'dark'} (median ${borderMedian})  ray radii p5/p50/p95 ` +
      `${rr[(rr.length * 0.05) | 0].toFixed(1)}/${rr[rr.length >> 1].toFixed(1)}/${rr[(rr.length * 0.95) | 0].toFixed(1)}`);
    console.log(`   ellipse  A ${e.A.toFixed(2)}  B ${e.B.toFixed(2)}  ratio ${(e.A / e.B).toFixed(5)}  theta ${e.thDeg.toFixed(1)}deg  centre ${e.cx.toFixed(1)},${e.cy.toFixed(1)}`);
  }
}
