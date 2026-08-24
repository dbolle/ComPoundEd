// D8 — containment, CORRECTED INSTRUMENT (round 1).
//
// ── WHY THERE IS A v2 ──────────────────────────────────────────────────────
// `_jq8contain.mjs` (v1, round 0) identified the field circle with:
//
//     for (const mk of all) if (centred circle && r > 35) return r;
//
// i.e. the FIRST centred circle over r 35 in document order. On the quarter
// and the dime the blank is a reeded <path>, so the first such circle really
// is the field circle and v1 is right. On the penny and the nickel the blank
// is `<circle cx="50" cy="50" r="47">` — it is emitted first, and v1 returned
// 47. Those two coins were therefore scored against a circle 6.5 units larger
// than the one they are drawn inside (40.5 mid / 41 full / 42.5 icon).
//
// The tell was printed in round 0's own output and I did not read it: v1's
// `% outside field` and `% outside disc` columns (the latter hardcoded at 47)
// came out bit-identical on exactly those two coins. §4 of the judge spec
// says in as many words that two bit-identical answers from two different
// inputs is not agreement. It was a search-bound-shaped failure and it was
// caught by a SPECIALIST, not by me.
//
// ── THE CORRECTION ─────────────────────────────────────────────────────────
// The field circle is the SMALLEST centred circle over r 35, and the choice
// is now audited rather than assumed: every qualifying radius is collected,
// printed beside the result, and the run throws if the non-blank candidates
// disagree with each other. Enumerated over 5 coins x 2 sides x 9 sizes, the
// full candidate set is {47 (blank, penny+nickel only), 42.5|40.5|41 fill,
// 42.5|40.5|41 ring} — no motif anywhere draws a centred circle over r 35, so
// "smallest" and "not the blank" pick the same circle. Both are checked.
//
// Everything else is v1 unchanged, deliberately, so the numbers are
// comparable: same exclusions (blank / field pair / specular arc), same glyph
// cap-box model, same lenOutside sampling.
//
// Run: node coloringbook/judge/_jq8contain-v2.mjs [srcModule]
//      COIN=penny  ... -> full per-tier table for one coin
//      RESPONSE=1  ... -> response + null test (the device shoved out of the
//                         field; repaired 2026-08-24, see the block at the end)
//      SELFTEST=1  ... -> the field-radius regression that v1 fails
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marks, lenOutside, apply, parseTransform, mul } from './_jqgeom.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
export const SIZES = [26, 38, 44, 54, 76, 84, 120, 190, 380];
export const tierOf = (s) => (s >= 76 ? 'full' : s >= 44 ? 'mid' : 'icon');

// Load an arbitrary revision of coins.js (e.g. `git show HEAD:src/art/coins.js`)
// as a module, by rewriting its one relative import to an absolute path.
export async function loadCoins(source) {
  const code = source.replace(/from '\.\.\/engine\/money\.js'/, `from '${join(ROOT, 'src/engine/money.js')}'`);
  const dir = mkdtempSync(join(tmpdir(), 'jq8v2-'));
  const p = join(dir, 'coins.js');
  writeFileSync(p, code);
  return import('file://' + p);
}

// glyph boxes for <text transform="translate(x y) rotate(d)">C</text>  [v1, verbatim]
export function textMarks(svg) {
  const out = [];
  let size = null;
  for (const m of svg.matchAll(/<g[^>]*font-size="([\d.]+)"[^>]*>|<text([^>]*)>([^<]*)<\/text>/g)) {
    if (m[1]) { size = Number(m[1]); continue; }
    const at = m[2] || '';
    const fs = at.match(/font-size="([\d.]+)"/);
    const s = fs ? Number(fs[1]) : size;
    if (!s) continue;
    const tr = at.match(/transform="([^"]*)"/);
    const xa = at.match(/\sx="([-\d.]+)"/), ya = at.match(/\sy="([-\d.]+)"/);
    let M = tr ? parseTransform(tr[1]) : [1, 0, 0, 1, 0, 0];
    if (xa) M = mul(M, [1, 0, 0, 1, Number(xa[1]), Number(ya ? ya[1] : 0)]);
    const adv = s * 0.62, cap = s * 0.72, desc = s * 0.06;
    const box = [{ x: -adv / 2, y: -cap }, { x: adv / 2, y: -cap }, { x: adv / 2, y: desc }, { x: -adv / 2, y: desc }, { x: -adv / 2, y: -cap }];
    out.push({ el: 'text', ch: m[3], size: s, pts: box.map((p) => apply(M, p)), isRegion: true, isStroke: false, fill: 'text' });
  }
  return out;
}

