// _jn14hair — DOES OUR DRAWN WIG REACH ITS OWN FROZEN TONE PATCHES, and where
// does the coin actually put the wig's front edge?
//
// D1's mask is the whole-bust silhouette, so it is blind to an interior mass
// that is the wrong size. D3's patch ratios are blind to it in a different way:
// a patch that misses the drawn feature altogether reads 1.000 — the cheek's
// own tone — which is a perfectly ordinary-looking number.
//
// WHAT IT MEASURES
//   1. COVERAGE. For every frozen patch in _tonepatches-nickel.json, the
//      fraction of the patch disc that lies inside the drawn HAIR polygon,
//      by point-in-polygon on the flattened path. A wig patch at 0% coverage
//      is the defect; a face patch at >0% would be the opposite defect.
//   2. THE PHOTOGRAPH'S OWN HAIRLINE, located by TEXTURE rather than by
//      brightness. The nickel's wig is a mass of separately cut strands and
//      the cheek is smooth, so local standard deviation separates them where
//      a median does not — the curl cluster behind the jaw is the darkest
//      thing on this face AND unambiguously hair, which is exactly the case
//      that defeats a level threshold (§20.2's band lesson, in reverse).
//   3. OVERLAYS: the drawn HAIR polygon on both usable references, and on our
//      own render, so the two can be compared as pictures (§4.3).
//
// NULL TEST (§4.1): every scan prints the local-x bounds it swept and reports
//   `AT BOUND` instead of a value when the crossing is at an end.
// RESPONSE TEST (§4): `RESPONSE=1` scores a generated copy of coins.js whose
//   HAIR.Jefferson is translated 6 local units forward; coverage must rise on
//   the wig patches and the located photographic hairline must NOT move (it is
//   a property of the photograph and cannot depend on our art — §6.1's
//   reference-invariance test, run explicitly).
//
// Run: node coloringbook/judge/_jn14hair.mjs
import sharp from 'sharp';
import { readFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { localToPx, pxPerLocal, TP, REFP, flatten, inside } from './_jn14map.mjs';

const HERE = (f) => new URL('./' + f, import.meta.url).pathname;
const SRC = process.env.ART || new URL('../../src/art/coins.js', import.meta.url).pathname;
const TAG = process.env.TAG || 'live';

// ── pull HAIR.Jefferson and HEAD.Jefferson out of the revision under test ────
function grab(name, src) {
  const raw = readFileSync(src, 'utf8');
  const i = raw.indexOf(`const ${name} = {`);
  if (i < 0) throw new Error(`no ${name}`);
  const j = raw.indexOf('\n  Jefferson: [', i);
  if (j < 0) throw new Error(`no ${name}.Jefferson`);
  const k = raw.indexOf('].join(', j);
  // Drop comment lines FIRST. A `//` comment inside the array literal may
  // contain apostrophes ("the head's own knots"), and a bare /'[^']*'/g sweep
  // then splices prose into the path — 144 NaN points, silently, on the first
  // run after this file's own comment was written. Caught by a coverage number
  // that moved on a patch nothing had touched.
  const body = raw.slice(j, k).split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');
  return body.match(/'[^']*'/g).map((s) => s.slice(1, -1)).join(' ');
}
const HAIRD = grab('HAIR', SRC);
const HEADD = grab('HEAD', SRC);
const shift = process.env.RESPONSE ? 6 : 0;
const HAIRPTS = flatten(HAIRD).map(([x, y]) => [x + shift, y]);
const HEADPTS = flatten(HEADD);
console.log(`### _jn14hair — art ${SRC}  [TAG ${TAG}]${shift ? `  RESPONSE: HAIR shifted +${shift} local x` : ''}`);
console.log(`HAIR.Jefferson: ${HAIRPTS.length} flattened points; HEAD.Jefferson: ${HEADPTS.length}`);

// ── 1. coverage of each frozen patch by the drawn HAIR polygon ──────────────
console.log('\n### 1. COVERAGE of each frozen tone patch by the DRAWN hair mass');
console.log('    (point-in-polygon on the flattened HAIR path, 0.05-local-unit lattice)');
console.log('patch        local (x,y,r)          in HAIR    in HEAD   expected');
const EXPECT = { hairFront: 'hair', hairCrown: 'hair', hairMid: 'hair', hairBack: 'hair', curls: 'hair', queue: 'hair',
  cheek: 'face', forehead: 'face', brow: 'face', lips: 'face', chin: 'face', jaw: 'face', throat: 'face' };
const cov = {};
for (const p of TP.patches) {
  const [lx, ly, r] = p.local;
  let n = 0, inH = 0, inHead = 0;
  for (let x = -r; x <= r; x += 0.05) for (let y = -r; y <= r; y += 0.05) {
    if (x * x + y * y > r * r) continue;
    n++;
    if (inside([lx + x, ly + y], HAIRPTS)) inH++;
    if (inside([lx + x, ly + y], HEADPTS)) inHead++;
  }
  cov[p.name] = inH / n;
  const flag = EXPECT[p.name] === 'hair' && inH === 0 ? '   <-- SAMPLES FACE, NOT HAIR' : '';
  console.log(`${p.name.padEnd(11)}(${lx}, ${ly}, ${r})`.padEnd(36)
    + `${(100 * inH / n).toFixed(1).padStart(8)}%${(100 * inHead / n).toFixed(1).padStart(9)}%   ${EXPECT[p.name]}${flag}`);
}

// ── 2. the photograph's own hairline, by TEXTURE ────────────────────────────
async function grey(f) {
  const o = await sharp(REFP(f)).greyscale().raw().toBuffer({ resolveWithObject: true });
  return { d: o.data, w: o.info.width, h: o.info.height };
}
const at = (g, x, y) => (x < 0 || y < 0 || x >= g.w || y >= g.h ? null : g.d[Math.round(y) * g.w + Math.round(x)]);
function texture(g, file, lx, ly, rad) {
  const v = [];
  for (let dx = -rad; dx <= rad; dx += rad / 4) for (let dy = -rad; dy <= rad; dy += rad / 4) {
    const [X, Y] = localToPx(file, lx + dx, ly + dy); const s = at(g, X, Y); if (s !== null) v.push(s);
  }
  if (v.length < 8) return null;
  const m = v.reduce((a, b) => a + b, 0) / v.length;
  return Math.sqrt(v.reduce((a, b) => a + (b - m) * (b - m), 0) / v.length);
}

const YS = [-26, -22, -18, -14, -10, -6, -2, 2, 6, 10, 14];
const XB = [20, -34];
console.log(`\n### 2. THE PHOTOGRAPH'S HAIRLINE, by local texture energy (sd in a +-1.6-unit window),`);
console.log(`    normalised by the SAME statistic on the frozen \`cheek\` patch. Swept in local x`);
console.log(`    over BOUNDS [${XB[0]}, ${XB[1]}] at each y. Crossing = first x where sd/cheek >= 2.0`);
console.log(`    and stays >= 1.5 for 3 more units (a mass, not a speckle).\n`);
const refs = ['nickel-obv-unc2004.jpg', 'nickel-obv-5.JPG'];
const found = {};
for (const f of refs) {
  const g = await grey(f);
  const cheekSd = texture(g, f, ...TP.patches.find((p) => p.name === 'cheek').local.slice(0, 2), 1.6);
  const line = [];
  for (const y of YS) {
    const prof = [];
    for (let x = XB[0]; x >= XB[1]; x -= 1) prof.push([x, texture(g, f, x, y, 1.6) / cheekSd]);
    let c = null;
    for (let i = 0; i < prof.length - 3; i++) {
      if (prof[i][1] >= 2.0 && prof[i + 1][1] >= 1.5 && prof[i + 2][1] >= 1.5 && prof[i + 3][1] >= 1.5) { c = prof[i][0]; break; }
    }
    line.push([y, c]);
  }
  found[f] = line;
  console.log(`${f}   (cheek sd = ${cheekSd.toFixed(2)})`);
  console.log('  local y   ' + line.map(([y]) => String(y).padStart(6)).join(''));
  console.log('  hairline  ' + line.map(([, c]) => (c === null ? '  none' : (c === XB[0] ? ' BOUND' : String(c).padStart(6)))).join(''));
  // ours, for the same y: the most forward x of the drawn HAIR polygon
  const ours = YS.map((y) => {
    let best = null;
    for (let x = XB[0]; x >= XB[1]; x -= 0.25) if (inside([x, y], HAIRPTS)) { best = x; break; }
    return best;
  });
  console.log('  OURS      ' + ours.map((c) => (c === null ? '  none' : c.toFixed(1).padStart(6))).join(''));
  console.log('  delta     ' + line.map(([, c], i) => (c === null || ours[i] === null ? '     -' : (ours[i] - c).toFixed(1).padStart(6))).join(''));
  // §4.3 — THIS SUB-MEASURE IS REPORTED AS A FAILURE, NOT AS A VALUE.
  // On the frame reference it returns local x 11..19 across the whole upper
  // face. Drawn on the source, that is the BROW, the EYE and the NOSE: the
  // profile's own relief has more local texture energy than the cheek, and the
  // detector reaches it before it ever reaches the wig. On the worn 1945-P it
  // returns `none` at seven of eleven heights. Both are the wrong-feature
  // failure §4.3 exists for, and both were caught by drawing it rather than by
  // any bound check. The hairline used by this round was read by hand off
  // judge/_jn14zoom.mjs's labelled ladder instead.
  const bad = line.filter(([, c]) => c !== null && c > 10).length;
  console.log(`  >>> REFUSED as a value: ${bad}/${line.length} crossings land forward of local x 10, i.e. on the brow/eye/nose relief, not the hairline.`);
}

// ── 3. overlays ─────────────────────────────────────────────────────────────
async function over(file) {
  const m = await sharp(REFP(file)).metadata();
  const ppl = pxPerLocal(file);
  const P = (lx, ly) => localToPx(file, lx, ly);
  const poly = (pts, col, w) => `<polyline points="${pts.map((p) => { const q = P(p[0], p[1]); return `${q[0].toFixed(1)},${q[1].toFixed(1)}`; }).join(' ')}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
  const g = [poly([...HEADPTS, HEADPTS[0]], '#00e5ff', Math.max(2, 0.3 * ppl)),
             poly([...HAIRPTS, HAIRPTS[0]], '#ff2d55', Math.max(2, 0.45 * ppl))];
  for (const p of TP.patches) {
    const c = P(p.local[0], p.local[1]);
    g.push(`<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${(p.local[2] * ppl).toFixed(1)}" fill="none" stroke="${cov[p.name] > 0.5 ? '#7CFC00' : '#ffd60a'}" stroke-width="${Math.max(2, 0.22 * ppl)}"/>`);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${m.width}" height="${m.height}">${g.join('')}</svg>`;
  const buf = await sharp(REFP(file)).composite([{ input: Buffer.from(svg) }]).png().toBuffer();
  const out = HERE(`_jn14hair-${file.replace(/[^a-z0-9]/gi, '_')}-${TAG}.png`);
  await sharp(buf).resize({ width: 900 }).toFile(out);
  return out;
}
console.log('\n### 3. OVERLAYS (§4.3) — cyan = drawn HEAD outline, red = drawn HAIR mass,');
console.log('    patch circles GREEN where the drawn hair covers >50% of them, YELLOW where it does not:');
for (const f of refs) console.log('  ' + (await over(f)).split('/').pop());

// our own render, same patches
{
  const { coinSVG } = await import(SRC);
  const W = 900;
  const svg = coinSVG('nickel', 600, { side: 'obverse' }).replace(/ width="[0-9.]+" height="[0-9.]+"/, ` width="${W}" height="${W}"`);
  const g = TP.patches.map((p) => {
    const sx = 50 - 6.4 - 0.95 * p.local[0], sy = 43.7 + 0.95 * p.local[1];
    const x = sx * W / 100, y = sy * W / 100, r = p.local[2] * 0.95 * W / 100;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="none" stroke="${cov[p.name] > 0.5 ? '#7CFC00' : '#ffd60a'}" stroke-width="3"/>`
      + `<text x="${(x + r + 4).toFixed(1)}" y="${(y + 5).toFixed(1)}" font-family="monospace" font-size="16" fill="#ff2d55">${p.name}</text>`;
  }).join('');
  const base = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' }).png().toBuffer();
  const out = HERE(`_jn14hair-ours-${TAG}.png`);
  await sharp(base).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${W}">${g}</svg>`) }]).toFile(out);
  console.log('  ' + out.split('/').pop() + '   (the same patches on OUR render)');
}
