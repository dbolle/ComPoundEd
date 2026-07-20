import { navigate } from '../router.js';
import { DOGS, dogSVG, wornFor, dirtFor } from '../art/dogs.js';
import { storefrontSVG } from '../art/gear.js';
import { balanceCents, formatPaw } from '../engine/money.js';
import { isUnlocked } from '../engine/unlocks.js';
import { escapeHtml, toast } from '../ui.js';

export function packScreen(el, params, ctx) {
  const p = ctx.profile;

  el.innerHTML = `
    <div class="screen">
      <div class="topbar">
        <button class="btn ghost small" data-back>← Back</button>
        <span class="spacer"></span>
        <button class="paw-chip" data-wallet aria-label="Wallet">${formatPaw(balanceCents(p))}</button>
        <h2 style="margin:0">My pack 🐶</h2>
      </div>
      <p class="muted center" style="margin:0">Tap a pup to play with them!</p>
      <div data-group-slot></div>
      <div class="pack-grid"></div>
    </div>`;

  if (p.petUnlocks?.length) {
    const corner = document.createElement('button');
    corner.className = 'btn accent';
    corner.textContent = '🏡 Cozy Corner';
    corner.addEventListener('click', () => navigate('/corner'));
    el.querySelector('[data-group-slot]').appendChild(corner);
  }

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
    card.className = `dog-card${unlocked ? '' : ' locked'}${p.avatarDogId === dog.id && !p.avatarPetId ? ' buddy' : ''}`;
    card.innerHTML = `<span class="dog">${dogSVG(dog, 76, unlocked ? wornFor(p, dog.id) : [], unlocked ? dirtFor(p, dog) : 0)}</span>
      <span>${unlocked ? escapeHtml(dog.name) : '???'}</span>
      ${unlocked ? '' : `<span class="lock-hint">Get the ${dog.divTable ? `÷${dog.divTable}` : `×${dog.table}`}s strong ⭐</span>`}`;
    if (unlocked) {
      card.setAttribute('aria-label', `Play with ${dog.name}`);
      card.addEventListener('click', () => navigate(`/dog?id=${dog.id}`));
    }
    grid.appendChild(card);
  }

  // Pet Store teaser (Phase 4b): builds anticipation — and savings — while
  // the store is under construction. Remove this block to roll back.
  const store = document.createElement('button');
  store.className = 'dog-card store-soon';
  store.setAttribute('aria-label', 'Pet store, opening soon');
  store.innerHTML = `<span class="dog">${storefrontSVG(76)}</span>
    <span>Pet store</span>
    <span class="lock-hint">🚧 Opening soon!</span>`;
  store.addEventListener('click', () => {
    const art = store.querySelector('.dog');
    art.classList.remove('wiggle');
    void art.offsetWidth; // restart the animation on repeat taps
    art.classList.add('wiggle');
    toast('The Pet Store is being built! Keep saving your Paw Bucks 🐾');
  });
  grid.appendChild(store);

  el.querySelector('[data-wallet]').addEventListener('click', () => navigate('/wallet'));
  el.querySelector('[data-back]').addEventListener('click', () => navigate('/home'));
}
