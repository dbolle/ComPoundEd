// The wardrobe: change which accessories (and which colors) a dog wears.
// Gated behind grooming — a completed bath grants this session's pass, so
// every outfit change costs a math practice set.

import { navigate } from '../router.js';
import {
  getDog,
  dogSVG,
  dirtFor,
  wornFor,
  accessoriesFor,
  accessoryColorsFor,
  ACCESSORIES,
} from '../art/dogs.js';
import { isUnlocked } from '../engine/unlocks.js';
import { escapeHtml, toast } from '../ui.js';
import { say } from '../sound.js';
import { COLLAR_COLORS, collarColorsFor } from '../art/dogs.js';
import { ownedGear, itemOf, placementOf, placeGear } from '../engine/gearshop.js';
import { getDog as dogById } from '../art/dogs.js';
import { getPet } from '../art/pets.js';

export function wardrobeScreen(el, params, ctx) {
  const dog = getDog(params.get('id'));
  if (!isUnlocked(ctx.profile, dog.id) || ctx.session.wardrobePass !== dog.id) {
    navigate(`/dog?id=${dog.id}`);
    return;
  }
  const p = ctx.profile;
  const earned = accessoriesFor(p, dog.id);

  el.innerHTML = `
    <div class="screen">
      <div class="topbar">
        <button class="btn ghost small" data-back>← ${escapeHtml(dog.name)}</button>
        <span class="spacer"></span>
        <h2 style="margin:0">Dress up 👕</h2>
      </div>
      <div class="dog-hero"><div class="dog" data-preview></div></div>
      <div class="wardrobe-rows"></div>
    </div>`;

  const preview = el.querySelector('[data-preview]');
  const rows = el.querySelector('.wardrobe-rows');

  const renderPreview = () => {
    preview.innerHTML = dogSVG(dog, 150, wornFor(p, dog.id), dirtFor(p, dog));
  };

  const setWear = async (accId, value) => {
    p.wear = p.wear ?? {};
    p.wear[dog.id] = { ...(p.wear[dog.id] ?? {}), [accId]: value };
    await ctx.save();
    renderPreview();
    renderRows();
  };

  function renderRows() {
    rows.innerHTML = '';
    // Collar: earned through group training sessions (interleaving reward)
    {
      const row = document.createElement('div');
      row.className = 'card wardrobe-row';
      const unlocked = collarColorsFor(p, dog.id);
      const current = p.wear?.[dog.id]?.collar;
      const swatches = [
        `<button class="swatch none${!current ? ' sel' : ''}" data-acc="collar" data-val="on" aria-label="Original collar" style="background:${dog.collar}"></button>`,
      ];
      for (const c of COLLAR_COLORS) {
        if (unlocked.includes(c.id)) {
          swatches.push(
            `<button class="swatch${current === c.id ? ' sel' : ''}" style="background:${c.fill}" data-acc="collar" data-val="${c.id}" aria-label="${c.id} collar"></button>`
          );
        } else {
          swatches.push(
            `<button class="swatch locked" style="background:${c.fill}" data-say="${c.need} training walks with a friend who's still learning unlocks the ${c.id} collar!"
               aria-label="${c.id} collar unlocks at ${c.need} training sessions">
               <span class="swatch-need">🐕🐕${c.need}</span></button>`
          );
        }
      }
      row.innerHTML = `<span class="wr-label">🦮 collar</span>
        <span class="wr-swatches">${swatches.join('')}</span>`;
      rows.appendChild(row);
    }
    for (const acc of ACCESSORIES) {
      const row = document.createElement('div');
      row.className = 'card wardrobe-row';
      const owned = earned.includes(acc.id);
      const current = p.wear?.[dog.id]?.[acc.id];
      if (!owned) {
        const kindWord = { walk: 'walks', feed: 'meals', fetch: 'fetches', total: 'plays' }[acc.kind];
        row.innerHTML = `<span class="wr-label">${acc.emoji} ${escapeHtml(acc.name)}</span>
          <span class="muted wr-hint">🔒 ${acc.colors?.[0]?.need ?? acc.need} ${kindWord}</span>`;
        rows.appendChild(row);
        continue;
      }
      const unlockedColors = acc.colors ? accessoryColorsFor(p, dog.id, acc.id) : [];
      const swatches = [];
      const noneSel = current === 'none';
      swatches.push(
        `<button class="swatch none${noneSel ? ' sel' : ''}" data-acc="${acc.id}" data-val="none" aria-label="Don't wear the ${acc.name}">⊘</button>`
      );
      if (acc.colors) {
        for (const c of acc.colors) {
          if (unlockedColors.includes(c.id)) {
            const sel = !noneSel && (current === c.id || (!current && c.id === unlockedColors[0]));
            swatches.push(
              `<button class="swatch${sel ? ' sel' : ''}" style="background:${c.fill}" data-acc="${acc.id}" data-val="${c.id}" aria-label="${c.id} ${acc.name}"></button>`
            );
          } else {
            const kindWord = { walk: 'walks', feed: 'meals', fetch: 'fetches' }[acc.kind];
            const kindEmoji = { walk: '🦮', feed: '🍖', fetch: '🎾' }[acc.kind];
            // the real color, dimmed, with a visible count — tooltips don't
            // exist on a tablet, and this is where kids actually look
            swatches.push(
              `<button class="swatch locked" style="background:${c.fill}" data-need="${c.need}"
                 data-say="${c.need} ${kindWord} unlocks the ${c.id} ${acc.name}!"
                 aria-label="${c.id} ${acc.name} unlocks at ${c.need} ${kindWord}">
                 <span class="swatch-need">${kindEmoji}${c.need}</span></button>`
            );
          }
        }
      } else {
        const sel = current !== 'none';
        swatches.push(
          `<button class="swatch star${sel ? ' sel' : ''}" data-acc="star" data-val="on" aria-label="Wear the star tag">⭐</button>`
        );
      }
      row.innerHTML = `<span class="wr-label">${acc.emoji} ${escapeHtml(acc.name)}</span>
        <span class="wr-swatches">${swatches.join('')}</span>`;
      rows.appendChild(row);
    }
    // Closet: store gear this pup could wear — gifts of theirs, and the
    // one-of-a-kind treasures wherever they currently sit.
    const closet = ownedGear(p)
      .map(({ item, for: forId }) => ({ item: itemOf(item), forId }))
      .filter(({ item, forId }) => item?.slot && (item.tier !== 'gift' || forId === dog.id));
    if (closet.length) {
      const head = document.createElement('h3');
      head.className = 'habitat-title';
      head.textContent = 'Closet 🧺';
      rows.appendChild(head);
      for (const { item, forId } of closet) {
        const row = document.createElement('div');
        row.className = 'card wardrobe-row';
        const where = placementOf(p, item.id, forId);
        const hereNow = where === dog.id;
        const holder =
          where && where !== dog.id ? (dogById(where)?.id === where ? dogById(where) : getPet(where)) : null;
        row.innerHTML = `<span class="wr-label">${item.emoji} ${escapeHtml(item.name)}</span>
          <button class="btn ghost small" data-closet="${item.id}" data-for="${forId ?? ''}">
            ${hereNow ? '✅ Wearing it' : holder ? `↩️ Bring from ${escapeHtml(holder.name)}` : '🧺 Put it on'}
          </button>`;
        rows.appendChild(row);
      }
    }
    for (const btn of rows.querySelectorAll('button.swatch:not(.locked)')) {
      btn.addEventListener('click', () =>
        setWear(btn.dataset.acc, btn.dataset.val === 'on' ? undefined : btn.dataset.val)
      );
    }
    for (const btn of rows.querySelectorAll('[data-closet]')) {
      btn.addEventListener('click', async () => {
        const itemId = btn.dataset.closet;
        const worn = placementOf(p, itemId, btn.dataset.for || null) === dog.id;
        placeGear(p, itemId, worn ? null : dog.id);
        await ctx.save();
        renderPreview();
        renderRows();
      });
    }
    for (const lockBtn of rows.querySelectorAll('.swatch.locked[data-say]')) {
      lockBtn.addEventListener('click', () => {
        say(lockBtn.dataset.say);
        toast(`🔒 ${lockBtn.dataset.say}`);
      });
    }
  }

  renderPreview();
  renderRows();
  el.querySelector('[data-back]').addEventListener('click', () => navigate(`/dog?id=${dog.id}`));
}
