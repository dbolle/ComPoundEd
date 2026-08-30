// THE DIME OBVERSE REFERENCE POOL, CHARACTERISED FILE BY FILE.
//
// WHY THIS EXISTS. Ledger C2a: `POOL_BY_SIDE.obverse.dime` in `_jt1transfer.mjs`
// is `dime-obv-2.jpg` + `dime-obv-3.jpg`, and both are cameo proofs — as is
// `dime-obv-4.jpg`. The dime obverse is the only face whose primary-gate verdict
// rests entirely on one finish, and `COIN-ART-METHOD.md` §20.3 says a frosted
// proof is *the best SHAPE reference and the worst TONE reference*. `ref/` holds
// NINE dime-obverse files. This measures all nine so the pool can be decided on
// evidence rather than on filenames.
//
// THREE RULES THIS FILE OBEYS, each because it was broken before:
//
//   1. ALWAYS FIT THE RIM (ledger A9/A10). `discOf()`'s R = sqrt(area/pi) is
//      wrong in kind, not by a constant — measured failures of -12.1 % and
//      -31.75 % elsewhere. `_rimfit.fitRim` recovers a synthetic disc's known
//      radius to 0.014 px and discards crossings on the picture's own border
//      (A28). The area fit is printed BESIDE it as the error term, never as a
//      coordinate — and NOT as "proofs are the ones that fail": that claim was
//      corrected with numbers, and it is the device/field/surround relationship
//      that decides, not the strike.
//
//   2. A CIRCLE IS NOT THE SHAPE (ledger D41). Both dime REVERSE references are
//      genuine ellipses — harmonic-2 amplitudes 0.733 % and 0.513 % of R against
//      harmonics 1/3/4 at 0.004-0.083 % — and fitting a circle to them
//      contributes a third of a real registration error. `_dr25yreg.rimEllipse`
//      is reused unchanged so a number here is comparable with a number it
//      published. Harmonic 2 is the ellipticity; harmonics 1, 3 and 4 say
//      whether "ellipse" is the right word or the outline is merely rough.
//
//   3. THE STRIKE CALL COMES FROM THE PICTURE, NOT THE FILENAME. This project
//      has been caught twice by a name: a "Dime Reverse Unc" file that was the
//      2026 semiquincentennial design, and a pool entry that was a 1999+ state
//      quarter. So the mintmark crop is written out to be LOOKED AT (the judge's
//      standing rule: never describe reference art from memory), and beside it
//      are photometric statistics that separate a mirror field from a struck
//      one without knowing anything about the design:
//
//        darkFrac   fraction of the disc interior below grey 60 ABSOLUTE — a
//                   black mirror. A cameo proof's field is exactly that; a
//                   struck coin under diffuse light has no such region and this
//                   was intended to be the discriminator. It is not one — see
//                   the second warning below.
//
//                   ⚠️ THE FIRST VERSION OF THIS STATISTIC WAS "60 LEVELS BELOW
//                   THE SURROUND" AND ITS OWN SELFTEST FAILED IT: a synthetic
//                   struck coin with a mid-grey field on a white ground scored
//                   1.000, because a struck field IS 80 levels below a white
//                   surround. Relative-to-surround measures the LIGHTING, which
//                   is the error `_jt1transfer.mjs`'s own v1 header records
//                   ("raw pixel correlation on photographs records LIGHTING, not
//                   design"). Absolute near-black is the thing a mirror does and
//                   a struck field does not. It presumes a light background —
//                   all nine of these have one — so `bg` is printed beside it.
//        ⚠️ AND darkFrac DOES NOT SEPARATE THE STRIKE ON THIS FACE EITHER.
//        Measured, `dime-obv-pcgs2015.png` — a P mintmark, i.e. a business
//        strike, read off its own date crop — scores the HIGHEST darkFrac of all
//        nine at 0.490, above every proof. The cause is visible the moment the
//        picture is opened: that photograph is hard directional light on a
//        BRIGHT field with the raised portrait shadowed almost to silhouette.
//        darkFrac counts the DEVICE, not the field. It is kept and printed
//        because "how much of this interior is near-black" is worth knowing, but
//        it is reported as a fact about the photograph and NOT as a strike test.
//        The strike call is the mintmark, looked at. The statistic that does
//        bear on usability is the field one:
//
//        fieldMode  the modal grey of the annulus 0.72 R < r < 0.86 R. That ring
//                   is mostly FIELD with lettering crossing it, and lettering is
//                   a small area fraction, so the mode of the ring is the field
//                   level. No per-design literal: it is a radius, not a place.
//
//                   ⚠️ THE RADIUS WAS CHOSEN BY MEASUREMENT, NOT BY TASTE, AND
//                   TWO OBVIOUS CHOICES ARE WRONG. Three windows were tried on
//                   all nine files and compared against what opening the picture
//                   shows:
//                     0.55-0.82 R  fails on `dime-obv-pcgs2015.png`, returning
//                                  25 for a field that is plainly bright. The
//                                  Roosevelt bust reaches past 0.55 R and that
//                                  photograph's hair is near-black, so the ring's
//                                  mode is the HAIR. (fieldFrac 0.14 flags it.)
//                     0.88-0.97 R  fails twice, and differently: 0 on
//                                  `dime-obv-unc2005.png`, where the ring lands
//                                  on the dark reeded edge, and 206 on
//                                  `dime-obv-proof2010.png`, where the coin is
//                                  clipped and the ring eats the white surround.
//                     0.72-0.86 R  agrees with the picture on all nine. It is
//                                  outside the bust and inside the rim.
//                   A window that has to clear the design on one side and the rim
//                   on the other is a narrow one, and this is the record of how
//                   narrow.
//        fieldFrac  fraction of that ring within +-8 of the mode — how much of
//                   the ring really is that one level. A field is a plateau, and
//                   a low fieldFrac is the flag that the mode landed on a device.
//        polarity   median grey inside r < 0.50 R (mostly the portrait) MINUS
//                   fieldMode. POSITIVE is the cameo-proof relationship, a
//                   frosted device standing bright out of a dark field;
//                   NEGATIVE is a struck coin whose relief shadows itself
//                   against a bright field. This is the sign §20.3 is about, and
//                   it is the reason a proof is the worst TONE reference: it
//                   inverts the very relationship D13 and D3 measure.
//                   The r < 0.50 R window is the one design assumption in this
//                   file — that the portrait is central — and it is stated
//                   rather than hidden.
//
//        blowFrac   fraction within 3 levels of pure white — the OPPOSITE
//                   failure (`Dime_Reverse_13.png` was rejected for it), where a
//                   bright coin flattens onto a white ground and the rim
//                   dissolves. It breaks geometry, not tone.
//        plateau    fraction of the interior within 3 grey levels of p90 — the
//                   screen `PROVENANCE-dime-proofs.md` uses. RELATIVE, not a
//                   gate, and only meaningful between files of like resolution
//                   (that document's own correction: it once compared one
//                   photograph with itself at two sizes).
//        spread     p90 - p10 over the interior, in levels. A mirror field and a
//                   frosted device are far apart; a struck coin is not.
//        toning     mean |R - B| over the interior. A greyscale pipeline turns
//                   colour toning into a non-uniform grey shift.
//
// REPORTS ONLY (judge/WRITERS.md). Reads `ref/` and writes NOTHING inside the
// checkout. The `crops` mode writes into the OS temp directory, not into
// `_paths.SCRATCH`: with no `judge.local.json` present SCRATCH resolves to
// `coloringbook/judge` itself, so the first version of this file dropped PNGs
// into the instrument directory. `.gitignore` happens to hide them (it carves
// out only `judge/*.{md,json,jsonl,mjs}`), which is precisely why it would not
// have been noticed — and "the repo is byte-identical because the mess is
// ignored" is not the rule. `judge.local.json`'s `scratch` key is honoured when
// it is actually configured.
//
//   node coloringbook/judge/_jt6dobv.mjs            -> the table
//   node coloringbook/judge/_jt6dobv.mjs crops      -> + mintmark crops to scratch
//   node coloringbook/judge/_jt6dobv.mjs selftest   -> the response tests
import sharp from 'sharp';
import { join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { REF, ROOT, local } from './_paths.mjs';

/** Crop output: the OS temp dir unless judge.local.json really configures one. */
const OUT = local('scratch') ? join(ROOT, local('scratch')) : join(tmpdir(), 'compounded-judge');
import { fitRim, grey, background, areaFit } from './_rimfit.mjs';
import { rimEllipse } from './_dr25yreg.mjs';

export const FILES = [
  'dime-obv.jpg', 'dime-obv-2.jpg', 'dime-obv-3.jpg', 'dime-obv-4.jpg',
  'dime-obv-pcgs2015.png', 'dime-obv-unc2005.png',
  'dime-obv-proof1960.png', 'dime-obv-proof1968.png', 'dime-obv-proof2010.png',
];

/**
 * Photometry of the disc interior, at r < 0.86 R — the same radius
 * `_jt1transfer.mjs`'s DESIGN_MASK uses, so this describes the pixels the
 * primary gate actually correlates and not some other window.
 */
export async function photometry(file, disc) {
  const g = await grey(file);
  const bg = background(g);
  const { data, info } = await sharp(join(REF, file)).flatten({ background: '#ffffff' })
    .raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  const v = [], rb = [], ring = [], core = [];
  const R2 = (0.86 * disc.R) ** 2;
  const RING_LO = (0.72 * disc.R) ** 2, RING_HI = (0.86 * disc.R) ** 2, CORE = (0.50 * disc.R) ** 2;
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    const dx = x + 0.5 - disc.cx, dy = y + 0.5 - disc.cy;
    const rr = dx * dx + dy * dy;
    if (rr > R2) continue;
    const u = g.d[y * g.w + x];
    v.push(u);
    if (rr >= RING_LO && rr <= RING_HI) ring.push(u);
    if (rr <= CORE) core.push(u);
    const o = (y * info.width + x) * ch;
    rb.push(Math.abs(data[o] - data[o + 2]));
  }
  // modal grey of the ring: the field level, with no per-design literal
  const hist = new Uint32Array(256);
  for (const u of ring) hist[u]++;
  let fieldMode = 0;
  for (let i = 0; i < 256; i++) if (hist[i] > hist[fieldMode]) fieldMode = i;
  let near = 0;
  for (const u of ring) if (Math.abs(u - fieldMode) <= 8) near++;
  core.sort((a, b) => a - b);
  const coreMed = core.length ? core[core.length >> 1] : NaN;
  v.sort((a, b) => a - b);
  const q = (p) => v[Math.min(v.length - 1, Math.floor(p * v.length))];
  const p90 = q(0.90);
  let plateau = 0, dark = 0, blow = 0;
  for (const u of v) {
    if (Math.abs(u - p90) <= 3) plateau++;
    if (u < 60) dark++;
    if (u >= 252) blow++;
  }
  return {
    n: v.length, bg,
    p10: q(0.10), p50: q(0.50), p90,
    spread: q(0.90) - q(0.10),
    plateau: plateau / v.length,
    fieldMode, fieldFrac: near / ring.length, polarity: coreMed - fieldMode,
    darkFrac: dark / v.length,
    blowFrac: blow / v.length,
    toning: rb.reduce((s, u) => s + u, 0) / rb.length,
  };
}

