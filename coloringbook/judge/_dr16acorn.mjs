// DIME REVERSE — round 35. THE ACORN, AS AN OBJECT RATHER THAN AS A BOX.
//
// Reports only. Writes nothing but `_dr16-*.png` in the gitignored judge
// scratch (WRITERS.md). Never opens `dime-rev-2.jpg`, which fails the mask's
// own null test by 63 units.
//
// WHY THIS EXISTS. Every number this element has ever been fitted to was an
// axis-aligned BOUNDING BOX — round 28's 5.6 x 4.6 and 4.8 x 4.0 — and the
// box could not decide the one thing that makes an acorn an acorn, which way
// up it lies. The file says so in as many words: "every rotation from 70 to 90
// degrees can be scaled to land INSIDE the two references' own disagreement".
// That is a property of the box, not of the coin. The box of a near-round
// object barely moves when you turn it.
//
// AND THE ROUND THAT SCORED IT NEXT WAS MISLED BY A WINDOW. `_dr13elem.mjs`
// declares `WINDOWS.acorn` as x 54..65, y 52..63 — 121 square units around a
// five-unit object, coarse on purpose. FILL exclusive read 29.39 % of a 47.25
// sq unit target, which invites the conclusion that our acorn is a third of
// the coin's. Section 2 below decomposes that 47.25 and it is not: 9.54 is the
// torch shaft's edge at the window's left border, 8.45 is a row of E PLURIBUS
// UNUM clipped by the window's bottom, 5.01 is oak at the top right corner,
// and only about 18 of it is acorn at all. Measured as an object, our acorn
// was 85 % of the coin's by area, not 31 %.
//
// FIVE SECTIONS:
//
//   1. THE ACORN, ISOLATED BY OPENING. At zero erosion the acorn is not a
//      separate component on either file — it merges into the lowest oak blade
//      and into its own stalk. Erode by 0.55 (the smallest erosion at which it
//      separates on BOTH files), take the component nearest (58.9, 57.5),
//      dilate back by 0.55, intersect with the erode-0 mask. A morphological
//      opening: the thin bridges go, the object keeps its true extent.
//   2. WHAT `WINDOWS.acorn`'s FILL DENOMINATOR IS MADE OF, component by
//      component, so a specialist can see how much of it is even reachable.
//   3. THE BODY, WITH THE STALK STUB STRIPPED, and its principal axis. This is
//      the round's new measured quantity and the two files agree on it to 1.1
//      degrees, which no bounding box could have told anyone.
//   4. THE FIT. rot / sw / sl against the coin, moment-matched, with the
//      unconstrained IoU optimum printed beside it and rejected — IoU is
//      scored against a target that includes a stalk stub the art does not
//      draw, so maximising it grows the body past the references.
//   5. IS THE CUP RIM VISIBLE? It is not, on either file, and section 5 is the
//      evidence that the nut/cup proportion is NOT measurable here.
//
// Run: node coloringbook/judge/_dr16acorn.mjs
import sharp from 'sharp';
import { join } from 'node:path';
import { SCRATCH } from './_paths.mjs';
import { deviceMask, erodeBy } from './_dr9branch.mjs';
import { nodes, resolve as resolveNode, reopen } from './_dr13elem.mjs';
import { samplerFor } from './_dr2grid.mjs';
import { coinSVG } from '../../src/art/coins.js';

const X0 = 13, Y0 = 17, STEP = 0.05;
const MW = Math.round((87 - 13) / STEP), MH = Math.round((85 - 17) / STEP);
const PPU = 1 / STEP;
const WIN = [54, 65, 52, 63];          // `_dr13elem.mjs`'s own WINDOWS.acorn
const SEP = 0.55;                       // the opening radius, justified in §1

// `--reopen 1.0` is proofbright-only. On unc2005 the same threshold reopens
// 946.6 sq units including the whole interior of the torch flame, because that
// file is dark-outline with bright device interiors.
const REFS = {
  proofbright: ['dime-rev-proofbright.png', 236, true],
  unc2005: ['dime-rev-unc2005.png', 190, false],
};

/** dilation matched to `erodeBy`'s 4-neighbour iteration, so opening is exact */
function dilateBy(dev, units) {
  const r = Math.round(units / STEP);
  for (let p = 0; p < r; p++) {
    const nx = new Uint8Array(MW * MH);
    for (let j = 1; j < MH - 1; j++) for (let i = 1; i < MW - 1; i++) {
      const k = j * MW + i;
      nx[k] = (dev[k] || dev[k - 1] || dev[k + 1] || dev[k - MW] || dev[k + MW]) ? 1 : 0;
    }
    dev = nx;
  }
  return dev;
}

