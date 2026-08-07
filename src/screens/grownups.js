import { navigate } from '../router.js';
import {
  profileTotals,
  fastThresholdMs,
  isCalibrated,
  dueCount,
  divisionMasteredCount,
  additionMasteredCount,
  subtractionMasteredCount,
} from '../engine/leitner.js';
import {
  deleteProfile,
  listDeletedPlayers,
  restoreDeletedPlayer,
  purgeDeletedPlayer,
  getLifecycleConflicts,
  resolveLifecycleConflict,
  listProfiles,
  importProfiles,
  isSyncEnabled,
  setSyncEnabled,
  isSoundEnabled,
  getSyncStatus,
  syncStaleness,
  getSyncKey,
  setSyncKey,
  getMetaConflicts,
  resolveMetaConflict,
  httpKeyAcknowledged,
  acknowledgeHttpKey,
  setSoundEnabled,
  getVoicePref,
  setVoicePref,
  syncNow,
} from '../data/store.js';
import { sfx, setSoundOn, currentVoiceName, say, listVoices, setVoicePreference } from '../sound.js';
import { totalTiers } from '../engine/achievements.js';
import { littleSkillTotal } from '../engine/trail.js';
import {
  balanceCents,
  formatPaw,
  ensureBucks,
  REASON_LABELS,
  ledgerState,
  trueBalanceCents,
  forgivenCents,
} from '../engine/money.js';
import { groupOf } from '../engine/ledger.js';
import { ownedGear, resetStoreEpoch } from '../engine/gearshop.js';
import { DOGS } from '../art/dogs.js';
import { PETS } from '../art/pets.js';
import { toast, escapeHtml, stalenessLine, offlineHint } from '../ui.js';
import { SCHEMA_VERSION, touchMeta } from '../data/schema.js';
import { bridgeVisible, tablesVisible, trackState, addingReady } from '../engine/readiness.js';

// 90 distinct normalized facts across tables 1–12 with factors 0–12.
const TOTAL_FACTS = 90;

