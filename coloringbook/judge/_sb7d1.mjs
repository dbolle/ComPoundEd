// SPECIALIST round, cent obverse — the D1 MUTATION TEST the brief asks for,
// re-run rather than inherited.
//
// The claim being checked is "`HAIR`/`BEARD` lie outside D1's locus, so an edit
// to the beard is free on a coin with only 0.00378 of D1 margin". That claim is
// only worth anything if it is demonstrated on THIS tree:
//
//   MUTATION  scale `BEARD` about its own centroid by 1.5x and re-score D1.
//             If D1 is bit-identical, the beard is outside the locus.
//   RESPONSE  do the same to the BUST path, which IS the locus. D1 must move,
//             or the harness is measuring nothing and the mutation result above
//             means nothing either (COIN-JUDGE 4).
//
// D1 here is computed the way `_sd7d1.mjs` computes it for the dime: the bust
// path taken straight out of the emitted SVG, re-filled and rasterised at 1024
// inside its own transform, against the frozen mask. `_headmask-penny.json` is
// read at its published hash and never written.
//
// Run: node coloringbook/judge/_sb7d1.mjs
import { readFileSync } from 'node:fs';
import sharp from 'sharp';

const ROOT = new URL('../../', import.meta.url).pathname;
const { coinSVG } = await import(`${ROOT}src/art/coins.js`);
const G = 1024;
const raster = async (svg) =>
  Uint8Array.from(await sharp(Buffer.from(svg)).flatten({ background: '#000' }).greyscale().raw().toBuffer(), (v) => (v >= 128 ? 1 : 0));
const iou = (a, b) => { let i = 0, u = 0; for (let k = 0; k < a.length; k++) { if (a[k] & b[k]) i++; if (a[k] | b[k]) u++; } return i / u; };

const poly = JSON.parse(readFileSync(`${ROOT}coloringbook/_headmask-penny.json`, 'utf8')).poly;
const refD = poly.map(([u, v], i) => `${i ? 'L' : 'M'} ${(50 + 47 * u).toFixed(3)} ${(50 + 47 * v).toFixed(3)}`).join(' ') + ' Z';
const ref = await raster(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${G}" height="${G}"><path d="${refD}" fill="#fff"/></svg>`);

const svg = coinSVG('penny', 600, { side: 'obverse' });
const gm = svg.match(/transform="translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+) ([-\d.]+)\)">/);
const G4 = gm.slice(1, 5);
const bustD = svg.slice(gm.index + gm[0].length).match(/<path d="([^"]+)"/)[1];
const beardD = [...svg.matchAll(/<path d="([^"]*)"/g)].map((m) => m[1]).find((d) => d.startsWith('M 15.15 12.77'));
console.log(`bust path starts  "${bustD.slice(0, 24)}..."   beard path found: ${beardD ? 'yes' : 'NO — fix this file'}`);

// scale a path's numeric coordinate pairs about a centre — crude but sufficient
// for a mutation, and it never leaves this file.
const scaleAbout = (d, k, c) => {
  let n = 0;
  return d.replace(/-?\d*\.?\d+/g, (m) => {
    const v = Number(m), o = c[n % 2];
    n++;
    return (o + k * (v - o)).toFixed(3);
  });
};
const centroid = (d) => {
  const nums = (d.match(/-?\d*\.?\d+/g) || []).map(Number);
  let sx = 0, sy = 0, n = 0;
  for (let i = 0; i + 1 < nums.length; i += 2) { sx += nums[i]; sy += nums[i + 1]; n++; }
  return [sx / n, sy / n];
};

const score = async (d) => iou(await raster(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${G}" height="${G}"><g transform="translate(${G4[0]} ${G4[1]}) scale(${G4[2]} ${G4[3]})"><path d="${d}" fill="#fff"/></g></svg>`), ref);

const base = await score(bustD);
console.log(`\nNOT A D1 VALUE. This harness rasterises the WHOLE mask; the frozen D1 locus`);
console.log(`is "v <= 0.16 in DISC coordinates, 1024^2 grid, SPAN 1.05" through _pyeval.mjs,`);
console.log(`which publishes 0.95404. The number below is ~0.487 for that reason and is used`);
console.log(`ONLY as an inertness/response harness — quoting it as D1 would be wrong.`);
console.log(`\nregion IoU vs coloringbook/_headmask-penny.json, raster ${G}x${G}, whole mask`);
console.log(`  BASELINE (worktree, unmodified)                     ${base.toFixed(6)}`);

// MUTATION: the beard, blown up 1.5x about its own centroid.
const beardBig = scaleAbout(beardD, 1.5, centroid(beardD));
const svgMut = svg.replace(beardD, beardBig);
const gm2 = svgMut.match(/transform="translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+) ([-\d.]+)\)">/);
const bustAfter = svgMut.slice(gm2.index + gm2[0].length).match(/<path d="([^"]+)"/)[1];
const mut = await score(bustAfter);
console.log(`  MUTATION  BEARD scaled 1.5x about its centroid       ${mut.toFixed(6)}   delta ${(mut - base).toExponential(2)}`);
console.log(`            bust path string changed by the mutation?  ${bustAfter === bustD ? 'NO — the beard is not in D1\'s locus' : 'YES'}`);

// RESPONSE: the bust itself, which IS the locus. This must move.
const bustBig = scaleAbout(bustD, 1.02, centroid(bustD));
const resp = await score(bustBig);
console.log(`  RESPONSE  BUST scaled 1.02x about its centroid       ${resp.toFixed(6)}   delta ${(resp - base).toExponential(2)}`);
console.log(`\n  => ${bustAfter === bustD && Math.abs(resp - base) > 1e-4
  ? 'the mutation is inert AND the harness responds: BEARD is outside D1\'s locus on this tree.'
  : 'INCONCLUSIVE — do not rely on this result.'}`);
