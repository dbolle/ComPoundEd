import { avatarFor } from '../art/avatar.js';
import { touchMeta } from '../data/schema.js';
import {
  listProfiles,
  createProfile,
  saveProfile,
  setSyncEnabled,
  syncNow,
  offerBackup,
  dismissBackupOffer,
  setSyncKey,
  httpKeyAcknowledged,
  acknowledgeHttpKey,
  listDeletedPlayers,
  restoreDeletedPlayer,
  storageStatus,
  getSyncStatus,
  syncStaleness,
} from '../data/store.js';
import { navigate } from '../router.js';
import { getDog, dogSVG, wornFor } from '../art/dogs.js';
import { toast, escapeHtml, stalenessLine } from '../ui.js';

export async function profilesScreen(el, params, ctx) {
  const profiles = await listProfiles();

  el.innerHTML = `
    <div class="screen">
      <div class="center">
        <h1>Compounded 🐾</h1>
        <p class="muted">Who's playing today?</p>
      </div>
      <div data-storage-warning></div>
      <div data-backup-offer></div>
      <div class="profile-list"></div>
      <button class="btn accent" data-new>➕ New player</button>
      <form class="card" data-create hidden>
        <h3>What's your name?</h3>
        <input class="name-input" maxlength="14" autocomplete="off" placeholder="Type your name" />
        <div style="height:12px"></div>
        <div class="nav-row">
          <button class="btn" type="submit" data-kind="big">🧒 Big kid</button>
          <button class="btn accent" type="submit" data-kind="little">🐣 Little pup</button>
        </div>
        <p class="muted center" style="margin:8px 0 0;font-size:.85rem">Little pups (ages 3–5) get counting games!</p>
      </form>
      <button class="btn ghost small" data-restore style="margin-top:auto">↻ Restore family backup</button>
    </div>`;

  // The family server holds backups but this device/origin has the switch
  // off — offer once (parents see this screen; a kid tapping "turn on" is
  // harmless, it's the family's own server).
  // A device switched ON but not reaching the server looks identical to a
  // healthy one from here — which is exactly how two iPads went days
  // without backing up. Say it plainly, on the screen a parent lands on.
  getSyncStatus().then((s) => {
    const warn = stalenessLine(syncStaleness(s));
    if (!warn || el.querySelector('[data-stale]')) return;
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.stale = '1';
    card.innerHTML = `<p class="muted" style="margin:0;font-size:.85rem">⚠️ ${escapeHtml(warn)}</p>`;
    el.querySelector('[data-backup-offer]')?.appendChild(card);
  });

  offerBackup().then(({ offer, denied }) => {
    // the screen can render more than once at boot — one card only
    if (!offer || el.querySelector('[data-offer-on]')) return;
    const card = document.createElement('div');
    card.className = 'card center';
    card.innerHTML = denied
      ? `<p style="margin:0 0 8px">🔑 This server keeps family backups locked with a family key.</p>
        <div class="nav-row">
          <button class="btn small" data-offer-on>Enter the key</button>
          <button class="btn ghost small" data-offer-no>Not now</button>
        </div>`
      : `<p style="margin:0 0 8px">📦 Family backup is set up on this server —
        turn it on for this device?</p>
      <div class="nav-row">
        <button class="btn small" data-offer-on>🏡 Turn on</button>
        <button class="btn ghost small" data-offer-no>Not now</button>
      </div>`;
    card.querySelector('[data-offer-on]').addEventListener('click', async () => {
      if (denied) {
        const ok = await promptForKey(card);
        if (!ok) return;
      }
      await setSyncEnabled(true);
      const r = await syncNow();
      if (r.status === 'denied') {
        toast('That key was not accepted — check it in Grown-Ups');
        return;
      }
      toast(r.found ? `Backup on — ${r.found} player${r.found > 1 ? 's' : ''} synced 🏡` : 'Backup on 🏡');
      profilesScreen(el, params, ctx);
    });
    card.querySelector('[data-offer-no]').addEventListener('click', async () => {
      await dismissBackupOffer();
      card.remove();
    });
    el.querySelector('[data-backup-offer]')?.appendChild(card);
  });

  // Password-style key entry (also the replacement-device path: no
  // profiles yet, restore says the server is locked). On plain-http
  // origins the first send needs an explicit acknowledgement — the key
  // is observable on the local network there.
  async function promptForKey(host) {
    if (host.querySelector('[data-key-input]')) return false;
    return new Promise((resolve) => {
      const wrap = document.createElement('div');
      const needsAck = location.protocol === 'http:';
      wrap.innerHTML = `<input class="name-input" data-key-input type="password"
          placeholder="Family key" autocomplete="off" style="margin-top:8px" />
        ${needsAck ? `<label class="muted" style="display:block;font-size:.8rem;margin:6px 0">
          <input type="checkbox" data-key-ack /> I understand this address (http) sends the key
          unencrypted on my own network — https://compounded.lan is safer.</label>` : ''}
        <div class="nav-row" style="margin-top:8px">
          <button class="btn small" data-key-save>Save key</button>
        </div>`;
      host.appendChild(wrap);
      wrap.querySelector('[data-key-save]').addEventListener('click', async () => {
        const val = wrap.querySelector('[data-key-input]').value.trim();
        if (!val) return;
        if (needsAck && !(await httpKeyAcknowledged())) {
          if (!wrap.querySelector('[data-key-ack]')?.checked) {
            toast('Please confirm the http note first');
            return;
          }
          await acknowledgeHttpKey();
        }
        await setSyncKey(val);
        wrap.remove();
        resolve(true);
      });
    });
  }

  // Storage health: a degraded session (IndexedDB down where it used to
  // work) or no storage at all shows a PERSISTENT banner — players may
  // look missing but are safe; recovery merges automatically later.
  {
    const st = storageStatus();
    if (st.degraded || st.backend !== 'idb') {
      el.querySelector('[data-storage-warning]').innerHTML = `<div class="card center" style="border: 2px solid #f59e0b">
        <p style="margin:0">${
          st.backend === 'none'
            ? '⚠️ This browser is not letting the app save anything right now. Playing works, but progress will NOT be kept — please restart the app or try another browser.'
            : '⚠️ Storage hiccup: players may look missing — they are SAFE. Restart the app; anything done now is kept separately and merged back automatically once storage recovers.'
        }</p></div>`;
    }
  }

  // A device with ZERO live players (e.g. replaced hardware) must still
  // be able to reach deleted-player recovery without Grown-Ups.
  if (profiles.length === 0) {
    listDeletedPlayers().then((r) => {
      if (!r.ok || !r.entries.length || el.querySelector('[data-deleted-restore]')) return;
      const card = document.createElement('div');
      card.className = 'card center';
      card.innerHTML = `<p style="margin:0 0 8px">🗂 The family backup holds deleted players.</p>
        ${r.entries
          .map(
            (e) => `<div class="nav-row" style="margin:4px 0"><span>${escapeHtml(e.name ?? e.id)}</span>
            <button class="btn ghost small" data-deleted-restore="${e.id}">↩️ Restore</button></div>`
          )
          .join('')}`;
      for (const b of card.querySelectorAll('[data-deleted-restore]')) {
        b.addEventListener('click', async () => {
          const res = await restoreDeletedPlayer(b.dataset.deletedRestore);
          toast(res.ok ? `${res.name} is back 🏡` : 'Could not restore');
          if (res.ok) profilesScreen(el, params, ctx);
        });
      }
      el.querySelector('[data-backup-offer]')?.appendChild(card);
    });
  }

  const list = el.querySelector('.profile-list');
  for (const p of profiles) {
    const btn = document.createElement('button');
    btn.className = 'profile-card';
    btn.innerHTML = `<span class="avatar">${avatarFor(p).svg(64)}</span>
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
    let r = await syncNow();
    if (r.status === 'denied') {
      // replacement device with zero profiles: the key entry must be
      // reachable HERE — Grown-Ups may not exist yet
      const host = btn.parentElement;
      btn.textContent = '🔑 This server needs the family key';
      const ok = await promptForKey(host);
      if (ok) r = await syncNow();
    }
    if (r.found > 0) {
      toast(`Restored ${r.found} player${r.found > 1 ? 's' : ''} 🏡`);
      profilesScreen(el, params, ctx);
    } else {
      await setSyncEnabled(false);
      toast(
        r.status === 'denied'
          ? 'The family key was not accepted'
          : 'No backup found on the home network'
      );
      btn.disabled = false;
      btn.textContent = '↻ Restore family backup';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = input.value.trim();
    if (!name) return;
    const st = storageStatus();
    if (
      (st.degraded || st.backend !== 'idb') &&
      !window.confirm(
        'Storage is having a hiccup. A player made now is kept separately and merged back automatically when storage recovers. Create anyway?'
      )
    ) {
      return;
    }
    const p = await createProfile(name);
    if (e.submitter?.dataset.kind === 'little') {
      p.subjects = { ...(p.subjects ?? {}), little: true };
    } else {
      // A brand-new big kid has no history for the trail to grandfather —
      // the creation choice IS the readiness signal, so tables start on.
      p.subjects = { ...(p.subjects ?? {}), tables: true };
    }
    touchMeta(p); // the creation choice is a setting — beat the just-saved default
    await saveProfile(p);
    await ctx.switchProfile(p);
    navigate('/home');
  });
}
