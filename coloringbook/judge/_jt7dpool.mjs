// T1 UNDER CANDIDATE DIME-OBVERSE POOLS — before and after, both faces, all four sizes.
//
// WHY IT IS A SEPARATE FILE. `_jt1transfer.mjs` IS THE PRIMARY GATE. Ledger A45:
// a "byte-exact restore" to a cited hash silently reverted eleven days of work
// one release ago, and the standing rule is that a file whose hash is cited gets
// a v2 rather than an edit. So nothing here edits the gate. It IMPORTS the gate's
// own validated pieces — `featOfRef`, `featOfOurs`, `designSim`, `SIZES`, `IDS`,
// `setSide`, `REG` — and swaps ONE array inside `POOL_BY_SIDE` between runs.
// Every number below is therefore computed by the gate's own code path with the
// gate's own registration, and "before" reproduces the published 32/32 exactly.
//
// The descriptor cache inside `_jt1transfer.mjs` is keyed by FILE, so running all
// the variants in one process measures each photograph once. That is not just
// speed: it guarantees the variants differ ONLY by which files are in the list,
// and not by any re-derivation of a feature.
//
// WHAT THE MARGIN MEANS, AND WHY A DROP IS NOT AUTOMATICALLY BAD. T1 scores our
// art against `max` over each denomination's pool. Adding a file can only RAISE
// a column's max, never lower it. So:
//   · adding to the DIME pool can only raise the dime column — which raises the
//     dime row's own margin and LOWERS every other row's margin, because the
//     dime is their strongest competitor or their next-best.
//   · a margin that falls when an honest reference is added is the pool telling
//     the truth: the old margin was flattered by a pool too small to contain the
//     nearest real competitor. A margin that falls to zero is a real defect.
// Both numbers are printed for every row. The rule this round works to is the
// brief's: do not pick the pool that scores best, pick the one that is the most
// honest evidence, and show both.
//
// REPORTS ONLY (judge/WRITERS.md). Writes nothing. `_jt1transfer.mjs`'s own
// `cleanup()` removes the renders it makes under `ref/_scratch/`.
//
//   node coloringbook/judge/_jt7dpool.mjs           -> every variant, summary
//   node coloringbook/judge/_jt7dpool.mjs full      -> + the full table per variant
import {
  POOL_BY_SIDE, IDS, SIZES, setSide, featOfRef, featOfOurs, designSim, REG, cleanup,
} from './_jt1transfer.mjs';

const INCUMBENT = ['dime-obv-2.jpg', 'dime-obv-3.jpg'];

// The variants, each with the reason it is worth asking about.
export const VARIANTS = [
  ['A  incumbent (2 proofs)', INCUMBENT,
    'what is published: 32/32 rests here'],
  ['B  + pcgs2015', [...INCUMBENT, 'dime-obv-pcgs2015.png'],
    'one business strike, the best-fitting rim of the nine'],
  ['C  + pcgs2015 + unc2005', [...INCUMBENT, 'dime-obv-pcgs2015.png', 'dime-obv-unc2005.png'],
    'both diffuse/struck files; the two finishes both represented'],
  ['D  + all three struck', [...INCUMBENT, 'dime-obv-pcgs2015.png', 'dime-obv-unc2005.png', 'dime-obv.jpg'],
    'every business strike on disk'],
  ['E  struck only', ['dime-obv-pcgs2015.png', 'dime-obv-unc2005.png', 'dime-obv.jpg'],
    'the counterfactual: what if the proofs were the ones excluded'],
  ['F  every geometrically usable file', [...INCUMBENT, 'dime-obv-pcgs2015.png', 'dime-obv-unc2005.png',
    'dime-obv.jpg', 'dime-obv-proof1960.png', 'dime-obv-proof1968.png'],
    'all nine less the two whose rim will not fit'],
  ['G  all nine', [...INCUMBENT, 'dime-obv-4.jpg', 'dime-obv-pcgs2015.png', 'dime-obv-unc2005.png',
    'dime-obv.jpg', 'dime-obv-proof1960.png', 'dime-obv-proof1968.png', 'dime-obv-proof2010.png'],
    'including the two that fail geometry — so the cost of ignoring that is visible'],
];

