// ROUND 4, TASK 4 — D5-BAND on the reverse, and the RE-DERIVED HF LOCUS.
//
// Round 2 ruled D5-band-reverse BLOCKED "by the design": the sigma-plateau
// method needs a low inner shoulder, and on a CIRCULATION strike the eagle's
// wings raise sigma continuously from r 28 to r 43 so no shoulder exists.
// That is a statement about a metric and a strike, not about the design. On a
// CAMEO PROOF the legend is frosted (bright) and the field it sits in is a
// black mirror, so the band is visible as a BRIGHT-FRACTION bump with a dark
// gap on both sides — a shoulder the strike itself supplies.
//
// METRIC. Over 1440 angles per radius, the fraction of samples with
// grey >= Tv, where Tv is the histogram valley floor of that photograph
// (`_jq43seg.valleyFloor`) — i.e. the level that separates frost from mirror.
// Reported per sector: TOP 250..290 deg (UNITED STATES OF AMERICA), BOTTOM
// 70..110 deg (QUARTER DOLLAR), angle measured as atan2(v, u) with v down, so
// 270 deg is twelve o'clock.
//
// §4.1 null test: the radial search runs r/R = 0.50 .. 1.00 and the bounds are
// printed; an edge at a bound is a failure report. §4.3: `_jq44band-*.png`
// draws the located band on the source at full resolution and the judge looks
// at it before any number is frozen. That is the check that caught the bust
// edge twice, E PLURIBUS UNUM once, and the wreath once.
//
// §6.1: the number this file exists to produce is a LOCUS — the radius at
// which D5's HF ratio is evaluated. It is derived from the PHOTOGRAPH's band
// and stated as a literal in viewBox units. It may never again be computed
// from our own glyph geometry, which is what made the published obverse 1.51x
// really 2.0089x.
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { gridOf, inField, valleyFloor, NG, SPANG } from './_jq43seg.mjs';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
const D4 = JSON.parse(readFileSync(new URL('./_jq4discs.json', import.meta.url)));
export const R0 = 0.50, R1 = 1.00, RSTEP = 0.002;   // §4.1 search bounds
const SECT = { top: [250, 290], bottom: [70, 110], all: [0, 360] };

// bilinear sample of the disc-normalised grid at (u,v)
function sampleUV(g, u, v) {
  const i = (u + SPANG) * (NG - 1) / (2 * SPANG), j = (v + SPANG) * (NG - 1) / (2 * SPANG);
  if (i < 0 || j < 0 || i >= NG - 1 || j >= NG - 1) return NaN;
  const i0 = i | 0, j0 = j | 0, fi = i - i0, fj = j - j0;
  return g[j0 * NG + i0] * (1 - fi) * (1 - fj) + g[j0 * NG + i0 + 1] * fi * (1 - fj)
    + g[(j0 + 1) * NG + i0] * (1 - fi) * fj + g[(j0 + 1) * NG + i0 + 1] * fi * fj;
}

export function profile(g, Tv, [a0, a1]) {
  const out = [];
  for (let r = R0; r <= R1 + 1e-9; r += RSTEP) {
    let lit = 0, n = 0, s = 0;
    for (let k = 0; k < 1440; k++) {
      const a = a0 + (a1 - a0) * k / 1440, th = a * Math.PI / 180;
      const val = sampleUV(g, r * Math.cos(th), r * Math.sin(th));
      if (!Number.isFinite(val)) continue;
      n++; s += val; if (val >= Tv) lit++;
    }
    out.push({ r: +r.toFixed(3), lit: n ? lit / n : NaN, mean: n ? s / n : NaN });
  }
  return out;
}

// The band: the run of radii, OUTSIDE the eagle, where lit fraction exceeds
// `thr`, bounded by a dark gap on its inner side. Found by walking INWARD from
// the rim so the eagle cannot be mistaken for the legend.
export function band(prof, thr = 0.18, rimGuard = 0.94) {
  const idx = prof.map((p, i) => i).filter((i) => prof[i].r <= rimGuard);
  // outer edge: outermost radius below rimGuard with lit >= thr
  let outI = -1;
  for (const i of idx) if (prof[i].lit >= thr) outI = i;
  if (outI < 0) return null;
  // inner edge: walk in until lit drops below thr and STAYS below for 0.02 R
  let inI = outI;
  for (let i = outI; i >= 0; i--) {
    if (prof[i].lit >= thr) { inI = i; continue; }
    let clear = true;
    for (let k = i; k > Math.max(0, i - Math.round(0.02 / RSTEP)); k--) if (prof[k].lit >= thr) clear = false;
    if (clear) break;
  }
  return { inner: prof[inI].r, outer: prof[outI].r,
    peak: Math.max(...prof.slice(inI, outI + 1).map((p) => p.lit)),
    gapMin: Math.min(...prof.slice(Math.max(0, inI - Math.round(0.05 / RSTEP)), inI + 1).map((p) => p.lit)) };
}

