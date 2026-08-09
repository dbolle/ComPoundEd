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
  bark: (seed) => safe(() => VOICES.dog(seed)),
};

// A real animal call is VOICED NOISE, not a filtered tone: turbulent
// breath and an irregular vocal fold, shaped by several formants at
// once. Two other things matter more than they look:
//   * jitter — tiny random pitch wobble is what makes it rough/alive;
//     a perfectly steady oscillator always reads as a beep.
//   * where the energy sits — phone and tablet speakers radiate almost
//     nothing below ~400Hz, so a "deep" voice built on a 100Hz
//     fundamental arrives as a thin whistle. The body has to live in
//     the 400–2000Hz formants; the low fundamental only supplies
//     harmonics.
// tanh soft-clip curve — drives the voiced source into the chaotic,
// pressed phonation of a real bark. A clean sawtooth through filters
// stays "a note"; distortion is what vocal-fold chaos sounds like.
function shaperCurve(amount) {
  const n = 1024;
  const curve = new Float32Array(n);
  const k = Math.tanh(amount);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    curve[i] = Math.tanh(amount * x) / k;
  }
  return curve;
}

function growl({
  at = 0,
  dur = 0.25,
  vol = 0.12,
  f0 = [260, 150], // pitch path (harmonic source, not the loudest part)
  jitter = 0.06, // fraction of f0 wobbled every ~9ms
  noiseMix = 0.55, // how much of the source is breath
  formants = [
    [620, 2.2, 1],
    [1250, 3, 0.7],
    [2500, 4, 0.35],
  ],
  sweep = 0.6, // formants close to this fraction by the end (the vowel)
  open = null, // jaw gesture: formants OPEN to f*open first, then close
  type = 'sawtooth',
  attack = 0.012,
  drive = 0, // waveshaper amount on the voiced source (bark roughness)
  rough = 0, // amplitude-flutter depth 0–1 (the growl in a woof)
  roughHz = 45, // flutter rate — 25–70Hz reads as roughness, not tremolo
}) {
  const c = ac();
  if (!c) return;
  at *= LEN;
  dur *= LEN;
  const t0 = c.currentTime + at;

  const out = c.createGain();
  out.gain.setValueAtTime(0.0001, t0);
  out.gain.exponentialRampToValueAtTime(vol, t0 + attack);
  out.gain.exponentialRampToValueAtTime(vol * 0.55, t0 + dur * 0.5);
  out.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  out.connect(c.destination);

  // --- voiced source with jitter (the roughness) ---
  const osc = c.createOscillator();
  osc.type = type;
  const steps = Math.max(2, Math.round(dur / 0.009));
  for (let i = 0; i <= steps; i++) {
    const p = i / steps;
    const base = f0[0] + (f0[f0.length - 1] - f0[0]) * p;
    const wobble = 1 + (Math.random() * 2 - 1) * jitter;
    osc.frequency.setValueAtTime(Math.max(40, base * wobble), t0 + dur * p);
  }
  const oscGain = c.createGain();
  oscGain.gain.value = 1 - noiseMix;
  if (drive > 0) {
    const ws = c.createWaveShaper();
    ws.curve = shaperCurve(drive);
    osc.connect(ws).connect(oscGain);
  } else {
    osc.connect(oscGain);
  }

  // --- amplitude flutter (roughness) — a sub-audio wobble on the output
  // gain; without it the envelope is one smooth arc and reads as a beep
  if (rough > 0) {
    const am = c.createOscillator();
    am.frequency.value = roughHz;
    const amGain = c.createGain();
    amGain.gain.value = vol * rough * 0.5;
    am.connect(amGain).connect(out.gain);
    am.start(t0);
    am.stop(t0 + dur + 0.02);
  }

  // --- breath source ---
  const frames = Math.max(1, Math.ceil(c.sampleRate * dur));
  const buf = c.createBuffer(1, frames, c.sampleRate);
  const nd = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) nd[i] = Math.random() * 2 - 1;
  const nsrc = c.createBufferSource();
  nsrc.buffer = buf;
  const nGain = c.createGain();
  nGain.gain.value = noiseMix;
  nsrc.connect(nGain);

  // --- formant bank: both sources through every formant ---
  for (const [f, q, g] of formants) {
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    if (open) {
      // "w-AH-oo": start part-closed, snap open by a quarter in, then
      // close down — the jaw gesture is what makes "woof" a word
      bp.frequency.setValueAtTime(f * 0.65, t0);
      bp.frequency.exponentialRampToValueAtTime(f * open, t0 + dur * 0.25);
      bp.frequency.exponentialRampToValueAtTime(Math.max(120, f * sweep), t0 + dur);
    } else {
      bp.frequency.setValueAtTime(f, t0);
      bp.frequency.exponentialRampToValueAtTime(Math.max(120, f * sweep), t0 + dur);
    }
    bp.Q.value = q;
    const fg = c.createGain();
    fg.gain.value = g;
    oscGain.connect(bp);
    nGain.connect(bp);
    bp.connect(fg).connect(out);
  }
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
  nsrc.start(t0);
  nsrc.stop(t0 + dur + 0.02);
}

