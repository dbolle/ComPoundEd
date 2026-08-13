// D12 — round 2. Every image the judge looked at, regenerable from this file.
//
// `.gitignore` tracks the judge's text and instruments and deliberately does
// NOT track the 15 MB of PNGs. §1.1 promises any published number can be
// reproduced — so for an image the reproducible artefact is the GENERATOR, and
// round 2's D12 overlays were produced by throwaway scripts until this file
// existed. That is the same class of gap `2a656a3` closed for the instruments.
//
//   node coloringbook/judge/_jq12look-r2.mjs control   -> _jq-r2-control.png
//   node coloringbook/judge/_jq12look-r2.mjs subject   -> _jq-r2-subject.png
//   node coloringbook/judge/_jq12look-r2.mjs crop      -> _jq-r2-crop84.png, -crop120.png
//   node coloringbook/judge/_jq12look-r2.mjs ring      -> the field-ring walk (numbers, no image)
//   node coloringbook/judge/_jq12look-r2.mjs locus     -> _jq-r2-locus.png, _jq-r2-locus3.png
//
// PREV=<abs path to a coins.js> selects the revision used as "round 1".
// Default: whatever `git show HEAD:src/art/coins.js` was at the time, written
// to a temp file by this script, so no manual step is needed.
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const HERE = new URL('.', import.meta.url).pathname;
const OUT = (n) => HERE + n;
const A = await import(new URL('../../src/art/coins.js', import.meta.url).pathname);

async function prevModule() {
  if (process.env.PREV) return import(process.env.PREV);
  const repo = new URL('../../', import.meta.url).pathname;
  let code = execFileSync('git', ['-C', repo, 'show', 'HEAD:src/art/coins.js'], { encoding: 'utf8' });
  code = code.replace(/from '\.\.\/engine\/money\.js'/, `from '${repo}src/engine/money.js'`);
  const p = join(mkdtempSync(join(tmpdir(), 'jq12-')), 'coins-prev.js');
  writeFileSync(p, code);
  return import('file://' + p);
}

const UP = 8;
async function tile(mod, id, side, size) {
  const svg = mod.coinSVG(id, size, { side });
  const W = Math.max(8, Math.round(Number(svg.match(/width="([\d.]+)"/)[1])));
  const buf = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
    .resize(W, W, { fit: 'fill' }).png().toBuffer();
  return { up: await sharp(buf).resize(W * UP, W * UP, { kernel: 'nearest' }).png().toBuffer(), W };
}
async function sheet(tiles, out, labels) {
  const H = Math.max(...tiles.map((t) => t.W * UP)), pad = 12;
  let x = pad; const comps = [];
  for (const t of tiles) { comps.push({ input: t.up, left: x, top: pad }); x += t.W * UP + pad; }
  await sharp({ create: { width: x, height: H + 2 * pad, channels: 3, background: '#ffffff' } })
    .composite(comps).png().toFile(out);
  console.log(out, '\n  ' + labels.join('\n  '));
}

