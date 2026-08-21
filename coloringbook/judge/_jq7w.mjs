// ROUND 7, QUARTER OBVERSE — D6's width measurement, done with ROUND 4'S OWN
// INSTRUMENT rather than a new one.
//
// `_jq7prof.mjs` was written first and is kept because its failures are the
// evidence for the settings here, but it is superseded: it read a raw
// perpendicular profile against a fixed background band and it under-reported.
// `_jw4width.mjs` — the instrument that measured the dime's jaw at 2.90 -> 1.80
// in round 4, whose SELFTEST recovers a synthetic band of known width to 0.05
// units — does three things it did not:
//
//   · it AVERAGES TANGENTIALLY along the path before reading the profile, which
//     is the only noise reduction that cannot smear a boundary's width;
//   · its shoulders are the MAXIMUM on each side of the trough, not a fixed
//     background band, so a feature wider than the band is still measured;
//   · it masks to the head polygon, so a ray running off the profile into the
//     field does not report the SILHOUETTE as the feature (spec 4.3).
//
// It is imported UNCHANGED (spec 1: a specialist does not edit an instrument).
// What is new here is only the registration: `_jw4reg.mjs` maps the dime's head
// frame, and this maps the quarter's. Because `marks()` already returns every
// polyline in VIEWBOX units with transforms applied, "local units" and viewBox
// units are the same thing here and the map is one line.
//
// §4 RESPONSE TEST — SELFTEST=1 synthesises, at the quarter's own registration,
//     a dark band of KNOWN width laid exactly along each subject path, and
//     requires recovery. This is the test `_jq7prof.mjs` never had: its
//     "response test" moved the CENTRELINE and asked whether the located offset
//     tracked, which a broad flat-bottomed feature legitimately fails.
// §4.1 NULL TEST — HALF is printed; a width that reaches 2*HALF, or a trough at
//     the trough-search bound, is printed BOUND and never used as a value.
// §4.3 the paths measured are the ones `_jq7over.mjs` draws on the source.
//
// Run: node coloringbook/judge/_jq7w.mjs            (all 26 stroke marks)
//      SELFTEST=1 node coloringbook/judge/_jq7w.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { walk, runAt, greyImg } from './_jw4width.mjs';
import { marks } from './_jqgeom.mjs';

const HALF = Number(process.env.HALF || 3.0);   // perpendicular half-window, viewBox units
const TANG = Number(process.env.TANG || 1.0);   // tangential average half-window
const TROUGH = Number(process.env.TROUGH || 1.0); // trough search half-window (a bound)
const STEP = 0.25;

const FITS = JSON.parse(readFileSync('coloringbook/judge/_jq7fit.json'));
const DISC = {
  'quarter-obv-1932ngc.jpg': FITS['quarter-obv-1932ngc.jpg'],
  'quarter-obv-2.jpg': { cx: 374.41, cy: 374.36, R: 373.67 },   // frozen, _r3d13.mjs
  'quarter-obv-4.jpg': FITS['quarter-obv-4.jpg'],
};
const REFS = Object.keys(DISC);
const mapFor = (D) => ({ pxPerUnit: D.R / 47, toPx: (x, y) => ({ px: D.cx + (D.R * (x - 50)) / 47, py: D.cy + (D.R * (y - 50)) / 47 }) });

const mod = await import('../../src/art/coins.js');
const svg = mod.coinSVG('quarter', 84, { side: 'obverse' });
const isBlankOrField = (m) => m.el === 'circle'
  && Math.abs(m.bbox.x0 + m.bbox.x1 - 100) < 1e-6 && (m.bbox.x1 - m.bbox.x0) / 2 > 35;
