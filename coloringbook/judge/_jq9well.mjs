// D9 — well-formedness. The judge's own sweep: every id x side x tier x value,
// checked for undefined/NaN/Infinity/null, empty attributes, unbalanced tags,
// and non-numeric numbers inside path data / geometry attributes.
//
// Run:  node coloringbook/judge/_jq9well.mjs [srcModule]
//       RESPONSE=1 node ... -> also runs the response test on a generated copy
//       with `undefined` injected into one attribute.
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SRC = process.argv[2] || '../../src/art/coins.js';
const SIZES = [26, 38, 44, 54, 76, 84, 120, 190, 380];
const tierOf = (s) => (s >= 76 ? 'full' : s >= 44 ? 'mid' : 'icon');

const BADWORD = /undefined|NaN|Infinity|null/;
const NUMATTR = /\b(?:cx|cy|r|rx|ry|x|y|x1|y1|x2|y2|width|height|stroke-width|opacity|font-size|letter-spacing|startOffset)="([^"]*)"/g;
const EMPTYATTR = /\b[a-zA-Z-]+=""/;

export function checkSVG(g) {
  const faults = [];
  if (!/^<svg/.test(g.trim())) faults.push('does not start <svg');
  if (!/<\/svg>$/.test(g.trim())) faults.push('does not end </svg>');
  const m = g.match(BADWORD);
  if (m) faults.push(`badword ${m[0]}`);
  if (EMPTYATTR.test(g)) faults.push('empty attribute');
  const opens = (g.match(/<[a-z]/g) || []).length;
  const closes = (g.match(/<\/[a-z]+>/g) || []).length + (g.match(/\/>/g) || []).length;
  if (opens !== closes) faults.push(`tag balance ${opens}/${closes}`);
  // every numeric attribute must parse to a finite number
  let a;
  NUMATTR.lastIndex = 0;
  while ((a = NUMATTR.exec(g))) {
    const v = a[1].trim();
    if (v === '' || !Number.isFinite(Number(v))) {
      if (!/^[0-9.eE+-]+(px|%|em)?$/.test(v)) faults.push(`attr ${a[0].slice(0, 40)}`);
    }
  }
  // every number inside a path d must be finite
  for (const p of g.matchAll(/ d="([^"]*)"/g)) {
    for (const tok of p[1].split(/[\s,]+/)) {
      if (tok === '' || /^[A-Za-z]$/.test(tok)) continue;
      if (!Number.isFinite(Number(tok))) faults.push(`path token "${tok.slice(0, 20)}"`);
    }
  }
  return faults;
}

async function sweep(mod, label) {
  let n = 0;
  const bad = [];
  for (const id of mod.COIN_IDS) {
    for (const side of mod.COIN_SIDES) {
      for (const v of [false, true]) {
        for (const s of SIZES) {
          const g = mod.coinSVG(id, s, { side, value: v });
          n++;
          const f = checkSVG(g);
          if (f.length) bad.push({ id, side, value: v, size: s, tier: tierOf(s), faults: f });
        }
      }
    }
  }
  console.log(`${label}: ${n} renders (${mod.COIN_IDS.length} ids x ${mod.COIN_SIDES.length} sides x 2 value x ${SIZES.length} sizes), ${bad.length} faulty`);
  for (const b of bad.slice(0, 20)) console.log('  BAD', b.id, b.side, 'value=' + b.value, b.size + 'px', b.tier, JSON.stringify(b.faults));
  return { n, bad };
}

const mod = await import(SRC);
const live = await sweep(mod, 'LIVE ' + SRC);

// per-tier breakdown for the quarter specifically
const perTier = {};
for (const side of ['obverse', 'reverse']) {
  for (const s of SIZES) {
    const t = tierOf(s);
    const g = mod.coinSVG('quarter', s, { side });
    const key = `${side}/${t}`;
    perTier[key] = (perTier[key] || 0) + (checkSVG(g).length ? 1 : 0);
  }
}
console.log('quarter faults by side/tier:', JSON.stringify(perTier));

if (process.env.RESPONSE) {
  // Response test: inject `undefined` into one attribute of the quarter's
  // reverse motif and confirm the sweep catches it and names it.
  const srcPath = new URL('../../src/art/coins.js', import.meta.url).pathname;
  let code = readFileSync(srcPath, 'utf8');
  const anchor = '<circle cx="50" cy="50" r="${rField}" fill="${p.field}"/>';
  if (!code.includes(anchor)) throw new Error('RESPONSE anchor missing — the test has gone stale, fix it before trusting D9');
  code = code.replace(anchor, '<circle cx="50" cy="50" r="${rField}" fill="${p.field}" data-x="${MISSING_CONST}"/>');
  code = code.replace('export function coinSVG', 'const MISSING_CONST = undefined;\nexport function coinSVG');
  const money = new URL('../../src/engine/money.js', import.meta.url).pathname;
  code = code.replace(/from '\.\.\/engine\/money\.js'/, `from '${money}'`);
  const dir = mkdtempSync(join(tmpdir(), 'jq9-'));
  const p = join(dir, 'coins-broken.js');
  writeFileSync(p, code);
  const broken = await import('file://' + p);
  const r = await sweep(broken, 'RESPONSE (undefined injected)');
  console.log(r.bad.length > 0
    ? `RESPONSE TEST PASS — injected fault caught in ${r.bad.length} of ${r.n} renders, first: ${r.bad[0].id} ${r.bad[0].side} ${r.bad[0].size}px ${JSON.stringify(r.bad[0].faults)}`
    : 'RESPONSE TEST FAIL — the sweep did not notice an injected `undefined`. D9 is UNTRUSTED.');
}
