import './styles/main.css';
import { registerSW } from 'virtual:pwa-register';
import {
  initStore,
  getActiveProfileId,
  setActiveProfileId,
  loadProfile,
  saveProfile,
  isSyncEnabled,
  isSoundEnabled,
  getVoicePref,
  syncNow,
} from './data/store.js';
import { register, startRouter, currentRoute, navigate } from './router.js';
import { isBeta, BETA_ROUTES } from './engine/beta.js';
import { pushProfile } from './data/sync.js';
import { storeScreen } from './screens/store.js';
import { initPressFeedback } from './ui.js';
import { setSoundOn, setVoicePreference } from './sound.js';
import { profilesScreen } from './screens/profiles.js';
import { homeScreen } from './screens/home.js';
import { quizScreen } from './screens/quiz.js';
import { resultsScreen } from './screens/results.js';
import { packScreen } from './screens/pack.js';
import { dogScreen } from './screens/dog.js';
import { groupScreen } from './screens/group.js';
import { awardsScreen } from './screens/awards.js';
import { littleGameScreen } from './screens/little.js';
import { wardrobeScreen } from './screens/wardrobe.js';
import { walletScreen } from './screens/wallet.js';
import { cornerScreen } from './screens/corner.js';
import { meetScreen } from './screens/meet.js';
import { activityScreen } from './screens/activity.js';
import { heatmapScreen } from './screens/heatmap.js';
import { grownupsScreen } from './screens/grownups.js';

const updateSW = registerSW({
  immediate: true,
  onRegisteredSW(swUrl, reg) {
    // Long-lived installed PWAs never re-check the SW on their own —
    // poll hourly and whenever the app returns to the foreground.
    if (!reg) return;
    setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') reg.update().catch(() => {});
    });
  },
});
initPressFeedback();
// Kid-proofing: pinch/double-tap zoom turns imprecise little taps into a
// zoomed mess. Standalone PWAs honor these; OS accessibility zoom still
// works for grown-ups. (Verify on-device: browser-tab Safari may ignore.)
document.addEventListener('gesturestart', (e) => e.preventDefault());
// Last-chance sync flush: when the app is hidden or killed, push the
// active profile with keepalive so a device switch can't strand a round.
const flush = () => {
  if (ctx.profile && isSyncEnabled()) pushProfile(ctx.profile);
};
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flush();
});
window.addEventListener('pagehide', flush);

// Regular CHECK-INS, not just pushes: moving between devices was
// inconsistent because pulls only happened at boot or by hand (a stale
// Cozy Corner hid a little pup's adopted pets on the new device). Sync
// two-way, then refresh the in-memory profile — but ONLY on passive
// screens: swapping ctx.profile mid-round would strand the round's
// in-flight mutations on the old object.
const PASSIVE_ROUTES = ['/home', '/profiles', '/pack', '/corner', '/wallet', '/awards', '/heatmap'];
let lastCheckIn = 0;
async function backgroundSync(force = false) {
  if (!isSyncEnabled()) return;
  const now = Date.now();
  if (!force && now - lastCheckIn < 45_000) return;
  lastCheckIn = now;
  try {
    await syncNow(); // pushes local docs too — heals stale server copies
    if (!ctx.profile) return;
    if (!PASSIVE_ROUTES.includes(currentRoute().path)) return;
    const fresh = await loadProfile(ctx.profile.id);
    if (fresh && fresh.updatedAt !== ctx.profile.updatedAt) {
      ctx.profile = fresh;
      navigate(currentRoute().path); // same-hash re-render shows the news
    }
  } catch {
    /* offline / away from home — try again on the next trigger */
  }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') backgroundSync();
});
window.addEventListener('hashchange', () => {
  if (currentRoute().path === '/home') backgroundSync();
});

const ctx = {
  profile: null,
  session: {},
  async save() {
    if (this.profile) await saveProfile(this.profile);
  },
  async switchProfile(profile) {
    this.profile = profile;
    this.session = {};
    await setActiveProfileId(profile ? profile.id : null);
    // a fresh pair of hands may be a fresh device — check in right away
    if (profile) setTimeout(() => backgroundSync(true), 50);
  },
};

register('/profiles', profilesScreen);
register('/home', homeScreen);
register('/quiz', quizScreen);
register('/results', resultsScreen);
register('/pack', packScreen);
register('/dog', dogScreen);
register('/group', groupScreen);
register('/awards', awardsScreen);
register('/little', littleGameScreen);
register('/wardrobe', wardrobeScreen);
register('/wallet', walletScreen);
register('/corner', cornerScreen);
register('/store', storeScreen);
register('/meet', meetScreen);
register('/activity', activityScreen);
register('/heatmap', heatmapScreen);
register('/grownups', grownupsScreen);

// Every screen except profile-select needs an active profile.
function guard(path) {
  if (!ctx.profile && path !== '/profiles') return '/profiles';
  if (BETA_ROUTES.includes(path) && !isBeta(ctx.profile)) return '/pack';
  return null;
}

async function boot() {
  await initStore();
  setSoundOn(isSoundEnabled());
  setVoicePreference(getVoicePref());
  if (isSyncEnabled()) {
    // Family backup: merge in anything newer from the home server before
    // rendering. Fails silently (and fast) when offline or away from home.
    try {
      await syncNow();
    } catch {
      /* keep booting */
    }
  }
  const id = await getActiveProfileId();
  if (id) ctx.profile = (await loadProfile(id)) ?? null;
  if (!location.hash) location.hash = ctx.profile ? '#/home' : '#/profiles';
  await startRouter(document.querySelector('#app'), ctx, guard);
}

boot();
