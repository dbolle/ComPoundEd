// _jn15d6 — D6 for a revision PINNED BY PATH.
//
// `_jn13d6.mjs` is the D6 instrument and it is hashed, so it may not be edited
// (§1). It imports `../../src/art/coins.js` directly, which means it can only
// ever measure the working tree — there is no way to get a `before` number out
// of it once the art has moved. This is the same computation, byte for byte,
// against a revision given on the command line, so a round can publish both
// ends of its own change.
//
// It reuses the hashed `_jqgeom.mjs` read only. The numbers it prints for the
// live tree must equal `_jn13d6.mjs`'s, and that equivalence is checked by
// running both — see the report.
//
// R2: the fraction is a RATIO, so the absolute numerator (length at ratio
// 1.000) and the denominator (drawn length) are both printed, and no round may
// claim an improvement in the fraction unless the numerator moved.
//
// Run: node coloringbook/judge/_jn15d6.mjs <coins.js> [id]
import { createHash } from 'node:crypto';
import { readFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { marks } from './_jqgeom.mjs';

const [, , SRC = new URL('../../src/art/coins.js', import.meta.url).pathname, ID = 'nickel'] = process.argv;
const SIZES = [26, 44, 84, 190];
async function load(p) {
  const raw = readFileSync(p, 'utf8');
  const MONEY = new URL('../../src/engine/money.js', import.meta.url).pathname;
  if (!raw.includes("from '../engine/money.js'")) return import(p);
  const f = join(mkdtempSync(join(tmpdir(), 'jn15d6-')), 'coins.js');
  writeFileSync(f, raw.split("from '../engine/money.js'").join(`from '${MONEY}'`));
  return import(f);
}
const mod = await load(SRC);

const isBlankOrField = (m) => m.el === 'circle'
  && Math.abs(m.bbox.x0 + m.bbox.x1 - 100) < 1e-6 && (m.bbox.x1 - m.bbox.x0) / 2 > 35;
const isSpecular = (m) => m.stroke === '#ffffff' && Math.abs(m.opacity - 0.26) < 1e-6;
const len = (m) => { let L = 0; const P = m.pts || []; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y); return L; };

console.log(`### D6 ${ID}  ${SRC}  sha256:${createHash('sha256').update(readFileSync(SRC)).digest('hex').slice(0, 16)}`);
console.log('side      size   marks  stroke-rendered  drawn len   len at ratio 1.000   fraction');
for (const side of ['obverse', 'reverse']) {
  for (const size of SIZES) {
    const all = marks(mod.coinSVG(ID, size, { side })).slice(1).filter((m) => !isBlankOrField(m) && !isSpecular(m));
    let total = 0, uni = 0, n1 = 0;
    for (const m of all) { const L = len(m); total += L; if (m.isStroke) { uni += L; n1++; } }
    console.log(`${side.padEnd(9)} ${String(size).padStart(4)}  ${String(all.length).padStart(6)}  ${String(n1).padStart(15)}  ${total.toFixed(1).padStart(9)}  ${uni.toFixed(1).padStart(18)}   ${(100 * (total ? uni / total : 0)).toFixed(2)}%`);
  }
}
