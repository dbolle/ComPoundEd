// WHERE THE CENT PUTS ITS FLAT LEGENDS — a row-energy band read, in the
// VIEWBOX frame `INSCRIPTION.penny` authors LIBERTY and the date in.
//
// WHY A BAND AND NOT A GLYPH FIT. On a struck coin a raised letter is an edge,
// not a tone: the field beside it and the top of the letter are the SAME
// reflectance, and every attempt in this project to segment device from field
// on a business strike has failed. Gradient magnitude does not care — a letter
// is a wall of gradient in a window that is otherwise flat field. So the
// instrument integrates |∇I| along each row of a window that contains the word
// and nothing else, and reports where that profile rises and falls. That gives
// the INK band (cap top .. baseline, plus descender if any), which is exactly
// what `flatText`'s `y` and `size` set.
//
// THE WINDOW IS CHOSEN TO CONTAIN ONE WORD AND NO OTHER RELIEF. For LIBERTY on
// the cent that is viewBox x 8..30: the rim crosses x ≈ 3.6 at this height and
// the bust's coat edge is past x ≈ 32 on every reference, so the only relief
// inside is the word. The instrument PRINTS the window it used and the profile
// it got, so a window that caught something else is visible rather than
// silent.
//
// TWO CONTROLS, both required before any number here is quoted:
//   1. OURS is measured by the identical code path. `flatText` authors LIBERTY
//      at baseline y = 53.0, size 5.2; the read must land on that, or the
//      instrument is not reading letters.
//   2. The band is read on SEVEN references separately and never pooled. A
//      figure quoted below is the spread of seven independent reads, not one.
//
// REGISTRATION, AND ITS KNOWN ERROR, quoted with every figure. Each
// photograph's fitted disc is matched to r = 47 (`outlineOf`'s real blank
// radius). BOTH fits are computed and the row prints the disagreement; the RIM
// fit is the one used, because the shared `discOf`'s R = sqrt(area/pi) is not
// merely biased here, on one file it is wrong in kind (see `discOf`). Where the
// two agree, the residual is a SCALE error about the disc centre; LIBERTY's
// band sits only 3..8 units below the centre in y, so a 2% scale error moves
// the read by at most 0.16 units — two orders below the effect found.
//
// READS NOTHING, WRITES NOTHING. Prints a table.
//
//   node coloringbook/judge/_py3band.mjs [x0 x1 y0 y1] [area]
//   FRAC=0.5 node coloringbook/judge/_py3band.mjs ...   # tighter band threshold
import sharp from 'sharp';
import { coinSVG } from '../../src/art/coins.js';
const REF = new URL('../ref/', import.meta.url).pathname;
const RDISC = 47;
const REFS = ['penny-obv-3.jpg', 'penny-obv-4.png', 'penny-obv-1991d.png',
  'penny-obv-proof2021.jpg', 'penny-obv-unc2005.png', 'penny-obv.jpg', 'penny-obv-2.jpg'];

const FIT = process.argv.includes('area') ? 'area' : 'rim';
// The band threshold, as a fraction of (max − floor). Quoted with every read:
// on a PHOTOGRAPH a raised letter's bevel skirt widens the band symmetrically,
// so the MIDPOINT is threshold-stable where the edges are not. `FRAC=0.5 node
// ...` re-runs the whole table at a tighter threshold; if the midpoints move,
// the skirt is not symmetric and no midpoint here may be quoted.
const FRAC = Number(process.env.FRAC || 0.25);
const nums = process.argv.slice(2).filter((s) => /^-?[\d.]+$/.test(s)).map(Number);
const [X0, X1, Y0, Y1] = nums.length === 4 ? nums : [8, 30, 44, 63];