const inWin = (i, j, w) => {
  const x = X0 + i * STEP, y = Y0 + j * STEP;
  return x >= w[0] && x <= w[1] && y >= w[2] && y <= w[3];
};

/** every connected component of a 0/1 grid inside a window, largest first */
function comps(a, w, minArea) {
  const seen = new Uint8Array(MW * MH); const res = [];
  for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
    const k = j * MW + i;
    if (!a[k] || seen[k] || !inWin(i, j, w)) continue;
    const st = [k]; seen[k] = 1; const P = [];
    while (st.length) {
      const c = st.pop(); P.push(c);
      for (const d of [1, -1, MW, -MW]) {
        const m = c + d; if (m < 0 || m >= MW * MH) continue;
        const mi = m % MW, mj = (m - mi) / MW;
        if (a[m] && !seen[m] && inWin(mi, mj, w)) { seen[m] = 1; st.push(m); }
      }
    }
    if (P.length * STEP * STEP < minArea) continue;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, sx = 0, sy = 0;
    for (const c of P) {
      const ci = c % MW, x = X0 + ci * STEP, y = Y0 + ((c - ci) / MW) * STEP;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      sx += x; sy += y;
    }
    res.push({ P, area: +(P.length * STEP * STEP).toFixed(2), cx: +(sx / P.length).toFixed(2),
      cy: +(sy / P.length).toFixed(2), x: [+x0.toFixed(2), +x1.toFixed(2)], y: [+y0.toFixed(2), +y1.toFixed(2)] });
  }
  return res.sort((a, b) => b.area - a.area);
}

/** centroid, principal axis, extents along it. `deg` is UP from the horizontal. */
function pca(P) {
  let mx = 0, my = 0;
  for (const [x, y] of P) { mx += x; my += y; }
  mx /= P.length; my /= P.length;
  let sxx = 0, syy = 0, sxy = 0;
  for (const [x, y] of P) { sxx += (x - mx) ** 2; syy += (y - my) ** 2; sxy += (x - mx) * (y - my); }
  const th = 0.5 * Math.atan2((2 * sxy) / P.length, (sxx - syy) / P.length);
  const c = Math.cos(th), s = Math.sin(th);
  let u0 = 1e9, u1 = -1e9, v0 = 1e9, v1 = -1e9;
  for (const [x, y] of P) {
    const u = (x - mx) * c + (y - my) * s, v = -(x - mx) * s + (y - my) * c;
    u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, v); v1 = Math.max(v1, v);
  }
  return { mx, my, th, c, s, u0, u1, v0, v1,
    len: +(u1 - u0).toFixed(2), wid: +(v1 - v0).toFixed(2),
    deg: +(((-th * 180) / Math.PI + 360) % 180).toFixed(1),
    area: +(P.length * STEP * STEP).toFixed(2) };
}

const toPts = (g) => {
  const P = [];
  for (let q = 0; q < MW * MH; q++) if (g[q]) { const i = q % MW; P.push([X0 + i * STEP, Y0 + ((q - i) / MW) * STEP]); }
  return P;
};
const toGrid = (P) => {
  const g = new Uint8Array(MW * MH);
  for (const [x, y] of P) g[Math.round((y - Y0) / STEP) * MW + Math.round((x - X0) / STEP)] = 1;
  return g;
};

async function rasterise(doc) {
  const { data, info } = await sharp(Buffer.from(doc))
    .resize(Math.round(100 * PPU), Math.round(100 * PPU), { fit: 'fill' })
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const ink = new Uint8Array(MW * MH); const ch = info.channels;
  for (let j = 0; j < MH; j++) {
    const sy = Math.round((Y0 + j * STEP) * PPU);
    for (let i = 0; i < MW; i++) {
      const sx = Math.round((X0 + i * STEP) * PPU);
      if (data[(sy * info.width + sx) * ch + ch - 1] > 24) ink[j * MW + i] = 1;
    }
  }
  return ink;
}

// ── masks and the isolated acorn on each reference
const masks = {}, acorn = {};
for (const [k, [f, T, ro]] of Object.entries(REFS)) {
  let m = await deviceMask(f, T, 0);
  if (ro) m = await reopen(m, f, T, 1.0);
  masks[k] = m;
  const seedComps = comps(erodeBy(m, SEP), [54, 66, 52, 63], 0);
  let seed = null, bd = 1e9;
  for (const c of seedComps) {
    const d = Math.hypot(c.cx - 58.9, c.cy - 57.5);
    if (d < bd) { bd = d; seed = c; }
  }
  const sg = new Uint8Array(MW * MH); for (const c of seed.P) sg[c] = 1;
  const dl = dilateBy(sg, SEP);
  const g = new Uint8Array(MW * MH);
  for (let q = 0; q < MW * MH; q++) if (dl[q] && m[q]) g[q] = 1;
  acorn[k] = g;
}

