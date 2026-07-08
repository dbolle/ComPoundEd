import { navigate } from '../router.js';
import { getDog, dogSVG } from '../art/dogs.js';
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
        <div class="dog">${dogSVG(dog, 160)}</div>
        <h1>${escapeHtml(dog.name)}</h1>
        <p class="muted">${knows}</p>
        <p class="play-stats">
          <span>🦮 ${play.walk} walks</span>
          <span>🍖 ${play.feed} meals</span>
          <span>🎾 ${play.fetch} fetches</span>
        </p>
      </div>
      <h3>Play with ${escapeHtml(dog.name)}</h3>
      <div class="activity-row">
        <button class="btn" data-act="walk">🦮 Walk</button>
        <button class="btn" data-act="feed">🍖 Feed</button>
        <button class="btn" data-act="fetch">🎾 Fetch</button>
      </div>
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
  el.querySelector('[data-back]').addEventListener('click', () => navigate('/pack'));
}
