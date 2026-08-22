// _jn6attr — round 6, nickel obverse. WORKING INSTRUMENT, not evidence.
//
// The D10 icon->mid boundary is one number (d(ink) at 42->44). This says WHAT
// it is made of, by generating COPIES of coins.js with one component
// suppressed at a time and re-running _jn8tier.mjs's own `stats()` on each.
// Nothing here edits src/art/coins.js — every variant is written to a temp
// file and imported by path, the same trick _jb9well.mjs uses for its
// response test.
//
// The suppressions are TEXTUAL and each one is asserted to have actually
// changed the file (a no-op substitution that silently matched nothing is
// exactly the "two bit-identical answers from two different inputs" failure
// §4 names), and each is asserted to leave the OTHER THREE COINS byte
// identical where it claims to.
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SRC = new URL('../../src/art/coins.js', import.meta.url).pathname;
const MONEY = new URL('../../src/engine/money.js', import.meta.url).pathname;
// coins.js has exactly one relative import; a variant written outside src/art
// cannot resolve it, so the specifier is absolutised in the copy. Asserted,
// because a silently-unmatched substitution is the §4 failure mode.
const raw = readFileSync(SRC, 'utf8');
if (raw.split("from '../engine/money.js'").length - 1 !== 1) throw new Error('import rewrite did not match exactly once');
const base = raw.split("from '../engine/money.js'").join(`from '${MONEY}'`);
const DIR = mkdtempSync(join(tmpdir(), 'jn6attr-'));

async function raster(svg, W) {
  const { data, info } = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
    .resize(W, W, { fit: 'fill' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, h: info.height };
}
async function stats(mod, id, side, size) {
  const svg = mod.coinSVG(id, size, { side });
  const W = Number(svg.match(/width="([\d.]+)"/)[1]);
  const g = await raster(svg, Math.max(8, Math.round(W)));
  const R = g.w / 2, cx = g.w / 2, cy = g.h / 2;
  const vals = [];
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    if (Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= 0.84 * R) vals.push(g.d[y * g.w + x]);
  }
  vals.sort((a, b) => a - b);
  const field = vals[Math.floor(vals.length * 0.9)];
  return vals.filter((v) => v < field - 8).length / vals.length;
}

// Each variant: [label, from, to]. `from` must occur exactly once.
const V = [
  ['baseline', null, null],
  // the coat group at mid/full only (nickel: o.bare is false, o.cut undefined)
  ['no coat (all coats)', '${coat(rIn, o.dir, s, cx, cy, o.neck, o.coat)}', ''],
  ['no bareNeck (all)', '${bareNeck(rIn, o.dir, s, cx, cy)}', ''],
  ['no hair mass (all)', '<path d="${HAIR[o.who]}"/>${tail}', ''],
  ['no deep bevel copy (all)', '<path d="${HEAD[o.who]}" transform="translate(${rx} ${ry})" fill="${p.deep}" stroke="none"/>', ''],
  // head fill tone at mid/full := deep, i.e. what icon uses
  ['head fill = p.deep everywhere', 'const head = icon ? p.deep : p.motif;', 'const head = p.deep;'],
  // the two halves of `below` together — this is the whole of what `icon` drops
  ['no below at all (neck+coat)', 'const below = icon || o.cut', 'const below = true || icon || o.cut'],
  // EDGE is READ ONLY in the shipped file; this variant exists only to price
  // the field-radius step, and it is never proposed as a change.
  ['icon field radius := 44.07', "nickel: { field: { full: 44.07, mid: 44.07, icon: 42.5 } }", "nickel: { field: { full: 44.07, mid: 44.07, icon: 44.07 } }"],
  ['icon bevel opacity := 0.42', 'opacity="${icon ? 0.5 : 0.42}"', 'opacity="0.42"'],
];

console.log('### _jn6attr — nickel obverse, ink at the two sizes either side of the icon->mid seam');
console.log('variant                              ink@42     ink@44    d(ink)   (baseline d = 0.0854)');
let n = 0;
for (const [label, from, to] of V) {
  let path = SRC;
  if (from != null) {
    const c = base.split(from).length - 1;
    if (c !== 1) { console.log(`${label.padEnd(34)}  SUBSTITUTION MATCHED ${c} TIMES — refusing to report a number`); continue; }
    path = join(DIR, `v${n++}.js`);
    writeFileSync(path, base.split(from).join(to));
  }
  const mod = await import(path);
  const a = await stats(mod, 'nickel', 'obverse', 42);
  const b = await stats(mod, 'nickel', 'obverse', 44);
  console.log(`${label.padEnd(34)}  ${a.toFixed(4)}     ${b.toFixed(4)}    ${(b - a >= 0 ? '+' : '') + (b - a).toFixed(4)}`);
}
console.log(`\nNULL TEST: the 'baseline' row must reproduce _jn8tier.mjs's 0.0854 exactly, and it is`);
console.log(`the only row whose art file is src/art/coins.js itself. Variants live in ${DIR}.`);