const isCentredCircle = (mk) =>
  mk.el === 'circle'
  && Math.abs(mk.bbox.x0 + mk.bbox.x1 - 100) < 1e-6
  && Math.abs(mk.bbox.y0 + mk.bbox.y1 - 100) < 1e-6
  && (mk.bbox.x1 - mk.bbox.x0) / 2 > 35;

function classify(mk, i) {
  if (i === 0) return 'blank';
  if (isCentredCircle(mk)) return mk.isStroke ? 'field-ring' : 'field';
  if (mk.stroke === '#ffffff' && Math.abs(mk.opacity - 0.26) < 1e-6) return 'specular';
  return 'drawn';
}

// ── the corrected field-radius reader ──────────────────────────────────────
// Returns { r, candidates, blank } so the caller can print what was rejected.
export function fieldRadius(all) {
  const cands = [];
  for (let i = 0; i < all.length; i++) {
    const mk = all[i];
    if (!isCentredCircle(mk)) continue;
    cands.push({ i, r: (mk.bbox.x1 - mk.bbox.x0) / 2, blank: i === 0, stroke: mk.isStroke });
  }
  if (!cands.length) throw new Error('no centred circle over r 35 — the parse is wrong, D8 is UNTRUSTED');
  const nonBlank = cands.filter((c) => !c.blank);
  if (!nonBlank.length) throw new Error('only the blank qualifies — no field circle, D8 is UNTRUSTED');
  const rs = [...new Set(nonBlank.map((c) => c.r))];
  if (rs.length !== 1) {
    throw new Error(`non-blank centred circles disagree: ${rs.join(', ')} — D8 is UNTRUSTED`);
  }
  const smallest = Math.min(...cands.map((c) => c.r));
  if (Math.abs(smallest - rs[0]) > 1e-9) {
    throw new Error(`"smallest" and "not the blank" disagree (${smallest} vs ${rs[0]}) — D8 is UNTRUSTED`);
  }
  return { r: rs[0], candidates: cands.map((c) => (c.blank ? `${c.r}(blank,rejected)` : `${c.r}${c.stroke ? '(ring)' : '(fill)'}`)) };
}

// ── depth partition ────────────────────────────────────────────────────────
// The gate as stated in round 0 is "0.00% of drawn length outside the field
// circle", with no depth term, and it therefore cannot rank. Measured on the
// penny obverse, the entire 7.93% is the shoulder drape's closing arc
// `A 41 41 ... 76.63 81.73`, whose ENDPOINTS are authored to two decimal
// places and land at r 41.00285 — 0.003 viewBox units, 0.0025 device pixels
// at 84px, outside a circle of 41. The quarter reverse's real breach was
// 1.097 units, four hundred times deeper. One number called both a FAIL.
//
// So the fraction is reported UNCHANGED (the gate is not being relaxed — see
// the note in the round-1 scorecard) and a second, independent number is
// reported beside it: the deepest breach in viewBox units, and the fraction
// of length outside by more than AUTHOR_TOL. That is a ranking, not a pass.
//
// AUTHOR_TOL = 0.01, the quantum of the coordinates coins.js writes: every
// number in the file is emitted through n2() or authored at 2 dp, so a point
// intended to lie ON the field circle can land up to 0.005 either side of it
// per coordinate, ~0.007 radially. 0.01 is that, rounded up to the quantum.
export const AUTHOR_TOL = 0.01;

