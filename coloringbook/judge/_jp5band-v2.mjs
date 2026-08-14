// PENNY ROUND 0, TASK 4b — the legend half of `_jp5band.mjs`, redone.
//
// WHY THERE IS A v2. `_jp5band.mjs`'s legend extent thresholds absolute grey
// ("ink is 45 levels below the sector's inner-field median"). On this coin that
// also selects the coin's dark outer edge at r 46 and the memorial's own relief
// at r 30, so it returned cap heights of 14–15 viewBox units with the baseline
// sitting exactly on the search bound. It **reported itself as a failure**
// (`atBound: true`, §4.1) rather than publishing the number, which is the null
// test doing its job — so v1 is not retired, its legend half is superseded and
// its rim half stands.
//
// v2 measures what actually distinguishes lettering from everything else at a
// constant radius: LOCAL ANGULAR VARIANCE. For each radius row, subtract a
// boxcar-smoothed copy of the row (±12°) and take the RMS of the residual.
// A smooth ring — the coin's edge, the rim crown, the field — has residual
// near zero at every level of brightness. Letters have a residual at the pitch
// of the letters. §16.2 is the same idea; the difference is that this reads it
// off the unwrap, where the answer is also VISIBLE, so the detector has a
// control it must agree with (Appendix S2).
//
// §4.1 the window is printed and a band edge at the window end is a failure
// report. §4.2 the whole per-row profile is printed, not just the chosen edges.
// §4.3 the band found is drawn back on the unwrap.
//
// Run: node coloringbook/judge/_jp5band-v2.mjs [ref ...]
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { unwrap } from './_jp4unwrap.mjs';
import { SECTORS } from './_jp5band.mjs';

const D = JSON.parse(readFileSync(new URL('./_jp1discs.json', import.meta.url)));
const LO = 31.0, HI = 45.5;            // frozen search window, viewBox units
const SMOOTH_DEG = 12;                 // boxcar half-width for the trend removal
const ON = 0.35;                       // a row is "letters" at >= 0.35 of the row peak

const inSect = (a, [lo, hi]) => (lo <= hi ? a >= lo && a <= hi : a >= lo || a <= hi);
const rowR = (u, j) => (u.RB - (u.RB - u.RA) * j / (u.H - 1)) * 47;

export function hfProfile(u, sect) {
  const half = Math.round(SMOOTH_DEG / 360 * u.W);
  const out = [];
  for (let j = 0; j < u.H; j++) {
    const r = rowR(u, j); if (r < LO || r > HI) continue;
    const idx = [];
    for (let i = 0; i < u.W; i++) if (inSect(360 * i / u.W, sect)) idx.push(i);
    const v = idx.map((i) => u.buf[j * u.W + i]);
    // boxcar trend over the sector (reflect at the ends)
    const n = v.length; let s = 0; const pre = [0];
    for (let k = 0; k < n; k++) { s += v[k]; pre.push(s); }
    let acc = 0;
    for (let k = 0; k < n; k++) {
      const a = Math.max(0, k - half), b = Math.min(n, k + half + 1);
      const t = (pre[b] - pre[a]) / (b - a);
      acc += (v[k] - t) ** 2;
    }
    out.push([+r.toFixed(2), Math.sqrt(acc / n)]);
  }
  return out;
}

