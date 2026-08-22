// _jn14map — the round-14 mapping library for the NICKEL OBVERSE.
//
// One job: put a shape authored in the nickel's LOCAL frame onto the pixels of
// each usable reference photograph, and back. Nothing here scores anything.
//
// The chain is exactly the one `_jn6tone.mjs` already uses and justifies; it is
// re-implemented here rather than imported because `_jn6tone.mjs` is a scoring
// instrument and this file is a drawing one, and §1.1 says do not edit an
// instrument you merely want to reuse.
//
//   local (lx,ly)  --(OBVERSE.nickel s/cx/cy/dir)-->  screen (100-unit viewBox)
//   screen         --(/47 about 50,50)-------------->  disc-normalised (u,v)
//   (u,v)          --(frozen disc fit)-------------->  reference pixels
//
// and for `nickel-obv-5.JPG` — the only INDEPENDENT struck reference this face
// has — through the composed ICP of `_nkreg.json`, because the two photographs
// disagree by 2.205% on how large the portrait is relative to the disc
// (`_headmask-nickel.json`). Applied directly, patches slide off the profile.
//
// FROZEN INPUTS, read only: _jn6discs.json, _jn1discs.json, _nkreg.json,
// _tonepatches-nickel.json.
import { readFileSync } from 'node:fs';

const HERE = (f) => new URL('./' + f, import.meta.url).pathname;
const UP = (f) => new URL('../' + f, import.meta.url).pathname;
export const REFP = (f) => new URL('../ref/' + f, import.meta.url).pathname;
const J = (p) => JSON.parse(readFileSync(p, 'utf8'));

export const D6 = J(HERE('_jn6discs.json'));
export const D1 = J(HERE('_jn1discs.json'));
export const REG = J(UP('_nkreg.json'));
export const TP = J(UP('_tonepatches-nickel.json'));

// The local frame, copied from _tonepatches-nickel.json's own `frame` string so
// that it cannot drift from the frozen target. Asserted against the frozen
// `cheek` patch below, which is the only check that matters.
export const FRAME = { CX: -6.4, CY: 43.7, s: 0.95, dir: -1 };

export const localToScreen = (lx, ly) => [
  50 + FRAME.CX + FRAME.dir * FRAME.s * lx,
  FRAME.CY + FRAME.s * ly,
];
export const localToUV = (lx, ly) => {
  const [sx, sy] = localToScreen(lx, ly);
  return [(sx - 50) / 47, (sy - 50) / 47];
};
export const localRToUV = (r) => (r * FRAME.s) / 47;

// self-check against the frozen target: the cheek patch must come back
{
  const c = TP.patches.find((p) => p.name === 'cheek');
  const [u, v] = localToUV(c.local[0], c.local[1]);
  const e = Math.max(Math.abs(u - c.u), Math.abs(v - c.v), Math.abs(localRToUV(c.local[2]) - c.r));
  if (e > 1e-4) throw new Error(`_jn14map frame disagrees with the frozen target by ${e}`);
}

export const DISC = {
  'nickel-obv-unc2004.jpg': D6['nickel-obv-unc2004.jpg'],
  'nickel-obv.jpg': D6['nickel-obv.jpg'],
  'nickel-obv-5.JPG': D6['nickel-obv-5.JPG'],
};

const rot = (x, y, th) => [Math.cos(th) * x - Math.sin(th) * y, Math.sin(th) * x + Math.cos(th) * y];
const r5 = REG.regs.find((r) => r.file === 'nickel-obv-5.JPG');
const ro = REG.regs.find((r) => r.file === 'nickel-obv.jpg');
export const SCALE_O5 = r5.s / ro.s;
export function obvPxTo5Px(X, Y) {
  const [mx, my] = rot((X - ro.tx) / ro.s, (Y - ro.ty) / ro.s, -ro.th);
  const [a, b] = rot(mx, my, r5.th);
  return [r5.tx + r5.s * a, r5.ty + r5.s * b];
}

// local -> pixels of `file`. unc2004 and obv.jpg are the same photograph, so
// disc-normalised coordinates are shared and the first hop is the identity.
export function localToPx(file, lx, ly) {
  const [u, v] = localToUV(lx, ly);
  if (file === 'nickel-obv-5.JPG') {
    const O = DISC['nickel-obv.jpg'];
    return obvPxTo5Px(O.cx + u * O.R, O.cy + v * O.R);
  }
  const d = DISC[file];
  return [d.cx + u * d.R, d.cy + v * d.R];
}
// how many reference pixels one local unit is worth, on `file`
export function pxPerLocal(file) {
  const a = localToPx(file, 0, 0), b = localToPx(file, 10, 0);
  return Math.hypot(b[0] - a[0], b[1] - a[1]) / 10;
}

// ── flattening, borrowed shape-for-shape from coloringbook/_nkflat.mjs so this
// file has no dependency on a helper another round might be editing.
export function flatten(d) {
  const t = d.match(/[MCLQqZz]|-?\d*\.?\d+/g); const pts = []; let i = 0, cx = 0, cy = 0, sx = 0, sy = 0, cmd = 'M';
  const bez = (p0, p1, p2, p3) => { for (let k = 1; k <= 24; k++) { const u = k / 24, v = 1 - u;
    pts.push([v*v*v*p0[0] + 3*v*v*u*p1[0] + 3*v*u*u*p2[0] + u*u*u*p3[0],
              v*v*v*p0[1] + 3*v*v*u*p1[1] + 3*v*u*u*p2[1] + u*u*u*p3[1]]); } };
  const qb = (p0, p1, p2) => { for (let k = 1; k <= 16; k++) { const u = k / 16, v = 1 - u;
    pts.push([v*v*p0[0] + 2*v*u*p1[0] + u*u*p2[0], v*v*p0[1] + 2*v*u*p1[1] + u*u*p2[1]]); } };
  while (i < t.length) { const tk = t[i];
    if (/[MCLQqZz]/.test(tk)) { cmd = tk; i++; if (/[Zz]/.test(cmd)) { cx = sx; cy = sy; } continue; }
    if (cmd === 'M') { cx = +t[i++]; cy = +t[i++]; sx = cx; sy = cy; pts.push([cx, cy]); cmd = 'L'; }
    else if (cmd === 'L') { const x = +t[i++], y = +t[i++]; pts.push([x, y]); cx = x; cy = y; }
    else if (cmd === 'C') { const a = [+t[i++], +t[i++]], b = [+t[i++], +t[i++]], c = [+t[i++], +t[i++]];
      bez([cx, cy], a, b, c); cx = c[0]; cy = c[1]; }
    else if (cmd === 'Q') { const a = [+t[i++], +t[i++]], b = [+t[i++], +t[i++]]; qb([cx, cy], a, b); cx = b[0]; cy = b[1]; }
    else if (cmd === 'q') { const a = [cx + +t[i++], cy + +t[i++]], b = [cx + +t[i++], cy + +t[i++]];
      qb([cx, cy], a, b); cx = b[0]; cy = b[1]; }
    else i++; }
  return pts;
}
export const inside = (p, poly) => { let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    if (((poly[i][1] > p[1]) !== (poly[j][1] > p[1])) &&
        (p[0] < (poly[j][0] - poly[i][0]) * (p[1] - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0])) c = !c; }
  return c; };
