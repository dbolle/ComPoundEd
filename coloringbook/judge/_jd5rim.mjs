// DIME r0, TASK 5 — THE RIM SEAT. The one number this round exists to settle.
//
// `EDGE` in `coins.js` gives all four coins one literal triple (full 41.0 /
// mid 40.5 / icon 42.5) that `scripts/coin-shared-claims.mjs` flags as never
// measured against any coin. Three coins have now been measured by three
// judges. The dime is the fourth and last, and it is the one with a physical
// reason to differ: it is the smallest coin (17.91 mm) and its portrait very
// nearly fills it.
//
// ── ESTIMATORS, all frozen in `dime-gates.md` BEFORE the first run ──────────
// E1  FIELD DEPARTURE. Radial profile m(r) = ANGULAR MEAN over the locus.
//     Field level L = median of m(r) over FIELD_WIN. Seat = innermost r in
//     RIM_WIN with |m(r) - L| > DROP.
//     This is `_jn5rim.mjs`'s rule with ONE generalisation, declared in the
//     gates file before any value: the test is |m - L|, not L - m, because a
//     cameo proof's mirror field photographs near-black and its rim is
//     BRIGHTER. The equivalence run below shows the generalisation reproduces
//     `_jn5rim.mjs` on the nickel exactly (cent PY6).
// E1m SAME RULE, ANGULAR MEDIAN instead of angular mean.
//     ** DISCLOSED ADDITION. ** Added after reading the unwrap PICTURE
//     (`_jd3unwrap-dime-obv-2.png`) and BEFORE any E1 value existed, for a
//     reason the picture makes obvious and that is a property of THIS coin:
//     LIBERTY occupies ~85 deg of the obverse between r 34 and r 41.5, and an
//     angular MEAN over the whole circle is therefore not a field level at all.
//     A median over the same angles is, because letters are a minority of every
//     circle. Reported beside E1, never instead of it.
// E2  GRADIENT SHOULDER. Innermost local maximum of |dm/dr| (m smoothed over
//     0.5 units) in GRAD_WIN whose prominence is >= 30 % of the window maximum.
// E3  THE PICTURE. Read by eye off the zoom this file writes. In dime-r0.md.
//
// ── SANITY (§4, §4.1, §4.2, §4.3) ──────────────────────────────────────────
// response  : EQUIVALENCE — reproduce `_jn5rim.mjs`'s six nickel seats; and
//             scaling the disc R by +2 % must move every seat by -2 %.
// null      : FIELD_WIN / RIM_WIN / GRAD_WIN printed; a seat at a window end is
//             a FAILURE REPORT, never a value.
// selection : every crossing in the window printed, not only the innermost.
// overlay   : the located seat drawn on the unwrap and on a 0.5-unit zoom, and
//             the judge READS THE IMAGE BACK (nickel N3).
//
// Radii are corrected by `_jd6edge.json`'s estimator-B factor (47 / rEdge),
// so every number below is in units where the coin's own silhouette is 47.00.
//
// Run: node coloringbook/judge/_jd5rim.mjs [equiv]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import sharp from 'sharp';
import { unwrap, ladder, draw, profile } from './_jd3unwrap.mjs';

const HERE = (f) => new URL('./' + f, import.meta.url).pathname;
const D = JSON.parse(readFileSync(HERE('_jd1discs.json')));
const E = JSON.parse(readFileSync(HERE('_jd6edge.json')));

// ── FROZEN LITERALS (dime-gates.md) ────────────────────────────────────────
const FIELD_WIN = [36.0, 42.0];
const RIM_WIN = [40.0, 46.5];
const GRAD_WIN = [40.0, 46.0];
const DROP = 25;
const STEP = 0.05;

// Bare-field angular sectors, READ OFF THE UNWRAP PICTURE OF THE REFERENCE
// (`_jd3unwrap-dime-obv-2.png`), never off our drawing. A sector qualifies if
// nothing but field lies between r 34 and the rim.
//   obverse: LIBERTY 160-246 deg, IN GOD WE TRUST 95-142, the date 38-80, the
//            mint mark ~43, the head/hair 246-360 and 0-2. What is left is
//            2-34 and 142-158.
//   reverse: NONE. UNITED STATES OF AMERICA and ONE DIME between them run the
//            whole way round with cap tops at ~43, and there is no bare gutter
//            between the legend and the rim. That is a finding, not a gap.
const SECTORS = {
  obverse: [[2, 34], [142, 158]],
  reverse: null,
};
const SIDE = (f) => (f.includes('obv') ? 'obverse' : 'reverse');

