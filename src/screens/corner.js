// The Cozy Corner: the bridge's companion pets, grouped by species habitat
// so a full collection reads as a few cozy rows, never a wall of cards.
// Pets are zero-maintenance by design — the care workload stays with the
// dogs (docs/PHASE5.md).

import { navigate } from '../router.js';
import { PETS, petSVG } from '../art/pets.js';
import { MILESTONES, petForMilestone, isPetAdopted } from '../engine/cozy.js';
import { escapeHtml } from '../ui.js';
import { sfx, buzz } from '../sound.js';

const HABITATS = {
  cat: 'Cat Cushion 🛋️',
  rabbit: 'Rabbit Burrow 🕳️',
  guinea: 'Guinea Cottage 🏠',
  bird: 'Bird Perch 🌿',
  sloth: 'Sloth Tree 🌳',
  hedgehog: 'Hedgehog Hollow 🍂',
  turtle: 'Turtle Pond 💧',
};

export function cornerScreen(el, params, ctx) {
  const p = ctx.profile;

  el.innerHTML = `
    <div class="screen">
      <div class="topbar">
        <button class="btn ghost small" data-back>← Back</button>
        <span class="spacer"></span>
        <h2 style="margin:0">Cozy Corner 🏡</h2>
      </div>
      <p class="muted center" style="margin:0">Friends you've made along the way. Tap to say hi!</p>
      <div data-habitats></div>
    </div>`;

  // Which milestone earns each pet (for the ??? hint on locked ones).
  const msByPet = {};
  for (const m of MILESTONES) msByPet[petForMilestone(m.id).id] ??= m;

  const wrap = el.querySelector('[data-habitats]');
  for (const [species, title] of Object.entries(HABITATS)) {
    const pets = PETS.filter((x) => x.species === species);
    if (!pets.length) continue;
    const section = document.createElement('div');
    section.innerHTML = `<h3 class="habitat-title">${title}</h3><div class="pack-grid corner-grid"></div>`;
    const grid = section.querySelector('.corner-grid');
    for (const pet of pets) {
      const adopted = isPetAdopted(p, pet.id);
      const card = document.createElement(adopted ? 'button' : 'div');
      card.className = `dog-card${adopted ? '' : ' locked'}`;
      card.innerHTML = `<span class="dog">${petSVG(pet, 76)}</span>
        <span>${adopted ? escapeHtml(pet.name) : '???'}</span>
        ${adopted || !msByPet[pet.id] ? '' : `<span class="lock-hint">${msByPet[pet.id].label}</span>`}`;
      if (adopted) {
        card.setAttribute('aria-label', `Say hi to ${pet.name}`);
        card.addEventListener('click', () => {
          card.querySelector('.dog').classList.remove('wiggle');
          void card.offsetWidth;
          card.querySelector('.dog').classList.add('wiggle');
          sfx.bark();
          buzz(20);
        });
      }
      grid.appendChild(card);
    }
    wrap.appendChild(section);
  }

  el.querySelector('[data-back]').addEventListener('click', () => navigate('/home'));
}