export async function measure(mod, id) {
  const rows = [];
  for (const side of ['obverse', 'reverse']) {
    for (const size of SIZES) {
      const svg = mod.coinSVG(id, size, { side });
      const geo = marks(svg);
      const fr = fieldRadius(geo);
      const rField = fr.r;
      const all = [...geo, ...textMarks(svg)];
      let tot = 0, outF = 0, out47 = 0, outDeep = 0, maxr = 0, worst = null, worstDeep = null, maxDeep = 0;
      const offenders = [];
      for (let i = 0; i < all.length; i++) {
        const mk = all[i];
        const cls = mk.fill === 'text' ? 'drawn' : classify(mk, i);
        if (cls !== 'drawn') continue;
        const a = lenOutside(mk.pts, rField);
        const b = lenOutside(mk.pts, 47);
        const c = lenOutside(mk.pts, rField + AUTHOR_TOL);
        tot += a.tot; outF += a.out; out47 += b.out; outDeep += c.out;
        const half = mk.isStroke && mk.sw ? mk.sw / 2 : 0;
        const depth = a.maxr + half - rField;
        if (a.out > 1e-9) offenders.push({ tag: mk.tag ? mk.tag.slice(0, 90) : 'text ' + mk.ch, out: a.out, deep: c.out, maxr: a.maxr + half, depth });
        if (a.maxr + half > maxr) { maxr = a.maxr + half; worst = mk.tag ? mk.tag.slice(0, 90) : 'text ' + mk.ch; }
        if (depth > maxDeep) { maxDeep = depth; worstDeep = mk.tag ? mk.tag.slice(0, 90) : 'text ' + mk.ch; }
      }
      offenders.sort((x, y) => y.depth - x.depth);
      rows.push({
        id, side, size, tier: tierOf(size), rField, candidates: fr.candidates,
        len: tot, pctOutField: tot ? (100 * outF) / tot : 0, pctOutDisc: tot ? (100 * out47) / tot : 0,
        pctDeep: tot ? (100 * outDeep) / tot : 0, maxDepth: Math.max(0, maxDeep), worstDeep,
        maxr, worst, offenders: offenders.slice(0, 4),
      });
    }
  }
  return rows;
}

export const worstOf = (rows, filter = () => true) =>
  rows.filter(filter).reduce((a, b) => (b.pctOutField > a.pctOutField ? b : a));

