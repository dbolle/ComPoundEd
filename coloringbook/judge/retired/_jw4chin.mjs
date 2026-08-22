// R4 dime jaw — WHY the chin patch moved 202 -> 149 on an overlap of ~17 %.
//
// D3 fell 0.0399 -> 0.0589 on the first cut of the tapered region and the whole
// fall is one patch: `chin`, |dratio| 0.073 -> 0.282, past _tonepatches.json's
// own worstPatch 0.25. A 17 % overlap cannot move a MEAN by that much; it can
// move a MEDIAN, if the patch is bimodal and the median was sitting near an
// edge. This prints the histogram so the mechanism is evidence rather than a
// guess, and prints the fraction of the patch the jaw region covers.
//
// Null/response: it reports a full 256-bin histogram of a named patch, so there
// is no search and no bound; the response check is that BEFORE and AFTER are
// rendered from two pinned files and must differ.
//
// Run: node coloringbook/judge/_jw4chin.mjs [patchName]
import { grey, fitDisc, REF, ourRaster, loadJSON, localToDisc } from '../_p2lib.mjs';

const NAME = process.argv[2] || 'chin';
const { patches } = loadJSON(new URL('../_tonepatches.json', import.meta.url).pathname);
const P = patches.find((p) => p.name === NAME);
const photo = await grey(REF);
const disc = fitDisc(photo);
for (const [tag, src] of [['BEFORE', './_jw4-before-loadable.js'], ['AFTER', '../../src/art/coins.js']]) {
  const mod = await import(new URL(src, import.meta.url).pathname);
  const g = await ourRaster(mod.coinSVG, disc, photo.w, photo.h);
  const cx = disc.cx + P.u * disc.R, cy = disc.cy + P.v * disc.R, r = P.r * disc.R;
  const vals = [];
  for (let y = Math.floor(cy - r); y <= cy + r; y++)
    for (let x = Math.floor(cx - r); x <= cx + r; x++)
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) vals.push(g.d[y * g.w + x]);
  vals.sort((a, b) => a - b);
  const h = new Map();
  for (const v of vals) h.set(v, (h.get(v) || 0) + 1);
  const rows = [...h.entries()].sort((a, b) => b[0] - a[0]);
  console.log(`\n${tag}  patch ${NAME} local(${P.local.x},${P.local.y}) r=${P.local.r}  n=${vals.length}`
    + `  median ${vals[vals.length >> 1]}`);
  let cum = 0;
  for (const [v, n] of rows) {
    cum += n;
    console.log(`   level ${String(v).padStart(3)}  ${String(n).padStart(5)} px  ${(100 * n / vals.length).toFixed(1).padStart(5)}%`
      + `   cumulative from the top ${(100 * cum / vals.length).toFixed(1).padStart(5)}%${cum >= vals.length / 2 && cum - n < vals.length / 2 ? '   <= the MEDIAN sits here' : ''}`);
  }
}
