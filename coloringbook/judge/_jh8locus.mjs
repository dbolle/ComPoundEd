// ROUND 8, cent obverse — IS `HAIR.Lincoln` / `BEARD` INSIDE D1's SCORED LOCUS?
//
// The brief asserts they are outside it ("`_pyeval.parts()` scores HEAD u bare
// neck u coat") and tells me to verify the claim rather than rely on it. Reading
// `_pyeval.mjs:32-42` is not verification: `parts()` selects `d` with
// `rest.match(/<path d="([^"]+)"/)[1]` — the FIRST path after the bust
// transform — and whether HAIR is that path is a fact about EMISSION ORDER in
// coins.js, not about the regex.
//
// So this does three things:
//
//  SELECTION TEST (§4.2). Print the WHOLE candidate set `parts()` chose from —
//  every `<path d=...>` in the emitted obverse, in order, marked as before /
//  at / after the bust transform, with which one `parts()` actually took. A
//  selection printed as a set is auditable; a selection asserted is not.
//
//  RESPONSE TEST (§4). Mutate `HEAD.Lincoln` — the path the locus IS — and
//  require D1 to MOVE. An instrument that cannot move proves nothing about the
//  paths it says are outside.
//
//  NULL TEST, in the form this question needs. Mutate `HAIR.Lincoln` and
//  `BEARD` to something grossly different (each collapsed to a small triangle,
//  which changes their drawn area by tens of percent) and require D1 to be
//  BIT-IDENTICAL, not merely close. "Outside the locus" is a claim about exact
//  invariance; a 5th-decimal agreement would be consistent with the path being
//  in the locus and the mutation being small.
//
// Mutants are written into src/art/ because coins.js imports
// '../engine/money.js' and a copy elsewhere cannot resolve it. They are deleted
// on the way out; the pristine baseline is coloringbook/judge/_jh8-before-coins.js.
//
// Run: node coloringbook/judge/_jh8locus.mjs [src]
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import * as E from '../_pyeval.mjs';

const SRC = process.argv[2] || 'src/art/coins.js';
const text = readFileSync(SRC, 'utf8');

async function iouOf(file) {
  const mod = await import(`file://${process.cwd()}/${file}?v=${Math.random()}`);
  const svg = mod.coinSVG('penny', 600, { side: 'obverse' });
  const p = E.parts(svg);
  const r = E.iou(await E.oursMask(p), await E.refMask());
  return { iou: r.iou, inter: r.inter, oursOnly: r.oursOnly, refOnly: r.refOnly, p, svg };
}

// ── the candidate set ─────────────────────────────────────────────────────
const base = await iouOf(SRC);
const svg = base.svg;
const g = svg.match(/transform="translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+) ([-\d.]+)\)">/);
const gAt = g.index + g[0].length;
console.log(`=== SELECTION TEST — every <path d=...> in the emitted penny obverse (600px) ===`);
console.log(`bust transform group opens at char ${gAt}; parts() takes screenPaths from BEFORE it (the /M / filter) and the FIRST path AFTER it as \`d\`.\n`);
let firstAfter = true;
let n = 0;
for (const m of svg.matchAll(/<path d="([^"]*)"/g)) {
  const before = m.index < g.index;
  const d = m[1];
  const isScreen = before && d.startsWith('M ');
  let role = before ? (isScreen ? 'screenPath  (IN LOCUS)' : 'before, not /^M / — dropped') : 'after transform';
  if (!before && firstAfter) { role = 'THE `d` parts() TOOK  (IN LOCUS)'; firstAfter = false; }
  console.log(`  [${String(n++).padStart(2)}] ${role.padEnd(34)} ${d.slice(0, 46).replace(/\n/g, ' ')}`);
}

