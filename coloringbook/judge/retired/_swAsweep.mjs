// SPECIALIST (buck obverse) — the two tone choices this round actually makes,
// swept, with BOTH the D13 numbers and a contact sheet, so the choice is made
// on evidence and the cost of the choice is published either way.
//
// The variables are the VIGNETTE GROUND and the COAT. Nothing else: the
// palette itself is protected (owner decision 2) and this only ever assigns an
// existing PALETTE.buck entry to a mass.
//
// D13 is measured by editing a COPY of coins.js in a temp dir and pointing a
// copy of `_jb10d13.mjs`'s own arithmetic at it — the real instrument is
// hashed and reads a fixed path, and is re-run by the judge on whatever ships.
// The numbers here are a working instrument, not evidence.
//
//   node coloringbook/judge/_swAsweep.mjs
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdtempSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { fitBorder, grey } from '../_blfit.mjs';
import { homography, uv2px, at } from '../_blnorm.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const P = { rim: '#3f7a4e', body: '#cfe3c6', field: '#eaf4e3', motif: '#6d9c73', deep: '#54855e', hair: '#5d8d65', cloth: '#a9c8a4', ink: '#26583a' };

// the frozen D13 obverse windows, as literals (gates file §6)
const WIN = { portrait: [32.05, 68.05, 5, 51], frame: [5, 95, 5, 51] };
const REF = 'bill-obv-2.jpg';

const fit = await fitBorder(REF);
const g = await grey(REF);
const H = homography(fit.corners);
const FRAME = { x0: 5, y0: 5, x1: 95, y1: 51 };
const XY2uv = (X, Y) => [(X - FRAME.x0) / (FRAME.x1 - FRAME.x0), (Y - FRAME.y0) / (FRAME.y1 - FRAME.y0)];

function refWindow(w, W, Hh) {
  const out = new Float64Array(W * Hh);
  for (let j = 0; j < Hh; j++) for (let i = 0; i < W; i++) {
    const X = w[0] + ((i + 0.5) / W) * (w[1] - w[0]);
    const Y = w[2] + ((j + 0.5) / Hh) * (w[3] - w[2]);
    const [u, v] = XY2uv(X, Y);
    const [px, py] = uv2px(H, u, v);
    out[j * W + i] = at(g, px, py);
  }
  return out;
}
const p90 = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(0.9 * (s.length - 1))]; };
const stats = (a) => { const f = p90(a); let s = 0, ink = 0; for (const v of a) { s += v; if (v < 0.75 * f) ink++; } return { mean: s / a.length / f, ink: ink / a.length }; };

