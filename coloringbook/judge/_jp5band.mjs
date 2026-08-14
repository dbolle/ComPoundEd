// PENNY ROUND 0, TASK 4 — READ THE CENT'S OWN RADII OFF THE UNWRAP.
//
// Three quantities, none of which has ever been measured on this coin:
//
//   RIM SEAT   the radius at which the field ends and the raised rim begins.
//              `EDGE.penny.field.full = 41.0` claims to be this number, and
//              that literal is shared by all four coins and was measured on
//              none of them. On a struck coin the rim's inner wall throws a
//              dark line in the unwrap with the bright rim crown just outside
//              it, so the seat is the radius of the strongest OUTWARD-BRIGHT
//              step in the outer third of the disc.
//   LEGEND     cap-top and baseline radius per legend, from the radial extent
//              of letter ink over the legend's own angular sector.
//   SPAN       the angular extent of that ink.
//
// §4.3 / Appendix S2: the unwrap IS the picture, and every number this file
// prints is DRAWN BACK ON IT (`_jp5band-<ref>.png`) so the reading can be
// checked by eye against the thing it was read from. Four band finders in four
// rounds returned confident answers to the wrong question; each was caught
// exactly this way.
//
// §4.1: every search prints its window, and a result at a window end is
// reported as a failure, not as a value.
// §4.2: the rim-seat candidate set is printed in full — every local maximum of
// the step function, not only the chosen one — and the run says so when the
// runner-up is within 20% of the winner.
//
// Run: node coloringbook/judge/_jp5band.mjs [ref ...]
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { unwrap } from './_jp4unwrap.mjs';

const D = JSON.parse(readFileSync(new URL('./_jp1discs.json', import.meta.url)));

// search windows, frozen literals (§4.1)
const RIM_LO = 40.0, RIM_HI = 46.5;      // viewBox units
const LEG_LO = 30.0, LEG_HI = 45.0;

// sectors, in unwrap angle (deg, 270 = twelve o'clock, angle increases clockwise
// in image space because v points down). Frozen literals, chosen from the
// PICTURE, never from our drawing.
export const SECTORS = {
  'penny-rev-2.png': {
    top: { name: 'UNITED STATES OF AMERICA', a: [186, 354] },
    bottom: { name: 'ONE CENT', a: [22, 158] },
    bare: { name: 'bare field for the rim read', a: [0, 360] },
  },
  'penny-rev.jpg': {
    top: { name: 'UNITED STATES OF AMERICA', a: [186, 354] },
    bottom: { name: 'ONE CENT', a: [22, 158] },
    bare: { name: 'bare field for the rim read', a: [0, 360] },
  },
  'penny-obv-3.jpg': {
    top: { name: 'IN GOD WE TRUST', a: [200, 340] },
    bare: { name: 'bare field for the rim read', a: [0, 360] },
  },
  'penny-obv.jpg': {
    top: { name: 'IN GOD WE TRUST', a: [200, 340] },
    bare: { name: 'bare field for the rim read', a: [0, 360] },
  },
  'penny-obv-2.jpg': {
    top: { name: 'IN GOD WE TRUST', a: [200, 340] },
    bare: { name: 'bare field for the rim read', a: [0, 360] },
  },
};

const inSect = (a, [lo, hi]) => (lo <= hi ? a >= lo && a <= hi : a >= lo || a <= hi);

// radius (viewBox units) of unwrap row j
const rowR = (u, j) => (u.RB - (u.RB - u.RA) * j / (u.H - 1)) * 47;

// mean grey at each row over a sector
function radial(u, sect) {
  const out = [];
  for (let j = 0; j < u.H; j++) {
    let s = 0, n = 0;
    for (let i = 0; i < u.W; i++) {
      const a = 360 * i / u.W;
      if (!inSect(a, sect)) continue;
      s += u.buf[j * u.W + i]; n++;
    }
    out.push([rowR(u, j), s / n]);
  }
  return out;   // descending radius
}

