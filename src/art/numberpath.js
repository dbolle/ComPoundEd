// The number path 0–120 (v1.50.0): ONE coordinate function, three
// renderings. docs/PEDAGOGY.md §2 — what the evidence supports is the
// LINEAR layout, so the overview strip, the two-row chart and the zoomed
// placement strip all derive every pixel from `xFor()`. None of them owns
// any layout maths of its own, which is why they cannot disagree about
// where a number lives.
//
// The zoom is a TOUCH decision, not a graphic one. 121 tap targets across a
// phone would be ~3px each, so placement asks for a 40-wide window and
// grades by DECADE: four bins of ~90px (≈23mm) at the 358px content width
// of a 390px phone — comfortably bigger than a fingertip. One button, one
// tap, four possible right answers.
//
// Grading is scale-free: pass the fraction across the tapped element
// (`placementCorrect`), so the same maths works on a phone and an iPad
// without anyone re-measuring anything.

export const PATH_LO = 0;
export const PATH_HI = 120;
export const DECADE = 10;
export const WINDOW_SPAN = 40; // four decades per zoomed window

// The five windows. Overlapping by two decades so every number can sit
// away from an edge (see windowFor).
export const WINDOWS = [
  [0, 40],
  [20, 60],
  [40, 80],
  [60, 100],
  [80, 120],
];

export const STRIP_WIDTH = 358; // 390px phone minus #app's 16px gutters
export const PLACE_HEIGHT = 92; // the tap band: well past the 44px floor
export const OVERVIEW_HEIGHT = 28;

// Boundary taps belong to the decade they open, not the one they close;
// this soaks up the last-bit error of a divide before flooring.
const EPS = 1e-9;

const r2 = (v) => Math.round(v * 100) / 100;
const clampN = (n) => Math.min(PATH_HI, Math.max(PATH_LO, n));

// ── The shared coordinate map ────────────────────────────────────────────
// Strictly increasing in n, xFor(lo) === 0 and xFor(hi) === width.
// Deliberately NOT clamped: callers that want a marker off the window's
// edge get an honest off-strip coordinate rather than a silent lie.
export function xFor(n, lo, hi, width = STRIP_WIDTH) {
  return ((n - lo) * width) / (hi - lo);
}

// The inverse: which number sits under pixel x.
export function nAt(x, lo, hi, width = STRIP_WIDTH) {
  return lo + (x * (hi - lo)) / width;
}

// Which decade BIN of the window [lo, hi] a number falls in. The top of
// the window (120 in 80–120) belongs to the last bin — a number path has
// no room to the right of its end.
export function decadeOf(n, lo = PATH_LO, hi = PATH_HI) {
  const bins = Math.max(1, Math.round((hi - lo) / DECADE));
  const i = Math.min(bins - 1, Math.max(0, Math.floor((n - lo) / DECADE + EPS)));
  return lo + i * DECADE;
}

// Which decade a tap at pixel x lands in — the grading function.
export function decadeAt(x, lo, hi, width = STRIP_WIDTH) {
  return decadeOf(nAt(x, lo, hi, width), lo, hi);
}

// Same thing from a fraction across the tapped element (0…1), so grading
// never has to know the rendered pixel width.
export function decadeAtFraction(frac, lo, hi) {
  return decadeAt(frac, lo, hi, 1);
}

// A tap is right when it lands in the target's decade segment.
export function placementCorrect(target, frac, lo, hi) {
  return decadeAtFraction(frac, lo, hi) === decadeOf(target, lo, hi);
}

// ── Choosing the window ─────────────────────────────────────────────────
// The 40-wide window containing target, preferring the one where the
// target sits furthest from either edge (a number pinned to the very end
// of the strip is a trick question, not a magnitude question). Ties go to
// the lower window so the same target always draws the same picture.
export function windowFor(target) {
  const t = clampN(Number.isFinite(target) ? target : PATH_LO);
  let best = null;
  for (const [lo, hi] of WINDOWS) {
    if (t < lo || t > hi) continue;
    const margin = Math.min(t - lo, hi - t);
    if (!best || margin > best.margin) best = { lo, hi, margin };
  }
  return { lo: best.lo, hi: best.hi };
}

