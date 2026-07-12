// The wallet: the kid's Paw Bucks as the actual coins they earned — seeding
// US-currency intuition (counting mixed denominations) from day one.
// Game money, fictitious forever.

import { navigate } from '../router.js';
import { DENOMS, balanceCents, coinCounts, formatPaw } from '../engine/money.js';
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
        <p class="muted" style="margin:4px 0 0">Earned by pet sitting 🏡</p>
      </div>
      <div class="wallet-rows"></div>
      <p class="muted center" style="font-size:.85rem">Saving up? The Pet Store opens soon! 🏪🚧</p>
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
    rows.innerHTML = `<div class="card center"><p class="muted" style="margin:0">Look after a visiting pup to earn your first paw dime! 🏡</p></div>`;
  }
  el.querySelector('[data-back]').addEventListener('click', () => navigate('/pack'));
}
