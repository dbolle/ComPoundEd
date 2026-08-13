// Find SHARED CLAIMS in src/art/coins.js — places where one number stands in
// for four coins that were never separately measured.
//
// Why this exists. The coin art has two kinds of shared code and only one of
// them is legitimate:
//
//   MECHANISM  — struck(), reliefOff(), spendOf()/fitOff(), onField(), the
//                tier logic, the emitter. Physics, not portraiture. Sharing
//                is the POINT: one containment fix repaired the quarter, the
//                dime and the nickel in a single edit (v1.56.0 round 1).
//
//   DEPICTION  — what a PARTICULAR coin looks like. Sharing here is a bug
//                wearing a helper's clothes, and it has cost real work:
//                  · REV_TEXT_MIN = 135 was the NICKEL's legibility floor
//                    applied to all four; the quarter therefore drew ZERO
//                    letters at 84px, the exact size money.js uses to ask a
//                    child "which coin is this?"
//                  · ear() drew a helix on Washington, whose wig covers the
//                    ear completely.
//                  · bareNeck() ran to the field edge on a bust that the
//                    photograph shows truncating clear of it.
//
// The fix is NOT to fork coins.js per coin — 56% of that file is reasoning,
// and five diverging copies of the reasoning is worse than one shared bug.
// The fix is to push a value DOWN to the coin the moment it turns out to be a
// claim about one coin, keeping the shared default:
//
//     t.min ?? REV_TEXT_MIN          o.eyeMark || eye(o.eye)
//
// That is already the house idiom. This script finds the NEXT candidate so it
// happens on discovery instead of on a bug report.
//
// It reports two things and neither is automatically a defect:
//
//   UNIFORM   a per-coin table whose entries are byte-identical for every
//             coin. Structurally per-coin, actually one shared number. Either
//             the coins genuinely agree (say so) or nobody has measured them
//             separately (measure them).
//   DEFAULTED a shared constant consumed through `?? SHARED` or `|| shared()`
//             — the pattern is right; the question is which coins still ride
//             the default and whether that was ever checked for them.
//
// Usage:  node scripts/coin-shared-claims.mjs
// Exit 0 always. This is a discovery aid, not a gate — a uniform table can be
// perfectly correct, and a gate here would train people to silence it.

import { readFileSync } from 'node:fs';

const SRC = readFileSync(new URL('../src/art/coins.js', import.meta.url), 'utf8');
const COINS = ['penny', 'nickel', 'dime', 'quarter', 'buck'];

