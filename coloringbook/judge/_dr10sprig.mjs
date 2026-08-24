// DIME REVERSE — round 30. LOOKING AT THE BRANCHES, which is the gate that
// reverted round 29 after every number said it had improved.
//
// Reports only; writes only to the gitignored judge scratch (WRITERS.md).
//
// Two things, and the first is the important one:
//
//   1. A 40x ZOOM of the olive and of the oak, ours beside the SAME disc-
//      normalised crop of both usable references, written side by side into
//      one image so they cannot be compared from memory. §0 asks whether a
//      child can recognise real currency from our pictures; that question is
//      answered by putting the pictures next to each other.
//   2. The pile: 38 / 48 / 54 / 84 px with a PINNED CONTROL rendered first
//      (the shipping quarter reverse, which this round does not touch), so a
//      render harness that has silently broken shows up before our face does.
//
// The numeric side reuses `_dr9branch.mjs` unchanged — its estimator, its
// erosion calibration and its null test are that round's, not this one's, and
// re-deriving them was explicitly out of scope.
//
// Run: node coloringbook/judge/_dr10sprig.mjs
import sharp from 'sharp';
import { join } from 'node:path';
import { SCRATCH, ROOT } from './_paths.mjs';
import { samplerFor } from './_dr2grid.mjs';
import { deviceMask, branchRuns, blobs, erodeBy } from './_dr9branch.mjs';

const PPU = 40;

/** one disc-normalised crop, as a raw RGB buffer */
async function panel(file, x0, x1, y0, y1) {
  const s = await samplerFor(file, 2400);
  const W = Math.round((x1 - x0) * PPU), H = Math.round((y1 - y0) * PPU);
  const buf = Buffer.alloc(W * H * 3);
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const v = Math.max(0, Math.min(255, Math.round(s.at(x0 + i / PPU, y0 + j / PPU))));
      const k = (j * W + i) * 3;
      buf[k] = buf[k + 1] = buf[k + 2] = v;
    }
  }
  return { buf, W, H };
}

async function sideBySide(files, x0, x1, y0, y1, out) {
  const ps = [];
  for (const f of files) ps.push(await panel(f, x0, x1, y0, y1));
  const GAP = 12;
  const W = ps.reduce((p, c) => p + c.W, 0) + GAP * (ps.length - 1);
  const H = ps[0].H;
  const buf = Buffer.alloc(W * H * 3, 40);
  let ox = 0;
  for (const p of ps) {
    for (let j = 0; j < p.H; j++) {
      p.buf.copy(buf, (j * W + ox) * 3, j * p.W * 3, (j * p.W + p.W) * 3);
    }
    ox += p.W + GAP;
  }
  await sharp(buf, { raw: { width: W, height: H, channels: 3 } })
    .resize({ width: Math.min(W, 1500) }).png().toFile(join(SCRATCH, out));
  console.log(`  ${out}  ${W}x${H}  [${files.join(' | ')}]`);
}

/** the pile, control first */
async function pile(out) {
  const { coinSVG } = await import(join(ROOT, 'src/art/coins.js'));
  const rows = [];
  for (const [denom, side] of [['quarter', 'reverse'], ['dime', 'reverse']]) {
    const tiles = [];
    for (const px of [38, 48, 54, 84]) {
      const svg = coinSVG(denom, px, { side });
      const w = Number(/width="([\d.]+)"/.exec(svg)[1]);
      const h = Number(/height="([\d.]+)"/.exec(svg)[1]);
      // render at 1x, then blow up with NEAREST so what is on the screen at
      // 38 px is what is looked at, not a resampled idealisation of it
      const one = await sharp(Buffer.from(svg), { density: 72 })
        .resize({ width: Math.round(w), height: Math.round(h) })
        .flatten({ background: '#ffffff' }).raw().toBuffer({ resolveWithObject: true });
      tiles.push({ ...one.info, d: one.data, px });
    }
    rows.push(tiles);
  }
  const Z = 6, PAD = 8;
  const CH = Math.max(...rows.flat().map((t) => t.height)) * Z + PAD * 2;
  const CW = rows[0].reduce((p, t) => p + t.width * Z + PAD * 2, 0);
  const buf = Buffer.alloc(CW * CH * rows.length * 3, 210);
  rows.forEach((tiles, r) => {
    let ox = 0;
    for (const t of tiles) {
      const oy = r * CH + PAD;
      for (let j = 0; j < t.height * Z; j++) {
        for (let i = 0; i < t.width * Z; i++) {
          const si = ((j / Z) | 0) * t.width + ((i / Z) | 0);
          const k = ((oy + j) * CW + ox + PAD + i) * 3;
          for (let c = 0; c < 3; c++) buf[k + c] = t.d[si * t.channels + c];
        }
      }
      ox += t.width * Z + PAD * 2;
    }
  });
  await sharp(buf, { raw: { width: CW, height: CH * rows.length, channels: 3 } })
    .png().toFile(join(SCRATCH, out));
  console.log(`  ${out}  control row first (quarter reverse), then dime reverse`);
}

