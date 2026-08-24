// THE PENNY DISC TABLE, WITH ITS CORRECTIONS APPLIED — one accessor, so a
// reader cannot get the frozen table without also getting what is wrong with it.
//
// WHY. `_jp1discs.json` is a frozen, hashed round target and stays byte-
// identical (COIN-JUDGE.md §1.1: retract BESIDE, never rewrite). But it has two
// defects (ledger A15), and 29 files read it:
//
//   · `penny-rev-1991d.png` has no entry at all;
//   · `penny-rev-artwork.jpg`'s entry is not a fit — p95 13.93% of R with 244
//     of 720 rays ending on the search-window bound — and carries no flag,
//     while the two entries with a merely 3.4%/5.2% disagreement do carry one.
//
// A frozen number that is wrong is more dangerous than a missing one, because
// the missing one throws. So this module does not just merge: **it refuses.**
// Asking for a disc that a correction marks unusable throws unless you pass
// `{ frozen: true }` and say why in the round report. The default is the good
// value; getting the bad one has to be deliberate.
//
// REPORTS ONLY. Reads two JSON files; writes nothing.
//
//   import { disc, has, files } from './_jpdiscs.mjs';
//   node coloringbook/judge/_jpdiscs.mjs          -> the merged table + selftest
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { JUDGE } from './_paths.mjs';

export const FROZEN = JSON.parse(readFileSync(join(JUDGE, '_jp1discs.json'), 'utf8'));
const SHEET = JSON.parse(readFileSync(join(JUDGE, '_jp1discs-corrections.json'), 'utf8'));
export const CORRECTIONS = SHEET.corrections;
export const UNUSABLE = SHEET.unusable;

const pick = ({ cx, cy, R, p95pctR, via }) => ({ cx, cy, R, p95pctR, via });

/** Every file either table knows about. */
export const files = () => [...new Set([...Object.keys(FROZEN), ...Object.keys(CORRECTIONS)])].sort();
export const has = (f) => f in FROZEN || f in CORRECTIONS;

/**
 * The disc to register `f` on.
 *   source: 'corrected' | 'frozen'
 * Throws if the frozen entry is flagged unusable and no correction exists,
 * or if `{ frozen: true }` asks for an entry that is known not to be a fit.
 */
