// D5 — lettering, HF half. **v2. Supersedes _jq5letter.mjs, which is RETIRED
// as UNSOUND at its round-1 hash (a8eb8643…) and neither edited nor deleted.**
//
// THE FAULT IN v1 (judge ruling, round 2, docs/COIN-JUDGE.md §6.1 + §1.1):
//
//   _jq5letter.mjs:193
//     const rMid = ob ? (ob.baseMin + ob.baseMax) / 2 + 0.36*(ob.outer-ob.inner)/2 : 38.9;
//     const ho = hf(o.fn, rMid, …), hr = hf(refAtTier, rMid, …);
//
//   `ob` is OUR OWN parsed glyph geometry. The locus at which BOTH our art and
//   the reference photograph are sampled is therefore a function of the
//   artefact under test. Change the drawing and the REFERENCE's own score
//   changes with it. The literal 38.9 is only the fallback that fires when we
//   draw no glyphs at all — which is exactly the state round 1 measured, which
//   is why the circularity stayed hidden for two rounds.
//
//   It is worse than "a threshold with no locus" (§6.1): the locus was
//   BELIEVED frozen — round 1's §7 brief says "HF evaluated at r = 38.9
//   viewBox units … Do not evaluate anywhere else" — and the instrument
//   silently overrode it the moment the specialist made glyphs appear.
//
//   The judge's own round-1 scorecard records the evidence in plain text:
//     D5.obverse.locus = "sector 250..290 deg; HF at r 38.9 (icon/mid) and
//                         37.5 (84px), 36.0 (190px)"
//   Three radii in one `locus` field. §6.1 says a locus is frozen WITH THE
//   TARGET. A locus that lists one value per tier of our own drawing is not
//   frozen, it is derived.
//
// v2's rule, and the general rule this round proposes for the spec:
//
//   > A LOCUS MAY NOT BE A FUNCTION OF THE ARTEFACT UNDER TEST. It is either
//   > a constant frozen before the round, or computed from the TARGET alone.
//   > Enforced mechanically by the REFERENCE-INVARIANCE TEST below: score the
//   > same target against two different revisions of the art; every
//   > reference-side number must be BIT-IDENTICAL. If it moves, the locus is
//   > circular and every ratio the instrument has ever published is void.
//
// FROZEN LOCUS (stated here, before any v2 value existed; inherited verbatim
// from round 1's §7 brief so the round-1 and round-2 numbers are comparable):
//
//     sector 250..290 deg, r = 38.9 viewBox units, EVERY tier, BOTH sides.
//
// The full ratio profile over r 30..41 is printed beside it as evidence of the
// metric's sensitivity (§6.1's original complaint was that the same ratio ran
// 0.98x..2.14x over three units of radius). The profile is EVIDENCE. The gate
// is read at 38.9 and nowhere else.
//
// Everything else — greyOf, at, hf, fieldLevel, the disc registrations, the
// tier reduction — is v1 verbatim, so the numbers stay comparable.
//
// Run: node coloringbook/judge/_jq5letter-v2.mjs
//      ART=/abs/path/coins.js   score a different revision of the art
//      RESPONSE=1               response + null + reference-invariance tests
import sharp from 'sharp';

const R_VB = 47;
const SECTOR = [250, 290];
const FROZEN_R = 38.9;                 // ← the locus. A literal. Not derived.
const PROFILE = [30, 41, 0.1];         // evidence only

async function greyOf(path) {
  const { data, info } = await sharp(path).flatten({ background: '#ffffff' }).greyscale().raw()
    .toBuffer({ resolveWithObject: true });
  if (info.channels !== 1) throw new Error('channels ' + info.channels);
  if (data.length !== info.width * info.height) throw new Error('buffer length mismatch — UNTRUSTED');
  return { d: data, w: info.width, h: info.height };
}
const at = (g, x, y) => {
  const i = Math.max(0, Math.min(g.w - 1, Math.round(x))), j = Math.max(0, Math.min(g.h - 1, Math.round(y)));
  return g.d[j * g.w + i];
};

