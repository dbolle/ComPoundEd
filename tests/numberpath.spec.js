// Number path 0–120 (v1.50.0): the three renderings in src/art/numberpath.js
// must never disagree about where a number lives, and placement must stay a
// ONE-tap, decade-graded question — 121 targets on a phone is the failure
// mode this file exists to prevent (docs/PEDAGOGY.md §2).
import { test, expect } from '@playwright/test';
import {
  xFor,
  nAt,
  decadeAt,
  decadeOf,
  decadeAtFraction,
  placementCorrect,
  windowFor,
  normalizeWindow,
  chartGeometry,
  chartHTML,
  chartRows,
  overviewSVG,
  placementSVG,
  placementStageHTML,
  placementLabel,
  WINDOWS,
  STRIP_WIDTH,
  PATH_LO,
  PATH_HI,
  DECADE,
} from '../src/art/numberpath.js';

const WIDTHS = [STRIP_WIDTH, 390, 480, 200];
const ALL = [...WINDOWS, [PATH_LO, PATH_HI]];

test('xFor is strictly monotonic, and the window ends land on 0 and width', () => {
  for (const [lo, hi] of ALL) {
    for (const w of WIDTHS) {
      expect(xFor(lo, lo, hi, w)).toBe(0);
      expect(xFor(hi, lo, hi, w)).toBe(w);
      let prev = -Infinity;
      for (let n = lo; n <= hi; n += 0.25) {
        const x = xFor(n, lo, hi, w);
        expect(x, `n=${n} in ${lo}-${hi} @${w}`).toBeGreaterThan(prev);
        prev = x;
      }
    }
  }
  // and the inverse agrees, so grading and drawing share one line
  for (let n = PATH_LO; n <= PATH_HI; n++) {
    expect(nAt(xFor(n, 0, 120, STRIP_WIDTH), 0, 120, STRIP_WIDTH)).toBeCloseTo(n, 6);
  }
});

test('chart cells and the placement strip agree about every number', () => {
  for (let start = PATH_LO; start <= PATH_HI; start += DECADE) {
    const geo = chartGeometry(start);
    expect(geo.cells).toHaveLength(20); // two rows of ten, always
    const win = windowFor(geo.rows[0] + 5);
    for (const c of geo.cells) {
      const rowLo = geo.rows[c.row];
      expect(c.col).toBe(c.n % DECADE); // tens stack in columns
      // a cell's own box comes straight from xFor over its decade
      expect(c.left).toBeCloseTo(xFor(c.n, rowLo, rowLo + DECADE, geo.width), 9);
      expect(c.right).toBeCloseTo(xFor(c.n + 1, rowLo, rowLo + DECADE, geo.width), 9);
      // …and the cell centre's place across its row is EXACTLY where the
      // same number sits between that decade's anchors on the strip.
      const a = xFor(rowLo, win.lo, win.hi, STRIP_WIDTH);
      const b = xFor(rowLo + DECADE, win.lo, win.hi, STRIP_WIDTH);
      const stripFrac = (xFor(c.n + 0.5, win.lo, win.hi, STRIP_WIDTH) - a) / (b - a);
      expect(stripFrac, `n=${c.n}`).toBeCloseTo(c.centre / geo.width, 9);
    }
  }
});

test('chart decade boundaries land on the strip decade anchors', () => {
  for (const [lo, hi] of WINDOWS) {
    for (let d = lo; d < hi; d += DECADE) {
      const geo = chartGeometry(d);
      const rowStart = geo.cells.find((c) => c.n === d);
      const rowEnd = geo.cells.find((c) => c.n === d + DECADE - 1);
      expect(rowStart.left).toBe(0); // row opens at its decade
      expect(rowEnd.right).toBeCloseTo(geo.width, 9); // and closes at the next
      // the anchors themselves are decade-aligned pixels on the strip
      const anchor = xFor(d, lo, hi, STRIP_WIDTH);
      expect(anchor).toBeCloseTo(((d - lo) / (hi - lo)) * STRIP_WIDTH, 9);
      expect(decadeAt(anchor, lo, hi, STRIP_WIDTH)).toBe(d);
    }
  }
});