function prof(u, sect, useMedian) {
  const p = profile(u, sect || [[0, 360]], STEP);
  return p.filter((r) => r[3] > 0).map((r) => [r[0], useMedian ? r[2] : r[1]]);
}
const corr = (f) => (E[f] && E[f].B_correction) || 1;

function e1(rows, k) {
  const fw = rows.filter(([r]) => r * k >= FIELD_WIN[0] && r * k <= FIELD_WIN[1]).map(([, v]) => v).sort((a, b) => a - b);
  if (!fw.length) return { seat: null, why: 'field window empty' };
  const L = fw[fw.length >> 1];
  const win = rows.filter(([r]) => r * k >= RIM_WIN[0] && r * k <= RIM_WIN[1]);
  const crossings = [], down = [], up = [];
  let prev = false, pd = false, pu = false;
  for (const [r, v] of win) {
    const now = Math.abs(v - L) > DROP; if (now && !prev) crossings.push(+(r * k).toFixed(2)); prev = now;
    const nd = v < L - DROP; if (nd && !pd) down.push(+(r * k).toFixed(2)); pd = nd;
    const nu = v > L + DROP; if (nu && !pu) up.push(+(r * k).toFixed(2)); pu = nu;
  }
  const seat = crossings.length ? crossings[0] : null;
  const atBound = seat === null || seat <= RIM_WIN[0] + 0.1 || seat >= RIM_WIN[1] - 0.1;
  return { seat, L: +L.toFixed(1), crossings, down, up,
    seatSigned: down.length ? down[0] : null, seatBright: up.length ? up[0] : null, atBound };
}
function e2(rows, k) {
  const win = rows.filter(([r]) => r * k >= GRAD_WIN[0] - 1 && r * k <= GRAD_WIN[1] + 1);
  // smooth over 0.5 units
  const nSm = Math.max(1, Math.round(0.5 / STEP));
  const sm = win.map((_, i) => {
    let s = 0, n = 0;
    for (let j = Math.max(0, i - nSm); j <= Math.min(win.length - 1, i + nSm); j++) { s += win[j][1]; n++; }
    return [win[i][0] * k, s / n];
  });
  const g = [];
  for (let i = 1; i < sm.length - 1; i++) g.push([sm[i][0], Math.abs(sm[i + 1][1] - sm[i - 1][1]) / (Math.abs(sm[i + 1][0] - sm[i - 1][0]) || 1e-9)]);
  const inW = g.filter(([r]) => r >= GRAD_WIN[0] && r <= GRAD_WIN[1]);
  if (!inW.length) return { seat: null };
  const mx = Math.max(...inW.map((x) => x[1]));
  const peaks = [];
  for (let i = 1; i < inW.length - 1; i++)
    if (inW[i][1] >= inW[i - 1][1] && inW[i][1] >= inW[i + 1][1] && inW[i][1] >= 0.30 * mx) peaks.push([+inW[i][0].toFixed(2), +inW[i][1].toFixed(2)]);
  const seat = peaks.length ? peaks[0][0] : null;
  const atBound = seat === null || seat <= GRAD_WIN[0] + 0.1 || seat >= GRAD_WIN[1] - 0.1;
  return { seat, peaks, max: +mx.toFixed(2), atBound };
}

// ── EQUIVALENCE (cent PY6): reproduce `_jn5rim.mjs` on the NICKEL ──────────
if (process.argv[2] === 'equiv') {
  const ND = JSON.parse(readFileSync(HERE('_jn1discs.json')));
  const NFIELD = [41.0, 43.0], NRIM = [42.0, 46.5], NDROP = 25;
  console.log('EQUIVALENCE (cent PY6): my E1, given _jn5rim.mjs\'s own parameters and discs,');
  console.log('must reproduce its six nickel rim seats. _jn5rim.mjs published:');
  console.log('  nickel-rev-2.png 44.30  nickel-rev.jpg 44.05  nickel-obv.jpg 44.15  (and three more)\n');
  for (const f of Object.keys(ND)) {
    if (!ND[f] || !ND[f].R) continue;
    const u = await unwrap(f, ND[f]);
    const rows = prof(u, null, false);
    const fw = rows.filter(([r]) => r >= NFIELD[0] && r <= NFIELD[1]).map(([, v]) => v).sort((a, b) => a - b);
    const L = fw[fw.length >> 1];
    const win = rows.filter(([r]) => r >= NRIM[0] && r <= NRIM[1]);
    const signed = win.find(([, v]) => v < L - NDROP);
    const absol = win.find(([, v]) => Math.abs(v - L) > NDROP);
    console.log(`  ${f.padEnd(24)} field ${L.toFixed(1)}   signed rule -> ${signed ? signed[0].toFixed(2) : 'NOT FOUND'}   |abs| rule -> ${absol ? absol[0].toFixed(2) : 'NOT FOUND'}`);
  }
  process.exit(0);
}