const isSpecular = (m) => m.stroke === '#ffffff' && Math.abs(m.opacity - 0.26) < 1e-6;
const plen = (P) => { let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y); return L; };
const all = marks(svg).slice(1).filter((m) => !isBlankOrField(m) && !isSpecular(m));
// the HEAD region, used as the mask: the largest filled region on the face
const head = all.filter((m) => !m.isStroke).sort((a, b) => plen(b.pts) - plen(a.pts))[0].pts;
const subjects = all.filter((m) => m.isStroke).sort((a, b) => plen(b.pts) - plen(a.pts))
  .map((m, i) => ({ rank: i + 1, m, dark: m.stroke !== '#cfd5da', sw: m.sw,
    d: (m.tag.match(/\sd="([^"]*)"/) || [, ''])[1].replace(/\s+/g, ' ') }));

const ONLY = process.env.RANKS ? process.env.RANKS.split(',').map(Number) : null;
const use = ONLY ? subjects.filter((s) => ONLY.includes(s.rank)) : subjects;

console.log(`### _jq7w — width of the dark run under each drawn mark, viewBox units`);
console.log(`### instrument: _jw4width.mjs runAt(), imported unchanged. HALF ${HALF}, TANG ${TANG}, trough search +-${TROUGH} (BOUND if reached)`);

if (process.env.SELFTEST) {
  const D = DISC['quarter-obv-1932ngc.jpg'], M = mapFor(D);
  console.log(`\n# RESPONSE TEST — synthetic bands at the 1932ngc registration (${M.pxPerUnit.toFixed(2)} px/unit)`);
  console.log('rank  true 0.60   true 1.20   true 2.40   (recovered at 15% / 50% / 85% of length)');
  for (const s of use) {
    const P = walk(s.m.pts, STEP);
    const cells = [];
    for (const W of [0.6, 1.2, 2.4]) {
      const pts = s.m.pts.map((p) => M.toPx(p.x, p.y));
      const im = `<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="2000">`
        + `<rect width="2000" height="2000" fill="#c8c8c8"/>`
        + `<polyline points="${pts.map((q) => `${q.px.toFixed(2)},${q.py.toFixed(2)}`).join(' ')}" fill="none" stroke="${s.dark ? '#303030' : '#f0f0f0'}" stroke-width="${(W * M.pxPerUnit).toFixed(2)}"/></svg>`;
      const buf = await sharp(Buffer.from(im)).png().toBuffer();
      const g = await greyImg(buf);
      // a LIT mark is a bright run; invert so the same trough finder measures it
      if (!s.dark) for (let i = 0; i < g.d.length; i++) g.d[i] = 255 - g.d[i];
      const r = [0.15, 0.5, 0.85].map((f) => runAt(g, M, P, Math.round(f * (P.length - 1)), HALF, TANG, null, TROUGH));
      cells.push(r.map((x) => x.width.toFixed(2)).join('/') + (r.some((x) => x.bound) ? '!' : ' '));
    }
    console.log(`${String(s.rank).padStart(4)}  ${cells.join('  ')}   ${s.d.slice(0, 40)}`);
  }
  process.exit(0);
}

const med = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
const q = (a, p) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * p))]; };
const f2 = (v) => (v === null || Number.isNaN(v) ? '  -  ' : v.toFixed(2).padStart(5));

const G = {};
for (const f of REFS) G[f] = await greyImg(`coloringbook/ref/${f}`);

console.log('\nrank  ref                       n/N  width 1st  2nd  3rd    depth 1/2/3 (grey)   offset 1/2/3   bound');
const POOL = {};
for (const s of use) {
  const P = walk(s.m.pts, STEP);
  POOL[s.rank] = [[], [], []];
  for (const f of REFS) {
    const M = mapFor(DISC[f]);
    const g = { d: Uint8Array.from(G[f].d), w: G[f].w, h: G[f].h };
    if (!s.dark) for (let i = 0; i < g.d.length; i++) g.d[i] = 255 - g.d[i];
    const th = [[], [], []], dp = [[], [], []], of = [[], [], []];
    let bound = 0, n = 0;
    for (let i = 0; i < P.length; i++) {
      const r = runAt(g, M, P, i, HALF, TANG, head, TROUGH);
      if (Number.isNaN(r.width)) continue;
      if (r.bound) { bound++; continue; }          // §4.1: a bound is not a value
      const k = Math.min(2, Math.floor((i / (P.length - 1)) * 3));
      th[k].push(r.width); dp[k].push(r.depth); of[k].push(r.off); n++;
      POOL[s.rank][k].push(r.width);
    }
    console.log(`${String(s.rank).padStart(4)}  ${f.padEnd(24)} ${String(n).padStart(2)}/${String(P.length).padStart(2)}  ${th.map((t) => f2(med(t))).join(' ')}    ${dp.map((t) => (med(t) === null ? '  -' : med(t).toFixed(0).padStart(3))).join('/')}            ${of.map((t) => f2(med(t))).join(' ')}   ${bound}`);
  }
  console.log(`      ${s.d.slice(0, 96)}   [drawn sw ${s.sw}, ${s.dark ? 'cut' : 'lit'}]`);
}

console.log('\n### POOLED over the three references — the between-reference spread as an IQR.');
console.log('### A taper is SUPPORTED only when |median(1st) - median(3rd)| exceeds the wider of the two IQRs.');
console.log('rank   n1  n2  n3   1st q25-med-q75      2nd                  3rd                  supported?');
for (const s of use) {
  const T = POOL[s.rank];
  const cell = (a) => (a.length ? `${q(a, 0.25).toFixed(2)}-${q(a, 0.5).toFixed(2)}-${q(a, 0.75).toFixed(2)}` : '   -    ');
  const m1 = q(T[0], 0.5), m3 = q(T[2], 0.5);
  const iqr = (a) => (a.length ? q(a, 0.75) - q(a, 0.25) : Infinity);
  const sep = m1 !== null && m3 !== null && Math.abs(m1 - m3) > Math.max(iqr(T[0]), iqr(T[2]));
  console.log(`${String(s.rank).padStart(4)}  ${T.map((a) => String(a.length).padStart(3)).join(' ')}   ${cell(T[0]).padEnd(20)} ${cell(T[1]).padEnd(20)} ${cell(T[2]).padEnd(20)} ${sep ? 'YES ' + (m1 > m3 ? 'thins' : 'widens') : 'no'}`);
}