// ── our own node 2.1.18
const { head, out } = nodes(coinSVG('dime', 380, { side: 'reverse' }));
const ours = await rasterise(`${head}${resolveNode(head, out, '2.1.18')}</svg>`);

console.log('=== 1. THE ACORN ISOLATED BY OPENING (erode 0 mask, open by 0.55)');
console.log('    At erode 0 it is NOT a separate component on either file: it merges into');
console.log('    the lowest oak blade and into its own stalk. Components in WINDOWS.acorn:');
for (const k of Object.keys(REFS)) {
  const cs = comps(masks[k], WIN, 0.5);
  console.log(`  ${k.padEnd(12)} ${cs.length} component(s) >= 0.5 u2 in the whole window; largest `
    + `a ${cs[0].area} spanning x ${cs[0].x[0]}..${cs[0].x[1]} y ${cs[0].y[0]}..${cs[0].y[1]}`);
}
console.log('    After opening:');
for (const k of Object.keys(REFS)) {
  const p = pca(toPts(acorn[k]));
  console.log(`  ${k.padEnd(12)} area ${String(p.area).padStart(6)}  centre (${p.mx.toFixed(2)}, ${p.my.toFixed(2)})  `
    + `len ${p.len} x wid ${p.wid}  axis ${p.deg} deg`);
}
{
  const p = pca(toPts(ours));
  console.log(`  ${'ours'.padEnd(12)} area ${String(p.area).padStart(6)}  centre (${p.mx.toFixed(2)}, ${p.my.toFixed(2)})  `
    + `len ${p.len} x wid ${p.wid}  axis ${p.deg} deg`);
}

console.log('\n=== 2. WHAT `WINDOWS.acorn`\'s FILL DENOMINATOR IS MADE OF');
console.log('    "everything else" is the face rendered with 2.1.18 deleted, using');
console.log('    includes(\'<text>\') so the two <g>-wrapped legends count (D31).');
const others = new Uint8Array(MW * MH);
{
  const openEnd = out[2].indexOf('>') + 1;
  const kids = nodes(`<svg>${out[2].slice(openEnd, out[2].lastIndexOf('</g>'))}</svg>`).out;
  const grp = kids[1];
  const oe2 = grp.indexOf('>') + 1;
  const sibs = nodes(`<svg>${grp.slice(oe2, grp.lastIndexOf('</g>'))}</svg>`).out;
  for (let q = 0; q < sibs.length; q++) {
    if (q === 18) continue;
    const a2 = await rasterise(`${head}${resolveNode(head, out, `2.1.${q}`)}</svg>`);
    for (let z = 0; z < MW * MH; z++) if (a2[z]) others[z] = 1;
  }
  for (let q = 0; q < out.length; q++) {
    if (!out[q].includes('<text')) continue;
    const a2 = await rasterise(`${head}${out[q]}</svg>`);
    for (let z = 0; z < MW * MH; z++) if (a2[z]) others[z] = 1;
  }
}
for (const k of Object.keys(REFS)) {
  const ex = new Uint8Array(MW * MH);
  let tgt = 0, exN = 0, hitRaw = 0, hitEx = 0;
  for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
    if (!inWin(i, j, WIN)) continue;
    const q = j * MW + i;
    if (!masks[k][q]) continue;
    tgt++; if (ours[q]) hitRaw++;
    if (!others[q]) { ex[q] = 1; exN++; if (ours[q]) hitEx++; }
  }
  const A = (n) => (n * STEP * STEP).toFixed(2);
  console.log(`  ${k}: FILL raw ${(100 * hitRaw / tgt).toFixed(2)} % of ${A(tgt)}    `
    + `FILL exclusive ${(100 * hitEx / exN).toFixed(2)} % of ${A(exN)}`);
  let onAcorn = 0;
  for (let q = 0; q < MW * MH; q++) if (ex[q] && acorn[k][q]) onAcorn++;
  console.log(`     of that exclusive target, ${A(onAcorn)} sq units lie on the ACORN itself; `
    + `${A(exN - onAcorn)} do not. Components:`);
  for (const c of comps(ex, WIN, 0.5)) {
    let hit = 0; for (const z of c.P) if (acorn[k][z]) hit++;
    console.log(`       a ${String(c.area).padStart(6)}  x ${c.x[0]}..${c.x[1]}  y ${c.y[0]}..${c.y[1]}  `
      + `${(100 * hit / c.P.length).toFixed(0)} % of it is acorn`);
  }
}

