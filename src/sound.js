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

function scoreVoice(v) {
  const name = v.name.toLowerCase();
  let s = 0;
  if (v.localService) s += 2;
  if (/natural|enhanced|premium|neural/.test(name)) s += 4;
  if (/samantha|karen|aria|jenny|zira|google us english|google uk english female/.test(name)) s += 3;
  if (/compact|espeak|eloquence|albert|zarvox|whisper|bad news/.test(name)) s -= 6;
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

export function say(text, { pitch = 1.1, rate = 0.9 } = {}) {
  if (!on) return;
  try {
    if (!('speechSynthesis' in window)) return;
    if (!pickedVoice) pickedVoice = bestVoice();
    clearTimeout(sayTimer);
    const wasBusy = speechSynthesis.speaking || speechSynthesis.pending;
    if (wasBusy) speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (pickedVoice) u.voice = pickedVoice;
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
