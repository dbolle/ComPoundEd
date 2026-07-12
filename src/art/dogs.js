// The pack: 13 original flat-style SVG dogs generated from one template so
// the collection feels like a matched set. One starter dog plus one dog per
// times table (1–12). All original art, released with the project.

import { tableDueCount, divisionTableDueCount } from '../engine/leitner.js';

export const DOGS = [
  { id: 'starter', table: null, name: 'Biscuit', base: '#e8b05c', muzzle: '#f6d9a6', ear: 'floppy', earColor: '#c98d3f', tongue: true, collar: '#ef4444' },
  { id: 'dog-1', table: 1, name: 'Pepper', base: '#4a4a55', muzzle: '#f4f1ec', ear: 'floppy', earColor: '#33333d', blaze: '#f4f1ec', collar: '#14b8a6' },
  { id: 'dog-2', table: 2, name: 'Daisy', base: '#c98d3f', muzzle: '#f2e2c4', ear: 'long', earColor: '#7a4f22', collar: '#facc15' },
  { id: 'dog-3', table: 3, name: 'Waffles', base: '#e39a4c', muzzle: '#fdf3e3', ear: 'pointy', earColor: '#c97f35', tongue: true, collar: '#3b82f6' },
  { id: 'dog-4', table: 4, name: 'Luna', base: '#8c9bad', muzzle: '#f4f1ec', ear: 'pointy', earColor: '#6d7d91', blaze: '#f4f1ec', collar: '#a855f7' },
  { id: 'dog-5', table: 5, name: 'Rusty', base: '#8b4a2f', muzzle: '#c07a52', ear: 'long', earColor: '#63301c', collar: '#22c55e' },
  { id: 'dog-6', table: 6, name: 'Mochi', base: '#e8813f', muzzle: '#fdf3e3', ear: 'pointy', earColor: '#d06c2e', tongue: true, collar: '#ef4444' },
  { id: 'dog-7', table: 7, name: 'Scout', base: '#b98a4a', muzzle: '#5c4632', ear: 'pointy', earColor: '#4d3a28', collar: '#f97316' },
  { id: 'dog-8', table: 8, name: 'Pixel', base: '#f4f1ec', muzzle: '#f4f1ec', ear: 'floppy', earColor: '#2f2f36', spots: '#2f2f36', collar: '#ef4444' },
  { id: 'dog-9', table: 9, name: 'Clover', base: '#ede0d0', muzzle: '#f8f0e6', ear: 'round', earColor: '#dcc9b4', pom: '#f8f0e6', collar: '#ec4899' },
  { id: 'dog-10', table: 10, name: 'Bruno', base: '#4e342e', muzzle: '#8d6e63', ear: 'floppy', earColor: '#3a2723', tongue: true, collar: '#f59e0b' },
  { id: 'dog-11', table: 11, name: 'Ziggy', base: '#f4f1ec', muzzle: '#f4f1ec', ear: 'floppy', earColor: '#8a5a33', patch: '#8a5a33', collar: '#14b8a6' },
  { id: 'dog-12', table: 12, name: 'Captain', base: '#3e2f28', muzzle: '#f4f1ec', ear: 'floppy', earColor: '#2b201b', blaze: '#f4f1ec', collar: '#f59e0b' },
  // Division pack: one dog per ÷table, earned by mastering the division track.
  { id: 'div-1', table: null, divTable: 1, name: 'Cocoa', base: '#6f4e37', muzzle: '#c9a887', ear: 'round', earColor: '#59402c', tongue: true, collar: '#f472b6' },
  { id: 'div-2', table: null, divTable: 2, name: 'Willow', base: '#b9c0c9', muzzle: '#f4f1ec', ear: 'long', earColor: '#98a1ad', blaze: '#f4f1ec', collar: '#8b5cf6' },
  { id: 'div-3', table: null, divTable: 3, name: 'Banjo', base: '#d8a25a', muzzle: '#f6e3c2', ear: 'pointy', earColor: '#b9823f', patch: '#8a5a33', collar: '#0ea5e9' },
  { id: 'div-4', table: null, divTable: 4, name: 'Juno', base: '#33333d', muzzle: '#8d8d99', ear: 'round', earColor: '#22222b', blaze: '#8d8d99', collar: '#ec4899' },
  { id: 'div-5', table: null, divTable: 5, name: 'Olive', base: '#9a8f4f', muzzle: '#e9e0bb', ear: 'floppy', earColor: '#7c723c', tongue: true, collar: '#ef4444' },
  { id: 'div-6', table: null, divTable: 6, name: 'Tux', base: '#2b2b33', muzzle: '#f4f1ec', ear: 'floppy', earColor: '#1d1d24', blaze: '#f4f1ec', collar: '#dc2626' },
  { id: 'div-7', table: null, divTable: 7, name: 'Poppy', base: '#f0e4d0', muzzle: '#f0e4d0', ear: 'long', earColor: '#a4552f', patch: '#a4552f', tongue: true, collar: '#16a34a' },
  { id: 'div-8', table: null, divTable: 8, name: 'Ginger', base: '#c96a2f', muzzle: '#f6dcc0', ear: 'pointy', earColor: '#a5521f', collar: '#eab308' },
  { id: 'div-9', table: null, divTable: 9, name: 'Ace', base: '#f4f1ec', muzzle: '#f4f1ec', ear: 'pointy', earColor: '#3b3b44', patch: '#3b3b44', spots: '#3b3b44', collar: '#2563eb' },
  { id: 'div-10', table: null, divTable: 10, name: 'Sunny', base: '#edc35a', muzzle: '#faeecb', ear: 'floppy', earColor: '#d1a53c', tongue: true, collar: '#14b8a6' },
  { id: 'div-11', table: null, divTable: 11, name: 'Rocket', base: '#7d8ba1', muzzle: '#e6ebf2', ear: 'pointy', earColor: '#62708a', blaze: '#e6ebf2', collar: '#f97316' },
  { id: 'div-12', table: null, divTable: 12, name: 'Bear', base: '#4a3423', muzzle: '#b08b64', ear: 'round', earColor: '#38271a', collar: '#a3e635' },
];

