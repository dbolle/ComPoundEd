// D5, THE BAND HALF, REVERSE — §16.2 / §22.8's radial sweep of ANGULAR sigma.
//
// Lettering is the only thing on a coin's outer field that is high-variance at
// constant radius, so the legend shows as a plateau of sigma between two low
// shoulders. §22.8 recorded the quarter reverse at "~ 35.7 .. 43.7" with a
// tilde; round 0's obverse band finder returned its own search bound; round 1's
// returned an interior value that was the BUST EDGE. So this one carries every
// guard the two failures bought:
//
//   §4.1  bounds printed; a result AT a bound is a failure report.
//   Q4    the degeneracy measure (plateau contrast = plateau sigma / shoulder
//         sigma) is printed whether or not it passes, and the answer is checked
//         against something INDEPENDENT — here, the SECOND reference. Two
//         photographs of two different coins by two different photographers
//         agreeing on a radius is evidence; one photograph is not.
//   §4.3  the located band is drawn on the source and looked at.
//   §4.2  the plateau is SELECTED from a candidate set of runs; the whole set
//         is printed and the instrument throws if the top two are within 10%.
import sharp from 'sharp';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
const dir = new URL('./', import.meta.url).pathname;

// SEARCH BOUNDS, declared before any value exists.
export const RLO = 0.60, RHI = 0.985, DR = 0.0025;   // in units of R
export const SECTORS = {
  top: [250, 290],        // straight up: UNITED STATES OF AMERICA / ...OF...
  bottom: [70, 110],      // straight down: QUARTER DOLLAR
};

// The raw angular sigma is dominated by LOW-frequency content — the toning
// sweep and the lighting falloff across the sector — which is not lettering.
// A legend is high-frequency angular structure at a fixed radius, so the
// statistic detrends along the arc first: subtract a moving mean whose window
// is wider than one glyph and narrower than the sector.
export function detrend(vals, win) {
  const n = vals.length, o = new Array(n);
  for (let i = 0; i < n; i++) {
    let s = 0, c = 0;
    for (let k = -win; k <= win; k++) { const j = i + k; if (j >= 0 && j < n) { s += vals[j]; c++; } }
    o[i] = vals[i] - s / c;
  }
  return o;
}

