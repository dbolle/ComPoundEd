// Store gear: the future pet-store inventory. Wearable accessories render
// through dogs.js overlays (any dog can wear them once purchased — Phase 4);
// toys are standalone art for shelves and dog pages. No prices here — the
// store sets those. All original CC0 art, house style.

export const GEAR_ACCESSORIES = [
  { id: 'crown', name: 'royal crown', emoji: '👑', slot: 'head' },
  { id: 'tiara', name: 'sparkle tiara', emoji: '👸', slot: 'head' },
  { id: 'party', name: 'party hat', emoji: '🥳', slot: 'head' },
  { id: 'flower', name: 'ear flower', emoji: '🌼', slot: 'ear' },
  { id: 'glasses', name: 'smart glasses', emoji: '🤓', slot: 'eyes' },
  { id: 'sunglasses', name: 'cool shades', emoji: '😎', slot: 'eyes' },
  { id: 'scarf', name: 'cozy scarf', emoji: '🧣', slot: 'neck' },
  { id: 'bowtie', name: 'fancy bowtie', emoji: '🎀', slot: 'neck' },
];

export const TOYS = [
  { id: 'ball', name: 'bouncy ball', emoji: '🎾' },
  { id: 'bonetoy', name: 'squeaky bone', emoji: '🦴' },
  { id: 'rope', name: 'tug rope', emoji: '🪢' },
  { id: 'teddy', name: 'tiny teddy', emoji: '🧸' },
  { id: 'frisbee', name: 'flying disc', emoji: '🥏' },
  { id: 'bowl', name: 'deluxe bowl', emoji: '🥣' },
  { id: 'ducky', name: 'rubber ducky', emoji: '🦆' },
  { id: 'ring', name: 'chew ring', emoji: '🍩' },
];

const TOY_ART = {
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
