// D5 — lettering, both sides. §16.2 (the legend is a BAND, measured by the
// angular standard deviation at each radius) and §16.1 (along-band HF energy
// against the photograph reduced to the SAME device pixel count).
//
// Polar, not rectangular: a legend is an arc, and the rectangular band in
// _rvicon.mjs is only honest over a narrow sector. Both sides go through the
// same code so obverse and reverse numbers are comparable.
//
// Run: node coloringbook/judge/_jq5letter.mjs
//      RESPONSE=1 -> synthetic-target response test first.
import sharp from 'sharp';

const R_VB = 47;                       // our disc radius in viewBox units
const SECTOR = [250, 290];             // straight up: only the legend lives there

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

// radial sweep of the ANGULAR standard deviation
function sigmaSweep(sample, r0 = 30, r1 = 46, step = 0.25) {
  const rows = [];
  for (let r = r0; r <= r1 + 1e-9; r += step) {
    const v = [];
    for (let k = 0; k < 720; k++) {
      const th = ((SECTOR[0] + ((SECTOR[1] - SECTOR[0]) * k) / 720) * Math.PI) / 180;
      v.push(sample(50 + r * Math.cos(th), 50 + r * Math.sin(th)));
    }
    const m = v.reduce((a, b) => a + b, 0) / v.length;
    rows.push({ r, mean: m, sd: Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / v.length) });
  }
  return rows;
}

// band = the contiguous run around the sigma maximum that stays above
// lo + 0.5*(hi-lo). Bounds are printed so a result equal to a search bound is
// visible (method doc §23.6).
function band(rows) {
  const sds = rows.map((r) => r.sd);
  const hi = Math.max(...sds), lo = Math.min(...sds);
  const thr = lo + 0.5 * (hi - lo);
  const pk = sds.indexOf(hi);
  let i = pk, j = pk;
  while (i > 0 && sds[i - 1] >= thr) i--;
  while (j < sds.length - 1 && sds[j + 1] >= thr) j++;
  return {
    inner: rows[i].r, outer: rows[j].r, peak: rows[pk].r, hi, lo, thr,
    atBound: i === 0 || j === rows.length - 1,
    searchBounds: [rows[0].r, rows[rows.length - 1].r],
  };
}

// along-band HF energy at the band's mid radius, per viewBox unit, both sides
// normalised by their own bare-field level
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
  return { hf: Math.sqrt(ds / (N - 1)) * N / arc, mean: m, sd: Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / N) };
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

// ── the two references, sampled in OUR viewBox coordinates ────────────────
const REFS = {
  obverse: { file: 'quarter-obv-2.jpg', disc: { cx: 374.41, cy: 374.36, R: 373.67 } },
  reverse: { file: 'quarter-rev-2.png', disc: { cx: 374.50, cy: 374.37, R: 374.98 } },
};

async function refSampler(side) {
  const { file, disc } = REFS[side];
  const g = await greyOf(new URL('../ref/' + file, import.meta.url).pathname);
  return (X, Y) => at(g, disc.cx + ((X - 50) / R_VB) * disc.R, disc.cy + ((Y - 50) / R_VB) * disc.R);
}
// reference reduced to a tier's real device pixel count (box filter, no upsampling)
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
    boxW,
    fn: (X, Y) => data[Math.min(boxW - 1, Math.max(0, Math.floor((Y / 100) * boxW))) * boxW
                      + Math.min(boxW - 1, Math.max(0, Math.floor((X / 100) * boxW)))],
  };
}

