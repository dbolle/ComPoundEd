import { navigate } from '../router.js';
import { DOGS, dogSVG, accessoriesFor } from '../art/dogs.js';
import { isUnlocked } from '../engine/unlocks.js';
import { escapeHtml } from '../ui.js';

export function packScreen(el, params, ctx) {
  const p = ctx.profile;

  el.innerHTML = `
    <div class="screen">
      <div class="topbar">
        <button class="btn ghost small" data-back>← Back</button>
        <span class="spacer"></span>
        <h2 style="margin:0">My pack 🐶</h2>
      </div>
      <p class="muted center" style="margin:0">Tap a pup to play with them!</p>
      <div data-group-slot></div>
      <div class="pack-grid"></div>
    </div>`;

  const unlockedCount = DOGS.filter((d) => isUnlocked(p, d.id)).length;
  if (unlockedCount >= 2) {
    const groupBtn = document.createElement('button');
    groupBtn.className = 'btn accent';
    groupBtn.textContent = '🐕🐕 Play together';
    groupBtn.addEventListener('click', () => navigate('/group'));
    el.querySelector('[data-group-slot]').appendChild(groupBtn);
  }

  const grid = el.querySelector('.pack-grid');
  for (const dog of DOGS) {
    const unlocked = isUnlocked(p, dog.id);
    const card = document.createElement(unlocked ? 'button' : 'div');
    card.className = `dog-card${unlocked ? '' : ' locked'}${p.avatarDogId === dog.id ? ' buddy' : ''}`;
    card.innerHTML = `<span class="dog">${dogSVG(dog, 76, unlocked ? accessoriesFor(p, dog.id) : [])}</span>
      <span>${unlocked ? escapeHtml(dog.name) : '???'}</span>
      ${unlocked ? '' : `<span class="lock-hint">Master the ${dog.divTable ? `÷${dog.divTable}` : `×${dog.table}`}s</span>`}`;
    if (unlocked) {
      card.setAttribute('aria-label', `Play with ${dog.name}`);
      card.addEventListener('click', () => navigate(`/dog?id=${dog.id}`));
    }
    grid.appendChild(card);
  }

  el.querySelector('[data-back]').addEventListener('click', () => navigate('/home'));
}
