// ROUND 4 — D5-BAND, MEASURED THE WAY THE PICTURE SAYS IT SHOULD BE.
//
// The picture is `_jq44unwrap-*.png` and the crops in the run document: in the
// polar unwrap the legend is unmistakable, and the number below must agree
// with it or the number is wrong. Round 0, 1 and 2 each published a band
// finder that agreed with nothing (bust edge, bust edge, E PLURIBUS UNUM).
//
// METRIC. In the angular span of UNITED STATES OF AMERICA only, the mean
// |d grey / d angle| per radius — the letters are the only thing in that
// sector that varies with angle, because the field either side of them is
// bare. The band edges are where that profile crosses 50% of its own peak.
//
// LOCUS (frozen before measuring, and a property of the PHOTOGRAPH, §6.1):
//   sector  195..345 deg  (atan2(v,u), v down; 270 = twelve o'clock). Chosen
//           because E PLURIBUS UNUM lives at 250..290 INBOARD of r 37, and the
//           eagle's wingtips reach r 38 at 200 and 340 — so this is the widest
//           span in which the outer legend is the only feature above r 36.
//   window  r/R 0.72 .. 0.99   (viewBox 33.8 .. 46.5)   §4.1 search bounds
//
// §4.1: window printed; an edge at a bound is a failure report.
// §4.2: the profile is printed in full, every radius, so the reader sees the
//       whole candidate set rather than the chosen crossing.
// §4.3: the located band is drawn back onto the polar unwrap in
//       `_jq45band-<ref>.png`, which is the SAME picture the number came from.
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
const D4 = JSON.parse(readFileSync(new URL('./_jq4discs.json', import.meta.url)));
export const SECTOR = [195, 345];
export const W0 = 0.72, W1 = 0.99;

export async function hfProfile(file, sector = SECTOR) {
  const d = D4[file];
  const { data, info } = await sharp(P(file)).flatten({ background: '#808080' })
    .greyscale().raw().toBuffer({ resolveWithObject: true });
  const IW = info.width, IH = info.height;
  const at = (x, y) => {
    if (x < 0 || y < 0 || x >= IW - 1 || y >= IH - 1) return NaN;
    const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0;
    return data[y0 * IW + x0] * (1 - fx) * (1 - fy) + data[y0 * IW + x0 + 1] * fx * (1 - fy)
      + data[(y0 + 1) * IW + x0] * (1 - fx) * fy + data[(y0 + 1) * IW + x0 + 1] * fx * fy;
  };
  const out = [];
  const NA = 1800;
  for (let r = W0; r <= W1 + 1e-9; r += 0.002) {
    let s = 0, n = 0, prev = NaN;
    for (let k = 0; k <= NA; k++) {
      const a = sector[0] + (sector[1] - sector[0]) * k / NA, th = a * Math.PI / 180;
      const v = at(d.cx + r * d.R * Math.cos(th), d.cy + r * d.R * Math.sin(th));
      if (Number.isFinite(prev) && Number.isFinite(v)) { s += Math.abs(v - prev); n++; }
      prev = v;
    }
    out.push({ r: +r.toFixed(3), vb: +(47 * r).toFixed(2), hf: n ? s / n : NaN });
  }
  return out;
}

export function edges(prof, frac = 0.5) {
  const peak = Math.max(...prof.map((p) => p.hf));
  const pi = prof.findIndex((p) => p.hf === peak);
  const th = frac * peak;
  let i = pi; while (i > 0 && prof[i - 1].hf >= th) i--;
  let j = pi; while (j < prof.length - 1 && prof[j + 1].hf >= th) j++;
  return { peak, peakAt: prof[pi].vb, inner: prof[i].vb, outer: prof[j].vb,
    atBound: i === 0 || j === prof.length - 1 };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const refs = process.argv.slice(2).length ? process.argv.slice(2)
    : ['quarter-rev-2.png', 'quarter-rev-3.jpg', 'qp1963-rev-pad.png', 'qp1964-rev-pad.png'];
  console.log(`sector ${SECTOR[0]}..${SECTOR[1]} deg;  §4.1 window r/R ${W0}..${W1} = viewBox ${(47 * W0).toFixed(1)}..${(47 * W1).toFixed(1)}\n`);
  const R = {};
  for (const f of refs) {
    const prof = await hfProfile(f);
    const e = edges(prof);
    R[f] = e;
    console.log(`${f}   disc R ${D4[f].R} (fit p95 ${D4[f].p95pc}% of R)`);
    console.log(`  band  viewBox ${e.inner.toFixed(2)} .. ${e.outer.toFixed(2)}   peak at ${e.peakAt.toFixed(2)}   height ${(e.outer - e.inner).toFixed(2)}` +
      (e.atBound ? '   <-- AT A WINDOW BOUND (§4.1), NOT A VALUE' : ''));
    console.log('  profile (viewBox : HF, every 0.5 unit):');
    const row = prof.filter((p, i) => i % 5 === 0).map((p) => `${p.vb.toFixed(1)}:${p.hf.toFixed(2)}`);
    for (let i = 0; i < row.length; i += 12) console.log('    ' + row.slice(i, i + 12).join('  '));
    console.log('');
  }
  const ks = Object.keys(R);
  console.log('cross-reference spread (viewBox units):');
  console.log(`  inner: ${ks.map((k) => R[k].inner.toFixed(2)).join(' / ')}   spread ${(Math.max(...ks.map((k) => R[k].inner)) - Math.min(...ks.map((k) => R[k].inner))).toFixed(2)}`);
  console.log(`  outer: ${ks.map((k) => R[k].outer.toFixed(2)).join(' / ')}   spread ${(Math.max(...ks.map((k) => R[k].outer)) - Math.min(...ks.map((k) => R[k].outer))).toFixed(2)}`);
  const mi = ks.reduce((s, k) => s + R[k].inner, 0) / ks.length;
  const mo = ks.reduce((s, k) => s + R[k].outer, 0) / ks.length;
  console.log(`  MEAN band: inner ${mi.toFixed(2)}  outer ${mo.toFixed(2)}  mid ${((mi + mo) / 2).toFixed(2)}  height ${(mo - mi).toFixed(2)}`);
}