// ---------------------------------------------------------------------
// Option banks for the voices still being chosen by ear. IMPORTANT: a
// voice used by the listen-and-count game must be ONE clear event — a
// child counting "how many?" cannot be handed a sound that fires twice.
// Single-event options are marked [1]; multi-event ones [n].
//
// A woof is a mouth-opening transient plus a voiced body whose formants
// SWEEP as the pitch falls (that fall IS the "woo→oo"). One oscillator
// through one fixed filter can only ever be a beep.
// LOCKED by ear check (2026-08-02): both round-2 picks stay — with a
// whole pack of dogs, two voices beat one. A dog keeps ITS bark: the
// voice is chosen by a hash of the dog's id (see dogVoice), so the
// same dog always sounds the same and roughly half the pack is big.
// (The round-3 distortion experiments lost to these and were removed;
// git has them if the itch ever returns.)
const DOG_OPTIONS = [
  // 1 [1] "BOOF" — big chesty dog
  () => {
    noise({ dur: 0.03, vol: 0.09, freq: 800, slide: 380, q: 0.7 });
    growl({
      dur: 0.36, vol: 0.16, f0: [190, 105], jitter: 0.05, noiseMix: 0.4,
      formants: [[520, 1.6, 1], [1050, 2.2, 0.75], [2100, 3, 0.3]],
      sweep: 0.6, attack: 0.02,
    });
  },
  // 2 [1] "YIP" — little dog
  () => {
    noise({ dur: 0.012, vol: 0.1, freq: 2800, slide: 1200, q: 1 });
    growl({
      dur: 0.12, vol: 0.13, f0: [560, 380], jitter: 0.11, noiseMix: 0.4,
      formants: [[1150, 2.8, 1], [2200, 3.4, 0.9], [3600, 4, 0.5]],
      sweep: 0.55, attack: 0.005, type: 'square',
    });
  },
];

