// _jn15strand — WHICH WAY DO THE WIG'S STRANDS RUN, in the NICKEL's local frame,
// on the front two thirds of the wig that round 3 left bare?
//
// Round 3 gave the wig its mass; every lit ridge in RELIEF.Jefferson still sits
// at local x <= -23, so the front two thirds is a solid cap. Placing ridges
// there needs a direction per place, and "I looked at it" is a description.
// This is the measurement.
//
// WHAT IT MEASURES
//   For a grid of local sample discs, the dominant orientation of the local
//   image gradient (a structure tensor: the eigenvector of [[Jxx,Jxy],[Jxy,Jyy]]
//   with the SMALLER eigenvalue is the direction along which intensity varies
//   least, i.e. ALONG the strand). Reported as a LOCAL-frame angle, measured
//   from local +x toward local +y, folded into (-90, 90].
//
//   The frame carries dir = -1, so a local direction (a, b) lands on the image
//   as (-a, b) up to a uniform scale (and, for nickel-obv-5.JPG, a rotation
//   from the frozen ICP). The conversion is derived from the mapping itself by
//   pushing two unit local vectors through localToPx, never assumed.
//
//   Coherence C = (l1 - l2) / (l1 + l2) is printed beside every angle. A patch
//   with no oriented texture returns C near 0, and THAT is the degeneracy
//   measure (§4.1): an angle with C < 0.15 is reported as `NO-ORIENTATION`,
//   not as a value.
//
// NULL / SELECTION (§4.1, §4.2): the angle is not a search over a bounded
//   range - it is an eigenvector - so there is no bound to return. Both
//   eigenvalues are printed so the choice between them is visible, and the
//   tool refuses when they are within 15% of each other.
//
// RESPONSE TEST (§4): ROTATE=<deg> resamples each sample disc by that angle
//   before measuring. The reported local angle must move by the same amount
//   (sign corrected for dir = -1) on every patch with C above the floor.
//
// Run: node coloringbook/judge/_jn15strand.mjs [ref]
//      ROTATE=20 node coloringbook/judge/_jn15strand.mjs [ref]
import sharp from 'sharp';
import { localToPx, pxPerLocal, REFP } from './_jn14map.mjs';
import { dHair, dOutline } from './_jn15locus.mjs';

const FILES = process.argv[2]
  ? [process.argv[2]]
  : ['nickel-obv-unc2004.jpg', 'nickel-obv-5.JPG'];
const ROT = +(process.env.ROTATE || 0);
const CFLOOR = 0.15;
const R_LOCAL = +(process.env.RAD || 3.0); // sample disc radius in local units

// §4.3 — THE WRONG FEATURE. Run first with no exclusion, this tool returned
// -54.0 deg at local (0,-10) and -64.2 deg is the tangent of the HAIRLINE
// there: at |x| under ~4 the sample disc straddles the strongest edge on the
// face and the tensor reports that edge, not the strands. So every sample is
// screened against the hairline and one nearer than its own radius is printed
// as CONTAMINATED rather than as a value.
//
// The screen polyline is the hairline ROUND 3 READ OFF THE TWO PHOTOGRAPHS
// (see the block above HAIR.Jefferson: "the two references agree on that line
// to about a unit and a half"). It is a target-derived literal, which §6.1
// permits; it is NOT re-derived from the art under test, and nothing in this
// file reads src/art/coins.js at all.
// Both screens — and the frozen-mask silhouette screen that a first run of this
// tool proved is equally necessary — live in _jn15locus.mjs.
const distToHairline = dHair;

// The sample grid: the wig's front two thirds plus two back anchors that the
// EXISTING ridges already occupy, so the tool can be checked against art whose
// direction was measured in an earlier round.
const GRID = [];
for (let x = 0; x >= -32; x -= 4) for (let y = -26; y <= 10; y += 4) GRID.push([x, y]);

// local -> image direction, derived from the mapping (never assumed)
function basis(file) {
  const o = localToPx(file, 0, 0);
  const ex = localToPx(file, 1, 0), ey = localToPx(file, 0, 1);
  return [[ex[0] - o[0], ex[1] - o[1]], [ey[0] - o[0], ey[1] - o[1]]];
}

const fold = (d) => { let a = d; while (a <= -90) a += 180; while (a > 90) a -= 180; return a; };

const HERE = (f) => new URL('./' + f, import.meta.url).pathname;
const OVER = process.env.OVERLAY || '';

