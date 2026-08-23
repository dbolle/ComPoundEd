// WHERE IS JEFFERSON'S EYE? A tone map of the socket window in the head's own
// local frame, on each reference independently, plus the centroid and extent
// of the darkest blob in it.
//
// The eye and the brow are the two DEEPEST cuts on this part of the die, so on
// a photograph they are the two darkest things in the window — this needs no
// segmentation of device from field, which is the wall that has stopped ~10
// instruments in this project. It is a local extremum inside the device.
//
// NULL TEST: the same window is run on nickel-obv-4.jpg and nickel-obv.jpg as
// well, and the per-reference answers are printed side by side rather than
// pooled. `nickel-obv-unc2004.jpg` is a re-encode of `nickel-obv.jpg` (NCC
// 0.9674) — one piece of evidence, printed twice on purpose so that is visible.
import sharp from 'sharp';
const REF = new URL('../ref/', import.meta.url).pathname;
const S = 0.95, CX = -6.4, CY = 43.7, DIR = -1, RDISC = 47;
const L2V = (X, Y) => [50 + CX + DIR * S * X, CY + S * Y];

// x stops at 16: beyond that is the PROFILE EDGE and then the field, which on
// the cameo proof is the darkest thing in the picture. The first run of this
// put the "brow" centroid at x 18.2 — it had found the black field.
const X0 = +(process.env.NK_X0 || 7), X1 = +(process.env.NK_X1 || 16);
const Y0 = -15, Y1 = -3, STEP = 0.25;

async function load(file) {
  const { data, info } = await sharp(REF + file).greyscale().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, P = (x, y) => data[y * W + x];
  const b = [];
  for (let x = 0; x < W; x++) b.push(P(x, 0), P(x, H - 1));
  for (let y = 0; y < H; y++) b.push(P(0, y), P(W - 1, y));
  b.sort((p, q) => p - q); const bg = b[b.length >> 1];
  let n = 0, sx = 0, sy = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (Math.abs(P(x, y) - bg) > 25) { n++; sx += x; sy += y; }
  const D = { cx: sx / n, cy: sy / n, R: Math.sqrt(n / Math.PI) };
  return (X, Y) => {
    const [vx, vy] = L2V(X, Y);
    const x = Math.round(D.cx + (vx - 50) / RDISC * D.R), y = Math.round(D.cy + (vy - 50) / RDISC * D.R);
    if (x < 0 || y < 0 || x >= W || y >= H) return null;
    // 3x3 mean, so a single JPEG speckle cannot be the darkest thing here
    let s = 0, c = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H) { s += P(xx, yy); c++; } }
    return s / c;
  };
}

const RAMP = ' .:-=+*#%@';
for (const file of process.argv.slice(2)) {
  const at = await load(file);
  const vals = [];
  const nx = Math.round((X1 - X0) / STEP) + 1, ny = Math.round((Y1 - Y0) / STEP) + 1;
  const g = [];
  for (let j = 0; j < ny; j++) { const row = [];
    for (let i = 0; i < nx; i++) { const v = at(X0 + i * STEP, Y0 + j * STEP); row.push(v); if (v !== null) vals.push(v); }
    g.push(row); }
  vals.sort((a, b) => a - b);
  const lo = vals[Math.floor(vals.length * 0.02)], hi = vals[Math.floor(vals.length * 0.98)];
  console.log(`\n=== ${file} ===   window x ${X0}..${X1}, y ${Y0}..${Y1}, ${STEP} local units/cell`);
  console.log(`    tone 2nd pct ${lo.toFixed(0)}  98th ${hi.toFixed(0)}   (dark = @, light = space; local +x is toward the NOSE)`);
  // header
  let hdr = '        ';
  for (let i = 0; i < nx; i++) hdr += ((X0 + i * STEP) % 2 === 0 ? String(Math.abs(X0 + i * STEP)).slice(-1) : ' ');
  console.log(hdr);
  for (let j = 0; j < ny; j++) {
    const Y = Y0 + j * STEP;
    let line = `  ${Y.toFixed(2).padStart(6)} `;
    for (let i = 0; i < nx; i++) { const v = g[j][i];
      line += v === null ? '?' : RAMP[Math.max(0, Math.min(9, Math.round(9 * (hi - v) / (hi - lo))))]; }
    console.log(line);
  }
  // darkest blob: cells in the darkest 8% of the window, weighted centroid,
  // reported separately above and below y = -10 (brow vs eye)
  const cut = vals[Math.floor(vals.length * 0.08)];
  for (const [name, ya, yb] of [['BROW  ', -14.5, -10.0], ['EYE   ', -9.5, -4.5]]) {
    let sw = 0, sxx = 0, syy = 0, minx = 99, maxx = -99, miny = 99, maxy = -99;
    for (let j = 0; j < ny; j++) { const Y = Y0 + j * STEP; if (Y < ya || Y >= yb) continue;
      for (let i = 0; i < nx; i++) { const v = g[j][i]; if (v === null || v > cut) continue;
        const X = X0 + i * STEP, w = cut - v + 1;
        sw += w; sxx += X * w; syy += Y * w;
        minx = Math.min(minx, X); maxx = Math.max(maxx, X); miny = Math.min(miny, Y); maxy = Math.max(maxy, Y); } }
    if (sw === 0) { console.log(`  ${name} no cells under the 8th-percentile cut`); continue; }
    console.log(`  ${name} centroid (${(sxx / sw).toFixed(2)}, ${(syy / sw).toFixed(2)})  extent x ${minx.toFixed(2)}..${maxx.toFixed(2)} (${(maxx - minx).toFixed(2)})  y ${miny.toFixed(2)}..${maxy.toFixed(2)} (${(maxy - miny).toFixed(2)})`);
  }
}
console.log('\nWHAT WE DRAW: the shared EYE_MARK, untranslated —');
console.log('  lid arc  x 2.60..9.40 at y -4.60 (bowed to y -6.5), 6.80 long');
console.log('  pupil    circle r 1.50 centred (6.00, -2.60)');
