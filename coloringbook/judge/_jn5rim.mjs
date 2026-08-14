// NICKEL round 0 — LEGEND BAND (high-pass) and RIM SEAT (field departure).
//
// ── WHY THERE IS A SECOND INSTRUMENT ───────────────────────────────────────
// `_jn4band.mjs` is kept, unedited, as the record of two failures it found in
// itself, both of them §4.3's "in-bounds answer to the wrong question":
//
//  1. Its ALONG-ANGLE SD is not specific to lettering. A coin is lit from one
//     side, so the bare field's grey varies slowly with angle; over a 90-120°
//     sector that slow variation is worth more sd than the letters are. Its
//     plateau therefore reaches 6-8 units inboard of the letters on every
//     reference, its inner edge sits at 36.1-37.5 where the unwrap PICTURE
//     plainly shows bare field, and on the reverse bottom legend its
//     degeneracy is 1.64x-2.07x — the same 1.6x that got the quarter's round-0
//     band finder ruled unusable.
//  2. Its RIM SEAT rule ("steepest |d mean / dr| outboard of 41") locks onto
//     the COIN'S OUTER EDGE on 4 of 6 references: 46.55, 46.95, 47.20, 47.25
//     against a blank edge at 47.0. That is a far bigger step than the rim
//     seat and it is the wrong feature, exactly as printed.
//
// ── WHAT THIS ONE DOES INSTEAD ─────────────────────────────────────────────
// LEGEND BAND. High-pass in ANGLE before measuring: subtract a Gaussian
// smoothing of the angular trace (sigma 3.0°, chosen because at r 40 a nickel
// legend glyph advances about 7° so its own frequency survives while
// illumination, which varies over tens of degrees, does not). Then band(r) =
// mean |high-pass|. This is the same quantity §16.1 already uses along a band,
// applied ACROSS radius.
//
// RIM SEAT. The rim seat is not the steepest step anywhere; it is where the
// FLAT FIELD ENDS. Field level = median of the along-angle mean over the stated
// field window; the seat is the innermost radius outboard of it where the mean
// has fallen by more than DROP grey levels. Window and DROP are printed, and a
// seat at either end of the window is a failure report.
//
// §4.3 Both are drawn back onto the unwrap picture (`_jn5-<ref>.png`) and the
//      judge looks. The picture is the control; a number that disagrees with it
//      is wrong whatever its bounds say (round 4, S2).
// §6.1 Sectors and windows are frozen literals derived from the TARGET.
//
// Run: node coloringbook/judge/_jn5rim.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { unwrap } from './_jn3unwrap.mjs';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
const HERE = (f) => new URL('./' + f, import.meta.url).pathname;
const D = JSON.parse(readFileSync(HERE('_jn1discs.json')));

const RLO = 33.0, RHI = 46.0, STEP = 0.05;   // band search window
const FIELD_WIN = [41.0, 43.0];              // where the bare field level is read
const RIM_WIN = [42.0, 46.5];                // where the seat may be found
const DROP = 25;                             // grey levels below field = "no longer field"
const SIG = 3.0;                             // angular high-pass sigma, degrees

const cache = new Map();
async function img(file) {
  if (cache.has(file)) return cache.get(file);
  const { data, info } = await sharp(P(file)).flatten({ background: '#808080' })
    .greyscale().raw().toBuffer({ resolveWithObject: true });
  const o = { d: data, W: info.width, H: info.height, disc: D[file] };
  cache.set(file, o); return o;
}
const at = (g, x, y) => {
  if (x < 0 || y < 0 || x >= g.W - 1 || y >= g.H - 1) return NaN;
  const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0;
  return g.d[y0 * g.W + x0] * (1 - fx) * (1 - fy) + g.d[y0 * g.W + x0 + 1] * fx * (1 - fy)
    + g.d[(y0 + 1) * g.W + x0] * (1 - fx) * fy + g.d[(y0 + 1) * g.W + x0 + 1] * fx * fy;
};

// angular trace at one radius, sampled every DEG degrees over [a0,a1]
const DEG = 0.25;
function trace(g, r, a0, a1) {
  const n = Math.round((a1 - a0) / DEG) + 1, out = new Float64Array(n);
  const rr = (r / 47) * g.disc.R;
  for (let k = 0; k < n; k++) {
    const a = ((a0 + k * DEG) * Math.PI) / 180;
    out[k] = at(g, g.disc.cx + rr * Math.cos(a), g.disc.cy + rr * Math.sin(a));
  }
  return out;
}
function gauss(x, sigDeg) {
  const s = sigDeg / DEG, k = Math.ceil(3 * s), w = [];
  for (let i = -k; i <= k; i++) w.push(Math.exp(-(i * i) / (2 * s * s)));
  const sw = w.reduce((a, b) => a + b, 0);
  const out = new Float64Array(x.length);
  for (let i = 0; i < x.length; i++) {
    let s2 = 0, ww = 0;
    for (let j = -k; j <= k; j++) { const p = i + j; if (p < 0 || p >= x.length) continue; s2 += x[p] * w[j + k]; ww += w[j + k]; }
    out[i] = s2 / ww;
  }
  return out;
}