for (const file of FILES) {
  const ticks = [];
  const img = sharp(REFP(file)).greyscale();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const at = (x, y) => data[Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))];
  const ppl = pxPerLocal(file);
  const B = basis(file);
  // image angle of local +x and local +y
  const axImg = Math.atan2(B[0][1], B[0][0]) * 180 / Math.PI;
  const ayImg = Math.atan2(B[1][1], B[1][0]) * 180 / Math.PI;
  // handedness: does local +y sit 90 deg CW or CCW from local +x on the image?
  const cross = B[0][0] * B[1][1] - B[0][1] * B[1][0];
  const hand = cross > 0 ? +1 : -1;

  console.log(`\n=== ${file}   ${W}x${H}   ${ppl.toFixed(2)} px/local`);
  console.log(`    local +x lies at ${axImg.toFixed(2)} deg on the image, local +y at ${ayImg.toFixed(2)} deg; handedness ${hand > 0 ? 'CW (+y is +90 from +x)' : 'CCW (+y is -90 from +x)'}`);
  console.log(`    sample disc r = ${R_LOCAL} local = ${(R_LOCAL * ppl).toFixed(1)} px;  coherence floor ${CFLOOR};  ROTATE=${ROT}`);
  console.log('     lx    ly   |  local angle  |  coherence  |  l1 / l2      | d(hair) d(edge)');

  for (const [lx, ly] of GRID) {
    const c = localToPx(file, lx, ly);
    const rpx = R_LOCAL * ppl;
    if (c[0] - rpx < 1 || c[1] - rpx < 1 || c[0] + rpx > W - 2 || c[1] + rpx > H - 2) continue;
    // sample on a local-frame lattice so ROTATE is applied in the LOCAL frame
    const st = 1 / ppl > 0.5 ? 0.5 : 1 / ppl; // local units per sample step
    const th = ROT * Math.PI / 180;
    let Jxx = 0, Jyy = 0, Jxy = 0, n = 0;
    const N = Math.round(R_LOCAL / st);
    const val = (u, v) => {
      // (u,v) local offsets, rotated by ROT in the local frame
      const ru = Math.cos(th) * u - Math.sin(th) * v;
      const rv = Math.sin(th) * u + Math.cos(th) * v;
      const p = localToPx(file, lx + ru, ly + rv);
      return at(Math.round(p[0]), Math.round(p[1]));
    };
    for (let i = -N; i <= N; i++) for (let j = -N; j <= N; j++) {
      const u = i * st, v = j * st;
      if (u * u + v * v > R_LOCAL * R_LOCAL) continue;
      // central difference in LOCAL units
      const gx = (val(u + st, v) - val(u - st, v)) / (2 * st);
      const gy = (val(u, v + st) - val(u, v - st)) / (2 * st);
      Jxx += gx * gx; Jyy += gy * gy; Jxy += gx * gy; n++;
    }
    if (!n) continue;
    Jxx /= n; Jyy /= n; Jxy /= n;
    const tr = Jxx + Jyy, det = Jxx * Jyy - Jxy * Jxy;
    const disc = Math.sqrt(Math.max(0, tr * tr / 4 - det));
    const l1 = tr / 2 + disc, l2 = tr / 2 - disc;
    const C = l1 + l2 > 0 ? (l1 - l2) / (l1 + l2) : 0;
    // eigenvector of the SMALLER eigenvalue = along the strand
    let ang;
    if (Math.abs(Jxy) > 1e-9) ang = Math.atan2(l2 - Jxx, Jxy) * 180 / Math.PI;
    else ang = Jxx <= Jyy ? 0 : 90;
    ang = fold(ang);
    const dh = distToHairline(lx, ly);
    const dO = dOutline(lx, ly);
    const bad = dh < R_LOCAL || dO < R_LOCAL;
    if (!bad && C >= CFLOOR) {
      // §4.3 — DRAW WHAT WAS FOUND. A tick 2.4 local units long, centred on the
      // sample, laid along the angle the tensor reported. If these do not lie
      // along the strands in the picture, the number is measuring something else.
      const a = ang * Math.PI / 180, L = 1.2;
      const p1 = localToPx(file, lx - L * Math.cos(a), ly - L * Math.sin(a));
      const p2 = localToPx(file, lx + L * Math.cos(a), ly + L * Math.sin(a));
      ticks.push(`<line x1="${p1[0].toFixed(1)}" y1="${p1[1].toFixed(1)}" x2="${p2[0].toFixed(1)}" y2="${p2[1].toFixed(1)}" stroke="#ff2d55" stroke-width="${(0.28 * ppl).toFixed(2)}" stroke-linecap="round"/>`);
    }
    const tag = dh < R_LOCAL ? '  CONTAMINATED by the hairline' : dO < R_LOCAL ? '  CONTAMINATED by the silhouette edge' : C < CFLOOR ? '  NO-ORIENTATION (degenerate)' : '';
    console.log(
      `  ${String(lx).padStart(5)} ${String(ly).padStart(5)}   |` +
      `  ${(bad || C < CFLOOR ? '   --' : ang.toFixed(1).padStart(6))} deg   |` +
      `   ${C.toFixed(3)}     |  ${l1.toFixed(0).padStart(6)} / ${l2.toFixed(0).padStart(6)} | ${dh.toFixed(1).padStart(5)} ${dO.toFixed(1).padStart(5)}${tag}`
    );
  }
  if (OVER) {
    const m = await sharp(REFP(file)).metadata();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${m.width}" height="${m.height}">${ticks.join('')}</svg>`;
    const buf = await sharp(REFP(file)).composite([{ input: Buffer.from(svg) }]).png().toBuffer();
    const a = localToPx(file, 4, -32), b = localToPx(file, -36, 14);
    const L = Math.max(0, Math.round(Math.min(a[0], b[0]))), T = Math.max(0, Math.round(Math.min(a[1], b[1])));
    const W2 = Math.min(m.width - L, Math.round(Math.abs(b[0] - a[0]))), H2 = Math.min(m.height - T, Math.round(Math.abs(b[1] - a[1])));
    const out = HERE(`_jn15strand-${OVER}-${file.replace(/[^a-z0-9]/gi, '_')}.png`);
    await sharp(buf).extract({ left: L, top: T, width: W2, height: H2 }).resize({ width: 1000 }).png().toFile(out);
    console.log(`    OVERLAY (${ticks.length} ticks, each 2.4 local units long, laid along the reported angle) -> ${out.split('/').pop()}`);
  }
}
