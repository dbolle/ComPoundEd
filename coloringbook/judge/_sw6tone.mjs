// SPECIALIST (buck obverse) — the note's own TONE ORDERING inside the frozen
// vignette oval, on both obverse references, so the choice of which palette
// entry fills which mass is measured rather than remembered.
//
// This is NOT a D3/D13 measurement and no gate is being chased: it reports
// the ORDER of the masses (which is lighter than which), normalised to the
// oval's own ground so exposure cancels. Absolute values are printed too.
//
//   node coloringbook/judge/_sw6tone.mjs
import { rectify, XY2uv } from '../_blnorm.mjs';

const REFS = ['bill-obv.jpg', 'bill-obv-2.jpg'];
const NU = 2400, NV = 950;

// Patches read off _sw4-ladder-ref2.png (generator coloringbook/judge/_sw4ladder.mjs),
// in OUR viewBox units. Each is a small axis-aligned box wholly inside its mass.
const PATCH = {
  'ground (oval field, upper left)': [42.0, 19.0, 44.0, 21.0],
  'ground (oval field, upper right)': [56.5, 19.5, 58.5, 21.5],
  'wig (left roll)': [43.6, 25.0, 45.6, 27.0],
  'wig (right roll)': [55.0, 25.5, 56.4, 27.5],
  'wig (crown)': [48.5, 19.0, 50.5, 20.5],
  'face (forehead)': [50.5, 22.2, 52.5, 23.6],
  'face (cheek, lit side)': [53.0, 27.5, 54.6, 29.0],
  'jabot (centre ruffle)': [49.0, 38.0, 51.0, 40.0],
  'coat (left mass)': [42.5, 39.0, 45.5, 42.0],
  'coat (right mass)': [55.0, 39.0, 57.5, 42.0],
};

for (const ref of REFS) {
  const { out } = await rectify(ref, NU, NV);
  const mean = (b) => {
    let s = 0, n = 0;
    for (let Y = b[1]; Y <= b[3]; Y += 0.05) for (let X = b[0]; X <= b[2]; X += 0.05) {
      const [u, v] = XY2uv(X, Y);
      const px = Math.round(u * NU - 0.5), py = Math.round(v * NV - 0.5);
      s += out[Math.max(0, Math.min(NV - 1, py)) * NU + Math.max(0, Math.min(NU - 1, px))]; n++;
    }
    return s / n;
  };
  const vals = Object.fromEntries(Object.entries(PATCH).map(([k, b]) => [k, mean(b)]));
  const ground = (vals['ground (oval field, upper left)'] + vals['ground (oval field, upper right)']) / 2;
  console.log(`\n${ref}   ground (oval field) mean grey ${ground.toFixed(1)}`);
  for (const [k, v] of Object.entries(vals).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${(v / ground).toFixed(3)}  x ground   grey ${v.toFixed(1).padStart(6)}   ${k}`);
  }
}

// our palette's own greys, for the mapping
const P = { rim: '#3f7a4e', body: '#cfe3c6', field: '#eaf4e3', motif: '#6d9c73', deep: '#54855e', hair: '#5d8d65', cloth: '#a9c8a4', ink: '#26583a' };
const lum = (h) => {
  const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b; // the same weights sharp's greyscale() uses
};
console.log('\nPALETTE.buck greys (Rec.601, as sharp greyscale()):');
for (const [k, v] of Object.entries(P).sort((a, b) => lum(b[1]) - lum(a[1]))) console.log(`   ${lum(v).toFixed(1).padStart(6)}  ${k.padEnd(6)} ${v}`);