// ── per-coin tables: `const NAME = {` … with lines keyed by a coin id ────────
function tables() {
  const out = [];
  const re = /^(?:export )?const ([A-Z][A-Z_0-9]*) = \{$/gm;
  let m;
  while ((m = re.exec(SRC))) {
    const start = m.index + m[0].length;
    // walk to the matching brace at depth 0
    let d = 1, i = start;
    while (i < SRC.length && d > 0) {
      const c = SRC[i];
      if (c === '{') d++;
      else if (c === '}') d--;
      i++;
    }
    const body = SRC.slice(start, i - 1);
    // Capture each coin's FULL value, including a nested multi-line object.
    // A first version matched only the first line, so every coin whose value
    // began with `{` compared equal and OBVERSE/INSCRIPTION were reported as
    // uniform when they are nothing of the kind. That is the same class of
    // fault this whole workstream keeps finding in its own instruments — a
    // confident wrong answer — so the balanced walk below is the fix, and the
    // self-test at the bottom of this file is the guard.
    const rows = {};
    const key = /^\s{2}(\w+):\s*/gm;
    let k;
    while ((k = key.exec(body))) {
      if (!COINS.includes(k[1])) continue;
      let j = k.index + k[0].length, depth = 0, val = '';
      for (; j < body.length; j++) {
        const c = body[j];
        if (c === '{' || c === '[') depth++;
        else if (c === '}' || c === ']') depth--;
        else if (c === ',' && depth === 0) break;
        else if (c === '\n' && depth === 0) break;
        val += c;
      }
      rows[k[1]] = val.replace(/\s+/g, ' ').trim();
    }
    if (Object.keys(rows).length >= 2) out.push({ name: m[1], rows, line: lineOf(m.index) });
  }
  return out;
}
const lineOf = (idx) => SRC.slice(0, idx).split('\n').length;

// ── shared defaults consumed with ?? or || ───────────────────────────────────
function defaults() {
  const out = new Map();
  for (const re of [/(\w+)\s*\?\?\s*([A-Z][A-Z_0-9]{3,})/g, /(\w+\.\w+)\s*\|\|\s*(\w+)\(/g]) {
    let m;
    while ((m = re.exec(SRC))) {
      const key = `${m[2]} (via ${m[1]})`;
      if (!out.has(key)) out.set(key, lineOf(m.index));
    }
  }
  return out;
}

console.log('SHARED CLAIMS in src/art/coins.js');
console.log('='.repeat(66));

let uniform = 0;
console.log('\nUNIFORM per-coin tables — one number standing in for several coins:\n');
for (const t of tables()) {
  const vals = Object.values(t.rows);
  const keys = Object.keys(t.rows);
  if (new Set(vals).size === 1 && vals.length > 1) {
    uniform++;
    console.log(`  ${t.name}  (line ${t.line})  ${keys.length} coins, ONE value`);
    console.log(`     ${keys.join(', ')}`);
    console.log(`     all = ${vals[0].slice(0, 68)}`);
    console.log(`     -> either the coins genuinely agree (record why) or this`);
    console.log(`        was never measured per coin (measure it).\n`);
  } else {
    // partially uniform: some coins share a value others do not
    const byVal = new Map();
    for (const [k, v] of Object.entries(t.rows)) byVal.set(v, [...(byVal.get(v) ?? []), k]);
    const shared = [...byVal.entries()].filter(([, ks]) => ks.length > 1);
    if (shared.length) {
      console.log(`  ${t.name}  (line ${t.line})  partially uniform`);
      for (const [v, ks] of shared) console.log(`     ${ks.join(' = ')}  ->  ${v.slice(0, 54)}`);
      console.log('');
    }
  }
}
if (!uniform) console.log('  (none fully uniform)\n');

console.log('DEFAULTED — shared value reached through a per-coin override point:\n');
for (const [k, ln] of [...defaults()].sort()) {
  console.log(`  line ${String(ln).padStart(4)}  ${k}`);
}
console.log(`
The override pattern itself is correct and is the house idiom. The question
for each line above is WHICH coins still ride the default, and whether that
default was ever checked against those coins' photographs — REV_TEXT_MIN was
the nickel's number silently governing three other coins for three releases.
`);

// ── self-test (§4 of docs/COIN-JUDGE.md): an instrument proves it can move ───
// Run: node scripts/coin-shared-claims.mjs --selftest
if (process.argv.includes('--selftest')) {
  const t = tables();
  const edge = t.find((x) => x.name === 'EDGE');
  const obv = t.find((x) => x.name === 'OBVERSE');
  const fail = [];
  // RESPONSE: a genuinely uniform table must read uniform...
  if (!edge || new Set(Object.values(edge.rows)).size !== 1)
    fail.push('EDGE should read uniform (all four field radii are identical)');
  // ...and a genuinely varied one must NOT. This is the false positive that
  // the first version of this script produced.
  if (!obv || new Set(Object.values(obv.rows)).size < 2)
    fail.push('OBVERSE must NOT read uniform — each coin has its own s/cx/cy');
  // and the values must be substantial, not just the opening brace
  if (obv && Object.values(obv.rows).some((v) => v.length < 20))
    fail.push('OBVERSE rows truncated — nested-object capture is broken again');
  console.log(fail.length ? 'SELFTEST FAIL:\n  ' + fail.join('\n  ') : 'SELFTEST PASS');
  process.exit(fail.length ? 1 : 0);
}
