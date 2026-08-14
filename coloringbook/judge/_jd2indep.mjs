// DIME r0, TASK 2 — §21.5 INDEPENDENCE. RUN IT BEFORE ANYTHING TRUSTS TWO
// REFERENCES.
//
// The same-photograph trap has hit SIX times out of six across this project:
// dime-rev/dime-rev-2 (NCC 0.9931), quarter-obv/quarter-obv-2 (0.9542), and
// most recently two nickel "proofs" that were the two halves of one plate —
// which no correlation between THEM could show, and which was caught by
// nickel N4's rule: print the FITTED R for every file in one column, because
// two files with a bit-identical R are one photograph until proved otherwise.
//
// This runs ALL 15 pairs over the dime's six references, not only the pair
// somebody suspects, plus two controls:
//   * cross-side pairs (obverse vs reverse) — genuinely uncorrelated, so they
//     bound what "different" looks like on this coin's own photography;
//   * an explicit different-design control (dime obverse vs nickel obverse).
//
// §4.1 NCC is bounded [-1,1]; a value at a bound is a failure report.
//
// Run: node coloringbook/judge/_jd2indep.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
const D = JSON.parse(readFileSync(new URL('./_jd1discs.json', import.meta.url)));
const N = 512, SPAN = 1.0;

const cache = new Map();
async function norm(file, disc) {
  const key = file; if (cache.has(key)) return cache.get(key);
  const { data, info } = await sharp(P(file)).flatten({ background: '#808080' })
    .greyscale().raw().toBuffer({ resolveWithObject: true });
  const IW = info.width, IH = info.height;
  const at = (x, y) => {
    if (x < 0 || y < 0 || x >= IW - 1 || y >= IH - 1) return 0;
    const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0;
    return data[y0 * IW + x0] * (1 - fx) * (1 - fy) + data[y0 * IW + x0 + 1] * fx * (1 - fy)
      + data[(y0 + 1) * IW + x0] * (1 - fx) * fy + data[(y0 + 1) * IW + x0 + 1] * fx * fy;
  };
  const g = new Float64Array(N * N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const u = -SPAN + 2 * SPAN * i / (N - 1), v = -SPAN + 2 * SPAN * j / (N - 1);
    g[j * N + i] = at(disc.cx + u * disc.R, disc.cy + v * disc.R);
  }
  cache.set(key, g); return g;
}

function compare(A, B) {
  const ia = [], ib = [];
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const u = -SPAN + 2 * SPAN * i / (N - 1), v = -SPAN + 2 * SPAN * j / (N - 1);
    if (u * u + v * v > 0.90 * 0.90) continue;
    ia.push(A[j * N + i]); ib.push(B[j * N + i]);
  }
  const med = (x) => { const s = [...x].sort((p, q) => p - q); return s[s.length >> 1]; };
  const k = med(ia) / med(ib);
  let s = 0; for (let i = 0; i < ia.length; i++) s += Math.abs(ia[i] - ib[i] * k);
  const mA = ia.reduce((p, q) => p + q, 0) / ia.length, mB = ib.reduce((p, q) => p + q, 0) / ib.length;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < ia.length; i++) { const x = ia[i] - mA, y = ib[i] - mB; num += x * y; da += x * x; db += y * y; }
  return { mad: s / ia.length, ncc: num / Math.sqrt(da * db) };
}

const FILES = Object.keys(D).filter((f) => D[f] && D[f].R);
console.log('=== fitted R for every dime reference, ONE COLUMN (nickel N4) ===');
console.log('two files with a bit-identical R are one photograph until proved otherwise\n');
for (const f of FILES) console.log(`  ${f.padEnd(16)} R = ${D[f].R.toFixed(2).padStart(8)}   cx ${D[f].cx}  cy ${D[f].cy}  p95 ${D[f].p95pctR}%R`);
const Rs = FILES.map((f) => D[f].R.toFixed(4));
const dupR = Rs.filter((r, i) => Rs.indexOf(r) !== i);
console.log(dupR.length ? `\n  !! BIT-IDENTICAL R: ${dupR.join(', ')} — treat as one photograph` : '\n  no two fitted R are bit-identical.');

console.log('\n=== all 15 pairs, plus controls ===');
console.log('pair                                        mean|d| grey     NCC');
const rows = [];
for (let i = 0; i < FILES.length; i++) for (let j = i + 1; j < FILES.length; j++) {
  const a = FILES[i], b = FILES[j];
  const r = compare(await norm(a, D[a]), await norm(b, D[b]));
  const sameSide = (a.includes('obv') === b.includes('obv'));
  rows.push({ a, b, ...r, sameSide });
  console.log(`${a.padEnd(16)} vs ${b.padEnd(16)} ${r.mad.toFixed(2).padStart(10)}   ${r.ncc.toFixed(4).padStart(8)}` +
    (Math.abs(r.ncc) >= 0.9999 ? '   <-- AT THE NCC BOUND (§4.1): FAILURE REPORT' : '') +
    (r.ncc > 0.95 && sameSide ? '   <-- SAME PHOTOGRAPH' : '') +
    (!sameSide ? '   [cross-side: internal control]' : ''));
}
// explicit different-design control
{
  const nk = { file: 'nickel-obv.jpg' };
  const { fit } = await import('../_rvdisc.mjs');
  let nd = null; try { nd = await fit(nk.file); } catch { nd = null; }
  if (nd) {
    const r = compare(await norm('dime-obv-2.jpg', D['dime-obv-2.jpg']), await norm(nk.file, nd));
    console.log(`\nCONTROL (different designs) dime-obv-2 vs nickel-obv  mean|d| ${r.mad.toFixed(2)}  NCC ${r.ncc.toFixed(4)}   nickel R ${nd.R.toFixed(2)}`);
  }
}
console.log('\nsummary: same-side pairs above NCC 0.95 are one photograph; the cross-side');
console.log('pairs and the different-design control bound what "independent" looks like here.');