// Guest dogs for pet sitting: neighbors' pups who visit but aren't part of
// the adoptable pack. Same generator, so they match the house style.
export const GUESTS = [
  { id: 'guest-1', table: null, name: 'Noodle', base: '#d9b98c', muzzle: '#f2e4c9', ear: 'long', earColor: '#b3906a', tongue: true, collar: '#6366f1' },
  { id: 'guest-2', table: null, name: 'Pickles', base: '#efe9dd', muzzle: '#efe9dd', ear: 'pointy', earColor: '#8a5a33', patch: '#8a5a33', collar: '#22c55e' },
  { id: 'guest-3', table: null, name: 'Maple', base: '#b3562e', muzzle: '#e8c9a8', ear: 'floppy', earColor: '#8a3d1e', blaze: '#e8c9a8', collar: '#eab308' },
  { id: 'guest-4', table: null, name: 'Domino', base: '#f4f1ec', muzzle: '#f4f1ec', ear: 'round', earColor: '#2f2f36', spots: '#2f2f36', tongue: true, collar: '#0ea5e9' },
];

export function getDog(id) {
  return DOGS.find((d) => d.id === id) ?? GUESTS.find((d) => d.id === id) ?? DOGS[0];
}

export function isGuest(id) {
  return GUESTS.some((d) => d.id === id);
}

// Accessories are earned through pet play and derived straight from the play
// counters. Each accessory has a COLOR LADDER — keep playing that activity
// and new colors unlock. What a dog actually wears is the kid's choice
// (profile.wear), changed in the wardrobe after a grooming bath.
export const ACCESSORIES = [
  {
    id: 'bandana', emoji: '🧣', name: 'bandana', kind: 'walk', need: 10,
    colors: [
      { id: 'red', need: 10, fill: '#f43f5e' },
      { id: 'blue', need: 25, fill: '#3b82f6' },
      { id: 'green', need: 50, fill: '#22c55e' },
      { id: 'gold', need: 100, fill: '#f59e0b' },
    ],
  },
  {
    id: 'bow', emoji: '🎀', name: 'bow', kind: 'feed', need: 10,
    colors: [
      { id: 'pink', need: 10, fill: '#ec4899', deep: '#be185d' },
      { id: 'purple', need: 25, fill: '#a855f7', deep: '#7e22ce' },
      { id: 'teal', need: 50, fill: '#14b8a6', deep: '#0f766e' },
      { id: 'gold', need: 100, fill: '#f59e0b', deep: '#b45309' },
    ],
  },
  {
    id: 'cap', emoji: '🧢', name: 'cap', kind: 'fetch', need: 10,
    colors: [
      { id: 'blue', need: 10, fill: '#3b82f6', deep: '#2563eb' },
      { id: 'red', need: 25, fill: '#ef4444', deep: '#b91c1c' },
      { id: 'green', need: 50, fill: '#22c55e', deep: '#15803d' },
      { id: 'gold', need: 100, fill: '#f59e0b', deep: '#b45309' },
    ],
  },
  { id: 'star', emoji: '⭐', name: 'star tag', kind: 'total', need: 40 },
];

function playCount(profile, dogId, kind) {
  const c = profile?.play?.[dogId];
  if (!c) return 0;
  if (kind === 'total') return (c.walk ?? 0) + (c.feed ?? 0) + (c.fetch ?? 0);
  return c[kind] ?? 0;
}

