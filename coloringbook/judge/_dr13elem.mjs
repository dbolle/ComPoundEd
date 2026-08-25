// ONE ELEMENT AT A TIME, AGAINST THE COIN'S OWN MASK.
//
// The owner, 2026-08-25: "have specialists focus on one drawn element at a
// time. Have the measure of success be that the element they draw doesn't go
// outside the mask while at the same time a visual inspection of that element
// by itself fills the intended portion of the mask. Look at each element
// individually, by itself."
//
// WHY THIS EXISTS. Four rounds on the dime reverse judged the whole face, and
// three were reverted after a look — twice while T1 ROSE. Judging a face is
// judging a sum, and a sum hides which term is wrong: the round that drew a TV
// aerial and the round that drew a tulip both improved the total. An element
// scored alone cannot hide inside a sum.
//
// THE MASK is `deviceMask()` from `_dr9branch.mjs`, unchanged and re-used, not
// re-derived: field flooded inward from the border so interior holes stay
// device, calibrated against the torch shaft's known width and null-tested
// against a wholly different estimator to mean error 0.00. It is already in
// VIEWBOX COORDINATES — x 13..87, y 17..85 at 0.05 units — which is why an
// element's own path coordinates can be compared to it directly.
//
// `dime-rev-proofbright.png` is the reference: it is the only file whose mask
// carries the whole device including the legends. `dime-rev-unc2005.png` is
// available as a second opinion. `dime-rev-2.jpg` FAILS the mask's own null
// test by 63 units and is never opened.
//
// THE TWO NUMBERS, and they answer different questions:
//
//   OUTSIDE  — of the element's own ink, what fraction falls where the coin
//              has no device at all? This is the "does not go outside the
//              mask" test. It is scored against the WHOLE mask, because ink
//              that lands on a neighbouring feature is still ink the coin does
//              not have HERE.
//
//   FILL     — of the mask inside this element's declared window, what
//              fraction does the element cover? This is the "fills the intended
//              portion" test. A drawing can score 0% outside by being tiny;
//              FILL is what stops that.
//
// Neither is a pass/fail on its own and neither is a score to maximise. A leaf
// drawn 40% too small can read 0.0% outside; a leaf drawn as a blob can read
// 100% fill. **The picture is still the gate** — every run writes the element
// alone, its target alone, and the two overlaid, at 20 px per viewBox unit.
//
// THE WINDOW IS A DECLARATION, NOT A MEASUREMENT. It says only "this element
// belongs in this part of the coin". It is deliberately coarse; the mask inside
// it supplies the precision. A window that is wrong makes FILL meaningless, so
// each one is listed below with the element it bounds and must be read before
// it is trusted.
//
// usage:
//   node _dr13elem.mjs list                 every drawable node, with its bbox
//   node _dr13elem.mjs sheet                a contact sheet of all nodes
//   node _dr13elem.mjs score <idx|name>     the two numbers + the three panels
//   node _dr13elem.mjs score <idx> --ref unc2005
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { join, resolve as resolve_ } from 'node:path';
import { pathToFileURL } from 'node:url';
import { JUDGE } from './_paths.mjs';
import { deviceMask } from './_dr9branch.mjs';
import { coinSVG } from '../../src/art/coins.js';

const X0 = 13, X1 = 87, Y0 = 17, Y1 = 85, STEP = 0.05;
const MW = Math.round((X1 - X0) / STEP), MH = Math.round((Y1 - Y0) / STEP);
const PPU = 1 / STEP; // 20 px per viewBox unit — the mask's own resolution

const REFS = {
  proofbright: ['dime-rev-proofbright.png', 236, 0.55],
  unc2005: ['dime-rev-unc2005.png', 190, 1.00],
};