test('a tap round-trips to the right decade for every number in the window', () => {
  for (const [lo, hi] of WINDOWS) {
    for (const w of [...WIDTHS, 1]) {
      for (let n = lo; n <= hi; n++) {
        expect(decadeAt(xFor(n, lo, hi, w), lo, hi, w), `n=${n} in ${lo}-${hi} @${w}`).toBe(
          decadeOf(n, lo, hi)
        );
      }
    }
    // scale-free grading: the fraction across the button is enough
    for (let n = lo; n <= hi; n++) {
      const bin = decadeOf(n, lo, hi);
      expect(placementCorrect(n, (n - lo) / (hi - lo), lo, hi)).toBe(true);
      expect(placementCorrect(n, (bin + 5 - lo) / (hi - lo), lo, hi)).toBe(true);
      const wrong = bin === lo ? bin + DECADE : bin - DECADE;
      expect(placementCorrect(n, (wrong + 5 - lo) / (hi - lo), lo, hi)).toBe(false);
    }
    // every bin is reachable, and only four of them exist
    const bins = new Set();
    for (let f = 0; f <= 1; f += 0.001) bins.add(decadeAtFraction(f, lo, hi));
    expect([...bins].sort((a, b) => a - b)).toEqual([lo, lo + 10, lo + 20, lo + 30]);
  }
});

test('windowFor gives a 40-wide window that keeps the target off the edge', () => {
  for (let n = PATH_LO; n <= PATH_HI; n++) {
    const { lo, hi } = windowFor(n);
    expect(hi - lo).toBe(40);
    expect(lo).toBeGreaterThanOrEqual(PATH_LO);
    expect(hi).toBeLessThanOrEqual(PATH_HI);
    expect(n >= lo && n <= hi).toBe(true);
    const margin = Math.min(n - lo, hi - n);
    const best = Math.max(
      ...WINDOWS.filter(([a, b]) => n >= a && n <= b).map(([a, b]) => Math.min(n - a, b - n))
    );
    expect(margin, `n=${n} could have sat further from an edge`).toBe(best);
    // only the two literal ends of the line have no room at all
    if (n !== PATH_LO && n !== PATH_HI) expect(margin).toBeGreaterThan(0);
    expect(windowFor(n)).toEqual(windowFor(n)); // deterministic, no random pick
  }
  // junk in, a usable window out — never a blank screen mid-question
  expect(normalizeWindow(25, 65)).toEqual({ lo: 20, hi: 60 });
  expect(normalizeWindow(NaN, NaN)).toEqual({ lo: 0, hi: 40 });
  expect(normalizeWindow(60, 100)).toEqual({ lo: 60, hi: 100 });
});

