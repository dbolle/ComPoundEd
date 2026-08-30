// _dr21target.mjs — DECOMPOSE A WINDOW'S FILL DENOMINATOR INTO ITS MARKS.
//
// ── THE PROBLEM THIS EXISTS FOR (ledger A41) ────────────────────────────────
// `_dr13elem.mjs` reports FILL as `our ink ∩ target ÷ target`, where the target
// is the coin's own device mask inside a declared rectangle. That reads like a
// percentage grade out of 100, and three rounds in a row have treated it as
// one. It is not. A window is a RECTANGLE and the coin's marks are not; a
// window drawn around a thin stem also contains the foliage standing above it,
// and no stem can ever fill that. The oak-stem round measured the gap: of the
// `oak-stem` window's exclusive target, only 53.81 of 125.78 sq units on
// proofbright (29.18 of 84.87 on unc2005) lies within a stem half-width of the
// coin's own centreline, and 68 % / 73 % of the target sits above y 54 where
// the leaves are. The shipped stem's 37.58 % / 28.94 % is therefore **88 % and
// 84 % of the maximum a perfect stem could score** — a good element reading as
// a failing grade.
//
// The fix is not a better window. It is to stop quoting a denominator nobody
// has looked inside. This instrument opens it: it takes the same mask, the same
// window and the same exclusive subtraction as `_dr13elem.mjs score`, then
// splits what remains into CONNECTED COMPONENTS and lists them by area.
//
// What that buys you:
//   • A ceiling. If the target is one 54-unit component and six leaf blobs, an
//     element that IS the first component is done at 43 %, and the judge can
//     say so with the components in front of them instead of asking for 100.
//   • A census. On the oak, the components ARE the coin's marks. That is how
//     you count leaves without deciding in advance how many there should be —
//     and it is worth knowing that this method is what produced the "seven
//     leaves a side" number that ruling R5 overturned. A component count is a
//     count of what the flood mask leaves SEPARATE at this threshold, which is
//     a lower bound on the marks and an upper bound on nothing. Two leaves that
//     touch are one component. Report it as evidence, never as the answer;
//     ledger E25 is exactly this failure one level down.
//
// ── WHAT IT IS NOT ─────────────────────────────────────────────────────────
// It does not score our drawing and it takes no view of whether an element is
// right. It describes the TARGET only. Our ink enters just once, in the
// exclusive subtraction, and only to remove what other elements already own.
//
// ── DEFAULTS THAT MATTER ───────────────────────────────────────────────────
// `--erode 0` is the default here, not 0.55/1.00. The mask's calibrated erosion
// was fitted on the 5–10 unit torch shaft (ledger A40); on the ~2-unit marks
// this instrument is usually pointed at, it deletes the thing being counted. A
// component census at the shaft's erosion is a census of the mask.
//
// Registration is whatever `samplerFor()` holds for the file — proofbright
// +0.35, unc2005 −0.75. Do not re-apply it here.
//
// Instruments report; this one writes nothing unless you pass `--png`, and then
// only to `_dr21-<window>.png` inside `coloringbook/judge/`.
//
// USAGE
//   node coloringbook/judge/_dr21target.mjs <window> [options]
//   node coloringbook/judge/_dr21target.mjs --windows        # list the windows
//
//   --ref proofbright|unc2005   which photograph          (default proofbright)
//   --erode <units>             mask erosion per side              (default 0)
//   --reopen <sqUnits>          restore enclosed field ≥ this area (default 0;
//                               1.0 on proofbright — NOT on unc2005, where the
//                               same threshold reopens the torch flame)
//   --device <ids>              comma list of node ids counted as OTHER marks
//                               (default: every leaf under node 2, plus 4,5,6)
//   --keep <ids>                node ids NOT subtracted — the element(s) under
//                               consideration. Omit to see the raw target.
//   --min <sqUnits>             components below this are speckle  (default 0.5)
//   --win x0,x1,y0,y1           an ad-hoc window instead of a declared name;
//                               pass `-` as the window argument to use it
//   --png                       write a coloured component map
import sharp from 'sharp';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolve as resolve_ } from 'node:path';
import { JUDGE } from './_paths.mjs';
import { deviceMask } from './_dr9branch.mjs';
import { nodes, childrenOf, resolve, reopen } from './_dr13elem.mjs';
import { coinSVG } from '../../src/art/coins.js';

