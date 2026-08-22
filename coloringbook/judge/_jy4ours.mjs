// ROUND (cent obverse, mid-jaw) — OUR OWN dark-mass boundary, per local x.
//
// brief-common.md standing rule 1: before comparing two numbers, state what
// each one measures. `coins.js` compares "ours 4.9 / 7.3 / 9.8 / 11.8 / 12.9"
// against "the photograph's ~0 / -3 / 0 / +4 / +8". Ours is the top edge of the
// BEARD path alone. The photograph's is the boundary between bare cheek and
// dark mass — and on our drawing that boundary is the top of BEARD ∪ HAIR,
// because HAIR hangs down in front of the ear as a sideburn and covers part of
// the same column. Where HAIR covers it, a BEARD-only number overstates the
// shortfall.
//
// So this prints, for each local x: the top of BEARD, the bottom of HAIR, the
// top of the UNION, and the height of any bare-cheek gap trapped between the
// two masses. Geometry only — the paths are flattened and tested by
// point-in-polygon, no raster, no tone.
//
// Run: node coloringbook/judge/_jy4ours.mjs [path-to-coins.js]
import { flattenPath } from './_jqgeom.mjs';
import { PENNY } from '../_pylib.mjs';

const SRC = process.argv[2] || '../../src/art/coins.js';
const mod = await import(SRC.startsWith('.') ? SRC : `file://${SRC}`);
const svg = mod.coinSVG('penny', 380, { side: 'obverse' });
const ds = [...svg.matchAll(/<path\b[^>]*?\sd="([^"]*)"/g)].map((m) => m[1]);
const pick = (pre) => {
  const d = ds.find((x) => x.startsWith(pre));
  if (!d) throw new Error(`no path starting "${pre}" — the signature is stale (DM5: throw, never report "not present")`);
  // the emitted `d` is authored in Lincoln's LOCAL frame (the placement is a
  // transform on the group), so the flattened points are already local units —
  // `_jh8ladder.mjs` draws them straight through its local X()/Y() and lands on
  // the coin, which is the check that this is the right frame.
  return flattenPath(d).pts;
};
const HAIR = pick('M 13.5 -27.05');
const BEARD = pick('M 15.15 12.77');

const inside = (poly, x, y) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
};

export function boundaries(xs = [-10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10], quiet = false) {
  const YLO = -14, YHI = 30, STEP = 0.05;   // literal search window; a value at a bound is a failure report
  const out = {};
  if (!quiet) console.log(`  local x   BEARD top   HAIR bottom   UNION top   bare-cheek gap between them   (y window [${YLO},${YHI}])`);
  for (const x of xs) {
    let bTop = null, hBot = null, uTop = null, gap = 0, gapTop = null;
    let inGap = false, gStart = 0;
    for (let y = YLO; y <= YHI; y += STEP) {
      const b = inside(BEARD, x, y), h = inside(HAIR, x, y);
      if (b && bTop === null) bTop = y;
      if (h) hBot = y;
      if ((b || h) && uTop === null) uTop = y;
      if (uTop !== null && !b && !h && !inGap) { inGap = true; gStart = y; }
      if (inGap && (b || h)) { if (y - gStart > gap) { gap = y - gStart; gapTop = gStart; } inGap = false; }
    }
    out[x] = { bTop, hBot, uTop, gap, gapTop };
    if (!quiet) console.log(`  ${String(x).padStart(6)}   ${bTop === null ? '   none' : bTop.toFixed(2).padStart(7)}   ${hBot === null ? '     none' : hBot.toFixed(2).padStart(9)}   ${uTop === null ? '  none' : uTop.toFixed(2).padStart(7)}   ${gap > 0.1 ? `${gap.toFixed(2)} units of bare cheek from y=${gapTop.toFixed(2)}` : '—'}`);
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) boundaries();