// Accept only decade-aligned 40-wide windows inside 0–120; anything else
// is coerced rather than thrown, because a bad window must never be a
// blank screen for a child mid-question.
export function normalizeWindow(lo, hi) {
  const ok =
    Number.isFinite(lo) &&
    Number.isFinite(hi) &&
    hi - lo === WINDOW_SPAN &&
    lo % DECADE === 0 &&
    lo >= PATH_LO &&
    hi <= PATH_HI;
  return ok ? { lo, hi } : windowFor(Number.isFinite(lo) ? lo + WINDOW_SPAN / 2 : PATH_LO);
}

// ── 1. Overview: the whole 0–120 line, window highlighted ───────────────
// Display only, never tapped, and aria-hidden — the prompt text carries
// the meaning, and reading out thirteen tick marks carries none.
export function overviewSVG(lo, hi, { width = STRIP_WIDTH, height = OVERVIEW_HEIGHT } = {}) {
  const w = Math.max(80, width);
  const win = normalizeWindow(lo, hi);
  const x = (n) => xFor(n, PATH_LO, PATH_HI, w);
  let ticks = '';
  for (let n = PATH_LO; n <= PATH_HI; n += DECADE) {
    const cx = Math.min(Math.max(x(n), 0.6), w - 0.6);
    ticks += `<line class="np-otick" x1="${r2(cx)}" y1="7" x2="${r2(cx)}" y2="16"/>`;
  }
  const a = x(win.lo);
  const b = x(win.hi);
  return `<svg class="np-overview" viewBox="0 0 ${w} ${height}" width="${w}" height="${height}"
      aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
    <rect class="np-oline" x="0" y="10.5" width="${w}" height="2.5" rx="1.25"/>
    ${ticks}
    <rect class="np-owin" x="${r2(a)}" y="3" width="${r2(b - a)}" height="17" rx="5"
      data-lo="${win.lo}" data-hi="${win.hi}"/>
    <text class="np-oend" x="1" y="${height - 2}" text-anchor="start">${PATH_LO}</text>
    <text class="np-oend" x="${w - 1}" y="${height - 2}" text-anchor="end">${PATH_HI}</text>
  </svg>`;
}

// ── 2. Chart: two rows of ten, tens stacked in columns ──────────────────
// Each row is itself a ten-wide number path at the same scale, laid out by
// the SAME xFor — so a cell's position across its row is exactly where
// that number sits between the decade anchors of the placement strip.
export function chartRows(decadeStart) {
  const d = Number.isFinite(decadeStart) ? decadeStart : PATH_LO;
  const start = Math.min(
    PATH_HI - DECADE,
    Math.max(PATH_LO, Math.floor(clampN(d) / DECADE) * DECADE)
  );
  return [start, start + DECADE];
}

export function chartGeometry(decadeStart, { width = STRIP_WIDTH } = {}) {
  const rows = chartRows(decadeStart);
  const cells = [];
  rows.forEach((rowLo, row) => {
    for (let i = 0; i < DECADE; i++) {
      const n = rowLo + i;
      cells.push({
        n,
        row,
        col: i,
        left: xFor(n, rowLo, rowLo + DECADE, width),
        right: xFor(n + 1, rowLo, rowLo + DECADE, width),
        centre: xFor(n + 0.5, rowLo, rowLo + DECADE, width),
        blank: n > PATH_HI,
      });
    }
  });
  return { rows, width, cellWidth: width / DECADE, cells };
}

// Display only: no touch targets, because the answer comes from choice
// buttons. Cell size is therefore a legibility question, not a fingertip
// one. `mark` lights numbers up; `hide` turns one into an empty slot.
export function chartHTML(decadeStart, { mark = [], hide = [], width = STRIP_WIDTH } = {}) {
  const geo = chartGeometry(decadeStart, { width });
  const marked = new Set([].concat(mark));
  const hidden = new Set([].concat(hide));
  const cells = geo.cells
    .map((c) => {
      const cls = ['np-cell'];
      if (c.blank) cls.push('gap');
      else if (hidden.has(c.n)) cls.push('ask');
      else if (marked.has(c.n)) cls.push('now');
      const text = c.blank ? '' : hidden.has(c.n) ? '?' : String(c.n);
      return `<span class="${cls.join(' ')}" data-n="${c.n}" data-row="${c.row}" data-col="${c.col}" data-x="${r2(c.centre)}">${text}</span>`;
    })
    .join('');
  const last = Math.min(PATH_HI, geo.rows[1] + DECADE - 1);
  return `<div class="np-chart" role="img" aria-label="Number chart from ${geo.rows[0]} to ${last}">${cells}</div>`;
}

