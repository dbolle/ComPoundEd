// BUCK r17 — D8 RESTATED FOR THIS FACE: CONTAINMENT AGAINST TWO ELLIPSES.
//
// D8 asks whether ink stays inside the coin. On the note the outer boundary is
// the printed border rectangle and NOTHING is near it, so D8-as-a-rectangle
// reads 0.0000% forever (`_jb8geom.mjs` says so itself, and its own response
// test — move the eagle roundel cx 70 -> 86 — does not move the number, which
// that file flags as UNTRUSTED). The boundary that every mark on this face is
// actually authored against is its ROUNDEL, and there are two of them, both
// off-centre ellipses. This is the number nobody had. The note has no field circle, so `struck()` is
// given rField = 0 and `spendOf()` never runs on it — but the reverse has TWO
// off-centre ellipses and every mark is authored inside one of them. This
// reports, per roundel, the largest normalised radius the MASSING reaches,
// rho = hypot((x-cx)/rx, (y-cy)/ry), with and without the relief offset the
// shared `struck()` applies at each size the app draws.
//   rho > 1                 -> ink outside the roundel's rim
//   rho > innerEdge(size)   -> ink ON the rim stroke
// It reads the EMITTED SVG, never the source literals.
import { join } from 'node:path';
import { ROOT } from './_paths.mjs';
const { coinSVG, coinPx } = await import(join(ROOT, 'src/art/coins.js'));
const PYR = { cx: 23.13, cy: 27.88, rx: 8.88, ry: 11.38 };
const EAG = { cx: 76.88, cy: 27.75, rx: 8.88, ry: 12.38 };
function flat(d) {
  const t = d.match(/[MmLlHhVvCcSsQqTtAaZz]|[-+]?(?:\d*\.\d+|\d+\.?)/g) || [];
  let i = 0, x = 0, y = 0, sx = 0, sy = 0, c = ''; const out = [];
  const n = () => Number(t[i++]);
  while (i < t.length) {
    if (/[A-Za-z]/.test(t[i])) c = t[i++];
    const rel = c >= 'a', C = c.toUpperCase(), ox = rel ? x : 0, oy = rel ? y : 0;
    if (C === 'Z') { x = sx; y = sy; }
    else if (C === 'M' || C === 'L') { x = ox + n(); y = oy + n(); out.push([x, y]); if (C === 'M') { sx = x; sy = y; c = rel ? 'l' : 'L'; } }
    else if (C === 'H') { x = ox + n(); out.push([x, y]); }
    else if (C === 'V') { y = oy + n(); out.push([x, y]); }
    else if (C === 'C' || C === 'Q') {
      const q = C === 'Q', ax = ox + n(), ay = oy + n(), bx = q ? ax : ox + n(), by = q ? ay : oy + n(), nx = ox + n(), ny = oy + n();
      for (let k = 1; k <= 32; k++) { const u = 1 - k / 32, v = k / 32;
        out.push([u ** 3 * x + 3 * u * u * v * ax + 3 * u * v * v * bx + v ** 3 * nx,
                  u ** 3 * y + 3 * u * u * v * ay + 3 * u * v * v * by + v ** 3 * ny]); }
      x = nx; y = ny;
    } else break;
  }
  return out;
}
const svg = coinSVG('buck', 190, { side: 'reverse' });
// the seal massing: the FIRST group carrying the seal transform
const key = 'transform="translate(76.88 27.75) scale(1)">';
const s0 = svg.indexOf(key) + key.length, s1 = svg.indexOf('</g>', s0);
const sealPts = [...svg.slice(s0, s1).matchAll(/<path d="([^"]*)"/g)]
  .flatMap((m) => flat(m[1])).map(([x, y]) => [x + 76.88, y + 27.75]);
// the pyramid massing: the two paths between the roundels and the seal group
const p0 = svg.indexOf('<ellipse cx="76.88"'), p1 = svg.indexOf(key);
const pyrPts = [...svg.slice(p0, p1).matchAll(/<path d="([^"]*)"/g)].flatMap((m) => flat(m[1]));
console.log(`points: pyramid ${pyrPts.length}   seal ${sealPts.length}   (0 means the parse missed)`);
const worst = (R, pts, o) => pts.reduce((b, [x, y]) => Math.max(b, Math.hypot((x - o - R.cx) / R.rx, (y - o - R.cy) / R.ry)), 0);
for (const [name, R, pts] of [['pyramid + capstone', PYR, pyrPts], ['eagle massing', EAG, sealPts]]) {
  const row = [38, 48, 54, 84, 190].map((s) => {
    const bw = Math.round(coinPx('buck', s).w);
    const o = Number(Math.min(1.7, Math.max(0.55, 118 / bw)).toFixed(2));
    return `${s}px ${worst(R, pts, o).toFixed(3)}`;
  }).join('   ');
  console.log(`${name.padEnd(20)}  rho(as drawn) ${worst(R, pts, 0).toFixed(4)}   |  rho if struck()'s offset were applied:  ${row}`);
}
console.log('\nthe roundel rim stroke, and the rho its INNER edge sits at (wing-tip direction, local radius 9.9u):');
for (const s of [38, 48, 54, 84, 190]) {
  const bw = Math.round(coinPx('buck', s).w), w = Math.max(1.4, 80 / bw);
  console.log(`  ${String(s).padStart(3)}px  box ${bw}px  rim stroke ${w.toFixed(3)}u  -> inner edge rho ${(1 - w / 2 / 9.9).toFixed(4)}`);
}
console.log('\nis the bevel present in the emitted reverse?', /fill="#ffffff"/.test(svg) ? 'YES' : 'no');
