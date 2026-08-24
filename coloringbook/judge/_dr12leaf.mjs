// DIME REVERSE — round 32. THE LEAVES, on the corrected stem path: how far
// each blade stands off its own stem (the PETIOLE), how big it is, which way
// it points, and what the CROWN of each branch is made of.
//
// Reports only; writes only to the gitignored judge scratch (WRITERS.md).
//
// WHY THIS EXISTS. Round 31 fixed the branch's PATH and deferred three things
// it could see at 40x but had no number for: the petioles are far too short,
// the crown pair reads as a cup, and the coin's terminal leaf is the branch's
// largest while ours is a narrow lance. `_dr9branch.mjs` measures a blade in
// isolation and `_dr11path.mjs` measures the stem; neither measures the
// RELATIONSHIP between them, which is what "the leaves sit wrong" means.
//
// THE ESTIMATOR IS NOT THIS ROUND'S. Every mask here is `_dr9branch.mjs`'s
// field-flood mask at its own per-file threshold and its own null-tested
// erosion calibration (mean error 0.00 / -0.01 against `_dr8shaft.mjs`'s
// independent seven shaft widths). `dime-rev-2.jpg` fails that null test by
// 63 units and is not opened here at all.
//
// THREE MEASUREMENTS, and each is a COMPARISON AT MATCHED EROSION rather than
// an absolute. That is deliberate: the absolute width of a mark on a proof
// depends on how much bevel skirt the flood counts as device (a factor of
// three between these two files on the stem, `torch()`'s stemHW block), but
// the same extra erosion applied to a calibrated mask of ours and of theirs
// takes the same amount off both.
//
//   1. STANDOFF. For every blade-sized blob, the smallest distance from any of
//      its points to the branch's own CENTRELINE, which `_dr11path.mjs` fitted
//      and `torch()` draws: c(y) = 15.955 - 0.02941 (y - 62.5). A sessile leaf
//      gives the stem half-width, ~1.0. A leaf on a petiole gives the stem
//      half-width plus the petiole. Measured on an eroded mask, the petiole
//      itself is gone (it is thinner than the erosion), so this reads the
//      BLADE's own standoff, which is the gap a child sees.
//   2. SIZE AND ANGLE per blob, in (offset, y) space so the two branches are
//      comparable: PCA extents, and the principal axis as degrees up from the
//      horizontal, which is the same quantity `LADDER`'s `rot` column holds.
//   3. THE CROWN, AND THE WHOLE BRANCH BELOW IT. Every device run on every row
//      from y 25 to 61, printed. A terminal leaf that is the branch's broadest
//      prints ONE wide run; two near-vertical lances with field between them
//      print TWO narrow runs, which is the tulip that got round 29 reverted.
//      Below the crown the same table answers a question no number here had
//      asked: IS THE STEM VISIBLE? On both references it is a separate run with
//      bare field on both sides from y 41 to y 61; in the drawing this round
//      inherited it was swallowed by the inboard foliage from y 43 to y 54.
//
// Run: node coloringbook/judge/_dr12leaf.mjs
import { deviceMask, branchRuns, erodeBy } from './_dr9branch.mjs';

const STEP = 0.05, X0 = 13, X1 = 87, Y0 = 17, Y1 = 85;
const W = Math.round((X1 - X0) / STEP), H = Math.round((Y1 - Y0) / STEP);

// The centreline `torch()` draws, in offset space. Copied as a FORMULA, not as
// a call into coins.js: an instrument that imports the art it is judging moves
// when the art moves, and the fit is round 31's published one either way.
const stemC = (y) => (y <= 71
  ? 15.955 - 0.02941 * (y - 62.5)
  : 15.71 - 0.0778 * (y - 71) - 0.0586 * (y - 71) ** 2);

const FILES = [
  ['dime-rev-proofbright.png', 236, 0.55],
  ['dime-rev-unc2005.png', 190, 1.00],
  ['ours', 165, 0],
];

