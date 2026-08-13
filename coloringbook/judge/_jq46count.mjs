// ROUND 4, TASK 3 — D4 STRUCTURAL RHYTHM ON THE PROOFS.
//
// Round 2 counted the LEFT WING'S PRIMARIES on the two circulation references
// and got agreement at 0 of 15 radii (rev-3 spanned 12-28, rev-2 spanned 5-13)
// and blocked D4 on the same physics as D2: on a circulation strike the
// grooves' contrast is toning-dependent, so a toned coin gives the counter
// toning streaks and a coarse scan loses real grooves.
//
// This re-runs THE SAME detector (`_jq23count.mjs`, imported unedited at its
// round-2 hash — §1 forbids the judge editing an instrument to get an answer)
// at THE SAME declared locus, on the two cameo proofs, and on the two
// circulation references again as the control. §15.1 wants two references and
// both counts written down; all four are written down.
//
// §4.1: count search bounds 0..40 printed; 0 or 40 is a failure report.
// §4.3: `_jq46count-<ref>.png` draws every counted groove's midpoint on the
//       source at the radius it was counted at. Counting is locating.
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { countRuns, arcSample } from './_jq23count.mjs';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
const D4 = JSON.parse(readFileSync(new URL('./_jq4discs.json', import.meta.url)));

// LOCUS — round 2's, unchanged: the LEFT wing's primaries, sector 150..205 deg,
// r/R 0.45..0.80.
export const A0 = 150, A1 = 205;
export const RADII = []; for (let r = 0.45; r <= 0.801; r += 0.025) RADII.push(+r.toFixed(3));

if (import.meta.url === `file://${process.argv[1]}`) {
  // §4 response test, re-run here so this file's numbers stand on their own.
  const comb = (k) => Array.from({ length: 900 }, (_, i) => 160 + 60 * Math.sign(Math.cos(2 * Math.PI * k * i / 900)));
  for (const k of [9, 13]) console.log(`RESPONSE TEST: synthetic comb of ${k} -> ${countRuns(comb(k), 60, 3).length}`);
  console.log(`             flat -> ${countRuns(new Array(900).fill(160), 60, 3).length} (must be 0)\n`);

  const REFS = ['qp1963-rev-pad.png', 'qp1964-rev-pad.png', 'quarter-rev-3.jpg', 'quarter-rev-2.png'];
  console.log(`LOCUS (round 2's, unchanged): left wing, sector ${A0}..${A1} deg, r/R ${RADII[0]}..${RADII[RADII.length - 1]}`);
  console.log('SEARCH BOUNDS (§4.1): count in 0..40; 0 or 40 is a failure report.\n');
  const table = {}, runs = {};
  for (const f of REFS) {
    table[f] = {}; runs[f] = {};
    for (const r of RADII) {
      const v = await arcSample(f, D4[f], r, A0, A1);
      const rs = countRuns(v, Math.max(6, Math.round(v.length / 6)), 3);
      table[f][r] = rs.length; runs[f][r] = rs.map(([i, j]) => (i + j) / 2 / v.length);
    }
  }
  console.log('  r/R              ' + RADII.map((r) => r.toFixed(3).padStart(6)).join(''));
  for (const f of REFS) console.log(f.padEnd(19) + RADII.map((r) => String(table[f][r]).padStart(6)).join(''));
  const mode = (a) => { const m = {}; for (const x of a) m[x] = (m[x] || 0) + 1; const e = Object.entries(m).sort((p, q) => q[1] - p[1])[0]; return `${e[0]} (${e[1]}/${a.length})`; };
  console.log('');
  for (const f of REFS) { const c = RADII.map((r) => table[f][r]);
    console.log(`${f.padEnd(19)} min ${Math.min(...c)} max ${Math.max(...c)} modal ${mode(c)}`); }
  console.log('\npairwise: radii of 15 at which two references return the SAME count');
  for (let a = 0; a < REFS.length; a++) for (let b = a + 1; b < REFS.length; b++) {
    const n = RADII.filter((r) => table[REFS[a]][r] === table[REFS[b]][r]).length;
    console.log(`  ${REFS[a].padEnd(19)} vs ${REFS[b].padEnd(19)} ${n} of ${RADII.length}`);
  }
  // §4.3 overlays
  for (const f of REFS) {
    const d = D4[f], md = await sharp(P(f)).metadata();
    let s = '';
    for (const r of RADII) {
      const a0 = A0 * Math.PI / 180, a1 = A1 * Math.PI / 180;
      s += `<path d="M${d.cx + r * d.R * Math.cos(a0)} ${d.cy + r * d.R * Math.sin(a0)} A${r * d.R} ${r * d.R} 0 0 1 ${d.cx + r * d.R * Math.cos(a1)} ${d.cy + r * d.R * Math.sin(a1)}" fill="none" stroke="#00e5ff" stroke-width="0.8" opacity="0.5"/>`;
      for (const t of runs[f][r]) {
        const th = (A0 + (A1 - A0) * t) * Math.PI / 180;
        s += `<circle cx="${d.cx + r * d.R * Math.cos(th)}" cy="${d.cy + r * d.R * Math.sin(th)}" r="${d.R * 0.008}" fill="#ff2d55"/>`;
      }
    }
    const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${md.width}" height="${md.height}">${s}</svg>`);
    const full = await sharp(P(f)).flatten({ background: '#808080' }).composite([{ input: svg }]).png().toBuffer();
    const out = new URL(`./_jq46count-${f.replace(/\..*/, '')}.png`, import.meta.url).pathname;
    await sharp(full).toFile(out);
    console.log(`overlay: ${out}`);
  }
}
