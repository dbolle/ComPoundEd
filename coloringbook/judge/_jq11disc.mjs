// D11 — discriminability, the judge's own re-derivation, round 1.
//
// Two things this does that `_x6mat.mjs` does not:
//
//  1. It measures the SAME revision pair with the SAME code, by loading an
//     arbitrary coins.js source (§1: before/after must not be two different
//     instruments).
//  2. It measures at the frozen locus (icon, 26px — `quarter-gates.md` D11)
//     AND at the mid tier (44 and 54), because round 1's specialist reported
//     a cost at mid. The mid numbers are reported OUTSIDE the gate and say so:
//     the locus was frozen at icon before any value existed (§6.1), and a
//     judge that moves a locus after seeing a number has no gate at all.
//
// Everything numeric comes from the frozen `_x6lib.mjs` — mad/ncc/upN/iconCell
// are not reimplemented here.
//
// Run: node coloringbook/judge/_jq11disc.mjs <before.js> <after.js>
import { readFileSync } from 'node:fs';
import { iconCell, mad, ncc, IDS, SIDES, key, N } from '../_x6lib.mjs';
import { loadCoins } from './_jq8contain-v2.mjs';

const SIZES = [26, 44, 54];

async function matrixAt(mod, size) {
  const cells = {};
  for (const id of IDS) for (const side of SIDES) cells[key(id, side)] = await iconCell(mod, id, side, size);
  const K = Object.keys(cells);
  const pairs = [];
  for (let i = 0; i < K.length; i++) for (let j = i + 1; j < K.length; j++) {
    pairs.push({ a: K[i], b: K[j], mad: mad(cells[K[i]].grey, cells[K[j]].grey) });
  }
  // §6 controls, computed alongside rather than remembered
  const controls = {
    self: mad(cells['dime.r'].grey, cells['dime.r'].grey),
    far: mad(cells['penny.o'].grey, cells['quarter.r'].grey),
    devW: Object.fromEntries(K.map((k) => [k, cells[k].devW])),
  };
  const same = (f) => pairs.filter(f).reduce((m, p) => (p.mad < m.mad ? p : m));
  const isO = (p) => p.a.endsWith('.o') && p.b.endsWith('.o');
  const isR = (p) => p.a.endsWith('.r') && p.b.endsWith('.r');
  return {
    size, pairs, controls,
    overall: same(() => true),
    obv: same(isO),
    rev: same(isR),
    cross: same((p) => !isO(p) && !isR(p)),
  };
}

const [beforePath, afterPath] = process.argv.slice(2);
const before = await loadCoins(readFileSync(beforePath, 'utf8'));
const after = await loadCoins(readFileSync(afterPath, 'utf8'));

for (const size of SIZES) {
  const A = await matrixAt(before, size);
  const B = await matrixAt(after, size);
  const tier = size >= 76 ? 'full' : size >= 44 ? 'mid' : 'icon';
  console.log(`\n===== ${size}px (${tier} tier) ${size === 26 ? '<- THE FROZEN D11 LOCUS' : '<- outside the frozen locus, reported not gated'} =====`);
  if (A.controls.self !== 0 || B.controls.self !== 0) throw new Error('self-distance not 0 — D11 UNTRUSTED');
  console.log(`  controls: self ${A.controls.self} (must be 0); penny.o vs quarter.r ${A.controls.far.toFixed(4)} -> ${B.controls.far.toFixed(4)}`);
  let moved = 0;
  const deltas = [];
  for (let i = 0; i < A.pairs.length; i++) {
    const d = B.pairs[i].mad - A.pairs[i].mad;
    if (d !== 0) moved++;
    deltas.push({ p: `${A.pairs[i].a}/${A.pairs[i].b}`, a: A.pairs[i].mad, b: B.pairs[i].mad, d, pct: A.pairs[i].mad ? (100 * d) / A.pairs[i].mad : 0 });
  }
  console.log(`  pairs moved: ${moved} of ${A.pairs.length}`);
  for (const g of ['overall', 'obv', 'rev', 'cross']) {
    console.log(`  ${g.padEnd(8)} min  ${A[g].mad.toFixed(4)} (${A[g].a}/${A[g].b})  ->  ${B[g].mad.toFixed(4)} (${B[g].a}/${B[g].b})   ${(B[g].mad - A[g].mad >= 0 ? '+' : '') + (B[g].mad - A[g].mad).toFixed(4)}`);
  }
  console.log(`  §17 SET GATE rev_min / obv_min: ${(A.rev.mad / A.obv.mad).toFixed(3)}x -> ${(B.rev.mad / B.obv.mad).toFixed(3)}x   (gate >= 3.0x)`);
  deltas.sort((x, y) => x.pct - y.pct);
  const worst = deltas.filter((x) => x.d !== 0).slice(0, 5);
  if (worst.length) {
    console.log('  most-damaged pairs:');
    for (const w of worst) console.log(`    ${w.p.padEnd(22)} ${w.a.toFixed(4)} -> ${w.b.toFixed(4)}  ${w.pct >= 0 ? '+' : ''}${w.pct.toFixed(2)}%`);
  }
  const qp = deltas.filter((x) => x.p.includes('quarter'));
  console.log('  quarter pairs:');
  for (const w of qp) console.log(`    ${w.p.padEnd(22)} ${w.a.toFixed(4)} -> ${w.b.toFixed(4)}  ${w.d === 0 ? '(bit-identical)' : (w.pct >= 0 ? '+' : '') + w.pct.toFixed(2) + '%'}`);
}