if (process.env.RESPONSE) {
  // synthetic: a ring of angular stripes at r 38..42, flat elsewhere
  const N = 800;
  const buf = Buffer.alloc(N * N, 200);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const X = (100 * (i + 0.5)) / N, Y = (100 * (j + 0.5)) / N;
    const r = Math.hypot(X - 50, Y - 50), th = Math.atan2(Y - 50, X - 50) * 180 / Math.PI;
    if (r >= 38 && r <= 42 && Math.floor(((th + 360) % 360) / 2) % 2 === 0) buf[j * N + i] = 40;
  }
  const S = (X, Y) => buf[Math.min(N - 1, Math.floor((Y / 100) * N)) * N + Math.min(N - 1, Math.floor((X / 100) * N))];
  const b = band(sigmaSweep(S));
  console.log(`RESPONSE TEST (D5 band finder): synthetic stripes at r 38.0..42.0`);
  console.log(`  found inner ${b.inner.toFixed(2)} outer ${b.outer.toFixed(2)} peak ${b.peak.toFixed(2)} (search bounds ${b.searchBounds})`);
  const okB = Math.abs(b.inner - 38) <= 1 && Math.abs(b.outer - 42) <= 1 && !b.atBound;
  // and the HF measure must separate stripes from a flat ring
  const flatBuf = Buffer.alloc(N * N, 200);
  const F = (X, Y) => flatBuf[Math.min(N - 1, Math.floor((Y / 100) * N)) * N + Math.min(N - 1, Math.floor((X / 100) * N))];
  const h1 = hf(S, 40, 200, 0.5).hf, h0 = hf(F, 40, 200, 0.5).hf;
  console.log(`  HF energy: stripes ${h1.toFixed(4)}  flat ${h0.toFixed(4)}`);
  console.log(okB && h1 > 10 * (h0 + 1e-9) ? '  RESPONSE TEST PASS\n' : '  RESPONSE TEST FAIL — D5 is UNTRUSTED\n');
}

const mod = await import('../../src/art/coins.js');
const { textMarks } = await import('./_jq8contain.mjs').catch(() => ({}));

// OUR legend band, measured EXACTLY off the emitted glyph geometry rather than
// detected — there is no reason to run a detector on a document we authored.
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
    const rBase = Math.hypot(px - 50, py - 50);
    gl.push({ ch: m[3], r: rBase, cap: s * 0.72, rev: !!tr && false });
  }
  if (!gl.length) return null;
  // arcText draws caps OUTWARD for the un-reversed strings and INWARD for the
  // reversed (bottom) ones; report the union either way as [min, max]
  const inner = Math.min(...gl.map((g) => g.r - g.cap)), outer = Math.max(...gl.map((g) => g.r + g.cap));
  return { n: gl.length, baseMin: Math.min(...gl.map((g) => g.r)), baseMax: Math.max(...gl.map((g) => g.r)), inner, outer };
}

for (const side of ['obverse', 'reverse']) {
  const S = await refSampler(side);
  const rows = sigmaSweep(S, 20, 46.5, 0.5);
  const b = band(rows);
  console.log(`\n=== D5 ${side} — reference ${REFS[side].file}, sector ${SECTOR[0]}..${SECTOR[1]} deg`);
  console.log(`  §16.2 radial-sigma band detector: inner ${b.inner.toFixed(2)} outer ${b.outer.toFixed(2)} peak ${b.peak.toFixed(2)}`);
  console.log(`  sigma hi ${b.hi.toFixed(1)} lo ${b.lo.toFixed(1)}; search bounds ${b.searchBounds}; RESULT AT A SEARCH BOUND: ${b.atBound}`);
  const sds = rows.map((r) => r.sd);
  const contrast = Math.max(...sds) / (sds.slice().sort((x, y) => x - y)[Math.floor(sds.length * 0.5)]);
  console.log(`  plateau contrast (max sigma / median sigma) = ${contrast.toFixed(2)}   (a resolvable band needs a clear shoulder-plateau-shoulder; see the printed profile)`);
  for (const size of [26, 44, 84, 190]) {
    const svg = mod.coinSVG('quarter', size, { side });
    const ob = ourBand(svg);
    const o = await ourSampler(mod, side, size);
    const fO = fieldLevel(o.fn);
    const refAtTier = await refSamplerAt(side, o.boxW);
    const fRT = fieldLevel(refAtTier);
    const rMid = ob ? (ob.baseMin + ob.baseMax) / 2 + 0.36 * (ob.outer - ob.inner) / 2 : 38.9;
    const ho = hf(o.fn, rMid, fO, 100 / o.boxW), hr = hf(refAtTier, rMid, fRT, 100 / o.boxW);
    console.log(`  ${String(size).padStart(3)}px (box ${String(o.boxW).padStart(3)}px): our legend ${ob ? `${ob.n} glyphs, baseline r ${ob.baseMin.toFixed(2)}..${ob.baseMax.toFixed(2)}, band ${ob.inner.toFixed(2)}..${ob.outer.toFixed(2)}` : 'NONE DRAWN'} | HF at r=${rMid.toFixed(1)}: ours ${ho.hf.toFixed(4)} ref ${hr.hf.toFixed(4)} ratio ${(ho.hf / (hr.hf || 1e-9)).toFixed(2)}x | mean/field ours ${ho.mean.toFixed(3)} ref ${hr.mean.toFixed(3)}`);
  }
}
