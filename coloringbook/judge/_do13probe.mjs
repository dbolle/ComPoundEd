// IS IT HAIR OR IS IT FACE? — a point probe, per reference, at places where our
// drawing and the photographs might disagree.
//
// The two hairline ladders (`_do9hairline.mjs`, `_do10hairmask.mjs`) both
// refused themselves, so no CURVE is claimed here. But the weaker question —
// "at this one point, does the coin have cut hair or smooth skin?" — needs no
// boundary and no threshold walk: it is a texture reading against two
// calibration boxes that every reference agrees about.
//
//   CALIBRATION   crown box (-24..-12, -26..-18) is hair on all nine
//                 cheek box (  4..14 ,   0..10 ) is skin on all nine
//   SCORE         (E - cheek) / (crown - cheek), so 1.0 reads as hair and 0.0
//                 as skin, per reference, with that reference's own contrast.
//
// The probe points are stated with which side of OUR OWN hairline they fall on,
// computed from the drawn path rather than asserted, so the table can be read
// as "we draw skin here and the coin has hair" without trusting the prose.
//
// usage: node coloringbook/judge/_do13probe.mjs
import { join } from 'node:path';
import { ROOT } from './_paths.mjs';
import { POOL, samplerFor, samplerOurs } from './_dolib.mjs';
import { boundary, icp } from './_do6sil.mjs';

const { OBVERSE } = await import(join(ROOT, 'src/art/coins.js'));
const o = OBVERSE.dime;
const toView = (lx, ly) => [50 + o.cx + o.dir * o.s * lx, o.cy + o.s * ly];
const ourS = await samplerOurs('dime', 'obverse', 1600);
const ourB = boundary(ourS);

const HSTEP = 1 / 3;
const energy = (at) => (x, y) => {
  const v = [];
  for (let dx = -0.6; dx <= 0.6; dx += 0.3) for (let dy = -0.6; dy <= 0.6; dy += 0.3) {
    const a = at(x + dx + HSTEP, y + dy), b = at(x + dx - HSTEP, y + dy);
    const c = at(x + dx, y + dy + HSTEP), d = at(x + dx, y + dy - HSTEP);
    if (a == null || b == null || c == null || d == null) return null;
    v.push(Math.hypot(a - b, c - d));
  }
  v.sort((a, b) => a - b);
  return v[v.length >> 1];
};
const boxMed = (E, x0, x1, y0, y1) => {
  const v = [];
  for (let x = x0; x <= x1; x += 0.5) for (let y = y0; y <= y1; y += 0.5) {
    const q = E(x, y);
    if (q != null) v.push(q);
  }
  v.sort((a, b) => a - b);
  return v[v.length >> 1];
};

// PROBE POINTS. Chosen where the drawn hairline is doing something a photograph
// could contradict: behind and below the ear, on the nape, over the temple, and
// on the forehead the drawing calls bare.
const P = [
  ['behind ear, low   ', -25, 6],
  ['behind ear, mid   ', -25, 3],
  ['nape, above cut   ', -29, 10],
  ['nape, higher      ', -30, 8],
  ['under ear lobe    ', -16, 12],
  ['in front of ear   ', -9, 5],
  ['temple, low       ', -5, 2],
  ['temple, mid       ', -3, -3],
  ['forehead, low     ', 3, -10],
  ['forehead, mid     ', 5, -16],
  ['forehead, high    ', 8, -23],
  ['above brow        ', 10, -14],
  ['CONTROL crown hair', -18, -22],
  ['CONTROL open cheek',  9, 5],
];

// which side of OUR hairline each point is on, from the drawn art: our hair is
// filled `cloth` (lighter) and the face `motif` at full tier, so the tone at
// the point answers it without any geometry.
const ourTone = (lx, ly) => { const [x, y] = toView(lx, ly); return ourS.at(x, y); };
const cloth = boxMed((x, y) => ourTone(x, y), -24, -12, -26, -18);
const motif = boxMed((x, y) => ourTone(x, y), 4, 14, 0, 10);
const side = (lx, ly) => {
  const q = ourTone(lx, ly);
  return Math.abs(q - cloth) < Math.abs(q - motif) ? 'HAIR' : 'face';
};
console.log(`our hair fill reads ${cloth.toFixed(0)}, our face fill ${motif.toFixed(0)} (grey)\n`);

const cols = [];
for (const f of POOL) {
  const s = await samplerFor(f);
  const B = boundary(s);
  if (!B) continue;
  const fit = icp(ourB.pts, B.pts);
  const c = Math.cos(fit.th), si = Math.sin(fit.th);
  const at = (lx, ly) => {
    const [x, y] = toView(lx, ly);
    return s.at(fit.k * (c * x - si * y) + fit.t[0], fit.k * (si * x + c * y) + fit.t[1]);
  };
  const E = energy(at);
  const hairC = boxMed(E, -24, -12, -26, -18), faceC = boxMed(E, 4, 14, 0, 10);
  cols.push({ f, E, hairC, faceC, sep: hairC / faceC });
}
console.log('per-file calibration:  crown/cheek energy ratio');
for (const c of cols) console.log(`   ${c.f.padEnd(24)} hair ${c.hairC.toFixed(1).padStart(6)}  cheek ${c.faceC.toFixed(1).padStart(6)}  ratio ${c.sep.toFixed(2)}`);
const USE = cols.filter((c) => c.sep >= 1.5);
console.log(`   ${USE.length} of ${cols.length} separate at >= 1.5x and are used\n`);

console.log('SCORE: 1.0 = as textured as the crown (hair), 0.0 = as smooth as the cheek (skin)');
process.stdout.write('  point                 we draw ');
for (const c of USE) process.stdout.write(c.f.replace('dime-obv', 'd').replace(/\.(jpg|png)$/, '').padStart(11));
process.stdout.write('    median\n');
for (const [name, x, y] of P) {
  const sc = USE.map((c) => {
    const q = c.E(x, y);
    return q == null ? null : (q - c.faceC) / (c.hairC - c.faceC);
  });
  const v = sc.filter((q) => q != null).sort((a, b) => a - b);
  process.stdout.write(`  ${name} ${String(`${x},${y}`).padStart(7)} ${side(x, y).padStart(5)} `);
  for (const q of sc) process.stdout.write((q == null ? '-' : q.toFixed(2)).padStart(11));
  process.stdout.write(`   ${v.length ? v[v.length >> 1].toFixed(2).padStart(7) : '   -   '}\n`);
}
console.log('\nA row that reads "face" in our column and scores near 1.0 on the coin is hair');
console.log('the drawing does not have. A row that reads "HAIR" and scores near 0.0 is the');
console.log('reverse. Rows between 0.35 and 0.65 are not evidence either way.');
