// §4.3 — publish the reference with a viewBox grid and radius rings on it, so
// every geometric constant used downstream (guards, band radii, patch centres)
// is read off a picture a human can audit rather than asserted.
import sharp from 'sharp';
const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;

export async function grid(file, D, out, S = 900, rings = [0.63, 0.70, 0.78, 0.835, 0.90]) {
  let g = '';
  for (let X = 10; X <= 90; X += 10) {
    const u = (X - 50) / 47;
    const px = (u / 1.02 + 1) * S / 2;
    g += `<line x1="${px}" y1="0" x2="${px}" y2="${S}" stroke="#0ff" stroke-width="1" opacity="0.55"/>`;
    g += `<line x1="0" y1="${px}" x2="${S}" y2="${px}" stroke="#0ff" stroke-width="1" opacity="0.55"/>`;
    g += `<text x="${px + 2}" y="14" fill="#ff0" font-size="14">${X}</text>`;
    g += `<text x="3" y="${px - 3}" fill="#f0f" font-size="14">${X}</text>`;
  }
  for (const rr of rings) {
    const rp = rr / 1.02 * S / 2;
    g += `<circle cx="${S / 2}" cy="${S / 2}" r="${rp}" fill="none" stroke="#f00" stroke-width="1.5" opacity="0.8"/>`;
    g += `<text x="${S / 2 + rp * 0.707 + 3}" y="${S / 2 - rp * 0.707}" fill="#f00" font-size="15">${rr}R</text>`;
  }
  const half = Math.round(1.02 * D.R);
  const meta = await sharp(P(file)).metadata();
  const pad = Math.max(0, half - Math.round(Math.min(D.cx, D.cy)),
    half - Math.round(Math.min(meta.width - D.cx, meta.height - D.cy))) + 2;
  const left = Math.round(D.cx + pad - half), top = Math.round(D.cy + pad - half);
  const padded = await sharp(P(file)).flatten({ background: '#ffffff' })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: '#ffffff' }).png().toBuffer();
  const buf = await sharp(padded)
    .extract({ left, top, width: 2 * half, height: 2 * half })
    .resize(S, S).png().toBuffer();
  await sharp(buf).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">${g}</svg>`) }]).png().toFile(out);
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dir = new URL('./', import.meta.url).pathname;
  await grid('quarter-rev-3.jpg', { cx: 999.50, cy: 999.45, R: 999.49 }, dir + '_jq-rev3-grid.png');
  await grid('quarter-rev-2.png', { cx: 374.50, cy: 374.37, R: 374.98 }, dir + '_jq-rev2-grid.png');
  console.log('wrote _jq-rev3-grid.png, _jq-rev2-grid.png');
}
