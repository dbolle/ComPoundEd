// SPECIALIST INSTRUMENT — round 1, D5 lettering. OUR OWN legend geometry,
// parsed out of the SVG `coinSVG()` actually emits. Nothing here reads a
// photograph and nothing here computes a locus: it is the "ours" column only.
// The judge re-derives every number; this exists so the specialist can see what
// it is doing while it works (COIN-JUDGE.md §1: "a working instrument, not
// evidence").
//
// ── WHY IT IS NOT _jp8ours.mjs ─────────────────────────────────────────────
// `_jp8ours.mjs` reports `cap = rOuter - rInner` of the glyph BOX that
// `textMarks()` in `_jq8contain-v2.mjs` builds, and that box runs from
// `-0.72*size` to `+0.06*size` about the baseline. Its "cap" is therefore
// 0.78*size — cap height PLUS a descender allowance — while the reference cap
// heights in the round-0 scorecards are baseline-to-cap-top read off a
// photograph, with no descender in them. Round 0 published our cap through
// three different models without saying so:
//
//     penny, dime scorecards   0.78 * size   (_jp8ours, glyph box incl. desc)
//     nickel scorecard         0.72 * size   (textMarks' cap term)
//     quarter scorecard        0.71 * size   (round 4's own literal)
//
// 0.78 against 0.71 is 9.9% — two thirds of the ±15% D5-cap gate — so the same
// drawing scores differently depending on which coin's judge measured it. This
// file reports ALL THREE, plus a fourth measured empirically:
//
//     MEASURED, this box, this font stack, rasterised through sharp/librsvg:
//     `H`, `E` and `LIBERTY` ink from the baseline to the cap top is
//     0.7300 * font-size; round letters (`O`) overshoot to 0.7425 and dip
//     0.0125 below the baseline. Flat-topped caps are the right ones to
//     measure — an overshoot is an optical correction, not cap height.
//     (`_jl1font.mjs` is the probe; it prints its own numbers.)
//
// So the truth for this font is 0.730, the judge's 0.72 model is 1.4% low, and
// the 0.78 model is 6.8% high. Reported, not resolved: §1.1 says a specialist
// names an instrument fault and does not fix it.
//
// ── §4 RESPONSE TEST ───────────────────────────────────────────────────────
// RESPONSE=1 re-loads the art with one legend's size constant multiplied by
// 1.5 and confirms every cap model and the angular span move by the expected
// factor, and that the untouched legends are bit-identical.
//
// ── §4.1 NULL TEST ─────────────────────────────────────────────────────────
// This instrument does not SEARCH: it parses the emitted string and reports
// what is in it. It has no search window and therefore cannot return a search
// bound. Its analogous failure is "found no glyphs", which is printed as
// `NO LETTERING EMITTED` and is a fact about the drawing, not a non-answer.
// The bound-shaped quantity it does own is the glyph grouping tolerance, and
// grouping is by the emitted `<g>` element — exact, not clustered — so there
// is no tolerance to land on. Both are printed.
//
// ── §4.2 SELECTION TEST ────────────────────────────────────────────────────
// Every `<g font-size>` group and every flat `<text>` in the emitted string is
// printed, on every coin and both sides, including the ones the round is not
// about. Nothing is selected.
//
// Run: node coloringbook/judge/_jl1cap.mjs            (all coins, all sizes)
//      COIN=dime SIZES=84,190 node …
//      RESPONSE=1 node …
//      ART=/abs/path/to/coins.js node …
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCoins } from './_jq8contain-v2.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');

// The four cap-height models, all reported side by side. `measured` is the one
// this file believes; the other three are the ones round 0's scorecards used.
export const CAP_MODELS = { measured: 0.730, judge72: 0.72, quarter71: 0.71, box78: 0.78 };
// `textMarks()`'s glyph advance, kept so the "ink span" here is the same
// quantity `_jp8ours.mjs` printed.
const ADV_BOX = 0.62;