function hf(sample, r, field, pitchVB) {
  const N = Math.max(16, Math.round(((SECTOR[1] - SECTOR[0]) * Math.PI / 180) * r / pitchVB) * 4);
  const v = [];
  for (let k = 0; k < N; k++) {
    const th = ((SECTOR[0] + ((SECTOR[1] - SECTOR[0]) * k) / N) * Math.PI) / 180;
    v.push(sample(50 + r * Math.cos(th), 50 + r * Math.sin(th)) / field);
  }
  let ds = 0;
  for (let k = 1; k < N; k++) ds += (v[k] - v[k - 1]) ** 2;
  const arc = ((SECTOR[1] - SECTOR[0]) * Math.PI / 180) * r;
  const m = v.reduce((a, b) => a + b, 0) / N;
  return { hf: Math.sqrt(ds / (N - 1)) * N / arc, mean: m, sd: Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / N), N };
}

const fieldLevel = (sample) => {
  const v = [];
  for (let j = 0; j < 200; j++) for (let i = 0; i < 200; i++) {
    const X = (100 * (i + 0.5)) / 200, Y = (100 * (j + 0.5)) / 200;
    if ((X - 50) ** 2 + (Y - 50) ** 2 > 40 * 40) continue;
    v.push(sample(X, Y));
  }
  v.sort((a, b) => a - b);
  return v[(v.length * 0.9) | 0];
};

const REFS = {
  obverse: { file: 'quarter-obv-2.jpg', disc: { cx: 374.41, cy: 374.36, R: 373.67 } },
  reverse: { file: 'quarter-rev-2.png', disc: { cx: 374.50, cy: 374.37, R: 374.98 } },
};

async function refSampler(side) {
  const { file, disc } = REFS[side];
  const g = await greyOf(new URL('../ref/' + file, import.meta.url).pathname);
  return (X, Y) => at(g, disc.cx + ((X - 50) / R_VB) * disc.R, disc.cy + ((Y - 50) / R_VB) * disc.R);
}
async function refSamplerAt(side, boxW) {
  const s = await refSampler(side);
  const buf = new Float64Array(boxW * boxW);
  for (let j = 0; j < boxW; j++) for (let i = 0; i < boxW; i++) {
    let acc = 0;
    for (let b = 0; b < 4; b++) for (let a = 0; a < 4; a++) {
      acc += s((100 * (i + (a + 0.5) / 4)) / boxW, (100 * (j + (b + 0.5) / 4)) / boxW);
    }
    buf[j * boxW + i] = acc / 16;
  }
  return (X, Y) => buf[Math.min(boxW - 1, Math.max(0, Math.floor((Y / 100) * boxW))) * boxW
                     + Math.min(boxW - 1, Math.max(0, Math.floor((X / 100) * boxW)))];
}