const X0 = 13, X1 = 87, Y0 = 17, Y1 = 85, STEP = 0.05;
const MW = Math.round((X1 - X0) / STEP), MH = Math.round((Y1 - Y0) / STEP);
const PPU = 1 / STEP;
const CELL = STEP * STEP;

const REFS = {
  proofbright: ['dime-rev-proofbright.png', 236],
  unc2005: ['dime-rev-unc2005.png', 190],
};

// Kept in step with `_dr13elem.mjs` BY COPY. The original reason given here —
// "that file's table is hashed into published rounds" — was WRONG, the same
// false premise as ledger A43: `_dr13elem.mjs` is absent from the frozen
// manifest and its hash is cited nowhere. The copy is kept anyway, for the
// honest reason: this instrument's numbers should not silently move because
// somebody edited a table in another file. But a copy that nobody compares is
// just a second constant waiting to disagree, and this one DID — it still read
// `oak-branch` as [55, 85, 25, 78] after `_dr13elem` was corrected.
//
// So `--windows` now actually does what this comment always claimed: it loads
// the other table and reports every divergence, exiting non-zero if any exist.
const WINDOWS = {
  flame: [42, 59.5, 17, 33],
  head: [41, 59, 31, 40],
  shaft: [43, 57, 38.5, 73.5],
  foot: [42, 58, 73.5, 81],
  'olive-branch': [15, 45, 25, 78],
  'oak-branch': [58, 82, 25, 61],   // corrected with _dr13elem's, ledger A43
  'oak-stem': [62, 70, 36, 78],
  'olive-stem': [30, 38, 36, 78],
  acorn: [54, 65, 52, 63],
  legend: [13, 87, 17, 85],
};

const arg = (name, dflt) => {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : dflt;
};
const has = (name) => process.argv.includes(name);

async function rasterise(doc) {
  const full = Math.round(100 * PPU);
  const { data, info } = await sharp(Buffer.from(doc))
    .resize(full, full, { fit: 'fill' })
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const ink = new Uint8Array(MW * MH);
  const ch = info.channels;
  for (let j = 0; j < MH; j++) {
    const sy = Math.round((Y0 + j * STEP) * PPU);
    if (sy < 0 || sy >= info.height) continue;
    for (let i = 0; i < MW; i++) {
      const sx = Math.round((X0 + i * STEP) * PPU);
      if (sx < 0 || sx >= info.width) continue;
      if (data[(sy * info.width + sx) * ch + ch - 1] > 24) ink[j * MW + i] = 1;
    }
  }
  return ink;
}

/** every leaf (non-<g>) node id under `id`, depth-first */
function leavesUnder(head, out, id) {
  const parts = String(id).split('.').map(Number);
  let list = out, node = null;
  for (const p of parts) {
    node = list[p];
    if (node === undefined) return [];
    if (node.startsWith('<g')) list = childrenOf(node).kids;
  }
  if (!node.startsWith('<g')) return [String(id)];
  const kids = childrenOf(node).kids;
  return kids.flatMap((_, k) => leavesUnder(head, out, `${id}.${k}`));
}

/** 4-connected components of a 0/1 grid, largest first */
function components(grid) {
  const seen = new Uint8Array(MW * MH), out = [];
  for (let k0 = 0; k0 < MW * MH; k0++) {
    if (!grid[k0] || seen[k0]) continue;
    const st = [k0]; seen[k0] = 1;
    let n = 0, x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, sx = 0, sy = 0;
    const cells = [];
    while (st.length) {
      const c = st.pop(), i = c % MW, j = (c - i) / MW;
      n++; cells.push(c); sx += i; sy += j;
      if (i < x0) x0 = i; if (i > x1) x1 = i;
      if (j < y0) y0 = j; if (j > y1) y1 = j;
      for (const d of [1, -1, MW, -MW]) {
        const m = c + d;
        if (m < 0 || m >= MW * MH) continue;
        if (d === 1 && i === MW - 1) continue;
        if (d === -1 && i === 0) continue;
        if (grid[m] && !seen[m]) { seen[m] = 1; st.push(m); }
      }
    }
    out.push({
      area: n * CELL, cells,
      x: [X0 + x0 * STEP, X0 + x1 * STEP],
      y: [Y0 + y0 * STEP, Y0 + y1 * STEP],
      cx: X0 + (sx / n) * STEP, cy: Y0 + (sy / n) * STEP,
    });
  }
  return out.sort((a, b) => b.area - a.area);
}

