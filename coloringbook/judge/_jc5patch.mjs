// ROUND 5, cent obverse — §4.3 OVERLAY for D3. Draw the 12 frozen tone patches
// on the reference AND on our render at the same disc scale, label each with the
// ratio it actually reads, and write one PNG per source so the judge can look at
// what the numbers are numbers OF.
//
// Reads only. It imports `_pylib.mjs` at its published hash for the raster path
// and `_tonepatches-penny.json` for the locus; neither is edited.
//
// Run: node coloringbook/judge/_jc5patch.mjs [srcPath] [tag]
import sharp from 'sharp';
import { grey, DISC, DISCS, REF, ourRaster, ratioVector, loadJSON } from '../_pylib.mjs';

const SRC = process.argv[2] || '../../src/art/coins.js';
const TAG = process.argv[3] || 'base';
const { patches } = loadJSON(new URL('../_tonepatches-penny.json', import.meta.url).pathname);
const mod = await import(SRC.startsWith('.') ? SRC : `file://${SRC}`);

const OUT = 900;

async function draw(buf, w, h, disc, rat, title, file) {
  const k = OUT / (2.2 * disc.R);            // fit 2.2 disc radii across OUT px
  const ox = disc.cx - 1.1 * disc.R, oy = disc.cy - 1.1 * disc.R;
  const X = (u) => ((disc.cx + u * disc.R) - ox) * k;
  const Y = (v) => ((disc.cy + v * disc.R) - oy) * k;
  let g = '';
  for (const p of patches) {
    const c = p.name === 'cheek' ? '#ffff00' : p.name.startsWith('hair') || p.name.startsWith('beard') ? '#00ffff' : '#ff00ff';
    g += `<circle cx="${X(p.u).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="${(p.r * disc.R * k).toFixed(1)}" fill="none" stroke="${c}" stroke-width="2"/>`
      + `<text x="${(X(p.u) + p.r * disc.R * k + 4).toFixed(1)}" y="${(Y(p.v) + 4).toFixed(1)}" font-family="monospace" font-size="15" fill="${c}">${p.name} ${rat[p.name].toFixed(3)}</text>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${OUT}" height="${OUT + 26}">`
    + `<text x="6" y="${OUT + 19}" font-family="monospace" font-size="16" fill="#000">${title}</text>${g}</svg>`;
  const base = await sharp(buf, { raw: { width: w, height: h, channels: 1 } })
    .extract({ left: Math.max(0, Math.round(ox)), top: Math.max(0, Math.round(oy)),
      width: Math.min(w - Math.max(0, Math.round(ox)), Math.round(2.2 * disc.R)),
      height: Math.min(h - Math.max(0, Math.round(oy)), Math.round(2.2 * disc.R)) })
    .resize(OUT, OUT, { fit: 'fill' }).extend({ bottom: 26, background: '#fff' }).toColourspace('srgb').png().toBuffer();
  await sharp(base).composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).toFile(file);
  console.log('wrote', file);
}

const photo = await grey(REF);
const ref = ratioVector(photo, DISC, patches);
await draw(photo.d, photo.w, photo.h, DISC, ref.rat, 'penny-obv-3.jpg (FRAME reference) — patch / ratio to cheek', `coloringbook/_pv/_jc5patch-ref3.png`);

const g1909 = await grey('coloringbook/ref/penny-obv.jpg');
const r1909 = ratioVector(g1909, DISCS['penny-obv.jpg'], patches);
await draw(g1909.d, g1909.w, g1909.h, DISCS['penny-obv.jpg'], r1909.rat, 'penny-obv.jpg (1909-S, second struck reference)', `coloringbook/_pv/_jc5patch-1909.png`);

const our = await ourRaster(mod.coinSVG, DISC, photo.w, photo.h);
const ours = ratioVector(our, DISC, patches);
await draw(our.d, our.w, our.h, DISC, ours.rat, `OURS (${TAG})`, `coloringbook/_pv/_jc5patch-ours-${TAG}.png`);

// The sign test over the TWO STRUCK references only. penny-gates.md's D3s row
// excludes a cameo proof from tone by name (COIN-ART-METHOD §20.3) and
// penny-obv-2.jpg IS the 2002-S cameo proof; `_pytone.mjs` nevertheless includes
// it in its three-way sign column. Reported, not fixed (§1.1).
console.log('\npatch          -3      1909    sign(struck only)   ours    |D| vs -3');
let n = 0, s = 0, agree = 0;
for (const p of patches) {
  if (p.name === 'cheek') continue;
  const a = ref.rat[p.name], b = r1909.rat[p.name];
  const sg = [a, b].map((v) => (v > 1.02 ? '+' : v < 0.98 ? '-' : '0')).join('');
  const ok = sg[0] === sg[1] || (a - 1) * (b - 1) > 0;
  const d = Math.abs(ours.rat[p.name] - a);
  n++; s += d; if (ok) agree++;
  console.log(`${p.name.padEnd(13)} ${a.toFixed(3)}  ${b.toFixed(3)}   ${sg}  ${ok ? 'AGREE      ' : 'disagree   '} ${ours.rat[p.name].toFixed(3)}  ${d.toFixed(3)}`);
}
console.log(`\nmean |D| = ${(s / n).toFixed(4)} over ${n} patches; the two STRUCK references agree in sign on ${agree}/${n}`);
