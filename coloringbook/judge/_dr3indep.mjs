// DIME REVERSE — round 1. INDEPENDENCE of the four reverse references.
//
// Reports only (WRITERS.md).
//
// `torch()` in coins.js carries a ⚠️ saying "THE DIME HAS ONE REFERENCE, NOT
// TWO: dime-rev.jpg and dime-rev-2.jpg are the same photograph ... NCC 0.9931".
// Two more files have arrived since. This re-derives the whole matrix rather
// than trusting either the note or the fact that four filenames exist, because
// the cent round found its own brief's duplicate claim stale.
//
// METHOD. Each file is resampled onto the SAME 400x400 disc-normalised grid
// through its own RIM fit (`_dr1disc.mjs`), zero-mean/unit-variance inside
// r < 46, and correlated. Two photographs of DIFFERENT coins under different
// light run well below 0.95 even when both are Roosevelt dime reverses,
// because relief tone and reeding phase differ; the same photograph rescaled
// runs above 0.99.
//
// Run: node coloringbook/judge/_dr3indep.mjs
import { POOL } from './_dr1disc.mjs';
import { samplerFor } from './_dr2grid.mjs';

const N = 400;
async function vec(file) {
  const s = await samplerFor(file);
  const v = [];
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const X = 4 + (i / N) * 92, Y = 4 + (j / N) * 92;
      if (Math.hypot(X - 50, Y - 50) > 46) continue;
      v.push(s.at(X, Y));
    }
  }
  const mu = v.reduce((a, b) => a + b, 0) / v.length;
  const sd = Math.sqrt(v.reduce((a, b) => a + (b - mu) ** 2, 0) / v.length);
  return v.map((x) => (x - mu) / sd);
}

const files = [...POOL];
const vs = [];
for (const f of files) vs.push(await vec(f));
console.log('NCC on a common disc-normalised grid (rim fits), r < 46:\n');
console.log('           ' + files.map((f) => f.slice(0, 12).padStart(13)).join(''));
for (let i = 0; i < files.length; i++) {
  let row = files[i].slice(0, 11).padEnd(11);
  for (let j = 0; j < files.length; j++) {
    const n = vs[i].reduce((a, _, k) => a + vs[i][k] * vs[j][k], 0) / vs[i].length;
    row += n.toFixed(4).padStart(13);
  }
  console.log(row);
}
