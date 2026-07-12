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
    <path d="M8 26 A22 20 0 0 0 52 26 L52 32 A22 16 0 0 1 8 32 Z" fill="#3b82f6"/>
    <path d="M8 26 L52 26 L50 38 Q30 50 10 38 Z" fill="#2563eb"/>
    <g fill="#fff" opacity="0.85">
      <circle cx="30" cy="33" r="3.4"/>
      <circle cx="24" cy="28" r="1.7"/><circle cx="28" cy="26" r="1.7"/>
      <circle cx="32" cy="26" r="1.7"/><circle cx="36" cy="28" r="1.7"/>
    </g>`,
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