// ── declared windows. Coarse on purpose; the mask inside supplies precision.
const WINDOWS = {
  // x1 was 58 and the coin's flame reaches 58.75 on proofbright (its tongue E),
  // so FILL's denominator was short on the right. Found by the flame round,
  // which also confirmed that blob IS flame and not an oak leaf.
  flame: [42, 59.5, 17, 33],
  head: [41, 59, 31, 40],
  // y0 was 38 and y1 was 71, and the window tiled with NEITHER neighbour.
  // Below: the foot round moved WINDOWS.foot's top to 73.50 on the finding that
  // the coin's shaft narrows monotonically to there, so y 71..73.50 — 13.30 sq
  // units of mask on proofbright, 11.79 on unc2005 — was shaft in no element's
  // window at all. Above: the drawn collar (node 2.1.1) ends at y 38.50 and
  // WINDOWS.head already runs to y 40, so y 38..38.50 was both double-counted
  // and unreachable by the shaft, which does not start until 38.50; measured,
  // the collar's own ink claims 5.08 sq units of it on pb and 4.63 on unc.
  // Now [38.50, 73.50]: head | shaft | foot meet edge to edge at the y where
  // one drawn element hands over to the next. Found by the shaft round, which
  // also reports that WINDOWS.head's y1 of 40 still overlaps this window by
  // 1.5 units — that overlap is the HEAD's to close, not the shaft's.
  shaft: [43, 57, 38.5, 73.5],
  // y0 was 69, and 47% of FILL's denominator was then SHAFT. Scanned at the
  // mask's own 0.25 units, the coin's shaft narrows monotonically to y 73.50
  // (proofbright, 5.00 wide) / y 74.25 (unc2005, 4.30) and only then flares
  // into the foot's bead. Mask in y 69..73.5, x 42..58 is 25.12 sq units of
  // 53.30 on proofbright and 21.63 of 46.86 on unc2005 — and the DRAWN SHAFT
  // node already covers 23.57 and 21.11 of it, i.e. 94% and 98%. It was never
  // the foot's to fill and no foot could fill it without drawing over the
  // shaft. Found by the foot round. The bottom edge is left coarse at 81:
  // the foot's mask ends at y 78.50 (pb) / 79.00 (unc) and the band y 80.5..81
  // carries 0.11 sq units of branch tip on pb and 0.00 on unc — ONE DIME's
  // own mask starts at y 81.75, below this window, so no letter is in it.
  foot: [42, 58, 73.5, 81],
  'olive-branch': [15, 45, 25, 78],
  'oak-branch': [55, 85, 25, 78],
  acorn: [54, 65, 52, 63],
  legend: [13, 87, 17, 85],
};

const svgOf = () => coinSVG('dime', 380, { side: 'reverse' });

/** split the emitted SVG into top-level drawable nodes, balanced on <g> */
export function nodes(svg) {
  const head = svg.slice(0, svg.indexOf('>') + 1);
  const body = svg.slice(head.length, svg.lastIndexOf('</svg>'));
  const out = [];
  let i = 0;
  while (i < body.length) {
    const lt = body.indexOf('<', i);
    if (lt < 0) break;
    if (body.startsWith('<g', lt)) {
      let d = 0, j = lt;
      while (j < body.length) {
        if (body.startsWith('<g', j)) d++;
        else if (body.startsWith('</g>', j)) { d--; if (d === 0) { j += 4; break; } }
        j++;
      }
      out.push(body.slice(lt, j)); i = j;
    } else {
      const m = /^<(path|rect|ellipse|circle|text|polygon|polyline)\b/.exec(body.slice(lt));
      if (!m) { i = lt + 1; continue; }
      const tag = m[1];
      const close = body.indexOf(`</${tag}>`, lt);
      const selfEnd = body.indexOf('/>', lt);
      const gt = body.indexOf('>', lt);
      let end;
      if (selfEnd >= 0 && selfEnd < gt) end = selfEnd + 2;
      else if (close >= 0) end = close + tag.length + 3;
      else end = gt + 1;
      out.push(body.slice(lt, end)); i = end;
    }
  }
  return { head, out };
}

/** children of a <g> block, with its own opening tag so transforms survive */
export function childrenOf(gBlock) {
  const openEnd = gBlock.indexOf('>') + 1;
  const open = gBlock.slice(0, openEnd);
  const inner = gBlock.slice(openEnd, gBlock.lastIndexOf('</g>'));
  return { open, kids: nodes(`<svg>${inner}</svg>`).out };
}

/**
 * Resolve a dotted index path ("2", "2.5", "2.5.1") to the SVG fragment that
 * draws THAT node and nothing else. Ancestor <g> opening tags are kept and
 * re-closed, because a leaf's position lives in its parents' transforms — drop
 * them and the element renders at the origin, which would look like a placement
 * defect that is really an instrument defect.
 */
