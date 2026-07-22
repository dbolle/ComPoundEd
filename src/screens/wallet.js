// The wallet: the kid's Paw Bucks as the actual coins they earned — seeding
// US-currency intuition (counting mixed denominations) from day one.
// Game money, fictitious forever.

import { navigate } from '../router.js';
import { DENOMS, balanceCents, coinCounts, formatPaw, SWAPS, canSwap, swapCoins } from '../engine/money.js';
import { isBeta } from '../engine/beta.js';
import { say } from '../sound.js';
import { escapeHtml } from '../ui.js';

export function walletScreen(el, params, ctx) {
  const p = ctx.profile;
  const counts = coinCounts(p);
  const total = balanceCents(p);

  el.innerHTML = `
    <div class="screen">
      <div class="topbar">
        <button class="btn ghost small" data-back>← Pack</button>
        <span class="spacer"></span>
        <h2 style="margin:0">Wallet 🐾💵</h2>
      </div>
      <div class="card center">
        <div class="wallet-total">${formatPaw(total)}</div>
        <p class="muted" style="margin:4px 0 0">Earned by learning new tricks 🎓 and pet sitting 🏡</p>
      </div>
      <div class="wallet-rows"></div>
      ${
        isBeta(p)
          ? '<button class="btn accent small center" data-store style="align-self:center">🏪 The Pet Store is open!</button>'
          : '<p class="muted center" style="font-size:.85rem">Saving up? The Pet Store opens soon! 🏪🚧</p>'
      }
      <div data-swaps></div>
      <p class="muted center" style="font-size:.8rem;margin-top:auto">Paw Bucks are game money — just for fun, never real!</p>
    </div>`;

  const rows = el.querySelector('.wallet-rows');
  let any = false;
  for (const d of DENOMS) {
    const n = counts[d.id] ?? 0;
    if (!n) continue;
    any = true;
    const row = document.createElement('div');
    row.className = 'card wallet-row';
    row.innerHTML = `<span class="coin ${d.id}"></span>
      <span class="wr-label">${escapeHtml(d.label)}</span>
      <span class="wallet-count">×${n}</span>
      <span class="muted">${formatPaw(d.cents * n)}</span>`;
    rows.appendChild(row);
  }
  if (!any) {
    rows.innerHTML = `<div class="card center"><p class="muted" style="margin:0">Master a new fact or look after a visiting pup to earn your first coins! 🎓🏡</p></div>`;
  }
  el.querySelector('[data-store]')?.addEventListener('click', () => navigate('/store'));

  // Coin swaps (beta): trade coins both ways — ten dimes make a Paw Buck,
  // and a Paw Buck breaks back into quarters or dimes. Net-zero money,
  // real place-value practice.
  if (isBeta(p)) {
    const swapsEl = el.querySelector('[data-swaps]');
    const label = (d) => DENOMS.find((x) => x.id === d)?.label ?? d;
    const renderSwaps = () => {
      const available = SWAPS.filter((r) => canSwap(p, r));
      if (!available.length) {
        swapsEl.innerHTML = '';
        return;
      }
      swapsEl.innerHTML = `<div class="card"><h3>🔁 Swap coins</h3>${available
        .map(
          (r, i) => `<button class="btn ghost small" data-swap="${i}" style="margin:4px 0;width:100%">
            ${r.give.n} × ${label(r.give.denom)} → ${r.get.n} × ${label(r.get.denom)}</button>`
        )
        .join('')}</div>`;
      for (const b of swapsEl.querySelectorAll('[data-swap]')) {
        b.addEventListener('click', async () => {
          const rule = available[Number(b.dataset.swap)];
          if (!swapCoins(p, rule)) return;
          await ctx.save();
          say(`${rule.give.n} ${label(rule.give.denom)}s make ${rule.get.n} ${label(rule.get.denom)}${rule.get.n > 1 ? 's' : ''}!`);
          walletScreen(el, params, ctx); // re-render rows + swaps
        });
      }
    };
    renderSwaps();
  }
  el.querySelector('[data-back]').addEventListener('click', () => navigate('/pack'));
}