console.log('\n=== 3. THE BODY: strip the thin stalk stub, refit until stable');
console.log('    (slices 0.1 units wide across the axis; walk in from the +u end while the');
console.log('    slice is narrower than half the widest; refit; repeat)');
const BODY = {};
for (const k of Object.keys(REFS)) {
  let P = toPts(acorn[k]), A = pca(P);
  for (let it = 0; it < 8; it++) {
    const slices = new Map();
    for (const [x, y] of P) {
      const u = (x - A.mx) * A.c + (y - A.my) * A.s, v = -(x - A.mx) * A.s + (y - A.my) * A.c;
      const b = Math.round(u * 10);
      if (!slices.has(b)) slices.set(b, [v, v]);
      const q = slices.get(b); q[0] = Math.min(q[0], v); q[1] = Math.max(q[1], v);
    }
    const keys = [...slices.keys()].sort((a, b) => a - b);
    const wid = (b) => slices.get(b)[1] - slices.get(b)[0];
    const wmax = Math.max(...keys.map(wid));
    let cut = keys[keys.length - 1];
    while (cut > keys[0] && wid(cut) < wmax / 2) cut--;
    const kept = P.filter(([x, y]) => (x - A.mx) * A.c + (y - A.my) * A.s <= cut / 10);
    if (kept.length === P.length) break;
    P = kept; A = pca(P);
  }
  BODY[k] = A;
  const stub = pca(toPts(acorn[k]));
  console.log(`  ${k.padEnd(12)} BODY len ${A.len} x wid ${A.wid}  axis ${A.deg} deg  area ${A.area}  `
    + `centre (${A.mx.toFixed(2)}, ${A.my.toFixed(2)})   len/wid ${(A.len / A.wid).toFixed(2)}`);
  console.log(`  ${''.padEnd(12)} stub reaches (${(stub.mx + stub.c * stub.u1).toFixed(2)}, `
    + `${(stub.my + stub.s * stub.u1).toFixed(2)}), i.e. ${stub.deg} deg up and outboard of the body centre`);
}
{
  const A = pca(toPts(ours));
  console.log(`  ${'ours'.padEnd(12)} BODY len ${A.len} x wid ${A.wid}  axis ${A.deg} deg  area ${A.area}  `
    + `centre (${A.mx.toFixed(2)}, ${A.my.toFixed(2)})   len/wid ${(A.len / A.wid).toFixed(2)}`);
}

console.log('\n=== 4. THE FIT. Centre HELD at (58.80, 57.70) — the position is settled and');
console.log('    this instrument does not move it. rot is degrees CLOCKWISE, so the drawn');
console.log('    axis lies at 90 - rot. sw scales ACROSS that axis, sl ALONG it.');
const ACORN_D =
  'M 0 2.45 C -1 1.9 -1.6 .9 -1.6 -.2 C -1.6 -.9 -.8 -1.2 0 -1.2'
  + ' C .8 -1.2 1.6 -.9 1.6 -.2 C 1.6 .9 1 1.9 0 2.45 Z'
  + ' M -2.1 -1.15 C -2.1 -2.15 -1.1 -2.6 0 -2.6 C 1.1 -2.6 2.1 -2.15 2.1 -1.15'
  + ' C 2.1 -.55 1.1 -.35 0 -.35 C -1.1 -.35 -2.1 -.55 -2.1 -1.15 Z';
const trial = (rot, sw, sl) => rasterise(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="2000" height="2000">'
  + `<g transform="translate(58.8 57.7) rotate(${rot}) scale(${sw} ${sl})"><path d="${ACORN_D}" fill="#000"/></g></svg>`);
const iou = (a, b) => { let i = 0, u = 0;
  for (let q = 0; q < MW * MH; q++) { if (a[q] || b[q]) u++; if (a[q] && b[q]) i++; } return i / u; };
