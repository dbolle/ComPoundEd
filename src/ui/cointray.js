// A reversible coin tray: tap a coin to add it, tap one in the tray to take
// it back, with a running total and no way to overshoot. Built for the
// checkout's change step and reused by the money track's make-an-amount and
// count-the-change waves (Phase 7 R5) — one implementation means one set of
// accessibility decisions rather than three that drift.
//
// Errorless by construction, per the charter: a coin that would take the
// child past the target is DISABLED, not accepted-then-scolded. The child
// can always undo, and nothing is recorded until they say they're done.
import { DENOMS, formatPaw } from '../engine/money.js';
import { escapeHtml, plural } from '../ui.js';

const label = (cents) => (cents >= 100 ? formatPaw(cents) : `${cents}¢`);

// A coin the child can pick up. `from` bounds how many are available:
// null means unlimited (the shop's drawer — a shop has plenty).
function sourceRow(d, taken, from) {
  const left = from === null ? null : (from[d.id] ?? 0) - taken;
  const gone = left !== null && left <= 0;
  return { left, gone };
}

/**
 * @param {HTMLElement} host      where to render
 * @param {object} opts
 *  - target   cents the tray must reach exactly
 *  - from     {denom: n} available coins, or null for an unlimited drawer
 *  - start    cents already counted before this tray (the price, when
 *             counting change UP from it) — display only
 *  - countUp  true to show the running chain start → … → target
 *  - onChange (picked, total) => void, after every tap
 *  - say      optional (text) => void for spoken running totals
 */
export function coinTray(host, opts) {
  const { target, from = null, start = 0, countUp = false, onChange, say } = opts;
  const picked = {};
  const total = () => DENOMS.reduce((s, d) => s + (picked[d.id] ?? 0) * d.cents, 0);

  const render = () => {
    const got = total();
    const remaining = target - got;
    const chain = [];
    if (countUp) {
      chain.push(label(start));
      let running = start;
      for (const d of DENOMS) {
        for (let i = 0; i < (picked[d.id] ?? 0); i++) {
          running += d.cents;
          chain.push(label(running));
        }
      }
    }
    host.innerHTML = `
      ${
        countUp
          ? `<div class="card center count-chain" data-chain>${chain
              .map((c, i) => `<span class="chain-step${i === chain.length - 1 ? ' now' : ''}">${c}</span>`)
              .join('<span class="chain-arrow">→</span>')}</div>`
          : ''
      }
      <div class="tray-rows" data-rows>
        ${DENOMS.map((d) => {
          const { left, gone } = sourceRow(d, picked[d.id] ?? 0, from);
          if (from && (from[d.id] ?? 0) === 0) return '';
          // A coin bigger than the whole target can never be part of this
          // answer, so it is left out rather than shown greyed forever —
          // five rows pushed the action button off a phone screen. Coins
          // that only become too big part-way through stay visible and
          // disabled, because that IS the lesson.
          if (d.cents > target) return '';
          const tooBig = d.cents > remaining;
          return `<div class="card wallet-row">
            <span class="coin ${d.id}"></span>
            <span class="wr-label">${escapeHtml(d.label)}</span>
            ${left === null ? '' : `<span class="wallet-count">×${left}</span>`}
            <button class="btn ghost small" data-add="${d.id}"
              aria-label="Take a ${escapeHtml(d.label)}, ${d.cents} ${plural(d.cents, 'cent')}"
              ${gone || tooBig ? 'disabled' : ''}>➕ ${escapeHtml(d.label)}</button>
          </div>`;
        }).join('')}
      </div>
      <div class="card center pay-pile">
        <div class="pile-row" data-picked>${
          DENOMS.map((d) =>
            Array.from({ length: picked[d.id] ?? 0 })
              .map(
                () =>
                  `<button class="coin ${d.id} pile-coin" data-remove="${d.id}"
                     aria-label="Put the ${escapeHtml(d.label)} back"></button>`
              )
              .join('')
          ).join('') || '&nbsp;'
        }</div>
        ${
          countUp
            ? `<div class="muted" style="font-size:.85rem" data-goal>${
                remaining === 0 ? "That's it! 🎉" : `Count up to ${label(start + target)}`
              }</div>`
            : `<div class="little-numeral" data-total>${label(got)}</div>`
        }
      </div>`;

    for (const b of host.querySelectorAll('[data-add]')) {
      b.addEventListener('click', () => {
        const id = b.dataset.add;
        picked[id] = (picked[id] ?? 0) + 1;
        const now = total();
        say?.(label(countUp ? start + now : now));
        render();
        onChange?.({ ...picked }, now);
      });
    }
    for (const c of host.querySelectorAll('[data-remove]')) {
      c.addEventListener('click', () => {
        const id = c.dataset.remove;
        picked[id] = Math.max(0, (picked[id] ?? 0) - 1);
        if (!picked[id]) delete picked[id];
        render();
        onChange?.({ ...picked }, total());
      });
    }
  };

  render();
  return {
    picked: () => ({ ...picked }),
    total,
    done: () => total() === target,
    reset: () => {
      for (const k of Object.keys(picked)) delete picked[k];
      render();
      onChange?.({}, 0);
    },
  };
}
