// SPECIALIST INSTRUMENT — round 1, D5 lettering. THE PRESENCE FLOOR, derived
// the way COIN-ART-METHOD §16.1 says a floor is derived, and the way the
// quarter's 84 was derived in round 4:
//
//   render the legend at each tier, reduce THE REFERENCE PHOTOGRAPH to the
//   same device pixel count, and compare along-band high-frequency energy.
//   Take the floor down to the size at which the reference is still a chain of
//   separated marks rather than a smooth grey band.
//
// Three numbers per (coin, side, legend, boxW):
//   refHF   the reference's own along-band HF at the frozen locus, reduced to
//           boxW device pixels. THIS IS THE ONE THE FLOOR IS READ OFF. It has
//           nothing of ours in it and does not move when our drawing moves.
//   ctlHF   the same reference, same radius, same device pixel count, in a
//           LETTER-FREE sector — the bare-field noise floor. A legend has
//           stopped resolving when refHF falls to ctlHF.
//   ourHF   ours at the same locus, for the D5-HF ratio, reported beside a
//           PRESENCE FLAG (a tier that draws nothing is UNMEASURED, not a
//           pass — nickel r0 finding N5).
//
// ── LOCI (§6.1) ────────────────────────────────────────────────────────────
// Every radius and sector below is a FROZEN LITERAL copied out of the round-0
// scorecards and the frozen band targets. Not one of them is computed from our
// drawing, and `LOCI` is a plain object so that can be checked by reading it.
// Provenance is written beside each line.
//
// ── §4 RESPONSE TEST ───────────────────────────────────────────────────────
// RESPONSE=1: (a) a synthetic striped ring against a flat ring at the same
// locus — HF must jump by more than 10x; (b) our art with the legend deleted —
// ourHF must collapse toward the bare-field level; (c) REFERENCE-INVARIANCE
// (Appendix R1): score the same reference against two revisions of coins.js
// and require every refHF and ctlHF to be BIT-IDENTICAL.
//
// ── §4.1 NULL TEST ─────────────────────────────────────────────────────────
// Nothing here searches. HF is a computation at a fixed radius over a fixed
// sector; there is no window and no bound to land on. The degeneracy measure
// that stands in for one is refHF/ctlHF, printed on every row: a value at 1.0
// means "the reference has no legend here either", which is a failure report
// about the locus, not a floor.
//
// ── §4.3 OVERLAY ───────────────────────────────────────────────────────────
// SHEET=1 writes `_jl1floor-<coin>-<side>.png`: the reference reduced to each
// boxW, upscaled nearest-neighbour, with the sampled arc drawn on it. Look at
// it and check the arc lies along the legend and not along the rim or the
// device — that is the failure that has now happened four times.
//
// Run: node coloringbook/judge/_jl1floor.mjs [coin]
//      SHEET=1 RESPONSE=1 ART=/abs/coins.js
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCoins } from './_jq8contain-v2.mjs';
import { legendsOf } from './_jl1cap.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const H = (f) => join(HERE, f);
const R_VB = 47;

const DISCS = Object.assign({}, ...['_jn1discs.json', '_jd1discs.json', '_jp1discs.json', '_jq4discs.json']
  .map((f) => JSON.parse(readFileSync(H(f), 'utf8'))));
// `quarter-obv-2.jpg` is not in `_jq4discs.json` (round 4 fitted reverses).
// Its fit is the one `_jq5letter-v2.mjs:99` has used for every published
// D5-HF-obverse number; copied here verbatim rather than re-fitted, so this
// instrument and the judge's are reading the same photograph the same way.
DISCS['quarter-obv-2.jpg'] = { cx: 374.41, cy: 374.36, R: 373.67, via: '_jq5letter-v2.mjs REFS' };