// The gate: find every prime in a 3×3 grid — adult math, kid-proof-ish.
// Composites lean on the prime-looking odd ones (49, 39, 27…), never
// obvious evens only.
const GATE_PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
const GATE_COMPOSITES = [9, 15, 21, 25, 27, 33, 35, 39, 45, 49, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

function buildGateGrid() {
  const pick = (arr, n) => {
    const pool = [...arr];
    const out = [];
    while (out.length < n) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    return out;
  };
  const nPrimes = 2 + Math.floor(Math.random() * 2); // 2–3 primes
  const primes = pick(GATE_PRIMES, nPrimes);
  // Tricky odd composites first (they're listed first), topped up randomly.
  const cells = [...primes, ...pick(GATE_COMPOSITES, 9 - nPrimes)];
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return { cells, primes: new Set(primes) };
}

// Little Pup progress: shown once the profile has any little activity.
// The denominator is DERIVED from the trail registry — every skill key a
// little pup can make "known". It used to be a hand-maintained constant
// and had drifted to 130 against a real 132, so this row was quietly
// reporting the wrong total.
const LITTLE_SKILL_TOTAL = littleSkillTotal();

function littleStatsCard(p) {
  const skills = p.little?.skills ?? {};
  const xp = p.little?.xp ?? 0;
  if (!p.subjects?.little && !xp && !Object.keys(skills).length) return '';
  const known = (prefix) =>
    Object.entries(skills).filter(([k, v]) => k.startsWith(prefix) && v.streak >= 3).length;
  const knownAll = Object.values(skills).filter((v) => v.streak >= 3).length;
  const pets = (p.petUnlocks ?? []).length;
  return `
      <div style="height:12px"></div>
      <div class="card">
        <h3>Little pup progress 🐣</h3>
        <div class="stat-row"><span>Stars collected (xp)</span><span>${xp}</span></div>
        <div class="stat-row"><span>Numbers known (all games)</span><span>${knownAll} / ${LITTLE_SKILL_TOTAL}</span></div>
        <div class="stat-row"><span>Counting 1–10</span><span>${known('count:')} / 10</span></div>
        <div class="stat-row"><span>Quick Look</span><span>${known('look:')} / 10</span></div>
        <div class="stat-row"><span>Number friends (5 & 10)</span><span>${known('bond')} / 17</span></div>
        <div class="stat-row"><span>Teen numbers</span><span>${known('teen:')} / 9</span></div>
        <div class="stat-row"><span>Cozy Corner friends</span><span>${pets} / ${PETS.length}</span></div>
      </div>`;
}

export function grownupsScreen(el, params, ctx) {
  el.innerHTML = `
    <div class="screen">
      <div class="topbar">
        <button class="btn ghost small" data-back>← Back</button>
        <span class="spacer"></span>
        <h2 style="margin:0">Grown-ups 🔒</h2>
      </div>
      <div class="card center" data-gate>
        <p><strong>Grown-ups only!</strong></p>
        <p class="muted">Tap every prime number, then unlock.</p>
        <div class="gate-grid" data-gate-grid></div>
        <button class="btn" data-gate-check>🔓 Unlock</button>
      </div>
      <div data-panel hidden></div>
    </div>`;

  const gate = el.querySelector('[data-gate]');
  const panel = el.querySelector('[data-panel]');
  const gridEl = el.querySelector('[data-gate-grid]');

  let gatePrimes;
  const dealGate = () => {
    const { cells, primes } = buildGateGrid();
    gatePrimes = primes;
    gridEl.innerHTML = cells
      .map((n) => `<button class="gate-cell" data-cell="${n}" aria-pressed="false">${n}</button>`)
      .join('');
    for (const btn of gridEl.querySelectorAll('[data-cell]')) {
      btn.addEventListener('click', () => {
        const on = btn.getAttribute('aria-pressed') === 'true';
        btn.setAttribute('aria-pressed', String(!on));
        btn.classList.toggle('sel', !on);
      });
    }
  };
  dealGate();
  el.querySelector('[data-gate-check]').addEventListener('click', () => {
    const picked = [...gridEl.querySelectorAll('[data-cell].sel')].map((b) => Number(b.dataset.cell));
    const right =
      picked.length === gatePrimes.size && picked.every((n) => gatePrimes.has(n));
    if (right) {
      openPanel();
    } else {
      toast('Not quite — new numbers!');
      dealGate(); // fresh grid: no whittling it down by trial and error
    }
  });

  function openPanel() {
    const p = ctx.profile;
    const { attempts, correct, mastered } = profileTotals(p);
    const accuracy = attempts ? Math.round((correct / attempts) * 100) : 0;
    const dogsEarned = p.unlocks.length;
    gate.hidden = true;
    panel.hidden = false;

    // Does this family HAVE a server? Answered from stored evidence only —
    // no probe — so a returning family sees the section already open without
    // the app touching the network to find out. The async half (has this
    // device ever reached a server?) is folded in just below, since the
    // markup is built synchronously.
    const serverKnown = isSyncEnabled();

    panel.innerHTML = `
      <div class="card">
        <h3>${escapeHtml(p.name)}'s progress</h3>
        <div class="stat-row"><span>Facts mastered</span><span>${mastered} / ${TOTAL_FACTS}</span></div>
        <div class="stat-row"><span>Questions answered</span><span>${attempts}</span></div>
        <div class="stat-row"><span>Accuracy</span><span>${accuracy}%</span></div>
        <div class="stat-row"><span>Dogs adopted</span><span>${dogsEarned} / ${DOGS.length}</span></div>
        <div class="stat-row"><span>Fast-answer bar</span><span>${(fastThresholdMs(p) / 1000).toFixed(1)}s${isCalibrated(p) ? '' : ' (calibrating)'}</span></div>
        <div class="stat-row"><span>Facts needing a refresh</span><span>${dueCount(p)}</span></div>
        <div class="stat-row"><span>Division facts mastered</span><span>${divisionMasteredCount(p)}</span></div>
        ${
          bridgeVisible(p) || additionMasteredCount(p) || subtractionMasteredCount(p)
            ? `<div class="stat-row"><span>Adding facts mastered</span><span>${additionMasteredCount(p)} / 66</span></div>
        <div class="stat-row"><span>Taking-away families mastered</span><span>${subtractionMasteredCount(p)} / 66</span></div>`
            : ''
        }
        <div class="stat-row"><span>Award tiers earned</span><span>${totalTiers(p)}</span></div>
        <div class="stat-row"><span>Paw Bucks</span><span>${formatPaw(balanceCents(p))}</span></div>
        ${
          ledgerState(p).needsAttention.length
            ? `<div class="stat-row"><span class="muted" style="font-size:.8rem">⚠️ ${ledgerState(p).needsAttention.length}
               ledger entr${ledgerState(p).needsAttention.length === 1 ? 'y' : 'ies'} could not be read and count for nothing
               (${escapeHtml(ledgerState(p).needsAttention.slice(0, 3).map((n) => n.id).join(', '))}) —
               tell the developer if a reward looks missing</span><span></span></div>`
            : ''
        }
        ${
          forgivenCents(p) > 0
            ? `<div class="stat-row"><span class="muted" style="font-size:.8rem">…including ${formatPaw(forgivenCents(p))} written off
               (two devices spent the same coins while apart — not charged to ${escapeHtml(p.name)})</span>
               <span class="muted" style="font-size:.8rem">true total ${formatPaw(trueBalanceCents(p))}</span></div>`
            : ''
        }
      </div>
      ${littleStatsCard(p)}
      <div style="height:12px"></div>
      <div class="card">
        <h3>Paw Bucks ledger</h3>
        <p class="muted" style="font-size:.85rem">Coins follow the learning: a paw nickel when a fact is first mastered, a
        whole Paw Buck for a whole table, a penny for polishing a rusty fact (up to 25¢ a day), and a paw dime per
        pet-sitting visit (first two a day). Fully-mastered facts don't pay — practice there earns praise and awards
        instead. Game money only — never real currency.</p>
        <div data-ledger></div>
      </div>
      <div style="height:12px"></div>
      <div class="card">
        <h3>About Compounded</h3>
        <p class="muted">Each fact climbs levels: careful answers (like skip counting) build the
        first levels, and quick recall builds the rest — so a fact is only "mastered" once it's
        truly memorized, but working it out still earns visible progress. Mastering a whole
        table earns a new dog for the pack. The "fast" bar tunes itself to each kid's own
        reading and tapping speed, so quick counts as quick <em>for them</em>. Mastered facts
        get "rusty" after a while without practice and quietly come back around in rounds —
        levels and adopted dogs are never taken away.</p>
        <p class="muted"><strong>Privacy:</strong> everything is stored on this device —
        and, only if Family Backup is turned on below, copied to YOUR home server on your
        own network. No accounts, no ads, no tracking — ever.</p>
      </div>
      <div style="height:12px"></div>
      <div class="card">
        <h3>Settings</h3>
        <div class="nav-row">
          <button class="btn ghost small" data-sound-toggle></button>
          <button class="btn ghost small" data-voice-test>🗣️ Hear the voice</button>
        </div>
        <div style="height:8px"></div>
        <label class="muted" style="font-size:.85rem" for="voice-pick">Speech voice</label>
        <select id="voice-pick" class="voice-pick" data-voice-pick></select>
        <p class="muted" style="font-size:.8rem;margin:10px 0 0" data-voice-line>🗣️ Speech voice: ${escapeHtml(currentVoiceName())}.
        On iPhone/iPad you can install a nicer voice: Settings → Accessibility → Spoken Content →
        Voices → English (if Voices is missing, turn on "Speak Selection" first) — download one
        marked "Enhanced" or "Premium" and the app picks it up automatically.</p>
      </div>
      <div style="height:12px"></div>
      <div class="card">
        <h3>What ${escapeHtml(p.name)} sees</h3>
        <p class="muted" style="font-size:.85rem">Choose the parts of the app this player uses. Progress is always kept, even for hidden parts.</p>
        <div class="nav-row">
          <button class="btn ghost small" data-subj="little"></button>
          <button class="btn ghost small" data-subj="bridge"></button>
        </div>
        <div style="height:8px"></div>
        <div class="nav-row">
          <button class="btn ghost small" data-subj="tables"></button>
          <button class="btn ghost small" data-subj="childCanSwitch"></button>
        </div>
        <div style="height:8px"></div>
        <div class="nav-row">
          <button class="btn ghost small" data-subj="hideSitting"></button>
          <button class="btn ghost small" data-subj="beta"></button>
        </div>
        <p class="muted" style="font-size:.8rem;margin:8px 0 0">⚠️ Beta features are previews — they may be unstable, change, or lose their data as they develop.</p>
        <p class="muted" style="font-size:.85rem;margin:12px 0 6px">Times tables shown (none picked = all):</p>
        <div class="limit-grid" data-limit></div>
      </div>
      <div style="height:12px"></div>
      <div class="card">
        <h3>The trail 🐾</h3>
        <p class="muted" style="font-size:.85rem">Tracks open themselves as ${escapeHtml(p.name)} shows they're ready (anything started stays open). ✨ Auto follows this; On/Off overrides it.</p>
        ${['adding', 'takingaway', 'tables', 'division']
          .map((tr) => {
            const st = trackState(p, tr);
            const names = { adding: '➕ Adding', takingaway: '➖ Taking away', division: '➗ Division', tables: '✖️ Times tables' };
            const badge = st === 'started' ? '🟢 started' : st === 'ready' ? '✨ ready to open' : '⚪ not yet';
            return `<div class="stat-row"><span>${names[tr]}</span><span>${badge}</span></div>`;
          })
          .join('')}
      </div>
      <div style="height:12px"></div>
      <div class="card">
        <h3>Keeping progress safe</h3>
        <p class="muted">
          <strong>Everything a child does is stored only on this device</strong>,
          in this browser. Nothing is sent anywhere — and nothing can be
          recovered from an account, because there isn't one.
        </p>
        <details class="explain">
          <summary>What could erase it</summary>
          <p class="muted small-note">
            Browser storage is not permanent. Clearing site data, "free up
            space" tools, some private-browsing modes, and a reinstalled or
            reset device can all wipe it, and a browser may evict it on its own
            if the device runs low on space. Keeping a copy is worth the minute
            it takes.
          </p>
        </details>

        <div class="backup-group">
          <h4>💾 Save a file — works everywhere</h4>
          <p class="muted small-note">
            Downloads a file with the players you choose. Keep it somewhere you
            already back up.
          </p>
          <details class="explain">
            <summary>How to restore from a file</summary>
            <p class="muted small-note">
              On this device or a new one, open Grown-Ups and choose
              <em>Restore from a file</em>, then pick the file. Restoring adds
              those players back. It merges rather than overwrites — a player
              who is further ahead here keeps their progress — so restoring an
              old file can never undo newer work.
            </p>
          </details>
          <div class="nav-row">
            <button class="btn ghost small" data-export>⬇️ Save all players</button>
            <button class="btn ghost small" data-export-one>⬇️ Save just ${escapeHtml(p.name)}</button>
          </div>
          <div class="nav-row" style="margin-top:6px">
            <button class="btn ghost small" data-import>⬆️ Restore from a file</button>
          </div>
        </div>

        ${
          // The public build has no home server to talk to — a same-origin
          // /sync/ cannot exist on a public host — so the controls are not
          // rendered at all rather than shown as dead ends. The define is
          // read INLINE, not through a const: as a const the minifier kept
          // both branches in the bundle, and the point is for the unused
          // one to be gone. Guarded so a direct module import (tests) sees
          // the real app's behaviour.
          typeof __PUBLIC_DEMO__ !== 'undefined' && __PUBLIC_DEMO__
            ? `<div class="backup-group">
                 <h4>🏡 Home server — optional</h4>
                 <p class="muted small-note">
                   If you run Compounded on your own machine at home, every
                   device can back itself up and stay in sync automatically, on
                   your network only. That isn't available on this public
                   version — saving a file is.
                   <a href="https://github.com/dbolle/ComPoundEd/blob/main/deploy/README.md"
                      target="_blank" rel="noopener">How to set one up</a>.
                 </p>
               </div>`
            : `<details class="backup-group" data-server-group${serverKnown ? ' open' : ''}>
          <summary>🏡 Home server — automatic, needs your own server</summary>
          <p class="muted small-note">
            <strong>Needs a server you run yourself, on this same home
            network.</strong> There is nothing to sign up for and nothing goes
            to the internet. With one running, every device backs itself up and
            picks up what the others did, so a child can move between them. No
            server? Ignore this and save files instead.
          </p>
          <div class="nav-row">
            <button class="btn ghost small" data-sync-toggle></button>
            <button class="btn ghost small" data-sync-now>💾 Back up now</button>
          </div>
          <p class="muted" style="font-size:.8rem;margin:6px 0 0" data-sync-status></p>
          <!-- The key field sits on its own row: sharing one with the Save
               button truncated the placeholder to "Family k" on a phone. -->
          <div style="margin-top:8px">
            <input class="name-input" data-sync-key type="password"
              placeholder="Family key"
              autocomplete="off" style="width:100%" />
          </div>
          <p class="muted small-note" style="margin:4px 0 0">
            Only needed if your server asks for one.
          </p>
          <div class="nav-row" style="margin-top:6px">
            <button class="btn ghost small" data-sync-key-save>🔑 Save key</button>
          </div>
          <p class="muted" style="font-size:.75rem;margin:4px 0 0" data-key-note></p>
          <div class="nav-row" style="margin-top:6px">
            <button class="btn ghost small" data-deleted-players>🗂 Deleted players</button>
          </div>
          <div data-deleted-list></div>
          <div data-meta-conflicts></div>
        </details>`
        }
        <input type="file" accept=".json,application/json" hidden />
      </div>
      <div style="height:12px"></div>
      <div class="nav-row">
        <button class="btn ghost small" data-switch>🔄 Switch player</button>
        <button class="btn danger small" data-delete>🗑️ Delete this player</button>
      </div>
      <div style="height:8px"></div>
      <div class="nav-row">
        <button class="btn ghost small" data-store-reset>🏪 Fresh start in the store…</button>
      </div>
      <div data-store-reset-panel></div>
      <p class="muted center" style="font-size:.75rem;margin:14px 0 0">Compounded v${typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'} · saves v${SCHEMA_VERSION}</p>`;

    // Voice picker: Automatic (the scorer) by default; a chosen name
    // overrides it everywhere speech is used. iOS only fills the voice
    // list after speech runs, so the options refresh on open and after
    // each sample.
    const voicePick = panel.querySelector('[data-voice-pick]');
    const renderVoices = () => {
      const chosen = getVoicePref();
      const names = listVoices();
      if (chosen && !names.includes(chosen)) names.unshift(chosen); // keep a cross-device pick visible
      voicePick.innerHTML = [
        `<option value="">✨ Automatic${chosen ? '' : ` (${escapeHtml(currentVoiceName())})`}</option>`,
        ...names.map(
          (n) => `<option value="${escapeHtml(n)}"${n === chosen ? ' selected' : ''}>${escapeHtml(n)}</option>`
        ),
      ].join('');
    };
    renderVoices();
    voicePick.addEventListener('focus', renderVoices);
    voicePick.addEventListener('change', async () => {
      await setVoicePref(voicePick.value || null);
      setVoicePreference(voicePick.value || null);
      say(`Hi ${p.name}! Let's count some bones!`);
      setTimeout(refreshVoiceLine, 400);
    });

    const refreshVoiceLine = () => {
      const line = panel.querySelector('[data-voice-line]');
      if (line) line.firstChild.textContent = `🗣️ Speech voice: ${currentVoiceName()}.`;
      renderVoices();
    };
    panel.querySelector('[data-voice-test]').addEventListener('click', () => {
      say(`Hi ${p.name}! Let's count some bones!`);
      setTimeout(refreshVoiceLine, 400);
    });

    const soundBtn = panel.querySelector('[data-sound-toggle]');
    const renderSound = () => {
      soundBtn.textContent = isSoundEnabled() ? '🔊 Sounds & buzz: on' : '🔇 Sounds & buzz: off';
    };
    renderSound();
    soundBtn.addEventListener('click', async () => {
      await setSoundEnabled(!isSoundEnabled());
      setSoundOn(isSoundEnabled());
      renderSound();
      if (isSoundEnabled()) sfx.correct(); // audible sample of the new state
    });

    // Subject visibility switches. Each is a plain boolean on subjects;
    // the little toggle keeps its friendly toast.
    // bridge/tables cycle ✨Auto → On → Off (the trail decides on Auto,
    // keeping anything started visible); the rest stay simple booleans.
    const TRI = ['auto', true, false];
    const triLabel = (name, v) =>
      `${name}: ${v === true ? 'on' : v === false ? 'off' : '✨ auto'}`;
    const SUBJ_LABELS = {
      little: (v) => (v ? '🐣 Little pup: on' : '🧒 Little pup: off'),
      bridge: (v) => `➕ ${triLabel('Adding & taking away', v)}`,
      tables: (v) => `✖️ ${triLabel('Times tables', v)}`,
      childCanSwitch: (v) => (v ? '🔀 Child can switch: yes' : '🔀 Child can switch: no'),
      hideSitting: (v) => (v ? '🏡 Pet sitting: hidden' : '🏡 Pet sitting: shown'),
      beta: (v) => (v ? '🧪 Beta preview: on' : '🧪 Beta preview: off'),
    };
    for (const btn of panel.querySelectorAll('[data-subj]')) {
      const key = btn.dataset.subj;
      const tri = key === 'bridge' || key === 'tables';
      const render = () => {
        btn.textContent = SUBJ_LABELS[key](tri ? p.subjects?.[key] : !!p.subjects?.[key]);
      };
      render();
      btn.addEventListener('click', async () => {
        const next = tri
          ? TRI[(TRI.indexOf(p.subjects?.[key] ?? 'auto') + 1) % TRI.length]
          : !p.subjects?.[key];
        p.subjects = { ...(p.subjects ?? {}), [key]: next };
        touchMeta(p); // parent setting — must survive a stale device saving later
        await ctx.save();
        render();
        if (key === 'little') {
          toast(
            p.subjects.little
              ? `${p.name} now sees the counting games 🐣`
              : `${p.name} now sees the full app 🧒`
          );
        }
      });
    }

    const limitGrid = panel.querySelector('[data-limit]');
    const renderLimit = () => {
      limitGrid.innerHTML = '';
      const limit = p.subjects?.limitTables ?? [];
      for (let t = 1; t <= 12; t++) {
        const chip = document.createElement('button');
        chip.className = `limit-chip${!limit.length || limit.includes(t) ? ' on' : ''}`;
        chip.textContent = `×${t}`;
        chip.addEventListener('click', async () => {
          let next = limit.length ? [...limit] : [];
          if (next.includes(t)) next = next.filter((x) => x !== t);
          else next.push(t);
          if (next.length === 12) next = []; // all picked = no limit
          p.subjects = { ...(p.subjects ?? {}), limitTables: next.sort((x, y) => x - y) };
          touchMeta(p);
          await ctx.save();
          renderLimit();
        });
        limitGrid.appendChild(chip);
      }
    };
    renderLimit();

    // The home-server controls are not rendered at all on the public build,
    // so every lookup below must tolerate their absence. An unguarded
    // querySelector().addEventListener on a missing element is precisely the
    // v1.47.3 store defect — a null dereference that took the whole screen
    // down after some listeners were already attached.
    const toggleBtn = panel.querySelector('[data-sync-toggle]');
    const renderToggle = () => {
      if (!toggleBtn) return;
      toggleBtn.textContent = isSyncEnabled() ? '🟢 Backup: on' : '⚪ Backup: off';
    };
    renderToggle();
    // Per-device status: the switch and these timestamps live in THIS
    // browser's storage — a device (or the same device via the other
    // address) can be dark while others sync fine.
    const ago = (t) => {
      if (!t) return 'never';
      const m = Math.round((Date.now() - t) / 60000);
      if (m < 1) return 'just now';
      if (m < 60) return `${m} min ago`;
      const h = Math.round(m / 60);
      return h < 48 ? `${h} h ago` : `${Math.round(h / 24)} days ago`;
    };
    const renderStatus = async (lastResult = null) => {
      const statusEl = panel.querySelector('[data-sync-status]');
      if (!statusEl) return;
      const s = await getSyncStatus();
      const stale = syncStaleness(s);
      if (lastResult?.status === 'denied') {
        statusEl.textContent = '🔑 Backup is locked — the server needs the family key (below).';
        statusEl.dataset.level = 'denied';
      } else if (lastResult?.status === 'offline') {
        // couldn't connect: say so, and name the cause we can't detect
        statusEl.textContent = [
          "⚠️ Couldn't reach the home server — nothing was backed up.",
          offlineHint(),
        ]
          .filter(Boolean)
          .join(' ');
        statusEl.dataset.level = 'alarm';
      } else {
        const warn = stalenessLine(stale);
        statusEl.textContent = s.enabled
          ? `${warn ? `⚠️ ${warn} ` : ''}This device — last backup: ${ago(s.lastPushAt)} · last check-in: ${ago(s.lastPullAt)}`
          : 'This device is not backing up. Each device (and each address it uses) has its own switch.';
        statusEl.dataset.level = warn ? stale.level : 'ok';
        if (warn) openServerGroup(); // a device gone quiet must not be hidden
      }
    };
    // Collapsing this section must never bury something a grown-up has to
    // ACT on. Meta conflicts and deleted players live inside it, and a
    // closed <details> hides its contents outright — which is how a
    // conflict card the app promises to "surface, never auto-resolve"
    // ended up invisible. Anything that puts business inside the group
    // opens it.
    const openServerGroup = () => {
      const group = panel.querySelector('[data-server-group]');
      if (group) group.open = true;
    };

    renderStatus();
    // The other half of "does this family have a server?": has this device
    // ever actually reached one? That is stored state (lastPushAt /
    // lastPullAt), so it still costs no network call — it just isn't
    // available synchronously when the markup is built.
    getSyncStatus().then((s) => {
      if (s.lastPushAt || s.lastPullAt) openServerGroup();
    });
    // Family key entry: stored only on this device; on plain http the
    // first send requires an explicit acknowledgement (LAN-observable).
    {
      const keyInput = panel.querySelector('[data-sync-key]');
      const note = panel.querySelector('[data-key-note]');
      getSyncKey().then((k) => {
        if (k && keyInput) keyInput.placeholder = 'Family key: set on this device';
      });
      if (note && location.protocol === 'http:') {
        note.textContent =
          'Note: on this http address the key travels unencrypted on your own network — https://compounded.lan is safer.';
      }
      panel.querySelector('[data-sync-key-save]')?.addEventListener('click', async () => {
        const val = keyInput.value.trim();
        if (!val) {
          toast('Type the family key first');
          return;
        }
        if (location.protocol === 'http:' && !(await httpKeyAcknowledged())) {
          if (!window.confirm('This http address sends the key unencrypted on your own network. Use it anyway? (https://compounded.lan is safer)')) return;
          await acknowledgeHttpKey();
        }
        await setSyncKey(val);
        keyInput.value = '';
        keyInput.placeholder = 'Family key: set on this device';
        if (isSyncEnabled()) {
          const r = await syncNow();
          renderStatus(r);
          toast(r.status === 'denied' ? 'That key was not accepted' : 'Key saved — backup unlocked 🔑');
        } else {
          toast('Key saved');
        }
      });
    }
    toggleBtn?.addEventListener('click', async () => {
      await setSyncEnabled(!isSyncEnabled());
      renderToggle();
      renderStatus();
      if (isSyncEnabled()) {
        const r = await syncNow();
        toast(
          r.status === 'offline'
            ? 'Backup is on — will sync when the home server is reachable'
            : 'Family backup is on 🏡'
        );
      } else {
        toast('Family backup turned off');
      }
    });
    // Storage-recovery conflicts: two versions of the same setting with
    // the same change-count (a storage hiccup). Both values are kept
    // until a grown-up picks — never auto-resolved, never discarded.
    getMetaConflicts().then((conflicts) => {
      if (!conflicts.length) return;
      const LABELS = {
        syncKey: 'family key',
        syncEnabled: 'backup on/off',
        soundEnabled: 'sound',
        voicePref: 'voice',
        activeProfileId: 'last player',
      };
      const wrap = panel.querySelector('[data-meta-conflicts]');
      if (!wrap) return;
      openServerGroup(); // a conflict is a decision waiting on a grown-up
      const show = (v) =>
        v === null || v === undefined
          ? '(not set)'
          : typeof v === 'boolean'
            ? v ? 'on' : 'off'
            : escapeHtml(String(v)).slice(0, 24);
      wrap.innerHTML = `<div class="card" style="border:2px solid #f59e0b;margin-top:8px">
        <h3 style="margin:0 0 6px">⚠️ Settings need a choice</h3>
        <p class="muted" style="margin:0 0 6px;font-size:.8rem">A storage hiccup left two versions of these. Both are safe — pick the one you want.</p>
        ${conflicts
          .map(
            (c) => `<div class="stat-row" data-mc-row="${escapeHtml(c.key)}">
              <span>${LABELS[c.key] ?? escapeHtml(c.key)}</span>
              <span><button class="btn ghost small" data-mc-keep="${escapeHtml(c.key)}">Keep ${show(c.kept)}</button>
              <button class="btn ghost small" data-mc-other="${escapeHtml(c.key)}">Use ${show(c.other)}</button></span></div>`
          )
          .join('')}</div>`;
      const settle = async (key, choice) => {
        await resolveMetaConflict(key, choice);
        wrap.querySelector(`[data-mc-row="${key}"]`)?.remove();
        if (!wrap.querySelector('[data-mc-row]')) wrap.innerHTML = '';
        toast('Setting saved');
      };
      for (const b of wrap.querySelectorAll('[data-mc-keep]'))
        b.addEventListener('click', () => settle(b.dataset.mcKeep, 'kept'));
      for (const b of wrap.querySelectorAll('[data-mc-other]'))
        b.addEventListener('click', () => settle(b.dataset.mcOther, 'other'));
    });

    // Deleted players: restore (back to every device) or purge forever.
    // Both are parental decisions; purge is irreversible by design.
    panel.querySelector('[data-deleted-players]')?.addEventListener('click', async () => {
      const listEl = panel.querySelector('[data-deleted-list]');
      if (!listEl) return;
      openServerGroup();
      listEl.innerHTML = '<p class="muted">Looking…</p>';
      const [remote, conflicts] = await Promise.all([listDeletedPlayers(), getLifecycleConflicts()]);
      const rows = [];
      for (const c of conflicts) {
        rows.push(`<div class="stat-row" data-conflict-row="${c.id}">
          <span>⚠️ ${escapeHtml(c.name)} — deleted here, changed elsewhere</span>
          <span><button class="btn ghost small" data-resolve-del="${c.id}">Delete everywhere</button>
          <button class="btn ghost small" data-resolve-keep="${c.id}">Keep player</button></span></div>`);
      }
      if (remote.ok) {
        for (const e of remote.entries) {
          rows.push(`<div class="stat-row" data-deleted-row="${e.id}">
            <span>${escapeHtml(e.name ?? e.id)}</span>
            <span><button class="btn ghost small" data-restore-id="${e.id}">↩️ Restore</button>
            <button class="btn ghost small" data-purge-id="${e.id}">🔥 Purge forever</button></span></div>`);
        }
      }
      listEl.innerHTML = rows.length
        ? rows.join('')
        : `<p class="muted">${remote.ok ? 'No deleted players in the family backup.' : remote.denied ? 'Backup is locked — enter the family key first.' : 'Could not reach the home server.'}</p>`;
      for (const b of listEl.querySelectorAll('[data-restore-id]')) {
        b.addEventListener('click', async () => {
          const r = await restoreDeletedPlayer(b.dataset.restoreId);
          toast(
            r.ok
              ? `${r.name} is back! They will return on every device 🏡`
              : r.reason === 'too-large'
                ? 'That backup is too large to restore here'
                : 'Could not restore — try again near the home server'
          );
          if (r.ok) listEl.querySelector(`[data-deleted-row="${b.dataset.restoreId}"]`)?.remove();
        });
      }
      for (const b of listEl.querySelectorAll('[data-purge-id]')) {
        b.addEventListener('click', async () => {
          if (!window.confirm('Purge forever? The archived progress is destroyed and can NEVER be restored.')) return;
          const r = await purgeDeletedPlayer(b.dataset.purgeId);
          toast(r.ok ? 'Purged — gone for good' : 'Could not purge — try again near the home server');
          if (r.ok) listEl.querySelector(`[data-deleted-row="${b.dataset.purgeId}"]`)?.remove();
        });
      }
      for (const b of listEl.querySelectorAll('[data-resolve-del]')) {
        b.addEventListener('click', async () => {
          const r = await resolveLifecycleConflict(b.dataset.resolveDel, 'delete');
          toast(r.ok ? 'Deleted everywhere — final progress archived' : 'Could not finish — try again');
          if (r.ok) listEl.querySelector(`[data-conflict-row="${b.dataset.resolveDel}"]`)?.remove();
        });
      }
      for (const b of listEl.querySelectorAll('[data-resolve-keep]')) {
        b.addEventListener('click', async () => {
          const r = await resolveLifecycleConflict(b.dataset.resolveKeep, 'keep');
          toast(r.ok ? 'Player kept — they are back on this device' : 'Could not finish — try again');
          if (r.ok) listEl.querySelector(`[data-conflict-row="${b.dataset.resolveKeep}"]`)?.remove();
        });
      }
    });

    panel.querySelector('[data-sync-now]')?.addEventListener('click', async () => {
      if (!isSyncEnabled()) {
        toast('Turn backup on first');
        return;
      }
      const r = await syncNow();
      renderStatus(r);
      toast(
        r.status === 'offline'
          ? [
              "Couldn't reach the home server — nothing was backed up.",
              offlineHint(),
            ]
              .filter(Boolean)
              .join(' ')
          : r.status === 'denied'
            ? 'Backup is locked — enter the family key below'
            : r.status === 'partial'
              ? 'Some players did not back up — will retry automatically'
              : r.pushed === 0
                ? 'Already up to date on the home server ✅'
                : 'Backed up to the home server 💾'
      );
    });

    // Same file format for both — import handles either, anywhere.
    const exportProfiles = (profiles, label) => {
      const data = {
        app: 'compounded',
        exportedAt: new Date().toISOString(),
        profiles,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `compounded-backup-${label}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    };
    panel.querySelector('[data-export]').addEventListener('click', async () => {
      exportProfiles(await listProfiles(), 'all');
    });
    panel.querySelector('[data-export-one]').addEventListener('click', () => {
      exportProfiles([p], p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'player');
    });
    const fileInput = panel.querySelector('input[type=file]');
    panel.querySelector('[data-import]').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        const docs = Array.isArray(data.profiles) ? data.profiles : [];
        const n = await importProfiles(docs);
        toast(n ? `Imported ${n} player${n > 1 ? 's' : ''} 🐾` : 'No players found in that file');
      } catch {
        toast("That file doesn't look like a Compounded backup");
      }
      fileInput.value = '';
    });

    const ledger = panel.querySelector('[data-ledger]');
    const txns = [...ensureBucks(p).txns].filter((t) => t.cents !== 0).sort((a, b) => b.at - a.at).slice(0, 8);
    ledger.innerHTML = txns.length
      ? (() => {
          // derived annotations: a purchase that lost a cross-device coin
          // race shows as returned (the child sees the item back on the
          // shelf, never a negative balance); conflicting duplicate ids
          // are quarantined out of the totals but kept in the history
          const { voided, quarantined } = ledgerState(p);
          const note = (t) => {
            const gid = groupOf(t);
            if (quarantined.has(t.id)) return ' · ⚠️ conflicting copies — not counted';
            if (voided.has(gid)) return ' · 🏪 void (fresh start in the store)';
            return '';
          };
          return txns
            .map(
              (t) =>
                `<div class="stat-row"><span>${Number.isFinite(t.at) ? new Date(t.at).toLocaleDateString() : '—'} · ${REASON_LABELS[t.reason] ?? t.reason}${note(t)}</span><span>${t.cents > 0 ? '+' : ''}${formatPaw(t.cents)}</span></div>`
            )
            .join('');
        })()
      : '<p class="muted" style="margin:0">No transactions yet.</p>';

    // Fresh start in the store: two deliberate confirmations, each
    // stating exactly what happens, because this is a big visible change
    // for the child (everything they bought comes off their pets).
    {
      const host = panel.querySelector('[data-store-reset-panel]');
      const earned = ensureBucks(p).txns.reduce((s, t) => s + (t.cents > 0 && t.reason !== 'swap' ? t.cents : 0), 0);
      const owned = ownedGear(p).length;
      const step2 = () => {
        host.innerHTML = `<div class="card" style="border:2px solid #dc2626;margin-top:8px">
          <h3 style="margin:0 0 6px">Last check — this is the one that does it</h3>
          <p class="muted" style="margin:0 0 8px">Type <strong>RESET</strong> to confirm a fresh start for
          ${escapeHtml(p.name)}. Their ${owned} purchased item${owned === 1 ? '' : 's'} will come off
          their pups and pets right away, and they will be able to buy anything again.</p>
          <input class="name-input" data-reset-word placeholder="RESET" autocomplete="off" />
          <div class="nav-row" style="margin-top:8px">
            <button class="btn danger small" data-reset-go>Give a fresh start</button>
            <button class="btn ghost small" data-reset-cancel>Cancel</button>
          </div></div>`;
        host.querySelector('[data-reset-cancel]').addEventListener('click', () => (host.innerHTML = ''));
        host.querySelector('[data-reset-go]').addEventListener('click', async () => {
          if (host.querySelector('[data-reset-word]').value.trim().toUpperCase() !== 'RESET') {
            toast('Type RESET to confirm');
            return;
          }
          const epoch = resetStoreEpoch(p);
          await ctx.save();
          host.innerHTML = `<p class="muted" style="margin-top:8px">✅ Fresh start done (store visit ${epoch}).
            ${escapeHtml(p.name)} has ${formatPaw(balanceCents(p))} to spend.</p>`;
          toast(`${p.name} has a fresh start in the store 🏪`);
        });
      };
      panel.querySelector('[data-store-reset]').addEventListener('click', () => {
        if (host.querySelector('[data-reset-go]')) return;
        host.innerHTML = `<div class="card" style="border:2px solid #f59e0b;margin-top:8px">
          <h3 style="margin:0 0 6px">Fresh start in the store?</h3>
          <p class="muted" style="margin:0 0 4px">For ${escapeHtml(p.name)} this would:</p>
          <ul class="muted" style="margin:0 0 8px;padding-left:18px;font-size:.85rem">
            <li>give back every Paw Buck they have ever earned — ${formatPaw(earned)}</li>
            <li>undo all ${owned} of their purchases, so their pups and pets lose those items</li>
            <li>let them buy anything again, as if the store opened today</li>
            <li>keep their whole history for you here — nothing is deleted, and their
                learning progress, pets and awards are untouched</li>
          </ul>
          <div class="nav-row">
            <button class="btn small" data-reset-next>Continue</button>
            <button class="btn ghost small" data-reset-cancel>Never mind</button>
          </div></div>`;
        host.querySelector('[data-reset-cancel]').addEventListener('click', () => (host.innerHTML = ''));
        host.querySelector('[data-reset-next]').addEventListener('click', step2);
      });
    }

    panel.querySelector('[data-switch]').addEventListener('click', () => navigate('/profiles'));
    panel.querySelector('[data-delete]').addEventListener('click', async () => {
      const sure = window.confirm(
        `Delete ${p.name}? They are removed from all devices — but kept safely in the family backup until you restore or permanently purge them from the Deleted players list.`
      );
      if (!sure) return;
      const r = await deleteProfile(p.id);
      toast(
        r.remote === 'confirmed'
          ? `${p.name} removed here and archived in the family backup`
          : r.remote === 'conflict'
            ? `${p.name} removed here — the backup changed elsewhere; resolve it under Deleted players`
            : `${p.name} removed here — the family backup will catch up when the server is reachable`
      );
      await ctx.switchProfile(null);
      navigate('/profiles');
    });
  }

  el.querySelector('[data-back]').addEventListener('click', () => navigate('/home'));
}
