// §4.3 — LOOK at what the segmenter is reading, before believing any number it
// produces. Publishes, side by side at the same scale: the greyscale, the
// |grad| energy, the barrier map, and the mask at one threshold.
import sharp from 'sharp';
import { energy, barrier } from '../_qtedge.mjs';
import { DISC, GUARD, guarded, floodMask } from './_jq21seg.mjs';

const dir = new URL('./', import.meta.url).pathname;

export async function panels(file, disc, tag, Ts, guard = GUARD) {
  const { G, W, H, grey } = await energy(file, disc);
  const Gg = guarded(G, W, H, disc, guard);
  const Bar = barrier(Gg, W, H, disc);
  const S = 520;
  const half = Math.round(1.02 * disc.R);
  const crop = async (buf) => {
    const png = await sharp(buf, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
    const ext = await sharp(png).extend({ top: half, bottom: half, left: half, right: half, background: { r: 0, g: 0, b: 0 } }).png().toBuffer();
    return sharp(ext).extract({ left: Math.round(disc.cx), top: Math.round(disc.cy), width: 2 * half, height: 2 * half })
      .resize(S, S).png().toBuffer();
  };

  const u8 = (arr, lo, hi) => {
    const o = Buffer.alloc(W * H);
    for (let i = 0; i < W * H; i++) o[i] = Math.max(0, Math.min(255, Math.round(255 * (arr[i] - lo) / (hi - lo))));
    return o;
  };
  const outs = [];
  outs.push(['grey', await crop(Buffer.from(grey))]);
  outs.push(['energy 0..8', await crop(u8(G, 0, 8))]);
  const bf = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) bf[i] = Number.isFinite(Bar[i]) ? Bar[i] : 0;
  outs.push(['barrier 0..10', await crop(u8(bf, 0, 10))]);
  for (const T of Ts) {
    const s = floodMask(Gg, W, H, disc, T);
    const m = Buffer.alloc(W * H);
    for (let i = 0; i < W * H; i++) m[i] = s.m[i] ? 255 : 0;
    outs.push([`mask T=${T} (${(100 * s.area / (Math.PI * disc.R * disc.R)).toFixed(1)}%)`, await crop(m)]);
  }
  const cols = outs.length;
  const lab = outs.map((o, i) => `<text x="${i * S + 6}" y="16" fill="#0f0" font-size="15" font-family="monospace">${o[0]}</text>`).join('');
  await sharp({ create: { width: cols * S, height: S, channels: 3, background: '#000' } })
    .composite([...outs.map((o, i) => ({ input: o[1], left: i * S, top: 0 })),
      { input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${cols * S}" height="${S}">${lab}</svg>`), left: 0, top: 0 }])
    .png().toFile(dir + `_jq-${tag}-panels.png`);
  console.log(`wrote _jq-${tag}-panels.png`);

  // and the histogram of the energy inside 0.80R, which is what decides whether
  // a threshold can exist at all
  const h = new Array(40).fill(0);
  let n = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (Math.hypot(x - disc.cx, y - disc.cy) > 0.80 * disc.R) continue;
    const b = Math.min(39, Math.floor(G[y * W + x] * 2)); h[b]++; n++;
  }
  console.log(`|grad| histogram inside 0.80R (bin = 0.5 units), ${n} px:`);
  console.log('  ' + h.map((c, i) => `${(i / 2).toFixed(1)}:${(100 * c / n).toFixed(1)}`).slice(0, 24).join(' '));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await panels('quarter-rev-3.jpg', DISC, 'rev3', [2.0, 3.0]);
  await panels('quarter-rev-2.png', { cx: 374.50, cy: 374.37, R: 374.98 }, 'rev2', [2.5, 3.5]);
}