export async function sweep(file, D, sector, hf = false) {
  const { data, info } = await sharp(P(file)).flatten({ background: '#808080' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const out = [];
  for (let r = RLO; r <= RHI + 1e-9; r += DR) {
    const vals = [];
    const n = Math.max(200, Math.round(2 * Math.PI * r * D.R * (sector[1] - sector[0]) / 360));
    for (let k = 0; k < n; k++) {
      const th = (sector[0] + (sector[1] - sector[0]) * k / (n - 1)) * Math.PI / 180;
      const x = D.cx + r * D.R * Math.cos(th), y = D.cy + r * D.R * Math.sin(th);
      const x0 = x | 0, y0 = y | 0;
      if (x0 < 0 || y0 < 0 || x0 >= W - 1 || y0 >= H - 1) continue;
      const fx = x - x0, fy = y - y0;
      vals.push(data[y0 * W + x0] * (1 - fx) * (1 - fy) + data[y0 * W + x0 + 1] * fx * (1 - fy)
        + data[(y0 + 1) * W + x0] * (1 - fx) * fy + data[(y0 + 1) * W + x0 + 1] * fx * fy);
    }
    const m = vals.reduce((a, b) => a + b, 0) / vals.length;
    // detrend window = 0.05R of ARC LENGTH (~1.5 glyph widths on a 21-glyph
    // legend round the whole coin), converted to samples at this radius.
    const arc = 2 * Math.PI * r * D.R * (sector[1] - sector[0]) / 360;
    const win = Math.max(2, Math.round(0.05 * D.R * vals.length / arc));
    const use = hf ? detrend(vals, win) : vals;
    const mu = use.reduce((a, b) => a + b, 0) / use.length;
    const sd = Math.sqrt(use.reduce((a, b) => a + (b - mu) ** 2, 0) / use.length);
    out.push([+r.toFixed(4), sd, m]);
  }
  return out;
}

// §4.2 — enumerate EVERY run above the half-max level, print them all, and
// throw if the choice between the top two is not clear.
export function plateaus(prof) {
  const s = prof.map((p) => p[1]);
  const sorted = [...s].sort((a, b) => a - b);
  const med = sorted[sorted.length >> 1];
  const mx = Math.max(...s);
  const lvl = med + 0.5 * (mx - med);
  const runs = []; let i = 0;
  while (i < s.length) {
    if (s[i] < lvl) { i++; continue; }
    let j = i; while (j < s.length && s[j] >= lvl) j++;
    const seg = s.slice(i, j);
    runs.push({ r0: prof[i][0], r1: prof[j - 1][0], width: prof[j - 1][0] - prof[i][0],
      peak: Math.max(...seg), mean: seg.reduce((a, b) => a + b, 0) / seg.length, contrast: (seg.reduce((a, b) => a + b, 0) / seg.length) / med });
    i = j;
  }
  runs.sort((a, b) => b.width * b.mean - a.width * a.mean);
  return { runs, med, mx, lvl };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const REFS = [
    ['quarter-rev-3.jpg', { cx: 999.50, cy: 999.45, R: 999.49 }],
    ['quarter-rev-2.png', { cx: 374.50, cy: 374.37, R: 374.98 }],
  ];
  console.log(`SEARCH BOUNDS: r ${RLO} .. ${RHI} R, step ${DR}. A band edge AT ${RLO} or ${RHI} is a failure report (§4.1).`);
  console.log(`viewBox conversion: X = 47 * (r/R), i.e. r 0.85R = 39.95 viewBox units.\n`);
  const HF = process.argv[2] !== 'raw';
  console.log(HF ? 'STATISTIC: angular sigma AFTER detrending along the arc (high-frequency only).\n'
    : 'STATISTIC: raw angular sigma (§22.8 as written).\n');
  const found = {};
  for (const [name, sec] of Object.entries(SECTORS)) {
    console.log(`--- sector ${name} (${sec[0]}..${sec[1]} deg) ---`);
    for (const [file, D] of REFS) {
      const prof = await sweep(file, D, sec, HF);
      // §4.3 — print the whole profile, so the "plateau" is visible and not asserted
      const mxp = Math.max(...prof.map((p) => p[1]));
      console.log(`  ${file} profile (r -> sigma, bar scaled to max ${mxp.toFixed(1)}):`);
      for (let i = 0; i < prof.length; i += 4) {
        const [r, sd] = prof[i];
        console.log(`     ${(47 * r).toFixed(1).padStart(5)}vb  ${sd.toFixed(1).padStart(6)}  ${'#'.repeat(Math.round(50 * sd / mxp))}`);
      }
      const { runs, med, mx, lvl } = plateaus(prof);
      console.log(`  ${file}  median sigma ${med.toFixed(2)}  max ${mx.toFixed(2)}  half-max level ${lvl.toFixed(2)}`);
      console.log(`  CANDIDATE SET (${runs.length} runs above the level, all printed — §4.2):`);
      for (const r of runs) console.log(`     r ${r.r0.toFixed(3)}..${r.r1.toFixed(3)} R = viewBox ${(47 * r.r0).toFixed(2)}..${(47 * r.r1).toFixed(2)}  width ${r.width.toFixed(3)}R  mean sigma ${r.mean.toFixed(2)}  contrast ${r.contrast.toFixed(2)}x`);
      if (runs.length >= 2) {
        const s0 = runs[0].width * runs[0].mean, s1 = runs[1].width * runs[1].mean;
        if ((s0 - s1) / s0 < 0.10) console.log(`     ** AMBIGUOUS: top two runs within 10% (${s0.toFixed(1)} vs ${s1.toFixed(1)}). §4.2 says this is not a selection.`);
      }
      const b = runs[0];
      const atBound = Math.abs(b.r0 - RLO) < 1e-6 || Math.abs(b.r1 - RHI) < 1e-6;
      console.log(`     -> chosen ${b.r0.toFixed(3)}..${b.r1.toFixed(3)} R, degeneracy (plateau contrast) ${b.contrast.toFixed(2)}x  ${atBound ? '** AT A SEARCH BOUND — FAILURE REPORT, NOT A VALUE **' : '(interior)'}`);
      found[name + '|' + file] = b;
    }
    // Q4's independent check: do the two references agree?
    const a = found[name + '|quarter-rev-3.jpg'], c = found[name + '|quarter-rev-2.png'];
    const d0 = Math.abs(a.r0 - c.r0) * 47, d1 = Math.abs(a.r1 - c.r1) * 47;
    console.log(`  CROSS-REFERENCE CHECK (Q4): inner edges differ by ${d0.toFixed(2)} viewBox units, outer by ${d1.toFixed(2)}.`);
    console.log(`  ${Math.max(d0, d1) <= 1.0 ? 'AGREE within 1.0 viewBox unit — the band is a real, locatable feature.' : 'DISAGREE by more than 1.0 viewBox unit — this is not a value.'}\n`);
  }

  // §4.3 — draw it and look.
  const [file, D] = REFS[0];
  const S = 900, half = Math.round(1.02 * D.R);
  const rings = [];
  for (const [name, sec] of Object.entries(SECTORS)) {
    const b = found[name + '|' + file];
    for (const rr of [b.r0, b.r1]) {
      const rp = rr / 1.02 * S / 2;
      const a0 = sec[0] * Math.PI / 180, a1 = sec[1] * Math.PI / 180;
      const pts = [];
      for (let k = 0; k <= 40; k++) { const t = a0 + (a1 - a0) * k / 40; pts.push(`${S / 2 + rp * Math.cos(t)},${S / 2 + rp * Math.sin(t)}`); }
      rings.push(`<polyline points="${pts.join(' ')}" fill="none" stroke="#0f0" stroke-width="3"/>`);
      rings.push(`<circle cx="${S / 2}" cy="${S / 2}" r="${rp}" fill="none" stroke="#0f0" stroke-width="1" opacity="0.35"/>`);
    }
    rings.push(`<text x="8" y="${name === 'top' ? 24 : 48}" fill="#0f0" font-size="18" font-family="monospace">${name}: ${(47 * b.r0).toFixed(2)}..${(47 * b.r1).toFixed(2)} viewBox</text>`);
  }
  const meta = await sharp(P(file)).metadata();
  const pad = Math.max(0, half - Math.round(Math.min(D.cx, D.cy)), half - Math.round(Math.min(meta.width - D.cx, meta.height - D.cy))) + 2;
  const padded = await sharp(P(file)).flatten({ background: '#ffffff' }).extend({ top: pad, bottom: pad, left: pad, right: pad, background: '#ffffff' }).png().toBuffer();
  const buf = await sharp(padded).extract({ left: Math.round(D.cx + pad - half), top: Math.round(D.cy + pad - half), width: 2 * half, height: 2 * half }).resize(S, S).png().toBuffer();
  await sharp(buf).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">${rings.join('')}</svg>`) }]).png().toFile(dir + '_jq-rev-band.png');
  console.log('wrote _jq-rev-band.png — §4.3: look at it and check the green arcs bracket the CAPS, not the rim.');
}