async function run(pool, verbose) {
  POOL_BY_SIDE.obverse.dime = pool;
  const out = { control: {}, rows: [], pass: 0, total: 0, cpass: 0, ctot: 0, margins: {} };
  for (const side of ['obverse', 'reverse']) {
    setSide(side);
    for (const id of IDS) {
      const P = POOL_BY_SIDE[side][id];
      if (P.length < 2) continue;
      for (const held of P) {
        const h = await featOfRef(held);
        const sc = [];
        for (const t of IDS) {
          const others = POOL_BY_SIDE[side][t].filter((f) => f !== held);
          const vs = [];
          for (const f of others) vs.push(designSim(h, await featOfRef(f)));
          sc.push(vs.length ? Math.max(...vs) : -2);
        }
        const best = IDS[sc.indexOf(Math.max(...sc))];
        out.ctot++; if (best === id) out.cpass++;
        else out.control[`${side} ${held}`] = best;
        if (verbose) console.log(`  CONTROL ${(side + ' ' + id + ' ' + held).padEnd(44)} ` + sc.map((v) => v.toFixed(3).padStart(9)).join('') + (best === id ? '  OK' : `  !! sorted as ${best}`));
      }
    }
    for (const px of SIZES) {
      for (const id of IDS) {
        const o = await featOfOurs(id, px);
        const sc = [];
        for (const t of IDS) {
          const vs = [];
          for (const f of POOL_BY_SIDE[side][t]) vs.push(designSim(o, await featOfRef(f)));
          sc.push(Math.max(...vs));
        }
        const best = IDS[sc.indexOf(Math.max(...sc))];
        const margin = Math.max(...sc) - Math.max(...sc.filter((_, k) => IDS[k] !== id));
        out.total++; if (best === id) out.pass++;
        out.margins[`${side[0]}${px}-${id}`] = margin;
        out.rows.push({ side, px, id, sc, best, margin, ok: best === id });
        if (verbose) console.log(`  ${(side + ' ' + px + 'px ' + id).padEnd(26)} ` + sc.map((v) => v.toFixed(3).padStart(9)).join('')
          + `   ${best === id ? `OK  margin ${margin.toFixed(3)}` : '!! CONFUSED WITH ' + best}  n=${POOL_BY_SIDE[side][id].length}`);
      }
    }
  }
  return out;
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  const verbose = process.argv[2] === 'full';
  console.log('T1 UNDER CANDIDATE DIME-OBVERSE POOLS');
  console.log('The gate\'s own code, its own registration, one array swapped between runs.\n');

  const results = [];
  for (const [name, pool, why] of VARIANTS) {
    if (verbose) console.log(`\n${'='.repeat(78)}\n${name}   n=${pool.length}\n${'='.repeat(78)}`);
    const r = await run(pool, verbose);
    results.push([name, pool, why, r]);
    if (!verbose) console.log(`  ran ${name.padEnd(34)} n=${pool.length}  T1 ${r.pass}/${r.total}  control ${r.cpass}/${r.ctot}`);
  }
  POOL_BY_SIDE.obverse.dime = INCUMBENT;          // leave the module as we found it

  const base = results[0][3];
  console.log(`\n${'='.repeat(96)}`);
  console.log('T1 AND THE CONTROL, PER VARIANT');
  console.log('='.repeat(96));
  console.log('variant                              n   T1        control    reason');
  for (const [name, pool, why, r] of results) {
    console.log(`${name.padEnd(34)} ${String(pool.length).padStart(2)}   ${String(r.pass + '/' + r.total).padEnd(9)} ${String(r.cpass + '/' + r.ctot).padEnd(10)} ${why}`);
    for (const [k, v] of Object.entries(r.control)) console.log(`     !! CONTROL FAILURE: ${k} sorted as ${v}`);
  }

  console.log(`\n${'='.repeat(96)}`);
  console.log('EVERY MARGIN, BEFORE AND AFTER. 32 cells: 2 faces x 4 sizes x 4 denominations.');
  console.log('Only the OBVERSE cells can move — the dime obverse pool is the only thing that changed.');
  console.log('='.repeat(96));
  const keys = Object.keys(base.margins);
  const head = results.map(([n]) => n.slice(0, 2).trim().padStart(8)).join('');
  console.log('cell'.padEnd(22) + head);
  for (const k of keys) {
    const vals = results.map(([, , , r]) => r.margins[k]);
    const moved = vals.some((v) => Math.abs(v - vals[0]) >= 0.0005);
    console.log(`${(k + (moved ? ' *' : '')).padEnd(22)}` + vals.map((v) => v.toFixed(3).padStart(8)).join(''));
  }
  console.log('\n* = the cell moved. A cell that does not move is one whose winner and runner-up');
  console.log('  are both outside the dime obverse column.');

  console.log(`\nWORST MARGIN IN THE WHOLE TABLE, per variant — the number that decides how much`);
  console.log('slack the gate has left, and the one a pool change can destroy:');
  for (const [name, pool, , r] of results) {
    const worst = Object.entries(r.margins).sort((a, b) => a[1] - b[1])[0];
    console.log(`  ${name.padEnd(34)} n=${pool.length}  worst ${worst[1].toFixed(3)}  at ${worst[0]}`);
  }
  console.log(`\nREGISTRATION QUALITY (§4.1): ${REG.bounded} of ${REG.n} registrations (${(100 * REG.bounded / REG.n).toFixed(1)} %) finished ON a search bound.`);
  console.log('  Those NCCs are LOWER BOUNDS, not values, so read the margins, not the similarities.');
  cleanup();
}
