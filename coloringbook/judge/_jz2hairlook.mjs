// D12 FOR C2 — LOOK AT THE TWO `hairFill` BRANCHES, AT THE SIZES THE APP DRAWS,
// WITH THE CONTROL RENDERED FIRST.
//
// §0.1: "every wrong-in-kind defect ever found here was found this way and none
// was found by a number", and the gates on this project have repeatedly scored
// identically across real errors. Four rows per coin, top to bottom:
//
//   1. CONTROL — a CHECKOUT of the pinned commit, rendered before anything
//      else. If row 1 and row 2 differ, the working tree moved and every
//      number below is about a different drawing than the one being judged.
//      (A single-file copy will not load: coins.js imports src/engine/money.js.
//       Use `git archive <commit> src | tar -x -C <dir>`.)
//   2. LIT   — hair mass in `p.cloth`, lighter than the face.
//   3. DARK  — hair mass in `p.hair`, darker than the face.
//   3b. NONE — hair mass in `p.motif`, THE SAME TONE AS THE FACE. Not a branch
//      `hairLit` can select; it is here because `_jz7mag.mjs` found it scores
//      BETTER on T1 than the shipped branch on three of the four obverses, and
//      a number that good has to be looked at before it is believed.
//   4. REAL  — a reference PHOTOGRAPH of that denomination, disc-fitted and
//      reduced to the SAME device-pixel diameter, then upscaled the same way.
//      This row is the only one that can say which branch is RIGHT rather than
//      which is louder: §0 makes the test transfer to real currency, not
//      internal consistency.
//
// Nearest-neighbour upscale by 10, so what is shown is device pixels and
// nothing invented. Nothing here writes into `src/` or into `ref/`.
//
// usage:
//   mkdir -p <scratch>/ctl && git archive <commit> src | tar -x -C <scratch>/ctl
//   node coloringbook/judge/_jz2hairlook.mjs <scratch>/ctl/src/art/coins.js
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { SCRATCH, REF } from './_paths.mjs';
import { recolourHair, tonesOf } from './_jzlib.mjs';
// The same disc fit T1 registers with, so the photograph row is cropped exactly
// as the primary gate crops it (cached in _jp1discs.json where an entry exists,
// fitted otherwise).
import { discOf } from './_jq42indep.mjs';

const SIZES = [38, 48, 54, 84];
const SCALE = 10;
const IDS = ['penny', 'nickel', 'dime', 'quarter'];
// One photograph per denomination, taken from T1's own obverse pool so the row
// is a reference this project already accepts rather than one picked to suit.
const PHOTO = {
  penny: 'penny-obv-3.jpg', nickel: 'nickel-obv-4.jpg',
  dime: 'dime-obv-2.jpg', quarter: 'quarter-obv.jpg',
};
const CONTROL = process.argv[2];
if (!CONTROL) { console.log('usage: _jz2hairlook.mjs <path to the control coins.js>  (see the header)'); process.exit(1); }

const live = await import('../../src/art/coins.js');
const ctl = await import(CONTROL.startsWith('/') ? CONTROL : '../../' + CONTROL);

async function tile(mod, id, S, lit, paint) {
  const box = mod.coinPx(id, S);
  const w = Math.round(box.w), h = Math.round(box.h);
  const was = mod.OBVERSE[id].hairLit;
  if (lit !== null) mod.OBVERSE[id].hairLit = lit;
  let svg = mod.coinSVG(id, S, { side: 'obverse' });
  mod.OBVERSE[id].hairLit = was;
  if (paint) svg = recolourHair(svg, paint);
  const png = await sharp(Buffer.from(svg)).resize(w, h, { fit: 'fill' }).flatten({ background: '#ffffff' }).png().toBuffer();
  return { big: await sharp(png).resize(w * SCALE, h * SCALE, { kernel: 'nearest' }).png().toBuffer(), w: w * SCALE, h: h * SCALE };
}

// The photograph, cropped to its fitted disc and resampled to the same device
// diameter our art gets at that size.
async function photoTile(id, S) {
  const f = PHOTO[id];
  const d = await discOf(f);
  const box = live.coinPx(id, S);
  const w = Math.round(box.w), h = Math.round(box.h);
  const src = sharp(join(REF, f));
  const meta = await src.metadata();
  const L = Math.round(Math.max(0, d.cx - d.R)), T = Math.round(Math.max(0, d.cy - d.R));
  const W = Math.round(Math.min(2 * d.R, meta.width - L)), H = Math.round(Math.min(2 * d.R, meta.height - T));
  const png = await src.extract({ left: L, top: T, width: W, height: H })
    .resize(w, h, { fit: 'fill' }).greyscale().flatten({ background: '#ffffff' }).png().toBuffer();
  return { big: await sharp(png).resize(w * SCALE, h * SCALE, { kernel: 'nearest' }).png().toBuffer(), w: w * SCALE, h: h * SCALE };
}

const OUT = join(SCRATCH, '_jz1');
mkdirSync(OUT, { recursive: true });

for (const id of IDS) {
  const shipped = live.OBVERSE[id].hairLit === true;
  const rows = [
    { label: `1 CONTROL  pinned checkout, as shipped (${shipped ? 'LIT' : 'DARK'})`, get: (S) => tile(ctl, id, S, null) },
    { label: `2 LIT      hair = p.cloth, lighter than the face${shipped ? '   ** SHIPPED' : ''}`, get: (S) => tile(live, id, S, true) },
    { label: `3 DARK     hair = p.hair, darker than the face${shipped ? '' : '    ** SHIPPED'}`, get: (S) => tile(live, id, S, false) },
    { label: `3b NONE    hair = p.motif, the face's own tone (no step at all)`, get: (S) => tile(live, id, S, null, tonesOf(live.coinSVG(id, 380, { side: 'obverse' })).motif) },
    { label: `4 REAL     ${PHOTO[id]}, disc-fitted, same device pixels`, get: (S) => photoTile(id, S) },
  ];
  const built = [];
  for (const r of rows) {
    const tiles = [];
    for (const S of SIZES) tiles.push(await r.get(S));
    built.push({ label: r.label, tiles });
  }
  const PAD = 14, colX = []; let x = PAD;
  for (const t of built[0].tiles) { colX.push(x); x += t.w + PAD; }
  const rowH = Math.max(...built[0].tiles.map((t) => t.h)) + 30;
  const comps = []; let txt = '';
  built.forEach((r, ri) => {
    txt += `<text x="${PAD}" y="${ri * rowH + 18}" font-family="monospace" font-size="16" fill="#111">${r.label}</text>`;
    r.tiles.forEach((t, i) => comps.push({ input: t.big, left: colX[i], top: ri * rowH + 24 }));
  });
  const Hh = built.length * rowH + PAD;
  const out = join(OUT, `_jz2-look-${id}.png`);
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${x}" height="${Hh}"><rect width="${x}" height="${Hh}" fill="#f2f2f2"/>${txt}</svg>`))
    .composite(comps).png().toFile(out);
  console.log('wrote', out, `— ${id} obverse at ${SIZES.join(', ')} px (quarter-relative)`);
}