export async function bandProfile(file, a0, a1) {
  const g = await img(file); const rows = [];
  for (let r = RLO; r <= RHI + 1e-9; r += STEP) {
    const t = trace(g, r, a0, a1), sm = gauss(t, SIG);
    let s = 0, n = 0, mu = 0;
    for (let i = 0; i < t.length; i++) { if (!Number.isFinite(t[i])) continue; s += Math.abs(t[i] - sm[i]); mu += t[i]; n++; }
    rows.push({ r: +r.toFixed(2), hf: s / n, mean: mu / n });
  }
  return rows;
}

function runsAbove(rows, key, frac) {
  const mx = Math.max(...rows.map((x) => x[key]));
  const med = rows.map((x) => x[key]).sort((a, b) => a - b)[rows.length >> 1];
  const thr = frac * mx, out = []; let run = null;
  for (const x of rows) {
    if (x[key] >= thr) { if (!run) run = { lo: x.r, hi: x.r, peak: x[key], peakR: x.r }; else { run.hi = x.r; if (x[key] > run.peak) { run.peak = x[key]; run.peakR = x.r; } } }
    else if (run) { out.push(run); run = null; }
  }
  if (run) out.push(run);
  return { list: out, max: mx, med, degeneracy: mx / (med || 1e-9) };
}

const JOBS = [
  { tag: 'rev-top  E PLURIBUS UNUM', sector: [225, 315], refs: ['nickel-rev-2.png', 'nickel-rev.jpg', 'nickel-rev-proof.png'] },
  { tag: 'rev-bot  UNITED STATES OF AMERICA', sector: [30, 150], refs: ['nickel-rev-2.png', 'nickel-rev.jpg', 'nickel-rev-proof.png'] },
  { tag: 'obv-left IN GOD WE TRUST', sector: [140, 210], refs: ['nickel-obv-5.JPG', 'nickel-obv.jpg', 'nickel-obv-proof.png'] },
  { tag: 'obv-rt   LIBERTY', sector: [318, 352], refs: ['nickel-obv-5.JPG', 'nickel-obv.jpg', 'nickel-obv-proof.png'] },
];
const RIM_REFS = ['nickel-rev-2.png', 'nickel-rev.jpg', 'nickel-rev-proof.png', 'nickel-obv-5.JPG', 'nickel-obv.jpg', 'nickel-obv-proof.png'];

const bar = (v, mx, w = 34) => '#'.repeat(Math.max(0, Math.round((v / mx) * w)));
const OUT = { band: {}, rim: {}, params: { RLO, RHI, STEP, SIG, FIELD_WIN, RIM_WIN, DROP, DEG } };

console.log(`band window (§4.1) r ${RLO}..${RHI}; angular high-pass sigma ${SIG} deg; a band edge at a window end is a FAILURE REPORT.\n`);
for (const job of JOBS) {
  console.log(`\n═══ ${job.tag}   sector ${job.sector[0]}..${job.sector[1]}  [FROZEN LOCUS from the TARGET]`);
  for (const ref of job.refs) {
    const rows = await bandProfile(ref, job.sector[0], job.sector[1]);
    const R = runsAbove(rows, 'hf', 0.5);
    console.log(`\n  ${ref}   hf max ${R.max.toFixed(2)}  median ${R.med.toFixed(2)}  degeneracy ${R.degeneracy.toFixed(2)}x`);
    console.log('  EVERY run at hf >= 0.5*max (§4.2):');
    for (const p of R.list) {
      const atB = p.lo <= RLO + 1e-9 || p.hi >= RHI - 1e-9;
      console.log(`     r ${p.lo.toFixed(2)} .. ${p.hi.toFixed(2)}  width ${(p.hi - p.lo).toFixed(2)}  peak ${p.peak.toFixed(1)} at ${p.peakR.toFixed(2)}` +
        (atB ? '   <-- AT A WINDOW BOUND (§4.1): FAILURE REPORT' : ''));
    }
    const main = R.list.slice().sort((a, b) => (b.hi - b.lo) - (a.hi - a.lo))[0];
    OUT.band[`${job.tag}|${ref}`] = main ? { lo: main.lo, hi: main.hi, width: +(main.hi - main.lo).toFixed(2), degeneracy: +R.degeneracy.toFixed(2) } : null;
    console.log('     r      hf');
    for (const x of rows) if (Math.abs(x.r * 4 - Math.round(x.r * 4)) < 1e-9) console.log(`     ${x.r.toFixed(2).padStart(5)}  ${x.hf.toFixed(1).padStart(5)}  ${bar(x.hf, R.max)}`);
  }
}

