// D12 — look at it. Our render at 84 / 54 / 26 px, at the REAL device pixel
// count, nearest-neighbour upscaled, beside the photograph reduced to the same
// device pixel count (§22.7: the eye is the right instrument for "is this the
// same thing" and a terrible one for "how big is it").
import sharp from 'sharp';

const CELL = 300, PAD = 10;
const SIZES = [84, 54, 26];
const REFS = {
  obverse: { file: 'quarter-obv-2.jpg', disc: { cx: 374.41, cy: 374.36, R: 373.67 } },
  reverse: { file: 'quarter-rev-2.png', disc: { cx: 374.50, cy: 374.37, R: 374.98 } },
};

const mod = await import('../../src/art/coins.js');

async function refGrey(side) {
  const { file } = REFS[side];
  const { data, info } = await sharp(new URL('../ref/' + file, import.meta.url).pathname)
    .flatten({ background: '#ffffff' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  if (data.length !== info.width * info.height) throw new Error('ref buffer length — UNTRUSTED');
  return { d: data, w: info.width, h: info.height };
}

// the photograph box-filtered down to boxW device pixels over the SAME
// viewBox square our render covers
async function refTile(side, boxW) {
  const g = await refGrey(side);
  const { disc } = REFS[side];
  const buf = Buffer.alloc(boxW * boxW);
  for (let j = 0; j < boxW; j++) for (let i = 0; i < boxW; i++) {
    let acc = 0, n = 0;
    for (let b = 0; b < 4; b++) for (let a = 0; a < 4; a++) {
      const X = (100 * (i + (a + 0.5) / 4)) / boxW, Y = (100 * (j + (b + 0.5) / 4)) / boxW;
      const px = disc.cx + ((X - 50) / 47) * disc.R, py = disc.cy + ((Y - 50) / 47) * disc.R;
      const xi = Math.max(0, Math.min(g.w - 1, Math.round(px))), yi = Math.max(0, Math.min(g.h - 1, Math.round(py)));
      acc += g.d[yi * g.w + xi]; n++;
    }
    buf[j * boxW + i] = Math.round(acc / n);
  }
  return sharp(buf, { raw: { width: boxW, height: boxW, channels: 1 } })
    .resize(CELL, CELL, { kernel: 'nearest' }).png().toBuffer();
}

async function ourTile(side, size) {
  const svg = mod.coinSVG('quarter', size, { side });
  const boxW = Math.max(8, Math.round(Number(svg.match(/width="([\d.]+)"/)[1])));
  const small = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
    .resize(boxW, boxW, { fit: 'fill' }).png().toBuffer();
  return { boxW, buf: await sharp(small).resize(CELL, CELL, { kernel: 'nearest' }).png().toBuffer() };
}

for (const side of ['obverse', 'reverse']) {
  const W = SIZES.length * (CELL + PAD) + PAD, H = 2 * (CELL + PAD) + PAD + 24;
  const comps = [];
  let x = PAD;
  for (const s of SIZES) {
    const o = await ourTile(side, s);
    comps.push({ input: o.buf, left: x, top: PAD + 24 });
    comps.push({ input: await refTile(side, o.boxW), left: x, top: PAD + 24 + CELL + PAD });
    x += CELL + PAD;
  }
  const label = `<svg width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#202020"/>` +
    SIZES.map((s, i) => `<text x="${PAD + i * (CELL + PAD) + 4}" y="18" fill="#fff" font-size="15" font-family="monospace">quarter ${side} ${s}px  (top: ours, bottom: photograph at the same device pixels)</text>`).join('') +
    '</svg>';
  const out = new URL(`./_jq-look-${side}.png`, import.meta.url).pathname;
  await sharp(Buffer.from(label)).composite(comps).png().toFile(out);
  console.log('wrote', out);
}

// and one large render of each side, for the marks the small tiers cannot show
for (const side of ['obverse', 'reverse']) {
  const svg = mod.coinSVG('quarter', 380, { side });
  const out = new URL(`./_jq-big-${side}.png`, import.meta.url).pathname;
  await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' }).resize(600, 600, { fit: 'fill' }).png().toFile(out);
  console.log('wrote', out);
}
