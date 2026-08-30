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
// ⚠️ THE unc2005 EROSION IS 0.37, NOT 1.00 — RE-BASELINED 2026-08-30 (ledger A40).
// The 1.00 was fitted on the 5-10 unit torch shaft. Measured across 609
// field->device transitions on this branch, unc2005's median 10-90 % edge rise
// is 0.400 units, against the ~1.08 that would justify 1.00 — so the old
// constant was 2.7x the file's own edges and was not removing a skirt, it was
// shrinking the coin. On the locked oak stem it cost 37.96 points of OUTSIDE
// (70.75 % at 1.00 against proofbright's 32.79 % at its well-calibrated 0.55;
// 38.45 % at 0.37). proofbright's 0.55 measures 1.01x its own median rise and
// is UNCHANGED. Every unc2005 number published before this date was measured
// at 1.00 and is not comparable — re-derive rather than compare.
  ['dime-rev-proofbright.png', 236, 0.55],
  ['dime-rev-unc2005.png', 190, 0.37],
  ['ours', 165, 0],
];

// The default window is the whole leafy span of one branch. `ACORN` narrows it
// to the patch of field the acorn sits in — see section 4 below.
const BRANCH = { y0: 24, y1: 63, o0: 6.5, o1: 99 };
const ACORN = { y0: 52, y1: 64, o0: 4.0, o1: 15.0 };
/** blobs with standoff, recomputed from scratch so the label sets agree */
function blobStats(dev, mirror, minArea, win = BRANCH) {
  const lab = new Int32Array(W * H).fill(-1); const out = [];
  const keep = (x, y) => Math.hypot(x - 50, y - 50) < 33.0 && y > win.y0 && y < win.y1
    && (mirror ? x < 50 : x > 50)
    && Math.abs(x - 50) > win.o0 && Math.abs(x - 50) < win.o1;
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

  // 4. THE ACORN, WHICH THIS ROUND FAMILY HAS NOW BROKEN TWICE. Round 28
  //    deleted it, v1.84.1 restored it, and 818817d merged it into the leaf
  //    above by lengthening the oak's petioles. It is the smallest object on
  //    this face and every window above excludes it — `BRANCH` starts at
  //    offset 6.5 and needs 6 u2, and the acorn is ~14 u2 at offset 9. So it
  //    gets its own window and its own minimum, and the test is not "is there
  //    ink there" but "is it a SEPARATE COMPONENT": coverage is not
  //    identification, which is the argument v1.84.1 had to overturn.
  //    Both references carry it (proofbright (9.5, 57.1) 6.16 x 3.85,
  //    unc2005 (8.4, 57.9) 3.53 x 2.76) and so must we.
  console.log('\n=== 4. THE ACORN NEIGHBOURHOOD — oak only, offset 4..15, y 52..64,');
  console.log('    components of area >= 1 u2. TWO objects is the pass: the lowest');
  console.log('    inboard leaf, and the acorn below and inboard of it. ONE means');
  console.log('    they have merged, which is the v1.84.1 regression ===');
  for (const ERO of [0, 0.3, 0.6]) {
    console.log(`  +${ERO} erosion`);
    for (const [f] of FILES) {
      const bs = blobStats(ERO ? erodeBy(masks[f], ERO) : masks[f], false, 1.0, ACORN);
      console.log(`    ${f.padEnd(26)} ${bs.length} object(s)  `
        + (bs.map((b) => `(${b.o}, ${b.y}) ${b.len}x${b.wid} a${b.area}`).join('  ') || '(none)'));
    }
  }

  // 5. IS THE CROWN BLOB ONE BLADE OR A CLUSTER? This decides whether its PCA
  //    width may be quoted as a blade width — round 33 quoted it as one, drew
  //    the terminal 1.35x broad on the strength of it, and had to retract. A
  //    cluster whose members overlap never splits under erosion; it just
  //    shrinks. Printed as a ladder so the reader can see which it is.
  console.log('\n=== 5. THE CROWN BLOB UNDER DEEPENING EROSION, y 24..40. A blade');
  console.log('    shrinks and stays one component; so does a cluster of OVERLAPPING');
  console.log('    blades — so a stable single component is NOT evidence of one blade,');
  console.log('    and the per-row runs in section 3 are what must settle it ===');
  for (const [nm, mir] of [['OLIVE', true], ['OAK', false]]) {
    for (const [f] of FILES) {
      const row = [1.2, 1.6, 2.0, 2.4].map((e) => {
        const bs = blobStats(erodeBy(masks[f], e), mir, 2, { y0: 24, y1: 40, o0: 6.5, o1: 99 });
        return `+${e}: ${bs.length}x [${bs.map((b) => `${b.len}x${b.wid}`).join(' ')}]`;
      });
      console.log(`  ${nm.padEnd(6)} ${f.padEnd(26)} ${row.join('  ')}`);
    }
  }
}
