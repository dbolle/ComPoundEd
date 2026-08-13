// Instrument sanity for _jqgeom.mjs — the parse D6, D7 and D8 all rest on.
// Every assertion has a closed-form answer computed by hand, not by the tool.
import { flattenPath, marks, polyLen, lenOutside, turns } from './_jqgeom.mjs';

let fails = 0;
const ok = (name, got, want, tol = 1e-6) => {
  const good = Math.abs(got - want) <= tol;
  if (!good) fails++;
  console.log(`${good ? 'ok  ' : 'FAIL'} ${name}: got ${typeof got === 'number' ? got.toFixed(4) : got}, want ${want}`);
};

// 1. square: perimeter 40, four 90 deg turns
const sq = flattenPath('M 0 0 L 10 0 L 10 10 L 0 10 Z');
ok('square perimeter', polyLen(sq.pts), 40, 1e-9);
const sqT = turns(sq.knots);
ok('square interior turns count', sqT.length, 2);
ok('square worst turn deg', Math.max(...sqT.map((t) => t.deg)), 90, 1e-9);

// 2. relative commands must land in the same place as absolute ones
const rel = flattenPath('M 0 0 l 10 0 l 0 10 l -10 0 z');
ok('relative square perimeter', polyLen(rel.pts), 40, 1e-9);

// 3. a cubic that is a straight line has length = the chord
const line = flattenPath('M 0 0 C 10 0 20 0 30 0');
ok('degenerate cubic length', polyLen(line.pts), 30, 1e-6);

// 4. C commands are NOT dropped (the _qtpull bug, method doc 21.9)
const withC = flattenPath('M 0 0 C 0 10 10 10 10 0');
ok('cubic reaches its end point x', withC.pts[withC.pts.length - 1].x, 10, 1e-9);
ok('cubic bulges (max y > 0)', Math.max(...withC.pts.map((p) => p.y)) > 5 ? 1 : 0, 1);

// 5. arc: a full-circle A pair of radius 5 has length 2*pi*5
const arc = flattenPath('M 55 50 A 5 5 0 1 1 45 50 A 5 5 0 1 1 55 50');
ok('circle-by-arc length', polyLen(arc.pts), 2 * Math.PI * 5, 0.02);

// 6. radius test on a circle element, with the search bounds printed so a
//    result equal to a bound is visible (method doc 23.6)
const svg = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="5" fill="#000"/></svg>';
const m = marks(svg);
ok('one mark parsed', m.length, 1);
ok('circle length', polyLen(m[0].pts), 2 * Math.PI * 5, 0.02);
ok('circle frac outside r=4', lenOutside(m[0].pts, 4).frac, 1, 1e-9);
ok('circle frac outside r=6', lenOutside(m[0].pts, 6).frac, 0, 1e-9);
ok('circle maxr', lenOutside(m[0].pts, 6).maxr, 5, 0.01);

// 7. transforms compose: a group translate plus an element rotate
const svg2 = '<svg><g transform="translate(50 50)"><ellipse cx="0" cy="0" rx="10" ry="2" transform="rotate(90)"/></g></svg>';
const m2 = marks(svg2);
ok('rotated ellipse bbox height', m2[0].bbox.y1 - m2[0].bbox.y0, 20, 1e-6);
ok('rotated ellipse bbox width', m2[0].bbox.x1 - m2[0].bbox.x0, 4, 1e-6);
ok('translated ellipse centre y', (m2[0].bbox.y0 + m2[0].bbox.y1) / 2, 50, 1e-6);

// 8. classification: fill-only vs stroke-only vs both
const svg3 = '<svg><path d="M 0 0 L 1 1" fill="#000"/><path d="M 0 0 L 1 1" fill="none" stroke="#000" stroke-width="1.5"/></svg>';
const m3 = marks(svg3);
ok('region classified', m3[0].isRegion ? 1 : 0, 1);
ok('region not stroke', m3[0].isStroke ? 1 : 0, 0);
ok('stroke classified', m3[1].isStroke ? 1 : 0, 1);
ok('stroke width read', m3[1].sw, 1.5);

// 9. inherited group fill
const svg4 = '<svg><g fill="#777"><path d="M 0 0 L 1 1"/></g></svg>';
ok('inherited fill makes a region', marks(svg4)[0].isRegion ? 1 : 0, 1);

console.log(fails ? `\n${fails} FAILURES — _jqgeom is UNTRUSTED` : '\nall geometry self-tests pass');
process.exit(fails ? 1 : 0);