export function resolve(head, top, pathStr) {
  const parts = String(pathStr).split('.').map(Number);
  let list = top, open = [], node = null;
  for (const p of parts) {
    if (!Number.isInteger(p) || p < 0 || p >= list.length) return null;
    node = list[p];
    if (!node.startsWith('<g')) { list = []; continue; }
    const c = childrenOf(node);
    open.push(c.open); list = c.kids;
  }
  // if the final node is a group we render the whole group; otherwise wrap it
  const wrap = node.startsWith('<g') ? open.slice(0, -1) : open;
  return wrap.join('') + node + wrap.map(() => '</g>').join('');
}

/** rasterise a COMPLETE svg document onto the mask grid */
async function inkOfDoc(doc) { return rasterise(doc); }

/** rasterise one node alone onto the mask's exact grid; returns a 0/1 array */
async function inkOf(head, node) {
  return rasterise(`${head}${node}</svg>`);
}

async function rasterise(one) {
  const full = Math.round(100 * PPU); // whole viewBox at mask resolution
  const { data, info } = await sharp(Buffer.from(one))
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

const bboxOf = (a) => {
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, n = 0;
  for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) if (a[j * MW + i]) {
    n++; if (i < x0) x0 = i; if (i > x1) x1 = i; if (j < y0) y0 = j; if (j > y1) y1 = j;
  }
  if (!n) return null;
  return { n, x: [+(X0 + x0 * STEP).toFixed(1), +(X0 + x1 * STEP).toFixed(1)],
    y: [+(Y0 + y0 * STEP).toFixed(1), +(Y0 + y1 * STEP).toFixed(1)] };
};

const png = (layers) => {
  const b = Buffer.alloc(MW * MH * 3, 255);
  for (const [arr, rgb] of layers) {
    for (let k = 0; k < MW * MH; k++) if (arr[k]) { b[k * 3] = rgb[0]; b[k * 3 + 1] = rgb[1]; b[k * 3 + 2] = rgb[2]; }
  }
  return sharp(b, { raw: { width: MW, height: MH, channels: 3 } });
};

function resolveTag(head, top, pathStr) {
  const parts = String(pathStr).split('.').map(Number);
  let list = top, node = null;
  for (const p of parts) { node = list[p]; if (node && node.startsWith('<g')) list = childrenOf(node).kids; }
  return node || '<?';
}

// AN INSTRUMENT MUST NOT RUN WHEN IT IS IMPORTED. Without this guard, any
// module that imports `nodes`/`resolve` to isolate an element executes the CLI
// as a side effect and prints a node listing into the middle of its own output.
// Caught 2026-08-25 when the judge imported it to measure the shaft alone; the
// same defect that made deploy/sync-server.mjs bind a port on every test run.
const IS_MAIN = process.argv[1]
  && import.meta.url === pathToFileURL(resolve_(process.argv[1])).href;
