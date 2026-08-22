// _jn15locus — the FROZEN LOCUS for round 4's strand-direction measurement, and
// the reason it exists is §4.3.
//
// A structure tensor reports the strongest oriented thing in its disc. Run over
// the whole wig it does NOT report the strands twice: near the front it reports
// the HAIRLINE, and near the back and the crown it reports the SILHOUETTE EDGE.
// Both are in-bounds, both are highly coherent, and both are the wrong feature.
// Two worked examples, from the first run of _jn15strand.mjs:
//
//   local (0,-10)    tensor -54.0 deg;  the hairline tangent there is -64.2 deg
//   local (-32,-18)  tensor -64.1 deg on the photograph and -66.9 deg on OUR
//                    render — a suspiciously exact agreement, because both are
//                    reading the same back-of-head outline rather than any hair
//
// So the locus is: at least `r` local units inside BOTH screens.
//
//   HAIRLINE   the line round 3 read off the two photographs (quoted in the
//              block above HAIR.Jefferson, "the two references agree on that
//              line to about a unit and a half").
//   OUTLINE    coloringbook/_headmask-nickel.json — the frozen D1 target,
//              segmented off Schlag's own accepted model, converted from
//              disc-normalised (u,v) into the nickel's local frame.
//
// BOTH ARE TARGET-DERIVED. Neither is computed from the artefact under test, so
// §6.1 is satisfied: the locus does not move when our drawing moves, and the
// reference-invariance test on it is trivially exact (the two literals below
// have no dependence on src/art/coins.js at all).
import { readFileSync } from 'node:fs';

const MASK = JSON.parse(readFileSync(new URL('../_headmask-nickel.json', import.meta.url).pathname, 'utf8'));
const FRAME = { CX: -6.4, CY: 43.7, s: 0.95, dir: -1 };

// (u,v) disc-normalised -> local, the exact inverse of _jn14map's localToUV
const uvToLocal = (u, v) => [
  (47 * u - FRAME.CX) / (FRAME.dir * FRAME.s),
  (47 * v + 50 - FRAME.CY) / FRAME.s,
];

export const OUTLINE = MASK.poly.map(([u, v]) => uvToLocal(u, v));

export const HAIRLINE = [
  [9.32, -25.96], [8.5, -22.2], [6.7, -18.2], [4.7, -14.2], [2.7, -10.2],
  [0.7, -6.2], [-1.1, -2.2], [-2.7, 1.8], [-4.3, 5.4], [-6.4, 8.6],
  [-9.4, 11.4], [-12.6, 14.0], [-15.2, 16.8],
];

function distToPoly(pts, x, y, closed) {
  let best = Infinity;
  const n = pts.length;
  for (let i = 0; i + 1 < n + (closed ? 1 : 0); i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % n];
    const dx = bx - ax, dy = by - ay;
    const L = dx * dx + dy * dy;
    const t = L === 0 ? 0 : Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L));
    best = Math.min(best, Math.hypot(x - (ax + t * dx), y - (ay + t * dy)));
  }
  return best;
}

export const dHair = (x, y) => distToPoly(HAIRLINE, x, y, false);
export const dOutline = (x, y) => distToPoly(OUTLINE, x, y, true);

// SELF-CHECK (§4): the frame must reproduce the mask's own published area
// fraction, and the local frame must put the crown above the chin.
{
  const ys = OUTLINE.map((p) => p[1]);
  if (!(Math.min(...ys) < -30 && Math.max(...ys) > 20)) {
    throw new Error(`_jn15locus: converted outline spans y ${Math.min(...ys)}..${Math.max(...ys)} — the frame is wrong`);
  }
}
