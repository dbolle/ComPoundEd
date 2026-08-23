// THE SILHOUETTE LADDER, ours against the proof, in HEAD.Jefferson's own frame.
//
// OURS is taken from the PATH, not from pixels: the back and top of the bust
// are HEAD.Jefferson's own outline (the hair mass is drawn inside it), so
// flattening that one path is exact and needs no segmentation at all. The
// first version of this file thresholded our render instead and reported the
// back of the head at a constant local x = -42 for 16 consecutive rungs — it
// was finding the L of LIBERTY, which sits at r = 0.79 and passed the r-guard.
// Recorded rather than quietly fixed.
//
// THE PROOF is nickel-obv-proof.png, a cameo proof: frosted device on a mirror
// field that photographs near-black, so one level threshold separates device
// from field on THIS reference where nothing works on a business strike (the
// same property HEAD.Lincoln was measured with). Null-tested by drawing every
// rung back on the photograph — see _pv/trace-*.png.
//
// Guards, because the failure mode is a rung snapping to the rim or a legend:
// void unless inside r = 0.80 of the disc, and the boundary is the OUTERMOST
// place where the next 1.6 local units are all device (a groove inside the wig
// is as dark as the field, so "walk until it goes dark" finds grooves).
import sharp from 'sharp';
import fs from 'fs';
const REF = new URL('../ref/', import.meta.url).pathname;
const S = 0.95, CX = -6.4, CY = 43.7, DIR = -1, RDISC = 47;
const L2V = (X, Y) => [50 + CX + DIR * S * X, CY + S * Y];
const RGUARD = 0.80;

// ── our head outline, straight out of coins.js ────────────────────────────
const src = fs.readFileSync(new URL('../../src/art/coins.js', import.meta.url).pathname, 'utf8');
function headPath(name) {
  const i = src.indexOf(`\n  ${name}: [`);
  const j = src.indexOf("].join(' ')", i);
  return src.slice(i, j).split('\n').map((l) => (l.match(/'([^']*)'/) || [, ''])[1]).join(' ');
}
export function flatten(d) {
  const t = d.match(/[-\d.]+|[A-Za-z]/g);
  const pts = []; let i = 0, cur = [0, 0], cmd = '';
  const bez = (p0, p1, p2, p3) => { for (let s = 1; s <= 24; s++) { const u = s / 24, v = 1 - u;
    pts.push([v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0],
      v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]]); } };
  while (i < t.length) {
    if (/[A-Za-z]/.test(t[i])) { cmd = t[i++]; if (cmd === 'Z' || cmd === 'z') continue; }
    if (cmd === 'M') { cur = [+t[i++], +t[i++]]; pts.push(cur); }
    else if (cmd === 'C') { const p1 = [+t[i++], +t[i++]], p2 = [+t[i++], +t[i++]], p3 = [+t[i++], +t[i++]]; bez(cur, p1, p2, p3); cur = p3; }
    else i++;
  }
  return pts;
}
const HEAD_J = flatten(headPath('Jefferson'));

// for a local y, the most-negative x on the outline (interpolated on segments)
function backAt(poly, Y) {
  let best = null;
  for (let k = 0; k < poly.length; k++) {
    const a = poly[k], b = poly[(k + 1) % poly.length];
    if ((a[1] - Y) * (b[1] - Y) > 0) continue;
    const t = (Y - a[1]) / ((b[1] - a[1]) || 1e-9);
    const x = a[0] + t * (b[0] - a[0]);
    if (best === null || x < best) best = x;
  }
  return best;
}
function frontAt(poly, Y) {
  let best = null;
  for (let k = 0; k < poly.length; k++) {
    const a = poly[k], b = poly[(k + 1) % poly.length];
    if ((a[1] - Y) * (b[1] - Y) > 0) continue;
    const t = (Y - a[1]) / ((b[1] - a[1]) || 1e-9);
    const x = a[0] + t * (b[0] - a[0]);
    if (best === null || x > best) best = x;
  }
  return best;
}
function topAtPoly(poly, X) {
  let best = null;
  for (let k = 0; k < poly.length; k++) {
    const a = poly[k], b = poly[(k + 1) % poly.length];
    if ((a[0] - X) * (b[0] - X) > 0) continue;
    const t = (X - a[0]) / ((b[0] - a[0]) || 1e-9);
    const y = a[1] + t * (b[1] - a[1]);
    if (best === null || y < best) best = y;
  }
  return best;
}