// ── FROZEN LOCI ────────────────────────────────────────────────────────────
// r        : band mid-radius, viewBox units
// sector   : [a0,a1] degrees, SVG convention (270 = twelve o'clock)
// control  : a letter-free sector at the SAME radius on the same face
// from     : where the literal comes from
export const LOCI = [
  { coin: 'penny', side: 'obverse', legend: 'IN GOD WE TRUST', ref: 'penny-obv-3.jpg',
    r: 41.3, sector: [205, 335], control: [30, 90],
    from: 'penny-scorecard D5-HF locus "41.3 obverse"; sector = the 130 deg span in D5-span centred on 270' },
  { coin: 'penny', side: 'reverse', legend: 'UNITED STATES OF AMERICA', ref: 'penny-rev-2.png',
    r: 38.9, sector: [190, 350], control: [60, 120],
    from: 'penny-scorecard D5-HF locus "38.9 reverse-top"' },
  { coin: 'penny', side: 'reverse', legend: 'ONE CENT', ref: 'penny-rev-2.png',
    r: 36.1, sector: [30, 150], control: [200, 250],
    from: 'penny-scorecard D5-HF locus "36.1 reverse-bottom"' },
  { coin: 'nickel', side: 'obverse', legend: 'IN GOD WE TRUST', ref: 'nickel-obv-5.JPG',
    r: 40.05, sector: [140, 210], control: [20, 70],
    from: 'nickel-scorecard D5-HF locus r 40.05 obverse; sector from D5-band' },
  { coin: 'nickel', side: 'obverse', legend: 'LIBERTY', ref: 'nickel-obv-5.JPG',
    r: 40.05, sector: [318, 352], control: [20, 70],
    from: 'nickel-scorecard D5-band LIBERTY sector 318-352' },
  { coin: 'nickel', side: 'reverse', legend: 'E PLURIBUS UNUM', ref: 'nickel-rev-2.png',
    r: 40.0, sector: [225, 315], control: [155, 195],
    from: 'nickel-scorecard D5-HF locus r 40.00 reverse; sector from D5-band' },
  { coin: 'nickel', side: 'reverse', legend: 'UNITED STATES OF AMERICA', ref: 'nickel-rev-2.png',
    r: 40.0, sector: [30, 150], control: [155, 195],
    from: 'nickel-scorecard D5-band UNITED STATES OF AMERICA sector 30-150' },
  { coin: 'dime', side: 'obverse', legend: 'LIBERTY', ref: 'dime-obv-2.jpg',
    r: 38.3, sector: [160, 245], control: [280, 340],
    from: 'dime-scorecard D5-band obverse sector 160-245; r = mid of the frozen band 34.33..42.25' },
  { coin: 'dime', side: 'reverse', legend: 'UNITED STATES OF AMERICA', ref: 'dime-rev-2.jpg',
    r: 38.3, sector: [200, 340], control: [155, 185],
    from: 'dime-scorecard D5-band reverse sector 200-340; r = mid of the frozen band 34.2..42.4' },
  { coin: 'quarter', side: 'obverse', legend: 'LIBERTY', ref: 'quarter-obv-2.jpg',
    r: 38.9, sector: [250, 290], control: [20, 60],
    from: 'quarter-scorecard D5-HF FROZEN LITERAL r 38.9, sector 250..290' },
  { coin: 'quarter', side: 'reverse', legend: 'UNITED STATES OF AMERICA', ref: 'quarter-rev-2.png',
    r: 38.9, sector: [250, 290], control: [140, 180],
    from: 'quarter-scorecard D5-HF FROZEN LITERAL r 38.9, sector 250..290' },
];

export const BOXES = [26, 32, 38, 44, 54, 62, 66, 73, 76, 84, 100, 120, 190];

async function greyOf(p) {
  const { data, info } = await sharp(p).flatten({ background: '#ffffff' }).greyscale().raw()
    .toBuffer({ resolveWithObject: true });
  if (info.channels !== 1 || data.length !== info.width * info.height) throw new Error('raster shape — UNTRUSTED');
  return { d: data, w: info.width, h: info.height };
}
const at = (g, x, y) => g.d[Math.max(0, Math.min(g.h - 1, Math.round(y))) * g.w + Math.max(0, Math.min(g.w - 1, Math.round(x)))];

