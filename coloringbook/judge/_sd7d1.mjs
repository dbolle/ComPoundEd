// SPECIALIST working instrument (dime obverse, D7 round) — D1 before/after.
//
// Reproduces `_p2iou.mjs` / `_jd14d1resp.mjs`'s computation exactly (bust path
// out of the emitted SVG, re-filled, rasterised at 1024 against the frozen
// `coloringbook/_headmask.json`) and runs it on TWO revisions, so the round can
// report an absolute numerator on both sides of the change rather than "it
// cannot have moved". The baseline comes out of git; nothing is moved.
//
// It also prints whether the bust path STRING is byte-identical between the
// two, because that is the stronger statement when it holds: an IoU that agrees
// to 5 places is evidence, an identical `d` is proof.
//
// Run: node coloringbook/judge/_sd7d1.mjs [baselineRev]
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';

const ROOT = new URL('../../', import.meta.url).pathname;
const REV = process.argv[2] || 'HEAD';
const G = 1024;
const raster = async (svg) =>
  Uint8Array.from(await sharp(Buffer.from(svg)).flatten({ background: '#000' }).greyscale().raw().toBuffer(), (v) => (v >= 128 ? 1 : 0));
const iou = (a, b) => { let i = 0, u = 0; for (let k = 0; k < a.length; k++) { if (a[k] & b[k]) i++; if (a[k] | b[k]) u++; } return i / u; };

const poly = JSON.parse(readFileSync(`${ROOT}coloringbook/_headmask.json`, 'utf8')).polygon;
const d = poly.map(([u, v], i) => `${i ? 'L' : 'M'} ${(50 + 47 * u).toFixed(3)} ${(50 + 47 * v).toFixed(3)}`).join(' ') + ' Z';
const ref = await raster(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${G}" height="${G}"><path d="${d}" fill="#fff"/></svg>`);

const bust = (mod) => {
  const svg = mod.coinSVG('dime', 600, { side: 'obverse' });
  const g = svg.match(/transform="translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+) ([-\d.]+)\)">/);
  return { g: g.slice(1), d: svg.slice(g.index + g[0].length).match(/<path d="([^"]+)"/)[1] };
};
const score = async (mod) => {
  const { g, d: bd } = bust(mod);
  return iou(await raster(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${G}" height="${G}"><g transform="translate(${g[0]} ${g[1]}) scale(${g[2]} ${g[3]})"><path d="${bd}" fill="#fff"/></g></svg>`), ref);
};

const dir = mkdtempSync(join(tmpdir(), 'sd7d1-'));
const base = execFileSync('git', ['show', `${REV}:src/art/coins.js`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
writeFileSync(join(dir, 'coins.js'), base.replace("from '../engine/money.js'", `from '${ROOT}src/engine/money.js'`));
const old = await import(`file://${join(dir, 'coins.js')}`);
const now = await import(`${ROOT}src/art/coins.js`);

const bo = bust(old), bn = bust(now);
console.log(`D1 dime obverse — region IoU vs coloringbook/_headmask.json, raster ${G}x${G}`);
console.log(`  bust path string byte-identical across ${REV} -> worktree: ${bo.d === bn.d ? 'YES' : 'NO'}`);
console.log(`  bust transform identical: ${bo.g.join(' ') === bn.g.join(' ') ? 'YES' : 'NO'}   (${bn.g.join(' ')})`);
console.log(`  IoU ${REV}      : ${(await score(old)).toFixed(6)}`);
console.log(`  IoU worktree    : ${(await score(now)).toFixed(6)}`);
