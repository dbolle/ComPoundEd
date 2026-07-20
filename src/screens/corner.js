// The Cozy Corner: the bridge's companion pets, grouped by species habitat
// so a full collection reads as a few cozy rows, never a wall of cards.
// Pets are zero-maintenance by design — the care workload stays with the
// dogs (docs/PHASE5.md).

import { navigate } from '../router.js';
import { PETS, petSVG } from '../art/pets.js';
import { MILESTONES, petForMilestone, isPetAdopted } from '../engine/cozy.js';
import { escapeHtml } from '../ui.js';
import { sfx, buzz, cheer } from '../sound.js';

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
      const isBuddy = p.avatarPetId === pet.id;
      const card = document.createElement('div');
      card.className = `dog-card${adopted ? '' : ' locked'}${isBuddy ? ' buddy' : ''}`;
      card.innerHTML = adopted
        ? `<button class="pet-hello" aria-label="Say hi to ${escapeHtml(pet.name)}">
             <span class="dog">${petSVG(pet, 76)}</span></button>
           <span>${escapeHtml(pet.name)}</span>
           <button class="btn ghost small buddy-pick" aria-label="Make ${escapeHtml(pet.name)} your buddy">
             ${isBuddy ? '❤️ My buddy!' : '🤍 Pick me!'}</button>`
        : `<span class="dog">${petSVG(pet, 76)}</span>
           <span>???</span>
           ${msByPet[pet.id] ? `<span class="lock-hint">${msByPet[pet.id].label}</span>` : ''}`;
      if (adopted) {
        card.querySelector('.pet-hello').addEventListener('click', () => {
          card.querySelector('.dog').classList.remove('wiggle');
          void card.offsetWidth;
          card.querySelector('.dog').classList.add('wiggle');
          sfx.bark();
          buzz(20);
        });
        card.querySelector('.buddy-pick').addEventListener('click', async () => {
          if (p.avatarPetId === pet.id) return;
          p.avatarPetId = pet.id;
          await ctx.save();
          cheer(`${pet.name} is your buddy now!`);
          buzz([20, 30, 20]);
          cornerScreen(el, params, ctx); // re-render the hearts
        });
      }
      grid.appendChild(card);
    }
    wrap.appendChild(section);
  }

  el.querySelector('[data-back]').addEventListener('click', () => navigate('/home'));
}