function hf(sample, r, sector, field, pitchVB) {
  const N = Math.max(16, Math.round((((sector[1] - sector[0]) * Math.PI) / 180) * r / pitchVB) * 4);
  const v = [];
  for (let k = 0; k < N; k++) {
    const th = ((sector[0] + ((sector[1] - sector[0]) * k) / N) * Math.PI) / 180;
    v.push(sample(50 + r * Math.cos(th), 50 + r * Math.sin(th)) / field);
  }
  let ds = 0;
  for (let k = 1; k < N; k++) ds += (v[k] - v[k - 1]) ** 2;
  const arc = (((sector[1] - sector[0]) * Math.PI) / 180) * r;
  return (Math.sqrt(ds / (N - 1)) * N) / arc;
}
const fieldLevel = (sample) => {
  const v = [];
  for (let j = 0; j < 160; j++) for (let i = 0; i < 160; i++) {
    const X = (100 * (i + 0.5)) / 160, Y = (100 * (j + 0.5)) / 160;
    if ((X - 50) ** 2 + (Y - 50) ** 2 > 40 * 40) continue;
    v.push(sample(X, Y));
  }
  v.sort((a, b) => a - b);
  return v[(v.length * 0.9) | 0] || 1;
};

const refCache = new Map();
async function refSampler(file) {
  if (refCache.has(file)) return refCache.get(file);
  const d = DISCS[file];
  if (!d) throw new Error(`no frozen disc fit for ${file}`);
  const g = await greyOf(join(HERE, '..', 'ref', file));
  const s = (X, Y) => at(g, d.cx + ((X - 50) / R_VB) * d.R, d.cy + ((Y - 50) / R_VB) * d.R);
  refCache.set(file, s);
  return s;
}
// the reference reduced to boxW device pixels — 4x4 box filter, same as _jq5letter-v2
async function reduceTo(file, boxW) {
  const s = await refSampler(file);
  const buf = new Float64Array(boxW * boxW);
  for (let j = 0; j < boxW; j++) for (let i = 0; i < boxW; i++) {
    let acc = 0;
    for (let b = 0; b < 4; b++) for (let a = 0; a < 4; a++) acc += s((100 * (i + (a + 0.5) / 4)) / boxW, (100 * (j + (b + 0.5) / 4)) / boxW);
    buf[j * boxW + i] = acc / 16;
  }
  const fn = (X, Y) => buf[Math.min(boxW - 1, Math.max(0, Math.floor((Y / 100) * boxW))) * boxW
    + Math.min(boxW - 1, Math.max(0, Math.floor((X / 100) * boxW)))];
  return { fn, buf };
}

