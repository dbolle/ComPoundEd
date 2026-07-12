import { navigate } from '../router.js';
import { getDog, dogSVG, accessoriesFor, wornFor, ACCESSORIES, dirtFor } from '../art/dogs.js';
import { isUnlocked } from '../engine/unlocks.js';
import { toast, escapeHtml } from '../ui.js';

export function dogScreen(el, params, ctx) {
  const dog = getDog(params.get('id'));
  if (!isUnlocked(ctx.profile, dog.id)) {
    navigate('/pack');
    return;
  }
  const play = ctx.profile.play[dog.id] ?? { walk: 0, feed: 0, fetch: 0 };
  const isBuddy = ctx.profile.avatarDogId === dog.id;
  const earned = accessoriesFor(ctx.profile, dog.id);
  const dirt = dirtFor(ctx.profile, dog);
  const groomable = true; // every pack dog — Biscuit gets a board-wide spa day
  const hasPass = ctx.session.wardrobePass === dog.id;
  // The nearest unearned accessory, as a gentle goal.
  const total = (play.walk ?? 0) + (play.feed ?? 0) + (play.fetch ?? 0);
  const next = ACCESSORIES.filter((a) => !earned.includes(a.id))
    .map((a) => ({ ...a, left: a.need - (a.kind === 'total' ? total : (play[a.kind] ?? 0)) }))
    .sort((x, y) => x.left - y.left)[0];
  const kindWord = { walk: 'walks', feed: 'meals', fetch: 'fetches', total: 'plays' };
  const knows =
    dog.divTable != null
      ? `Knows all about sharing by ${dog.divTable}.`
      : dog.table == null
        ? 'Loves numbers of every kind!'
        : `Knows all about the ×${dog.table} table.`;

  el.innerHTML = `
    <div class="screen">
      <div class="topbar">
        <button class="btn ghost small" data-back>← Pack</button>
        <span class="spacer"></span>
        ${isBuddy ? '<strong>Your buddy 🐾</strong>' : ''}
      </div>
      <div class="dog-hero">
        <div class="dog">${dogSVG(dog, 160, wornFor(ctx.profile, dog.id), dirt)}</div>
        <h1>${escapeHtml(dog.name)}</h1>
        <p class="muted">${knows}</p>
        <p class="play-stats">
          <span>🦮 ${play.walk} walks</span>
          <span>🍖 ${play.feed} meals</span>
          <span>🎾 ${play.fetch} fetches</span>
        </p>
        ${
          next
            ? `<p class="muted acc-hint">${next.emoji} ${escapeHtml(dog.name)} gets a ${next.name} after ${next.left} more ${kindWord[next.kind]}!</p>`
            : `<p class="muted acc-hint">👑 ${escapeHtml(dog.name)} has every accessory!</p>`
        }
      </div>
      ${dirt > 0 ? `<p class="muted center groom-hint">${escapeHtml(dog.name)} played hard — bath time? 🧼</p>` : ''}
      <h3>Play with ${escapeHtml(dog.name)}</h3>
      <div class="activity-row${groomable ? ' four' : ''}">
        <button class="btn" data-act="walk">🦮 Walk</button>
        <button class="btn" data-act="feed">🍖 Feed</button>
        <button class="btn" data-act="fetch">🎾 Fetch</button>
        ${groomable ? '<button class="btn groom-btn" data-act="groom">🧼 Groom</button>' : ''}
      </div>
      ${
        hasPass
          ? '<button class="btn groom-btn" data-dress>👕 Dress up!</button>'
          : earned.length
            ? '<p class="muted center groom-hint">👕 Groom to change outfits!</p>'
            : ''
      }
      ${
        isBuddy
          ? ''
          : `<button class="btn accent" data-buddy>💛 Make ${escapeHtml(dog.name)} your buddy</button>`
      }
    </div>`;

  for (const b of el.querySelectorAll('[data-act]')) {
    b.addEventListener('click', () => navigate(`/activity?dog=${dog.id}&kind=${b.dataset.act}`));
  }
  const buddyBtn = el.querySelector('[data-buddy]');
  if (buddyBtn) {
    buddyBtn.addEventListener('click', async () => {
      ctx.profile.avatarDogId = dog.id;
      await ctx.save();
      toast(`${dog.name} is your buddy now! 🐾`);
      dogScreen(el, params, ctx);
    });
  }
  const dress = el.querySelector('[data-dress]');
  if (dress) dress.addEventListener('click', () => navigate(`/wardrobe?id=${dog.id}`));
  el.querySelector('[data-back]').addEventListener('click', () => navigate('/pack'));
}