// ── the proof ─────────────────────────────────────────────────────────────
async function proofSampler(file, TH) {
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
    if (Math.hypot(vx - 50, vy - 50) / RDISC > RGUARD) return null;
    const x = Math.round(D.cx + (vx - 50) / RDISC * D.R), y = Math.round(D.cy + (vy - 50) / RDISC * D.R);
    if (x < 0 || y < 0 || x >= W || y >= H) return null;
    return P(x, y) > TH;
  };
}
const RUN = 1.6;
function finder(on) {
  const solid = (X, Y, dx, dy) => { for (let t = 0; t <= RUN; t += 0.2) if (on(X + dx * t, Y + dy * t) !== true) return false; return true; };
  return {
    back: (Y) => { for (let X = -42; X <= -6; X += 0.1) if (solid(X, Y, 1, 0)) return X; return null; },
    front: (Y) => { for (let X = 34; X >= 4; X -= 0.1) if (solid(X, Y, -1, 0)) return X; return null; },
    top: (X) => { for (let Y = -42; Y <= 8; Y += 0.1) if (solid(X, Y, 0, 1)) return Y; return null; },
  };
}

const th = +(process.env.NK_TH || 60);
const ep = finder(await proofSampler(process.env.NK_REF || 'nickel-obv-proof.png', th));
const fmt = (v) => (v === null ? '   --' : v.toFixed(1).padStart(6));

console.log(`BACK OF THE HEAD — outermost local x at each local y (proof threshold ${th}, r-guard ${RGUARD})`);
console.log('     y     proof     ours        Δ');
let sum = 0, cnt = 0, worst = 0, wy = null;
for (let Y = -30; Y <= 22; Y += 2) {
  const a = ep.back(Y), b = backAt(HEAD_J, Y);
  let d = '';
  if (a !== null && b !== null) { const dd = b - a; d = dd.toFixed(1).padStart(8); sum += Math.abs(dd); cnt++; if (Math.abs(dd) > Math.abs(worst)) { worst = dd; wy = Y; } }
  console.log(`  ${String(Y).padStart(4)}  ${fmt(a)}  ${fmt(b)}  ${d}`);
}
console.log(`  mean |Δ| ${(sum / cnt).toFixed(2)} local units over ${cnt} rungs; worst ${worst.toFixed(1)} at y = ${wy}`);
console.log('  (Δ < 0 = OUR head reaches FURTHER BACK than the coin)');

console.log(`\nTHE FACE PROFILE — outermost local x at each local y (the CONTROL: the`);
console.log(`overlay says the front matches, so this column is the trace's own bias)`);
console.log('     y     proof     ours        Δ');
let s3 = 0, c3 = 0, w3 = 0, wy3 = null;
for (let Y = -26; Y <= 24; Y += 2) {
  const a = ep.front(Y), b = frontAt(HEAD_J, Y);
  let d = '';
  if (a !== null && b !== null) { const dd = b - a; d = dd.toFixed(1).padStart(8); s3 += Math.abs(dd); c3++; if (Math.abs(dd) > Math.abs(w3)) { w3 = dd; wy3 = Y; } }
  console.log(`  ${String(Y).padStart(4)}  ${fmt(a)}  ${fmt(b)}  ${d}`);
}
console.log(`  mean |Δ| ${(s3 / c3).toFixed(2)} local units over ${c3} rungs; worst ${w3.toFixed(1)} at y = ${wy3}`);
console.log('  (Δ > 0 = OUR profile projects FURTHER FORWARD than the coin)');

console.log(`\nTOP OF THE HEAD — outermost local y at each local x`);
console.log('     x     proof     ours        Δ');
let s2 = 0, c2 = 0, w2 = 0, wx = null;
for (let X = 10; X >= -30; X -= 2) {
  const a = ep.top(X), b = topAtPoly(HEAD_J, X);
  let d = '';
  if (a !== null && b !== null) { const dd = b - a; d = dd.toFixed(1).padStart(8); s2 += Math.abs(dd); c2++; if (Math.abs(dd) > Math.abs(w2)) { w2 = dd; wx = X; } }
  console.log(`  ${String(X).padStart(4)}  ${fmt(a)}  ${fmt(b)}  ${d}`);
}
console.log(`  mean |Δ| ${(s2 / c2).toFixed(2)} local units over ${c2} rungs; worst ${w2.toFixed(1)} at x = ${wx}`);
console.log('  (Δ < 0 = OUR crown stands HIGHER than the coin)');
