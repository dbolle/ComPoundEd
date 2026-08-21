// _jn6tone — D3, INTERIOR TONE, nickel OBVERSE. The scorer for the target
// frozen by `_jn6freezetone.mjs`, written AFTER that file existed and after its
// overlay had been looked at, so no patch position was ever chosen against a
// score.
//
// METHOD §12.2: median luminance per patch / the cheek patch, ours against the
// photograph, both rasterised to the SAME disc radius. Score = mean |dratio|
// over the 12 non-cheek patches. §12.3's FLAT-DRAWING FLOOR is printed first
// and the gate is stated against it, not against a bare number.
//
// THE REGISTRATION, and why it is here (§4.3, and it is the whole reason this
// instrument is not four lines):
//   The patches are frozen in disc-normalised coordinates. Applied DIRECTLY to
//   `nickel-obv-5.JPG` they do not land on the features — `lips` and `chin`
//   fall off the profile onto bare field. Drawn on the source and looked at,
//   that is obvious; from inside the instrument it is four plausible numbers.
//   `_headmask-nickel.json` records why: the two photographs disagree by
//   **2.205%** on how large the portrait is relative to the disc. So the second
//   reference is reached through the SAME ICP transforms the mask was built
//   from (`_nkreg.json`), composed:
//       our (u,v) -> nickel-obv.jpg px          (its own frozen disc)
//                 -> model px                   (inverse of the -obv.jpg reg)
//                 -> nickel-obv-5.JPG px        (the -5.JPG reg)
//                 -> -5.JPG (u,v)               (its own frozen disc)
//   `nickel-obv.jpg` and `nickel-obv-unc2004.jpg` are the SAME photograph
//   (NCC 0.9674, `_jn6same.mjs`), so disc-normalised coordinates are shared
//   between them and the first hop is the identity in (u,v).
//
// OVERLAY (§4.3): every mapped patch is drawn on `nickel-obv-5.JPG` as
// `_jn6tone-map5.png`. A number from this instrument may not be quoted unless
// that image has been looked at.
//
// RESPONSE TEST (§4): `RESPONSE=1` re-scores a generated copy of coins.js in
// which the nickel's hair mass is filled `deep` instead of `hair`. Exactly the
// hair-side patches must move and the face-side patches must not.
// NULL TEST (§4.1): every ratio is printed with the raw medians beside it, and
// a median of 0 or 255 is reported as a clipped sample, not as a value.
// PALETTE ROUND-TRIP (§20.1): the flat-swatch check runs on OUR rasteriser
// before any patch is read.
//
// Run: node coloringbook/judge/_jn6tone.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { grey, samplePatch, loadJSON } from '../_qtlib.mjs';

const HERE = (f) => new URL('./' + f, import.meta.url).pathname;
const REFP = (f) => new URL('../ref/' + f, import.meta.url).pathname;

const TP = loadJSON(new URL('../_tonepatches-nickel.json', import.meta.url).pathname);
const P = TP.patches;
const D6 = loadJSON(HERE('_jn6discs.json'));
const D1 = loadJSON(HERE('_jn1discs.json'));
const REG = loadJSON(new URL('../_nkreg.json', import.meta.url).pathname);

const FRAME = 'nickel-obv-unc2004.jpg';
const DF = D6[FRAME];
const D5 = D1['nickel-obv-5.JPG'];
const DOBV = D1['nickel-obv.jpg'];

// ── the composed similarity: nickel-obv.jpg px -> nickel-obv-5.JPG px ────────
const r5 = REG.regs.find((r) => r.file === 'nickel-obv-5.JPG');
const ro = REG.regs.find((r) => r.file === 'nickel-obv.jpg');
const rot = (x, y, th) => [Math.cos(th) * x - Math.sin(th) * y, Math.sin(th) * x + Math.cos(th) * y];
function obvPxTo5Px(X, Y) {
  const [mx, my] = rot((X - ro.tx) / ro.s, (Y - ro.ty) / ro.s, -ro.th);   // -> model px - (ox,oy)
  const [a, b] = rot(mx, my, r5.th);
  return [r5.tx + r5.s * a, r5.ty + r5.s * b];
}
const SCALE_O5 = r5.s / ro.s;
const mapped5 = P.map((p) => {
  const [X, Y] = obvPxTo5Px(DOBV.cx + p.u * DOBV.R, DOBV.cy + p.v * DOBV.R);
  return { name: p.name, u: (X - D5.cx) / D5.R, v: (Y - D5.cy) / D5.R, r: p.r * SCALE_O5 * DOBV.R / D5.R };
});