const OUT = { params: { FIELD_WIN, RIM_WIN, GRAD_WIN, DROP, STEP, SECTORS }, refs: {} };
console.log('=== DIME RIM SEAT ===');
console.log(`§4.1 windows: field ${FIELD_WIN}, rim ${RIM_WIN}, gradient ${GRAD_WIN}, DROP ${DROP} grey levels.`);
console.log('A seat at a window end is a FAILURE REPORT, not a value.');
console.log('Radii corrected by _jd6edge.json estimator B so the coin silhouette is 47.00.\n');

for (const f of Object.keys(D)) {
  if (!D[f] || !D[f].R) continue;
  const k = corr(f), side = SIDE(f);
  const usable = E[f] && E[f].usableForGeometry;
  const u = await unwrap(f);
  const loci = [['whole circle, angular MEAN', null, false], ['whole circle, angular MEDIAN', null, true]];
  if (SECTORS[side]) loci.push([`bare-field sectors ${JSON.stringify(SECTORS[side])}, MEAN`, SECTORS[side], false],
    [`bare-field sectors ${JSON.stringify(SECTORS[side])}, MEDIAN`, SECTORS[side], true]);
  console.log(`── ${f}  (${side}, correction x${k}, disc p95 ${D[f].p95pctR}%R)${usable ? '' : '   << EDGE SPREAD > 3%: NOT USABLE FOR A GEOMETRIC GATE'}`);
  OUT.refs[f] = { side, correction: k, usableForGeometry: !!usable, loci: {} };
  for (const [name, sect, useMed] of loci) {
    const rows = prof(u, sect, useMed);
    const a = e1(rows, k), b = e2(rows, k);
    OUT.refs[f].loci[name] = { E1: a, E2: b };
    console.log(`   ${name}`);
    console.log(`     E1 field level ${a.L}   ALL crossings (§4.2) ${JSON.stringify(a.crossings)}   -> seat ${a.seat === null ? 'NOT FOUND' : a.seat.toFixed(2)}${a.atBound ? '  <-- AT/OUTSIDE A WINDOW BOUND: FAILURE REPORT' : ''}`);
    console.log(`        signed-DARK rule (_jn5rim.mjs's own) -> ${a.seatSigned === null ? 'NOT FOUND' : a.seatSigned.toFixed(2)}   [all ${JSON.stringify(a.down)}] ; signed-BRIGHT -> ${a.seatBright === null ? 'NOT FOUND' : a.seatBright.toFixed(2)}   [all ${JSON.stringify(a.up)}]`);
    console.log(`     E2 |dm/dr| max ${b.max}  ALL peaks >=30% (§4.2) ${JSON.stringify((b.peaks || []).slice(0, 8))}  -> seat ${b.seat === null ? 'NOT FOUND' : b.seat.toFixed(2)}${b.atBound ? '  <-- AT A WINDOW BOUND: FAILURE REPORT' : ''}`);
  }
  // numeric profile so a radius can be read to better than the ladder
  const rows = prof(u, SECTORS[side], SECTORS[side] ? false : true);
  console.log('     profile (r : value) over the locus of record, 0.25-unit steps, r 38..47:');
  console.log('       ' + rows.filter(([r]) => r * k >= 38 && r * k <= 47 && Math.abs(r * k * 4 - Math.round(r * k * 4)) < 0.12)
    .map(([r, v]) => `${(r * k).toFixed(2)}:${v.toFixed(0)}`).join(' '));
  console.log('');
}

// ── §4 RESPONSE TEST: shrink the disc 2 %, every seat must move -2 % ────────
{
  const f = 'dime-obv-2.jpg', k = corr(f);
  const base = e1(prof(await unwrap(f), SECTORS.obverse, false), k).seat;
  const d2 = { ...D[f], R: D[f].R * 1.02 };
  const moved = e1(prof(await unwrap(f, d2), SECTORS.obverse, false), k).seat;
  console.log(`RESPONSE TEST ${f}: disc R x1.02 -> seat ${base === null ? 'n/a' : base.toFixed(3)} -> ${moved === null ? 'n/a' : moved.toFixed(3)}` +
    (base && moved ? `  (${(100 * (moved / base - 1)).toFixed(2)}%, expected -1.96%)` : ''));
}