if (!IS_MAIN) { /* imported: expose helpers only */ } else {

const mode = process.argv[2] || 'list';
const refKey = (process.argv.includes('--ref') ? process.argv[process.argv.indexOf('--ref') + 1] : 'proofbright');
const [refFile, refT, refE] = REFS[refKey] ?? REFS.proofbright;

const svg = svgOf();
const { head, out } = nodes(svg);

// `list 2` descends into node 2 and lists ITS children as 2.0, 2.1, ...
const under = (mode === 'list' || mode === 'sheet') && process.argv[3] && /^[\d.]+$/.test(process.argv[3]) ? process.argv[3] : null;
let ids = out.map((_, k) => String(k));
if (under) {
  const blk = resolve(head, out, under);
  const top = under.split('.').map(Number).reduce((L, p, i, arr) => {
    const n = L[p];
    return i === arr.length - 1 ? n : childrenOf(n).kids;
  }, out);
  if (!top || !String(top).startsWith('<g')) { console.error(`node ${under} is not a group`); process.exit(2); }
  ids = childrenOf(top).kids.map((_, k) => `${under}.${k}`);
}

if (mode === 'list' || mode === 'sheet') {
  console.log(`${ids.length} drawable nodes${under ? ` under ${under}` : ''} in dime reverse\n`);
  const thumbs = [];
  for (const id of ids) {
    const frag = resolve(head, out, id);
    const ink = await inkOf(head, frag);
    const bb = bboxOf(ink);
    const tag = /^<(\w+)/.exec(frag.slice(frag.lastIndexOf('<g') >= 0 ? 0 : 0)) && /^<(\w+)/.exec(resolveTag(head, out, id));
    console.log(`  ${id.padStart(6)}  ${(tag ? tag[1] : '?').padEnd(8)} ${bb ? `x ${bb.x[0]}..${bb.x[1]}  y ${bb.y[0]}..${bb.y[1]}  ink ${(bb.n * STEP * STEP).toFixed(1)}` : '(empty)'}`);
    if (mode === 'sheet' && bb) thumbs.push(await png([[ink, [40, 60, 150]]]).resize(140, null).png().toBuffer());
  }
  if (mode === 'sheet') {
    const cols = 8, w = 140, h = Math.round(140 * MH / MW);
    const comp = thumbs.map((t, i) => ({ input: t, left: (i % cols) * w, top: Math.floor(i / cols) * h }));
    await sharp({ create: { width: cols * w, height: Math.ceil(thumbs.length / cols) * h, channels: 3, background: '#fff' } })
      .composite(comp).png().toFile(join(JUDGE, '_dr13-sheet.png'));
    console.log('\nwrote _dr13-sheet.png');
  }
  process.exit(0);
}

if (mode === 'score') {
  const sel = process.argv[3];
  const frag = resolve(head, out, sel);
  if (!frag) { console.error(`no such node: ${sel} (run \`list\` first)`); process.exit(2); }
  const idx = sel;
  const win = WINDOWS[process.argv[4]] ?? null;
  const mask = await deviceMask(refFile, refT, refE);
  const ink = await inkOf(head, frag);

  let inkN = 0, outN = 0;
  for (let k = 0; k < MW * MH; k++) if (ink[k]) { inkN++; if (!mask[k]) outN++; }

  // EXCLUSIVE TARGET — mask in the window that NO OTHER ELEMENT DRAWS.
  //
  // The shaft round found 41.65 sq units of its "unfilled" target — 12 FILL
  // points — was mask belonging to the olive branch crossing it and to
  // E PLURIBUS UNUM standing against it. The shaft could not have filled that
  // without drawing over its neighbours, so the raw denominator was charging it
  // for someone else's ink. On the branches, where the overlap is heaviest,
  // that error would be larger still, and a specialist chasing it would
  // over-draw — which is exactly how earlier whole-face rounds produced a tulip
  // and a TV aerial.
  //
  // So FILL is reported twice: RAW (mask ∩ window) and EXCLUSIVE (mask ∩ window
  // minus every sibling's ink). EXCLUSIVE is the one an element can act on.
  // The gap between them is not an error — it is how much of this window the
  // coin gives to other elements, and it is worth reading on its own.
  // EXCLUSIVE TARGET — mask in the window that NOTHING ELSE ON THE FACE DRAWS.
  //
  // The shaft round found 41.65 sq units of its "unfilled" target — 12 FILL
  // points — was mask belonging to the olive branch crossing it and to
  // E PLURIBUS UNUM standing against it. The shaft could not have filled that
  // without drawing over its neighbours, so the raw denominator was charging it
  // for someone else's ink. On the branches, where overlap is heaviest, the
  // error would be larger still, and a specialist chasing it would over-draw —
  // which is how earlier whole-face rounds produced a tulip and a TV aerial.
  //
  // "Everything else" is measured by rendering the face with THIS NODE'S EXACT
  // TEXT DELETED, which is exact and costs one render — rather than unioning
  // siblings, which misses non-sibling neighbours like the legend.
  //
  // FILL is reported twice: RAW (mask ∩ window) and EXCLUSIVE (minus everything
  // else's ink). EXCLUSIVE is the one an element can act on; the gap between
  // them is how much of this window the coin gives to other elements.
  // "Everything else" must mean OTHER DEVICE MARKS, not the whole document:
  // the blank disc and the rim cover the entire face, so subtracting the full
  // render cedes 100% of every window. The device set is this node's siblings
  // plus any top-level <text> (the legends live outside the motif group).
  const others = new Uint8Array(MW * MH);
  {
    const parent = String(idx).split('.').slice(0, -1).join('.');
    const mine = String(idx).split('.').pop();
    const add = async (frag) => {
      const a2 = await inkOf(head, frag);
      for (let k = 0; k < MW * MH; k++) if (a2[k]) others[k] = 1;
    };
    if (parent) {
      let pnode = null, plist = out;
      for (const q of parent.split('.').map(Number)) {
        pnode = plist[q];
        if (pnode && pnode.startsWith('<g')) plist = childrenOf(pnode).kids;
      }
      if (pnode && pnode.startsWith('<g')) {
        const kids = childrenOf(pnode).kids;
        for (let q = 0; q < kids.length; q++) {
          if (String(q) === mine) continue;
          await add(resolve(head, out, `${parent}.${q}`));
        }
      }
    }
    for (let q = 0; q < out.length; q++) {
      if (out[q].startsWith('<text') && String(q) !== String(idx)) await add(out[q]);
    }
  }

  const target = new Uint8Array(MW * MH);
  let tgtN = 0, hitN = 0, exTgtN = 0, exHitN = 0;
  const bb = bboxOf(ink);
  const w = win ?? (bb ? [bb.x[0] - 2, bb.x[1] + 2, bb.y[0] - 2, bb.y[1] + 2] : [X0, X1, Y0, Y1]);
  for (let j = 0; j < MH; j++) {
    const y = Y0 + j * STEP; if (y < w[2] || y > w[3]) continue;
    for (let i = 0; i < MW; i++) {
      const x = X0 + i * STEP; if (x < w[0] || x > w[1]) continue;
      const k = j * MW + i;
      if (mask[k]) {
        target[k] = 1; tgtN++; if (ink[k]) hitN++;
        if (!others[k]) { exTgtN++; if (ink[k]) exHitN++; }
      }
    }
  }

  console.log(`node ${idx}  ref ${refKey}  window ${win ? process.argv[4] : '(auto from bbox)'} [${w.join(', ')}]`);
  console.log(`  element ink area   ${(inkN * STEP * STEP).toFixed(2)} sq units   bbox x ${bb?.x.join('..')}  y ${bb?.y.join('..')}`);
  console.log(`  OUTSIDE the mask   ${inkN ? (100 * outN / inkN).toFixed(2) : 'n/a'} %   ${(outN * STEP * STEP).toFixed(2)} sq units`);
  console.log(`  FILL raw           ${tgtN ? (100 * hitN / tgtN).toFixed(2) : 'n/a'} %   target ${(tgtN * STEP * STEP).toFixed(2)} sq units`);
  console.log(`  FILL exclusive     ${exTgtN ? (100 * exHitN / exTgtN).toFixed(2) : 'n/a'} %   target ${(exTgtN * STEP * STEP).toFixed(2)} sq units  (mask nothing else draws)`);
  console.log(`  ceded to others    ${((tgtN - exTgtN) * STEP * STEP).toFixed(2)} sq units of this window`);
  console.log('  neither number is a pass/fail and neither is to be maximised — LOOK at the panels.');

  const only = new Uint8Array(MW * MH), miss = new Uint8Array(MW * MH), both = new Uint8Array(MW * MH);
  for (let k = 0; k < MW * MH; k++) {
    if (ink[k] && !mask[k]) only[k] = 1;
    else if (ink[k] && mask[k]) both[k] = 1;
    if (target[k] && !ink[k]) miss[k] = 1;
  }
  const a = await png([[ink, [60, 60, 60]]]).resize(460, null).png().toBuffer();
  const b = await png([[target, [20, 110, 60]]]).resize(460, null).png().toBuffer();
  const c = await png([[miss, [200, 200, 200]], [both, [20, 110, 60]], [only, [200, 40, 40]]]).resize(460, null).png().toBuffer();
  const hh = (await sharp(a).metadata()).height;
  const f = join(JUDGE, `_dr13-node${idx}.png`);
  await sharp({ create: { width: 460 * 3 + 20, height: hh, channels: 3, background: '#fff' } })
    .composite([{ input: a, left: 0, top: 0 }, { input: b, left: 470, top: 0 }, { input: c, left: 940, top: 0 }])
    .png().toFile(f);
  console.log(`  wrote ${f}  —  element alone | its target | overlay (green both, RED outside, grey unfilled)`);
  process.exit(0);
}

console.log('usage: node _dr13elem.mjs [list|sheet|score <idx> [window]] [--ref proofbright|unc2005]');

}