export function disc(f, opts = {}) {
  const c = CORRECTIONS[f], z = FROZEN[f];
  if (opts.frozen) {
    if (!z) throw new Error(`_jpdiscs: no FROZEN entry for ${f} — _jp1discs.json has never had one`);
    if (UNUSABLE[f]) {
      throw new Error(
        `_jpdiscs: the frozen entry for ${f} is flagged UNUSABLE (p95 ${z.p95pctR}% of R) and you asked for it ` +
        'explicitly. If a round really needs the number that was published, read it out of _jp1discs.json ' +
        'yourself and say in the report which number you used and why.');
    }
    return { ...pick(z), source: 'frozen' };
  }
  // A CORRECTION MAY BE A REFUSAL (ledger A28). `penny-rev.jpg`'s entry records
  // three independent fits that disagree by 3.39 % of R — against 0.47 % for
  // both of its pool-mates on the same day — and publishes NO replacement
  // coordinate, because there is no number the estimators agree on to publish.
  // A correction sheet that can only correct is a sheet that must invent a
  // value in order to say "this cannot be measured".
  if (c && c._verdict && c.R === undefined) {
    throw new Error(
      `_jpdiscs: ${f} has a correction that REFUSES a coordinate — ${c._verdict}\n` +
      `  cause: ${c.cause}\n` +
      `  refused for: ${c.refused_for}\n` +
      `  retained for: ${c.retained_for}`);
  }
  if (c) return { ...pick(c), source: 'corrected', supersedes: c.supersedes ?? null, caveat: c.caveat ?? null };
  if (z && UNUSABLE[f]) throw new Error(`_jpdiscs: ${f} is flagged UNUSABLE and has no correction — do not register on it`);
  if (z) return { ...pick(z), source: 'frozen' };
  throw new Error(`_jpdiscs: no disc for ${f} in _jp1discs.json or its correction sheet`);
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  console.log('PENNY DISC TABLE — frozen + corrections');
  console.log('file                      source        cx        cy         R    p95%R  via');
  for (const f of files()) {
    let d;
    try { d = disc(f); } catch (e) { console.log(`${f.padEnd(24)} THROWS: ${e.message}`); continue; }
    console.log(`${f.padEnd(24)} ${d.source.padEnd(10)} ${d.cx.toFixed(2).padStart(9)} ${d.cy.toFixed(2).padStart(9)} ${d.R.toFixed(2).padStart(9)} ${String(d.p95pctR).padStart(7)}  ${d.via}`);
    if (d.supersedes) console.log(`${''.padEnd(25)} supersedes cx ${d.supersedes.cx} cy ${d.supersedes.cy} R ${d.supersedes.R} p95 ${d.supersedes.p95pctR}%  (${d.supersedes.delta})`);
  }

  // ── SELFTEST. A merge that cannot refuse is just a lookup. ────────────────
  const t = [];
  const ok = (name, fn, want) => { let got; try { got = fn(); } catch (e) { got = 'THREW: ' + e.message.slice(0, 40); } t.push([name, String(got), want]); };
  ok('a plain frozen file resolves to frozen', () => disc('penny-obv.jpg').source, 'frozen');
  ok('the file with no frozen entry resolves', () => disc('penny-rev-1991d.png').source, 'corrected');
  ok('the unusable file resolves to CORRECTED', () => disc('penny-rev-artwork.jpg').source, 'corrected');
  ok('  ...and to the good R, not 252.41', () => disc('penny-rev-artwork.jpg').R, '174.89');
  ok('  ...and carries its ratios-only caveat', () => (disc('penny-rev-artwork.jpg').caveat || '').includes('RATIOS'), 'true');
  ok('explicitly asking for the unusable frozen one THROWS',
    () => { try { disc('penny-rev-artwork.jpg', { frozen: true }); return 'no throw'; } catch { return 'threw'; } }, 'threw');
  ok('an unknown file THROWS rather than returning undefined',
    () => { try { disc('penny-rev-nope.png'); return 'no throw'; } catch { return 'threw'; } }, 'threw');
  ok('the frozen table is still all 7 of its own entries', () => Object.keys(FROZEN).length, '7');
  // A28: a correction that publishes no coordinate must REFUSE, not return undefined.
  ok('a refusal correction THROWS rather than returning undefined',
    () => { try { disc('penny-rev.jpg'); return 'no throw'; } catch { return 'threw'; } }, 'threw');
  ok('  ...and the refusal names why it is still in T1',
    () => { try { disc('penny-rev.jpg'); return 'no throw'; } catch (e) { return e.message.includes('retained for') ? 'true' : 'false'; } }, 'true');
  // …and asking for the frozen one EXPLICITLY still throws, the same way it does
  // for penny-rev-artwork.jpg. That is deliberate and was worth writing down:
  // the first draft of this check expected `{ frozen: true }` to hand the number
  // back. Both files are flagged UNUSABLE, so both refuse, and a round that
  // genuinely wants the published 249.28 has to read _jp1discs.json itself and
  // say so in the report. Getting a bad number must cost a sentence.
  ok('  ...and the frozen one refuses too, naming the escape',
    () => { try { disc('penny-rev.jpg', { frozen: true }); return 'no throw'; } catch (e) { return e.message.includes('_jp1discs.json') ? 'true' : 'false'; } }, 'true');
  // NULL TEST: the corrections must actually CHANGE something. If the sheet were
  // empty, or a correction restated the frozen value, every check above would
  // still pass and the module would be decorative.
  ok('corrections differ from frozen where both exist',
    () => Object.keys(CORRECTIONS).filter((f) => FROZEN[f] && CORRECTIONS[f].R !== undefined && FROZEN[f].R !== CORRECTIONS[f].R).length, '1');
  ok('corrections add a file frozen never had',
    () => Object.keys(CORRECTIONS).filter((f) => !FROZEN[f]).length, '1');
  console.log('\nSELFTEST');
  let bad = 0;
  for (const [n, got, want] of t) { const good = got === want; if (!good) bad++; console.log(`  ${good ? 'ok  ' : 'FAIL'}  ${n.padEnd(46)} got ${got}  want ${want}`); }
  console.log(bad ? `SELFTEST FAIL (${bad})` : 'SELFTEST PASS — the merge refuses, and the corrections are not a restatement');
}
