// The Pet Store (BETA — reachable only via the Grown-Ups 🧪 flag; see
// src/engine/beta.js). Buying is money math: the price decomposes into
// coin lines (Paw Bucks ×100, quarters ×25, dimes ×10, nickels ×5) the
// kid multiplies out, plus an addition total when there's more than one
// line. Checkout questions record nothing — applied math, not drill.

import { navigate } from '../router.js';
import { CATALOG, buyGear, isOwned, ownedGear, itemOf } from '../engine/gearshop.js';
import { balanceCents, formatPaw, coinCounts, canMakeExact, DENOMS } from '../engine/money.js';
import { GEAR_ACCESSORIES, TOYS, toySVG } from '../art/gear.js';
import { DOGS, dogSVG, wornFor, gearSVG } from '../art/dogs.js';
import { PETS, petSVG } from '../art/pets.js';
import { isUnlocked } from '../engine/unlocks.js';
import { confetti, escapeHtml, toast } from '../ui.js';
import { sfx, buzz, cheer } from '../sound.js';

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
    item.tier === 'toy' ? toySVG(item.id, 64) : gearSVG(item.id, 64);

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
        card.className = `dog-card store-item${owned ? ' owned' : ''}${!owned && !afford ? ' cant-afford' : ''}`;
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

  // Exact-change checkout: count out real coins from the wallet, like
  // paying at a real store. Coins move from the wallet trays to the pay
  // pile (and back); Pay unlocks only at the exact price. No running
  // total is done FOR the child beyond showing it — choosing the
  // denominations is the math.
  function runCheckout(item, forId) {
    shelves.hidden = true;
    checkoutEl.hidden = false;
    const wallet = coinCounts(p);
    if (!canMakeExact(wallet, item.price)) {
      // affordable, but no combination hits the price exactly — time to
      // make change (the wallet's swap table exists for exactly this)
      checkoutEl.innerHTML = `
        <div class="card center">
          <h3>${item.emoji} ${escapeHtml(item.name)} — ${formatPaw(item.price)}</h3>
          <p class="muted">You have enough Paw Bucks, but not the right coins for exact change!</p>
          <button class="btn accent" data-to-wallet>🔁 Make change at the wallet</button>
          <button class="btn ghost small" data-cancel>← Back to the shelves</button>
        </div>`;
      checkoutEl.querySelector('[data-to-wallet]').addEventListener('click', () => navigate('/wallet'));
      checkoutEl.querySelector('[data-cancel]').addEventListener('click', closeCheckout);
      return;
    }
    const paying = {};
    const paidCents = () =>
      DENOMS.reduce((sum, d) => sum + (paying[d.id] ?? 0) * d.cents, 0);
    checkoutEl.innerHTML = `
      <h3 class="center">${item.emoji} ${escapeHtml(item.name)} — ${formatPaw(item.price)}</h3>
      <p class="muted center" style="margin:0">Count out exact change! 🪙</p>
      <div data-trays></div>
      <div class="card center pay-pile">
        <div data-pile class="pile-row">&nbsp;</div>
        <div class="little-numeral" data-paid>0¢</div>
        <button class="btn" data-pay disabled>💰 Pay ${formatPaw(item.price)}</button>
      </div>
      <button class="btn ghost small" data-cancel>✕ Not today</button>`;
    const traysEl = checkoutEl.querySelector('[data-trays]');
    const render = () => {
      const paid = paidCents();
      traysEl.innerHTML = DENOMS.map((d) => {
        const have = (wallet[d.id] ?? 0) - (paying[d.id] ?? 0);
        if ((wallet[d.id] ?? 0) === 0) return '';
        return `<div class="card wallet-row">
          <span class="coin ${d.id}"></span>
          <span class="wr-label">${escapeHtml(d.label)}</span>
          <span class="wallet-count">×${have}</span>
          <button class="btn ghost small" data-give="${d.id}" ${have === 0 || paid + d.cents > item.price ? 'disabled' : ''}>➕ Pay one</button>
        </div>`;
      }).join('');
      checkoutEl.querySelector('[data-pile]').innerHTML =
        DENOMS.map((d) =>
          Array.from({ length: paying[d.id] ?? 0 })
            .map(() => `<button class="coin ${d.id} pile-coin" data-take="${d.id}" aria-label="Take a ${d.label} back"></button>`)
            .join('')
        ).join('') || '&nbsp;';
      const paidEl = checkoutEl.querySelector('[data-paid]');
      paidEl.textContent = paid >= 100 ? formatPaw(paid) : `${paid}¢`;
      const exact = paid === item.price;
      checkoutEl.querySelector('[data-pay]').disabled = !exact;
      if (exact) sfx.correct();
      for (const b of traysEl.querySelectorAll('[data-give]')) {
        b.addEventListener('click', () => {
          paying[b.dataset.give] = (paying[b.dataset.give] ?? 0) + 1;
          buzz(10);
          render();
        });
      }
      for (const c of checkoutEl.querySelectorAll('[data-take]')) {
        c.addEventListener('click', () => {
          paying[c.dataset.take] -= 1;
          buzz(10);
          render();
        });
      }
    };
    checkoutEl.querySelector('[data-pay]').addEventListener('click', () => {
      if (paidCents() === item.price) completePurchase(item, forId, { ...paying });
    });
    checkoutEl.querySelector('[data-cancel]').addEventListener('click', closeCheckout);
    render();
  }

  async function completePurchase(item, forId, coins = null) {
    const txn = buyGear(p, item.id, forId, Date.now(), coins);
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
