import { navigate } from '../router.js';
import {
  tableProgress,
  isTableMastered,
  divisionTableProgress,
  divisionTableUnlocked,
  isDivisionTableMastered,
  TABLE_MIN,
  TABLE_MAX,
} from '../engine/leitner.js';
import { sittingReady } from '../engine/selector.js';
import { getDog, dogSVG, accessoriesFor, GUESTS } from '../art/dogs.js';
import { escapeHtml } from '../ui.js';

export function homeScreen(el, params, ctx) {
  const p = ctx.profile;

  el.innerHTML = `
    <div class="screen">
      <div class="hero">
        <span class="avatar">${dogSVG(getDog(p.avatarDogId), 84, accessoriesFor(p, p.avatarDogId))}</span>
        <div>
          <h1>Hi, ${escapeHtml(p.name)}!</h1>
          <p class="muted">Ready to fetch some facts?</p>
        </div>
      </div>
      <button class="btn" data-mixed>🎲 Mixed round!</button>
      <div data-sitting-slot></div>
      <h3>Pick a table</h3>
      <div class="table-grid"></div>
      <div data-division-slot></div>
      <div class="nav-row three">
        <button class="btn accent" data-nav="/pack">🐶 Pack</button>
        <button class="btn accent" data-nav="/heatmap">🗺️ Map</button>
        <button class="btn accent" data-nav="/awards">🏆 Awards</button>
      </div>
      <div class="nav-row">
        <button class="btn ghost small" data-nav="/profiles">🔄 Switch player</button>
        <button class="btn ghost small" data-nav="/grownups">🔒 Grown-ups</button>
      </div>
    </div>`;

  const grid = el.querySelector('.table-grid');
  for (let t = TABLE_MIN; t <= TABLE_MAX; t++) {
    const { done, total, points, maxPoints } = tableProgress(p, t);
    const mastered = isTableMastered(p, t);
    const btn = document.createElement('button');
    btn.className = `table-btn${mastered ? ' mastered' : ''}`;
    btn.setAttribute('aria-label', `Practice the ${t}s table, ${done} of ${total} facts strong`);
    btn.innerHTML = `<span>${mastered ? '⭐ ' : ''}×${t}</span>
      <span class="meter"><span style="width:${Math.round((points / maxPoints) * 100)}%"></span></span>`;
    btn.addEventListener('click', () => navigate(`/quiz?table=${t}`));
    grid.appendChild(btn);
  }

  // Missing-number & division: appears once any table is mastered; each ÷t
  // opens when its ×t is mastered — the bridge from products to quotients.
  const anyMastered = Array.from(
    { length: TABLE_MAX - TABLE_MIN + 1 },
    (_, i) => TABLE_MIN + i
  ).some((t) => isTableMastered(p, t));
  if (anyMastered) {
    const slot = el.querySelector('[data-division-slot]');
    slot.innerHTML = `<h3>Missing number & division 🧩</h3><div class="div-grid"></div>`;
    const dgrid = slot.querySelector('.div-grid');
    for (let t = TABLE_MIN; t <= TABLE_MAX; t++) {
      const open = divisionTableUnlocked(p, t);
      const mastered = isDivisionTableMastered(p, t);
      const { done, total, points, maxPoints } = divisionTableProgress(p, t);
      const btn = document.createElement('button');
      btn.className = `table-btn${mastered ? ' mastered' : ''}${open ? '' : ' locked'}`;
      if (open) {
        btn.setAttribute(
          'aria-label',
          `Practice missing-number and division for the ${t}s, ${done} of ${total} facts strong`
        );
        btn.innerHTML = `<span>${mastered ? '⭐ ' : ''}÷${t}</span>
          <span class="meter"><span style="width:${Math.round((points / maxPoints) * 100)}%"></span></span>`;
        btn.addEventListener('click', () => navigate(`/quiz?dtable=${t}`));
      } else {
        btn.disabled = true;
        btn.setAttribute('aria-label', `Master the ×${t} table to unlock division`);
        btn.innerHTML = `<span>🔒 ÷${t}</span><span class="meter"><span style="width:0%"></span></span>`;
      }
      dgrid.appendChild(btn);
    }
  }

  // Pet sitting appears once there's a baseline of solid facts to draw
  // quick wins from; the guest pup rotates daily.
  if (sittingReady(p)) {
    const guest = GUESTS[Math.floor(Date.now() / 86400000) % GUESTS.length];
    const sitBtn = document.createElement('button');
    sitBtn.className = 'sitting-card';
    sitBtn.innerHTML = `<span class="avatar">${dogSVG(guest, 64, accessoriesFor(p, guest.id))}</span>
      <span class="sitting-text"><strong>🏡 Pet sitting</strong>
      <span class="muted">${escapeHtml(guest.name)} needs a sitter today!</span></span>`;
    sitBtn.addEventListener('click', () => navigate(`/activity?sit=${guest.id}`));
    el.querySelector('[data-sitting-slot]').appendChild(sitBtn);
  }

  el.querySelector('[data-mixed]').addEventListener('click', () => navigate('/quiz'));
  for (const b of el.querySelectorAll('[data-nav]')) {
    b.addEventListener('click', () => navigate(b.dataset.nav));
  }
}
