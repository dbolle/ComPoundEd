// Append the v1.57.0 JUDGE ROUND to each coin's history.
//
// COIN-JUDGE.md §5 allows a round with no specialist dispatched (the quarter's
// round 4 was one). This is another: the owner approved a measured constant,
// the judge applied it, and the judge re-derived what it touched.
//
// §6's rule that "a dimension never silently disappears between rounds" is why
// every row this round did NOT re-measure is written out with
// `carried_from_round_0: true` rather than omitted. A short scorecard is not a
// clean one; it is an unread one.
//
// Run: node coloringbook/judge/_r157card.mjs        (writes)
//      DRY=1 node coloringbook/judge/_r157card.mjs  (prints, writes nothing)
import { appendFileSync, readFileSync } from 'node:fs';

const HERE = new URL('.', import.meta.url).pathname;
const COMMIT = '8156883';
const DATE = '2026-08-21';

// ── the judge's own re-derivations, from _rescore.mjs on the committed tree ──
const RIM = {
  penny: { coin: 44.0, delta: 0.07 },
  nickel: { coin: 44.33, delta: -0.26 },
  dime: { coin: 43.75, delta: 0.32 },
  quarter: { coin: 44.2, delta: -0.13 },
};
// D8 worst fraction / deepest breach, per side, every coin. Everything is
// 0.0000% except the nickel obverse's authored-arc residual.
const D8 = {
  penny: { obverse: [0, 0], reverse: [0, 0] },
  nickel: { obverse: [0.023714, 0.0039], reverse: [0, 0] },
  dime: { obverse: [0, 0], reverse: [0, 0] },
  quarter: { obverse: [0, 0], reverse: [0, 0] },
};
// D13 reverse, icon tier, _x6dark.mjs on the committed tree.
const D13 = {
  penny: { ref: 0.8497, ours: 0.8235, delta: -0.0261, inkRef: 0.5, inkOurs: 0.462 },
  nickel: { ref: 0.8605, ours: 0.8617, delta: 0.0012, inkRef: 0.448, inkOurs: 0.387 },
  dime: { ref: 0.7268, ours: 0.8999, delta: 0.1731, inkRef: 0.661, inkOurs: 0.299 },
  quarter: { ref: 0.7667, ours: 0.7488, delta: -0.0179, inkRef: 0.66, inkOurs: 0.548 },
};