// Which colors of an accessory this dog has unlocked.
export function accessoryColorsFor(profile, dogId, accId) {
  const acc = ACCESSORIES.find((a) => a.id === accId);
  if (!acc?.colors) return [];
  const n = playCount(profile, dogId, acc.kind);
  return acc.colors.filter((c) => n >= c.need).map((c) => c.id);
}

// The render list: earned accessories in the kid's chosen colors.
// wear entry undefined → default (first color); 'none' → not worn.
export function wornFor(profile, dogId) {
  const earned = accessoriesFor(profile, dogId);
  const wear = profile?.wear?.[dogId] ?? {};
  const out = [];
  for (const id of earned) {
    const choice = wear[id];
    if (choice === 'none') continue;
    if (id === 'star') {
      out.push('star');
      continue;
    }
    const unlocked = accessoryColorsFor(profile, dogId, id);
    const color = choice && unlocked.includes(choice) ? choice : unlocked[0];
    out.push({ id, color });
  }
  return out;
}

// Dirt = the dog's own table gone rusty (due facts), capped at a gentle
// maximum. Biscuit (the starter) and guests never get dirty. Derived live —
// nothing stored, and a grooming bath cleans it by refreshing the facts.
export function dirtFor(profile, dog) {
  if (!profile || !dog || (dog.table == null && dog.divTable == null)) return 0;
  const due =
    dog.divTable != null
      ? divisionTableDueCount(profile, dog.divTable)
      : tableDueCount(profile, dog.table);
  if (due <= 0) return 0;
  if (due <= 3) return 1;
  if (due <= 8) return 2;
  return 3;
}

export function accessoriesFor(profile, dogId) {
  const c = profile?.play?.[dogId];
  if (!c) return [];
  const total = (c.walk ?? 0) + (c.feed ?? 0) + (c.fetch ?? 0);
  return ACCESSORIES.filter(
    (a) => (a.kind === 'total' ? total : (c[a.kind] ?? 0)) >= a.need
  ).map((a) => a.id);
}

export function dogForTable(table) {
  return DOGS.find((d) => d.table === table);
}

export function dogForDivTable(table) {
  return DOGS.find((d) => d.divTable === table);
}

const INK = '#35281e';

function ears(d) {
  const c = d.earColor;
  switch (d.ear) {
    case 'pointy':
      return `<path d="M28 46 L37 14 L55 34 Z" fill="${c}"/>
              <path d="M92 46 L83 14 L65 34 Z" fill="${c}"/>`;
    case 'long':
      return `<ellipse cx="23" cy="62" rx="12" ry="26" fill="${c}" transform="rotate(8 23 62)"/>
              <ellipse cx="97" cy="62" rx="12" ry="26" fill="${c}" transform="rotate(-8 97 62)"/>`;
    case 'round':
      return `<circle cx="28" cy="34" r="14" fill="${c}"/>
              <circle cx="92" cy="34" r="14" fill="${c}"/>`;
    case 'floppy':
    default:
      return `<ellipse cx="26" cy="52" rx="13" ry="23" fill="${c}" transform="rotate(16 26 52)"/>
              <ellipse cx="94" cy="52" rx="13" ry="23" fill="${c}" transform="rotate(-16 94 52)"/>`;
  }
}

// Gentle mud smudges by dirt level (0–3). Always paired with the same happy
// face — a dusty dog "played in the garden", it is never sad or neglected.
function dirtLayer(level, uid) {
  if (!level) return '';
  const smudge = (cx, cy, rx, ry, rot, o) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#8a6a4a" opacity="${o}" transform="rotate(${rot} ${cx} ${cy})"/>`;
  let marks = smudge(42, 46, 6, 3.5, -18, 0.32) + smudge(76, 68, 5, 3, 12, 0.3);
  if (level >= 2) marks += smudge(60, 40, 7, 3.5, 6, 0.28) + smudge(38, 74, 4.5, 2.6, -8, 0.3);
  if (level >= 3) marks += smudge(70, 88, 6, 3, 16, 0.3) + smudge(30, 58, 4, 2.4, -20, 0.28);
  return `<g data-dirt="${level}" clip-path="url(#${uid})">${marks}</g>`;
}

