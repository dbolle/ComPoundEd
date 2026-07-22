// The Pet Store (BETA — reachable only via the Grown-Ups 🧪 flag; see
// src/engine/beta.js). Buying is money math: the price decomposes into
// coin lines (Paw Bucks ×100, quarters ×25, dimes ×10, nickels ×5) the
// kid multiplies out, plus an addition total when there's more than one
// line. Checkout questions record nothing — applied math, not drill.

import { navigate } from '../router.js';
import { CATALOG, buyGear, isOwned, ownedGear, itemOf } from '../engine/gearshop.js';
import { balanceCents, formatPaw } from '../engine/money.js';
import { GEAR_ACCESSORIES, TOYS, toySVG } from '../art/gear.js';
import { DOGS, dogSVG, wornFor } from '../art/dogs.js';
import { PETS, petSVG } from '../art/pets.js';
import { isUnlocked } from '../engine/unlocks.js';
import { buildNumpad, confetti, escapeHtml, toast } from '../ui.js';
import { sfx, buzz, cheer } from '../sound.js';

const LINE_DENOMS = [
  { cents: 100, label: '💵 Paw Bucks' },
  { cents: 25, label: '🪙 quarters' },
  { cents: 10, label: '🪙 dimes' },
  { cents: 5, label: '🪙 nickels' },
];

// Greedy largest-first decomposition — every price is a 5¢ multiple, so
// this always terminates with counts a kid can multiply (≤ 12 per line
// for the whole catalog).
export function coinLines(price) {
  const lines = [];
  let rem = price;
  for (const d of LINE_DENOMS) {
    const count = Math.floor(rem / d.cents);
    if (count > 0) {
      lines.push({ count, value: d.cents, label: d.label, product: count * d.cents });
      rem -= count * d.cents;
    }
  }
  return lines;
}