test('placement is one tap target, labelled, and at least 44px tall', () => {
  const html = placementSVG(20, 60, { target: 47 });
  expect((html.match(/<button/g) ?? [])).toHaveLength(1);
  expect(html).toContain('role="group" aria-label="Number path from 20 to 60"');
  expect(html).toContain('aria-label="Tap where 47 goes on the number path from 20 to 60"');
  expect(html).toContain('data-say="Tap where 47 goes."');
  expect(html).toContain('data-lo="20"');
  expect(html).toContain('data-hi="60"');
  const height = Number(/class="np-strip"[\s\S]*?height="(\d+(?:\.\d+)?)"/.exec(html)[1]);
  expect(height).toBeGreaterThanOrEqual(44);
  // five labelled decade boundaries, minor ticks between them, four bins
  expect(html.match(/class="np-lab"/g)).toHaveLength(5);
  for (const n of [20, 30, 40, 50, 60]) expect(html).toContain(`>${n}</text>`);
  expect(html.match(/np-tick major/g)).toHaveLength(5);
  expect(html.match(/np-tick minor/g)).toHaveLength(4);
  expect(html.match(/class="np-bin/g)).toHaveLength(4);
  for (const d of [20, 30, 40, 50]) expect(html).toContain(`data-decade="${d}"`);
  // every label is a real number, never blank
  for (const [, text] of html.matchAll(/class="np-lab"[^>]*>([^<]*)</g)) {
    expect(text.trim()).not.toBe('');
  }
  expect(placementLabel(null, 0, 40)).not.toBe('');
});

test('the overview is display-only: aria-hidden, no buttons, whole line shown', () => {
  const svg = overviewSVG(20, 60);
  expect(svg).toContain('aria-hidden="true"');
  expect(svg).not.toContain('<button');
  expect(svg).toMatch(/np-otick/);
  expect(svg.match(/np-otick/g)).toHaveLength(13); // 0,10,…,120
  expect(svg).toContain('data-lo="20"');
  // the highlight is placed by the shared map, in 0–120 space
  const win = /class="np-owin" x="([\d.]+)" y="3" width="([\d.]+)"/.exec(svg);
  expect(Number(win[1])).toBeCloseTo(xFor(20, 0, 120, STRIP_WIDTH), 1);
  expect(Number(win[2])).toBeCloseTo(
    xFor(60, 0, 120, STRIP_WIDTH) - xFor(20, 0, 120, STRIP_WIDTH),
    1
  );
});

test('the chart is display-only and its markup matches its geometry', () => {
  const html = chartHTML(20);
  expect(html).not.toContain('<button');
  expect(html).toContain('role="img"');
  expect(html).toContain('aria-label="Number chart from 20 to 39"');
  expect(html.match(/class="np-cell/g)).toHaveLength(20);
  const geo = chartGeometry(20);
  for (const c of geo.cells) {
    expect(html).toContain(
      `data-n="${c.n}" data-row="${c.row}" data-col="${c.col}" data-x="${
        Math.round(c.centre * 100) / 100
      }"`
    );
  }
  for (const n of [20, 29, 30, 39]) expect(html).toContain(`>${n}</span>`);
  // the top of the line: 120 exists, 121+ are empty slots that hold columns
  const top = chartHTML(110);
  expect(chartRows(110)).toEqual([110, 120]);
  expect(top).toContain('>120</span>');
  expect(top).not.toContain('>121</span>');
  expect(top.match(/np-cell gap/g)).toHaveLength(9);
  // decade starts are snapped, so no caller can invent a half-decade chart
  expect(chartRows(37)).toEqual([30, 40]);
  expect(chartRows(999)).toEqual([110, 120]);
  expect(chartRows(-5)).toEqual([0, 10]);
  // highlight and blank hooks
  const marked = chartHTML(40, { mark: [43], hide: [44] });
  expect(marked).toContain('class="np-cell now"');
  expect(marked).toContain('class="np-cell ask"');
  expect(marked).toContain('>?</span>');
});

test('no rendering uses a tooltip attribute (they do not exist on tablets)', () => {
  const samples = [
    overviewSVG(0, 40),
    overviewSVG(80, 120),
    chartHTML(0),
    chartHTML(110, { mark: [113], hide: [114] }),
    placementSVG(20, 60, { target: 47 }),
    placementSVG(80, 120, { target: 113, markAt: 113 }),
    ...[0, 7, 40, 47, 100, 120].map((n) => placementStageHTML(n)),
  ];
  for (const s of samples) {
    expect(s).not.toMatch(/title=/);
    expect(s).not.toMatch(/<title/);
  }
});

test('e2e 390×664: the strip fits, taps grade by decade, bins beat a fingertip', async ({
  page,
}) => {
  // The module is pure markup, so mount it on a bare page with the real
  // stylesheet — no profile, no app boot, nothing else to blame.
  await page.setViewportSize({ width: 390, height: 664 });
  await page.goto('about:blank');
  const target = 47;
  const { lo, hi } = windowFor(target);
  // The viewport meta is not decoration: without it the layout viewport
  // defaults to 980px, the `min-width: 700px` tablet rules match, and the
  // strip measures 480px in a 390px window — a phone-overflow failure that
  // only exists in a test page missing what index.html has.
  await page.setContent(
    `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">
     <div id="app"><div class="np-wrap">${overviewSVG(lo, hi)}${placementSVG(lo, hi, {
       target,
     })}</div>${chartHTML(lo)}</div>`
  );
  await page.addStyleTag({ path: 'src/styles/main.css' });
  await page.waitForSelector('.np-tap');

  // no horizontal overflow, no scrolling, one tap target
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  ).toBeLessThanOrEqual(0);
  expect(await page.$$eval('button', (els) => els.length)).toBe(1);

  const box = await page.locator('.np-tap').boundingBox();
  expect(box.height).toBeGreaterThanOrEqual(44);
  expect(box.width).toBeLessThanOrEqual(390);

  // each decade bin is a comfortable finger target (~90px at phone width)
  const bins = await page.$$eval('.np-bin', (els) =>
    els.map((el) => ({ w: el.getBoundingClientRect().width, d: Number(el.dataset.decade) }))
  );
  expect(bins.map((b) => b.d)).toEqual([lo, lo + 10, lo + 20, lo + 30]);
  for (const b of bins) expect(b.w).toBeGreaterThanOrEqual(60);

  // a real tap in the middle of the right bin passes; the neighbour fails
  const grade = async (n) => {
    const x = box.x + ((n - lo) / (hi - lo)) * box.width;
    await page.mouse.click(Math.min(x, box.x + box.width - 1), box.y + box.height / 2);
    return placementCorrect(
      target,
      (Math.min(x, box.x + box.width - 1) - box.x) / box.width,
      lo,
      hi
    );
  };
  expect(await grade(45)).toBe(true); // inside 40–49, the target's decade
  expect(await grade(52)).toBe(false);
  expect(await grade(49.9)).toBe(true);

  // the chart alongside stays inside the phone too, and offers no targets
  const chart = await page.locator('.np-chart').boundingBox();
  expect(chart.width).toBeLessThanOrEqual(358);
  expect(await page.$$eval('.np-cell', (els) => els.length)).toBe(20);
});