// ── CLI ────────────────────────────────────────────────────────────────────
if (import.meta.url === `file://${process.argv[1]}`) {
  const src = process.argv[2] ? readFileSync(process.argv[2], 'utf8') : readFileSync(join(ROOT, 'src/art/coins.js'), 'utf8');
  const mod = await loadCoins(src);
  const ids = mod.COIN_IDS.filter((i) => i !== 'buck');

  if (process.env.SELFTEST) {
    // The regression v1 fails: on penny and nickel the blank is a centred
    // circle and must not be mistaken for the field circle.
    //
    // The expected radius is read from EDGE at run time rather than written
    // as a literal. It used to be the literal 40.5, and v1.57.0 moved the
    // field to 44.07 — so from that release until 2026-08-21 this selftest
    // printed SELFTEST FAIL on completely clean art, on all four coins. A
    // round-3 specialist found it and reported it rather than fixing it
    // (§1.1), which is the correct move and is why it is recorded here.
    //
    // Nothing was wrong with the SELECTION logic this test exists to guard —
    // the candidates column was reading `47(blank,rejected)` on the penny and
    // the nickel throughout, which is exactly the fault v1 had. Only the
    // assertion was stale. But a guard that cries wolf on clean art is worse
    // than no guard, because the next person to see FAIL learns to ignore it.
    //
    // The replacement asserts the RULE instead of a value, which is what the
    // test was always about and is immune to the next field change:
    //
    //   · the chosen radius is never the blank (47);
    //   · where 47 is among the candidates it was seen and rejected, not
    //     simply absent — that distinction is the whole v1 bug;
    //   · every coin agrees on one radius, since EDGE is one shared value.
    //
    // An assertion about a constant should name the constant or check the
    // property, never copy the number.
    let bad = 0;
    const seen = new Set();
    for (const id of ids) {
      const geo = marks(mod.coinSVG(id, 54, { side: 'obverse' }));
      const fr = fieldRadius(geo);
      const isBlank = Math.abs(fr.r - 47) < 1e-9;
      const sawBlank = fr.candidates.some((c) => /^47\b/.test(String(c)));
      const ok = !isBlank;
      if (!ok) bad++;
      seen.add(fr.r);
      console.log(
        `SELFTEST ${id.padEnd(8)} mid rField=${fr.r}  ${ok ? 'OK' : 'WRONG — picked the BLANK'}` +
          `${sawBlank ? '  (blank offered and rejected)' : ''}  candidates=[${fr.candidates.join(' ')}]`
      );
    }
    if (seen.size !== 1) {
      bad++;
      console.log(`SELFTEST the coins disagree on the field radius: ${[...seen].join(', ')} — EDGE is supposed to be one shared value`);
    }
    console.log(bad ? 'SELFTEST FAIL' : `SELFTEST PASS — no coin picked the blank; all read ${[...seen][0]} at mid`);
  }

  const only = process.env.COIN;
  console.log('coin     side      size tier   rField  candidates                        drawn len   %out field   %out disc(47)  max r');
  const summary = [];
  for (const id of ids) {
    const rows = await measure(mod, id);
    for (const r of rows) {
      if (only && only !== id) continue;
      console.log(
        `${r.id.padEnd(8)} ${r.side.padEnd(8)} ${String(r.size).padStart(4)} ${r.tier.padEnd(5)} ${r.rField.toFixed(1).padStart(6)}  ${r.candidates.join(' ').padEnd(32)} ${r.len.toFixed(1).padStart(9)}  ${r.pctOutField.toFixed(4).padStart(9)}%  ${r.pctOutDisc.toFixed(4).padStart(9)}%  ${r.maxr.toFixed(3)}`
      );
    }
    for (const side of ['obverse', 'reverse']) {
      const w = worstOf(rows, (x) => x.side === side);
      summary.push({ id, side, w });
    }
  }
  console.log('\n=== D8 per coin, per side (worst tier), with DEPTH partition ===');
  console.log(`(AUTHOR_TOL = ${AUTHOR_TOL} viewBox units; "deep" = outside by more than that)`);
  for (const s of summary) {
    const d = worstOf(await measure(mod, s.id), (x) => x.side === s.side && x.pctDeep >= 0)
      && (await measure(mod, s.id)).filter((x) => x.side === s.side).reduce((a, b) => (b.maxDepth > a.maxDepth ? b : a));
    console.log(
      `${s.id.padEnd(8)} ${s.side.padEnd(8)} worst-fraction ${s.w.pctOutField.toFixed(4)}% at ${String(s.w.size).padStart(3)}px (${s.w.tier})`
      + `  |  deepest breach ${d.maxDepth.toFixed(4)} units at ${d.size}px, deep-fraction ${d.pctDeep.toFixed(4)}%`
    );
    for (const o of s.w.offenders) {
      console.log(`         depth ${o.depth.toFixed(4)}  len-out ${o.out.toFixed(2).padStart(6)} (deep ${o.deep.toFixed(2).padStart(6)})  ${o.tag.replace(/\s+/g, ' ').slice(0, 78)}`);
    }
  }

  if (process.env.RESPONSE) {
    // ── REPAIRED 2026-08-24 (ledger A11) ─────────────────────────────────────
    // The old test substituted a literal into the SOURCE of coins.js:
    //
    //   const anchor = '<circle cx="50" cy="27.8" r="${rHead}"/>';
    //   if (!code.includes(anchor)) throw new Error('RESPONSE anchor missing…');
    //
    // That string is no longer anywhere in coins.js, so `RESPONSE=1` threw and
    // the response test had not run for an unknown number of rounds. It failed
    // CLOSED, which is the one thing it got right — but a guard that cannot run
    // is not a guard, and D8's ability to move was therefore unverified while
    // D8 verdicts kept being published.
    //
    // The anchor was the same defect the ledger calls A4/A5/A17: AN INSTRUMENT
    // HOLDING ITS OWN COPY OF THE SUBJECT. A response test that names a
    // coordinate in the art is guaranteed to rot the next time the art moves,
    // and it rots into silence.
    //
    // The replacement injects a defect that is defined on the EMITTED SVG and
    // is valid for any content: everything after the last centred field circle
    // is wrapped in a translate group, which pushes the whole device out of the
    // field. Nothing about the drawing is named. Three things are asserted
    // before the number is believed:
    //
    //   · the wrap found an insertion point at all (else throw);
    //   · the wrap MOVED the geometry — mark count identical, centroids all
    //     changed (else throw: a no-op injection proves nothing);
    //   · a ZERO translate leaves every number bit-identical (the null test —
    //     otherwise the harness itself is perturbing the measurement).
    const SHOVE = 12;                      // units, well past any field radius
    function inject(svg, dx, dy) {
      // The emitted order on every coin in the set is:
      //   blank | field FILL circle | the device | field RING circle | lettering
      // so "the device" is exactly what lies BETWEEN the first and the last
      // centred circle over r 35. Wrapping that span translates the device and
      // leaves the blank, both field circles and the legend where they are —
      // which is the defect the gate exists to catch. Nothing here names a
      // coordinate of the drawing; the span is found in the SVG being scored.
      const fields = [];
      for (const m of svg.matchAll(/<circle\b[^>]*>/g)) {
        const g = (k) => Number((m[0].match(new RegExp(`\\b${k}="([-\\d.]+)"`)) || [])[1]);
        if (Math.abs(g('cx') - 50) < 1e-6 && Math.abs(g('cy') - 50) < 1e-6 && g('r') > 35) fields.push(m);
      }
      if (fields.length < 2) throw new Error(`RESPONSE: expected a field fill AND a field ring, found ${fields.length} centred circles over r 35 — cannot place the injection`);
      const a = fields[0].index + fields[0][0].length, b = fields[fields.length - 1].index;
      if (b <= a) throw new Error('RESPONSE: the two field circles are adjacent — no device between them');
      return svg.slice(0, a) + `<g transform="translate(${dx} ${dy})">` + svg.slice(a, b) + '</g>' + svg.slice(b);
    }
    const shoved = (dx, dy) => ({ ...mod, coinSVG: (id, size, o) => inject(mod.coinSVG(id, size, o), dx, dy) });

    // assert the injection is real, on the exact draw the test scores
    const probe = mod.coinSVG('quarter', 380, { side: 'reverse' });
    const a0 = marks(probe), a1 = marks(inject(probe, SHOVE, 0));
    if (a0.length !== a1.length) throw new Error(`RESPONSE: injection changed the mark count ${a0.length} -> ${a1.length} — not a pure translate`);
    const nMoved = a0.filter((m, i) => (m.bbox.x0 + m.bbox.x1) / 2 !== (a1[i].bbox.x0 + a1[i].bbox.x1) / 2).length;
    if (nMoved === 0) throw new Error('RESPONSE: the injected translate moved NOTHING — the test is a no-op, fix it before trusting D8');

    const base = worstOf(await measure(mod, 'quarter'), (x) => x.side === 'reverse');
    const after = worstOf(await measure(shoved(SHOVE, 0), 'quarter'), (x) => x.side === 'reverse');
    const nullRun = worstOf(await measure(shoved(0, 0), 'quarter'), (x) => x.side === 'reverse');
    console.log(`\nRESPONSE TEST: the whole quarter-reverse device translated +${SHOVE} units in x, out of the field circle.`);
    console.log(`  injection is real: ${nMoved} of ${a0.length} marks moved, mark count unchanged`);
    console.log(`  quarter reverse worst % outside field: ${base.pctOutField.toFixed(4)} -> ${after.pctOutField.toFixed(4)}`);
    console.log(after.pctOutField > base.pctOutField + 0.1 ? '  RESPONSE TEST PASS' : '  RESPONSE TEST FAIL — D8 is UNTRUSTED');
    const nullOk = nullRun.pctOutField === base.pctOutField && nullRun.maxr === base.maxr;
    console.log(`  NULL TEST: a ZERO translate gives ${nullRun.pctOutField.toFixed(4)}% (max r ${nullRun.maxr.toFixed(3)})` +
      `  ${nullOk ? 'bit-identical to the unwrapped draw, as it must be' : '*** THE HARNESS ITSELF PERTURBS D8 — UNTRUSTED ***'}`);
  }
}
