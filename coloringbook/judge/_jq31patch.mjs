// TASK 2, step 2 — the QUARTER REVERSE patch set (§12.2), and the choice of
// normaliser, which is the hard part.
//
// §12.2 says: choose 8-12 anatomical patches, each wholly inside one feature,
// store them disc-normalised, take the MEDIAN, and divide every patch by a
// normaliser that is "a large, flat, feature-free area — an open cheek is
// ideal". The reverse has no cheek.
//
// Positions are read off judge/_jq-rev3-grid.png (published, §4.3) in viewBox
// coordinates, X = 50 + 47u, Y = 50 + 47v, and this file draws them back onto
// BOTH references so that "breast is on the breast" is auditable and not
// asserted (§6 rule 3).
import sharp from 'sharp';
import { REFS, load, at } from './_jq30inv.mjs';

const dir = new URL('./', import.meta.url).pathname;

// name, X, Y, radius — all in viewBox units (disc r = 47)
export const PATCHES = [
  // (positions corrected after LOOKING at _jq-rev-patches-rev-3.png: `head`
  // was sitting on the neck, `arrows` overflowed the bundle, `fieldLo` was
  // clipping the tail.)
  ['head', 50.0, 24.5, 1.4],           // the eagle's head, above the neck
  ['breast', 50.5, 40.0, 3.0],         // the body's broad front mass
  ['bodyLow', 50.0, 51.0, 2.0],        // body between the legs
  ['wingInL', 40.0, 30.0, 2.2],        // left wing, inner, near the shoulder
  ['wingInR', 60.5, 30.0, 2.2],
  ['wingMidL', 33.0, 38.0, 2.6],       // left wing, middle of the covert mass
  ['wingMidR', 67.5, 38.0, 2.6],
  ['wingOutL', 24.0, 45.0, 2.6],       // left wing, the primaries
  ['wingOutR', 76.0, 45.0, 2.6],
  ['arrows', 40.0, 62.0, 1.0],         // the bundle (thin: r kept under its half-height)
  ['wreathL', 32.0, 71.0, 2.0],        // olive wreath, left branch
  ['wreathR', 67.0, 71.0, 2.0],
  ['wreathBot', 50.0, 76.0, 2.0],      // wreath, bottom centre
  ['fieldLo', 50.0, 58.0, 2.0],        // BARE FIELD between the tail and the arrows
  ['fieldUL', 27.0, 27.0, 2.2],        // BARE FIELD upper left, inside the legend
  ['fieldUR', 73.5, 27.0, 2.2],        // BARE FIELD upper right
];
export const XY2uv = (X, Y) => [(X - 50) / 47, (Y - 50) / 47];

export function sample(g, D, X, Y, r) {
  const [u, v] = XY2uv(X, Y), ru = r / 47;
  const vals = [];
  const step = ru * D.R / 12;
  for (let dy = -ru * D.R; dy <= ru * D.R; dy += step)
    for (let dx = -ru * D.R; dx <= ru * D.R; dx += step) {
      if (Math.hypot(dx, dy) > ru * D.R) continue;
      vals.push(at(g, D.cx + u * D.R + dx, D.cy + v * D.R + dy));
    }
  vals.sort((a, b) => a - b);
  return { med: vals[vals.length >> 1], sd: Math.sqrt(vals.reduce((a, b) => a + (b - vals.reduce((p, q) => p + q, 0) / vals.length) ** 2, 0) / vals.length), n: vals.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const S = 900;
  for (const [tag, file, D] of REFS) {
    const g = await load(file);
    const rows = PATCHES.map(([n, X, Y, r]) => [n, sample(g, D, X, Y, r)]);
    console.log(`\n${tag} (${file})  median grey / within-patch sd, per patch:`);
    for (const [n, s] of rows) console.log(`  ${n.padEnd(10)} ${s.med.toFixed(1).padStart(6)}  sd ${s.sd.toFixed(1).padStart(5)}  n ${s.n}`);

    // draw them
    const half = Math.round(1.02 * D.R);
    const meta = await sharp(new URL('../ref/' + file, import.meta.url).pathname).metadata();
    const pad = Math.max(0, half - Math.round(Math.min(D.cx, D.cy)), half - Math.round(Math.min(meta.width - D.cx, meta.height - D.cy))) + 2;
    const padded = await sharp(new URL('../ref/' + file, import.meta.url).pathname).flatten({ background: '#ffffff' })
      .extend({ top: pad, bottom: pad, left: pad, right: pad, background: '#ffffff' }).png().toBuffer();
    const buf = await sharp(padded).extract({ left: Math.round(D.cx + pad - half), top: Math.round(D.cy + pad - half), width: 2 * half, height: 2 * half }).resize(S, S).png().toBuffer();
    const mk = PATCHES.map(([n, X, Y, r]) => {
      const [u, v] = XY2uv(X, Y);
      const px = (u / 1.02 + 1) * S / 2, py = (v / 1.02 + 1) * S / 2, pr = (r / 47) / 1.02 * S / 2;
      const col = n.startsWith('field') ? '#0ff' : '#0f0';
      return `<circle cx="${px}" cy="${py}" r="${pr}" fill="none" stroke="${col}" stroke-width="2"/><text x="${px + pr + 2}" y="${py + 4}" fill="${col}" font-size="13" font-family="monospace">${n}</text>`;
    }).join('');
    await sharp(buf).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">${mk}</svg>`) }]).png().toFile(dir + `_jq-rev-patches-${tag}.png`);
    console.log(`  wrote _jq-rev-patches-${tag}.png`);
  }
}
