import { listProfiles, createProfile, setSyncEnabled, syncNow } from '../data/store.js';
import { navigate } from '../router.js';
import { getDog, dogSVG } from '../art/dogs.js';
import { toast, escapeHtml } from '../ui.js';

export async function profilesScreen(el, params, ctx) {
  const profiles = await listProfiles();

  el.innerHTML = `
    <div class="screen">
      <div class="center">
        <h1>Compounded 🐾</h1>
        <p class="muted">Who's playing today?</p>
      </div>
      <div class="profile-list"></div>
      <button class="btn accent" data-new>➕ New player</button>
      <form class="card" data-create hidden>
        <h3>What's your name?</h3>
        <input class="name-input" maxlength="14" autocomplete="off" placeholder="Type your name" />
        <div style="height:12px"></div>
        <button class="btn" type="submit">Let's go! 🐶</button>
      </form>
      <button class="btn ghost small" data-restore style="margin-top:auto">↻ Restore family backup</button>
    </div>`;

  const list = el.querySelector('.profile-list');
  for (const p of profiles) {
    const btn = document.createElement('button');
    btn.className = 'profile-card';
    btn.innerHTML = `<span class="avatar">${dogSVG(getDog(p.avatarDogId), 64)}</span>
      <span>${escapeHtml(p.name)}</span>`;
    btn.addEventListener('click', async () => {
      await ctx.switchProfile(p);
      navigate('/home');
    });
    list.appendChild(btn);
  }

  const form = el.querySelector('[data-create]');
  const input = form.querySelector('input');
  el.querySelector('[data-new]').addEventListener('click', (e) => {
    e.currentTarget.hidden = true;
    form.hidden = false;
    input.focus();
  });
  // New/replaced device: pull the family backup from the home server. Only
  // stays enabled if a backup was actually found.
  el.querySelector('[data-restore]').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.textContent = 'Looking for the home server…';
    await setSyncEnabled(true);
    const found = await syncNow();
    if (found > 0) {
      toast(`Restored ${found} player${found > 1 ? 's' : ''} 🏡`);
      profilesScreen(el, params, ctx);
    } else {
      await setSyncEnabled(false);
      toast('No backup found on the home network');
      btn.disabled = false;
      btn.textContent = '↻ Restore family backup';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = input.value.trim();
    if (!name) return;
    const p = await createProfile(name);
    await ctx.switchProfile(p);
    navigate('/home');
  });
}
