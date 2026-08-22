// SPECIALIST working instrument (dime obverse, D7 round) — the one half of the
// front-lock wedge that can be MEASURED rather than read off a picture.
//
// On a cameo proof the device is frosted and the field is a black mirror, so
// the silhouette edges leaving the lock's tip are segmentable. The hairline is
// device-against-device and is not; that half stays an overlay reading off
// `_sd7fan.mjs` and is reported as such.
//
// v1 OF THIS FILE WAS WRONG AND IS RECORDED HERE RATHER THAN DELETED. It fit a
// single total-least-squares line to every boundary pixel behind the tip and
// returned 59.6-73.9 deg (local) with an rms of 1.2-1.4 local units. Our own
// crown edge leaves that vertex at -159.5 deg. It was a confident answer to the
// wrong question — §4.3's failure, for the eighth time in this project — and it
// was caught by the check Q4 requires: compare an in-bounds answer against
// something independent (here, our own geometry), not just against its bounds.
// The cause: "behind the tip" admits BOTH edges of the wedge plus the letters
// of LIBERTY, and one line through two edges is the average of them.
//
// v2 does not fit anything. It walks circles of increasing radius around the
// tip and prints EVERY angular position at which the device/field boundary is
// crossed, at every radius (§4.2: print the whole candidate set; §4.1: print
// the window). Identification of which track is the crown is then done by
// LOOKING at `_sd7fan.mjs`'s overlay, not by a rule inside this file.
//
// Angle convention: LOCAL degrees, atan2(dy, dx), x forward toward the face,
// y down — the same convention `_sd7fan.mjs` labels its rays with.
//
// Run: node coloringbook/judge/_sd7edge.mjs <ref> <tipLocalX> <tipLocalY> [rmin] [rmax]
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const ROOT = new URL('../../', import.meta.url).pathname;
const REF = process.argv[2], TX = Number(process.argv[3]), TY = Number(process.argv[4]);
const RMIN = Number(process.argv[5] || 1.5), RMAX = Number(process.argv[6] || 6);
const disc = JSON.parse(readFileSync(`${ROOT}coloringbook/judge/_jd1discs.json`, 'utf8'))[REF];
if (!disc) { console.log(`no frozen disc fit for ${REF}`); process.exit(1); }
const { cx, cy, R } = disc;
const { coinSVG } = await import(`${ROOT}src/art/coins.js`);
const svg = coinSVG('dime', 600, { side: 'obverse' });
const g = svg.match(/transform="translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+) ([-\d.]+)\)">/);
const [tx, ty, sx, sy] = g.slice(1).map(Number);
const toPx = (x, y) => [cx + (R * (tx + sx * x - 50)) / 47, cy + (R * (ty + sy * y - 50)) / 47];

const { data, info } = await sharp(`${ROOT}coloringbook/ref/${REF}`).greyscale().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;
const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? null : data[y * W + x]);

// Otsu over the disc interior
const hist = new Array(256).fill(0); let n = 0;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++)
  if ((x - cx) ** 2 + (y - cy) ** 2 < (0.93 * R) ** 2) { hist[at(x, y)]++; n++; }
let sum = 0; for (let i = 0; i < 256; i++) sum += i * hist[i];
let wB = 0, sB = 0, best = -1, thr = 128;
for (let t = 0; t < 256; t++) {
  wB += hist[t]; if (!wB) continue; const wF = n - wB; if (!wF) break;
  sB += t * hist[t];
  const v = wB * wF * (sB / wB - (sum - sB) / wF) ** 2;
  if (v > best) { best = v; thr = t; }
}

const ppu = R / 47;
console.log(`${REF}  disc cx ${cx} cy ${cy} R ${R}   ${ppu.toFixed(2)} px per local unit   Otsu ${thr}`);
console.log(`  vertex local (${TX}, ${TY});  radius window ${RMIN}..${RMAX} local units, step 0.5;  angle step 1 deg  (§4.1: bounds printed)`);
console.log(`  a crossing is device->field or field->device along the circle. ALL of them are printed (§4.2).`);
const [vpx, vpy] = toPx(TX, TY);
let anyOut = 0, tot = 0;
for (let r = RMIN; r <= RMAX + 1e-9; r += 0.5) {
  const cross = [];
  let prev = null;
  for (let a = -180; a <= 180; a += 1) {
    const rad = (a * Math.PI) / 180;
    // step in LOCAL space then map, so the angle label means what it says
    const [px, py] = toPx(TX + r * Math.cos(rad), TY + r * Math.sin(rad));
    tot++;
    const v = at(Math.round(px), Math.round(py));
    if (v === null) { anyOut++; prev = null; continue; }
    const dev = v > thr;
    if (prev !== null && dev !== prev) cross.push(a);
    prev = dev;
  }
  console.log(`    r ${r.toFixed(1)}  ${String(cross.length).padStart(2)} crossings at ${cross.map((c) => String(c).padStart(4)).join(' ')}`);
}
console.log(`  validity (DM3): ${anyOut} of ${tot} samples fell outside the source image` + (anyOut ? ' — READ THIS AS A FAILURE REPORT' : ''));
