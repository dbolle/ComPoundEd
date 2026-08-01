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
  // resume() can throw synchronously (offline/rendering contexts) or
  // reject (autoplay policy) — neither may silence the whole sound
  if (ctx.state === 'suspended') {
    try {
      ctx.resume()?.catch?.(() => {});
    } catch {
      /* nothing to resume */
    }
  }
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

// A burst of filtered noise — the breathy part of any real animal
// sound. Pure oscillators can't make a bark; noise through a bandpass
// (plus a formant peak) is what reads as a voice rather than a beep.
// One knob for how long the critter voices run. They read as clipped
// when short — a real animal sound has a body, not just an attack.
const LEN = 2;

function noise({ at = 0, dur = 0.12, vol = 0.12, freq = 800, q = 4, slide, type = 'bandpass' }) {
  const c = ac();
  if (!c) return;
  at *= LEN;
  dur *= LEN;
  const t0 = c.currentTime + at;
  const frames = Math.max(1, Math.ceil(c.sampleRate * dur));
  const buf = c.createBuffer(1, frames, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = type;
  filter.frequency.setValueAtTime(freq, t0);
  if (slide) filter.frequency.exponentialRampToValueAtTime(slide, t0 + dur);
  filter.Q.value = q;
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + Math.min(0.012, dur / 3)); // fast attack
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(gain).connect(c.destination);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

// A voiced tone with a formant peak and an optional pitch path — the
// difference between "a note" and "an animal saying something".
function voiced({
  at = 0,
  dur = 0.3,
  vol = 0.1,
  type = 'sawtooth',
  path = [400, 400],
  formant = 1000,
  formantTo = null, // sweeping the formant IS the vowel change ("oo"→"f")
  formant2 = null, // a second peak: one formant reads as a tone, two as a voice
  q = 6,
}) {
  const c = ac();
  if (!c) return;
  at *= LEN;
  dur *= LEN;
  const t0 = c.currentTime + at;
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(path[0], t0);
  path.slice(1).forEach((f, i) => {
    const when = t0 + (dur * (i + 1)) / (path.length - 1);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, f), when);
  });
  if (arguments[0].vibrato) {
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    lfo.frequency.value = arguments[0].vibrato;
    lfoGain.gain.value = path[0] * 0.06;
    lfo.connect(lfoGain).connect(osc.frequency);
    lfo.start(t0);
    lfo.stop(t0 + dur + 0.02);
  }
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + dur * 0.12); // quick attack
  gain.gain.setValueAtTime(vol, t0 + dur * 0.55);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); // full decay, no clip
  const mkFormant = (f, weight) => {
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(f, t0);
    if (formantTo) filter.frequency.exponentialRampToValueAtTime(Math.max(80, f * (formantTo / formant)), t0 + dur);
    filter.Q.value = q;
    const g = c.createGain();
    g.gain.value = weight;
    osc.connect(filter).connect(g).connect(gain);
  };
  mkFormant(formant, 1);
  if (formant2) mkFormant(formant2, 0.6);
  gain.connect(c.destination);
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
  bark: () => safe(() => VOICES.dog()),
};

