import { navigate } from '../router.js';
import { CATALOG, nextUp, ensureStats } from '../engine/achievements.js';
import { escapeHtml } from '../ui.js';

export function awardsScreen(el, params, ctx) {
  const p = ctx.profile;
  ensureStats(p);
  const earnedCount = CATALOG.filter((a) => p.achievements[a.id] != null).length;
  const upcoming = nextUp(p, 3);

  el.innerHTML = `
    <div class="screen">
      <div class="topbar">
        <button class="btn ghost small" data-back>← Back</button>
        <span class="spacer"></span>
        <h2 style="margin:0">Awards 🏆</h2>
      </div>
      <p class="muted center" style="margin:0">${earnedCount} of ${CATALOG.length} earned</p>
      ${
        upcoming.length
          ? `<h3 style="margin-bottom:0">Next up!</h3>
             <div class="next-up">${upcoming
               .map(
                 (a) => `
              <div class="card next-card">
                <span class="award-emoji">${a.emoji}</span>
                <span class="next-text">
                  <strong>${escapeHtml(a.name)}</strong>
                  <span class="muted">${escapeHtml(a.desc)}</span>
                  <span class="meter"><span style="width:${Math.round((a.current / a.target) * 100)}%"></span></span>
                </span>
                <span class="next-count muted">${a.current}/${a.target}</span>
              </div>`
               )
               .join('')}</div>`
          : ''
      }
      <h3 style="margin-bottom:0">All awards</h3>
      <div class="award-grid"></div>
    </div>`;

  const grid = el.querySelector('.award-grid');
  for (const a of CATALOG) {
    const earned = p.achievements[a.id] != null;
    const current = Math.min(a.value(p), a.target);
    const card = document.createElement('div');
    card.className = `award-card${earned ? '' : ' locked'}`;
    card.setAttribute(
      'aria-label',
      `${a.name}: ${a.desc}${earned ? ', earned' : `, ${current} of ${a.target}`}`
    );
    card.innerHTML = `
      <span class="award-emoji">${a.emoji}</span>
      <strong>${escapeHtml(a.name)}</strong>
      <span class="award-desc muted">${escapeHtml(a.desc)}</span>
      ${earned ? '<span class="award-earned">Earned! 🐾</span>' : `<span class="meter"><span style="width:${Math.round((current / a.target) * 100)}%"></span></span>`}`;
    grid.appendChild(card);
  }

  el.querySelector('[data-back]').addEventListener('click', () => navigate('/home'));
}