// ── 3. Placement: the zoomed window, ONE tap target ─────────────────────
export function placementLabel(target, lo, hi) {
  return Number.isFinite(target)
    ? `Tap where ${target} goes on the number path from ${lo} to ${hi}`
    : `Tap on the number path from ${lo} to ${hi}`;
}

export function placementSay(target) {
  return Number.isFinite(target) ? `Tap where ${target} goes.` : 'Tap on the number path.';
}

// Callers speak `button.dataset.say` when the question appears (the tap
// itself is an ANSWER, so it must not double as a replay control).
// `markAt` draws the reveal marker after grading.
export function placementSVG(
  lo,
  hi,
  { width = STRIP_WIDTH, height = PLACE_HEIGHT, target = null, markAt = null } = {}
) {
  const win = normalizeWindow(lo, hi);
  const w = Math.max(160, width);
  const x = (n) => xFor(n, win.lo, win.hi, w);

  // The four decade bins, shaded alternately: the size of a right answer
  // is shown, not explained.
  let bins = '';
  for (let d = win.lo; d < win.hi; d += DECADE) {
    const x1 = x(d);
    const x2 = x(d + DECADE);
    const alt = ((d - win.lo) / DECADE) % 2 ? ' alt' : '';
    bins += `<rect class="np-bin${alt}" x="${r2(x1)}" y="30" width="${r2(x2 - x1)}" height="32" data-decade="${d}"/>`;
  }

  // Halfway ticks first (under the majors), then the five labelled decade
  // boundaries. At this zoom the every-ten ticks ARE the boundaries, so
  // the minors mark the 5s and give the eye a midpoint inside each bin.
  let minors = '';
  for (let n = win.lo + DECADE / 2; n < win.hi; n += DECADE) {
    minors += `<rect class="np-tick minor" x="${r2(x(n) - 1)}" y="38" width="2" height="18" rx="1"/>`;
  }
  let majors = '';
  let labels = '';
  for (let n = win.lo; n <= win.hi; n += DECADE) {
    const cx = x(n);
    const tx = Math.min(Math.max(cx - 1.6, 0), w - 3.2);
    majors += `<rect class="np-tick major" x="${r2(tx)}" y="24" width="3.2" height="44" rx="1.6" data-n="${n}"/>`;
    const anchor = n === win.lo ? 'start' : n === win.hi ? 'end' : 'middle';
    labels += `<text class="np-lab" x="${r2(cx)}" y="84" text-anchor="${anchor}">${n}</text>`;
  }

  let marker = '';
  if (Number.isFinite(markAt)) {
    const cx = Math.min(Math.max(x(markAt), 12), w - 12);
    marker = `<g class="np-mark" data-n="${markAt}">
      <line x1="${r2(cx)}" y1="18" x2="${r2(cx)}" y2="64"/>
      <circle cx="${r2(cx)}" cy="14" r="12"/>
      <text x="${r2(cx)}" y="19" text-anchor="middle">${markAt}</text>
    </g>`;
  }

  return `<div class="np-place" role="group" aria-label="Number path from ${win.lo} to ${win.hi}">
    <button class="np-tap" type="button" data-lo="${win.lo}" data-hi="${win.hi}" data-width="${w}"${
      Number.isFinite(target) ? ` data-target="${target}"` : ''
    }
      aria-label="${placementLabel(target, win.lo, win.hi)}" data-say="${placementSay(target)}">
      <svg class="np-strip" viewBox="0 0 ${w} ${height}" width="${w}" height="${height}"
          aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
        ${bins}
        <rect class="np-line" x="0" y="46" width="${w}" height="3" rx="1.5"/>
        ${minors}${majors}${labels}${marker}
      </svg>
    </button>
  </div>`;
}

// The whole question in one lump: overview above, one tap target below.
export function placementStageHTML(target, { width = STRIP_WIDTH } = {}) {
  const win = windowFor(target);
  return `<div class="np-wrap">
    ${overviewSVG(win.lo, win.hi, { width })}
    ${placementSVG(win.lo, win.hi, { width, target })}
  </div>`;
}
