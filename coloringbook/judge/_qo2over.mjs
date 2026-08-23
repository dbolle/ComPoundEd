// QUARTER OBVERSE — our drawn EDGES, in red, on each allowed photograph, at
// the photograph's own rim-fitted disc.
//
// §4.3's overlay obligation. The disc fit is `_rvdisc.fit` (ray-cast boundary
// to a Kasa circle — a RIM fit), printed with its p95 residual; the AREA
// `discOf()` that most private copies in this library carry is off a rim fit by
// -1.9% to -31.8% and is not used anywhere here.
//
// SCALE: our blank is at r=47 of the 100-unit viewBox, so viewBox X maps to
// px = cx + ((X-50)/47)*R. `_nk3over.mjs` records what using 50 costs: our
// device drawn 6% small, flattering every placement for the tool's whole life.
// SELF-CHECK: the overlay's own red ring must land on the photograph's rim.
// The rim is drawn from our render like every other edge — if the scale were
// wrong the ring would visibly miss, so the check is in the picture.
//
// Run: node coloringbook/judge/_qo2over.mjs [tag]
import sharp from 'sharp';
import { JUDGE } from './_paths.mjs';
import { STRUCK, disc, grey, atVB, ours, atVBours } from './_qo1zoom.mjs';

const S = 900;                       // output px per panel; 9 px per viewBox unit
const o = await ours(1800);

// our edges: a boolean edge map of the live render, in viewBox space
const EDGE = new Uint8Array(S * S);
{
  const v = new Float64Array(S * S);
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) v[j * S + i] = atVBours(o, (i + 0.5) * 100 / S, (j + 0.5) * 100 / S);
  for (let j = 1; j < S - 1; j++) for (let i = 1; i < S - 1; i++) {
    const p = j * S + i;
    const gx = v[p + 1] - v[p - 1], gy = v[p + S] - v[p - S];
    EDGE[p] = Math.hypot(gx, gy) > 14 ? 1 : 0;
  }
}

const tiles = [];
let x = 0;
for (const f of STRUCK) {
  const d = await disc(f);
  const g = await grey(f);
  console.log(`${f.padEnd(26)} cx ${d.cx.toFixed(1)} cy ${d.cy.toFixed(1)} R ${d.R.toFixed(1)}  rim p95 ${d.p95pc.toFixed(2)}% of R`);
  const rgb = Buffer.alloc(S * S * 3);
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
    const p = j * S + i;
    const t = Math.max(0, Math.min(255, Math.round(atVB(g, d, (i + 0.5) * 100 / S, (j + 0.5) * 100 / S))));
    if (EDGE[p]) { rgb[p * 3] = 255; rgb[p * 3 + 1] = 0; rgb[p * 3 + 2] = 0; }
    else { rgb[p * 3] = t; rgb[p * 3 + 1] = t; rgb[p * 3 + 2] = t; }
  }
  tiles.push({ input: await sharp(rgb, { raw: { width: S, height: S, channels: 3 } }).png().toBuffer(), left: 12 + x * (S + 12), top: 26 });
  x++;
}
const W = 12 + STRUCK.length * (S + 12), H = 26 + S + 12;
const labels = STRUCK.map((f, i) => `<text x="${12 + i * (S + 12)}" y="18" font-family="monospace" font-size="14" fill="#111">${f} — OUR EDGES IN RED</text>`).join('');
const out = `${JUDGE}/_qo2over-${process.argv[2] || 'all'}.png`;
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/>${labels}</svg>`))
  .composite(tiles).png().toFile(out);
console.log('wrote judge/' + out.split('/').pop());