// ── §4.3 OVERLAY + 0.5-unit ZOOM for E3 ────────────────────────────────────
for (const f of Object.keys(D)) {
  if (!D[f] || !D[f].R) continue;
  const side = SIDE(f), k = corr(f);
  const u = await unwrap(f);
  const rows = prof(u, SECTORS[side], !SECTORS[side]);
  const a = e1(rows, k), b = e2(rows, k);
  const y = (vbu) => (u.RB - vbu / (47 * k)) / (u.RB - u.RA) * (u.H - 1);
  const extra = [];
  if (a.seat) extra.push(`<path d="M0 ${y(a.seat)}H${u.W}" stroke="#ff9500" stroke-width="2.4"/><text x="20" y="${y(a.seat) - 6}" font-family="monospace" font-size="18" fill="#ff9500">E1 seat ${a.seat.toFixed(2)}</text>`);
  if (b.seat) extra.push(`<path d="M0 ${y(b.seat)}H${u.W}" stroke="#00ff6a" stroke-width="2.4" stroke-dasharray="10 6"/><text x="${u.W / 2}" y="${y(b.seat) - 6}" font-family="monospace" font-size="18" fill="#00ff6a">E2 seat ${b.seat.toFixed(2)}</text>`);
  extra.push(`<path d="M0 ${y(41)}H${u.W}" stroke="#ff00d4" stroke-width="2" stroke-dasharray="8 6"/><text x="${u.W - 520}" y="${y(41) - 5}" font-family="monospace" font-size="15" fill="#ff00d4">OURS EDGE.dime.field.full 41.0</text>`);
  if (SECTORS[side]) for (const [s0, s1] of SECTORS[side])
    extra.push(`<rect x="${u.W * s0 / 360}" y="0" width="${u.W * (s1 - s0) / 360}" height="${u.H}" fill="#00b0ff" opacity="0.10"/>`);
  await draw(u, ladder(u, extra), HERE(`_jd5rim-${f.replace(/\..*/, '')}.png`));

  // 0.5-unit zoom over r 39..47.5 for E3
  const zH = 900, zW = 1800;
  const zb = Buffer.alloc(zW * zH);
  for (let j = 0; j < zH; j++) {
    const vbu = 47.5 - (47.5 - 39) * j / (zH - 1);
    const src = Math.round((u.RB - vbu / (47 * k)) / (u.RB - u.RA) * (u.H - 1));
    for (let i = 0; i < zW; i++) zb[j * zW + i] = u.buf[Math.max(0, Math.min(u.H - 1, src)) * u.W + Math.round(i * u.W / zW)];
  }
  let g = '';
  for (let vbu = 39; vbu <= 47.5; vbu += 0.5) {
    const yy = (47.5 - vbu) / (47.5 - 39) * (zH - 1);
    const maj = Math.abs(vbu - Math.round(vbu)) < 1e-9;
    g += `<path d="M0 ${yy.toFixed(1)}H${zW}" stroke="${maj ? '#ff2d55' : '#00e5ff'}" stroke-width="${maj ? 1.3 : 0.6}" opacity="${maj ? 0.9 : 0.45}"/>`
      + `<text x="4" y="${(yy - 3).toFixed(1)}" font-family="monospace" font-size="16" fill="#ffe600">${vbu}</text>`
      + `<text x="${zW - 44}" y="${(yy - 3).toFixed(1)}" font-family="monospace" font-size="16" fill="#ffe600">${vbu}</text>`;
  }
  for (let ang = 0; ang < 360; ang += 30) g += `<path d="M${zW * ang / 360} 0V${zH}" stroke="#fff" stroke-width="0.6" opacity="0.4"/><text x="${zW * ang / 360 + 3}" y="16" font-family="monospace" font-size="13" fill="#fff">${ang}</text>`;
  g += `<text x="${zW / 2 - 300}" y="${zH - 10}" font-family="monospace" font-size="20" fill="#0ff">${f} — 0.5-unit ladder, corrected so the coin edge is 47.00</text>`;
  const grey = await sharp(zb, { raw: { width: zW, height: zH, channels: 1 } }).png().toBuffer();
  const rgb = await sharp(grey).toColourspace('srgb').png().toBuffer();
  await sharp(rgb).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${zW}" height="${zH}">${g}</svg>`) }]).toFile(HERE(`_jd5zoom-${f.replace(/\..*/, '')}.png`));
}
console.log('\noverlays -> _jd5rim-<ref>.png ; 0.5-unit zooms for E3 -> _jd5zoom-<ref>.png');

const p = HERE('_jd4band.json');
if (existsSync(p)) console.log('_jd4band.json exists — refusing to overwrite (§6 rule 1)');
else { writeFileSync(p, JSON.stringify(OUT, null, 1)); console.log('froze _jd4band.json'); }
