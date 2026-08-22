// ROUND 8, cent obverse — OUR RENDER BESIDE THE REFERENCE, same disc framing.
//
// D12 (§3): a subject nobody has looked at is not finished, and an overlay of
// contours is not the same thing as looking at the drawing — a contour can sit
// on the right boundary while the FILL either side of it is the wrong mass.
// This renders our obverse at the reference's own scale and pastes it beside
// the same crop of each reference.
//
// CONTROL (Q5 / §3 D12): `--ctl` renders the BEFORE revision
// (coloringbook/judge/_jh8-before-coins.js) in the third panel, so an artefact
// present in both panels cannot be attributed to this round's edit. The control
// is written FIRST in the file name order (…-before) so it is read first.
//
// Run: node coloringbook/judge/_jh8side.mjs <lx> <ly> <half> <tag> [src] [--ctl]
import sharp from 'sharp';
import { DISCS, PENNY } from '../_pylib.mjs';

const LX = Number(process.argv[2]), LY = Number(process.argv[3]);
const HALF = Number(process.argv[4] || 20);
const TAG = process.argv[5] || 'side';
const SRC = process.argv[6] && !process.argv[6].startsWith('--') ? process.argv[6] : '../../src/art/coins.js';
const CTL = process.argv.includes('--ctl');
const PANEL = 760;

const vX = (lx) => 50 + PENNY.CX + PENNY.dir * PENNY.s * lx;
const vY = (ly) => PENNY.CY + PENNY.s * ly;

// our art, rasterised so that ONE viewBox unit is `perVB` px, then cropped to
// the same window in local units. The whole 100-unit viewBox is drawn and cut
// down, so the crop cannot silently rescale the drawing.
async function ourCrop(src) {
  const mod = await import(src.startsWith('.') ? src : `file://${src}`);
  const perVB = PANEL / (2 * HALF * PENNY.s);            // px per viewBox unit
  // coinSVG's emitted width is NOT the `size` asked for — `fitOff`/`spendOf`
  // shrink it (1218 in gives width="956.4"). Deriving perVB from `size` put the
  // crop window off the canvas; it is read back off the emitted attribute.
  let svg = mod.coinSVG('penny', Math.round(100 * perVB), { side: 'obverse' });
  const emitted = Number(svg.match(/\bwidth="([\d.]+)"/)[1]);
  svg = mod.coinSVG('penny', Math.round(100 * perVB * (100 * perVB) / emitted), { side: 'obverse' });
  const w2 = Number(svg.match(/\bwidth="([\d.]+)"/)[1]);
  if (Math.abs(w2 - 100 * perVB) > 1.5) throw new Error(`could not hit the target render width: wanted ${(100 * perVB).toFixed(1)}, got ${w2}`);
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  const left = Math.round(vX(LX - HALF) * perVB), top = Math.round(vY(LY - HALF) * perVB);
  const w = Math.round((vX(LX + HALF) - vX(LX - HALF)) * perVB);
  return sharp(buf).extract({ left: Math.max(0, left), top: Math.max(0, top), width: w, height: w })
    .resize(PANEL, PANEL, { fit: 'fill' }).png().toBuffer();
}

const panels = [];
const labels = [];
// The pristine copy lives at coloringbook/judge/_jh8-before-coins.js, but
// coins.js imports '../engine/money.js' and a copy outside src/art cannot
// resolve it. So the control is materialised as a temporary sibling in src/art
// for the duration of the call and removed in a `finally` — nothing is left in
// the shipped source tree, and the artefact stays reproducible from the two
// files that are committed.
if (CTL) {
  const { readFileSync, writeFileSync, rmSync } = await import('node:fs');
  const tmp = 'src/art/_jh8ctl.js';
  writeFileSync(tmp, readFileSync('coloringbook/judge/_jh8-before-coins.js', 'utf8'));
  try { panels.push(await ourCrop('../../src/art/_jh8ctl.js')); } finally { rmSync(tmp); }
  labels.push('OURS — BEFORE (control)');
}
panels.push(await ourCrop(SRC)); labels.push(`OURS — ${SRC.split('/').pop()}`);

for (const [file, D] of Object.entries(DISCS)) {
  const pX = (v) => D.cx + (v - 50) / 47 * D.R, pY = (v) => D.cy + (v - 50) / 47 * D.R;
  const left = pX(vX(LX - HALF)), top = pY(vY(LY - HALF));
  const wpx = pX(vX(LX + HALF)) - left;
  const meta = await sharp(`coloringbook/ref/${file}`).metadata();
  const ex = { left: Math.round(left), top: Math.round(top), width: Math.round(wpx), height: Math.round(wpx) };
  if (ex.left < 0 || ex.top < 0 || ex.left + ex.width > meta.width || ex.top + ex.height > meta.height) { console.log(`  ${file}: out of bounds — skipped`); continue; }
  panels.push(await sharp(`coloringbook/ref/${file}`).extract(ex).resize(PANEL, PANEL, { fit: 'fill' }).png().toBuffer());
  labels.push(file);
}

const W = PANEL * panels.length;
let txt = '';
panels.forEach((_, i) => { txt += `<rect x="${i * PANEL}" y="0" width="${PANEL}" height="24" fill="#000" opacity="0.6"/><text x="${i * PANEL + 6}" y="17" font-family="monospace" font-size="15" fill="#ffff00">${labels[i]}</text>`; });
txt += `<text x="6" y="${PANEL - 8}" font-family="monospace" font-size="15" fill="#ffff00">centre local (${LX}, ${LY}) half ${HALF} local units — every panel identically framed</text>`;
await sharp({ create: { width: W, height: PANEL, channels: 3, background: '#fff' } })
  .composite([...panels.map((input, i) => ({ input, left: i * PANEL, top: 0 })),
    { input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${PANEL}">${txt}</svg>`), left: 0, top: 0 }])
  .png().toFile(`coloringbook/_pv/_jh8side-${TAG}.png`);
console.log(`wrote coloringbook/_pv/_jh8side-${TAG}.png  (${panels.length} panels: ${labels.join(' | ')})`);
