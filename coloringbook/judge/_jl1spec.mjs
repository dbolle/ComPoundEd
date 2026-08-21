// SPECIALIST INSTRUMENT — round 1, D5. THE SPECULAR ARC OVER THE NEW LETTERS.
//
// Growing the caps to the coins' own heights pushes the cap tops from ~40.9 to
// 42.1..43.5, and the white specular highlight — `<path ... r 43.4, 216°..266°,
// stroke-width sw(3,1.4), opacity 0.26>` — is emitted AFTER the inscription, so
// it now lies over part of every top legend. Before this round the tallest cap
// stopped at 40.9 and the arc's inner edge is 41.9, so it crossed nothing; the
// v1.57.0 note in `coins.js` says exactly that.
//
// This measures the cost instead of arguing about it: mean grey of the LEGEND
// INK inside the arc's sector against the same legend's ink outside it, on the
// same render, at the same radius. Ink pixels are found by thresholding against
// the field level, and the SAME threshold is used on both sides, so the two
// numbers differ only by the veil.
//
// §4 RESPONSE: RESPONSE=1 re-measures with the arc's opacity set to 0 — the
//   inside/outside difference must collapse to ~0.
// §4.1 NULL: no search. The sector is the literal in the path (216..266).
// §4.3 OVERLAY: writes `_jl1spec-<coin>.png`, the render with the measured
//   sector marked, so it can be looked at.
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCoins } from './_jq8contain-v2.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const ARC = [216, 266];             // the literal in discSVG's specular path
const SIZE = Number(process.env.SIZE || 380);

async function grey(svg, S) {
  const { data, info } = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
    .resize(S, S, { fit: 'fill' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  if (info.channels !== 1) throw new Error('channels — UNTRUSTED');
  return (X, Y) => data[Math.min(S - 1, Math.max(0, Math.round((Y / 100) * S))) * S + Math.min(S - 1, Math.max(0, Math.round((X / 100) * S)))];
}

// mean ink level in a radial band over an angular range, ink = below field*0.9
async function band(fn, r0, r1, a0, a1, field) {
  let sum = 0, n = 0;
  for (let a = a0; a < a1; a += 0.1) {
    for (let r = r0; r <= r1; r += 0.05) {
      const th = (a * Math.PI) / 180;
      const v = fn(50 + r * Math.cos(th), 50 + r * Math.sin(th));
      if (v < field * 0.9) { sum += v; n++; }
    }
  }
  return { mean: n ? sum / n : NaN, n };
}

const src = readFileSync(join(ROOT, 'src/art/coins.js'), 'utf8');
const mod = await loadCoins(src);
const flat = await loadCoins(src.replace('stroke-linecap="round" opacity="0.26"', 'stroke-linecap="round" opacity="0"'));

// top-legend band per coin: [baseline, capTop], from the constants, reported only
const BANDS = { penny: [36.4, 42.8], nickel: [36.4, 42.0], dime: [34.2, 42.1], quarter: [36.4, 43.1] };
console.log(`specular arc ${ARC[0]}..${ARC[1]}° at r 43.4, stroke sw(3,1.4), opacity 0.26 — drawn AFTER the inscription`);
console.log(`size ${SIZE}, top legend band per coin (reported, not a locus for anything gated)\n`);
console.log('coin     legend band     field   ink INSIDE arc   ink OUTSIDE arc   veil   arc off: inside');
for (const id of ['penny', 'nickel', 'dime', 'quarter']) {
  const S = 900;
  const [r0, r1] = BANDS[id];
  const fn = await grey(mod.coinSVG(id, SIZE, { side: 'reverse' }), S);
  const fn0 = await grey(flat.coinSVG(id, SIZE, { side: 'reverse' }), S);
  const field = fn(50, 50 + (r0 + r1) / 2 - 6);          // bare field just inboard of the band
  const inA = await band(fn, r0, r1, ARC[0], ARC[1], field);
  const outA = await band(fn, r0, r1, 275, 340, field);
  const inB = await band(fn0, r0, r1, ARC[0], ARC[1], field);
  console.log(`${id.padEnd(8)} ${r0.toFixed(1)}..${r1.toFixed(1)}      ${String(field).padStart(4)}    ${inA.mean.toFixed(1).padStart(6)} (${String(inA.n).padStart(5)}px)  ${outA.mean.toFixed(1).padStart(6)} (${String(outA.n).padStart(5)}px)  ${(inA.mean - outA.mean).toFixed(1).padStart(6)}   ${inB.mean.toFixed(1).padStart(6)}`);
}
console.log('\n"veil" = how much lighter the ink is where the arc crosses it. The last column is the same measurement with the arc at opacity 0 — the §4 response test: it must fall back to the OUTSIDE value.');

// §4.3 overlay
const S = 1200;
const png = await sharp(Buffer.from(mod.coinSVG('quarter', SIZE, { side: 'reverse' }))).flatten({ background: '#fff' }).resize(S, S, { fit: 'fill' }).png().toBuffer();
const u = S / 100;
const pts = [];
for (let a = ARC[0]; a <= ARC[1]; a += 1) { const th = (a * Math.PI) / 180; pts.push(`${(50 + 43.4 * Math.cos(th)) * u},${(50 + 43.4 * Math.sin(th)) * u}`); }
const ov = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">`
  + `<polyline points="${pts.join(' ')}" fill="none" stroke="#f0f" stroke-width="2" opacity="0.9"/>`
  + `<circle cx="${50 * u}" cy="${50 * u}" r="${36.4 * u}" fill="none" stroke="#0c0" stroke-width="1.5"/>`
  + `<circle cx="${50 * u}" cy="${50 * u}" r="${43.1 * u}" fill="none" stroke="#0c0" stroke-width="1.5"/></svg>`;
await sharp(png).composite([{ input: Buffer.from(ov) }]).png().toFile(join(HERE, '_jl1spec-quarter.png'));
console.log('wrote _jl1spec-quarter.png — magenta = the arc centre line, green = the top legend band. §4.3: look at it.');