console.log(`\n\n═══ RIM SEAT — where the FLAT FIELD ENDS.`);
console.log(`   field level = median mean grey over r ${FIELD_WIN[0]}..${FIELD_WIN[1]}; seat = innermost r in ${RIM_WIN[0]}..${RIM_WIN[1]} with mean < field - ${DROP}.\n`);
for (const ref of RIM_REFS) {
  const rows = await bandProfile(ref, 0, 360);
  const fw = rows.filter((x) => x.r >= FIELD_WIN[0] && x.r <= FIELD_WIN[1]).map((x) => x.mean).sort((a, b) => a - b);
  const lvl = fw[fw.length >> 1];
  const win = rows.filter((x) => x.r >= RIM_WIN[0] && x.r <= RIM_WIN[1]);
  const hit = win.find((x) => x.mean < lvl - DROP);
  const atB = !hit || hit.r <= RIM_WIN[0] + 0.1 || hit.r >= RIM_WIN[1] - 0.1;
  OUT.rim[ref] = hit ? hit.r : null;
  console.log(`  ${ref.padEnd(24)} field level ${lvl.toFixed(1)}   rim seat r = ${hit ? hit.r.toFixed(2) : 'NOT FOUND'}` +
    (atB ? '   <-- AT/OUTSIDE A WINDOW BOUND (§4.1): FAILURE REPORT' : ''));
  console.log('     r      mean');
  for (const x of win) if (Math.abs(x.r * 4 - Math.round(x.r * 4)) < 1e-9) console.log(`     ${x.r.toFixed(2).padStart(5)}  ${x.mean.toFixed(1).padStart(6)}${x.mean < lvl - DROP ? '  <- below field-DROP' : ''}`);
}

// ── §4.3 OVERLAY: draw what was located onto the unwrap picture ─────────────
for (const ref of ['nickel-rev-2.png', 'nickel-obv-5.JPG']) {
  const { buf, W, H } = await unwrap(ref, 1800, 620);
  const RA = 0.60, RB = 1.04;
  const y = (vbu) => ((RB - vbu / 47) / (RB - RA)) * (H - 1);
  let g = '';
  for (let vbu = 33; vbu <= 47; vbu++) {
    const maj = vbu % 5 === 0;
    g += `<path d="M0 ${y(vbu).toFixed(1)}H${W}" stroke="${maj ? '#ff2d55' : '#00e5ff'}" stroke-width="${maj ? 1.2 : 0.5}" opacity="${maj ? 0.8 : 0.35}"/>` +
      `<text x="3" y="${(y(vbu) - 2).toFixed(1)}" font-family="monospace" font-size="12" fill="#ffe600">${vbu}</text>`;
  }
  for (const [k, v] of Object.entries(OUT.band)) {
    if (!k.endsWith('|' + ref) || !v) continue;
    const jb = JOBS.find((j) => k.startsWith(j.tag));
    const x0 = W * jb.sector[0] / 360, x1 = W * jb.sector[1] / 360;
    g += `<rect x="${x0}" y="${y(v.hi)}" width="${x1 - x0}" height="${y(v.lo) - y(v.hi)}" fill="none" stroke="#00ff6a" stroke-width="2.5"/>` +
      `<text x="${x0 + 6}" y="${y(v.hi) - 5}" font-family="monospace" font-size="15" fill="#00ff6a">LOCATED BAND ${v.lo}..${v.hi}</text>`;
  }
  if (OUT.rim[ref]) g += `<path d="M0 ${y(OUT.rim[ref])}H${W}" stroke="#ff9500" stroke-width="2.5"/>` +
    `<text x="${W / 2}" y="${y(OUT.rim[ref]) - 5}" font-family="monospace" font-size="15" fill="#ff9500">LOCATED RIM SEAT ${OUT.rim[ref]}</text>`;
  for (const [vbu, col, lab] of [[41.0, '#ff00d4', 'OURS EDGE.nickel.field.full 41.0'], [36.4, '#ffffff', 'OURS reverse legend baseline 36.4'], [35.54, '#ffffff', 'OURS obverse LIBERTY baseline 35.54']]) {
    g += `<path d="M0 ${y(vbu)}H${W}" stroke="${col}" stroke-width="2" stroke-dasharray="8 6"/>` +
      `<text x="${W - 460}" y="${y(vbu) - 4}" font-family="monospace" font-size="14" fill="${col}">${lab}</text>`;
  }
  const grey = await sharp(buf, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
  const rgb = await sharp(grey).toColourspace('srgb').png().toBuffer();
  await sharp(rgb).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${g}</svg>`) }])
    .toFile(HERE(`_jn5-${ref.replace(/\..*$/, '')}.png`));
  console.log(`\noverlay -> _jn5-${ref.replace(/\..*$/, '')}.png`);
}
console.log('\nJSON:\n' + JSON.stringify(OUT, null, 1));