// ── our raster, at the frame disc's radius. NO sharp.composite() (§20.1). ────
// ART=<abs path> scores an arbitrary revision, so a before/after can name both
// revisions by path and hash instead of by adjective.
const SRC = process.env.ART || new URL('../../src/art/coins.js', import.meta.url).pathname;
const MONEY = new URL('../../src/engine/money.js', import.meta.url).pathname;
async function ourRaster(coinSVG, disc, frameW, frameH) {
  const OURW = Math.round(100 * disc.R / 47);
  const svg = coinSVG('nickel', 600, { side: 'obverse' })
    .replace(/ width="[0-9.]+" height="[0-9.]+"/, ` width="${OURW}" height="${OURW}"`);
  const left = Math.round(disc.cx - OURW / 2), top = Math.round(disc.cy - OURW / 2);
  const sx = Math.max(0, -left), sy = Math.max(0, -top);
  const w = Math.min(OURW - sx, frameW - Math.max(0, left));
  const h = Math.min(OURW - sy, frameH - Math.max(0, top));
  const dx = Math.max(0, left), dy = Math.max(0, top);
  const out = await sharp(Buffer.from(svg)).flatten({ background: '#000000' })
    .extract({ left: sx, top: sy, width: w, height: h })
    .extend({ top: dy, left: dx, bottom: frameH - dy - h, right: frameW - dx - w, background: '#000000' })
    .greyscale().raw().toBuffer({ resolveWithObject: true });
  return { d: out.data, w: out.info.width, h: out.info.height };
}

async function loadArt(mutate) {
  const raw = readFileSync(SRC, 'utf8');
  if (!mutate) return (await import(SRC)).coinSVG;
  const [from, to] = mutate;
  if (raw.split(from).length - 1 !== 1) throw new Error(`RESPONSE substitution matched ${raw.split(from).length - 1} times`);
  const body = raw.split("from '../engine/money.js'").join(`from '${MONEY}'`).split(from).join(to);
  const { mkdtempSync, writeFileSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const p = join(mkdtempSync(join(tmpdir(), 'jn6tone-')), 'coins.js');
  writeFileSync(p, body);
  return (await import(p)).coinSVG;
}

function vec(g, disc, pts) {
  const meds = {}, ns = {};
  for (const p of pts) { const s = samplePatch(g, disc, p); meds[p.name] = s.med; ns[p.name] = s.n; }
  const rat = {};
  for (const p of pts) rat[p.name] = meds[p.name] / meds.cheek;
  return { meds, rat, ns };
}

// ── §20.1 palette round-trip, before anything is read ────────────────────────
{
  const line = readFileSync(SRC, 'utf8').match(/nickel: \{ rim: [^}]*\}/)[0];
  const cols = [...line.matchAll(/(\w+): '(#[0-9a-f]{6})'/g)].map((m) => [m[1], m[2]]);
  const bad = [];
  for (const [name, hex] of cols) {
    const fake = () => `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100"><rect width="100" height="100" fill="${hex}"/></svg>`;
    const direct = (await sharp(Buffer.from(fake())).flatten({ background: '#000' }).greyscale().raw().toBuffer())[0];
    const svg = fake().replace(/ width="[0-9.]+" height="[0-9.]+"/, ' width="188" height="188"');
    const through = (await sharp(Buffer.from(svg)).flatten({ background: '#000000' })
      .extract({ left: 0, top: 0, width: 188, height: 188 })
      .extend({ top: 106, left: 106, bottom: 106, right: 106, background: '#000000' })
      .greyscale().raw().toBuffer())[400 * 200 + 200];
    if (direct !== through) bad.push(`${name} ${hex} ${direct}!=${through}`);
  }
  console.log(`§20.1 palette round-trip through this file's own pipeline: ${bad.length ? 'MISMATCH ' + bad.join(', ') : `${cols.length}/${cols.length} OK`}`);
}

// ── the three references and ours ────────────────────────────────────────────
const gF = await grey(REFP(FRAME));
const gO = await grey(REFP('nickel-obv.jpg'));
const g5 = await grey(REFP('nickel-obv-5.JPG'));
const coinSVG = await loadArt(process.env.RESPONSE ? ['<path d="${HAIR[o.who]}"/>', '<path d="${HAIR[o.who]}" fill="' + '#6b737b' + '"/>'] : null);
const gU = await ourRaster(coinSVG, DF, gF.w, gF.h);

const V = {
  frame: vec(gF, DF, P),
  obvjpg: vec(gO, DOBV, P),
  ref5: vec(g5, D5, mapped5),
  ours: vec(gU, DF, P),
};

// ── the overlay the registration has to justify (§4.3) ───────────────────────
{
  const g = mapped5.map((p) => {
    const x = D5.cx + p.u * D5.R, y = D5.cy + p.v * D5.R, r = p.r * D5.R;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#ffd60a" stroke-width="3"/>`
      + `<text x="${x + r + 4}" y="${y + 6}" font-family="monospace" font-size="20" fill="#ffd60a">${p.name}</text>`;
  }).join('');
  const m = await sharp(REFP('nickel-obv-5.JPG')).metadata();
  await sharp(REFP('nickel-obv-5.JPG'))
    .composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${m.width}" height="${m.height}">${g}</svg>`) }])
    .png().toFile(HERE('_jn6tone-map5.png'));
  console.log(`overlay -> _jn6tone-map5.png  (mapped patches on the INDEPENDENT reference; composed ICP scale ${SCALE_O5.toFixed(4)})`);
}