export function storeScreen(el, params, ctx) {
  const p = ctx.profile;

  el.innerHTML = `
    <div class="screen">
      <div class="topbar">
        <button class="btn ghost small" data-back>← Pack</button>
        <span class="spacer"></span>
        <span class="paw-chip" data-balance>${formatPaw(balanceCents(p))}</span>
        <h2 style="margin:0">Pet Store 🏪</h2>
      </div>
      <p class="muted center" style="margin:0">🧪 Beta — paying is real coin math!</p>
      <div data-shelves></div>
      <div data-checkout hidden></div>
    </div>`;

  const shelves = el.querySelector('[data-shelves]');
  const checkoutEl = el.querySelector('[data-checkout]');

  const artFor = (item) =>
    item.tier === 'toy'
      ? toySVG(item.id, 64)
      : `<span style="font-size:2.6rem">${item.emoji}</span>`;

  function renderShelves() {
    el.querySelector('[data-balance]').textContent = formatPaw(balanceCents(p));
    shelves.innerHTML = '';
    const groups = [
      { title: 'Toys 🧸', items: TOYS },
      { title: 'Gifts 🎁 (pick who they’re for!)', items: GEAR_ACCESSORIES.filter((i) => i.tier === 'gift') },
      { title: 'Treasures 👑', items: GEAR_ACCESSORIES.filter((i) => i.tier === 'treasure') },
    ];
    const ownedToys = ownedGear(p).filter(({ item }) => itemOf(item)?.tier === 'toy');
    if (ownedToys.length) {
      const box = document.createElement('p');
      box.className = 'muted center';
      box.style.margin = '0';
      box.innerHTML = `🧺 Your toy box: ${ownedToys.map(({ item }) => itemOf(item).emoji).join(' ')}`;
      shelves.appendChild(box);
    }
    for (const grp of groups) {
      const head = document.createElement('h3');
      head.className = 'habitat-title';
      head.textContent = grp.title;
      shelves.appendChild(head);
      const grid = document.createElement('div');
      grid.className = 'pack-grid';
      for (const item of grp.items) {
        const owned = item.tier !== 'gift' && isOwned(p, item.id);
        const afford = balanceCents(p) >= item.price;
        const card = document.createElement(owned ? 'div' : 'button');
        card.className = `dog-card store-item${owned ? ' owned' : ''}${!owned && !afford ? ' locked' : ''}`;
        card.dataset.item = item.id;
        const pct = Math.min(100, Math.round((balanceCents(p) / item.price) * 100));
        card.innerHTML = `<span class="dog">${artFor(item)}</span>
          <span>${escapeHtml(item.name)}</span>
          ${
            owned
              ? '<span class="lock-hint">✅ Owned</span>'
              : `<span class="lock-hint">${formatPaw(item.price)}</span>
                 ${afford ? '' : `<span class="reward-chip"><span class="meter mini"><span style="width:${pct}%"></span></span>🐷</span>`}`
          }`;
        if (!owned) {
          card.addEventListener('click', () => {
            if (!afford) {
              buzz(20);
              toast(`Keep saving! ${escapeHtml(item.name)} costs ${formatPaw(item.price)} 🐷`);
              return;
            }
            startCheckout(item);
          });
        }
        grid.appendChild(card);
      }
      shelves.appendChild(grid);
    }
  }

  function startCheckout(item) {
    if (item.tier === 'gift') return pickWearer(item);
    runCheckout(item, null);
  }

  // Gifts are FOR someone — the wearer picker comes first.
  function pickWearer(item) {
    shelves.hidden = true;
    checkoutEl.hidden = false;
    const wearers = [
      ...DOGS.filter((d) => isUnlocked(p, d.id)).map((d) => ({ id: d.id, name: d.name, svg: dogSVG(d, 64, wornFor(p, d.id)) })),
      ...(p.petUnlocks ?? []).map((u) => {
        const pet = PETS.find((x) => x.id === u.petId);
        return pet ? { id: pet.id, name: pet.name, svg: petSVG(pet, 64) } : null;
      }).filter(Boolean),
    ];
    checkoutEl.innerHTML = `
      <h3 class="center">Who is the ${escapeHtml(item.name)} for? ${item.emoji}</h3>
      <div class="pack-grid">${wearers
        .map(
          (w) => `<button class="dog-card" data-wearer="${w.id}" ${isOwned(p, item.id, w.id) ? 'disabled' : ''}>
            <span class="dog">${w.svg}</span><span>${escapeHtml(w.name)}</span>
            ${isOwned(p, item.id, w.id) ? '<span class="lock-hint">✅ Has one</span>' : ''}
          </button>`
        )
        .join('')}</div>
      <button class="btn ghost small" data-cancel>← Back to the shelves</button>`;
    for (const b of checkoutEl.querySelectorAll('[data-wearer]:not([disabled])')) {
      b.addEventListener('click', () => runCheckout(item, b.dataset.wearer));
    }
    checkoutEl.querySelector('[data-cancel]').addEventListener('click', closeCheckout);
  }

  function closeCheckout() {
    checkoutEl.hidden = true;
    shelves.hidden = false;
    renderShelves();
  }

  // The coin-math checkout: one multiplication per coin line, then the
  // addition total when there's more than one line.
  function runCheckout(item, forId) {
    shelves.hidden = true;
    checkoutEl.hidden = false;
    const lines = coinLines(item.price);
    const steps = lines.map((ln) => ({
      text: `${ln.count} × ${ln.value}`,
      answer: ln.product,
      say: `${ln.count} ${ln.label}`,
    }));
    if (lines.length > 1) {
      steps.push({
        text: lines.map((ln) => ln.product).join(' + '),
        answer: item.price,
        say: 'Add them all up!',
      });
    }
    let step = 0;
    let input = '';
    checkoutEl.innerHTML = `
      <h3 class="center">${item.emoji} ${escapeHtml(item.name)} — ${formatPaw(item.price)}</h3>
      <p class="muted center" data-say-line style="margin:0"></p>
      <div class="question compact" data-q></div>
      <div class="answer-box" aria-live="assertive">&nbsp;</div>
      <div class="numpad"></div>
      <button class="btn ghost small" data-cancel>✕ Not today</button>`;
    const qEl = checkoutEl.querySelector('[data-q]');
    const sayEl = checkoutEl.querySelector('[data-say-line]');
    const ansEl = checkoutEl.querySelector('.answer-box');
    const showStep = () => {
      const s = steps[step];
      qEl.textContent = `${s.text} = ?`;
      sayEl.textContent = `Count out ${s.say}`;
      ansEl.textContent = ' ';
      input = '';
    };
    buildNumpad(checkoutEl.querySelector('.numpad'), (k) => {
      if (k === 'ok') {
        if (!input) return;
        if (Number(input) === steps[step].answer) {
          sfx.correct();
          step += 1;
          if (step >= steps.length) return completePurchase(item, forId);
          showStep();
        } else {
          input = '';
          ansEl.textContent = ' ';
          ansEl.classList.add('shake');
          setTimeout(() => ansEl.classList.remove('shake'), 400);
          sfx.wrong();
        }
        return;
      }
      if (k === 'del') input = input.slice(0, -1);
      else if (input.length < 4) input += k;
      ansEl.textContent = input || ' ';
    });
    checkoutEl.querySelector('[data-cancel]').addEventListener('click', closeCheckout);
    showStep();
  }

  async function completePurchase(item, forId) {
    const txn = buyGear(p, item.id, forId);
    if (!txn) {
      toast('Hmm, that purchase did not go through.');
      return closeCheckout();
    }
    await ctx.save();
    confetti(16);
    sfx.coin();
    buzz([20, 30, 20]);
    cheer(`The ${item.name} is yours!`);
    const wearer = forId
      ? DOGS.find((d) => d.id === forId) ?? PETS.find((x) => x.id === forId)
      : null;
    checkoutEl.innerHTML = `
      <div class="card center">
        <h3>It's yours! 🎉</h3>
        <div class="dog bounce">${
          wearer
            ? wearer.table !== undefined
              ? dogSVG(wearer, 110, wornFor(p, wearer.id))
              : petSVG(wearer, 110)
            : artFor(item)
        }</div>
        <p class="muted">${
          forId
            ? `${escapeHtml(wearer?.name ?? '')} is wearing it right now!`
            : item.tier === 'toy'
              ? 'It went straight into the toy box 🧺'
              : 'It’s in the closet — dress someone up after a groom! 🧺'
        }</p>
        <button class="btn" data-done>🛍️ Keep shopping</button>
      </div>`;
    checkoutEl.querySelector('[data-done]').addEventListener('click', closeCheckout);
  }

  renderShelves();
  el.querySelector('[data-back]').addEventListener('click', () => navigate('/pack'));
}
