import { navigate } from '../router.js';
import {
  FAMILIES,
  TIERS,
  tierInfo,
  tierOf,
  thresholdFor,
  nextUp,
  totalTiers,
  checkAchievements,
  ensureStats,
} from '../engine/achievements.js';
import { escapeHtml } from '../ui.js';

export function awardsScreen(el, params, ctx) {
  const p = ctx.profile;
  ensureStats(p);
  // Reconcile stored tiers with live values (e.g. after migrations), so the
  // header, Next up, and cards always agree.
  if (checkAchievements(p).length) ctx.save();
  const upcoming = nextUp(p, 3);

  el.innerHTML = `
    <div class="screen">
      <div class="topbar">
        <button class="btn ghost small" data-back>← Back</button>
        <span class="spacer"></span>
        <h2 style="margin:0">Awards 🏆</h2>
      </div>
      <p class="muted center" style="margin:0">${totalTiers(p)} tiers earned</p>
      ${
        upcoming.length
          ? `<h3 style="margin-bottom:0">Next up!</h3>
             <div class="next-up">${upcoming
               .map(
                 (a) => `
              <div class="card next-card">
                <span class="award-emoji">${a.emoji}</span>
                <span class="next-text">
                  <strong>${escapeHtml(a.name)} → ${a.nextTier.emoji} ${escapeHtml(a.nextTier.name)}</strong>
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
  for (const f of FAMILIES) {
    const tier = tierOf(f, p);
    const nextTh = thresholdFor(f, tier + 1);
    const complete = nextTh == null;
    const current = nextTh == null ? f.value(p) : Math.min(f.value(p), nextTh);
    const t = tierInfo(tier);
    // Tier pips: earned medals, then empty slots up to the named ladder.
    const pipCount = Math.max(TIERS.length, tier);
    let pips = '';
    for (let i = 1; i <= pipCount; i++) pips += i <= tier ? tierInfo(i).emoji : '▫️';

    const card = document.createElement('div');
    card.className = `award-card${tier > 0 ? '' : ' locked'}`;
    card.setAttribute(
      'aria-label',
      `${f.name}: ${f.desc}. ${tier > 0 ? `${t.name} tier` : 'not earned yet'}${complete ? ', complete' : `, ${current} of ${nextTh}`}`
    );
    card.innerHTML = `
      <span class="award-emoji">${f.emoji}</span>
      <strong>${escapeHtml(f.name)}</strong>
      <span class="award-desc muted">${escapeHtml(f.desc)}</span>
      <span class="award-pips">${pips}</span>
      ${
        complete
          ? `<span class="award-earned">${t.emoji} ${escapeHtml(t.name)} — complete!</span>`
          : tier > 0
            ? `<span class="award-earned">${t.emoji} ${escapeHtml(t.name)}</span>
               <span class="meter"><span style="width:${Math.round((current / nextTh) * 100)}%"></span></span>
               <span class="award-desc muted">${current}/${nextTh} to ${tierInfo(tier + 1).name}</span>`
            : `<span class="meter"><span style="width:${Math.round((current / nextTh) * 100)}%"></span></span>
               <span class="award-desc muted">${current}/${nextTh} to Bronze</span>`
      }`;
    grid.appendChild(card);
  }

  el.querySelector('[data-back]').addEventListener('click', () => navigate('/home'));
}