if (process.argv[1] && process.argv[1].endsWith('_dr10sprig.mjs')) {
  const REFS = ['dime-rev-proofbright.png', 'dime-rev-unc2005.png'];
  console.log('=== 40x, ours beside both references ===');
  await sideBySide(['ours', ...REFS], 14, 40, 24, 62, '_dr10-olive.png');
  await sideBySide(['ours', ...REFS], 60, 86, 24, 62, '_dr10-oak.png');
  console.log('=== the pile ===');
  await pile('_dr10-pile.png');

  console.log('\n=== foliage rows and per-row ink (the _dr9branch estimator) ===');
  const masks = {};
  for (const [f, T, e] of [['dime-rev-proofbright.png', 236, 0.55],
    ['dime-rev-unc2005.png', 190, 1.0], ['ours', 165, 0]]) masks[f] = await deviceMask(f, T, e);
  const USE = ['dime-rev-proofbright.png', 'dime-rev-unc2005.png', 'ours'];
  for (const [nm, mir] of [['OLIVE', true], ['OAK', false]]) {
    console.log(`--- ${nm} ---`);
    for (const f of USE) {
      let first = null, last = null;
      for (let y = 22; y <= 62; y += 0.25) {
        if (branchRuns(masks[f], y, mir).some(([a, b]) => b - a >= 3.0)) {
          if (first === null) first = y; last = y;
        }
      }
      console.log(`  ${f.padEnd(26)} rows y ${first} .. ${last}   span ${(last - first).toFixed(2)}`);
    }
    console.log('     y  ' + USE.map((f) => f.slice(0, 11).padStart(12)).join(''));
    for (let y = 24; y <= 64; y += 2) {
      console.log(`    ${String(y).padStart(2)}  ` + USE.map((f) => branchRuns(masks[f], y, mir)
        .reduce((p, [a, b]) => p + b - a, 0).toFixed(1).padStart(12)).join(''));
    }
    console.log('  --- does it break into pieces? blobs >= 8 u2 at +1.2 erosion ---');
    for (const f of USE) {
      const bs = blobs(erodeBy(masks[f], 1.2), mir, 8);
      console.log(`   ${f.padEnd(26)} ${bs.length} pieces  ` +
        bs.map((b) => `(${b.cx},${b.cy}) a${b.area} ${b.len}x${b.wid}`).join('  '));
    }
    console.log('  --- small bodies, 0.8..8 u2 at +1.0 erosion ---');
    for (const f of USE) {
      const bs = blobs(erodeBy(masks[f], 1.0), mir, 0.8).filter((b) => b.area <= 8);
      console.log(`   ${f.padEnd(26)} ` + (bs.map((b) => `(${b.cx},${b.cy}) ${b.len}x${b.wid} a${b.area}`).join('  ') || '(none)'));
    }
  }
  console.log('\n=== the neighbourhood at y 57: acorn | field | stem, on the OAK ===');
  for (const f of USE) {
    console.log(`  ${f.padEnd(26)} ` + JSON.stringify(branchRuns(masks[f], 57, false, 0.5)));
  }
}