// RIM SEAT. The rim crown is BRIGHT and the field just inside it is not, with
// the wall's shadow between. So walk outward and score each radius by
// (mean over r..r+1.2) - (mean over r-1.2..r): the seat is where that step is
// most positive. Every local maximum is printed (§4.2).
function rimSeat(prof) {
  const R = prof.map((p) => p[0]), V = prof.map((p) => p[1]);
  const meanIn = (a, b) => { let s = 0, n = 0; for (let i = 0; i < R.length; i++) if (R[i] >= a && R[i] <= b) { s += V[i]; n++; } return n ? s / n : NaN; };
  const cands = [];
  for (let r = RIM_LO; r <= RIM_HI; r += 0.05) {
    const step = meanIn(r, r + 1.2) - meanIn(r - 1.2, r);
    if (Number.isFinite(step)) cands.push([+r.toFixed(2), step]);
  }
  const peaks = [];
  for (let i = 1; i < cands.length - 1; i++)
    if (cands[i][1] >= cands[i - 1][1] && cands[i][1] > cands[i + 1][1] && cands[i][1] > 0) peaks.push(cands[i]);
  peaks.sort((a, b) => b[1] - a[1]);
  return { peaks, cands };
}

// LEGEND ink extent. Field level = median of the sector's rows in 30..34
// (inboard of every legend on this coin, outboard of the device on the reverse
// — read off the unwrap). Ink = darker than field - 0.45*(field - min).
function legendExtent(u, sect) {
  const prof = radial(u, sect);
  const inner = prof.filter(([r]) => r >= 30 && r <= 34).map((p) => p[1]).sort((a, b) => a - b);
  const field = inner[inner.length >> 1];
  // per-row ink fraction over the sector
  const rows = [];
  for (let j = 0; j < u.H; j++) {
    const r = rowR(u, j); if (r < LEG_LO || r > LEG_HI) continue;
    let dark = 0, n = 0, mn = 255;
    for (let i = 0; i < u.W; i++) {
      const a = 360 * i / u.W; if (!inSect(a, sect)) continue;
      const v = u.buf[j * u.W + i]; n++; if (v < mn) mn = v;
      if (v < field - 45) dark++;
    }
    rows.push([r, dark / n]);
  }
  const T = 0.12;   // a row is "letters" when >=12% of the sector is ink
  const hit = rows.filter(([, f]) => f >= T).map(([r]) => r);
  if (!hit.length) return { field, capTop: null, baseline: null, atBound: false, rows };
  const capTop = Math.max(...hit), baseline = Math.min(...hit);
  return { field, capTop, baseline, cap: capTop - baseline,
    atBound: capTop >= LEG_HI - 0.05 || baseline <= LEG_LO + 0.05, rows };
}

// SPAN: angular extent of ink within the measured band.
function legendSpan(u, sect, capTop, baseline, field) {
  const cols = [];
  for (let i = 0; i < u.W; i++) {
    const a = 360 * i / u.W; if (!inSect(a, sect)) continue;
    let dark = 0, n = 0;
    for (let j = 0; j < u.H; j++) {
      const r = rowR(u, j); if (r < baseline || r > capTop) continue;
      n++; if (u.buf[j * u.W + i] < field - 45) dark++;
    }
    if (n) cols.push([a, dark / n]);
  }
  const on = cols.filter(([, f]) => f >= 0.10).map(([a]) => a);
  if (!on.length) return null;
  return { lo: Math.min(...on), hi: Math.max(...on), span: Math.max(...on) - Math.min(...on) };
}

