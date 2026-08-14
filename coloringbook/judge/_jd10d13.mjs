// DIME r0 — D2 (reverse motif silhouette) and D13, BOTH SIDES.
//
// This is `_jp13d2d13.mjs` (cent r0, hashed in `_jd0extra.json`) with the id,
// the reference pair and the disc table parameterised. Cent PY6 requires the
// equivalence to be published: run `node _jd10d13.mjs d13 penny` and it
// reproduces `_jp13d2d13.mjs`'s cent numbers, and the dime-reverse cell is
// cross-checked against the frozen `_x6dark.mjs`. Nothing else is changed.
//
// ORIGINAL HEADER FOLLOWS.
// PENNY ROUND 0 — D2 (reverse motif silhouette) and D13-OBVERSE.
//
// D13. `_x6dark.mjs` is the frozen D13 instrument and it is REVERSE-ONLY
// (`PAIRS` pairs each id with its `*-rev-*` reference). The obverse half of D13
// has therefore never been measured on any coin. This computes the SAME
// quantity with the SAME frozen constants — disc interior r < 40 viewBox units,
// ink = below 0.85 x the side's own p90 field level, our render at the tier's
// REAL device pixel count and the photograph reduced to the same count, no
// upsampling anywhere (§22.1) — for the obverse. Run against the reverse it
// must reproduce `_x6dark.mjs`; that cross-check is printed.
//
// D2. Freeze condition, stated before any value and inherited UNCHANGED from
// round 2 on the quarter (it is not softened for a building):
//     minimum pairwise device IoU across the threshold sweep >= 0.97
//     AND two independent references agree at >= 0.95.
// Locus, a frozen literal and not a function of our art: r <= 0.862 R
// (viewBox 40.5) on a 700x700 disc-normalised grid; the motif is the connected
// component of {grey <= T} containing the centre; T swept Tv +- 15 in steps
// of 5, Tv the histogram valley floor OF THE PHOTOGRAPH.
// §4.2 every threshold's component count and area is printed. §4.3 the contour
// is drawn on the source and looked at.
//
// Run: node coloringbook/judge/_jp13d2d13.mjs [d13|d2|both]
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const ID = process.argv[3] || 'dime';
const DISCFILE = ID === 'penny' ? './_jp1discs.json' : './_jd1discs.json';
const D = JSON.parse(readFileSync(new URL(DISCFILE, import.meta.url)));
const REFPAIRS = {
  dime: { obverse: 'dime-obv-3.jpg', reverse: 'dime-rev-2.jpg' },
  penny: { obverse: 'penny-obv-3.jpg', reverse: 'penny-rev-2.png' },
};
const D2REFS = { dime: ['dime-rev-2.jpg', 'dime-rev.jpg'], penny: ['penny-rev-2.png', 'penny-rev.jpg'] };
const REFP = (f) => new URL('../ref/' + f, import.meta.url).pathname;
const mod = await import('../../src/art/coins.js');
const RAD = 40, INK = 0.85;          // frozen, identical to _x6dark.mjs

