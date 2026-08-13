// D12 round 1 — the same eye, pointed at the thing that changed.
//
// The specialist's visual claim is narrow and checkable: at mid/full the
// quarter reverse's field ring was broken by a white sliver at about ten
// o'clock (the eagle's lit wing-tip copy printed over the ring), and is now
// unbroken. So: our render BEFORE and AFTER, at the real device pixel count,
// nearest-upscaled — no interpolation, so a one-device-pixel sliver stays one
// block and cannot be smoothed into an impression.
//
// Row 1 = round 0, row 2 = round 1, row 3 = |difference| stretched, which is
// where the eye is told to look rather than left to hunt.
//
// Run: node coloringbook/judge/_jq12look-r1.mjs <before.js> <after.js>
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { loadCoins } from './_jq8contain-v2.mjs';

const CELL = 380, PAD = 8, TOP = 26;

async function plane(mod, id, side, size) {
  const svg = mod.coinSVG(id, size, { side });
  const boxW = Math.max(8, Math.round(Number(svg.match(/width="([\d.]+)"/)[1])));
  const boxH = Math.max(8, Math.round(Number(svg.match(/height="([\d.]+)"/)[1])));
  const { data, info } = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
    .resize(boxW, boxH, { fit: 'fill' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  if (data.length !== info.width * info.height) throw new Error('buffer length — D12 UNTRUSTED');
  return { d: data, w: info.width, h: info.height };
}

const tile = (p) => sharp(Buffer.from(p.d), { raw: { width: p.w, height: p.h, channels: 1 } })
  .resize(CELL, CELL, { kernel: 'nearest' }).png().toBuffer();

const [beforePath, afterPath] = process.argv.slice(2);
const A = await loadCoins(readFileSync(beforePath, 'utf8'));
const B = await loadCoins(readFileSync(afterPath, 'utf8'));

for (const [id, side, sizes] of [['quarter', 'reverse', [84, 54, 26]], ['dime', 'reverse', [84, 54]], ['nickel', 'reverse', [84, 54]]]) {
  const comps = [];
  let x = PAD;
  const labels = [];
  for (const s of sizes) {
    const a = await plane(A, id, side, s);
    const b = await plane(B, id, side, s);
    if (a.w !== b.w) throw new Error('device pixel count changed — not a like-for-like look');
    const diff = Buffer.alloc(a.w * a.h);
    let maxd = 0, n = 0;
    for (let i = 0; i < diff.length; i++) {
      const d = Math.abs(a.d[i] - b.d[i]);
      if (d > maxd) maxd = d;
      if (d > 0) n++;
      diff[i] = d;
    }
    const k = maxd ? 255 / maxd : 1;
    for (let i = 0; i < diff.length; i++) diff[i] = Math.min(255, Math.round(diff[i] * k));
    labels.push(`${id} ${side} ${s}px  (${a.w}x${a.h} device px)  diff: ${n} px changed, max |d| ${maxd}`);
    comps.push({ input: await tile(a), left: x, top: TOP });
    comps.push({ input: await tile(b), left: x, top: TOP + CELL + PAD });
    comps.push({ input: await tile({ d: diff, w: a.w, h: a.h }), left: x, top: TOP + 2 * (CELL + PAD) });
    x += CELL + PAD;
  }
  const W = sizes.length * (CELL + PAD) + PAD, H = 3 * (CELL + PAD) + TOP + PAD;
  const label = `<svg width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#101010"/>`
    + labels.map((t, i) => `<text x="${PAD + i * (CELL + PAD) + 3}" y="17" fill="#fff" font-size="13" font-family="monospace">${t}</text>`).join('')
    + `<text x="4" y="${TOP + 14}" fill="#ff0" font-size="13" font-family="monospace">r0</text>`
    + `<text x="4" y="${TOP + CELL + PAD + 14}" fill="#0f0" font-size="13" font-family="monospace">r1</text>`
    + `<text x="4" y="${TOP + 2 * (CELL + PAD) + 14}" fill="#f0f" font-size="13" font-family="monospace">|d|</text></svg>`;
  const out = new URL(`./_jq-r1-${id}-${side}.png`, import.meta.url).pathname;
  await sharp(Buffer.from(label)).composite(comps).png().toFile(out);
  console.log('wrote', out, '—', labels.join(' | '));
}