const IS_MAIN = process.argv[1]
  && import.meta.url === pathToFileURL(resolve_(process.argv[1])).href;

if (IS_MAIN) {
  if (has('--windows')) {
    const { readFileSync } = await import('node:fs');
    const other = readFileSync(join(JUDGE, '_dr13elem.mjs'), 'utf8');
    console.log('declared windows (x0 x1 y0 y1), compared against _dr13elem.mjs:');
    const diverged = [];
    for (const [k, w] of Object.entries(WINDOWS)) {
      const m = new RegExp(`['"\`]?${k.replace(/[-/]/g, '\\$&')}['"\`]?\\s*:\\s*\\[([^\\]]+)\\]`).exec(other);
      const theirs = m ? m[1].split(',').map((v) => Number(v.trim())) : null;
      const same = theirs && theirs.length === 4 && theirs.every((v, i) => v === w[i]);
      console.log(`  ${k.padEnd(14)} ${w.join('  ').padEnd(24)} ${
        theirs === null ? '(not in _dr13elem)' : same ? 'agrees' : `DIVERGED: _dr13elem has ${theirs.join('  ')}`}`);
      if (theirs && !same) diverged.push(k);
    }
    if (diverged.length) {
      console.error(`\n${diverged.length} window(s) disagree with _dr13elem.mjs: ${diverged.join(', ')}`);
      console.error('A copied constant that nobody compares is a second constant. Reconcile them.');
      process.exit(1);
    }
    console.log('\nevery window agrees with _dr13elem.mjs');
    process.exit(0);
  }

  const winName = process.argv[2];
  // AN AD-HOC WINDOW IS ALLOWED, AND IT IS NOT A SHORTCUT. The declared windows
  // are coarse on purpose, and two of them are coarse enough to change the
  // answer here: `oak-branch` runs to y 78 and x 85, so its target sweeps in
  // the coin's ONE DIME legend (a row of components at y 61.8..67) and the rim
  // band beyond x 82. Those are marks, so they are real components — they are
  // just not the branch's. Naming the sub-window you actually mean is better
  // than reading a census that answers a different question.
  const win = winName === '-' || has('--win')
    ? String(arg('--win', '')).split(',').map(Number)
    : WINDOWS[winName];
  if (!win || win.length !== 4 || win.some((v) => !Number.isFinite(v))) {
    console.error(`unknown window: ${winName ?? '(none given)'}\nrun with --windows to list them`);
    process.exit(2);
  }
  const refKey = arg('--ref', 'proofbright');
  const ref = REFS[refKey];
  if (!ref) { console.error(`unknown --ref ${refKey}`); process.exit(2); }
  const [refFile, refT] = ref;
  const erode = Number(arg('--erode', '0'));
  const reopenMin = Number(arg('--reopen', '0'));
  const minArea = Number(arg('--min', '0.5'));
  const keep = new Set(String(arg('--keep', '')).split(',').filter(Boolean));

  const svg = coinSVG('dime', 380, { side: 'reverse' });
  const { head, out } = nodes(svg);

  const deviceIds = has('--device')
    ? String(arg('--device', '')).split(',').filter(Boolean)
    : [...leavesUnder(head, out, '2'), '4', '5', '6'];

  let mask = await deviceMask(refFile, refT, erode);
  if (reopenMin > 0) mask = await reopen(mask, refFile, refT, reopenMin);

  // window stencil
  const inWin = new Uint8Array(MW * MH);
  for (let j = 0; j < MH; j++) {
    const y = Y0 + j * STEP;
    if (y < win[2] || y > win[3]) continue;
    for (let i = 0; i < MW; i++) {
      const x = X0 + i * STEP;
      if (x >= win[0] && x <= win[1]) inWin[j * MW + i] = 1;
    }
  }

  // OTHER marks: every device node except those named by --keep
  const others = new Uint8Array(MW * MH);
  const subtracted = [];
  for (const id of deviceIds) {
    if (keep.has(id)) continue;
    const frag = resolve(head, out, id);
    if (!frag) continue;
    const ink = await rasterise(`${head}${frag}</svg>`);
    let touch = 0;
    for (let k = 0; k < MW * MH; k++) if (ink[k]) { others[k] = 1; if (inWin[k] && mask[k]) touch++; }
    if (touch) subtracted.push([id, touch * CELL]);
  }

  const raw = new Uint8Array(MW * MH), exc = new Uint8Array(MW * MH);
  let rawN = 0, excN = 0;
  for (let k = 0; k < MW * MH; k++) {
    if (!inWin[k] || !mask[k]) continue;
    raw[k] = 1; rawN++;
    if (!others[k]) { exc[k] = 1; excN++; }
  }

  const comps = components(exc);
  const big = comps.filter((c) => c.area >= minArea);
  const speck = comps.length - big.length;
  const speckArea = comps.filter((c) => c.area < minArea).reduce((s, c) => s + c.area, 0);

  console.log(`window ${has('--win') ? `--win ${win.join(',')}` : winName}  x ${win[0]}..${win[1]}  y ${win[2]}..${win[3]}`);
  console.log(`ref ${refFile}  T ${refT}  erode ${erode}  reopen ${reopenMin}  min ${minArea}`);
  console.log(`kept (not subtracted): ${keep.size ? [...keep].join(', ') : '(none — this is the RAW target)'}`);
  console.log(`\nTARGET  raw ${rawN * CELL} sq units   exclusive ${(excN * CELL).toFixed(2)} sq units`
    + `   ceded to other marks ${((rawN - excN) * CELL).toFixed(2)}`);

  if (subtracted.length) {
    console.log('\nwho took the ceded target (node → sq units of this window\'s mask it draws):');
    for (const [id, a] of subtracted.sort((x, y2) => y2[1] - x[1]).slice(0, 12)) {
      console.log(`  ${id.padStart(7)}  ${a.toFixed(2)}`);
    }
  }

  console.log(`\nCOMPONENTS of the exclusive target, ≥ ${minArea} sq units, largest first`);
  console.log('    #     area   share   cum      x range        y range        centroid');
  let cum = 0;
  big.forEach((c, i) => {
    cum += c.area;
    console.log(`  ${String(i + 1).padStart(3)}  ${c.area.toFixed(2).padStart(7)}`
      + `  ${((100 * c.area) / (excN * CELL)).toFixed(1).padStart(5)}%`
      + `  ${((100 * cum) / (excN * CELL)).toFixed(1).padStart(5)}%`
      + `   ${c.x[0].toFixed(2).padStart(5)}..${c.x[1].toFixed(2).padEnd(5)}`
      + `  ${c.y[0].toFixed(2).padStart(5)}..${c.y[1].toFixed(2).padEnd(5)}`
      + `  ${c.cx.toFixed(2)}, ${c.cy.toFixed(2)}`);
  });
  console.log(`\n  ${big.length} component(s) at or above ${minArea} sq units`
    + `; ${speck} below, totalling ${speckArea.toFixed(2)} sq units `
    + `(${((100 * speckArea) / (excN * CELL)).toFixed(1)} % of the exclusive target).`);
  console.log('\nREAD THIS AS A CEILING, NOT A COUNT. An element that fully occupies the');
  console.log('largest component scores that component\'s share, and no more — that share');
  console.log('is the highest FILL a correct drawing of it can reach. The component COUNT');
  console.log('is a lower bound on the coin\'s marks: two marks that touch are one');
  console.log('component (ledger E25), and this is the method that produced the "seven');
  console.log('leaves a side" number ruling R5 overturned.');

  if (has('--png')) {
    const RGB = [[200, 40, 40], [40, 110, 200], [40, 160, 70], [200, 130, 20],
      [140, 60, 180], [0, 150, 150], [190, 60, 130], [110, 110, 40]];
    const b = Buffer.alloc(MW * MH * 3, 255);
    for (let k = 0; k < MW * MH; k++) if (raw[k]) { b[k * 3] = 225; b[k * 3 + 1] = 225; b[k * 3 + 2] = 225; }
    big.forEach((c, i) => {
      const [r, g, bl] = RGB[i % RGB.length];
      for (const k of c.cells) { b[k * 3] = r; b[k * 3 + 1] = g; b[k * 3 + 2] = bl; }
    });
    const p = join(JUDGE, `_dr21-${winName === '-' ? 'adhoc' : winName}-${refKey}.png`);
    await sharp(b, { raw: { width: MW, height: MH, channels: 3 } }).png().toFile(p);
    console.log(`\nwrote ${p}`);
  }
}
