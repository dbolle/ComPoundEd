// ROUND (cent obverse, mid-jaw) — the BYTE-IDENTITY PARTITION.
//
// Same argument and the same matrix as the frozen `_jc5ident.mjs` (which pins
// round 5's baseline and is not edited): if an emitted string is byte-identical
// then every pixel metric on it is unchanged by construction. The only
// difference is that the baseline is an argument, so this round can partition
// against v1.66.0 rather than against round 5.
//
// Three concurrent specialists own three different coin FACES this round, so
// the partition is the attribution: any render outside `penny obverse` that
// differs means a shared helper was touched and the round is void.
//
// Run: node coloringbook/judge/_jyCident.mjs <before.js> [after.js]
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';

const IDS = ['penny', 'nickel', 'dime', 'quarter', 'buck'];
const SIZES = [26, 38, 44, 54, 76, 84, 120, 190, 380];
const SIDES = ['obverse', 'reverse'];

async function load(p, tag) {
  const tmp = `src/art/_jyCtmp-${tag}.js`;
  writeFileSync(tmp, readFileSync(p, 'utf8'));
  try { return await import(`${process.cwd()}/${tmp}?t=${Date.now()}${Math.random()}`); } finally { rmSync(tmp); }
}
const A = await load(process.argv[2], 'A');
const B = await load(process.argv[3] || 'src/art/coins.js', 'B');

let n = 0; const diff = []; const byFace = {};
for (const id of IDS) for (const side of SIDES) for (const size of SIZES) for (const value of [true, false]) {
  const a = A.coinSVG(id, size, { side, value });
  const b = B.coinSVG(id, size, { side, value });
  n++;
  if (a !== b) { diff.push(`${id} ${side} ${size}px value=${value}`); byFace[`${id} ${side}`] = (byFace[`${id} ${side}`] || 0) + 1; }
}
const h = (m) => createHash('sha256').update(IDS.flatMap((id) => SIDES.flatMap((s) => SIZES.map((z) => m.coinSVG(id, z, { side: s })))).join('\0')).digest('hex');
console.log(`${n} renders compared (5 ids x 2 sides x ${SIZES.length} sizes x value on/off)`);
console.log(`baseline concat sha256 ${h(A)}`);
console.log(`working  concat sha256 ${h(B)}`);
console.log(`${diff.length} renders differ`);
for (const [k, v] of Object.entries(byFace)) console.log(`  ${k.padEnd(18)} ${v}`);
const stray = Object.keys(byFace).filter((k) => k !== 'penny obverse');
console.log(stray.length ? `\n*** ${stray.join(', ')} ALSO CHANGED — a shared helper was touched, the round is VOID ***`
  : '\nEvery differing render is `penny obverse`. No other face moved, so no shared helper was touched.');
console.log('\nrenders that differ:');
for (const d of diff) console.log('  ' + d);