// ---------------------------------------------------------------------
// Option banks for the voices still being chosen by ear. IMPORTANT: a
// voice used by the listen-and-count game must be ONE clear event — a
// child counting "how many?" cannot be handed a sound that fires twice.
// Single-event options are marked [1]; multi-event ones [n].
//
// A woof is a mouth-opening transient plus a voiced body whose formants
// SWEEP as the pitch falls (that fall IS the "woo→oo"). One oscillator
// through one fixed filter can only ever be a beep.
const DOG_OPTIONS = [
  // 1 [1] deep classic woof
  () => {
    noise({ dur: 0.025, vol: 0.1, freq: 1100, slide: 420, q: 0.8 });
    voiced({ at: 0.006, dur: 0.24, vol: 0.11, type: 'sawtooth', path: [210, 150, 95], formant: 700, formantTo: 330, formant2: 1400, q: 2.4 });
  },
  // 2 [1] chesty boof — big dog, lots of body
  () => {
    noise({ dur: 0.03, vol: 0.09, freq: 700, slide: 300, q: 0.7 });
    voiced({ at: 0.008, dur: 0.32, vol: 0.12, type: 'square', path: [150, 120, 80], formant: 480, formantTo: 240, formant2: 1000, q: 2 });
  },
  // 3 [1] gruff ruff — faster fall, brighter, a hint of growl
  () => {
    noise({ dur: 0.02, vol: 0.11, freq: 1600, slide: 500, q: 1 });
    voiced({ at: 0.005, dur: 0.2, vol: 0.1, type: 'sawtooth', path: [300, 170, 100], formant: 900, formantTo: 380, formant2: 1800, q: 3, vibrato: 45 });
  },
  // 4 [1] low WOOF — deepest and slowest, big-dog-down-the-street
  () => {
    noise({ dur: 0.035, vol: 0.08, freq: 600, slide: 260, q: 0.6 });
    voiced({ at: 0.01, dur: 0.4, vol: 0.12, type: 'sawtooth', path: [120, 95, 70], formant: 400, formantTo: 200, formant2: 820, q: 1.8 });
  },
  // 5 [1] breathy husky bark — noise-forward with a voiced core
  () => {
    noise({ dur: 0.22, vol: 0.13, freq: 900, slide: 300, q: 1.4 });
    voiced({ at: 0.01, dur: 0.2, vol: 0.07, type: 'sawtooth', path: [230, 140, 90], formant: 750, formantTo: 300, q: 2.2 });
  },
  // 6 [1] muffled woof — soft-edged, the gentlest of the six
  () => {
    noise({ dur: 0.05, vol: 0.06, freq: 500, slide: 220, q: 0.9, type: 'lowpass' });
    voiced({ at: 0.012, dur: 0.3, vol: 0.115, type: 'triangle', path: [180, 130, 90], formant: 560, formantTo: 260, formant2: 900, q: 2.6 });
  },
];

const RABBIT_OPTIONS = [
  // 1 [1] one deep foot thump
  () => noise({ dur: 0.26, vol: 0.26, freq: 130, slide: 60, q: 1, type: 'lowpass' }),
  // 2 [1] honk — the little grunt a happy rabbit makes
  () => voiced({ dur: 0.22, vol: 0.13, type: 'sawtooth', path: [260, 210, 175], formant: 520, formantTo: 380, formant2: 1100, q: 4 }),
  // 3 [1] soft squeak
  () => voiced({ dur: 0.18, vol: 0.1, type: 'triangle', path: [780, 1180, 900], formant: 1900, q: 6, vibrato: 26 }),
  // 4 [1] purr-click (contentment) — one short burst
  () => noise({ dur: 0.2, vol: 0.14, freq: 950, slide: 620, q: 3.5 }),
  // 5 [1] drum thump with room — deeper, longer tail
  () => {
    noise({ dur: 0.34, vol: 0.24, freq: 105, slide: 55, q: 1.2, type: 'lowpass' });
    voiced({ at: 0.005, dur: 0.3, vol: 0.07, type: 'sine', path: [95, 70], formant: 220, q: 3 });
  },
  // 6 [n] the current one: two thumps, then a squeak
  () => {
    for (const at of [0, 0.19]) noise({ at, dur: 0.12, vol: 0.2, freq: 190, slide: 90, q: 1, type: 'lowpass' });
    voiced({ at: 0.4, dur: 0.12, vol: 0.09, type: 'triangle', path: [900, 1150], formant: 2000, q: 5 });
  },
];

const BIRD_OPTIONS = [
  // 1 [n] the current one: three tiny chirps
  () =>
    [0, 0.12, 0.23].forEach((at, i) =>
      voiced({ at, dur: 0.07, vol: 0.055, type: 'sine', path: [2600 + i * 250, 3800, 2900], formant: 3200, q: 4 })
    ),
  // 2 [1] a single sweet chirp
  () => voiced({ dur: 0.14, vol: 0.07, type: 'sine', path: [2400, 3900, 2800], formant: 3200, q: 4 }),
  // 3 [1] two-note tweet as one gesture (down then up)
  () => voiced({ dur: 0.2, vol: 0.065, type: 'sine', path: [3400, 2300, 3100, 2600], formant: 2900, q: 3.5 }),
];

