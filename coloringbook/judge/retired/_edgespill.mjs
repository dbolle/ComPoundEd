// Does the specular arc stay inside the blank?
//
// v1.57.0 moved EDGE.field 41.0 -> 44.07, which narrowed the rim band from
// 6.0 units to 2.93. The obvious follow-on edit is to move the specular
// highlight arc out with it, from r 43.4 to the middle of the new band
// (45.5), so the "furniture sits outside the field circle" invariant in
// discSVG()'s note keeps holding. This measures what that edit actually
// does, because the arc's stroke is `sw(3, 1.4, boxW)` — 5.38 viewBox units
// wide at 26px, nearly TWICE the whole rim band — and on the reeded coins
// the tooth valleys cut in to r 43.8.
//
// Method: rasterise the emitted SVG at 1200px on a TRANSPARENT background,
// convert every inked pixel to a viewBox radius, and count ink beyond the
// blank (r 47.05, the crest plus a rounding margin). Reported for both arc
// radii, because the blank's own outline stroke is centred ON r 47 and puts
// ink outside it at every tier — an uncontrolled reading is all outline and
// says nothing about the arc. §3-D12: the control is the same coin at the
// other arc radius, and the white-only count isolates the arc's own ink
// from the rim colour.
//
// Result at time of writing (the reason the arc stayed at 43.4):
//
//     quarter  26px   43.4: whiteOut 0      45.5: whiteOut 4206
//     quarter  44px   43.4: whiteOut 0      45.5: whiteOut  144
//     penny    26px   43.4: whiteOut 0      45.5: whiteOut    0
//     quarter  84px   43.4: whiteOut 0      45.5: whiteOut    0
//
// i.e. the spill is REEDED-ONLY and SMALL-TIER-ONLY, exactly the signature
// of a stroke riding over the tooth notches, and it is invisible at the
// sizes anyone renders while working. The smooth penny hides it entirely
// because its own r-47 outline stroke already covers that annulus.
//
// The control revision is generated here by one sed over coins.js and
// deleted again; it is not part of the source tree (COIN-JUDGE.md §4.3 —
// an image's reproducible artefact is its generator).
import sharp from 'sharp';
import { execSync } from 'node:child_process';
import { unlinkSync } from 'node:fs';

const CTRL = '../../src/art/_arcctl.js';
execSync(
  `sed 's/P(45\\.5, 216)/P(43.4, 216)/; s/A 45\\.5 45\\.5/A 43.4 43.4/; s/P(45\\.5, 266)/P(43.4, 266)/;` +
    ` s/P(43\\.4, 216)/P(45.5, 216)/; s/A 43\\.4 43\\.4/A 45.5 45.5/; s/P(43\\.4, 266)/P(45.5, 266)/'` +
    ` ../../src/art/coins.js > ${CTRL}`
);

const LIVE = await import('../../src/art/coins.js');
const CTL = await import(CTRL);
// Which module is which depends on what coins.js currently ships; read it off
// the emitted string rather than assuming, so this stays correct either way.
const radiusOf = (m) => (m.coinSVG('quarter', 84, { side: 'obverse' }).includes('A 45.5 45.5') ? 45.5 : 43.4);

const N = 1200;
const measure = async (m, id, size, side) => {
  const big = m
    .coinSVG(id, size, { side })
    .replace(/width="[\d.]+" height="[\d.]+"/, `width="${N}" height="${N}"`);
  const { data, info } = await sharp(Buffer.from(big)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let maxR = 0, out = 0, whiteOut = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * info.channels;
      if (data[i + 3] < 8) continue;
      const r = Math.hypot(((x + 0.5) / N) * 100 - 50, ((y + 0.5) / N) * 100 - 50);
      if (r > maxR) maxR = r;
      if (r > 47.05) {
        out++;
        if (data[i] > 200 && data[i + 1] > 200 && data[i + 2] > 200) whiteOut++;
      }
    }
  }
  return { maxR, out, whiteOut };
};

console.log(`arc radius:  live ${radiusOf(LIVE)}   control ${radiusOf(CTL)}`);
console.log('coin      size   revision   maxInkR   ink>r47   WHITE ink>r47');
for (const size of [26, 44, 84, 190]) {
  for (const id of ['quarter', 'dime', 'penny', 'nickel']) {
    for (const [tag, m] of [['live', LIVE], ['ctrl', CTL]]) {
      const v = await measure(m, id, size, 'obverse');
      console.log(
        `${id.padEnd(9)}${String(size).padStart(4)}  ${tag} r${radiusOf(m)}   ` +
          `${v.maxR.toFixed(2).padStart(6)}   ${String(v.out).padStart(7)}   ${String(v.whiteOut).padStart(8)}`
      );
    }
  }
}
unlinkSync(CTRL);