// Same dog, same bark — but different dogs differ. No seed (a generic
// bark with no dog on screen) means the big BOOF.
function dogVoice(seed) {
  if (!seed) return DOG_OPTIONS[0];
  let h = 0;
  for (const ch of String(seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return DOG_OPTIONS[h % DOG_OPTIONS.length];
}

// LOCKED by ear check (2026-08-02): the purr-click won. The soft
// squeak stays in the bank on purpose — saved for future use cases
// (a second rabbit, a happy/sleepy variant).
const RABBIT_OPTIONS = [
  // 1 [1] purr-click (contentment) — IN USE
  () => noise({ dur: 0.2, vol: 0.24, freq: 950, slide: 620, q: 3.5 }),
  // 2 [1] soft squeak — saved for future use
  () => voiced({ dur: 0.18, vol: 0.16, type: 'triangle', path: [780, 1180, 900], formant: 1900, q: 6, vibrato: 26 }),
];

const SLOTH_OPTIONS = [
  // 1 [1] the original sigh (its noise burst has a fast attack — that is
  // the "snare" crack before the breath)
  () => {
    noise({ dur: 0.55, vol: 0.1, freq: 700, slide: 380, q: 1.2 });
    voiced({ dur: 0.55, vol: 0.08, type: 'triangle', path: [330, 300, 250], formant: 900, q: 4 });
  },
  // 2 [1] no onset crack: the breath FADES IN (growl's own envelope has a
  // slow attack here) so nothing hits at t=0
  () =>
    growl({
      dur: 0.6,
      vol: 0.12,
      f0: [300, 230],
      jitter: 0.03,
      noiseMix: 0.75, // mostly breath
      formants: [[620, 1.4, 1], [1150, 1.8, 0.5]],
      sweep: 0.7,
      attack: 0.16, // long fade-in — no transient at all
      type: 'triangle',
    }),
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

// Which option each voice uses — ALL LOCKED by ear check (2026-08-02).
// (The dog ignores this and picks per-dog via dogVoice.) Unused options
// stay in their banks on purpose: they are a ready-made variety pool
// (see BACKLOG).
const CHOICE = { dog: 0, rabbit: 0, bird: 2, sloth: 1 };

export const VOICE_OPTIONS = { dog: DOG_OPTIONS, rabbit: RABBIT_OPTIONS, bird: BIRD_OPTIONS, sloth: SLOTH_OPTIONS };

// Play one specific option — the QA listening page only.
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
  dog: (seed) => dogVoice(seed)(),
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
  sloth: () => SLOTH_OPTIONS[CHOICE.sloth](),
  // hedgehog: quick snuffles, all breath, no voice
  hedgehog: () => {
    [0, 0.1, 0.19, 0.3].forEach((at, i) =>
      noise({ at, dur: 0.08, vol: 0.14 - i * 0.013, freq: 1500 + i * 180, slide: 900, q: 1.5 })
    );
  },
  // pig "oink": a nasal double grunt. Three things make it a pig rather
  // than a small dog: (1) NASAL resonance — a low first formant near
  // 500Hz with broad, heavily damped peaks (nasals are damped, so Q is
  // low) and almost nothing above ~2kHz, which is why it measures much
  // darker than the bark; (2) a buzzy, rough source — a pig grunt is a
  // slow, pressed vocal fold, so jitter and amplitude flutter are high
  // and the drive pushes it past "a note"; (3) the DOUBLE — an oink is
  // rarely one grunt.
  //
  // The double must NOT become two countable events: the little-pup game
  // plays this n times and asks "how many oinks?". So the second grunt is
  // scheduled to start before the first has faded — measured interior
  // silence is 0ms across 20 renders, against the 60ms the counting spec's
  // detector needs to call something a new event. Widening the 0.105
  // offset is what would break that.
  pig: () => {
    const grunt = (at, dur, vol, f0) =>
      growl({
        at, dur, vol, f0,
        jitter: 0.14, // a grunt is rough, not a hum
        noiseMix: 0.3, // mostly voice; snout breath is the seasoning
        formants: [
          [520, 1.8, 1], // nasal murmur — broad and damped, not a whistle
          [1180, 2.2, 0.5],
          [2200, 3, 0.08], // barely there: the reason it reads dark
        ],
        open: 1.3, // snout opens then closes — the "oi→nk"
        sweep: 0.5,
        attack: 0.008,
        drive: 2.2, // pressed phonation
        rough: 0.6,
        roughHz: 52,
      });
    grunt(0, 0.085, 0.095, [250, 165]);
    grunt(0.105, 0.075, 0.072, [225, 150]);
  },
  // turtle: a soft "hup" and a little water blip
  turtle: () => {
    noise({ dur: 0.12, vol: 0.24, freq: 420, slide: 240, q: 2 });
    voiced({ at: 0.18, dur: 0.2, vol: 0.17, type: 'sine', path: [300, 520], formant: 800, q: 6 });
  },
};

// Speak for a species (pets) — falls back to the dog for anything else.
// `seed` is the buddy's id where the caller knows it: dogs use it to
// keep one consistent voice per dog; other species ignore it.
export function critterSound(species, seed = null) {
  safe(() => (VOICES[species] ?? VOICES.dog)(seed));
}

export const CRITTER_SPECIES = Object.keys(VOICES);

// What a child calls each animal's sound — "how many barks?" is wrong
// when the buddy is a cat (same number–noun agreement rule as the rest
// of the app). [one, many]
const SOUND_WORDS = {
  dog: ['bark', 'barks'],
  cat: ['meow', 'meows'],
  // the locked rabbit voice is the purr-click — the counting question
  // has to name what the child actually hears
  rabbit: ['click', 'clicks'],
  guinea: ['squeak', 'squeaks'],
  bird: ['chirp', 'chirps'],
  sloth: ['sigh', 'sighs'],
  hedgehog: ['snuffle', 'snuffles'],
  turtle: ['hum', 'hums'],
  pig: ['oink', 'oinks'],
};

export function soundWord(species, n = 2) {
  const pair = SOUND_WORDS[species] ?? SOUND_WORDS.dog;
  return n === 1 ? pair[0] : pair[1];
}

// Numbers as words, 0–120 — the counting range of the hundred chart plus
// the 101–120 tail. Prompts for pre-readers are SPOKEN, and a bare numeral
// is at the mercy of whichever voice the device picked; a word is not.
//
// English composes above twenty ("forty-seven") but NOT below it: eleven,
// twelve, thirteen and fifteen are irregular, and the decade words are
// their own vocabulary rather than derivations. So 0–20 and the decades are
// a lookup, and only the composition rule is a rule. That irregularity is
// the reason the counting game targets decade crossings: 29→30 is a
// vocabulary jump for a child, not an increment.
const ONES = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
  'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
  'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
];
const TENS = {
  20: 'twenty', 30: 'thirty', 40: 'forty', 50: 'fifty',
  60: 'sixty', 70: 'seventy', 80: 'eighty', 90: 'ninety',
};

// The judgement calls, all decided for a child's EAR rather than for a
// grammar book:
//  * "one hundred one", not "one hundred and one" — the app speaks US
//    English (as its spelling does), and that is the sequence a child
//    chants off a hundred chart. The "and" also invites a listener to hear
//    a second, separate number ("one hundred... and one").
//  * "one hundred", never "a hundred" — counting needs the number, and it
//    keeps 100 parallel with 101–120.
//  * a hyphen in "forty-seven": correct written English (these strings also
//    end up in aria-labels), and every voice reads a hyphen BETWEEN LETTERS
//    as a word break — only a hyphen before a digit risks "minus".
//  * out of range or fractional (121, -1, 7.5) → the numeral via String(n).
//    A voice still reads "121" and "-1" aloud correctly, and the numeral is
//    honest on screen, so a range slip degrades to today's behaviour rather
//    than throwing or inventing a word.
//  * anything that is not a finite number (undefined, null, NaN, '7', {})
//    → '', because say('') is a silent no-op while String() would have a
//    voice tell a six-year-old "undefined", "NaN" or "[object Object]".
//    Deliberately NO coercion: the same Number() that turns '7' into 7 also
//    turns null, '' and [] into 0, and a confidently spoken WRONG number
//    ("zero") is far worse in a counting game than saying nothing.
export function numberWord(n) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '';
  if (!Number.isInteger(n) || n < 0 || n > 120) return String(n);
  if (n <= 20) return ONES[n];
  if (n < 100) {
    const tens = Math.floor(n / 10) * 10;
    const ones = n % 10;
    return ones ? `${TENS[tens]}-${ONES[ones]}` : TENS[tens];
  }
  // Above 120 would need real hundreds vocabulary, so this prefix is a
  // literal on purpose: raising the cap has to be a deliberate edit here
  // instead of silently saying "one hundred four hundred".
  const rest = n - 100;
  return rest ? `one hundred ${numberWord(rest)}` : 'one hundred';
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
