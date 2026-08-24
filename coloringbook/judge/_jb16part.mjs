// BUCK r17 — THE BYTE-IDENTITY RENDER PARTITION (§0.2), plus a D9 sweep.
//
// A round owns ONE face. This is how it proves it: emit every id x side x size
// x value variant, hash each string, and show that only the owned face moved.
// It also throws on any `undefined`/`NaN` in any emitted SVG, which is D9.
//
// The baseline must be written from a CLEAN tree (`git stash`) and lands on a
// .txt path, which `.gitignore` keeps out of the repo — an instrument reports,
// it does not write anything tracked (judge/WRITERS.md). Emits every face at every size the app draws
// (plus the naming/large sizes and the wallet `value` variant), hashes each
// string, and diffs against a baseline JSON. Reports; writes only the baseline
// it is explicitly told to write, into the gitignored scratch dir.
//   git stash && node coloringbook/judge/_jb16part.mjs write coloringbook/judge/_jb16-part.txt && git stash pop
//   node coloringbook/judge/_jb16part.mjs check coloringbook/judge/_jb16-part.txt
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './_paths.mjs';
const { coinSVG, COIN_SIDES } = await import(join(ROOT, 'src/art/coins.js'));
const IDS = ['penny', 'nickel', 'dime', 'quarter', 'buck'];
const SIZES = [26, 38, 44, 48, 54, 76, 84, 130, 190];
const rows = {};
for (const id of IDS) for (const side of COIN_SIDES) for (const size of SIZES) for (const value of [false, true]) {
  const svg = coinSVG(id, size, { side, value });
  if (/undefined|NaN/.test(svg)) throw new Error(`D9: ${id}/${side}/${size}/value=${value}`);
  rows[`${id}|${side}|${size}|${value}`] = createHash('sha256').update(svg).digest('hex').slice(0, 16);
}
const mode = process.argv[2], file = process.argv[3] || join(ROOT, 'coloringbook/judge/_jb16-part.txt');
if (mode === 'write') { writeFileSync(file, JSON.stringify(rows, null, 1)); console.log('baseline written,', Object.keys(rows).length, 'renders'); }
else {
  const base = JSON.parse(readFileSync(file, 'utf8'));
  const moved = Object.keys(rows).filter((k) => base[k] !== rows[k]);
  const same = Object.keys(rows).length - moved.length;
  console.log(`renders: ${Object.keys(rows).length}   byte-identical: ${same}   MOVED: ${moved.length}`);
  const by = {};
  for (const k of moved) { const [id, side] = k.split('|'); by[`${id} ${side}`] = (by[`${id} ${side}`] || 0) + 1; }
  for (const [k, v] of Object.entries(by)) console.log(`   ${k}: ${v} renders moved`);
  const untouched = new Set(Object.keys(rows).filter((k) => base[k] === rows[k]).map((k) => k.split('|').slice(0, 2).join(' ')));
  console.log('   faces with EVERY render byte-identical:', [...untouched].filter((f) => !Object.keys(by).includes(f)).join(', '));
  console.log('D9: no undefined/NaN in any of the', Object.keys(rows).length, 'emitted SVGs.');
}