const norm = (a) => { let d = a; while (d < 0) d += 360; while (d >= 360) d -= 360; return d; };

// Parse every legend out of an emitted coin SVG.
//   arced   one `<g font-family… font-size=S …>` per arcText() call, one
//           `<text transform="translate(x y) rotate(d)">C</text>` per glyph.
//   flat    a bare `<text x y font-size=S>WORD</text>` per flatText() call.
export function legendsOf(svg) {
  const out = [];
  for (const g of svg.matchAll(/<g ([^>]*font-size="([\d.]+)"[^>]*)>([\s\S]*?)<\/g>/g)) {
    const size = Number(g[2]);
    const glyphs = [];
    for (const t of g[3].matchAll(/<text transform="translate\(([-\d.]+) ([-\d.]+)\) rotate\(([-\d.]+)\)(?: scale\(([-\d.]+) 1\))?">([^<]*)<\/text>/g)) {
      const x = Number(t[1]), y = Number(t[2]);
      glyphs.push({ ch: t[5], x, y, rot: Number(t[3]), cond: t[4] === undefined ? 1 : Number(t[4]),
        r: Math.hypot(x - 50, y - 50), a: norm((Math.atan2(y - 50, x - 50) * 180) / Math.PI) });
    }
    if (glyphs.length) out.push({ kind: 'arc', size, word: glyphs.map((q) => q.ch).join(''), glyphs });
  }
  for (const t of svg.matchAll(/<text x="([-\d.]+)" y="([-\d.]+)"[^>]*font-size="([\d.]+)"[^>]*>([^<]*)<\/text>/g)) {
    out.push({ kind: 'flat', size: Number(t[3]), word: t[4], x: Number(t[1]), y: Number(t[2]) });
  }
  // valueText() draws the big 10¢ scaffold with its own <text>; it is not a
  // legend. It is still printed (§4.2) but tagged, never silently dropped.
  return out;
}

// Geometry of one arced legend. Every quantity is stated in the note beside it.
export function geomOf(L) {
  if (L.kind !== 'arc') return null;
  const rs = L.glyphs.map((q) => q.r);
  const baseline = rs.reduce((a, b) => a + b, 0) / rs.length;
  // angular span, centre-to-centre of the first and last glyph — the convention
  // _jq4band.json's cross-check uses ("24 characters = 23 advances over ~170
  // deg"), and the one round 4 tuned `tadv`/`badv` against.
  const as = L.glyphs.map((q) => q.a);
  let unwrapped = [as[0]];
  for (let i = 1; i < as.length; i++) {
    let d = as[i] - as[i - 1];
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    unwrapped.push(unwrapped[i - 1] + d);
  }
  const spanC2C = Math.abs(unwrapped[unwrapped.length - 1] - unwrapped[0]);
  // "ink span": c2c plus one glyph box, the convention `_jp8ours.mjs` printed
  // for the penny and the dime scorecards.
  const capBox = CAP_MODELS.box78 * L.size;
  const rMidBox = ((baseline - 0.06 * L.size) + Math.hypot(baseline + 0.72 * L.size, (ADV_BOX * L.size) / 2)) / 2;
  const spanInk = spanC2C + (((ADV_BOX * L.size) / rMidBox) * 180) / Math.PI;
  const caps = Object.fromEntries(Object.entries(CAP_MODELS).map(([k, v]) => [k, v * L.size]));
  // D8: the outermost corner of the glyph box `textMarks()` builds, which is
  // exactly what the containment eval scores — computed through the SAME
  // transform the SVG carries, not from a formula. It was a formula in the
  // first draft of this file (`hypot(r + 0.72*size, adv/2)`) and that is only
  // right for a TOP legend: at 90° with `rev` the glyph's "up" points at the
  // centre, so the outermost corner is the DESCENDER, not the cap, and the
  // formula overstated every bottom legend by a whole cap height.
  const cap = 0.72 * L.size, desc = 0.06 * L.size;
  let maxR = 0, rIn = Infinity;
  for (const q of L.glyphs) {
    const half = (ADV_BOX * L.size * q.cond) / 2;
    const th = (q.rot * Math.PI) / 180, c = Math.cos(th), s = Math.sin(th);
    for (const [px, py] of [[-half, -cap], [half, -cap], [half, desc], [-half, desc]]) {
      const gx = q.x + px * c - py * s, gy = q.y + px * s + py * c;
      const r = Math.hypot(gx - 50, gy - 50);
      if (r > maxR) maxR = r;
      if (r < rIn) rIn = r;
    }
  }
  return { baseline, spanC2C, spanInk, caps, capBox, maxR, rInner: rIn, cond: L.glyphs[0].cond, n: L.glyphs.length };
}