// which named constants those are
const named = (needle) => svg.includes(needle);
console.log(`\n  HAIR.Lincoln's opening literal  "M 13.5 -27.05"  present in the SVG: ${named('M 13.5 -27.05')}`);
console.log(`  BEARD's opening literal         "M 15.15 12.77"  present in the SVG: ${named('M 15.15 12.77')}`);
console.log(`  HEAD.Lincoln's opening literal  "M -20.39 18"    present in the SVG: ${named('M -20.39 18')}`);
console.log(`  parts().d starts with: ${JSON.stringify(base.p.d.slice(0, 24))}`);
console.log(`  parts().screenPaths start with: ${JSON.stringify(base.p.screenPaths.map((s) => s.slice(0, 18)))}`);

// ── mutate ────────────────────────────────────────────────────────────────
// Each mutation replaces a whole path literal with a triangle at the same
// origin. Anchors are the opening `M` literals, which are unique in the file.
const MUT = {
  'HAIR.Lincoln': { open: "'M 13.5 -27.05 C 13.58 -28.17 10.32 -29.9 8.69 -30.74',", tri: "'M 13.5 -27.05 L -25 -10 L -19 12 Z',", closeHint: 'Lincoln: [' },
  BEARD: { open: "'M 15.15 12.77 C 15.64 13.62 13.67 16.33 12.3 17.51',", tri: "'M 15.15 12.77 L -17.28 8.63 L -5 24 Z',", closeHint: 'const BEARD = [' },
  'HEAD.Lincoln': { open: null, tri: null },
};

function replaceArray(src, startMarker, endMarker, body) {
  const i = src.indexOf(startMarker);
  if (i < 0) throw new Error('start marker not found: ' + startMarker);
  const j = src.indexOf(endMarker, i);
  if (j < 0) throw new Error('end marker not found');
  return src.slice(0, i + startMarker.length) + body + src.slice(j);
}

const cases = [
  // path,           start marker,                                 end marker,        replacement body
  ['HAIR.Lincoln', "  Lincoln: [\n    'M 13.5 -27.05", "\n  ].join(' '),\n  Jefferson: [", "\n    'M 13.5 -27.05 L -25 -10 L -19 12 Z',"],
  ['BEARD', "const BEARD = [\n  'M 15.15 12.77", "\n].join(' ');", "\n  'M 15.15 12.77 L -17.28 8.63 L -5 24 Z',"],
  ['HEAD.Lincoln  (the RESPONSE test — must MOVE)', "  Lincoln: [\n    'M -20.39 18", "\n  ].join(' '),\n  Jefferson: [", "\n    'M -20.39 18 C -20.53 16.24 -18.85 12.9 -18.3 10.8',\n    'M -20.39 18 L 20 -30 L 22 20 Z',"],
];

console.log('\n=== RESPONSE / NULL TESTS — D1 under a gross mutation of each path ===');
console.log(`  baseline                                        IoU ${base.iou.toFixed(8)}  inter ${base.inter}  oursOnly ${base.oursOnly}  refOnly ${base.refOnly}`);
for (const [name, s, e, body] of cases) {
  const start = s.slice(0, s.indexOf('\n', s.indexOf('[')) + 1);
  const iStart = text.indexOf(start);
  if (iStart < 0) { console.log(`  ${name}: START MARKER NOT FOUND — mutation skipped`); continue; }
  // find the literal line that begins the array and the array's end
  const iOpen = text.indexOf(s);
  if (iOpen < 0) { console.log(`  ${name}: marker not found`); continue; }
  const iEnd = text.indexOf(e, iOpen);
  if (iEnd < 0) { console.log(`  ${name}: end marker not found`); continue; }
  const mutated = text.slice(0, iOpen + start.length - 1) + body + text.slice(iEnd);
  const file = 'src/art/_jh8tmp.js';
  writeFileSync(file, mutated);
  try {
    const r = await iouOf(file);
    const same = r.iou === base.iou && r.inter === base.inter && r.oursOnly === base.oursOnly && r.refOnly === base.refOnly;
    console.log(`  ${name.padEnd(46)} IoU ${r.iou.toFixed(8)}  inter ${r.inter}  oursOnly ${r.oursOnly}  refOnly ${r.refOnly}   ${same ? 'BIT-IDENTICAL -> outside the locus' : 'MOVED -> inside the locus'}`);
  } finally { unlinkSync(file); }
}