async function grad(file, buf) {
  const src = buf ? sharp(buf) : sharp(REF + file);
  const { data, info } = await src.greyscale().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const g = new Float32Array(W * H);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const gx = data[y * W + x + 1] - data[y * W + x - 1];
    const gy = data[(y + 1) * W + x] - data[(y - 1) * W + x];
    g[y * W + x] = Math.hypot(gx, gy);
  }
  return { g, W, H, data };
}
// TWO disc fits, and the difference between them is itself a result.
//
// `area` is the shared `discOf()` this library registers everything with:
// R = sqrt(area/pi) over every pixel unlike the border median. `rim` seeds from
// that centroid, casts 720 rays, takes the OUTERMOST unlike pixel on each, and
// Kasa-fits a circle to those points with 15% trimmed by residual over four
// iterations.
//
// On six of the seven cent obverses they agree to −0.4%..−2.1% in R and under
// 0.3 viewBox units in centre, which is the disagreement `_nk17grid.mjs`
// already published for the nickel. On the SEVENTH they do not: see the header
// of the printed table.
async function discOf(file) {
  const { data, info } = await sharp(REF + file).greyscale().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, P = (x, y) => data[y * W + x];
  const b = [];
  for (let x = 0; x < W; x++) b.push(P(x, 0), P(x, H - 1));
  for (let y = 0; y < H; y++) b.push(P(0, y), P(W - 1, y));
  b.sort((p, q) => p - q); const bg = b[b.length >> 1];
  const on = (x, y) => Math.abs(P(x, y) - bg) > 25;
  let n = 0, sx = 0, sy = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (on(x, y)) { n++; sx += x; sy += y; }
  const area = { cx: sx / n, cy: sy / n, R: Math.sqrt(n / Math.PI) };
  const pts = [], RMAX = Math.hypot(W, H);
  for (let i = 0; i < 720; i++) {
    const a = (i / 720) * 2 * Math.PI, ca = Math.cos(a), sa = Math.sin(a);
    let last = null;
    for (let r = area.R * 0.6; r < RMAX; r += 0.5) {
      const x = Math.round(area.cx + ca * r), y = Math.round(area.cy + sa * r);
      if (x < 0 || y < 0 || x >= W || y >= H) break;
      if (on(x, y)) last = [x, y];
    }
    if (last) pts.push(last);
  }
  let cx = area.cx, cy = area.cy, R = area.R;
  for (let it = 0; it < 4; it++) {
    const res = pts.map((p) => Math.abs(Math.hypot(p[0] - cx, p[1] - cy) - R));
    const s = res.slice().sort((a, b2) => a - b2);
    const cut = s[Math.floor(s.length * 0.85)];
    const keep = pts.filter((p, i) => res[i] <= cut);
    let Sx = 0, Sy = 0, Sxx = 0, Syy = 0, Sxy = 0, Sz = 0, Sxz = 0, Syz = 0;
    for (const [x, y] of keep) {
      const z = x * x + y * y;
      Sx += x; Sy += y; Sxx += x * x; Syy += y * y; Sxy += x * y; Sz += z; Sxz += x * z; Syz += y * z;
    }
    const A = [[Sxx, Sxy, Sx], [Sxy, Syy, Sy], [Sx, Sy, keep.length]];
    const B = [Sxz, Syz, Sz];
    for (let i = 0; i < 3; i++) {
      let p = i;
      for (let k = i + 1; k < 3; k++) if (Math.abs(A[k][i]) > Math.abs(A[p][i])) p = k;
      [A[i], A[p]] = [A[p], A[i]]; [B[i], B[p]] = [B[p], B[i]];
      for (let k = i + 1; k < 3; k++) {
        const m = A[k][i] / A[i][i];
        for (let j = i; j < 3; j++) A[k][j] -= m * A[i][j];
        B[k] -= m * B[i];
      }
    }
    const v = [0, 0, 0];
    for (let i = 2; i >= 0; i--) { let t = B[i]; for (let j = i + 1; j < 3; j++) t -= A[i][j] * v[j]; v[i] = t / A[i][i]; }
    cx = v[0] / 2; cy = v[1] / 2; R = Math.sqrt(v[2] + cx * cx + cy * cy);
  }
  return { ...(FIT === 'area' ? area : { cx, cy, R }), area, rim: { cx, cy, R } };
}

// profile: mean |grad| along each viewBox row (`axis` 'y') or column ('x').
function profile(G, V2P, axis, lo, hi, o0, o1) {
  const N = Math.round((hi - lo) / 0.1);
  const out = [];
  for (let i = 0; i <= N; i++) {
    const v = lo + i * 0.1;
    let s = 0, n = 0;
    for (let u = o0; u <= o1; u += 0.1) {
      const [px, py] = axis === 'y' ? V2P(u, v) : V2P(v, u);
      const X = Math.round(px), Y = Math.round(py);
      if (X > 0 && Y > 0 && X < G.W - 1 && Y < G.H - 1) { s += G.g[Y * G.W + X]; n++; }
    }
    out.push([v, n ? s / n : 0]);
  }
  return out;
}
// band edges at `frac` of (max - floor), floor = 20th percentile of the profile
function band(p, frac = FRAC) {
  const vals = p.map((q) => q[1]).slice().sort((a, b) => a - b);
  const flo = vals[Math.floor(vals.length * 0.2)];
  const mx = vals[vals.length - 1];
  const th = flo + frac * (mx - flo);
  let a = null, b = null;
  for (const [v, e] of p) { if (e >= th) { if (a === null) a = v; b = v; } }
  return { a, b, th, flo, mx };
}

const rows = [];
{
  const svg = coinSVG('penny', 1600, { side: 'obverse' });
  const png = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' }).png().toBuffer();
  const m = await sharp(png).metadata();
  const per = m.width / 100;
  const G = await grad(null, png);
  const V2P = (x, y) => [x * per, y * per];
  const r = band(profile(G, V2P, 'y', Y0, Y1, X0, X1));
  const c = band(profile(G, V2P, 'x', X0, X1, Y0, Y1));
  rows.push(['OURS', r, c, '-']);
}
for (const f of REFS) {
  const d = await discOf(f);
  const G = await grad(f);
  const V2P = (x, y) => [d.cx + (x - 50) / RDISC * d.R, d.cy + (y - 50) / RDISC * d.R];
  const r = band(profile(G, V2P, 'y', Y0, Y1, X0, X1));
  const c = band(profile(G, V2P, 'x', X0, X1, Y0, Y1));
  rows.push([f, r, c, `${d.R.toFixed(1)} (area ${d.area.R.toFixed(1)}, ${((d.area.R / d.rim.R - 1) * 100).toFixed(1)}%, dcx ${((d.area.cx - d.rim.cx) / d.rim.R * 47).toFixed(2)} dcy ${((d.area.cy - d.rim.cy) / d.rim.R * 47).toFixed(2)})`]);
}
console.log(`window viewBox x ${X0}..${X1}  y ${Y0}..${Y1}   fit=${FIT} frac=${FRAC}   (rows = y band, cols = x band, 25% of range)`);
console.log('file                        y_top   y_bot   y_mid  |  x_lo   x_hi   x_mid |  discR');
for (const [n, r, c, R] of rows) {
  const f = (v) => (v === null ? ' n/a ' : v.toFixed(2).padStart(6));
  console.log(`${n.padEnd(26)}${f(r.a)}  ${f(r.b)}  ${f((r.a + r.b) / 2)}  |${f(c.a)} ${f(c.b)} ${f((c.a + c.b) / 2)} |  ${R}`);
}