// R4 (adopted): a module whose report runs at TOP LEVEL prints its own verdicts
// into any live instrument that imports it — `_jq5letter.mjs` did exactly this
// with the retired containment v1. `_jp5band-v2.mjs` imports SECTORS from here,
// so the report is behind a main guard. (Caught in my own tooling, this round.)
const MAIN = import.meta.url === `file://${process.argv[1]}`;
const refs = MAIN ? (process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SECTORS)) : [];
const results = {};
for (const f of refs) {
  if (!D[f] || !D[f].R) { console.log(`${f}: no frozen disc — skipped`); continue; }
  const u = await unwrap(f);
  const S = SECTORS[f]; if (!S) { console.log(`${f}: no declared sector set`); continue; }
  console.log(`\n=== ${f}   disc ${JSON.stringify(D[f])} ===`);

  const bare = radial(u, S.bare.a);
  const { peaks } = rimSeat(bare);
  console.log(`RIM SEAT search window ${RIM_LO}..${RIM_HI} viewBox units (§4.1)`);
  console.log('  candidate set (every local max of the outward-bright step, §4.2):');
  for (const [r, s] of peaks.slice(0, 8)) console.log(`     r ${r.toFixed(2)}   step ${s.toFixed(1)} grey`);
  const seat = peaks.length ? peaks[0][0] : null;
  const amb = peaks.length > 1 && peaks[1][1] > 0.8 * peaks[0][1];
  if (seat !== null && (seat <= RIM_LO + 0.1 || seat >= RIM_HI - 0.1))
    console.log(`  !! rim seat ${seat} is AT a search bound — this is a failure report, not a value (§4.1)`);
  console.log(`  RIM SEAT = ${seat}${amb ? '   << AMBIGUOUS: runner-up within 20% — reporting, not choosing' : ''}`);

  const legs = {};
  for (const [k, sp] of Object.entries(S)) {
    if (k === 'bare') continue;
    const e = legendExtent(u, sp.a);
    if (!e.capTop) { console.log(`  ${sp.name}: NO INK ROWS in ${LEG_LO}..${LEG_HI} — failure report`); continue; }
    const sn = legendSpan(u, sp.a, e.capTop, e.baseline, e.field);
    legs[k] = { name: sp.name, sector: sp.a, field: +e.field.toFixed(1),
      capTop: +e.capTop.toFixed(2), baseline: +e.baseline.toFixed(2), cap: +e.cap.toFixed(2),
      span: sn ? +sn.span.toFixed(1) : null, spanFrom: sn ? [+sn.lo.toFixed(1), +sn.hi.toFixed(1)] : null,
      atBound: e.atBound };
    console.log(`  ${sp.name.padEnd(26)} sector ${JSON.stringify(sp.a)}  field grey ${e.field.toFixed(0)}`);
    console.log(`     cap top r ${e.capTop.toFixed(2)}   baseline r ${e.baseline.toFixed(2)}   CAP HEIGHT ${e.cap.toFixed(2)}   span ${sn ? sn.span.toFixed(1) + ' deg' : '-'}`
      + (e.atBound ? '   !! AT the search window bound — failure report (§4.1)' : ''));
  }
  results[f] = { disc: D[f], rimSeat: seat, rimAmbiguous: amb, legends: legs };

  // §4.3 — draw what was found back on the picture it was read from.
  const { buf, W, H } = u;
  const y = (vbu) => (u.RB - vbu / 47) / (u.RB - u.RA) * (H - 1);
  let g = '';
  for (let vbu = 30; vbu <= 49; vbu++) {
    g += `<path d="M0 ${y(vbu).toFixed(1)}H${W}" stroke="${vbu % 5 === 0 ? '#ff2d55' : '#00e5ff'}" stroke-width="${vbu % 5 === 0 ? 1.2 : 0.6}" opacity="0.45"/>`
      + `<text x="3" y="${(y(vbu) - 2).toFixed(1)}" font-family="monospace" font-size="13" fill="#ffe600">${vbu}</text>`;
  }
  if (seat) g += `<path d="M0 ${y(seat).toFixed(1)}H${W}" stroke="#00ff00" stroke-width="2.4"/>`
    + `<text x="${W / 2}" y="${(y(seat) - 4).toFixed(1)}" font-family="monospace" font-size="18" fill="#00ff00">RIM SEAT ${seat}</text>`;
  g += `<path d="M0 ${y(41.0).toFixed(1)}H${W}" stroke="#ff8000" stroke-width="2" stroke-dasharray="10 8"/>`
    + `<text x="20" y="${(y(41.0) - 4).toFixed(1)}" font-family="monospace" font-size="17" fill="#ff8000">EDGE.field.full = 41.0 (what we draw)</text>`;
  for (const L of Object.values(legs)) {
    const x0 = W * L.spanFrom[0] / 360, x1 = W * L.spanFrom[1] / 360;
    g += `<rect x="${x0}" y="${y(L.capTop)}" width="${x1 - x0}" height="${y(L.baseline) - y(L.capTop)}" fill="none" stroke="#ff00ff" stroke-width="2"/>`
      + `<text x="${x0 + 6}" y="${y(L.capTop) - 4}" font-family="monospace" font-size="16" fill="#ff00ff">${L.name}  base ${L.baseline}  cap ${L.cap}  span ${L.span}</text>`;
  }
  const grey = await sharp(buf, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
  const rgb = await sharp(grey).toColourspace('srgb').png().toBuffer();
  const out = new URL(`./_jp5band-${f.replace(/\..*/, '')}.png`, import.meta.url).pathname;
  await sharp(rgb).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${g}</svg>`) }]).toFile(out);
  console.log(`  §4.3 overlay -> ${out}`);
}

if (MAIN) { console.log('\n=== summary ===');
  console.log(JSON.stringify(results, null, 1)); }
