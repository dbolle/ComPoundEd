// Verify every frozen artefact in the round's hash list is byte-identical
// here. Run before touching anything and again before handing back (COIN-JUDGE
// §1: a changed hash voids the round). Prints MISSING separately from MISMATCH
// — a file this worktree does not have is a setup problem, not a violation.
import fs from 'fs';
import crypto from 'crypto';

const LIST = process.argv[2];
const rows = fs.readFileSync(LIST, 'utf8').trim().split('\n')
  .map((l) => l.trim().split(/\s+/)).filter((a) => a.length === 2);
let ok = 0; const bad = []; const missing = [];
for (const [want, rel] of rows) {
  if (!fs.existsSync(rel)) { missing.push(rel); continue; }
  const got = crypto.createHash('sha256').update(fs.readFileSync(rel)).digest('hex');
  if (got === want) ok++; else bad.push(`${rel}\n    want ${want}\n    got  ${got}`);
}
console.log(`frozen artefacts: ${rows.length} listed, ${ok} byte-identical, ${bad.length} MISMATCH, ${missing.length} missing`);
for (const b of bad) console.log('  MISMATCH ' + b);
for (const m of missing) console.log('  missing  ' + m);
