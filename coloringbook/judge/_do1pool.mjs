// THE POOL, BEFORE ANY NUMBER IS TAKEN OFF IT — nine dime-obverse references.
//
// Three questions, in this order, because a finding backed by four photographs
// of the same coin is backed by one:
//
//   1. IDENTITY   sha256. Two byte-identical files are one file (§0.3: an
//                 acquisition was once compared against itself and passed).
//   2. DISC       rim fit vs the area sqrt(A/pi). `discOf()` fails IN KIND on
//                 some files (-31.7% measured on nickel-rev-2.png) and the
//                 failure does NOT track the strike, so every file is checked.
//   3. INDEPENDENCE  normalised cross-correlation between every pair, after
//                 registering both on their own rim fit and cropping to the
//                 device. Same photograph -> ~0.99; same DESIGN, different
//                 photograph -> 0.7-0.9. The threshold is not the point; the
//                 point is which pairs sit apart from the rest.
//
// usage: node coloringbook/judge/_do1pool.mjs
import { POOL, greyRaw, rimFit, areaFit, samplerFor, sha } from './_dolib.mjs';
import { REF } from './_paths.mjs';
import { join } from 'node:path';

const files = POOL;

console.log('1. IDENTITY');
const hashes = new Map();
for (const f of files) {
  const h = sha(f);
  const g = await greyRaw(join(REF, f));
  const dup = [...hashes.entries()].find(([, v]) => v === h);
  hashes.set(f, h);
  console.log(
    '  ', f.padEnd(24), `${g.w}x${g.h}`.padEnd(11), h.slice(0, 16),
    dup ? `  <-- BYTE-IDENTICAL to ${dup[0]}` : '',
  );
}
console.log(`   distinct sha256: ${new Set(hashes.values()).size} of ${files.length}`);

console.log('\n2. DISC — rim fit (used everywhere below) vs the area sqrt(A/pi)');
console.log('   file                     rim cx/cy/R             p95 %R   ecc     area R    dR%');
const discs = {};
for (const f of files) {
  const g = await greyRaw(join(REF, f));
  const r = rimFit(g), a = areaFit(g);
  discs[f] = r;
  console.log(
    '  ', f.padEnd(24),
    `${r.cx.toFixed(1)}/${r.cy.toFixed(1)}/${r.R.toFixed(2)}`.padEnd(23),
    ((r.p95 / r.R) * 100).toFixed(2).padStart(5),
    (r.ecc * 100).toFixed(2).padStart(7),
    a.R.toFixed(1).padStart(9),
    `${(((a.R / r.R) - 1) * 100).toFixed(2)}%`.padStart(9),
  );
}

console.log('\n3. INDEPENDENCE — NCC on the device disc (r<=44 viewBox), 160x160 grid');
const N = 160;
const vecs = {};
for (const f of files) {
  const s = await samplerFor(f);
  const v = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const x = 50 + ((i + 0.5) / N - 0.5) * 88, y = 50 + ((j + 0.5) / N - 0.5) * 88;
    if (Math.hypot(x - 50, y - 50) > 44) continue;
    const q = s.at(x, y);
    v.push(q == null ? 128 : q);
  }
  const m = v.reduce((a, b) => a + b, 0) / v.length;
  const c = v.map((q) => q - m);
  const nrm = Math.sqrt(c.reduce((a, b) => a + b * b, 0));
  vecs[f] = c.map((q) => q / nrm);
}
const short = (f) => f.replace('dime-obv', 'd').replace(/\.(jpg|png)$/, '');
process.stdout.write('   '.padEnd(20));
for (const f of files) process.stdout.write(short(f).padStart(11));
process.stdout.write('\n');
let worst = { v: -2 };
for (const a of files) {
  process.stdout.write('   ' + short(a).padEnd(17));
  for (const b of files) {
    let s = 0;
    for (let i = 0; i < vecs[a].length; i++) s += vecs[a][i] * vecs[b][i];
    process.stdout.write(s.toFixed(3).padStart(11));
    if (a !== b && s > worst.v) worst = { v: s, a, b };
  }
  process.stdout.write('\n');
}
console.log(`\n   highest off-diagonal NCC: ${worst.v.toFixed(4)}  ${worst.a} vs ${worst.b}`);