async function oursWindow(mod, size, w, W, Hh) {
  const box = mod.coinPx('buck', size);
  const bw = Math.round(box.w), bh = Math.round(box.h);
  const png = await sharp(Buffer.from(mod.coinSVG('buck', size, { side: 'obverse' })))
    .flatten({ background: '#ffffff' }).resize(bw, bh, { fit: 'fill' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  const { data, info } = png;
  const out = new Float64Array(W * Hh);
  for (let j = 0; j < Hh; j++) for (let i = 0; i < W; i++) {
    const X = w[0] + ((i + 0.5) / W) * (w[1] - w[0]);
    const Y = w[2] + ((j + 0.5) / Hh) * (w[3] - w[2]);
    const px = Math.min(info.width - 1, Math.max(0, Math.round((X / 100) * info.width - 0.5)));
    const py = Math.min(info.height - 1, Math.max(0, Math.round((Y / 56) * info.height - 0.5)));
    out[j * W + i] = data[py * info.width + px];
  }
  return out;
}

const CANDS = [
  { name: 'SHIPPED   ground motif / coat rim', ground: 'motif', coat: 'rim' },
  { name: 'darker gd ground hair  / coat rim', ground: 'hair', coat: 'rim' },
  { name: 'dark coat ground motif / coat ink', ground: 'motif', coat: 'ink' },
  { name: 'both      ground hair  / coat ink', ground: 'hair', coat: 'ink' },
  { name: 'darkest   ground rim   / coat ink', ground: 'rim', coat: 'ink' },
];

const src = readFileSync(join(ROOT, 'src/art/coins.js'), 'utf8');
const tmp = mkdtempSync(join(tmpdir(), 'swA-'));
cpSync(join(ROOT, 'src'), join(tmp, 'src'), { recursive: true });

const tiles = [];
for (const c of CANDS) {
  let s = src;
  s = s.replace('rx="9.75" ry="14" fill="${p.motif}" stroke="${p.rim}"', `rx="9.75" ry="14" fill="\${p.${c.ground}}" stroke="\${p.rim}"`);
  s = s.replace('`<g fill="${p.rim}"><path d="${VIGNETTE.coat}"/></g>` +', `\`<g fill="\${p.${c.coat}}"><path d="\${VIGNETTE.coat}"/></g>\` +`);
  s = s.replace('`<g fill="${p.rim}"><path d="${VIGNETTE.coat}"/></g>`;', `\`<g fill="\${p.${c.coat}}"><path d="\${VIGNETTE.coat}"/></g>\`;`);
  const f = join(tmp, 'src', 'art', `coins-${c.ground}-${c.coat}.js`);
  writeFileSync(f, s);
  const mod = await import(pathToFileURL(f).href);
  const line = [];
  for (const [tier, size, W, Hh] of [['icon', 38, 12, 14], ['mid', 54, 25, 32], ['full', 190, 85, 108]]) {
    for (const [wn, w] of [['portrait', WIN.portrait], ['frame', WIN.frame]]) {
      const ww = wn === 'frame' ? Math.round(W * 2.5) : W;
      const o = stats(await oursWindow(mod, size, w, ww, Hh));
      const r = stats(refWindow(w, ww, Hh));
      line.push(`${tier.padEnd(4)} ${wn.padEnd(8)} d ${(o.mean - r.mean >= 0 ? '+' : '')}${(o.mean - r.mean).toFixed(4)}  dink ${(o.ink - r.ink).toFixed(3)}`);
    }
  }
  console.log(`\n${c.name}`);
  for (const l of line) console.log('   ' + l);
  // contact tile at the naming draw and at icon
  for (const size of [38, 84]) {
    const box = mod.coinPx('buck', size); const bw = Math.round(box.w), bh = Math.round(box.h);
    const png = await sharp(Buffer.from(mod.coinSVG('buck', size, { side: 'obverse' }))).flatten({ background: '#fff' }).resize(bw, bh, { fit: 'fill' }).png().toBuffer();
    const sx = bw / 100, sy = bh / 56;
    const L = Math.floor(38 * sx), T = Math.floor(14 * sy);
    const CW = Math.min(bw - L, Math.ceil(24 * sx)), CH = Math.min(bh - T, Math.ceil(32 * sy));
    const k = Math.max(1, Math.round(260 / CW));
    tiles.push({ buf: await sharp(png).extract({ left: L, top: T, width: CW, height: CH }).resize(CW * k, CH * k, { kernel: 'nearest' }).png().toBuffer(), w: CW * k, h: CH * k, label: `${c.ground}/${c.coat} @${size}` });
  }
}
const W = tiles.reduce((s, t) => s + t.w + 10, 10), Hh = Math.max(...tiles.map((t) => t.h)) + 40;
let x = 10, comp = [], lab = '';
for (const t of tiles) { comp.push({ input: t.buf, left: x, top: 10 }); lab += `<text x="${x}" y="${Hh - 8}" fill="#9ad" font-size="13" font-family="monospace">${t.label}</text>`; x += t.w + 10; }
const base = await sharp({ create: { width: W, height: Hh, channels: 3, background: '#101010' } }).png().toBuffer();
await sharp(base).composite([...comp, { input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${Hh}">${lab}</svg>`), top: 0, left: 0 }])
  .png().toFile('coloringbook/judge/_swout/_swA-sweep.png');
console.log('\ncoloringbook/judge/_swout/_swA-sweep.png');