async function ourRaster(mod, coin, size) {
  const svg = mod.coinSVG(coin, size, { side: undefined });
  return svg;
}
async function ourAt(mod, coin, side, size) {
  const svg = mod.coinSVG(coin, size, { side });
  const boxW = Math.max(8, Math.round(Number(svg.match(/width="([\d.]+)"/)[1])));
  const { data, info } = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
    .resize(boxW, boxW, { fit: 'fill' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  if (info.channels !== 1) throw new Error('raster channels — UNTRUSTED');
  return {
    boxW, svg,
    fn: (X, Y) => data[Math.min(boxW - 1, Math.max(0, Math.floor((Y / 100) * boxW))) * boxW
      + Math.min(boxW - 1, Math.max(0, Math.floor((X / 100) * boxW)))],
  };
}

// device pixel count -> nominal `size` argument for this coin (coinPx is linear)
const sizeForBox = (mod, coin, boxW) => {
  let lo = 4, hi = 4000;
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (mod.coinPx(coin, m).w < boxW) lo = m; else hi = m; }
  return hi;
};

export async function run(mod, only) {
  const out = [];
  for (const L of LOCI) {
    if (only && L.coin !== only) continue;
    for (const boxW of BOXES) {
      const { fn: rfn } = await reduceTo(L.ref, boxW);
      const fR = fieldLevel(rfn);
      const pitch = 100 / boxW;
      const refHF = hf(rfn, L.r, L.sector, fR, pitch);
      const ctlHF = hf(rfn, L.r, L.control, fR, pitch);
      const size = sizeForBox(mod, L.coin, boxW);
      const o = await ourAt(mod, L.coin, L.side, size);
      const fO = fieldLevel(o.fn);
      const ourHF = hf(o.fn, L.r, L.sector, fO, pitch);
      const legends = legendsOf(o.svg);
      const drawn = legends.some((g) => g.word.replace(/\s/g, '') === L.legend.replace(/\s/g, ''));
      out.push({ ...L, boxW, size: +size.toFixed(1), refHF, ctlHF, ourHF, ratio: ourHF / (refHF || 1e-12), drawn, glyphs: legends.reduce((a, b) => a + (b.glyphs ? b.glyphs.length : 0), 0) });
    }
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const artPath = process.env.ART || join(ROOT, 'src/art/coins.js');
  const mod = await loadCoins(readFileSync(artPath, 'utf8'));
  const only = process.argv[2];
  console.log(`ART = ${artPath}`);
  console.log('§4.1 null: no search window exists — HF is computed at a frozen radius over a frozen sector.');
  console.log('           the degeneracy measure is refHF/ctlHF; a row at 1.0 says the LOCUS is wrong, not that the floor is here.\n');
  const rows = await run(mod, only);
  let key = '';
  for (const r of rows) {
    const k = `${r.coin} ${r.side} ${r.legend}`;
    if (k !== key) {
      key = k;
      console.log(`\n=== ${k}  |  ref ${r.ref}  |  LOCUS r ${r.r} sector ${r.sector.join('..')} (control ${r.control.join('..')})`);
      console.log(`    locus provenance: ${r.from}`);
      console.log('    boxW  nominal   refHF    ctlHF   ref/ctl    ourHF    ours/ref   legend drawn?');
    }
    console.log(`    ${String(r.boxW).padStart(4)}  ${String(r.size).padStart(7)}  ${r.refHF.toFixed(4)}  ${r.ctlHF.toFixed(4)}  ${(r.refHF / (r.ctlHF || 1e-12)).toFixed(2).padStart(7)}x  ${r.ourHF.toFixed(4)}  ${r.drawn ? (r.ratio.toFixed(4) + 'x').padStart(9) : '        -'}   ${r.drawn ? 'yes' : 'NO — UNMEASURED'}`);
  }

  if (process.env.SHEET) {
    for (const L of LOCI) {
      if (only && L.coin !== only) continue;
      const tiles = [];
      const SH = 260;
      for (const boxW of [26, 38, 44, 54, 62, 76, 84, 120]) {
        const { buf } = await reduceTo(L.ref, boxW);
        const u8 = Buffer.alloc(boxW * boxW);
        for (let i = 0; i < buf.length; i++) u8[i] = Math.max(0, Math.min(255, Math.round(buf[i])));
        const png = await sharp(u8, { raw: { width: boxW, height: boxW, channels: 1 } })
          .resize(SH, SH, { kernel: 'nearest' }).png().toBuffer();
        const arc = [];
        for (let a = L.sector[0]; a <= L.sector[1]; a += 1) {
          const th = (a * Math.PI) / 180;
          arc.push(`${((50 + L.r * Math.cos(th)) / 100) * SH},${((50 + L.r * Math.sin(th)) / 100) * SH}`);
        }
        const ov = `<svg xmlns="http://www.w3.org/2000/svg" width="${SH}" height="${SH}">`
          + `<polyline points="${arc.join(' ')}" fill="none" stroke="#f0f" stroke-width="1.4" opacity="0.9"/>`
          + `<text x="4" y="14" font-family="monospace" font-size="13" fill="#f0f">${boxW}px</text></svg>`;
        tiles.push(await sharp(png).composite([{ input: Buffer.from(ov) }]).png().toBuffer());
      }
      const W = SH * tiles.length;
      const sheet = sharp({ create: { width: W, height: SH, channels: 3, background: '#222' } })
        .composite(tiles.map((t, i) => ({ input: t, left: i * SH, top: 0 })));
      const name = `_jl1floor-${L.coin}-${L.side}-${L.legend.replace(/\s+/g, '').slice(0, 12)}.png`;
      await sheet.png().toFile(H(name));
      console.log('wrote ' + name);
    }
    console.log('§4.3: look at each sheet. The magenta arc must lie ALONG the legend at every tile.');
  }

  if (process.env.RESPONSE) {
    console.log('\n=== §4 RESPONSE TESTS ===');
    // (a) synthetic
    const N = 800;
    const stripes = Buffer.alloc(N * N, 200), flat = Buffer.alloc(N * N, 200);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const X = (100 * (i + 0.5)) / N, Y = (100 * (j + 0.5)) / N;
      const r = Math.hypot(X - 50, Y - 50), th = ((Math.atan2(Y - 50, X - 50) * 180) / Math.PI + 360) % 360;
      if (r >= 37 && r <= 41 && Math.floor(th / 2) % 2 === 0) stripes[j * N + i] = 40;
    }
    const S = (b) => (X, Y) => b[Math.min(N - 1, Math.floor((Y / 100) * N)) * N + Math.min(N - 1, Math.floor((X / 100) * N))];
    const a1 = hf(S(stripes), 38.9, [250, 290], 200, 0.5), a0 = hf(S(flat), 38.9, [250, 290], 200, 0.5);
    console.log(`  (a) synthetic stripes ${a1.toFixed(4)} vs flat ${a0.toFixed(4)} -> ${a1 > 10 * (a0 + 1e-12) ? 'PASS' : 'FAIL'}`);
    // (b) delete the legend from the art
    const code = readFileSync(artPath, 'utf8');
    // RE-ANCHORED (ledger A30). The old anchor was `const inscription = tier === `,
    // a tier-era conditional that v1.94.0 deleted along with `tier` itself, so
    // this arm has thrown since that release and the presence floor's response
    // test has not run. The live line builds the legend unconditionally, so
    // muting it now means replacing the call, not short-circuiting a branch.
    // Exactly-once, and the mute is proved to have changed the emitted SVG —
    // "the anchor matched" is not the same claim as "the legend went away".
    const anchor = 'const inscription = inscriptionOf(id, side, rField, p);';
    const hits = code.split(anchor).length - 1;
    if (hits !== 1) throw new Error(`RESPONSE anchor matches ${hits} times, expected exactly 1 — re-anchor before trusting the floor`);
    const muted = code.replace(anchor, "const inscription = ''; void inscriptionOf;");
    if (muted === code) throw new Error('RESPONSE substitution did not change the source');
    const mute = await loadCoins(muted);
    if (mute.coinSVG('quarter', 190, { side: 'reverse' }) === mod.coinSVG('quarter', 190, { side: 'reverse' }))
      throw new Error('RESPONSE substitution never reached the render — the emitted SVG is byte-identical');
    const L = LOCI.find((x) => x.coin === 'quarter' && x.side === 'reverse');
    const b1 = await ourAt(mod, 'quarter', 'reverse', 190), b0 = await ourAt(mute, 'quarter', 'reverse', 190);
    const h1 = hf(b1.fn, L.r, L.sector, fieldLevel(b1.fn), 100 / b1.boxW);
    const h0 = hf(b0.fn, L.r, L.sector, fieldLevel(b0.fn), 100 / b0.boxW);
    console.log(`  (b) quarter reverse 190px, legend on ${h1.toFixed(4)} vs legend deleted ${h0.toFixed(4)} -> ${h1 > 2 * h0 ? 'PASS' : 'FAIL'}`);
    // (c) reference-invariance
    let bad = 0, n = 0;
    for (const Lx of LOCI) {
      for (const boxW of [44, 84, 190]) {
        const A = await reduceTo(Lx.ref, boxW); const fA = fieldLevel(A.fn);
        const x = hf(A.fn, Lx.r, Lx.sector, fA, 100 / boxW);
        // recompute after loading a DIFFERENT revision of the art; the reference
        // path must not touch coins.js at all, so this must be bit-identical.
        await ourAt(mute, Lx.coin, Lx.side, 190);
        const B = await reduceTo(Lx.ref, boxW); const fB = fieldLevel(B.fn);
        const y = hf(B.fn, Lx.r, Lx.sector, fB, 100 / boxW);
        n++; if (x !== y) bad++;
      }
    }
    console.log(`  (c) reference-invariance over ${n} (locus x boxW) pairs, art swapped between the two reads: ${bad === 0 ? 'PASS — every refHF bit-identical' : `FAIL on ${bad}`}`);
  }
}
