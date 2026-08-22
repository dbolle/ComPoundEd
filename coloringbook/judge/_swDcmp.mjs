// SPECIALIST (buck obverse) — is the delta between two revisions of coins.js
// COMMENTS ONLY? Used to show that the revision the Playwright suite built
// differs from the shipping revision in prose alone.
//   node coloringbook/judge/_swDcmp.mjs <fileA> <fileB>
import { readFileSync } from 'node:fs';
const strip = (p) => readFileSync(p, 'utf8')
  .split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');
const [a, b] = process.argv.slice(2);
const A = strip(a), B = strip(b);
if (A === B) console.log(`CODE IDENTICAL — every difference between\n  ${a}\n  ${b}\nis on a comment line.`);
else {
  const la = A.split('\n'), lb = B.split('\n');
  let n = 0;
  for (let i = 0; i < Math.max(la.length, lb.length); i++) if (la[i] !== lb[i]) { n++; if (n <= 5) console.log(`  line ${i + 1}\n    A: ${la[i]}\n    B: ${lb[i]}`); }
  console.log(`CODE DIFFERS on ${n} non-comment lines.`);
  process.exitCode = 1;
}
