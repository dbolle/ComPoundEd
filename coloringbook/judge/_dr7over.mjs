// DIME REVERSE — round 1. OVERLAY: our own outline drawn on each reference at
// a matched disc, in the reference's own frame.
//
// Reports only; writes `_dr7-*.png` into the gitignored judge scratch.
//
// WHY AN OVERLAY AND NOT A NUMBER. `COIN-JUDGE.md` §0 records that every
// wrong-in-kind defect ever found on this art was found by looking, and §4.3
// makes the overlay obligation the thing that caught seven wrong features
// every response test had passed. The edge ladder in `_dr5edge.mjs` measures
// the shaft; this shows the whole motif at once.
//
// ⚠️ SCALE. `_nk3over.mjs` drew our device 6% small for its whole life because
// it normalised our render by its WIDTH. `coinSVG` draws the blank at r = 47 of
// a 100-unit viewBox, so viewBox X maps to our render pixel W*X/100 and to a
// reference pixel cx + R*(X-50)/47 — the same mapping `_nkrlib.mjs` uses. The
// self-check below prints our own rim radius recovered THROUGH the overlay
// mapping; it must come back at 47.0 +- 0.3 or the overlay is lying.
//
// Run: node coloringbook/judge/_dr7over.mjs
import sharp from 'sharp';
import { join } from 'node:path';
import { SCRATCH } from './_paths.mjs';
import { samplerFor } from './_dr2grid.mjs';

const PPU = 14;              // pixels per viewBox unit in the output
const BOX = [8, 92, 8, 92];  // viewBox window drawn

async function ourMask() {
  const s = await samplerFor('ours', 1800);
  const g = s.g;
  // our motif masses in `deep` (#6b737b, grey 115) on a field of `#cfd5da`
  // (grey 211); anything under the midpoint is ink.
  const T = 165;
  return (X, Y) => s.at(X, Y) < T;
}

// The blank is `reededPath(n, 47, depth)` STROKED at `sw(2.6, 1.0, boxW)`, so
// the outermost ink is r = 47 + 2.6/2 = 48.3, not 47. Recovering 47.0 here
// would mean the sampler was reading the fill boundary and the mapping was
// half a stroke small — the check is against 48.3.
const R_INK = 48.3;
/** self-check: recover our own blank radius through the same mapping */
async function selfCheck() {
  const s = await samplerFor('ours', 1800);
  let rs = [];
  for (let k = 0; k < 360; k++) {
    const th = (2 * Math.PI * k) / 360;
    let last = 0;
    for (let r = 49.8; r > 40; r -= 0.02) {
      const v = s.at(50 + Math.cos(th) * r, 50 + Math.sin(th) * r);
      if (v < 250) { last = r; break; }
    }
    if (last) rs.push(last);
  }
  rs.sort((a, b) => a - b);
  return rs[rs.length >> 1];
}

if (process.argv[1] && process.argv[1].endsWith('_dr7over.mjs')) {
  const rSelf = await selfCheck();
  console.log(`self-check: our outermost ink recovered at r = ${rSelf.toFixed(2)} viewBox units ` +
    `(must be ${R_INK} +- 0.3) — ${Math.abs(rSelf - R_INK) <= 0.3 ? 'OK' : 'OVERLAY IS LYING'}`);
  const mask = await ourMask();
  const [x0, x1, y0, y1] = BOX;
  const W = Math.round((x1 - x0) * PPU), H = Math.round((y1 - y0) * PPU);
  for (const f of ['dime-rev-2.jpg', 'dime-rev-proofbright.png', 'dime-rev-unc2005.png']) {
    const s = await samplerFor(f);
    const buf = Buffer.alloc(W * H * 3);
    for (let j = 0; j < H; j++) {
      for (let i = 0; i < W; i++) {
        const X = x0 + i / PPU, Y = y0 + j / PPU;
        const v = Math.max(0, Math.min(255, Math.round(s.at(X, Y))));
        const k = (j * W + i) * 3;
        buf[k] = buf[k + 1] = buf[k + 2] = v;
        // our outline: a mask pixel with a non-mask 4-neighbour
        const e = 1 / PPU;
        if (mask(X, Y) && !(mask(X - e, Y) && mask(X + e, Y) && mask(X, Y - e) && mask(X, Y + e))) {
          buf[k] = 255; buf[k + 1] = 0; buf[k + 2] = 0;
        }
      }
    }
    const out = `_dr7-${f.replace(/[^a-z0-9]/gi, '_')}.png`;
    await sharp(buf, { raw: { width: W, height: H, channels: 3 } }).png().toFile(join(SCRATCH, out));
    console.log(`${f.padEnd(26)} -> ${out} ${W}x${H} at ${PPU} px/unit`);
  }
}