async function grid(buf, W) {
  const { data, info } = await sharp(buf).flatten({ background: '#ffffff' })
    .resize(W, W, { fit: 'fill' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  if (info.channels !== 1) throw new Error('channels != 1 — UNTRUSTED');
  if (data.length !== info.width * info.height) throw new Error('buffer mismatch — UNTRUSTED');
  return data;
}
function stats(d, W) {
  const inside = [];
  for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
    const X = 100 * (i + 0.5) / W, Y = 100 * (j + 0.5) / W;
    if ((X - 50) ** 2 + (Y - 50) ** 2 > RAD * RAD) continue;
    inside.push({ X, Y, v: d[j * W + i] });
  }
  const s = inside.map((p) => p.v).sort((a, b) => a - b);
  const f = s[(s.length * 0.9) | 0];
  const mean = inside.reduce((a, p) => a + p.v, 0) / inside.length / f;
  const ink = inside.filter((p) => p.v < INK * f);
  let sx = 0, sy = 0; for (const p of ink) { sx += p.X; sy += p.Y; }
  const cx = sx / ink.length, cy = sy / ink.length;
  const spread = Math.sqrt(ink.reduce((a, p) => a + (p.X - cx) ** 2 + (p.Y - cy) ** 2, 0) / ink.length);
  const X0 = Math.min(...ink.map((p) => p.X)), X1 = Math.max(...ink.map((p) => p.X));
  const Y0 = Math.min(...ink.map((p) => p.Y)), Y1 = Math.max(...ink.map((p) => p.Y));
  return { field: f, mean, ink: ink.length / inside.length, spread, aspect: (Y1 - Y0) / (X1 - X0), bbox: [X0, X1, Y0, Y1] };
}
async function refBuf(f) {
  const d = D[f], PAD = 300;
  const padded = await sharp(REFP(f)).flatten({ background: '#ffffff' })
    .extend({ top: PAD, bottom: PAD, left: PAD, right: PAD, background: '#ffffff' }).png().toBuffer();
  return sharp(padded).extract({ left: Math.round(d.cx - d.R) + PAD, top: Math.round(d.cy - d.R) + PAD,
    width: Math.round(2 * d.R), height: Math.round(2 * d.R) }).png().toBuffer();
}

const mode = process.argv[2] || 'both';

if (mode === 'd13' || mode === 'both') {
  console.log('=== D13 — device against field, BOTH SIDES ===');
  console.log(`locus r < ${RAD} viewBox units, ink = below ${INK} x own p90 field, tiers 26/44/84, no upsampling\n`);
  const PAIRS = REFPAIRS[ID];
  for (const [side, f] of Object.entries(PAIRS)) {
    const rb = await refBuf(f);
    for (const size of [26, 44, 84]) {
      const svg = mod.coinSVG(ID, size, { side });
      const W = Math.round(Number(svg.match(/width="([\d.]+)"/)[1]));
      const png = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' }).png().toBuffer();
      const o = stats(await grid(png, W), W);
      const r = stats(await grid(rb, W), W);
      const dm = o.mean - r.mean;
      console.log(`${ID} ${side.padEnd(8)} ${String(size).padStart(3)}px (${W} device px)`);
      console.log(`   ref   field ${String(r.field).padStart(3)}  mean/field ${r.mean.toFixed(4)}  ink ${r.ink.toFixed(3)}  spread ${r.spread.toFixed(2)}  aspect ${r.aspect.toFixed(2)}`);
      console.log(`   ours  field ${String(o.field).padStart(3)}  mean/field ${o.mean.toFixed(4)}  ink ${o.ink.toFixed(3)}  spread ${o.spread.toFixed(2)}  aspect ${o.aspect.toFixed(2)}`);
      console.log(`   D  mean/field ${dm >= 0 ? '+' : ''}${dm.toFixed(4)}  ${Math.abs(dm) <= 0.05 ? 'PASS' : 'FAIL'} vs the +-0.05 gate   |  D ink ${(o.ink - r.ink >= 0 ? '+' : '') + (o.ink - r.ink).toFixed(3)}  D aspect ${(o.aspect - r.aspect).toFixed(2)}`);
    }
  }
}

if (mode === 'd2' || mode === 'both') {
  console.log('\n=== D2 — reverse motif silhouette: can a target be FROZEN? ===');
  console.log('freeze condition (stated before any value, inherited from quarter round 2, NOT softened):');
  console.log('  min pairwise device IoU across the sweep >= 0.97  AND  two independent references agree >= 0.95\n');
  const N = 700;
  for (const f of D2REFS[ID]) {
    const rb = await refBuf(f);
    const d = await grid(rb, N);
    // histogram valley INSIDE the locus, of the photograph
    const vals = [];
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const u = (i + 0.5) / N * 2 - 1, v = (j + 0.5) / N * 2 - 1;
      if (Math.hypot(u, v) > 0.862) continue;
      vals.push(d[j * N + i]);
    }
    const h = new Array(256).fill(0); for (const v of vals) h[v]++;
    const sm = h.map((_, k) => { let s = 0, n = 0; for (let q = -6; q <= 6; q++) if (h[k + q] !== undefined) { s += h[k + q]; n++; } return s / n; });
    let lo = 0, hi = 255; while (sm[lo] < 1) lo++; while (sm[hi] < 1) hi--;
    let best = null;
    for (let k = lo + 12; k <= hi - 12; k++) {
      const L = Math.max(...sm.slice(lo, k)), R = Math.max(...sm.slice(k, hi));
      const depth = 1 - sm[k] / Math.min(L, R);
      if (!best || depth > best.depth) best = { T: k, depth };
    }
    console.log(`${f}: histogram bounds [${lo},${hi}] (§4.1), valley floor Tv = ${best.T}, depth ${best.depth.toFixed(4)}`);
    const masks = [];
    for (let T = best.T - 15; T <= best.T + 15; T += 5) {
      const m = new Uint8Array(N * N);
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const u = (i + 0.5) / N * 2 - 1, v = (j + 0.5) / N * 2 - 1;
        if (Math.hypot(u, v) > 0.862) continue;
        if (d[j * N + i] <= T) m[j * N + i] = 1;
      }
      // largest connected component (4-conn), reported with the FULL count (§4.2)
      const lab = new Int32Array(N * N).fill(-1); let nc = 0; const areas = [];
      const st = new Int32Array(N * N);
      for (let p = 0; p < N * N; p++) {
        if (!m[p] || lab[p] >= 0) continue;
        let sp = 0; st[sp++] = p; lab[p] = nc; let a = 0;
        while (sp) { const q = st[--sp]; a++; const qi = q % N, qj = (q - qi) / N;
          for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const ni = qi + di, nj = qj + dj; if (ni < 0 || nj < 0 || ni >= N || nj >= N) continue;
            const np = nj * N + ni; if (m[np] && lab[np] < 0) { lab[np] = nc; st[sp++] = np; } } }
        areas.push(a); nc++;
      }
      const big = areas.indexOf(Math.max(...areas));
      const out = new Uint8Array(N * N); let area = 0;
      for (let p = 0; p < N * N; p++) if (lab[p] === big) { out[p] = 1; area++; }
      masks.push({ T, mask: out, area, components: nc, top3: [...areas].sort((a, b) => b - a).slice(0, 3) });
      console.log(`   T ${String(T).padStart(3)}   components ${String(nc).padStart(4)}   largest ${area} px = ${(100 * area / vals.length).toFixed(1)}% of the locus   top3 ${masks[masks.length - 1].top3.join(', ')}`);
    }
    let minIoU = 1, minPair = '';
    for (let a = 0; a < masks.length; a++) for (let b = a + 1; b < masks.length; b++) {
      let inter = 0, uni = 0;
      for (let p = 0; p < N * N; p++) { const x = masks[a].mask[p], y = masks[b].mask[p]; if (x || y) uni++; if (x && y) inter++; }
      const io = inter / uni; if (io < minIoU) { minIoU = io; minPair = `T${masks[a].T} vs T${masks[b].T}`; }
    }
    console.log(`   MIN PAIRWISE IoU across the sweep = ${minIoU.toFixed(4)}  (${minPair})   ${minIoU >= 0.97 ? 'MEETS' : 'MISSES'} the 0.97 freeze condition\n`);

    // §4.3 — draw the median-threshold contour on the source and look at it.
    const mid = masks[(masks.length / 2) | 0];
    const ov = Buffer.alloc(N * N * 4);
    for (let p = 0; p < N * N; p++) {
      const i = p % N, j = (p - i) / N;
      const edge = mid.mask[p] && (!mid.mask[p - 1] || !mid.mask[p + 1] || !mid.mask[p - N] || !mid.mask[p + N]);
      ov[4 * p] = edge ? 255 : 0; ov[4 * p + 1] = 0; ov[4 * p + 2] = edge ? 255 : 0; ov[4 * p + 3] = edge ? 255 : 0;
    }
    const base = await sharp(rb).resize(N, N, { fit: 'fill' }).png().toBuffer();
    const o = new URL(`./_jp13d2-${f.replace(/\..*/, '')}.png`, import.meta.url).pathname;
    await sharp(base).composite([{ input: await sharp(ov, { raw: { width: N, height: N, channels: 4 } }).png().toBuffer() }]).toFile(o);
    console.log(`   §4.3 contour at T=${mid.T} drawn on the source -> ${o}`);
  }
}