async function ourSampler(mod, side, size) {
  const svg = mod.coinSVG('quarter', size, { side });
  const boxW = Math.max(8, Math.round(Number(svg.match(/width="([\d.]+)"/)[1])));
  const { data, info } = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
    .resize(boxW, boxW, { fit: 'fill' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  if (info.channels !== 1 || data.length !== boxW * boxW) throw new Error('raster channels/length — UNTRUSTED');
  return {
    boxW, svg,
    fn: (X, Y) => data[Math.min(boxW - 1, Math.max(0, Math.floor((Y / 100) * boxW))) * boxW
                      + Math.min(boxW - 1, Math.max(0, Math.floor((X / 100) * boxW)))],
  };
}

// our legend geometry — REPORTED ONLY (§4.3 "say what you found"). It is NOT
// allowed to influence the locus. That is the whole point of v2.
function ourBand(svg) {
  const gl = [];
  let size = null;
  for (const m of svg.matchAll(/<g[^>]*font-size="([\d.]+)"[^>]*>|<text([^>]*)>([^<]*)<\/text>/g)) {
    if (m[1]) { size = Number(m[1]); continue; }
    const at2 = m[2] || '';
    const s = at2.match(/font-size="([\d.]+)"/) ? Number(at2.match(/font-size="([\d.]+)"/)[1]) : size;
    const tr = at2.match(/translate\(([-\d.]+) ([-\d.]+)\)/);
    const xa = at2.match(/\sx="([-\d.]+)"/), ya = at2.match(/\sy="([-\d.]+)"/);
    const px = tr ? Number(tr[1]) : xa ? Number(xa[1]) : null;
    const py = tr ? Number(tr[2]) : ya ? Number(ya[1]) : null;
    if (px == null || !s) continue;
    gl.push({ ch: m[3], r: Math.hypot(px - 50, py - 50), cap: s * 0.72 });
  }
  if (!gl.length) return null;
  return {
    n: gl.length,
    baseMin: Math.min(...gl.map((g) => g.r)), baseMax: Math.max(...gl.map((g) => g.r)),
    inner: Math.min(...gl.map((g) => g.r - g.cap)), outer: Math.max(...gl.map((g) => g.r + g.cap)),
  };
}

const ARTPATH = process.env.ART || new URL('../../src/art/coins.js', import.meta.url).pathname;
const mod = await import(ARTPATH);

const TIERS = [26, 44, 84, 190];

async function scoreSide(side, m) {
  const out = [];
  for (const size of TIERS) {
    const o = await ourSampler(m, side, size);
    const fO = fieldLevel(o.fn);
    const refAtTier = await refSamplerAt(side, o.boxW);
    const fRT = fieldLevel(refAtTier);
    const pitch = 100 / o.boxW;
    const ho = hf(o.fn, FROZEN_R, fO, pitch), hr = hf(refAtTier, FROZEN_R, fRT, pitch);
    // evidence-only profile
    const prof = [];
    for (let r = PROFILE[0]; r <= PROFILE[1] + 1e-9; r += PROFILE[2]) {
      const a = hf(o.fn, r, fO, pitch).hf, b = hf(refAtTier, r, fRT, pitch).hf;
      prof.push({ r: +r.toFixed(2), ratio: a / (b || 1e-9) });
    }
    out.push({
      size, boxW: o.boxW, band: ourBand(o.svg),
      ourHF: ho.hf, refHF: hr.hf, ratio: ho.hf / (hr.hf || 1e-9),
      ourMean: ho.mean, refMean: hr.mean, N: ho.N,
      profMin: Math.min(...prof.map((p) => p.ratio)), profMax: Math.max(...prof.map((p) => p.ratio)),
      prof,
    });
  }
  return out;
}

if (process.env.RESPONSE) {
  console.log('=== §4 RESPONSE / §4.1 NULL / REFERENCE-INVARIANCE (v2) ===');
  const N = 800;
  const buf = Buffer.alloc(N * N, 200);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const X = (100 * (i + 0.5)) / N, Y = (100 * (j + 0.5)) / N;
    const r = Math.hypot(X - 50, Y - 50), th = Math.atan2(Y - 50, X - 50) * 180 / Math.PI;
    if (r >= 37 && r <= 41 && Math.floor(((th + 360) % 360) / 2) % 2 === 0) buf[j * N + i] = 40;
  }
  const S = (X, Y) => buf[Math.min(N - 1, Math.floor((Y / 100) * N)) * N + Math.min(N - 1, Math.floor((X / 100) * N))];
  const flat = Buffer.alloc(N * N, 200);
  const F = (X, Y) => flat[Math.min(N - 1, Math.floor((Y / 100) * N)) * N + Math.min(N - 1, Math.floor((X / 100) * N))];
  const h1 = hf(S, FROZEN_R, 200, 0.5).hf, h0 = hf(F, FROZEN_R, 200, 0.5).hf;
  console.log(`  response: stripes ${h1.toFixed(4)} vs flat ${h0.toFixed(4)} at the frozen locus  -> ${h1 > 10 * (h0 + 1e-9) ? 'PASS' : 'FAIL'}`);
  console.log(`  null: HF is a computation over a FIXED locus, not a search. No bounds to return.`);
  console.log(`        (the v1 BAND finder searched 20..46.5 and is a separate, BLOCKED, half of D5)`);
  console.log(`  locus is a literal: ${FROZEN_R} — not read from any artefact.`);
}

const label = ARTPATH.includes('coins-r1') ? 'ROUND 1 (git HEAD)' : ARTPATH === new URL('../../src/art/coins.js', import.meta.url).pathname ? 'WORKING TREE (round 2)' : ARTPATH;
console.log(`\n########  D5 HF — art = ${label}`);
console.log(`########  FROZEN LOCUS: sector ${SECTOR[0]}..${SECTOR[1]} deg, r = ${FROZEN_R} viewBox units, all tiers, both sides\n`);

const all = {};
for (const side of ['obverse', 'reverse']) {
  const rows = await scoreSide(side, mod);
  all[side] = rows;
  console.log(`=== ${side} — reference ${REFS[side].file}`);
  for (const r of rows) {
    console.log(`  ${String(r.size).padStart(3)}px (box ${String(r.boxW).padStart(3)}): legend ${r.band ? `${r.band.n} glyphs base r ${r.band.baseMin.toFixed(2)}..${r.band.baseMax.toFixed(2)} band ${r.band.inner.toFixed(2)}..${r.band.outer.toFixed(2)}` : 'NONE DRAWN'}`);
    console.log(`         HF@${FROZEN_R}: ours ${r.ourHF.toFixed(4)}  ref ${r.refHF.toFixed(4)}  RATIO ${r.ratio.toFixed(4)}x   (N=${r.N} samples)`);
    console.log(`         mean/field ours ${r.ourMean.toFixed(3)} ref ${r.refMean.toFixed(3)} | evidence: ratio over r ${PROFILE[0]}..${PROFILE[1]} = ${r.profMin.toFixed(2)}x .. ${r.profMax.toFixed(2)}x`);
  }
}

// ── REFERENCE-INVARIANCE: the property v1 lacked ─────────────────────────────
if (process.env.INVARIANCE) {
  const other = process.env.INVARIANCE;
  const m2 = await import(other);
  console.log(`\n=== REFERENCE-INVARIANCE TEST vs ${other}`);
  let bad = 0;
  for (const side of ['obverse', 'reverse']) {
    const rows2 = await scoreSide(side, m2);
    for (let i = 0; i < rows2.length; i++) {
      const a = all[side][i].refHF, b = rows2[i].refHF;
      const same = a === b;
      if (!same) bad++;
      console.log(`  ${side} ${String(rows2[i].size).padStart(3)}px  refHF A ${a.toFixed(6)}  B ${b.toFixed(6)}  ${same ? 'IDENTICAL' : `*** MOVED ${(b - a).toFixed(6)} ***`}`);
    }
  }
  console.log(bad === 0
    ? '  REFERENCE-INVARIANCE: PASS — the target scores the same against both revisions of the art.'
    : `  REFERENCE-INVARIANCE: FAIL on ${bad} rows — the locus is a function of the artefact under test. UNTRUSTED.`);
}

console.log('\nJSON ' + JSON.stringify(Object.fromEntries(Object.entries(all).map(([k, v]) =>
  [k, v.map((r) => ({ size: r.size, glyphs: r.band ? r.band.n : 0, ours: +r.ourHF.toFixed(4), ref: +r.refHF.toFixed(4), ratio: +r.ratio.toFixed(4) }))]))));
