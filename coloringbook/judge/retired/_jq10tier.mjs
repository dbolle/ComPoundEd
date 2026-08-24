// D10 — tier behaviour. Two things:
//   (a) the DECLARED contract: which tier draws what (icon draws no
//       inscription; icon/mid drop the full-tier relief), asserted from the
//       shipped output rather than from the source's comments (§22.3);
//   (b) NO TIER POP: our own render swept across every size the app can ask
//       for, at that size's REAL device pixel count, measuring ink coverage and
//       mean level inside the field circle. A tier boundary is expected to be a
//       step; a POP is a step far outside the drawing's own scale trend.
//
// §22.1: sharp returns THREE channels from a raw one-channel input. Every
// raster here asserts its buffer length, and the field level recovered must be
// one of the palette's own greys or it is a bug report.
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const tierOf = (s) => (s >= 76 ? 'full' : s >= 44 ? 'mid' : 'icon');

async function raster(svg, W) {
  const { data, info } = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
    .resize(W, W, { fit: 'fill' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  if (info.channels !== 1) throw new Error(`expected 1 channel, got ${info.channels} — D10 UNTRUSTED`);
  if (data.length !== info.width * info.height) throw new Error(`buffer ${data.length} != ${info.width}x${info.height} — D10 UNTRUSTED`);
  return { d: data, w: info.width, h: info.height };
}

// ink coverage and mean level inside 0.84 of the disc radius (inside the field
// circle at every tier), normalised by the recovered field level
async function stats(mod, id, side, size) {
  const svg = mod.coinSVG(id, size, { side });
  const W = Number(svg.match(/width="([\d.]+)"/)[1]);
  const g = await raster(svg, Math.max(8, Math.round(W)));
  const R = g.w / 2, cx = g.w / 2, cy = g.h / 2;
  const vals = [];
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    if (Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= 0.84 * R) vals.push(g.d[y * g.w + x]);
  }
  vals.sort((a, b) => a - b);
  const field = vals[Math.floor(vals.length * 0.9)];          // p90 = bare field
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const ink = vals.filter((v) => v < field - 8).length / vals.length;
  return { px: g.w, field, mean: mean / field, ink, n: vals.length };
}

async function sweep(mod, side, sizes) {
  const rows = [];
  for (const s of sizes) rows.push({ size: s, tier: tierOf(s), ...(await stats(mod, 'quarter', side, s)) });
  return rows;
}

function pops(rows) {
  const jumps = [];
  for (let i = 1; i < rows.length; i++) {
    jumps.push({
      from: rows[i - 1].size, to: rows[i].size,
      boundary: rows[i - 1].tier !== rows[i].tier,
      dInk: Math.abs(rows[i].ink - rows[i - 1].ink),
      dMean: Math.abs(rows[i].mean - rows[i - 1].mean),
    });
  }
  const within = jumps.filter((j) => !j.boundary).map((j) => j.dInk).sort((a, b) => a - b);
  const p90 = within[Math.floor(within.length * 0.9)] || 0;
  return { jumps, p90 };
}

const SIZES = [];
for (let s = 26; s <= 120; s += 2) SIZES.push(s);

const mod = await import('../../src/art/coins.js');

console.log('=== D10(a) declared tier contract, asserted from the output');
for (const side of ['obverse', 'reverse']) {
  for (const size of [26, 44, 84]) {
    const svg = mod.coinSVG('quarter', size, { side });
    console.log(`  ${side} ${size}px (${tierOf(size)}): <text> glyphs ${(svg.match(/<text/g) || []).length}, paths ${(svg.match(/<path/g) || []).length}, groups ${(svg.match(/<g[ >]/g) || []).length}, bytes ${svg.length}`);
  }
}

console.log('\n=== D10(b) tier pop sweep, 26..120px, at each size\'s real device pixel count');
for (const side of ['obverse', 'reverse']) {
  const rows = await sweep(mod, side, SIZES);
  const { jumps, p90 } = pops(rows);
  const fieldLevels = [...new Set(rows.map((r) => r.field))];
  console.log(`${side}: recovered field levels ${fieldLevels.join(',')} (the quarter's palette field is 212; anything else is a bug report)`);
  for (const j of jumps.filter((x) => x.boundary)) {
    console.log(`  BOUNDARY ${j.from}->${j.to}px: d(ink) ${j.dInk.toFixed(4)}  = ${(j.dInk / (p90 || 1e-9)).toFixed(1)}x the within-tier p90 jump (${p90.toFixed(4)})   d(mean) ${j.dMean.toFixed(4)}`);
  }
  const worstWithin = jumps.filter((x) => !x.boundary).sort((a, b) => b.dInk - a.dInk)[0];
  console.log(`  worst WITHIN-tier jump: ${worstWithin.from}->${worstWithin.to}px d(ink) ${worstWithin.dInk.toFixed(4)}`);
}

if (process.env.RESPONSE) {
  const srcPath = new URL('../../src/art/coins.js', import.meta.url).pathname;
  let code = readFileSync(srcPath, 'utf8');
  const anchor = 'quarter: { field: { full: 41.0, mid: 40.5, icon: 42.5 } },';
  if (!code.includes(anchor)) throw new Error('RESPONSE anchor missing — fix the test before trusting D10');
  code = code.replace(anchor, 'quarter: { field: { full: 41.0, mid: 34.0, icon: 42.5 } },');
  const money = new URL('../../src/engine/money.js', import.meta.url).pathname;
  code = code.replace(/from '\.\.\/engine\/money\.js'/, `from '${money}'`);
  const dir = mkdtempSync(join(tmpdir(), 'jq10-'));
  const p = join(dir, 'coins-pop.js');
  writeFileSync(p, code);
  const popped = await import('file://' + p);
  const rows = await sweep(popped, 'obverse', SIZES);
  const { jumps, p90 } = pops(rows);
  const b = jumps.filter((x) => x.boundary);
  console.log('\nRESPONSE TEST (D10): field circle at mid shrunk 40.5 -> 34.0, an artificial pop at 44px');
  for (const j of b) console.log(`  BOUNDARY ${j.from}->${j.to}px: d(ink) ${j.dInk.toFixed(4)} = ${(j.dInk / (p90 || 1e-9)).toFixed(1)}x within-tier p90`);
  const at44 = b.find((j) => j.to === 44);
  console.log(at44 && at44.dInk / (p90 || 1e-9) > 4 ? '  RESPONSE TEST PASS — the instrument sees an injected pop' : '  RESPONSE TEST FAIL — D10 is UNTRUSTED');
}
