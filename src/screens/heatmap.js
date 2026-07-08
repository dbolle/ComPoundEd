import { navigate } from '../router.js';
import { getStat, isDue, FACTOR_MIN, FACTOR_MAX, MASTERY_BOX } from '../engine/leitner.js';

// Sequential single-hue ramp (light → dark teal), one step per Leitner box.
// Lightness is strictly monotonic; unseen facts get a neutral so "no data"
// never reads as "low mastery".
const UNSEEN = '#f0e7da';
const RAMP = ['#ccf3ec', '#99e6da', '#5ed0c0', '#2cb3a1', '#128a7c', '#0b5f56'];
const LEVEL_NAMES = ['Sniffing', 'Learning', 'Warming up', 'Strong', 'Super', 'Pro'];

export function heatmapScreen(el, params, ctx) {
  const p = ctx.profile;

  el.innerHTML = `
    <div class="screen">
      <div class="topbar">
        <button class="btn ghost small" data-back>← Back</button>
        <span class="spacer"></span>
        <h2 style="margin:0">Progress map 🗺️</h2>
      </div>
      <div class="card">
        <div class="hm-grid" role="grid" aria-label="Multiplication mastery map"></div>
        <p class="hm-caption muted center">Tap a square to peek at a fact</p>
        <div class="hm-legend">
          <span class="hm-chip" style="background:${UNSEEN}"></span><span>New</span>
          ${RAMP.map((c) => `<span class="hm-chip" style="background:${c}"></span>`).join('')}
          <span>Pro</span>
        </div>
      </div>
    </div>`;

  const grid = el.querySelector('.hm-grid');
  const caption = el.querySelector('.hm-caption');

  const corner = document.createElement('span');
  corner.className = 'hm-head';
  corner.textContent = '×';
  grid.appendChild(corner);
  for (let b = FACTOR_MIN; b <= FACTOR_MAX; b++) {
    const h = document.createElement('span');
    h.className = 'hm-head';
    h.textContent = b;
    grid.appendChild(h);
  }

  for (let a = FACTOR_MIN; a <= FACTOR_MAX; a++) {
    const rh = document.createElement('span');
    rh.className = 'hm-head';
    rh.textContent = a;
    grid.appendChild(rh);
    for (let b = FACTOR_MIN; b <= FACTOR_MAX; b++) {
      const s = getStat(p, a, b);
      const seen = s.attempts > 0;
      // Levels never regress, but a fact past its freshness window shows as
      // faded — time for a refresh, not a demotion.
      const rusty = seen && s.box > 0 && isDue(s);
      const cell = document.createElement('button');
      cell.className = `hm-cell${rusty ? ' hm-due' : ''}`;
      cell.style.background = seen ? RAMP[s.box] : UNSEEN;
      const label = seen
        ? `${a} × ${b}: ${LEVEL_NAMES[s.box]}${s.box >= MASTERY_BOX ? ' (mastered)' : ''}${rusty ? ', needs a refresh' : ''}`
        : `${a} × ${b}: not tried yet`;
      cell.setAttribute('aria-label', label);
      cell.title = label;
      cell.addEventListener('click', () => {
        caption.textContent = seen
          ? `${a} × ${b} = ${a * b} · ${LEVEL_NAMES[s.box]} ${'🐾'.repeat(s.box + 1)}${rusty ? ' · time for a refresh!' : ''}`
          : `${a} × ${b} — not sniffed out yet!`;
      });
      grid.appendChild(cell);
    }
  }

  el.querySelector('[data-back]').addEventListener('click', () => navigate('/home'));
}