const refs = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SECTORS);
const RES = {};
for (const f of refs) {
  if (!D[f] || !D[f].R) { console.log(`${f}: no frozen disc — skipped`); continue; }
  const S = SECTORS[f]; if (!S) continue;
  const u = await unwrap(f);
  console.log(`\n=== ${f} — LOCAL ANGULAR VARIANCE by radius, window ${LO}..${HI} (§4.1) ===`);
  const legs = {};
  for (const [k, sp] of Object.entries(S)) {
    if (k === 'bare') continue;
    const pr = hfProfile(u, sp.a);
    const peak = Math.max(...pr.map((p) => p[1]));
    const peakR = pr.find((p) => p[1] === peak)[0];
    const hit = pr.filter((p) => p[1] >= ON * peak).map((p) => p[0]);
    const capTop = Math.max(...hit), baseline = Math.min(...hit);
    const atBound = capTop >= HI - 0.1 || baseline <= LO + 0.1;
    console.log(`\n  ${sp.name}  sector ${JSON.stringify(sp.a)}   peak RMS ${peak.toFixed(1)} at r ${peakR}`);
    console.log('  r:RMS  ' + pr.filter((_, i) => i % 6 === 0).map(([r, v]) => `${r}:${v.toFixed(0)}`).join(' '));
    console.log(`  band at ${ON} of peak:  baseline r ${baseline.toFixed(2)}   cap top r ${capTop.toFixed(2)}   CAP ${(capTop - baseline).toFixed(2)}`
      + (atBound ? '   !! AT a window bound — failure report (§4.1)' : ''));
    // angular span within the band
    const cols = [];
    for (let i = 0; i < u.W; i++) {
      const a = 360 * i / u.W; if (!inSect(a, sp.a)) continue;
      let mn = 255, mx = 0;
      for (let j = 0; j < u.H; j++) { const r = rowR(u, j); if (r < baseline || r > capTop) continue;
        const v = u.buf[j * u.W + i]; if (v < mn) mn = v; if (v > mx) mx = v; }
      cols.push([a, mx - mn]);
    }
    const cpk = Math.max(...cols.map((c) => c[1]));
    const on = cols.filter((c) => c[1] >= 0.45 * cpk).map((c) => c[0]);
    const span = on.length ? Math.max(...on) - Math.min(...on) : null;
    console.log(`  angular span (columns at >=0.45 of the peak column contrast): ${span === null ? '-' : span.toFixed(1) + ' deg'}  from ${on.length ? Math.min(...on).toFixed(1) + ' to ' + Math.max(...on).toFixed(1) : '-'}`);
    legs[k] = { name: sp.name, sector: sp.a, baseline: +baseline.toFixed(2), capTop: +capTop.toFixed(2),
      cap: +(capTop - baseline).toFixed(2), span: span === null ? null : +span.toFixed(1),
      spanFrom: on.length ? [+Math.min(...on).toFixed(1), +Math.max(...on).toFixed(1)] : null, atBound };
  }
  RES[f] = { disc: D[f], legends: legs };

  // §4.3 — draw it back on the picture
  const { buf, W, H } = u;
  const y = (vbu) => (u.RB - vbu / 47) / (u.RB - u.RA) * (H - 1);
  let g = '';
  for (let vbu = 30; vbu <= 49; vbu++)
    g += `<path d="M0 ${y(vbu).toFixed(1)}H${W}" stroke="${vbu % 5 === 0 ? '#ff2d55' : '#00e5ff'}" stroke-width="${vbu % 5 === 0 ? 1.2 : 0.6}" opacity="0.4"/>`
      + `<text x="3" y="${(y(vbu) - 2).toFixed(1)}" font-family="monospace" font-size="13" fill="#ffe600">${vbu}</text>`;
  g += `<path d="M0 ${y(41.0).toFixed(1)}H${W}" stroke="#ff8000" stroke-width="2" stroke-dasharray="10 8"/>`
    + `<text x="20" y="${(y(41.0) - 4).toFixed(1)}" font-family="monospace" font-size="17" fill="#ff8000">EDGE.field.full = 41.0</text>`;
  for (const L of Object.values(legs)) {
    if (!L.spanFrom) continue;
    const x0 = W * L.spanFrom[0] / 360, x1 = W * L.spanFrom[1] / 360;
    g += `<rect x="${x0}" y="${y(L.capTop)}" width="${x1 - x0}" height="${y(L.baseline) - y(L.capTop)}" fill="none" stroke="#ff00ff" stroke-width="2.5"/>`
      + `<text x="${x0 + 6}" y="${y(L.capTop) - 5}" font-family="monospace" font-size="17" fill="#ff00ff">${L.name}  base ${L.baseline}  capTop ${L.capTop}  cap ${L.cap}  span ${L.span}</text>`;
  }
  const grey = await sharp(buf, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
  const rgb = await sharp(grey).toColourspace('srgb').png().toBuffer();
  const out = new URL(`./_jp5bandv2-${f.replace(/\..*/, '')}.png`, import.meta.url).pathname;
  await sharp(rgb).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${g}</svg>`) }]).toFile(out);
  console.log(`  §4.3 overlay -> ${out}`);
}
console.log('\n=== summary ===\n' + JSON.stringify(RES, null, 1));
