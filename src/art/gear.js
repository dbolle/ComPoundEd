// Store gear: the future pet-store inventory. Wearable accessories render
// through dogs.js overlays (any dog can wear them once purchased — Phase 4);
// toys are standalone art for shelves and dog pages. No prices here — the
// store sets those. All original CC0 art, house style.

// Tiers (docs/PHASE store plan, prices pinned 2026-07-20 against the
// known economy): treasures are one-of-a-kind and move between wearers;
// gifts are bought FOR a wearer; toys are shared household things.
// `beta: true` items are visible only with the 🧪 chip on. That is not a
// soft launch — it is how a price stays UNLOCKED. Listed prices are frozen
// by tests/economy-invariants.spec.js the moment a child can reach them
// (one purchase must never be worth two amounts across devices), and beta
// features are the documented exemption to the preservation rule. So a new
// item is drawn, priced provisionally, judged by eye, and only then leaves
// beta — at which point its price enters the lock for good.
export const GEAR_ACCESSORIES = [
  { id: 'crown', name: 'royal crown', emoji: '👑', slot: 'head', tier: 'treasure', price: 1200 },
  { id: 'tiara', name: 'sparkle tiara', emoji: '👸', slot: 'head', tier: 'treasure', price: 800 },
  { id: 'party', name: 'party hat', emoji: '🥳', slot: 'head', tier: 'gift', price: 120 },
  { id: 'flower', name: 'ear flower', emoji: '🌼', slot: 'ear', tier: 'gift', price: 100 },
  { id: 'glasses', name: 'smart glasses', emoji: '🤓', slot: 'eyes', tier: 'gift', price: 150 },
  { id: 'sunglasses', name: 'cool shades', emoji: '😎', slot: 'eyes', tier: 'gift', price: 200 },
  { id: 'scarf', name: 'cozy scarf', emoji: '🧣', slot: 'neck', tier: 'gift', price: 160 },
  { id: 'bowtie', name: 'fancy bowtie', emoji: '🎀', slot: 'neck', tier: 'gift', price: 125 },

  // --- v1.51.0: shipped after an art review, prices now locked ----------
  // The dear ones are `treasure` (one-of-a-kind, moving between wearers);
  // the rest are `gift` (bought for one friend, arriving worn) — which
  // reads more naturally for a name tag or goggles than for a diamond
  // collar. Spread across four slots on purpose: the store already stacks
  // items on `head`, and piling three onto `neck` would have made
  // overlapping collars the common case (wearing is now one-per-slot).
  { id: 'diamond', name: 'diamond collar', emoji: '💎', slot: 'neck', tier: 'treasure', price: 1100 },
  { id: 'flowercrown', name: 'flower crown', emoji: '🌸', slot: 'head', tier: 'treasure', price: 900 },
  // Partners the flower crown, so it takes the same tier: a matching set a
  // child can put on one friend at once, rather than one piece that moves
  // and one that doesn't.
  { id: 'flowercollar', name: 'flower collar', emoji: '💐', slot: 'neck', tier: 'treasure', price: 600 },
  { id: 'earmuffs', name: 'winter earmuffs', emoji: '🎧', slot: 'ear', tier: 'gift', price: 450 },
  { id: 'tophat', name: 'tiny top hat', emoji: '🎩', slot: 'head', tier: 'gift', price: 400 },
  { id: 'nametag', name: 'golden name tag', emoji: '🏷️', slot: 'neck', tier: 'gift', price: 350 },
  { id: 'goggles', name: 'snow goggles', emoji: '🥽', slot: 'eyes', tier: 'gift', price: 300 },
];

export const TOYS = [
  // Micro toys (10–15¢): first purchases sized for little-pup savings.
  { id: 'mouse', name: 'squeaky mouse', emoji: '🐭', tier: 'toy', price: 10 },
  { id: 'bell', name: 'jingle bell', emoji: '🔔', tier: 'toy', price: 10 },
  { id: 'stick', name: 'perfect stick', emoji: '🪵', tier: 'toy', price: 10 },
  { id: 'feather', name: 'tickly feather', emoji: '🪶', tier: 'toy', price: 15 },
  { id: 'sock', name: 'lucky sock', emoji: '🧦', tier: 'toy', price: 15 },
  { id: 'pinecone', name: 'pinecone', emoji: '🌰', tier: 'toy', price: 15 },
  { id: 'ball', name: 'bouncy ball', emoji: '🎾', tier: 'toy', price: 25 },
  { id: 'bonetoy', name: 'squeaky bone', emoji: '🦴', tier: 'toy', price: 40 },
  { id: 'rope', name: 'tug rope', emoji: '🪢', tier: 'toy', price: 60 },
  { id: 'teddy', name: 'tiny teddy', emoji: '🧸', tier: 'toy', price: 100 },
  { id: 'frisbee', name: 'flying disc', emoji: '🥏', tier: 'toy', price: 75 },
  { id: 'bowl', name: 'deluxe bowl', emoji: '🥣', tier: 'toy', price: 90 },
  { id: 'ducky', name: 'rubber ducky', emoji: '🦆', tier: 'toy', price: 30 },
  { id: 'ring', name: 'chew ring', emoji: '🍩', tier: 'toy', price: 50 },
];