export function dogSVG(dog, size = 96, accessories = [], dirt = 0) {
  const d = dog;
  const uid = `dg-${d.id}`;
  const has = (id) => accessories.includes(id);
  const extras = [];
  if (d.pom) {
    extras.push(`<circle cx="60" cy="24" r="15" fill="${d.pom}"/>
                 <circle cx="47" cy="29" r="10" fill="${d.pom}"/>
                 <circle cx="73" cy="29" r="10" fill="${d.pom}"/>`);
  }
  const clipped = [];
  if (d.blaze) {
    clipped.push(`<path d="M52 24 Q60 18 68 24 L64 62 Q60 66 56 62 Z" fill="${d.blaze}"/>`);
  }
  if (d.patch) {
    clipped.push(`<circle cx="77" cy="54" r="15" fill="${d.patch}"/>`);
  }
  if (d.spots) {
    clipped.push(`<circle cx="34" cy="44" r="5" fill="${d.spots}"/>
                  <circle cx="82" cy="36" r="4" fill="${d.spots}"/>
                  <circle cx="44" cy="90" r="4.5" fill="${d.spots}"/>
                  <circle cx="86" cy="82" r="5" fill="${d.spots}"/>`);
  }
  const tongue = d.tongue
    ? `<path d="M54 88 q6 12 12 0 v-6 h-12 Z" fill="#f87171"/>`
    : '';

  return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="${d.name} the dog" xmlns="http://www.w3.org/2000/svg">
  <defs><clipPath id="${uid}"><circle cx="60" cy="62" r="40"/></clipPath></defs>
  ${extras.join('\n')}
  ${ears(d)}
  <circle cx="60" cy="62" r="40" fill="${d.base}"/>
  <g clip-path="url(#${uid})">${clipped.join('\n')}</g>
  <ellipse cx="60" cy="79" rx="19" ry="14" fill="${d.muzzle}"/>
  ${tongue}
  <ellipse cx="60" cy="73" rx="6.5" ry="5" fill="${INK}"/>
  <path d="M60 78 v4 M60 82 q-5 6 -10 2 M60 82 q5 6 10 2" stroke="${INK}" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  <circle cx="45" cy="56" r="4.6" fill="${INK}"/>
  <circle cx="75" cy="56" r="4.6" fill="${INK}"/>
  <circle cx="46.6" cy="54.4" r="1.5" fill="#fff"/>
  <circle cx="76.6" cy="54.4" r="1.5" fill="#fff"/>
  ${dirtLayer(dirt, uid)}
  <path d="M31 91 a40 40 0 0 0 58 0 l-4 9 a40 40 0 0 1 -50 0 Z" fill="${d.collar}"/>
  ${collarTag(accessories)}
  ${accessoryOverlays(accessories)}
</svg>`;
}

// Shared by every species (pets.js reuses these so any animal can wear
// earned play accessories).
export function collarTag(accessories = []) {
  const hasStar = accessories.some((e) => e === 'star' || e?.id === 'star');
  return hasStar
    ? `<path data-acc="star" d="M60 95 L62.2 100.3 L67.8 100.6 L63.5 104.2 L64.9 109.7 L60 106.6 L55.1 109.7 L56.5 104.2 L52.2 100.6 L57.8 100.3 Z" fill="#fcd34d" stroke="#d97706" stroke-width="1.6"/>`
    : `<circle cx="60" cy="103" r="6" fill="#fcd34d" stroke="#d97706" stroke-width="2"/>`;
}

function accEntry(accessories, id) {
  for (const e of accessories) {
    if (e === id) return { id, color: null };
    if (e && typeof e === 'object' && e.id === id) return e;
  }
  return null;
}

function fillsFor(accId, colorId) {
  const acc = ACCESSORIES.find((a) => a.id === accId);
  const color = acc?.colors?.find((c) => c.id === colorId) ?? acc?.colors?.[0];
  return color ?? {};
}

export function accessoryOverlays(accessories = []) {
  const bandana = accEntry(accessories, 'bandana');
  const cap = accEntry(accessories, 'cap');
  const bow = accEntry(accessories, 'bow');
  const bf = bandana ? fillsFor('bandana', bandana.color) : null;
  const cf = cap ? fillsFor('cap', cap.color) : null;
  const wf = bow ? fillsFor('bow', bow.color) : null;
  return `${
    bandana
      ? `<g data-acc="bandana" data-color="${bf.id}"><path d="M36 92 L84 92 L60 112 Z" fill="${bf.fill}"/>
         <circle cx="52" cy="97" r="2" fill="#fff"/><circle cx="68" cy="97" r="2" fill="#fff"/><circle cx="60" cy="104" r="2" fill="#fff"/></g>`
      : ''
  }${
    cap
      ? `<g data-acc="cap" data-color="${cf.id}"><path d="M37 34 A23 17 0 0 1 83 34 L83 39 L37 39 Z" fill="${cf.fill}"/>
         <rect x="72" y="33" width="24" height="7" rx="3.5" fill="${cf.deep}"/>
         <circle cx="60" cy="19" r="4" fill="${cf.deep}"/></g>`
      : ''
  }${
    bow
      ? `<g data-acc="bow" data-color="${wf.id}" transform="rotate(-14 86 32)"><path d="M86 32 L72 24 L72 40 Z" fill="${wf.fill}"/>
         <path d="M86 32 L100 24 L100 40 Z" fill="${wf.fill}"/>
         <circle cx="86" cy="32" r="4.5" fill="${wf.deep}"/></g>`
      : ''
  }`;
}
