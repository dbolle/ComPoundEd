// The Pet Store (released v1.32.0 after its beta run). Buying is money
// math: the price decomposes into
// coin lines (Paw Bucks ×100, quarters ×25, dimes ×10, nickels ×5) the
// kid multiplies out, plus an addition total when there's more than one
// line. Checkout questions record nothing — applied math, not drill.

import { navigate } from '../router.js';
import { CATALOG, buyGear, isOwned, ownedGear, itemOf, placedOn } from '../engine/gearshop.js';
import { balanceCents, formatPaw, coinCounts, canMakeExact, canOverpay, DENOMS } from '../engine/money.js';
import { GEAR_ACCESSORIES, TOYS, toySVG } from '../art/gear.js';
import { DOGS, dogSVG, wornFor, gearSVG } from '../art/dogs.js';
import { PETS, petSVG } from '../art/pets.js';
import { isUnlocked } from '../engine/unlocks.js';
import { isBeta } from '../engine/beta.js';
import { confetti, escapeHtml, toast } from '../ui.js';
import { sfx, buzz, cheer, say } from '../sound.js';
import { coinTray } from '../ui/cointray.js';

// Where leaving the store lands: littles (and anyone whose pack is just
// Biscuit) live in the Cozy Corner; the pack takes over once real dogs
// are earned. Pet-less fresh profiles still go to the pack — an empty
// corner would strand them.
export function storeHome(p) {
  const dogsUnlocked = DOGS.filter((d) => isUnlocked(p, d.id)).length;
  return dogsUnlocked <= 1 && p.petUnlocks?.length ? '/corner' : '/pack';
}

// Compact store entry for the top rows of the pack and Cozy Corner.
export function storeButton() {
  const btn = document.createElement('button');
  btn.className = 'btn accent store-btn';
  btn.textContent = '🏪 Pet store';
  btn.setAttribute('aria-label', 'Pet store');
  btn.addEventListener('click', () => navigate('/store'));
  return btn;
}