const vb = (r) => +(47 * r).toFixed(2);   // r/R -> viewBox units (blank r = 47)

if (import.meta.url === `file://${process.argv[1]}`) {
  const refs = process.argv.slice(2).length ? process.argv.slice(2)
    : ['qp1963-rev-pad.png', 'qp1964-rev-pad.png'];
  const fld = inField();
  console.log(`§4.1 search bounds: r/R ${R0} .. ${R1}, step ${RSTEP}. An edge AT a bound is a failure report.`);
  console.log('lit-fraction threshold 0.18, stated before measuring; rim guard r/R <= 0.94.\n');
  const res = {};
  for (const f of refs) {
    const g = await gridOf(f);
    const Tv = valleyFloor(g, fld).best.arg;
    console.log(`${f}   Tv = ${Tv}`);
    res[f] = { Tv, sect: {} };
    for (const [name, sc] of Object.entries(SECT)) {
      const pr = profile(g, Tv, sc);
      const b = band(pr);
      res[f].sect[name] = b;
      if (!b) { console.log(`  ${name.padEnd(7)} no band found`); continue; }
      const flag = (b.inner <= R0 + RSTEP || b.outer >= R1 - RSTEP) ? '   <-- AT A SEARCH BOUND (§4.1)' : '';
      console.log(`  ${name.padEnd(7)} band r/R ${b.inner.toFixed(3)} .. ${b.outer.toFixed(3)}` +
        `   = viewBox ${vb(b.inner).toFixed(2)} .. ${vb(b.outer).toFixed(2)}` +
        `   peak lit ${b.peak.toFixed(2)}  inner-gap min lit ${b.gapMin.toFixed(2)}${flag}`);
      // print the profile around the band so the reader can see the shoulders
      const near = pr.filter((p) => p.r >= b.inner - 0.06 && p.r <= b.outer + 0.04);
      console.log('     lit fraction: ' + near.filter((_, i) => i % 5 === 0)
        .map((p) => `${p.r.toFixed(2)}:${p.lit.toFixed(2)}`).join(' '));
    }
    // overlay
    const d = D4[f], md = await sharp(P(f)).metadata();
    const cir = (rr, col, w, dash = '') => `<circle cx="${d.cx}" cy="${d.cy}" r="${d.R * rr}" fill="none" stroke="${col}" stroke-width="${w}" ${dash}/>`;
    let s = cir(0.862, '#ffffff', 1.4, 'stroke-dasharray="7 7"');
    for (const [name, col] of [['top', '#00ff6a'], ['bottom', '#ff2d55']]) {
      const b = res[f].sect[name]; if (!b) continue;
      s += cir(b.inner, col, 2) + cir(b.outer, col, 2);
    }
    const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${md.width}" height="${md.height}">${s}</svg>`);
    const full = await sharp(P(f)).flatten({ background: '#808080' }).composite([{ input: svg }]).png().toBuffer();
    const out = new URL(`./_jq44band-${f.replace(/\..*/, '')}.png`, import.meta.url).pathname;
    await sharp(full).toFile(out);
    console.log(`  overlay: ${out}  (green = TOP band edges, red = BOTTOM band edges, dashed = field circle r 40.5)\n`);
  }
  const ks = Object.keys(res);
  if (ks.length === 2) {
    console.log('cross-reference agreement (viewBox units; round 2 asked for <= 1.0):');
    for (const name of ['top', 'bottom']) {
      const a = res[ks[0]].sect[name], b = res[ks[1]].sect[name];
      if (!a || !b) continue;
      console.log(`  ${name.padEnd(7)} inner ${vb(a.inner).toFixed(2)} vs ${vb(b.inner).toFixed(2)}  (d ${Math.abs(vb(a.inner) - vb(b.inner)).toFixed(2)})` +
        `   outer ${vb(a.outer).toFixed(2)} vs ${vb(b.outer).toFixed(2)}  (d ${Math.abs(vb(a.outer) - vb(b.outer)).toFixed(2)})`);
    }
    console.log('\nPROPOSED FROZEN BAND (mean of the two references, viewBox units):');
    for (const name of ['top', 'bottom']) {
      const a = res[ks[0]].sect[name], b = res[ks[1]].sect[name];
      if (!a || !b) continue;
      const inn = (vb(a.inner) + vb(b.inner)) / 2, out = (vb(a.outer) + vb(b.outer)) / 2;
      console.log(`  ${name.padEnd(7)} inner ${inn.toFixed(2)}  outer ${out.toFixed(2)}  mid ${((inn + out) / 2).toFixed(2)}  height ${(out - inn).toFixed(2)}`);
    }
  }
}