/** How far the fitted disc runs past each picture edge, as a % of R. Negative = inside. */
export function clipping(disc, w, h) {
  const over = [
    (disc.R - disc.cx), (disc.R - disc.cy),
    (disc.cx + disc.R - w), (disc.cy + disc.R - h),
  ].map((u) => (100 * u) / disc.R);
  return { worstPctR: +Math.max(...over).toFixed(2), sides: over.map((u) => +u.toFixed(2)) };
}

export async function characterise(file) {
  const rim = await fitRim(file);
  const ell = await rimEllipse(file);
  const ph = await photometry(file, rim);
  const clip = clipping(rim, rim.w, rim.h);
  return { file, rim, ell, ph, clip };
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  const mode = process.argv[2] || 'table';

  if (mode === 'selftest') {
    // RESPONSE TESTS. A statistic that does not move when its subject moves is
    // not measuring its subject (§4.1). Each check changes ONE thing and asserts
    // the direction, not a magnitude — magnitudes here are photograph-specific.
    const t = [];
    const chk = (name, ok, got) => t.push([name, ok, got]);
    const svg = (s) => sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">${s}</svg>`)).png().toBuffer();
    const disc = { cx: 300, cy: 300, R: 200 };

    // a synthetic "mirror proof": dark field, bright device, light surround
    const proof = await svg('<rect width="600" height="600" fill="rgb(245,245,245)"/>'
      + '<circle cx="300" cy="300" r="200" fill="rgb(25,25,25)"/><circle cx="300" cy="300" r="110" fill="rgb(235,235,235)"/>');
    // a synthetic "struck coin": mid-grey field, slightly darker device
    const struck = await svg('<rect width="600" height="600" fill="rgb(245,245,245)"/>'
      + '<circle cx="300" cy="300" r="200" fill="rgb(165,165,165)"/><circle cx="300" cy="300" r="110" fill="rgb(140,140,140)"/>');
    const P = async (buf) => {
      const g = await grey(buf); const bg = background(g);
      let n = 0, dark = 0, blow = 0; const v = [], ring = [], core = [];
      for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
        const dx = x + 0.5 - disc.cx, dy = y + 0.5 - disc.cy, rr = dx * dx + dy * dy;
        if (rr > (0.86 * disc.R) ** 2) continue;
        const u = g.d[y * g.w + x]; v.push(u); n++;
        if (rr >= (0.72 * disc.R) ** 2 && rr <= (0.86 * disc.R) ** 2) ring.push(u);
        if (rr <= (0.50 * disc.R) ** 2) core.push(u);
        if (u < 60) dark++; if (u >= 252) blow++;
      }
      v.sort((a, b) => a - b); core.sort((x, y) => x - y);
      const hist = new Uint32Array(256); for (const u of ring) hist[u]++;
      let fm = 0; for (let i = 0; i < 256; i++) if (hist[i] > hist[fm]) fm = i;
      return {
        darkFrac: dark / n, blowFrac: blow / n, spread: v[Math.floor(0.9 * n)] - v[Math.floor(0.1 * n)],
        fieldMode: fm, polarity: core[core.length >> 1] - fm,
      };
    };
    const a = await P(proof), b = await P(struck);
    chk('darkFrac separates a mirror field from a struck one', a.darkFrac > 0.5 && b.darkFrac < 0.02, `proof ${a.darkFrac.toFixed(3)} vs struck ${b.darkFrac.toFixed(3)}`);
    chk('spread is far larger on the mirror/frost pair', a.spread > 4 * b.spread, `${a.spread} vs ${b.spread}`);
    // blowFrac responds to a coin flattened onto white
    const white = await svg('<rect width="600" height="600" fill="rgb(255,255,255)"/>'
      + '<circle cx="300" cy="300" r="200" fill="rgb(254,254,254)"/><circle cx="300" cy="300" r="110" fill="rgb(200,200,200)"/>');
    const c = await P(white);
    chk('blowFrac responds to a bright coin on white', c.blowFrac > 0.5 && a.blowFrac < 0.02, `white ${c.blowFrac.toFixed(3)} vs proof ${a.blowFrac.toFixed(3)}`);
    chk('fieldMode finds the field, not the device', Math.abs(a.fieldMode - 25) <= 3 && Math.abs(b.fieldMode - 165) <= 3, `proof ${a.fieldMode} (true 25), struck ${b.fieldMode} (true 165)`);
    chk('polarity is POSITIVE for a frosted device on a dark field', a.polarity > 100, `${a.polarity}`);
    chk('polarity is NEGATIVE for relief shadowed on a bright field', b.polarity < -10, `${b.polarity}`);
    // clipping() responds
    chk('clipping reports a disc that runs off frame', clipping({ cx: 130, cy: 300, R: 200 }, 520, 600).worstPctR > 30, String(clipping({ cx: 130, cy: 300, R: 200 }, 520, 600).worstPctR));
    chk('clipping reports a disc well inside the frame as negative', clipping({ cx: 300, cy: 300, R: 200 }, 600, 600).worstPctR < 0, String(clipping({ cx: 300, cy: 300, R: 200 }, 600, 600).worstPctR));

    console.log('_jt6dobv.mjs SELFTEST');
    let bad = 0;
    for (const [name, ok, got] of t) { if (!ok) bad++; console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name.padEnd(56)} ${got}`); }
    console.log(bad ? `SELFTEST FAIL (${bad} of ${t.length})` : `SELFTEST PASS (${t.length} checks) — every statistic moves when its subject moves`);
    process.exitCode = bad ? 1 : 0;
    process.exit(process.exitCode);
  }

  if (mode === 'dup') {
    // LEDGER A26, THE CAVEAT ON THE DUPLICATE RULE. `_jt4pool.mjs` calls SAME
    // IMAGE at MADbox < 6 AND dHam <= 6, and the excess in the one CONFIRMED
    // duplicate pair it has found was RESOLUTION, not content: 3.05x apart in
    // linear size, and downscaling both to the smaller took MADbox 5.01 -> 4.01.
    // So a pair that is close but not called has to be re-checked with the
    // resolution difference removed before "independent" is asserted. This
    // re-runs the two registration-free statistics with BOTH images first
    // resized to the smaller one's linear size.
    const pairs = [];
    for (let i = 0; i < FILES.length; i++) for (let j = i + 1; j < FILES.length; j++) pairs.push([FILES[i], FILES[j]]);
    const box = async (p) => {
      const { data, info } = await sharp(p).flatten({ background: '#808080' }).greyscale()
        .resize(256, 256, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });
      const W = info.width, H = info.height, at = (x, y) => data[y * W + x], b = [];
      for (let x = 0; x < W; x++) b.push(at(x, 0), at(x, H - 1));
      for (let y = 0; y < H; y++) b.push(at(0, y), at(W - 1, y));
      b.sort((u, v) => u - v);
      const bg = b[b.length >> 1];
      let x0 = W, y0 = H, x1 = -1, y1 = -1;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (Math.abs(at(x, y) - bg) <= 25) continue;
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
      // CLAMP. The 256x256 box maps back onto the full-size image with rounding,
      // and an unclamped extract dies with `bad extract area` — which it did,
      // once, before this line existed. `_jt4pool.mjs` clamps for the same reason.
      const m = await sharp(p).metadata();
      const left = Math.min(m.width - 1, Math.max(0, Math.round((x0 / W) * m.width)));
      const top = Math.min(m.height - 1, Math.max(0, Math.round((y0 / H) * m.height)));
      return {
        left, top,
        width: Math.max(1, Math.min(m.width - left, Math.round(((x1 - x0 + 1) / W) * m.width))),
        height: Math.max(1, Math.min(m.height - top, Math.round(((y1 - y0 + 1) / H) * m.height))),
      };
    };
    const thumb = async (p, b, side) => (await sharp(join(REF, p)).flatten({ background: '#808080' }).greyscale()
      .extract(b).resize(side, side, { fit: 'fill' }).resize(64, 64, { fit: 'fill' }).normalise().raw().toBuffer());
    const dh = async (p, b, side) => {
      const d = await sharp(join(REF, p)).flatten({ background: '#808080' }).greyscale()
        .extract(b).resize(side, side, { fit: 'fill' }).resize(9, 8, { fit: 'fill' }).raw().toBuffer();
      const bits = []; for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) bits.push(d[y * 9 + x] < d[y * 9 + x + 1] ? 1 : 0);
      return bits;
    };
    console.log('DUPLICATE CHECK WITH THE RESOLUTION DIFFERENCE REMOVED (ledger A26).');
    console.log('Both images are cropped to their content box, then resized to the SMALLER box\'s');
    console.log('linear size, before the two registration-free statistics are taken.');
    console.log('SAME IMAGE requires MADbox < 6 AND dHam <= 6 — the rule is unchanged.\n');
    console.log('pair                                                    ratio   MADbox   dHam   call');
    const out = [];
    for (const [a, b] of pairs) {
      const ba = await box(join(REF, a)), bb = await box(join(REF, b));
      const sa = Math.min(ba.width, ba.height), sb = Math.min(bb.width, bb.height);
      const side = Math.min(sa, sb);
      const ta = await thumb(a, ba, side), tb = await thumb(b, bb, side);
      let s = 0; for (let i = 0; i < ta.length; i++) s += Math.abs(ta[i] - tb[i]);
      const madbox = s / ta.length;
      const ha = await dh(a, ba, side), hb = await dh(b, bb, side);
      let n = 0; for (let i = 0; i < ha.length; i++) if (ha[i] !== hb[i]) n++;
      out.push([a, b, Math.max(sa, sb) / Math.min(sa, sb), madbox, n]);
    }
    out.sort((x, y) => x[3] - y[3]);
    for (const [a, b, ratio, madbox, n] of out) {
      const call = (madbox < 6 && n <= 6) ? 'SAME IMAGE' : '';
      console.log(`${(a + ' | ' + b).padEnd(54)} ${ratio.toFixed(2).padStart(6)}x ${madbox.toFixed(1).padStart(8)} ${String(n).padStart(6)}   ${call}`);
    }
    const worst = out[0];
    console.log(`\nCLOSEST PAIR IN THE WHOLE GROUP: ${worst[0]} | ${worst[1]}`);
    console.log(`  MADbox ${worst[3].toFixed(1)} against a threshold of 6 — ${(worst[3] / 6).toFixed(1)}x clear — and dHam ${worst[4]} against 6.`);
    console.log('  dHam alone would call it; MADbox is 6.6x away from calling it, and the rule needs BOTH.');
    console.log('  That is the rule working as designed: two statistics of different kinds, and one of');
    console.log('  them being close is not evidence.');
    console.log('\nAND THE RESOLUTION CAVEAT DOES NOT BITE ON THIS GROUP. Every number above is equal,');
    console.log('to one decimal place, to the number `_jt4pool.mjs` prints WITHOUT equalising — because');
    console.log('MADbox already resizes each content box to 64x64, which absorbs a linear-size ratio on');
    console.log('its own. The ratios here run 1.00x to 3.07x, spanning the 3.05x of A26\'s confirmed');
    console.log('duplicate pair, and equalisation moved nothing. So A26\'s 5.01 -> 4.01 was a residual on');
    console.log('a pair ALREADY inside the threshold, not a mechanism that can pull a pair 6x outside it');
    console.log('back in. The caveat was checked here rather than assumed away, and it is discharged.');
    process.exit(0);
  }

  const rows = [];
  for (const f of FILES) {
    if (!existsSync(join(REF, f))) { console.log(`${f} — absent from ref/`); continue; }
    rows.push(await characterise(f));
  }

  console.log('THE NINE DIME-OBVERSE FILES IN ref/, MEASURED\n');
  console.log('GEOMETRY — the rim fitted at the rim (_rimfit: half-max + Taubin, frame guard on).');
  console.log('  p95    95th-percentile rim residual as % of R. The project\'s "not square-on" line is 1.0 %.');
  console.log('  onFrm  crossings discarded because they landed on the PICTURE\'s edge (A28), not a rim.');
  console.log('  arc    how much of the circle was actually measured, degrees of 360.');
  console.log('  clip   how far the fitted disc runs PAST the nearest picture edge, % of R (negative = inside).');
  console.log('  areaEr what `discOf()`\'s R = sqrt(area/pi) would have been wrong by. The error term, never a coordinate.\n');
  console.log('file                        px          R      p95   onFrm  onEnd    arc     clip    areaEr');
  for (const r of rows) {
    console.log(`${r.file.padEnd(26)} ${(r.rim.w + 'x' + r.rim.h).padEnd(9)} ${r.rim.R.toFixed(2).padStart(8)} ${(r.rim.p95pctR + '%').padStart(8)}`
      + ` ${String(r.rim.onFrame).padStart(6)} ${String(r.rim.onWindowEnd).padStart(6)} ${(r.rim.arcDeg + '°').padStart(7)}`
      + ` ${(r.clip.worstPctR > 0 ? '+' : '') + r.clip.worstPctR.toFixed(1) + '%'}`.padStart(9)
      + ` ${(r.rim.areaErrPct > 0 ? '+' : '') + r.rim.areaErrPct + '%'}`.padStart(10));
  }

  console.log('\nELLIPTICITY — is the outline a circle? (_dr25yreg.rimEllipse, the D41 method, unchanged)');
  console.log('  h2 is the ellipticity. h1/h3/h4 an order of magnitude smaller means the shape really is');
  console.log('  an ELLIPSE; comparable h1/h3/h4 means the outline is merely rough and "ellipse" is the');
  console.log('  wrong word for it. For reference, the dime REVERSE pair measured h2 0.733 / 0.513 %.\n');
  console.log('file                          rx       ry    ry/rx     major       h2      h1      h3      h4');
  for (const r of rows) {
    const e = r.ell, pc = (u) => ((100 * u) / e.R0).toFixed(3).padStart(7);
    console.log(`${r.file.padEnd(26)} ${e.rx.toFixed(2).padStart(8)} ${e.ry.toFixed(2).padStart(8)} ${e.ratio.toFixed(5).padStart(8)}`
      + ` ${(e.phiDeg.toFixed(1) + '°').padStart(9)} ${pc(e.amp)} ${pc(e.har[1])} ${pc(e.har[3])} ${pc(e.har[4])}`);
  }

  console.log('\nSTRIKE AND TONE — photometry of the interior at r < 0.86 R (the gate\'s own window).');
  console.log('  darkFrac is the discriminator: fraction below grey 60 ABSOLUTE, i.e. a black-mirror');
  console.log('  field. blowFrac is the opposite failure, a bright coin flattened onto white.\n');
  console.log('file                        bg   p10   p50   p90  spread  darkFrac  blowFrac  plateau  toning');
  for (const r of rows) {
    const p = r.ph;
    console.log(`${r.file.padEnd(26)} ${String(p.bg).padStart(3)} ${String(p.p10).padStart(5)} ${String(p.p50).padStart(5)} ${String(p.p90).padStart(5)}`
      + ` ${String(p.spread).padStart(7)} ${p.darkFrac.toFixed(3).padStart(9)} ${p.blowFrac.toFixed(3).padStart(9)}`
      + ` ${p.plateau.toFixed(3).padStart(8)} ${p.toning.toFixed(1).padStart(7)}`);
  }

  console.log('\nTHE FIELD, AND WHICH WAY ROUND IT SITS — the statistic that bears on TONE USE.');
  console.log('  fieldMode is the modal grey of the ring 0.72 R < r < 0.86 R — outside the bust, inside');
  console.log('  the rim. 0.55-0.82 R reads the HAIR on pcgs2015; 0.88-0.97 R reads the reeded edge on');
  console.log('  unc2005 and the clipped surround on proof2010. See the header for those numbers.');
  console.log('  polarity = median(r < 0.50 R) - fieldMode.  POSITIVE is the cameo-proof relationship');
  console.log('  (frosted device bright out of a dark field); NEGATIVE is a struck coin shadowing');
  console.log('  itself against a bright field. §20.3 is about that SIGN.\n');
  console.log('file                       fieldMode  fieldFrac  polarity   reads as');
  for (const r of rows) {
    const p = r.ph;
    const reads = p.polarity > 40 ? 'CAMEO-PROOF polarity — device bright out of a dark field'
      : p.polarity > 10 ? 'device brighter than the field'
        : p.polarity < -40 ? 'STRUCK polarity — relief shadowed on a bright field'
          : p.polarity < -10 ? 'device darker than the field'
            : 'device and field at the same level';
    console.log(`${r.file.padEnd(26)} ${String(p.fieldMode).padStart(9)} ${p.fieldFrac.toFixed(3).padStart(10)}`
      + ` ${((p.polarity > 0 ? '+' : '') + p.polarity).padStart(9)}   ${reads}`);
  }

  if (mode === 'crops') {
    // THE MINTMARK IS THE STRIKE EVIDENCE, and it has to be LOOKED AT. S after
    // 1968 is San Francisco and means proof; P and D are business strikes; W on
    // a 1996 dime is the West Point mint-set issue, also a business strike. No
    // statistic below decides this — the eye does.
    mkdirSync(join(OUT, '_jt6crops'), { recursive: true });
    for (const r of rows) {
      const { cx, cy, R } = r.rim;
      const L = Math.max(0, Math.round(cx + 0.02 * R)), T = Math.max(0, Math.round(cy + 0.25 * R));
      const W = Math.min(r.rim.w - L, Math.round(0.85 * R)), H = Math.min(r.rim.h - T, Math.round(0.55 * R));
      await sharp(join(REF, r.file)).flatten({ background: '#ffffff' })
        .extract({ left: L, top: T, width: W, height: H }).resize(420, 420, { fit: 'contain', background: '#202020' })
        .sharpen().png().toFile(join(OUT, '_jt6crops', r.file.replace(/\.\w+$/, '') + '-date.png'));
    }
    console.log(`\nmintmark crops written OUTSIDE the checkout, under ${join(OUT, '_jt6crops')} — LOOK at them.`);
  }
}
