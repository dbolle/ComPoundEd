// R5 dime throat — raw smoothed perpendicular profiles, printed as numbers, so
// the "lighter notch between the jaw and the throat" can be read off the
// photograph instead of inferred from a run-finder's output.
//
// Prints grey level against t at 0.25-unit steps, plus the position of every
// local MAXIMUM (a lit ridge) between the two darks — which is the feature the
// round is actually about: on a real coin the underside of the jaw catches
// light before the throat shadow starts.
//
// Run: node coloringbook/judge/_jt9dump.mjs [ref] [s1,s2,...]
import { busted, discFor, makeMap } from './_jw4reg.mjs';
import { greyImg } from './_jw4width.mjs';
import { marks } from './_jqgeom.mjs';
import { axisWalk, profileAt } from './_jt9prof.mjs';

const REFDIR = new URL('../ref/', import.meta.url).pathname;
const ref = process.argv[2] || 'dime-obv-2.jpg';
const want = (process.argv[3] || '6,10,14,18,22,26').split(',').map(Number);

const B = await busted();
const head = marks(`<svg><path d="${B.headD}"/></svg>`)[0].pts;
const P = axisWalk(1);
const disc = discFor(ref);
const M = makeMap(B, disc);
const g = await greyImg(REFDIR + ref);
console.log(`${ref}  ${M.pxPerUnit.toFixed(2)} px/unit   SIGMA=${process.env.SIGMA ?? 0.5}`);
console.log('t:      ' + [...Array(37).keys()].map((k) => (-7 + k * 0.25).toFixed(2).padStart(6)).join(''));
for (const s of want) {
  const i = P.findIndex((p) => p.s >= s);
  const pr = profileAt(g, M, P, i, 9, 1.5, head);
  const row = [...Array(37).keys()].map((k) => {
    const t = -7 + k * 0.25;
    const v = pr.prof[Math.round(t / 0.05) + pr.N];
    return (Number.isNaN(v) ? '   ---' : v.toFixed(0).padStart(6));
  }).join('');
  console.log(`s=${s.toString().padStart(3)}  ` + row);
  // local maxima strictly between t=-3 and t=+1, with their prominence
  const peaks = [];
  for (let k = Math.round(-3 / 0.05) + pr.N; k <= Math.round(1 / 0.05) + pr.N; k++) {
    const a = pr.prof[k - 1], b = pr.prof[k], c = pr.prof[k + 1];
    if (Number.isNaN(a) || Number.isNaN(c)) continue;
    if (b >= a && b > c) {
      let l = k; while (l > 1 && pr.prof[l - 1] <= pr.prof[l]) l--;
      let r = k; while (r < pr.prof.length - 2 && pr.prof[r + 1] <= pr.prof[r]) r++;
      peaks.push({ t: pr.tOf(k), v: b, prom: b - Math.max(pr.prof[l], pr.prof[r]) });
    }
  }
  console.log('       lit ridges in t=[-3,1]: '
    + (peaks.length ? peaks.map((p) => `t=${p.t.toFixed(2)} grey ${p.v.toFixed(0)} prominence ${p.prom.toFixed(1)}`).join(';  ') : 'none'));
}
