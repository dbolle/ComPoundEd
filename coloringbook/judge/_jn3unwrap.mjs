// NICKEL round 0 — POLAR UNWRAP WITH A LABELLED VIEWBOX-UNIT LADDER.
//
// §4.3 in its strongest form (round 4's S2): rather than build a fourth band
// detector — three have been built on the quarter and all three found the wrong
// feature — draw the coin in the coordinates the question is asked in and READ
// the band off. x = angle (270 deg = twelve o'clock), y = radius in OUR viewBox
// units, where 47 is the blank's edge and 50 the coin's centre.
//
// This is `_jq44unwrap.mjs`'s method with two changes and no edits to it:
//   - discs come from `_jn1discs.json` (the quarter's file has no nickel rows);
//   - the ladder runs 30..47 with a labelled rule every unit, because the
//     quantity being read here is a RIM SEAT and a LEGEND BAND, which on the
//     quarter turned out to be at 44.2 and 36.5-43.4 — i.e. mostly outside the
//     region the quarter's 24..47 ladder emphasised.
//
// The three coloured rules are OUR OWN drawing's radii, so the eye can see at
// once whether the coin agrees:
//   magenta 40.5  EDGE.nickel.field.mid        cyan 41.0  ...field.full
//   green   36.4  our reverse E PLURIBUS UNUM baseline (rField - 4.6 at full)
//
// Run: node coloringbook/judge/_jn3unwrap.mjs [file ...]
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
const HERE = (f) => new URL('./' + f, import.meta.url).pathname;
const D = JSON.parse(readFileSync(HERE('_jn1discs.json')));
const RA = 0.60, RB = 1.04;   // r/R window; 47 viewBox units = 1.000 R

export async function unwrap(file, W = 1800, H = 620) {
  const d = D[file];
  if (!d) throw new Error(`no frozen disc for ${file}`);
  const { data, info } = await sharp(P(file)).flatten({ background: '#808080' })
    .greyscale().raw().toBuffer({ resolveWithObject: true });
  const IW = info.width, IH = info.height;
  const at = (x, y) => {
    if (x < 0 || y < 0 || x >= IW - 1 || y >= IH - 1) return 0;
    const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0;
    return data[y0 * IW + x0] * (1 - fx) * (1 - fy) + data[y0 * IW + x0 + 1] * fx * (1 - fy)
      + data[(y0 + 1) * IW + x0] * (1 - fx) * fy + data[(y0 + 1) * IW + x0 + 1] * fx * fy;
  };
  const buf = Buffer.alloc(W * H);
  for (let j = 0; j < H; j++) {
    const r = RB - (RB - RA) * j / (H - 1);
    for (let i = 0; i < W; i++) {
      const th = (360 * i / W) * Math.PI / 180;
      buf[j * W + i] = Math.max(0, Math.min(255, Math.round(at(d.cx + r * d.R * Math.cos(th), d.cy + r * d.R * Math.sin(th)))));
    }
  }
  return { buf, W, H, rowRadius: (j) => 47 * (RB - (RB - RA) * j / (H - 1)) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const refs = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(D);
  for (const f of refs) {
    const { buf, W, H } = await unwrap(f);
    const y = (vbu) => ((RB - vbu / 47) / (RB - RA)) * (H - 1);
    let g = '';
    for (let vbu = 30; vbu <= 48; vbu++) {
      const yy = y(vbu); if (yy < 0 || yy > H) continue;
      const maj = vbu % 5 === 0;
      g += `<path d="M0 ${yy.toFixed(1)}H${W}" stroke="${maj ? '#ff2d55' : '#00e5ff'}" stroke-width="${maj ? 1.3 : 0.6}" opacity="${maj ? 0.9 : 0.45}"/>` +
        `<text x="3" y="${(yy - 2).toFixed(1)}" font-family="monospace" font-size="13" fill="#ffe600">${vbu}</text>` +
        `<text x="${W - 24}" y="${(yy - 2).toFixed(1)}" font-family="monospace" font-size="13" fill="#ffe600">${vbu}</text>`;
    }
    for (const [vbu, col, lab] of [[40.5, '#ff00d4', 'ours field.mid 40.5'], [41.0, '#00ff6a', 'ours field.full 41.0'], [36.4, '#ff9500', 'ours legend baseline 36.4']]) {
      g += `<path d="M0 ${y(vbu).toFixed(1)}H${W}" stroke="${col}" stroke-width="2" opacity="0.95"/>` +
        `<text x="${W / 2 - 90}" y="${(y(vbu) - 3).toFixed(1)}" font-family="monospace" font-size="14" fill="${col}">${lab}</text>`;
    }
    for (let a = 0; a < 360; a += 30) {
      const x = W * a / 360;
      g += `<path d="M${x} 0V${H}" stroke="#ffffff" stroke-width="0.7" opacity="0.4"/>` +
        `<text x="${x + 3}" y="15" font-family="monospace" font-size="12" fill="#ffffff">${a}${a === 270 ? " (12 o'clock)" : a === 90 ? " (6 o'clock)" : ''}</text>`;
    }
    const grey = await sharp(buf, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
    const out = HERE(`_jn3unwrap-${f.replace(/\..*$/, '')}.png`);
    const rgb = await sharp(grey).toColourspace('srgb').png().toBuffer();
    await sharp(rgb).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${g}</svg>`) }]).toFile(out);
    console.log(`${f} -> ${out}`);
  }
}