for (const coin of ['penny', 'nickel', 'dime', 'quarter']) {
  const prev = JSON.parse(readFileSync(`${HERE}${coin}-scorecard.json`, 'utf8'));
  const rim = RIM[coin];
  const entry = {
    coin,
    round: (prev.round ?? 0) + 1,
    date: DATE,
    commit: COMMIT,
    kind: 'judge round — no specialist dispatched',
    change: 'EDGE.field 41.0 -> 44.07 at full and mid; icon holds 42.5',
    dimensions: [
      {
        id: 'D5-rim',
        side: 'both',
        gate: '+- 1.0 viewBox unit of the coin’s own measured rim seat',
        value: { coin: rim.coin, ours: { full: 44.07, mid: 44.07, icon: 42.5 }, delta_full: rim.delta },
        verdict: 'PASS',
        was: 'FAIL (ours 41.0)',
        note:
          'The four coins were measured blind by four judges on four reference sets and agree within 0.58 ' +
          '(44.00 / 44.33 / 44.20 / 43.75). 44.07 is the mean, applied as ONE shared value — the PALETTE ' +
          'treatment: genuinely shared, with the reason recorded at the constant rather than the flag silenced.',
      },
      ...['obverse', 'reverse'].map((side) => ({
        id: 'D8',
        side,
        gate: '0.00% at every tier; a breach shallower than 0.01 units (n2()’s quantum) is reported at its depth and does not count',
        value: { worst_fraction: D8[coin][side][0], deepest_breach_units: D8[coin][side][1] },
        verdict: 'PASS',
        was: coin === 'nickel' && side === 'obverse' ? 'FAIL — 8.09% outside, 1.4698 units deep' : 'PASS',
        note:
          coin === 'nickel' && side === 'obverse'
            ? 'Retired with NO DRAWING CHANGED. The head still reaches 40.64 and its lit copy 41.97; the circle ' +
              'they are measured against moved out from under them. The 2.3714% residual is the coat’s closing ' +
              'arc authored at exactly r 44.07 — 0.0039 units, below the authoring quantum (Appendix Q3).'
            : 'unchanged; the field circle only grew, so containment could only improve.',
      })),
      {
        id: 'D9',
        side: 'both',
        gate: '0 undefined/NaN over every id x side x tier',
        value: { renders: 150, failures: 0 },
        verdict: 'PASS',
        response_test: 'HEAD.Washington := undefined in a generated copy -> 88 failures over 120 renders, went RED as expected',
      },
      {
        id: 'D11',
        side: 'both',
        gate: 'tripwire: no regression vs round 0 | set gate: reverse min >= 3.0x obverse min',
        value: { overall_min: 0.0534, obverse_min: 0.0534, reverse_min: 0.0812, set_ratio: 1.52 },
        verdict: 'PASS (tripwire)',
        escalate:
          'set ratio 1.52x against a 3.0x gate. It moved 1.49 -> 1.52 and that is NOT banked as progress: the rim ' +
          'ring narrowed on all four coins at once, i.e. the change is to the shared furniture that contributes ' +
          'zero difference and inflates the MAD denominator — a 2% move in a metric already suspected of being ' +
          'the wrong one is noise.',
      },
      {
        id: 'D13',
        side: 'reverse',
        gate: '|delta mean/field| <= 0.05',
        locus: 'disc interior r < 40, icon tier, 26px, reference reduced to the same device pixel count',
        value: D13[coin],
        verdict: Math.abs(D13[coin].delta) <= 0.05 ? 'PASS' : 'FAIL',
        instrument_caveat:
          '_x6dark.mjs counts ink over the whole interior at a tier where OUR art draws no lettering by design. ' +
          'On the cent and the nickel the references’ legends fill the top and bottom of that interior, so part ' +
          'of their ink deficit is the presence decision, not a tone defect. Reported, not fixed (§1.1); the fix ' +
          'changes published numbers and wants its own retraction entry.',
      },
      {
        id: 'D13',
        side: 'obverse',
        gate: '|delta mean/field| <= 0.05',
        value: null,
        verdict: 'UNMEASURED',
        note: '_x6dark.mjs is reverse-only. D13-obverse has never been measured on any coin — an absent subject, not a blank row (§2).',
      },
    ],
    carried_from_round_0: {
      note:
        'Every other dimension keeps its round-0 verdict and value UNCHANGED and is listed here rather than ' +
        'omitted, per §6: a dimension never silently disappears between rounds. None of them was re-measured ' +
        'this round, and none of them is claimed to have improved.',
      ids: (prev.dimensions || [])
        .map((d) => `${d.id}/${d.side ?? 'both'}`)
        .filter((k) => !/^D5-rim|^D8|^D9|^D11|^D13/.test(k)),
    },
    escalated: ['§17 set discriminability ratio 1.52x against 3.0x'],
    looked_at:
      'all four coins, both sides, at 84/54/26px, rendered from the edited file and read beside the ' +
      '_edgesheet preview the owner approved (§3 D12).',
    notes:
      'The one constant retired four D5-rim FAILs and one real D8 breach. It also OPENED the headroom that ' +
      'D5-cap has been blocked on since the quarter’s round 4 — roughly 3.1 units of unused band between the ' +
      'tallest cap top (40.9) and the new field circle. Legends were deliberately NOT moved in this round so ' +
      'that the constant would be the only attributable change; collecting that headroom is the next round.',
  };
  const line = JSON.stringify(entry);
  if (process.env.DRY) console.log(line.slice(0, 400) + '…');
  else appendFileSync(`${HERE}${coin}-history.jsonl`, line + '\n');
  console.log(`${coin}: round ${entry.round} ${process.env.DRY ? '(dry)' : 'appended'}`);
}
