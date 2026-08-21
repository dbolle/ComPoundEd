// Serialised judge round 1 of 4 — the _pytone sign column.
// §1.1: retract beside, never rewrite. This changes published D3s annotations
// on the cent, so the retraction is appended rather than the old entries edited.
import { appendFileSync } from 'node:fs';

appendFileSync(new URL('./penny-history.jsonl', import.meta.url).pathname, JSON.stringify({
  coin: 'penny', date: '2026-08-21',
  kind: 'SERIALISED JUDGE ROUND — _pytone.mjs sign column corrected, with a retraction',
  the_fault:
    '_pytone.mjs computed sign agreement over THREE references, including penny-obv-2.jpg — a 2002-S cameo proof. ' +
    'penny-gates.md\'s own D3s row requires "at least two mutually independent STRUCK references; a cameo proof is ' +
    'excluded from tone by §20.3". The instrument contradicted the gate it serves. Found by the round-4 specialist, ' +
    'verified by the judge directly from _pytone.mjs:9,23 and penny-gates.md:62.',
  the_fix: 'One clause: agreement is now sg[0] === sg[2], the two struck references. The proof\'s column is still PRINTED — it is the best SHAPE reference this coin has and §20.3 cuts both ways — it simply no longer votes.',
  RETRACTS:
    'Every "references disagree on the SIGN — do not chase" annotation this tool has published for the cent ' +
    'obverse. That label had been steering what rounds attempted on this face, including round 4\'s decision not ' +
    'to pursue several patches.',
  measured_after_the_fix: {
    still_flagged: ['forehead (-3 says 0.809, 1909-S says 1.023 — a genuine sign disagreement)', 'brow (+ against 0)', 'hairBack (0 against -)'],
    no_longer_flagged: ['temple 0.171', 'hairOverEar 0.132', 'beardJaw 0.058', 'lips 0.065', 'coat 0.373', 'hairCrown 0.275', 'hairMid 0.286', 'beardChin 0.009'],
  },
  a_number_the_judge_did_NOT_take_on_report:
    'The specialist reported "10 of 11 agree, only forehead genuinely disagrees". My own re-derivation after the ' +
    'fix gives EIGHT of eleven agreeing, with three still flagged — forehead, brow and hairBack. The direction of ' +
    'the finding is unaffected and the four patches it named are indeed unflagged, but the count is not what was ' +
    'reported and is recorded here as measured rather than as relayed.',
  what_this_does_not_change:
    'No D3 VALUE moves. The mean |delta| is 0.1596 before and after; only the per-patch "do not chase" annotation ' +
    'changes. And it does not make D3 repairable: round 4 established that the hair is already within 0.001 of the ' +
    'best any flat fill can do (the two struck references INVERT on which part of the hair is dark, which is why ' +
    'hairCrown and hairMid can agree in sign and still be unreachable), and that the coat is capped by D13\'s ' +
    'remaining margin. What it changes is which patches a future round is permitted to look at.',
  why_it_was_safe_to_do_mid_flight:
    'One specialist round is still running, on the $1 NOTE, which does not read this cent-specific instrument. ' +
    'The three shared-code rounds still queued — EDGE.field.icon, the PALETTE base tone, and D7\'s estimator — all ' +
    'touch files that running rounds do read, and they stay queued.',
}) + '\n');
console.log('penny: _pytone retraction appended');
