// Group play setup: pick an activity and 2–3 pack dogs to do it together.
import { navigate } from '../router.js';
import { DOGS, dogSVG, wornFor } from '../art/dogs.js';
import { isUnlocked } from '../engine/unlocks.js';
import { isTableMastered, tableDueCount, tableProgress } from '../engine/leitner.js';
import { escapeHtml } from '../ui.js';

const MAX_DOGS = 3;

export function groupScreen(el, params, ctx) {
  const unlocked = DOGS.filter((d) => isUnlocked(ctx.profile, d.id));
  const selected = new Set();
  let kind = 'walk';

  el.innerHTML = `
    <div class="screen">
      <div class="topbar">
        <button class="btn ghost small" data-back>← Pack</button>
        <span class="spacer"></span>
        <h2 style="margin:0">Play together 🐕🐕</h2>
      </div>
      <div class="activity-row">
        <button class="btn ghost kind-btn selected" data-kind="walk">🦮 Walk</button>
        <button class="btn ghost kind-btn" data-kind="feed">🍖 Feed</button>
        <button class="btn ghost kind-btn" data-kind="fetch">🎾 Fetch</button>
      </div>
      <p class="muted center" style="margin:0">Pick 2 or 3 pups to bring along!</p>
      <div data-train-tip></div>
      <div class="pack-grid"></div>
      <button class="btn" data-start disabled>Let's go! 🐾</button>
    </div>`;

  const grid = el.querySelector('.pack-grid');
  const startBtn = el.querySelector('[data-start]');

  // Training-partner tip: collar credit needs a friend who's still
  // learning — suggest the pack's weakest table, tap to add them.
  const partners = unlocked
    .filter((d) => d.table != null && (!isTableMastered(ctx.profile, d.table) || tableDueCount(ctx.profile, d.table) > 0))
    .sort((x, y) => {
      const px = tableProgress(ctx.profile, x.table);
      const py = tableProgress(ctx.profile, y.table);
      return px.points / px.maxPoints - py.points / py.maxPoints;
    });
  if (partners.length) {
    const weak = partners[0];
    const tip = document.createElement('button');
    tip.className = 'teach-banner train-tip';
    tip.innerHTML = `${dogSVG(weak, 44, wornFor(ctx.profile, weak.id))}
      <span><b>${escapeHtml(weak.name)}</b> is still learning the ×${weak.table}s — bring them along for collar training! 🦮</span>`;
    tip.addEventListener('click', () => {
      grid.querySelector(`[data-dog="${weak.id}"]`)?.click();
      tip.remove();
    });
    el.querySelector('[data-train-tip]').appendChild(tip);
  }

  for (const dog of unlocked) {
    const card = document.createElement('button');
    card.className = 'dog-card';
    card.dataset.dog = dog.id;
    card.innerHTML = `<span class="dog">${dogSVG(dog, 76, wornFor(ctx.profile, dog.id))}</span>
      <span>${escapeHtml(dog.name)}</span>`;
    card.setAttribute('aria-pressed', 'false');
    card.addEventListener('click', () => {
      if (selected.has(dog.id)) {
        selected.delete(dog.id);
        card.classList.remove('selected');
      } else if (selected.size < MAX_DOGS) {
        selected.add(dog.id);
        card.classList.add('selected');
      }
      card.setAttribute('aria-pressed', String(selected.has(dog.id)));
      startBtn.disabled = selected.size < 2;
      startBtn.textContent =
        selected.size < 2 ? "Let's go! 🐾" : `Let's go with ${selected.size} pups! 🐾`;
    });
    grid.appendChild(card);
  }

  for (const b of el.querySelectorAll('.kind-btn')) {
    b.addEventListener('click', () => {
      kind = b.dataset.kind;
      for (const x of el.querySelectorAll('.kind-btn')) x.classList.toggle('selected', x === b);
    });
  }

  startBtn.addEventListener('click', () => {
    if (selected.size >= 2) navigate(`/activity?dogs=${[...selected].join(',')}&kind=${kind}`);
  });
  el.querySelector('[data-back]').addEventListener('click', () => navigate('/pack'));
}