const SIZES = (process.env.SIZES || '26,38,44,54,76,84,120,190,380').split(',').map(Number);
// `tierOf` IS GONE (ledger A31). It labelled every row `full` / `mid` / `icon`
// from the loop variable alone — it never consulted the art — and v1.94.0
// removed `tier` from `src/art/coins.js` entirely, so the label named a
// distinction the drawing does not make. Three rows tagged `icon`, `mid` and
// `full` invite the reader to compare tiers; what actually varies down this
// table is SIZE, continuously, through `sw()` and `reliefOff()`. The size is
// already in the row and it is the honest column.

export async function table(mod, ids, sizes = SIZES) {
  const rows = [];
  for (const id of ids) {
    for (const side of ['obverse', 'reverse']) {
      for (const size of sizes) {
        const svg = mod.coinSVG(id, size, { side });
        const Ls = legendsOf(svg);
        rows.push({ id, side, size, legends: Ls.map((L) => ({ L, g: geomOf(L) })) });
      }
    }
  }
  return rows;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const artPath = process.env.ART || join(ROOT, 'src/art/coins.js');
  const mod = await loadCoins(readFileSync(artPath, 'utf8'));
  const ids = (process.env.COIN ? [process.env.COIN] : mod.COIN_IDS.filter((i) => i !== 'buck'));

  console.log(`ART = ${artPath}`);
  console.log('§4.1 null test — this instrument has NO search window. Grouping is by the emitted <g>, so it has no clustering tolerance either.');
  console.log('§4.2 selection — every <g font-size> group and every flat <text> is printed below; nothing is chosen.');
  console.log(`cap models: measured ${CAP_MODELS.measured} (this font, rasterised) | judge 0.72 | quarter-r4 0.71 | glyph-box(+desc) 0.78\n`);

  for (const r of await table(mod, ids)) {
    const hdr = `${r.id.padEnd(8)} ${r.side.padEnd(8)} ${String(r.size).padStart(4)}px`;
    if (!r.legends.length) { console.log(`${hdr}  NO LETTERING EMITTED`); continue; }
    for (const { L, g } of r.legends) {
      if (!g) { console.log(`${hdr}  flat  "${L.word}" size ${L.size} at (${L.x},${L.y})  cap ${(CAP_MODELS.measured * L.size).toFixed(2)}`); continue; }
      console.log(
        `${hdr}  arc   "${L.word}" size ${L.size}  baseline r ${g.baseline.toFixed(2)}  cap ${g.caps.measured.toFixed(2)}`
        + ` [.72 ${g.caps.judge72.toFixed(2)} | .71 ${g.caps.quarter71.toFixed(2)} | .78 ${g.caps.box78.toFixed(2)}]`
        + `  span c2c ${g.spanC2C.toFixed(1)} / ink ${g.spanInk.toFixed(1)} deg  cond ${g.cond.toFixed(2)}  band ${g.rInner.toFixed(2)}..${g.maxR.toFixed(2)}  maxGlyphR ${g.maxR.toFixed(3)}`
      );
    }
  }

  if (process.env.RESPONSE) {
    console.log('\n=== §4 RESPONSE TEST ===');
    const code = readFileSync(artPath, 'utf8');
    // ── THIS ANCHOR WENT STALE AND THE RESPONSE TEST STOPPED RUNNING (A30).
    //
    // It read `size: 7.6, centre: 206`, which was the dime obverse LIBERTY when
    // this file was written. The dime's LIBERTY is now `size: 10.56,
    // centre: 206, rOff: 3.64, adv: 0.7897` (src/art/coins.js, in the `dime:`
    // block), and `size: 7.6, centre: 332` — the string the old anchor half
    // matched — belongs to the NICKEL. So the anchor named no live text, the
    // guard threw, and `RESPONSE=1` has not run since the dime's type was
    // resized. It failed closed rather than open, which is better, and it still
    // meant the instrument's ability to move was unverified for as long as
    // nobody ran it. That is now checked by `tests/judge-anchors.spec.js` in
    // `npm test` rather than by hoping somebody runs this file.
    //
    // The anchor must match EXACTLY ONCE — `centre: 206` alone appears on more
    // than one coin — and the substitution must be shown to have changed both
    // the source and the emitted SVG before any ratio below is believed.
    const anchor = "main: { kind: 'arc', text: 'LIBERTY', size: 10.56, centre: 206, rOff: 3.64, adv: 0.7897 }";
    const hits = code.split(anchor).length - 1;
    if (hits !== 1) throw new Error(`RESPONSE anchor matches ${hits} times, expected exactly 1 — re-anchor before trusting this instrument`);
    const swapped = code.replace(anchor, "main: { kind: 'arc', text: 'LIBERTY', size: 15.84, centre: 206, rOff: 3.64, adv: 0.7897 }");
    if (swapped === code) throw new Error('RESPONSE substitution did not change the source');
    const bumped = await loadCoins(swapped);
    if (bumped.coinSVG('dime', 190, { side: 'obverse' }) === mod.coinSVG('dime', 190, { side: 'obverse' }))
      throw new Error('RESPONSE substitution never reached the render — the emitted SVG is byte-identical');
    const pick = (rows, id, side, word) => rows.find((x) => x.id === id && x.side === side && x.size === 190)
      .legends.find((x) => x.L.word === word);
    const A = await table(mod, ['dime', 'quarter'], [190]);
    const B = await table(bumped, ['dime', 'quarter'], [190]);
    const a = pick(A, 'dime', 'obverse', 'LIBERTY'), b = pick(B, 'dime', 'obverse', 'LIBERTY');
    console.log(`  dime obverse LIBERTY size 10.56 -> 15.84 (x1.500)`);
    for (const k of Object.keys(CAP_MODELS)) {
      console.log(`    cap[${k}] ${a.g.caps[k].toFixed(3)} -> ${b.g.caps[k].toFixed(3)}   x${(b.g.caps[k] / a.g.caps[k]).toFixed(4)}`);
    }
    console.log(`    span c2c ${a.g.spanC2C.toFixed(2)} -> ${b.g.spanC2C.toFixed(2)}   x${(b.g.spanC2C / a.g.spanC2C).toFixed(4)}`
      + `   (expected: the baseline moves in too, so the span grows by more than 1.5)`);
    const ok = Math.abs(b.g.caps.measured / a.g.caps.measured - 1.5) < 1e-9 && b.g.spanC2C > a.g.spanC2C * 1.4;
    // and the control: an untouched legend on an untouched coin must not move
    const c = pick(A, 'quarter', 'reverse', 'UNITEDSTATESOFAMERICA');
    const d = pick(B, 'quarter', 'reverse', 'UNITEDSTATESOFAMERICA');
    const same = c.g.baseline === d.g.baseline && c.g.spanC2C === d.g.spanC2C && c.g.caps.measured === d.g.caps.measured;
    console.log(`  CONTROL quarter reverse UNITED STATES OF AMERICA: ${same ? 'bit-identical' : '*** MOVED — the parse is coupled ***'}`);
    console.log(`  RESPONSE TEST ${ok && same ? 'PASS' : 'FAIL'}`);
  }
}