const TOY_ART = {
  mouse: `
    <ellipse cx="32" cy="36" rx="17" ry="12" fill="#b9c0cb"/>
    <circle cx="17" cy="30" r="8" fill="#b9c0cb"/>
    <circle cx="13" cy="23" r="4.5" fill="#e8b7c4"/>
    <circle cx="22" cy="22" r="4.5" fill="#e8b7c4"/>
    <circle cx="15" cy="30" r="1.6" fill="#35281e"/>
    <path d="M48 38 Q58 34 56 25" stroke="#9aa2af" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  bell: `
    <path d="M30 12 a13 13 0 0 1 13 13 v10 h-26 v-10 a13 13 0 0 1 13-13" fill="#f5c542" stroke="#d99b1e" stroke-width="2"/>
    <rect x="14" y="35" width="32" height="6" rx="3" fill="#d99b1e"/>
    <circle cx="30" cy="46" r="5" fill="#b97c14"/>
    <circle cx="30" cy="10" r="3.5" fill="#d99b1e"/>`,
  stick: `
    <path d="M12 46 L44 16" stroke="#a5713d" stroke-width="8" stroke-linecap="round"/>
    <path d="M30 30 L40 34" stroke="#a5713d" stroke-width="6" stroke-linecap="round"/>
    <path d="M20 39 L15 33" stroke="#8a5a2c" stroke-width="5" stroke-linecap="round"/>`,
  feather: `
    <path d="M18 48 Q16 20 42 10 Q46 34 24 46 Z" fill="#7fb6e8"/>
    <path d="M18 48 Q28 34 42 12" stroke="#4f8fd9" stroke-width="2.4" fill="none"/>
    <path d="M14 52 L20 44" stroke="#8a6a4a" stroke-width="3" stroke-linecap="round"/>`,
  sock: `
    <path d="M22 8 h14 v22 q0 6 6 8 q8 3 6 11 q-2 8 -12 6 q-8 -2 -12 -8 l-2 -4 Z" fill="#e06b6b"/>
    <rect x="20" y="6" width="18" height="8" rx="3" fill="#f4f1ec"/>
    <path d="M24 22 h10 M24 28 h10" stroke="#c14f4f" stroke-width="2.4"/>`,
  pinecone: `
    <ellipse cx="30" cy="32" rx="14" ry="19" fill="#8a5a2c"/>
    <g fill="#a5713d">
      <path d="M22 20 q8 -5 16 0 l-3 6 q-5 -3 -10 0 Z"/>
      <path d="M19 30 q11 -6 22 0 l-3 6 q-8 -4 -16 0 Z"/>
      <path d="M20 41 q10 -5 20 0 l-4 6 q-6 -3 -12 0 Z"/>
    </g>`,
  ball: `
    <circle cx="30" cy="30" r="22" fill="#c6e544"/>
    <path d="M12 20 Q30 30 12 40 M48 20 Q30 30 48 40" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  bonetoy: `
    <g fill="#f0a5b2">
      <circle cx="14" cy="22" r="8"/><circle cx="14" cy="38" r="8"/>
      <circle cx="46" cy="22" r="8"/><circle cx="46" cy="38" r="8"/>
      <rect x="12" y="22" width="36" height="16" rx="8"/>
    </g>
    <circle cx="30" cy="30" r="3.5" fill="#d97087"/>`,
  rope: `
    <rect x="16" y="24" width="28" height="12" rx="6" fill="#e5c07b"/>
    <path d="M20 24 L26 36 M28 24 L34 36 M36 24 L42 36" stroke="#c79b55" stroke-width="3"/>
    <circle cx="12" cy="30" r="8" fill="#d9534f"/>
    <circle cx="48" cy="30" r="8" fill="#4f8fd9"/>`,
  teddy: `
    <circle cx="19" cy="16" r="7" fill="#b98a5a"/><circle cx="41" cy="16" r="7" fill="#b98a5a"/>
    <circle cx="30" cy="24" r="13" fill="#c99b6a"/>
    <ellipse cx="30" cy="43" rx="14" ry="12" fill="#c99b6a"/>
    <ellipse cx="30" cy="45" rx="7" ry="8" fill="#e8cfa8"/>
    <circle cx="26" cy="22" r="1.8" fill="#35281e"/><circle cx="34" cy="22" r="1.8" fill="#35281e"/>
    <ellipse cx="30" cy="28" rx="3" ry="2.2" fill="#35281e"/>`,
  frisbee: `
    <ellipse cx="30" cy="30" rx="24" ry="14" fill="#f2743c"/>
    <ellipse cx="30" cy="27" rx="24" ry="12" fill="#f78f5e"/>
    <ellipse cx="30" cy="27" rx="12" ry="5.5" fill="#f2743c"/>`,
  bowl: `
    <path d="M8 24 L11 44 A19 7 0 0 0 49 44 L52 24 Z" fill="#c8423e"/>
    <path d="M8 24 L11 44 A19 7 0 0 0 30 50 L30 24 Z" fill="#d9534f"/>
    <ellipse cx="30" cy="24" rx="22" ry="8.5" fill="#e5675f"/>
    <ellipse cx="30" cy="24" rx="17" ry="6" fill="#8f2f2c"/>
    <g fill="#c99b6a">
      <circle cx="24" cy="23" r="2.6"/><circle cx="31" cy="25" r="2.6"/>
      <circle cx="38" cy="23" r="2.6"/><circle cx="27" cy="27" r="2.4"/>
      <circle cx="35" cy="27" r="2.4"/>
    </g>
    <path d="M14 30 Q15 40 19 45" stroke="#f08a83" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.8"/>`,
  ducky: `
    <ellipse cx="32" cy="38" rx="18" ry="12" fill="#f6d35e"/>
    <circle cx="20" cy="22" r="10" fill="#f6d35e"/>
    <path d="M10 22 L2 25 L10 28 Z" fill="#f2a33c"/>
    <circle cx="18" cy="20" r="1.8" fill="#35281e"/>
    <path d="M36 30 Q46 26 44 36" stroke="#e0b73f" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  ring: `
    <circle cx="30" cy="30" r="20" fill="#9d7bd8"/>
    <circle cx="30" cy="30" r="9" fill="#fff7ea"/>
    <path d="M30 10 A20 20 0 0 1 48 24" stroke="#b79ae6" stroke-width="5" fill="none" stroke-linecap="round"/>`,
};

export function toySVG(toy, size = 56) {
  const t = typeof toy === 'string' ? TOYS.find((x) => x.id === toy) : toy;
  return `<svg viewBox="0 0 60 60" width="${size}" height="${size}" role="img" aria-label="${t.name}" data-toy="${t.id}" xmlns="http://www.w3.org/2000/svg">${TOY_ART[t.id]}</svg>`;
}

// The boarded-up shop: pack-screen teaser while the Pet Store is under
// construction (Phase 4b). A hard-hat pup peeks over the fence.
export function storefrontSVG(size = 76) {
  return `<svg viewBox="0 0 120 104" width="${size}" height="${Math.round((size * 104) / 120)}" role="img" aria-label="Pet store, opening soon" data-store="soon" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="34" width="96" height="60" rx="6" fill="#e8d9c3"/>
    <g>
      ${[0, 1, 2, 3, 4, 5]
        .map(
          (i) =>
            `<path d="M${12 + i * 16} 22 h16 v10 a8 6 0 0 1 -16 0 Z" fill="${i % 2 ? '#f6efe4' : '#d9534f'}"/>`
        )
        .join('')}
    </g>
    <rect x="12" y="16" width="96" height="8" rx="4" fill="#b98a5a"/>
    <rect x="22" y="46" width="34" height="26" rx="3" fill="#9ad1e8"/>
    <path d="M22 68 L56 50 M22 58 L52 46" stroke="#b98a5a" stroke-width="5" stroke-linecap="round"/>
    <rect x="68" y="46" width="26" height="48" rx="3" fill="#b98a5a"/>
    <circle cx="88" cy="70" r="2.5" fill="#8a6238"/>
    <g transform="rotate(-4 39 86)">
      <rect x="20" y="78" width="38" height="16" rx="4" fill="#f6d35e" stroke="#d9a520" stroke-width="2"/>
      <text x="39" y="90" font-size="11" text-anchor="middle">🚧🐾</text>
    </g>
    <g>
      <circle cx="97" cy="30" r="9" fill="#c99b6a"/>
      <circle cx="93.5" cy="29" r="1.6" fill="#35281e"/>
      <circle cx="100.5" cy="29" r="1.6" fill="#35281e"/>
      <ellipse cx="97" cy="33.5" rx="2.4" ry="1.8" fill="#35281e"/>
      <ellipse cx="89" cy="26" rx="3" ry="5" fill="#b9855a" transform="rotate(-20 89 26)"/>
      <ellipse cx="105" cy="26" rx="3" ry="5" fill="#b9855a" transform="rotate(20 105 26)"/>
      <path d="M88 24 a9 7 0 0 1 18 0 Z" fill="#f6d35e"/>
      <rect x="86" y="22.5" width="22" height="3.5" rx="1.75" fill="#e0b73f"/>
    </g>
  </svg>`;
}
