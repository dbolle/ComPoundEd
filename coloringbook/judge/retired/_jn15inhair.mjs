// _jn15inhair — IS EVERY LIT RIDGE ACTUALLY INSIDE THE DRAWN HAIR MASS?
//
// The failure this catches is named in the file it scores: "a hair stroke inside
// the head but outside the hair draws on the cheek" (the block above
// RELIEF.Lincoln). D1 cannot see it — the silhouette is unchanged — and D3
// cannot see it either, because a stroke that lands on the cheek raises the
// cheek patch, which is D3's own normaliser.
//
// It walks each ridge at 0.25-unit steps and tests the point PLUS the two
// half-width offsets perpendicular to the path, so the stroke's rendered edge is
// tested and not just its centre line. Point-in-polygon on the flattened
// HAIR.Jefferson from the revision under test.
//
// Run: node coloringbook/judge/_jn15inhair.mjs <coins.js>
import { readFileSync } from 'node:fs';
import { flatten, inside } from './_jn14map.mjs';

const SRC = process.argv[2] || new URL('../../src/art/coins.js', import.meta.url).pathname;
const raw = readFileSync(SRC, 'utf8');

function grabHair() {
  const i = raw.indexOf('const HAIR = {');
  const j = raw.indexOf('\n  Jefferson: [', i);
  const k = raw.indexOf('].join(', j);
  const body = raw.slice(j, k).split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');
  return body.match(/'[^']*'/g).map((s) => s.slice(1, -1)).join(' ');
}
// every <path> inside RELIEF.Jefferson's base and fine strings
function grabRidges() {
  const i = raw.indexOf('const RELIEF = {');
  const j = raw.indexOf('\n  Jefferson: {', i);
  const k = raw.indexOf('\n  // ROOSEVELT', j);
  const body = raw.slice(j, k);
  return [...body.matchAll(/<path d="([^"]+)" fill="none" stroke-width="([0-9.]+)"\/>/g)]
    .map((m) => ({ d: m[1], w: +m[2] }));
}
const HAIR = flatten(grabHair());
const ridges = grabRidges();

// flatten an M / q / C / L path to points
function flat(d, step = 0.25) {
  const tok = d.trim().split(/[\s,]+/);
  let i = 0, cur = [0, 0]; const out = [];
  const num = () => +tok[i++];
  const push = (fn, L) => { const n = Math.max(4, Math.ceil(L / step)); for (let k = 1; k <= n; k++) out.push(fn(k / n)); };
  while (i < tok.length) {
    const c = tok[i++];
    if (c === 'M') { cur = [num(), num()]; out.push(cur.slice()); }
    else if (c === 'L') { const e = [num(), num()]; push((u) => [cur[0] + u * (e[0] - cur[0]), cur[1] + u * (e[1] - cur[1])], Math.hypot(e[0] - cur[0], e[1] - cur[1])); cur = e; }
    else if (c === 'q') {
      const c1 = [cur[0] + num(), cur[1] + num()], e = [cur[0] + num(), cur[1] + num()], s = cur.slice();
      push((u) => [(1 - u) ** 2 * s[0] + 2 * u * (1 - u) * c1[0] + u * u * e[0], (1 - u) ** 2 * s[1] + 2 * u * (1 - u) * c1[1] + u * u * e[1]], Math.hypot(c1[0] - s[0], c1[1] - s[1]) + Math.hypot(e[0] - c1[0], e[1] - c1[1]));
      cur = e;
    } else if (c === 'C') {
      const c1 = [num(), num()], c2 = [num(), num()], e = [num(), num()], s = cur.slice();
      push((u) => [(1 - u) ** 3 * s[0] + 3 * u * (1 - u) ** 2 * c1[0] + 3 * u * u * (1 - u) * c2[0] + u ** 3 * e[0], (1 - u) ** 3 * s[1] + 3 * u * (1 - u) ** 2 * c1[1] + 3 * u * u * (1 - u) * c2[1] + u ** 3 * e[1]], Math.hypot(c1[0] - s[0], c1[1] - s[1]) + Math.hypot(c2[0] - c1[0], c2[1] - c1[1]) + Math.hypot(e[0] - c2[0], e[1] - c2[1]));
      cur = e;
    } else throw new Error('unsupported ' + c);
  }
  return out;
}

// SELF-CHECK (§4). Two probes with a known answer, run before any value is
// reported: the wig's own centre must be INSIDE and a point out on the cheek
// must be OUTSIDE. The first run of this file reported 21 of 21 ridges outside
// — 21 bit-identical answers from 21 different inputs, which §4 says is a bug
// report and not a value. It was: `inside()` takes (point, polygon) with the
// point as an array, and it had been called (polygon, x, y).
for (const [name, pt, want] of [['wig centre (-16, -14)', [-16, -14], true],
                                ['cheek (12, 4)', [12, 4], false],
                                ['off the coin (60, 60)', [60, 60], false]]) {
  const got = inside(pt, HAIR);
  if (got !== want) throw new Error(`_jn15inhair self-check failed: ${name} -> inside ${got}, expected ${want}`);
  console.log(`  self-check OK: ${name} is ${got ? 'inside' : 'outside'} the hair mass, as expected`);
}

console.log(`${SRC}`);
console.log(`HAIR.Jefferson flattened to ${HAIR.length} points; ${ridges.length} ridge paths in RELIEF.Jefferson`);
console.log('  #  width   samples   outside the hair mass   worst excursion');
const FACELIGHTS = [['nose light', 'M 14.27 -8.08'], ['cheek light', 'M 6.85 1.8']];
let bad = 0;
ridges.forEach((r, n) => {
  const P = flat(r.d);
  let out = 0, worst = 0;
  for (let k = 0; k < P.length; k++) {
    const a = P[Math.max(0, k - 1)], b = P[Math.min(P.length - 1, k + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L, ny = dx / L, h = r.w / 2;
    for (const [px, py] of [P[k], [P[k][0] + h * nx, P[k][1] + h * ny], [P[k][0] - h * nx, P[k][1] - h * ny]]) {
      if (!inside([px, py], HAIR)) { out++; worst = Math.max(worst, h); }
    }
  }
  const total = P.length * 3;
  // TWO MARKS ARE MEANT TO BE ON THE FACE and are excluded BY NAME, not by
  // argument: the nose light and the cheek light. RELIEF's own header calls
  // them "the two pale face lights, down the nose ridge and along the jaw".
  const face = FACELIGHTS.find((f) => r.d.startsWith(f[1]));
  if (out && !face) bad++;
  console.log(`  ${String(n + 1).padStart(2)}  ${r.w.toFixed(2)}   ${String(total).padStart(6)}   ${String(out).padStart(6)}  ${(100 * out / total).toFixed(2)}%${face ? `   (${face[0]} — on the face BY DESIGN, excluded by name)` : out ? '   *** ON THE CHEEK ***' : ''}`);
});
console.log(bad ? `*** ${bad} of ${ridges.length} ridges leave the hair mass` : `all ${ridges.length - FACELIGHTS.length} hair ridges lie wholly inside the drawn hair mass, stroke edges included; the ${FACELIGHTS.length} face lights are outside it by design`);