// ── and the same patches on OUR OWN render (§12.2's second overlay). A patch
// that reads 1.000 because it missed our drawn feature altogether is a fact
// about the drawing that only this picture can show.
{
  const OURW = Math.round(100 * DF.R / 47);
  const svg = coinSVG('nickel', 600, { side: 'obverse' })
    .replace(/ width="[0-9.]+" height="[0-9.]+"/, ` width="${OURW}" height="${OURW}"`);
  const g = P.map((p) => {
    const x = (p.u * 47 + 50) * OURW / 100, y = (p.v * 47 + 50) * OURW / 100, r = p.r * 47 * OURW / 100;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#ff2d55" stroke-width="3"/>`
      + `<text x="${x + r + 4}" y="${y + 6}" font-family="monospace" font-size="20" fill="#ff2d55">${p.name}</text>`;
  }).join('');
  await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
    .composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${OURW}" height="${OURW}">${g}</svg>`) }])
    .png().toFile(HERE(`_jn6tone-ours${process.env.TAG ? '-' + process.env.TAG : ''}.png`));
  console.log(`overlay -> _jn6tone-ours${process.env.TAG ? '-' + process.env.TAG : ''}.png  (the same patches on OUR render)`);
}

console.log(`\n### D3 nickel obverse. frame ${FRAME}, disc R ${DF.R}. art ${SRC}${process.env.RESPONSE ? '  [RESPONSE VARIANT]' : ''}`);
console.log('### gate (§3 / _tonepatches-nickel.json): mean |dratio| <= 1/2 the flat-drawing floor.\n');
console.log('patch        unc2004  obv.jpg    -5.JPG  |    OURS   |d| vs frame   sign agree');
let sum = 0, sum5 = 0, flat = 0, flat5 = 0, worst = 0, worstN = '', agree = 0, n = 0, clip = [];
for (const p of P) {
  for (const [k, V2] of Object.entries(V)) if (V2.meds[p.name] === 0 || V2.meds[p.name] === 255) clip.push(`${k}/${p.name}`);
  if (p.name === 'cheek') continue;
  n++;
  const a = V.frame.rat[p.name], b = V.obvjpg.rat[p.name], c = V.ref5.rat[p.name], o = V.ours.rat[p.name];
  const d = Math.abs(o - a); sum += d; sum5 += Math.abs(o - c);
  flat += Math.abs(1 - a); flat5 += Math.abs(1 - c);
  if (d > worst) { worst = d; worstN = p.name; }
  const sg = (a - 1) * (c - 1) > 0 || (Math.abs(a - 1) < 0.03 && Math.abs(c - 1) < 0.03);
  if (sg) agree++;
  console.log(`${p.name.padEnd(11)}${a.toFixed(3).padStart(9)}${b.toFixed(3).padStart(9)}${c.toFixed(3).padStart(10)}  |${o.toFixed(3).padStart(8)}${d.toFixed(3).padStart(8)}        ${sg ? 'yes' : 'NO'}`);
}
console.log(`\ncheek medians (the normaliser, raw): unc2004 ${V.frame.meds.cheek}  obv.jpg ${V.obvjpg.meds.cheek}  -5.JPG ${V.ref5.meds.cheek}  OURS ${V.ours.meds.cheek}`);
console.log(clip.length ? `CLIPPED SAMPLES (0 or 255) — not values: ${clip.join(', ')}` : 'no clipped samples (§4.1 bound check: every median is strictly inside 0..255)');
console.log(`\nmean |dratio| vs ${FRAME}          = ${(sum / n).toFixed(4)}   worst ${worst.toFixed(3)} (${worstN})`);
console.log(`mean |dratio| vs nickel-obv-5.JPG (1945-P)      = ${(sum5 / n).toFixed(4)}`);
console.log(`FLAT-DRAWING FLOOR (§12.3) vs frame  = ${(flat / n).toFixed(4)}   -> GATE = ${(flat / n / 2).toFixed(4)}`);
console.log(`FLAT-DRAWING FLOOR (§12.3) vs -5.JPG = ${(flat5 / n).toFixed(4)}   -> GATE = ${(flat5 / n / 2).toFixed(4)}`);
let dis = 0;
for (const p of P) if (p.name !== 'cheek') dis += Math.abs(V.frame.rat[p.name] - V.ref5.rat[p.name]);
console.log(`the two INDEPENDENT references disagree with EACH OTHER by ${(dis / n).toFixed(4)}`);
let dsame = 0;
for (const p of P) if (p.name !== 'cheek') dsame += Math.abs(V.frame.rat[p.name] - V.obvjpg.rat[p.name]);
console.log(`the two encodes of the SAME photograph disagree by       ${(dsame / n).toFixed(4)}   (this is the instrument's own noise floor)`);
console.log(`sign agreement, frame vs -5.JPG (§12.7): ${agree}/${n}`);