// ── the field-ring walk (§6.1 of quarter-r2.md) ──────────────────────────────
// The field ring is `circle r=41 stroke-width=1.4`, so the band is 40.3..41.7.
// Legend glyphs (#242c33 at opacity 0.6 over #cfd5da, ~105) are DARKER than the
// ring (#8b939b, ~146), so contamination shows as the band getting DARKER.
async function px(mod, side, size) {
  const svg = mod.coinSVG('quarter', size, { side });
  const W = Math.round(Number(svg.match(/width="([\d.]+)"/)[1]));
  const { data } = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
    .resize(W, W, { fit: 'fill' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  return { d: data, W };
}
function ringWalk(g) {
  const out = [];
  for (let a = 0; a < 720; a++) {
    const th = a * 0.5 * Math.PI / 180; let mn = 255;
    for (let r = 40.3; r <= 41.7001; r += 0.1) {
      const X = 50 + r * Math.cos(th), Y = 50 + r * Math.sin(th);
      const i = Math.min(g.W - 1, Math.max(0, Math.floor(X / 100 * g.W)));
      const j = Math.min(g.W - 1, Math.max(0, Math.floor(Y / 100 * g.W)));
      const v = g.d[j * g.W + i]; if (v < mn) mn = v;
    }
    out.push(mn);
  }
  return out;
}

// ── radius ladders drawn on the references (§4.3) ────────────────────────────
async function ladder(file, disc, radii, outFile, crop) {
  const R_VB = 47;
  const cols = ['#00d0ff', '#00ff5a', '#ffd400', '#ff8c00', '#ff2d2d', '#ff00e6', '#ffffff'];
  const meta = await sharp(file).metadata();
  let g = '';
  radii.forEach((r, i) => {
    const rp = (r / R_VB) * disc.R;
    const p = (a) => [disc.cx + rp * Math.cos(a * Math.PI / 180), disc.cy + rp * Math.sin(a * Math.PI / 180)];
    const [ax, ay] = p(248), [bx, by] = p(292);
    g += `<circle cx="${disc.cx}" cy="${disc.cy}" r="${rp}" fill="none" stroke="${cols[i % 7]}" stroke-width="1.5" stroke-dasharray="6 10" opacity="0.5"/>`;
    g += `<path d="M ${ax} ${ay} A ${rp} ${rp} 0 0 1 ${bx} ${by}" fill="none" stroke="${cols[i % 7]}" stroke-width="${meta.width > 1200 ? 4 : 5}"/>`;
    g += `<text x="${bx + 14}" y="${by + 8}" fill="${cols[i % 7]}" font-size="${meta.width > 1200 ? 34 : 24}" font-family="monospace">${r}</text>`;
  });
  const svg = `<svg width="${meta.width}" height="${meta.height}" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;
  let img = sharp(file).composite([{ input: Buffer.from(svg), top: 0, left: 0 }]);
  if (crop) img = sharp(await img.png().toBuffer()).extract(crop);
  await img.png().toFile(outFile);
  console.log(outFile, 'radii', radii.join(','));
}

const mode = process.argv[2] || 'control';

if (mode === 'control') {
  // RENDERED AND READ FIRST, before the subject — §3 D12, Appendix Q5.
  await sheet([
    await tile(A, 'dime', 'reverse', 84),
    await tile(A, 'nickel', 'reverse', 84),
    await tile(A, 'quarter', 'reverse', 76),
    await tile(A, 'quarter', 'obverse', 84),
  ], OUT('_jq-r2-control.png'), [
    'dime reverse 84px   — byte-identical this round; keeps the 135 floor',
    'nickel reverse 84px — byte-identical this round; keeps the 135 floor',
    'quarter reverse 76px — below the new 84 floor; the change cannot have touched it',
    'quarter OBVERSE 84px — byte-identical; DOES draw LIBERTY at this size',
  ]);
} else if (mode === 'subject') {
  const B = await prevModule();
  await sheet([
    await tile(B, 'quarter', 'reverse', 84),
    await tile(A, 'quarter', 'reverse', 84),
    await tile(A, 'quarter', 'reverse', 82),
    await tile(A, 'quarter', 'reverse', 120),
  ], OUT('_jq-r2-subject.png'), [
    'quarter reverse 84px ROUND 1 — no glyphs',
    'quarter reverse 84px ROUND 2 — 34 glyphs',
    'quarter reverse 82px ROUND 2 — just below the floor, no glyphs (the pop)',
    'quarter reverse 120px ROUND 2',
  ]);
} else if (mode === 'crop') {
  for (const [size, up, h] of [[84, 20, 34], [120, 14, 48]]) {
    const svg = A.coinSVG('quarter', size, { side: 'reverse' });
    const buf = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
      .resize(size, size, { fit: 'fill' }).png().toBuffer();
    await sharp(buf).extract({ left: 0, top: 0, width: size, height: h })
      .resize(size * up, h * up, { kernel: 'nearest' }).png().toFile(OUT(`_jq-r2-crop${size}.png`));
    console.log(OUT(`_jq-r2-crop${size}.png`), `top ${h} rows at ${up}x nearest`);
  }
} else if (mode === 'ring') {
  const B = await prevModule();
  for (const [side, size] of [['reverse', 84], ['obverse', 84], ['reverse', 82]]) {
    const a = ringWalk(await px(A, side, size)), b = ringWalk(await px(B, side, size));
    let darker = 0, worst = 0, wdeg = null;
    for (let i = 0; i < 720; i++) { const d = b[i] - a[i]; if (d > 0) { darker++; if (d > worst) { worst = d; wdeg = i * 0.5; } } }
    console.log(`${side} ${size}px: ring-band angles DARKENED by round 2: ${darker}/720   worst +${worst} at ${wdeg}deg`);
    console.log(`   round2 darkest ${Math.min(...a)} / lightest-min ${Math.max(...a)}   round1 darkest ${Math.min(...b)} / lightest-min ${Math.max(...b)}`);
  }
} else if (mode === 'locus') {
  const ref = new URL('../ref/', import.meta.url).pathname;
  // disc fits: quarter-rev-2 from _jq5letter REFS; quarter-rev-3 from _jq20indep
  await ladder(ref + 'quarter-rev-2.png', { cx: 374.50, cy: 374.37, R: 374.98 },
    [36.4, 38.9, 39.64, 42.3], OUT('_jq-r2-locus.png'));
  await ladder(ref + 'quarter-rev-3.jpg', { cx: 999.50, cy: 999.45, R: 999.49 },
    [36, 37, 38, 39, 40, 41, 42], OUT('_jq-r2-locus3.png'), { left: 560, top: 0, width: 900, height: 560 });
  console.log('  36.4 = our top-legend baseline; 38.9 = the FROZEN D5-HF locus; 39.64 = our glyph cap tops');
} else {
  throw new Error('mode: control | subject | crop | ring | locus');
}