/** blobs with standoff, recomputed from scratch so the label sets agree */
function blobStats(dev, mirror, minArea) {
  const lab = new Int32Array(W * H).fill(-1); const out = [];
  const keep = (x, y) => Math.hypot(x - 50, y - 50) < 33.0 && y > 24 && y < 63
    && (mirror ? x < 50 : x > 50) && Math.abs(x - 50) > 6.5;
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const k = j * W + i;
      if (!dev[k] || lab[k] >= 0) continue;
      if (!keep(X0 + i * STEP, Y0 + j * STEP)) { lab[k] = -2; continue; }
      const st = [k]; lab[k] = 1; const P = [];
      while (st.length) {
        const q = st.pop(); const qi = q % W, qj = (q - qi) / W;
        const x = X0 + qi * STEP, y = Y0 + qj * STEP;
        P.push([mirror ? 50 - x : x - 50, y]);
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const ni = qi + di, nj = qj + dj;
          if (ni < 0 || nj < 0 || ni >= W || nj >= H) continue;
          const nk = nj * W + ni;
          if (dev[nk] && lab[nk] < 0 && keep(X0 + ni * STEP, Y0 + nj * STEP)) { lab[nk] = 1; st.push(nk); }
        }
      }
      const area = P.length * STEP * STEP;
      if (area < minArea) continue;
      let mo = 0, my = 0; for (const [o, y] of P) { mo += o; my += y; }
      mo /= P.length; my /= P.length;
      let soo = 0, syy = 0, soy = 0;
      for (const [o, y] of P) { soo += (o - mo) ** 2; syy += (y - my) ** 2; soy += (o - mo) * (y - my); }
      const th = 0.5 * Math.atan2((2 * soy) / P.length, (soo - syy) / P.length);
      const c = Math.cos(th), s = Math.sin(th);
      let l0 = 1e9, l1 = -1e9, w0 = 1e9, w1 = -1e9;
      for (const [o, y] of P) {
        const u = (o - mo) * c + (y - my) * s, v = -(o - mo) * s + (y - my) * c;
        l0 = Math.min(l0, u); l1 = Math.max(l1, u); w0 = Math.min(w0, v); w1 = Math.max(w1, v);
      }
      // degrees UP from horizontal, undirected (0 = the blade lies across the
      // branch, 90 = it runs along it). The sign of the tip is not recoverable
      // from an undirected axis and is not claimed.
      let deg = Math.round((-th * 180) / Math.PI);
      while (deg < 0) deg += 180; while (deg >= 180) deg -= 180;
      const up = deg > 90 ? 180 - deg : deg;
      let so = 99;
      for (const [o, y] of P) so = Math.min(so, Math.abs(o - stemC(y)));
      out.push({ o: +mo.toFixed(2), y: +my.toFixed(2), area: +area.toFixed(1),
        len: +(l1 - l0).toFixed(2), wid: +(w1 - w0).toFixed(2), up, so: +so.toFixed(2) });
    }
  }
  return out.sort((a, b) => a.y - b.y);
}

if (process.argv[1] && process.argv[1].endsWith('_dr12leaf.mjs')) {
  const masks = {};
  for (const [f, T, e] of FILES) masks[f] = await deviceMask(f, T, e);

  for (const [nm, mir] of [['OLIVE (left)', true], ['OAK (right)', false]]) {
    for (const ERO of [0.8, 1.2]) {
      console.log(`\n=== ${nm} — blades at +${ERO} erosion (area >= 6 u2), top of the branch first`);
      console.log('    o,y = blob centre as offset from the axis; len x wid = PCA extents;');
      console.log('    up  = principal axis, degrees up from the horizontal (undirected);');
      console.log('    off = STANDOFF, min distance from the blob to the fitted centreline ===');
      for (const [f] of FILES) {
        const bs = blobStats(erodeBy(masks[f], ERO), mir, 6);
        console.log(`  ${f}`);
        for (const b of bs) {
          console.log(`     o ${String(b.o).padStart(6)}  y ${String(b.y).padStart(6)}  `
            + `a ${String(b.area).padStart(6)}  ${String(b.len).padStart(6)} x ${String(b.wid).padStart(5)}`
            + `  up ${String(b.up).padStart(3)}  off ${String(b.so).padStart(5)}`);
        }
        if (!bs.length) console.log('     (none)');
      }
    }
    console.log(`\n=== ${nm} — THE CROWN: every device run per row, y 25..61 ===`);
    for (let y = 25; y <= 61; y += 1) {
      const cells = FILES.map(([f]) => branchRuns(masks[f], y, mir, 0.4)
        .map(([a, b]) => `${a.toFixed(1)}-${b.toFixed(1)}`).join(' ').padEnd(30));
      console.log(`   y ${String(y).padStart(2)}  ${cells.join('| ')}`);
    }
    console.log(`         ${FILES.map(([f]) => f.slice(0, 14).padEnd(30)).join('| ')}`);
  }
}
