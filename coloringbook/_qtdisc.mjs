// The quarter's §2.1 + §20.3: disc fit on every reference, ellipse ratio AND
// orientation, and a circle fitted on the top 240 deg only with the per-sector
// residual, so the coin's visible EDGE THICKNESS is separated from a real tilt.
//
// Differs from _pyellipse/_pyround in one way that matters: quarter-obv-3.png
// is supplied with an ALPHA matte, so the disc mask comes off the alpha channel
// (the nickel's §11.1 move) rather than off a background flood, which cannot
// work when the surround flattens to mid-grey.
import sharp from 'sharp';

export const FILES = ['quarter-obv.jpg', 'quarter-obv-2.jpg', 'quarter-obv-3.png', 'quarter-obv-4.jpg'];
const P = (f) => new URL('./ref/' + f, import.meta.url).pathname;

export async function coinMask(file, alphaT = 128) {
  const meta = await sharp(P(file)).metadata();
  const W = meta.width, H = meta.height;
  if (meta.hasAlpha) {
    const a = await sharp(P(file)).extractChannel(3).raw().toBuffer();
    const m = new Uint8Array(W * H); let n = 0;
    for (let i = 0; i < W * H; i++) { m[i] = a[i] >= alphaT ? 1 : 0; n += m[i]; }
    return { m, W, H, area: n, via: 'alpha' };
  }
  const data = await sharp(P(file)).flatten({ background: '#808080' }).greyscale().raw().toBuffer();
  const border = [];
  for (let x = 0; x < W; x++) border.push(data[x], data[(H - 1) * W + x]);
  for (let y = 0; y < H; y++) border.push(data[y * W], data[y * W + W - 1]);
  border.sort((a, b) => a - b);
  const bmed = border[border.length >> 1], light = bmed > 128, tol = 40;
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
  return { m, W, H, area: n, via: `flood(${light ? 'light' : 'dark'} ${bmed})` };
}

export function rayCast(m, W, H, area) {
  let sx = 0, sy = 0; for (let i = 0; i < W * H; i++) if (m[i]) { sx += i % W; sy += (i / W) | 0; }
  sx /= area; sy /= area;
  const pts = [];
  for (let a = 0; a < 3600; a++) {
    const r = a * Math.PI / 1800, dx = Math.cos(r), dy = Math.sin(r);
    let lo = 0, hi = Math.min(W, H);
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2, x = Math.round(sx + dx * mid), y = Math.round(sy + dy * mid);
      if (x >= 0 && y >= 0 && x < W && y < H && m[y * W + x]) lo = mid; else hi = mid;
    }
    pts.push([a / 10, sx + dx * lo, sy + dy * lo]);
  }
  return pts;
}

export function kasa(P4) {
  let Sx = 0, Sy = 0, Sxx = 0, Syy = 0, Sxy = 0, Sxz = 0, Syz = 0, Sz = 0; const n = P4.length;
  for (const [, x, y] of P4) { const z = x * x + y * y; Sx += x; Sy += y; Sxx += x * x; Syy += y * y; Sxy += x * y; Sxz += x * z; Syz += y * z; Sz += z; }
  const M = [[Sxx, Sxy, Sx, Sxz], [Sxy, Syy, Sy, Syz], [Sx, Sy, n, Sz]];
  for (let c = 0; c < 3; c++) {
    let p = c; for (let r = c + 1; r < 3; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < 3; r++) { if (r === c) continue; const q = M[r][c] / M[c][c]; for (let k = c; k < 4; k++) M[r][k] -= q * M[c][k]; }
  }
  const A = M[0][3] / M[0][0], B = M[1][3] / M[1][1], Cc = M[2][3] / M[2][2];
  const cx = A / 2, cy = B / 2;
  return { cx, cy, R: Math.sqrt(Cc + cx * cx + cy * cy) };
}

function fitEllipse(pts) {
  const A = [], B = [];
  let mx = 0, my = 0; for (const [, x, y] of pts) { mx += x; my += y; }
  mx /= pts.length; my /= pts.length; const sc = 500;
  for (const [, X, Y] of pts) { const x = (X - mx) / sc, y = (Y - my) / sc; A.push([x * x, x * y, y * y, x, y]); B.push(1); }
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
  return { A: Math.max(ax1, ax2) * sc, B: Math.min(ax1, ax2) * sc, thDeg: 0.5 * Math.atan2(-b, c - a) * 180 / Math.PI };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const f of FILES) {
    const { m, W, H, area, via } = await coinMask(f);
    const pts = rayCast(m, W, H, area);
    const e = fitEllipse(pts);
    const use = pts.filter(([a]) => !(a > 25 && a < 155));      // drop the bottom sector
    const fit = kasa(use);
    const res = pts.map(([a, x, y]) => [a, Math.hypot(x - fit.cx, y - fit.cy) - fit.R]);
    const ur = res.filter(([a]) => !(a > 25 && a < 155)).map((r) => Math.abs(r[1])).sort((p, q) => p - q);
    const all = pts.map(([, x, y]) => Math.hypot(x - fit.cx, y - fit.cy)).sort((p, q) => p - q);
    const bins = [];
    for (let b = 0; b < 12; b++) {
      const s = res.filter(([a]) => a >= b * 30 && a < (b + 1) * 30).map((r) => r[1]);
      bins.push(`${b * 30}:${(s.reduce((p, q) => p + q, 0) / s.length).toFixed(1)}`);
    }
    console.log(`${f.padEnd(18)} ${W}x${H} mask ${via}`);
    console.log(`   ellipse A ${e.A.toFixed(2)} B ${e.B.toFixed(2)} ratio ${(e.A / e.B).toFixed(5)} theta ${e.thDeg.toFixed(1)}deg`);
    console.log(`   TOP-240 circle  cx ${fit.cx.toFixed(2)} cy ${fit.cy.toFixed(2)} R ${fit.R.toFixed(2)}` +
      `  |res| med ${ur[ur.length >> 1].toFixed(2)}px p95 ${ur[(ur.length * 0.95) | 0].toFixed(2)}px = ${(100 * ur[(ur.length * 0.95) | 0] / fit.R).toFixed(2)}% of R` +
      `  all-angle r p5/p95 ${all[(all.length * 0.05) | 0].toFixed(1)}/${all[(all.length * 0.95) | 0].toFixed(1)}`);
    console.log(`   mean residual by 30deg sector (0=+x, 90=DOWN): ${bins.join(' ')}`);
  }
}
