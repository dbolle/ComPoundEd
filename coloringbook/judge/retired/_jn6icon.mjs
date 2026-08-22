// _jn6icon — WORKING INSTRUMENT. Prices a change to the nickel's ICON TRIO
// (`iconS/iconCx/iconCy`) against every gate that trio can move, in one table,
// so the D10 trade is visible instead of argued.
//
// WHY THE TRIO IS THE ONLY LEVER D10 HAS HERE. `_jn6attr.mjs` attributes the
// whole of the 42->44 d(ink) to `below` — the neck and the coat, which `bust()`
// drops at icon (`const below = icon || o.cut ? '' : ...`). `bust()` is shared
// with the cent and the quarter and this round may not touch it; `EDGE` is
// named as a shared helper too, and `EDGE.nickel.field.icon` is the other
// half. What is left that belongs to this coin alone is where and how big the
// icon head is drawn.
//
// AND THERE IS A DOCUMENTED REASON TO LOOK AT IT. `OBVERSE`'s own comment says
// the icon trio exists because "at icon tier the neck and coat are dropped
// entirely, so the head has to be re-centred and re-scaled to fill the disc on
// its own. These are the values that put each man's whole mass ... centred in
// the field at about 86% of its diameter." Measured, mass height over icon
// field diameter: penny 0.863, quarter 0.857, dime 0.833 — and NICKEL 0.736,
// with its mass centre at y 41.4 against a field centre of 50. The nickel is
// the only coin of the four whose icon trio is a copy of its full-tier trio,
// and the comment describes a rule it does not follow.
//
// Each candidate is generated as a COPY of coins.js; src/art/coins.js is never
// written. Every reported column is computed by an instrument that already
// exists (`_jn8tier.mjs`'s stats, `_x6mat.mjs`, `_jq8contain-v2.mjs`), invoked
// on the copy, so no number here is this file's own invention.
//
// Run: node coloringbook/judge/_jn6icon.mjs
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { flatten } from '../_nkflat.mjs';
import { internals } from './_jn6mod.mjs';

const SRC = new URL('../../src/art/coins.js', import.meta.url).pathname;
const MONEY = new URL('../../src/engine/money.js', import.meta.url).pathname;
const raw = readFileSync(SRC, 'utf8');
const ANCHOR = 's: 0.95, cy: 43.7, cx: -6.4, iconS: 0.95, iconCy: 43.7, iconCx: -6.4,';
if (raw.split(ANCHOR).length - 1 !== 1) throw new Error(`anchor matched ${raw.split(ANCHOR).length - 1} times — refusing`);
const DIR = mkdtempSync(join(tmpdir(), 'jn6icon-'));

async function raster(svg, W) {
  const { data, info } = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
    .resize(W, W, { fit: 'fill' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, h: info.height };
}
async function inkAt(mod, size) {                       // _jn8tier.mjs's stats(), verbatim
  const svg = mod.coinSVG('nickel', size, { side: 'obverse' });
  const W = Number(svg.match(/width="([\d.]+)"/)[1]);
  const g = await raster(svg, Math.max(8, Math.round(W)));
  const R = g.w / 2, cx = g.w / 2, cy = g.h / 2, vals = [];
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++)
    if (Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= 0.84 * R) vals.push(g.d[y * g.w + x]);
  vals.sort((a, b) => a - b);
  const field = vals[Math.floor(vals.length * 0.9)];
  return vals.filter((v) => v < field - 8).length / vals.length;
}

// candidates: [label, iconS, iconCx, iconCy]
const C = [
  ['baseline           0.950 / -6.40 / 43.70', 0.95, -6.4, 43.7],
  ['fill 0.80, centred 1.032 / -7.03 / 49.31', 1.032, -7.03, 49.31],
  ['fill 0.83, centred 1.071 / -7.24 / 51.11', 1.071, -7.24, 51.11],
  ['fill 0.86, centred 1.109 / -7.47 / 52.69', 1.109, -7.47, 52.69],
  ['fill 0.86, y only  1.109 / -6.40 / 52.69', 1.109, -6.4, 52.69],
  ['scale only         1.109 / -6.40 / 43.70', 1.109, -6.4, 43.7],
];

const { HEAD, TAIL, EDGE } = await internals();
// TAIL has no Jefferson entry (the queue and ribbon moved into HAIR — see the
// comment above TAIL), so the icon mass is HEAD.Jefferson alone. Asserted,
// because silently flattening `undefined` is how a bbox becomes a fiction.
if (TAIL.Jefferson !== undefined) throw new Error('TAIL.Jefferson now exists — this bbox is wrong');
const MASSPTS = flatten(HEAD.Jefferson);
const RICON = EDGE.nickel.field.icon;

console.log('### _jn6icon — the nickel icon trio against every gate it can move.');
console.log('### D10 numerator is d(ink) 42->44 ABSOLUTE (Appendix R2: no improvement without it).');
console.log('### D11 is the row at risk: nickel.o vs dime.o is the closest pair in the set.\n');
console.log('candidate                                    massH/fieldDia  centre     ink@42   d(ink)42-44   D11 nk.o/dm.o  D11 set min');
for (const [label, s, cx, cy] of C) {
  const p = join(DIR, `c${C.indexOf(C.find((x) => x[0] === label))}.js`);
  writeFileSync(p, raw.split("from '../engine/money.js'").join(`from '${MONEY}'`)
    .split(ANCHOR).join(`s: 0.95, cy: 43.7, cx: -6.4, iconS: ${s}, iconCy: ${cy}, iconCx: ${cx},`));
  const mod = await import(p);
  // HEAD/TAIL/EDGE are identical in every candidate — only the trio changes —
  // so they are read ONCE, from the real source, outside the loop.
  const pts = MASSPTS;
  const X = pts.map((q) => 50 + cx - s * q[0]), Y = pts.map((q) => cy + s * q[1]);
  const h = Math.max(...Y) - Math.min(...Y);
  const fill = h / (2 * RICON);
  const ctr = `${((Math.max(...X) + Math.min(...X)) / 2).toFixed(1)},${((Math.max(...Y) + Math.min(...Y)) / 2).toFixed(1)}`;
  const i42 = await inkAt(mod, 42), i44 = await inkAt(mod, 44);
  const out = execFileSync(process.execPath, [new URL('../_x6mat.mjs', import.meta.url).pathname, 'jn6icon'],
    { env: { ...process.env, SRC: p }, cwd: new URL('../..', import.meta.url).pathname, encoding: 'utf8' });
  const nk = out.match(/nickel\.o vs dime\.o\s+([\d.]+)/) || out.match(/MINIMUM overall\s+\S+ vs \S+\s+([\d.]+)/);
  const setmin = out.match(/MINIMUM overall\s+(\S+ vs \S+)\s+([\d.]+)/);
  const nkdm = out.split('\n').find((l) => l.startsWith('nickel.o'));
  const dmCol = nkdm ? (+nkdm.trim().split(/\s+/)[5] / 1000).toFixed(4) : '?';
  console.log(`${label.padEnd(44)} ${fill.toFixed(3).padStart(9)}  ${ctr.padStart(11)}  ${i42.toFixed(4)}      ${(i44 - i42).toFixed(4)}        ${dmCol}      ${setmin ? setmin[2] + ' (' + setmin[1] + ')' : '?'}`);
}
console.log(`\ncopies in ${DIR}; src/art/coins.js untouched.`);
