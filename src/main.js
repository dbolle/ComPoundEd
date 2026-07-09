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
  syncNow,
} from './data/store.js';
import { register, startRouter } from './router.js';
import { initPressFeedback } from './ui.js';
import { setSoundOn } from './sound.js';
import { profilesScreen } from './screens/profiles.js';
import { homeScreen } from './screens/home.js';
import { quizScreen } from './screens/quiz.js';
import { resultsScreen } from './screens/results.js';
import { packScreen } from './screens/pack.js';
import { dogScreen } from './screens/dog.js';
import { groupScreen } from './screens/group.js';
import { awardsScreen } from './screens/awards.js';
import { littleGameScreen } from './screens/little.js';
import { activityScreen } from './screens/activity.js';
import { heatmapScreen } from './screens/heatmap.js';
import { grownupsScreen } from './screens/grownups.js';

registerSW({ immediate: true });
initPressFeedback();

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
register('/activity', activityScreen);
register('/heatmap', heatmapScreen);
register('/grownups', grownupsScreen);

// Every screen except profile-select needs an active profile.
function guard(path) {
  if (!ctx.profile && path !== '/profiles') return '/profiles';
  return null;
}

async function boot() {
  await initStore();
  setSoundOn(isSoundEnabled());
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
