// BUCK r14 (specialist) — D12. A VERBATIM COPY of _jk9look.mjs (READ ONLY,
// hashed) with two substitutions, made here rather than in that file because
// editing an instrument voids the round (S1.1):
//   1. BEFORE points at src/art/_je14-before-coins.js. _jk9look.mjs points at
//      ./_jk9-before-coins.js and resolves it through a documented
//      `coloringbook/engine -> src/engine` symlink THAT DOES NOT EXIST in this
//      repo, so _jk9look.mjs cannot run at all. Reported, not fixed.
//   2. output goes beside the other artefacts instead of into _jk9out/.
// Original header follows.
//
// BUCK r9 (specialist) — D12, before and after, with BOTH revisions pinned by
// content hash in the image itself so the artefact cannot drift from the code
// that made it.
//
// The CONTROL is rendered first and into its own file (§3 D12, Q5, R6): the
// quarter, which shares `struck()`, `sw()`, `fitOff()`, `HEAD.*` and the whole
// palette machinery with the note and which this round did not touch. Anything
// visible in both is shared machinery, not a note defect.
//
//   node coloringbook/judge/_jk9look.mjs control
//   node coloringbook/judge/_jk9look.mjs subject
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const AFTER = '../../src/art/coins.js';
// The pristine pre-round copy, kept beside this file so the artefact and the
// revision that made it live together. It resolves `../engine/money.js`
// through the `coloringbook/engine -> src/engine` symlink, which exists only
// so a copy of `coins.js` can be imported from outside `src/art/`.
const BEFORE = '../../src/art/_je14-before-coins.js';
const hashOf = (rel) => createHash('sha256').update(readFileSync(new URL(rel, import.meta.url))).digest('hex').slice(0, 12);
const after = await import(AFTER);
const before = await import(BEFORE);

const TIERS = [['icon', 38], ['mid', 54], ['full', 190]];
const TARGET_W = 420;

async function tile(mod, id, side, size) {
  const box = mod.coinPx(id, size);
  const w = Math.round(box.w), h = Math.round(box.h);
  const svg = mod.coinSVG(id, size, { side });
  if (/undefined|NaN/.test(svg)) throw new Error(`${id}/${side}/${size}: undefined/NaN`);
  const k = Math.max(1, Math.round(TARGET_W / w));
  const png = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' }).resize(w, h, { fit: 'fill' }).png().toBuffer();
  return { buf: await sharp(png).resize(w * k, h * k, { kernel: 'nearest' }).png().toBuffer(), w: w * k, h: h * k, label: `${side.slice(0, 3)} ${size} (${w}x${h}px, x${k})` };
}

async function sheet(rows, out, caption) {
  const metas = [];
  for (const r of rows) metas.push(r);
  const W = Math.max(...metas.map((r) => r.tiles.reduce((s, t) => s + t.w + 12, 12)));
  let y = 44, comp = [], labels = '';
  for (const r of rows) {
    let x = 12;
    const hh = Math.max(...r.tiles.map((t) => t.h));
    labels += `<text x="12" y="${y - 8}" fill="#ffe000" font-size="17" font-family="monospace">${r.name}</text>`;
    for (const t of r.tiles) {
      comp.push({ input: t.buf, left: x, top: y });
      labels += `<text x="${x}" y="${y + hh + 16}" fill="#9ad" font-size="15" font-family="monospace">${t.label}</text>`;
      x += t.w + 12;
    }
    y += hh + 46;
  }
  const H = y + 8;
  labels = `<text x="12" y="24" fill="#fff" font-size="18" font-family="monospace">${caption}</text>` + labels;
  const base = await sharp({ create: { width: W, height: H, channels: 3, background: '#101010' } }).png().toBuffer();
  await sharp(base).composite([...comp, { input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${labels}</svg>`), top: 0, left: 0 }])
    .png().toFile(out);
  console.log(out);
}

const cap = `coins.js BEFORE sha256:${hashOf(BEFORE)}   AFTER sha256:${hashOf(AFTER)}`;
if (process.argv[2] === 'control') {
  const rows = [];
  for (const [tag, mod] of [['quarter BEFORE', before], ['quarter AFTER', after]]) {
    const tiles = [];
    for (const side of ['obverse', 'reverse']) for (const [, size] of TIERS) tiles.push(await tile(mod, 'quarter', side, size));
    rows.push({ name: tag, tiles });
  }
  await sheet(rows, 'coloringbook/judge/_je14-control-quarter.png', `CONTROL — the quarter, untouched this round.  ${cap}`);
} else {
  for (const side of ['obverse', 'reverse']) {
    const rows = [];
    for (const [tag, mod] of [['BEFORE', before], ['AFTER ', after]]) {
      const tiles = [];
      for (const [, size] of TIERS) tiles.push(await tile(mod, 'buck', side, size));
      rows.push({ name: `${tag} buck ${side}`, tiles });
    }
    await sheet(rows, `coloringbook/judge/_je14-buck-${side}.png`, `buck ${side}.  ${cap}`);
  }
}