export function storeScreen(el, params, ctx) {
  const p = ctx.profile;

  el.innerHTML = `
    <div class="screen">
      <div class="topbar">
        <button class="btn ghost small" data-back>← ${storeHome(p) === '/corner' ? 'Cozy Corner' : 'Pack'}</button>
        <span class="spacer"></span>
        <span class="paw-chip" data-balance>${formatPaw(balanceCents(p))}</span>
        <h2 style="margin:0">Pet Store 🏪</h2>
      </div>
      <p class="muted center" style="margin:0">Buy something for your pet!</p>
      <div data-shelves></div>
      <div data-checkout hidden></div>
    </div>`;

  const shelves = el.querySelector('[data-shelves]');
  const checkoutEl = el.querySelector('[data-checkout]');

  const artFor = (item) =>
    item.tier === 'toy' ? toySVG(item.id, 64) : gearSVG(item.id, 64);

  const shelved = (item) => !item.beta || isBeta(p);

  function renderShelves() {
    el.querySelector('[data-balance]').textContent = formatPaw(balanceCents(p));
    shelves.innerHTML = '';
    const groups = [
      // Beta items are shelved only with the 🧪 chip on — which is what
      // keeps their prices unlocked (see the note in src/art/gear.js).
      // Already-owned beta gear keeps rendering on its wearer either way:
      // `placedOn` asks whether it was bought, not whether it is on sale.
      { title: 'Toys 🧸', items: TOYS.filter(shelved) },
      { title: 'Gifts 🎁 (pick who they’re for!)', items: GEAR_ACCESSORIES.filter((i) => i.tier === 'gift' && shelved(i)) },
      { title: 'Treasures 👑', items: GEAR_ACCESSORIES.filter((i) => i.tier === 'treasure' && shelved(i)) },
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
  // Which door: paying the exact price, or paying big and counting the
  // change back?
  //
  // Exact change stays the DEFAULT whenever it is possible, reached in one
  // tap exactly as before. Counting change back is offered from inside it
  // as a secondary button. An interstitial "how do you want to pay?" was
  // the first design, and it was wrong: almost every wallet that can pay
  // exactly can also overpay (2426 of 2438 sampled cases), so the choice
  // screen would have appeared on nearly every purchase — an extra
  // decision, and more reading, between a child and their toy.
  function runCheckout(item, forId) {
    shelves.hidden = true;
    checkoutEl.hidden = false;
    const wallet = coinCounts(p);
    const exact = canMakeExact(wallet, item.price);
    const over = canOverpay(wallet, item.price);
    if (exact) return runExact(item, forId, over);
    if (over) return runOverpay(item, forId);
    // Unreachable while the shelf blocks unaffordable items: covering the
    // price always lands either ON it or past it. Kept as an honest
    // fallback rather than a crash, and asserted unreachable in
    // tests/change.spec.js.
    checkoutEl.innerHTML = `
      <div class="card center">
        <h3>${item.emoji} ${escapeHtml(item.name)} — ${formatPaw(item.price)}</h3>
        <p class="muted">You have enough Paw Bucks, but not the right coins!</p>
        <button class="btn accent" data-to-wallet>🔁 Swap coins at the wallet</button>
        <button class="btn ghost small" data-cancel>← Back to the shelves</button>
      </div>`;
    checkoutEl.querySelector('[data-to-wallet]').addEventListener('click', () => navigate('/wallet'));
    checkoutEl.querySelector('[data-cancel]').addEventListener('click', closeCheckout);
  }

  function runExact(item, forId, canAlsoOverpay = false) {
    const wallet = coinCounts(p);
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
      <div class="nav-row">
        <button class="btn ghost small" data-restart>↩️ Start over</button>
        ${
          canAlsoOverpay
            ? '<button class="btn ghost small" data-door-over>🔁 Pay big instead</button>'
            : ''
        }
        <button class="btn ghost small" data-cancel>✕ Not today</button>
      </div>`;
    // The counting-back route lives here rather than behind an interstitial,
    // so an experienced profile with a full wallet can still FIND it
    // (CLAUDE.md: gates have hidden features twice) without every purchase
    // costing an extra decision.
    checkoutEl
      .querySelector('[data-door-over]')
      ?.addEventListener('click', () => runOverpay(item, forId));
    const traysEl = checkoutEl.querySelector('[data-trays]');
    // Could the child still reach the exact price after handing this coin
    // over? Without this a legal-looking tap leads to a dead end where
    // every button is greyed out (243 of 282 payable combinations had
    // one) — recovery existed but nothing said so.
    const canFinish = (denomId) => {
      const left = { ...wallet };
      for (const [d, n] of Object.entries(paying)) left[d] = (left[d] ?? 0) - n;
      left[denomId] = (left[denomId] ?? 0) - 1;
      const remaining = item.price - paidCents() - DENOMS.find((x) => x.id === denomId).cents;
      return remaining === 0 || canMakeExact(left, remaining);
    };
    const render = () => {
      const paid = paidCents();
      traysEl.innerHTML = DENOMS.map((d) => {
        const have = (wallet[d.id] ?? 0) - (paying[d.id] ?? 0);
        if ((wallet[d.id] ?? 0) === 0) return '';
        return `<div class="card wallet-row">
          <span class="coin ${d.id}"></span>
          <span class="wr-label">${escapeHtml(d.label)}</span>
          <span class="wallet-count">×${have}</span>
          <button class="btn ghost small" data-give="${d.id}" ${
            have === 0 || paid + d.cents > item.price || !canFinish(d.id) ? 'disabled' : ''
          }>➕ Pay one</button>
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
    checkoutEl.querySelector('[data-restart]').addEventListener('click', () => {
      for (const k of Object.keys(paying)) delete paying[k];
      render();
    });
    checkoutEl.querySelector('[data-pay]').addEventListener('click', (e) => {
      if (paidCents() !== item.price) return;
      e.currentTarget.disabled = true; // a double-tap used to "fail" after succeeding
      completePurchase(item, forId, { ...paying });
    });
    checkoutEl.querySelector('[data-cancel]').addEventListener('click', closeCheckout);
    render();
  }

  // Pay big, then count the change UP from the price — the way a shopkeeper
  // counts it back to you ("that's 60, 65, 70, 75"), which is counting on
  // rather than subtraction. Two steps: hand coins over until the price is
  // covered, then take your change out of the shop's drawer.
  function runOverpay(item, forId) {
    const wallet = coinCounts(p);
    const paying = {};
    const paidCents = () => DENOMS.reduce((s, d) => s + (paying[d.id] ?? 0) * d.cents, 0);

    // --- step 1: hand coins over ---------------------------------------
    const payStep = () => {
      checkoutEl.innerHTML = `
        <h3 class="center">${item.emoji} ${escapeHtml(item.name)} — ${formatPaw(item.price)}</h3>
        <p class="muted center" style="margin:0">Hand over coins until you have enough! 🪙</p>
        <div data-trays></div>
        <div class="card center pay-pile">
          <div data-pile class="pile-row">&nbsp;</div>
          <div class="little-numeral" data-paid>0¢</div>
          <button class="btn" data-next-step disabled>Count my change →</button>
        </div>
        <div class="nav-row">
          <button class="btn ghost small" data-restart>↩️ Start over</button>
          <button class="btn ghost small" data-cancel>✕ Not today</button>
        </div>`;
      const traysEl = checkoutEl.querySelector('[data-trays]');
      const render = () => {
        const paid = paidCents();
        const covered = paid >= item.price;
        traysEl.innerHTML = DENOMS.map((d) => {
          const have = (wallet[d.id] ?? 0) - (paying[d.id] ?? 0);
          if ((wallet[d.id] ?? 0) === 0) return '';
          return `<div class="card wallet-row">
            <span class="coin ${d.id}"></span>
            <span class="wr-label">${escapeHtml(d.label)}</span>
            <span class="wallet-count">×${have}</span>
            <button class="btn ghost small" data-give="${d.id}"
              aria-label="Hand over a ${escapeHtml(d.label)}, ${d.cents} cents"
              ${have === 0 || covered ? 'disabled' : ''}>➕ Pay one</button>
          </div>`;
        }).join('');
        checkoutEl.querySelector('[data-pile]').innerHTML =
          DENOMS.map((d) =>
            Array.from({ length: paying[d.id] ?? 0 })
              .map(
                () =>
                  `<button class="coin ${d.id} pile-coin" data-take="${d.id}"
                     aria-label="Take a ${escapeHtml(d.label)} back"></button>`
              )
              .join('')
          ).join('') || '&nbsp;';
        checkoutEl.querySelector('[data-paid]').textContent =
          paid >= 100 ? formatPaw(paid) : `${paid}¢`;
        const next = checkoutEl.querySelector('[data-next-step]');
        next.disabled = !covered;
        next.textContent =
          paid === item.price ? '💰 Pay — that\'s exactly right!' : 'Count my change →';
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
            if (!paying[c.dataset.take]) delete paying[c.dataset.take];
            buzz(10);
            render();
          });
        }
      };
      checkoutEl.querySelector('[data-restart]').addEventListener('click', () => {
        for (const k of Object.keys(paying)) delete paying[k];
        render();
      });
      checkoutEl.querySelector('[data-next-step]').addEventListener('click', () => {
        const paid = paidCents();
        if (paid < item.price) return;
        // landed exactly on it by hand — no change to count
        if (paid === item.price) return completePurchase(item, forId, { ...paying });
        changeStep(paid);
      });
      checkoutEl.querySelector('[data-cancel]').addEventListener('click', closeCheckout);
      render();
    };

    // --- step 2: count the change up from the price ---------------------
    const changeStep = (paid) => {
      const owed = paid - item.price;
      checkoutEl.innerHTML = `
        <h3 class="center">Your change 🪙</h3>
        <p class="muted center" style="margin:0">
          It costs ${formatPaw(item.price)} — you paid ${formatPaw(paid)}.
        </p>
        <div data-tray></div>
        <div class="nav-row">
          <button class="btn accent" data-take-change disabled>💰 Take your change!</button>
        </div>
        <div class="nav-row">
          <button class="btn ghost small" data-restart>↩️ Again</button>
          <button class="btn ghost small" data-repay>← Pay differently</button>
          <button class="btn ghost small" data-cancel>✕ Not today</button>
        </div>`;
      const btn = checkoutEl.querySelector('[data-take-change]');
      const tray = coinTray(checkoutEl.querySelector('[data-tray]'), {
        target: owed,
        from: null, // the shop's drawer: a shop has plenty
        start: item.price,
        countUp: true,
        say: (t) => say(t),
        onChange: (_picked, total) => {
          btn.disabled = total !== owed;
          if (total === owed) sfx.correct();
        },
      });
      btn.addEventListener('click', () => {
        if (!tray.done()) return;
        btn.disabled = true; // a double-tap used to "fail" after succeeding
        completePurchase(item, forId, { ...paying }, tray.picked());
      });
      checkoutEl.querySelector('[data-restart]').addEventListener('click', () => tray.reset());
      // back to step 1 with the payment intact, so different coins can go in
      checkoutEl.querySelector('[data-repay]').addEventListener('click', payStep);
      checkoutEl.querySelector('[data-cancel]').addEventListener('click', closeCheckout);
    };

    payStep();
  }

  async function completePurchase(item, forId, coins = null, change = null) {
    const txn = buyGear(p, item.id, forId, Date.now(), coins, change);
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
              : petSVG(wearer, 110, placedOn(p, wearer.id))
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
  el.querySelector('[data-back]').addEventListener('click', () => navigate(storeHome(p)));
}