// Which option each still-being-chosen voice uses (updated once the ear
// check picks winners).
const CHOICE = { dog: 0, rabbit: 0, bird: 0 };

export const VOICE_OPTIONS = { dog: DOG_OPTIONS, rabbit: RABBIT_OPTIONS, bird: BIRD_OPTIONS };

// Play one specific option — the chooser page only.
export function playVoiceOption(species, index) {
  safe(() => VOICE_OPTIONS[species]?.[index]?.());
}

// Per-species voices. Every one is deliberately soft (the charter asks
// for calm): short, low volume, no startle. Built from a noise burst
// (breath) plus a voiced formant (the "vowel"), which is what separates
// an animal from a beep.
const VOICES = {
  // two quick woofs: noise burst + a fast downward voiced growl
  // A woof is three things in ~200ms: a broadband mouth-opening
  // transient, a voiced body whose formants SWEEP down (that's the
  // "oo"), and a breathy tail (the "f"). One oscillator through one
  // fixed filter can only ever be a beep.
  dog: () => DOG_OPTIONS[CHOICE.dog](),
  // meow: up then down, with the vibrato a cat's throat gives it
  cat: () => {
    voiced({ dur: 0.45, vol: 0.1, type: 'sawtooth', path: [520, 780, 620, 430], formant: 1300, q: 7, vibrato: 22 });
    noise({ at: 0.02, dur: 0.05, vol: 0.04, freq: 1800, q: 1 });
  },
  rabbit: () => RABBIT_OPTIONS[CHOICE.rabbit](),
  // guinea pig "wheek": a rising squeal that keeps climbing
  guinea: () => {
    voiced({ dur: 0.34, vol: 0.1, type: 'sawtooth', path: [780, 1450, 1650], formant: 2200, q: 8, vibrato: 30 });
  },
  bird: () => BIRD_OPTIONS[CHOICE.bird](),
  // sloth: a long, slow, breathy sigh — almost too quiet to notice
  sloth: () => {
    noise({ dur: 0.55, vol: 0.1, freq: 700, slide: 380, q: 1.2 });
    voiced({ dur: 0.55, vol: 0.08, type: 'triangle', path: [330, 300, 250], formant: 900, q: 4 });
  },
  // hedgehog: quick snuffles, all breath, no voice
  hedgehog: () => {
    [0, 0.1, 0.19, 0.3].forEach((at, i) =>
      noise({ at, dur: 0.08, vol: 0.2 - i * 0.018, freq: 1500 + i * 180, slide: 900, q: 1.5 })
    );
  },
  // turtle: a soft "hup" and a little water blip
  turtle: () => {
    noise({ dur: 0.12, vol: 0.24, freq: 420, slide: 240, q: 2 });
    voiced({ at: 0.18, dur: 0.2, vol: 0.17, type: 'sine', path: [300, 520], formant: 800, q: 6 });
  },
};

// Speak for a species (pets) — falls back to the dog for anything else.
export function critterSound(species) {
  safe(() => (VOICES[species] ?? VOICES.dog)());
}

export const CRITTER_SPECIES = Object.keys(VOICES);

// What a child calls each animal's sound — "how many barks?" is wrong
// when the buddy is a cat (same number–noun agreement rule as the rest
// of the app). [one, many]
const SOUND_WORDS = {
  dog: ['bark', 'barks'],
  cat: ['meow', 'meows'],
  rabbit: ['thump', 'thumps'],
  guinea: ['squeak', 'squeaks'],
  bird: ['chirp', 'chirps'],
  sloth: ['sigh', 'sighs'],
  hedgehog: ['snuffle', 'snuffles'],
  turtle: ['hum', 'hums'],
};

export function soundWord(species, n = 2) {
  const pair = SOUND_WORDS[species] ?? SOUND_WORDS.dog;
  return n === 1 ? pair[0] : pair[1];
}

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
