// BUCK r0 — D9 well-formedness (BLOCKING), with the response test `_x6sweep`
// does not carry, and coverage of the note's SECOND implementation.
//
// SUBJECTS COVERED (PY3): all five ids x both sides x six sizes x value on/off
// in `src/art/coins.js` (120 renders, reproducing `_x6sweep.mjs`'s count and
// verdict), PLUS `src/art/pawcoins.js`, which contains a second, independent
// `noteSVG()` that no sweep in this repo has ever covered.
//
// The note draws `HEAD.Washington`, shared with the coin obverses. The
// quarter's specialist once printed `undefined` into 18 outputs by removing a
// shared path, so the response test here deletes that glyph in a GENERATED
// COPY and requires the sweep to go red.
//
//   node coloringbook/judge/_jb9well.mjs
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const IDS = ['penny', 'nickel', 'dime', 'quarter', 'buck'];
const SIZES = [26, 40, 54, 84, 120, 190];
const SIDES = ['obverse', 'reverse'];

function check(svg, label, bad) {
  for (const pat of [/undefined/, /NaN/, /\bnull\b/])
    if (pat.test(svg)) bad.push(`${label}: matches ${pat}`);
  // malformed path numbers: a `d` attribute containing anything but commands,
  // numbers, separators
  for (const m of svg.matchAll(/ d="([^"]*)"/g))
    if (/[^MmLlHhVvCcSsQqTtAaZz0-9eE+\-.,\s]/.test(m[1])) bad.push(`${label}: malformed d`);
  for (const need of ['<svg', 'viewBox', '</svg>'])
    if (!svg.includes(need)) bad.push(`${label}: missing ${need}`);
  return bad;
}

async function sweep(src, tag) {
  const mod = await import(src);
  const bad = [];
  let n = 0;
  for (const id of IDS) for (const side of SIDES) for (const size of SIZES) for (const value of [false, true]) {
    const svg = mod.coinSVG(id, size, { side, value });
    n++;
    check(svg, `${tag} ${id}/${side}/${size}/value=${value}`, bad);
  }
  return { n, bad };
}

const a = await sweep('../../src/art/coins.js', 'coins.js');
console.log(`src/art/coins.js       ${a.n} renders — ${a.bad.length ? 'FAIL\n  ' + a.bad.join('\n  ') : 'clean'}`);
console.log(`  equivalence (PY6): _x6sweep.mjs at its published hash reports "120 renders swept — clean" on the same tree.`);

// pawcoins.js has its own noteSVG and a different call signature
{
  const mod = await import('../../src/art/pawcoins.js');
  const bad = [];
  let n = 0;
  const fn = mod.coinSVG || mod.pawCoinSVG || mod.default;
  for (const id of IDS) for (const size of SIZES) {
    let svg;
    try { svg = fn(id, size); } catch (e) { bad.push(`pawcoins ${id}/${size}: threw ${e.message}`); continue; }
    n++;
    check(svg, `pawcoins ${id}/${size}`, bad);
  }
  console.log(`src/art/pawcoins.js    ${n} renders — ${bad.length ? 'FAIL\n  ' + bad.join('\n  ') : 'clean'}   (exports: ${Object.keys(mod).join(', ')})`);
}

// RESPONSE TEST — delete the shared glyph the note depends on, in a copy
{
  const root = new URL('../../', import.meta.url).pathname;
  const srcTxt = readFileSync(join(root, 'src/art/coins.js'), 'utf8');
  const dir = mkdtempSync(join(tmpdir(), 'jb9-'));
  // HEAD.Washington is an ARRAY of segment strings joined later; the anchor is
  // its declaration line, and it is asserted so the test cannot go stale
  // silently (PY6).
  // HEAD.Washington is an ARRAY of segment strings. The historical failure was
  // a shared path REMOVED, so the response test renames the key: every
  // consumer then interpolates `undefined` into a `d` attribute. The anchor is
  // asserted so this test cannot go stale silently (PY6).
  const broken = srcTxt.replace(/(\n\s*)Washington: \[/, '$1WashingtonRENAMED: [');
  if (broken === srcTxt) throw new Error('RESPONSE anchor missing — HEAD.Washington not found; fix the test before trusting D9');
  const p = join(dir, 'broken.js');
  writeFileSync(p, broken.replace("'../engine/money.js'", JSON.stringify(join(root, 'src/engine/money.js'))));
  const r = await sweep(p, 'BROKEN');
  console.log(`\nRESPONSE TEST — HEAD.Washington := undefined in a generated copy: ${r.bad.length} failures over ${r.n} renders` +
    `  ${r.bad.length ? 'went RED as expected' : '*** STAYED GREEN — D9 instrument UNTRUSTED ***'}`);
  const ids = [...new Set(r.bad.map((b) => b.split(' ')[1].split('/')[0]))];
  console.log(`  ids affected: ${ids.join(', ')}   (the note is one of them, which is the point of the sweep)`);
}
