// Synthesized sound effects + haptics — no audio assets, no network, gentle
// by design. Everything is guarded: audio failing must never break play.
// The AudioContext is created lazily on first use (all our sounds fire after
// a tap, which satisfies autoplay policies).

let ctx = null;
let on = true;

export function setSoundOn(v) {
  on = v === true;
}

function ac() {
  if (!ctx) {
    const AC = window.AudioContext ?? window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone({ freq, at = 0, dur = 0.12, type = 'sine', vol = 0.15, slide }) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + at;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slide) osc.frequency.exponentialRampToValueAtTime(slide, t0 + dur);
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function safe(fn) {
  if (!on) return;
  try {
    fn();
  } catch {
    /* never let audio break the game */
  }
}

export const sfx = {
  correct: () =>
    safe(() => {
      tone({ freq: 660, dur: 0.09 });
      tone({ freq: 880, at: 0.09, dur: 0.12 });
    }),
  fast: () =>
    safe(() => {
      tone({ freq: 660, dur: 0.08 });
      tone({ freq: 880, at: 0.08, dur: 0.08 });
      tone({ freq: 1320, at: 0.16, dur: 0.14, vol: 0.12 });
    }),
  // Deliberately soft and low — a "hmm", not a buzzer.
  wrong: () => safe(() => tone({ freq: 233, slide: 196, dur: 0.25, vol: 0.1 })),
  celebrate: () =>
    safe(() => {
      [523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, at: i * 0.11, dur: 0.14, vol: 0.14 }));
    }),
  coin: () =>
    safe(() => {
      tone({ freq: 988, dur: 0.07, vol: 0.13 });
      tone({ freq: 1319, at: 0.08, dur: 0.16, vol: 0.13 });
    }),
  bark: () =>
    safe(() => {
      tone({ freq: 520, slide: 180, dur: 0.09, type: 'sawtooth', vol: 0.12 });
      tone({ freq: 560, slide: 200, at: 0.16, dur: 0.1, type: 'sawtooth', vol: 0.12 });
    }),
};

// Spoken prompts for pre-readers (little-pup mode). Uses the device's local
// speech voices — nothing leaves the device. Fails silently everywhere else.
//
// Voice choice matters: the OS default is often the most robotic voice on
// the device. We score what's installed and prefer natural/enhanced local
// English voices (Samantha on iOS, the "Natural" set on Windows, Google US
// English on Android/Chrome), falling back to the default when nothing
// scores.
let pickedVoice = null;
let preferredName = null;

// Parent override from Grown-Ups: an exact voice name, or null for the
// automatic picker. Falls back to automatic if the named voice vanishes
// (e.g. the pick was made on another device).
export function setVoicePreference(name) {
  preferredName = name || null;
  pickedVoice = null; // re-resolve on next use
}

// All English voices the device offers, best-scored first — for the picker.
export function listVoices() {
  try {
    return speechSynthesis
      .getVoices()
      .filter((v) => v.lang?.toLowerCase().startsWith('en'))
      .sort((a, b) => scoreVoice(b) - scoreVoice(a))
      .map((v) => v.name);
  } catch {
    return [];
  }
}

// iOS ships "novelty" voices (Superstar, Bubbles, Zarvox…) alongside the
// real ones — they must never win, however their names read. Real quality
// markers are the (Enhanced)/(Premium) suffixes on downloaded voices.
const NOVELTY =
  /superstar|good news|bad news|albert|bahh|bells|boing|bubbles|cellos|deranged|hysterical|jester|organ|princess|trinoids|whisper|wobble|zarvox|grandma|grandpa|eddy|flo|reed|rocko|sandy|shelley/;

function scoreVoice(v) {
  const name = `${v.name} ${v.voiceURI ?? ''}`.toLowerCase();
  if (NOVELTY.test(name)) return -100;
  let s = 0;
  if (v.localService) s += 2;
  if (v.lang?.toLowerCase() === 'en-us') s += 1;
  if (/premium/.test(name)) s += 8;
  else if (/enhanced|natural|neural/.test(name)) s += 6;
  if (/ava|allison|susan|serena|nicky|zoe|samantha|karen|aria|jenny|zira|joelle|noelle|google us english|google uk english female/.test(name)) s += 3;
  if (/compact|espeak|eloquence/.test(name)) s -= 8;
  // legacy 1990s Mac voices — robotic, but not flagged as novelty by iOS
  if (/\bfred\b|\bralph\b|\bkathy\b|\bjunior\b|\bbruce\b|\bvicki\b|\bvictoria\b|\bagnes\b/.test(name)) s -= 8;
  return s;
}

function bestVoice() {
  try {
    const en = speechSynthesis.getVoices().filter((v) => v.lang?.toLowerCase().startsWith('en'));
    if (!en.length) return null;
    return en.reduce((best, v) => (scoreVoice(v) > scoreVoice(best) ? v : best));
  } catch {
    return null;
  }
}

try {
  if ('speechSynthesis' in window) {
    // voices load async on most browsers; re-pick when the list arrives
    speechSynthesis.addEventListener?.('voiceschanged', () => {
      pickedVoice = bestVoice();
    });
  }
} catch {
  /* speech is optional everywhere */
}

let sayTimer = 0;
let voiceListSize = 0;

// iOS Safari often reports an empty/partial voice list until after the
// first utterance and rarely fires voiceschanged — so re-pick whenever
// the list has grown since we last looked.
function ensureVoice() {
  try {
    const size = speechSynthesis.getVoices().length;
    if (!pickedVoice || size !== voiceListSize) {
      voiceListSize = size;
      const wanted = preferredName
        ? speechSynthesis.getVoices().find((v) => v.name === preferredName)
        : null;
      pickedVoice = wanted ?? bestVoice();
    }
  } catch {
    /* speech is optional */
  }
}

// For the Grown-Ups screen: which voice the device gave us.
export function currentVoiceName() {
  ensureVoice();
  return pickedVoice?.name ?? 'system default';
}

export function say(text, { pitch = 1.1, rate = 0.9 } = {}) {
  if (!on) return;
  try {
    if (!('speechSynthesis' in window)) return;
    ensureVoice();
    clearTimeout(sayTimer);
    const wasBusy = speechSynthesis.speaking || speechSynthesis.pending;
    if (wasBusy) speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    try {
      if (pickedVoice) u.voice = pickedVoice;
    } catch {
      pickedVoice = null; // stale voice object (list refreshed) — re-pick next time
    }
    u.rate = rate;
    u.pitch = pitch;
    // A beat between cancel() and speak() stops iOS/Chrome from clipping
    // the first syllable of the new utterance; resume() un-sticks Chrome's
    // occasionally-paused engine.
    sayTimer = setTimeout(
      () => {
        try {
          speechSynthesis.resume();
          speechSynthesis.speak(u);
        } catch {
          /* no voices available — the visuals carry it */
        }
      },
      wasBusy ? 80 : 0
    );
  } catch {
    /* no voices available — the visuals carry it */
  }
}

// Praise with sparkle: noticeably higher and livelier than the reading
// voice, so celebration SOUNDS like celebration.
export function cheer(text) {
  say(text, { pitch: 1.4, rate: 1.05 });
}

export function buzz(pattern) {
  if (!on) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* not supported (e.g. iOS web) — the sound carries the feedback */
  }
}
