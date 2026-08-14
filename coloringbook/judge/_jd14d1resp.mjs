// DIME r0 — D1 RESPONSE TEST (§4). Shift OBVERSE.dime.cx by +1 viewBox unit in
// a GENERATED COPY of coins.js and re-run `_p2iou.mjs`'s own computation; the
// IoU against the frozen mask must fall by 0.01-0.05. src/art/coins.js is not
// touched (§1).
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
const ROOT = new URL('../../', import.meta.url).pathname;
const G = 1024;
const poly = JSON.parse(readFileSync(ROOT + 'coloringbook/_headmask.json', 'utf8')).polygon;
const d = poly.map(([u, v], i) => `${i ? 'L' : 'M'} ${(50 + 47 * u).toFixed(3)} ${(50 + 47 * v).toFixed(3)}`).join(' ') + ' Z';
const raster = async (svg) => Uint8Array.from(await sharp(Buffer.from(svg)).flatten({ background: '#000' }).greyscale().raw().toBuffer(), (v) => (v >= 128 ? 1 : 0));
const ref = await raster(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${G}" height="${G}"><path d="${d}" fill="#fff"/></svg>`);
const iou = (a, b) => { let i = 0, u = 0; for (let k = 0; k < a.length; k++) { if (a[k] & b[k]) i++; if (a[k] | b[k]) u++; } return i / u; };
async function score(srcPath) {
  const mod = await import(`file://${srcPath}?t=${Math.random()}`);
  const svg = mod.coinSVG('dime', 600, { side: 'obverse' });
  const g = svg.match(/transform="translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+) ([-\d.]+)\)">/);
  const hd = svg.slice(g.index + g[0].length).match(/<path d="([^"]+)"/)[1];
  return iou(await raster(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${G}" height="${G}"><g transform="translate(${g[1]} ${g[2]}) scale(${g[3]} ${g[4]})"><path d="${hd}" fill="#fff"/></g></svg>`), ref);
}
const base = await score(ROOT + 'src/art/coins.js');
const txt = readFileSync(ROOT + 'src/art/coins.js', 'utf8');
const anchor = 's: 0.97, cy: 45.3, cx: -2.7, iconS: 0.97, iconCy: 45.3, iconCx: -2.7,';
if (!txt.includes(anchor)) { console.log('RESPONSE anchor missing — fix the test before trusting D1'); process.exit(1); }
const dir = mkdtempSync(join(tmpdir(), 'jd1-'));
writeFileSync(join(dir, 'coins.js'), txt.replace(anchor, 's: 0.97, cy: 45.3, cx: -1.7, iconS: 0.97, iconCy: 45.3, iconCx: -1.7,')
  .replace("from '../engine/money.js'", `from '${ROOT}src/engine/money.js'`));
const moved = await score(join(dir, 'coins.js'));
console.log(`D1 RESPONSE TEST: OBVERSE.dime.cx -2.7 -> -1.7 (+1 unit)`);
console.log(`  IoU vs _headmask.json: ${base.toFixed(5)} -> ${moved.toFixed(5)}   fall ${(base - moved).toFixed(5)}`);
console.log(`  gate: falls by 0.01-0.05.  ${(base - moved) >= 0.01 && (base - moved) <= 0.05 ? 'PASS' : 'OUT OF THE EXPECTED BAND — reported, not hidden'}`);