let bestIoU = null;
for (let rot = 46; rot <= 78; rot += 4) {
  for (let sw = 1.00; sw <= 1.281; sw += 0.04) {
    for (let sl = 0.90; sl <= 1.141; sl += 0.04) {
      const g = await trial(rot, +sw.toFixed(2), +sl.toFixed(2));
      const m = (iou(g, acorn.proofbright) + iou(g, acorn.unc2005)) / 2;
      if (!bestIoU || m > bestIoU.m) bestIoU = { rot, sw: +sw.toFixed(2), sl: +sl.toFixed(2), m };
    }
  }
}
for (const [rot, sw, sl, tag] of [
  [75, 1.00, 1.00, 'as shipped to round 34'],
  [59, 1.13, 0.98, 'SHIPPED (moment-matched)'],
  [bestIoU.rot, bestIoU.sw, bestIoU.sl, 'IoU optimum (rejected)'],
]) {
  const g = await trial(rot, sw, sl);
  const p = pca(toPts(g));
  console.log(`  rot ${String(rot).padStart(2)} sw ${sw.toFixed(2)} sl ${sl.toFixed(2)}  ${tag.padEnd(24)} `
    + `len ${p.len} wid ${p.wid} axis ${p.deg} area ${p.area}  `
    + `IoU pb ${iou(g, acorn.proofbright).toFixed(3)} unc ${iou(g, acorn.unc2005).toFixed(3)}`);
}
console.log('    The IoU optimum draws OUTSIDE both references on length, width and angle.');
console.log('    Its target still contains the stalk stub the art does not draw, and the only');
console.log('    way to cover a stub is to grow past the body. Three agreed moments beat one');
console.log('    score against a target known to be contaminated.');

console.log('\n=== 5. IS THE CUP RIM VISIBLE AS INTERIOR RELIEF? Grey along the fitted axis');
console.log('    through each body centre, on the axis and 1.0 either side. A cup rim would');
console.log('    print as a dark line INSIDE the outline, at a repeatable u on both files.');
for (const k of Object.keys(REFS)) {
  const [f] = REFS[k];
  const s = await samplerFor(f, 2400);
  const A = BODY[k];
  console.log(`  ${f}  centre (${A.mx.toFixed(2)}, ${A.my.toFixed(2)})  axis ${A.deg} deg`);
  for (const off of [-1, 0, 1]) {
    const row = [];
    for (let u = -3; u <= 3.001; u += 0.25) {
      row.push(Math.round(s.at(A.mx + u * A.c - off * -A.s, A.my + u * A.s - off * A.c)));
    }
    console.log(`     v=${String(off).padStart(2)}  ${row.map((v) => String(v).padStart(4)).join('')}`);
  }
  console.log(`      u    ${[...Array(25).keys()].map((i) => (-3 + i * 0.25).toFixed(1).padStart(4)).join('')}`);
}
console.log('    VERDICT: no. proofbright is frosted and its grey swings ~200 levels INSIDE');
console.log('    the body from the pebbling alone; unc2005 is flat bright inside with dark');
console.log('    only at the outline. The nut/cup PROPORTION is not measurable on these two');
console.log('    files, and the drawn 1.6 / 2.1 split stands on what an acorn is, not on them.');

// ── the picture: three silhouettes in the same coordinates
{
  const W = 54, E = 66, N = 52, S = 63, Z = 60;
  const w = Math.round((E - W) * Z), h = Math.round((S - N) * Z);
  const panel = (g, rgb) => {
    const b = Buffer.alloc(w * h * 3, 250);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const mi = Math.round((W + i / Z - X0) / STEP), mj = Math.round((N + j / Z - Y0) / STEP);
      if (g[mj * MW + mi]) { const q = (j * w + i) * 3; b[q] = rgb[0]; b[q + 1] = rgb[1]; b[q + 2] = rgb[2]; }
    }
    for (let gx = Math.ceil(W); gx <= E; gx++) {
      const i = Math.round((gx - W) * Z);
      for (let j = 0; j < h; j++) { const q = (j * w + i) * 3;
        if (b[q] > 200) { b[q] = 255; b[q + 1] = gx % 5 ? 210 : 150; b[q + 2] = gx % 5 ? 210 : 150; } }
    }
    for (let gy = Math.ceil(N); gy <= S; gy++) {
      const j = Math.round((gy - N) * Z);
      for (let i = 0; i < w; i++) { const q = (j * w + i) * 3;
        if (b[q] > 200) { b[q] = 255; b[q + 1] = gy % 5 ? 210 : 150; b[q + 2] = gy % 5 ? 210 : 150; } }
    }
    return sharp(b, { raw: { width: w, height: h, channels: 3 } }).png().toBuffer();
  };
  const imgs = [await panel(acorn.proofbright, [20, 110, 60]), await panel(acorn.unc2005, [30, 70, 180]),
    await panel(ours, [60, 60, 60])];
  await sharp({ create: { width: w * 3 + 20, height: h, channels: 3, background: '#fff' } })
    .composite(imgs.map((input, i) => ({ input, left: i * (w + 10), top: 0 })))
    .png().toFile(join(SCRATCH, '_dr16-silhouettes.png'));
  console.log('\nwrote _dr16-silhouettes.png — proofbright | unc2005 | ours, same coordinates');
}
