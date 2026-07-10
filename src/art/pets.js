// The wider pet pool: original flat-style SVG animals sharing the dogs'
// house style (head portraits, same eyes, collars, and earnable play
// accessories). Assets for future modes — not yet wired into the app.
// All original art, CC0 like the dogs (see ATTRIBUTION.md).

import { collarTag, accessoryOverlays } from './dogs.js';

const INK = '#35281e';

export const PETS = [
  // Cats
  { id: 'cat-1', species: 'cat', name: 'Whiskers', base: '#9aa0ab', inner: '#e8b7c4', muzzle: '#e6e9ee', stripes: '#6d7480', collar: '#f59e0b' },
  { id: 'cat-2', species: 'cat', name: 'Mango', base: '#e8973f', inner: '#f7c9a3', muzzle: '#fbe4c8', stripes: '#c76f22', collar: '#14b8a6' },
  { id: 'cat-3', species: 'cat', name: 'Pearl', base: '#f2efe9', inner: '#f4c8d3', muzzle: '#f2efe9', patch: '#8a8f99', collar: '#8b5cf6' },
  // Rabbits
  { id: 'rabbit-1', species: 'rabbit', name: 'Hopper', base: '#b98f68', inner: '#e9c8ad', muzzle: '#eeddc9', collar: '#3b82f6' },
  { id: 'rabbit-2', species: 'rabbit', name: 'Snowball', base: '#f3f0ea', inner: '#f5c6d0', muzzle: '#f3f0ea', collar: '#ec4899' },
  // Guinea pigs
  { id: 'guinea-1', species: 'guinea', name: 'Peanut', base: '#d9a05b', ear: '#b57e3f', muzzle: '#f3ddba', crest: '#b57e3f', collar: '#22c55e' },
  { id: 'guinea-2', species: 'guinea', name: 'Butterscotch', base: '#efe1cd', ear: '#cbb08c', muzzle: '#f8efdd', patch: '#c98d3f', collar: '#ef4444' },
  // Birds
  { id: 'bird-1', species: 'bird', name: 'Kiwi', base: '#8fc75c', cheek: '#f6d35e', beak: '#f2a33c', tuft: '#6fae3f', collar: '#0ea5e9' },
  { id: 'bird-2', species: 'bird', name: 'Pip', base: '#7fb6e8', cheek: '#f4b8c2', beak: '#f2a33c', tuft: '#5e97c9', collar: '#facc15' },
  // Sloths
  { id: 'sloth-1', species: 'sloth', name: 'Snoozy', base: '#b3a189', face: '#e6d9c4', stripe: '#7a6a52', collar: '#f97316' },
  { id: 'sloth-2', species: 'sloth', name: 'Moss', base: '#9aa383', face: '#dfe3cd', stripe: '#667050', collar: '#ec4899' },
  // Hedgehogs
  { id: 'hedgehog-1', species: 'hedgehog', name: 'Pokey', base: '#f0dfc8', spikes: '#7a5a3a', muzzle: '#f7ecd9', collar: '#14b8a6' },
  { id: 'hedgehog-2', species: 'hedgehog', name: 'Bramble', base: '#e5cdb4', spikes: '#4f3b28', muzzle: '#f1e2cf', collar: '#a3e635' },
  // Turtles
  { id: 'turtle-1', species: 'turtle', name: 'Sheldon', base: '#8fbf6e', shell: '#6b8f4e', shellRim: '#557a3c', collar: '#f59e0b' },
  { id: 'turtle-2', species: 'turtle', name: 'Pebble', base: '#a4c98a', shell: '#8a6f4e', shellRim: '#6d573b', collar: '#2563eb' },
];

export function getPet(id) {
  return PETS.find((p) => p.id === id) ?? PETS[0];
}

const eyes = (y = 56, r = 4.6) => `
  <circle cx="45" cy="${y}" r="${r}" fill="${INK}"/>
  <circle cx="75" cy="${y}" r="${r}" fill="${INK}"/>
  <circle cx="${45 + 1.6}" cy="${y - 1.6}" r="1.5" fill="#fff"/>
  <circle cx="${75 + 1.6}" cy="${y - 1.6}" r="1.5" fill="#fff"/>`;

const collar = (color) =>
  `<path d="M31 91 a40 40 0 0 0 58 0 l-4 9 a40 40 0 0 1 -50 0 Z" fill="${color}"/>`;

const blush = (color = '#f5a8b0', y = 72) =>
  `<circle cx="34" cy="${y}" r="5.5" fill="${color}" opacity="0.55"/>
   <circle cx="86" cy="${y}" r="5.5" fill="${color}" opacity="0.55"/>`;

function cat(p, uid) {
  return `
  <path d="M22 54 L32 12 L58 34 Z" fill="${p.base}"/>
  <path d="M98 54 L88 12 L62 34 Z" fill="${p.base}"/>
  <path d="M30 44 L35 22 L50 35 Z" fill="${p.inner}"/>
  <path d="M90 44 L85 22 L70 35 Z" fill="${p.inner}"/>
  <circle cx="60" cy="62" r="40" fill="${p.base}"/>
  <g clip-path="url(#${uid})">
    ${p.stripes ? `<rect x="52" y="22" width="4.5" height="14" rx="2" fill="${p.stripes}"/><rect x="60" y="20" width="4.5" height="17" rx="2" fill="${p.stripes}"/><rect x="68" y="22" width="4.5" height="14" rx="2" fill="${p.stripes}"/>` : ''}
    ${p.patch ? `<circle cx="79" cy="52" r="15" fill="${p.patch}"/>` : ''}
  </g>
  <ellipse cx="60" cy="79" rx="16" ry="11" fill="${p.muzzle}"/>
  <path d="M55 72 h10 l-5 7 Z" fill="#e8788a"/>
  <path d="M60 79 v3 M60 82 q-4 5 -9 2 M60 82 q4 5 9 2" stroke="${INK}" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <g stroke="${INK}" stroke-width="1.6" stroke-linecap="round" opacity="0.55">
    <path d="M40 74 L20 70"/><path d="M40 78 L20 79"/><path d="M40 82 L22 88"/>
    <path d="M80 74 L100 70"/><path d="M80 78 L100 79"/><path d="M80 82 L98 88"/>
  </g>
  ${eyes()}
  ${collar(p.collar)}`;
}

function rabbit(p, uid) {
  return `
  <ellipse cx="44" cy="20" rx="11" ry="26" fill="${p.base}" transform="rotate(-6 44 20)"/>
  <ellipse cx="76" cy="20" rx="11" ry="26" fill="${p.base}" transform="rotate(6 76 20)"/>
  <ellipse cx="44" cy="22" rx="5" ry="18" fill="${p.inner}" transform="rotate(-6 44 22)"/>
  <ellipse cx="76" cy="22" rx="5" ry="18" fill="${p.inner}" transform="rotate(6 76 22)"/>
  <circle cx="60" cy="62" r="40" fill="${p.base}"/>
  ${blush()}
  <path d="M55 70 h10 l-5 6 Z" fill="#e8788a"/>
  <path d="M60 76 v4 M60 80 q-4 5 -8 2 M60 80 q4 5 8 2" stroke="${INK}" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <rect x="54" y="84" width="12" height="9" rx="2.5" fill="#fff" stroke="${INK}" stroke-width="1.4"/>
  <path d="M60 84 v9" stroke="${INK}" stroke-width="1.4"/>
  ${eyes()}
  ${collar(p.collar)}`;
}

function guinea(p, uid) {
  return `
  <circle cx="24" cy="36" r="9" fill="${p.ear}"/>
  <circle cx="96" cy="36" r="9" fill="${p.ear}"/>
  <ellipse cx="60" cy="64" rx="46" ry="40" fill="${p.base}"/>
  <g clip-path="url(#${uid}-body)">
    ${p.patch ? `<path d="M60 24 Q90 24 96 64 Q80 60 60 64 Z" fill="${p.patch}"/>` : ''}
  </g>
  ${p.crest ? `<path d="M48 26 Q54 14 60 25 Q66 13 72 26 Q66 22 60 27 Q54 22 48 26 Z" fill="${p.crest}"/>` : ''}
  ${blush('#f5a8b0', 74)}
  <ellipse cx="60" cy="82" rx="17" ry="12" fill="${p.muzzle}"/>
  <ellipse cx="60" cy="76" rx="5.5" ry="4" fill="#d98a96"/>
  <path d="M60 80 v3 M60 83 q-4 5 -8 2 M60 83 q4 5 8 2" stroke="${INK}" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  ${eyes(58)}
  ${collar(p.collar)}`;
}

function bird(p, uid) {
  return `
  <path d="M52 22 Q50 6 60 12 Q60 4 68 10 Q70 2 76 14 Q70 16 66 22 Z" fill="${p.tuft}"/>
  <circle cx="60" cy="62" r="40" fill="${p.base}"/>
  <circle cx="36" cy="70" r="7.5" fill="${p.cheek}" opacity="0.85"/>
  <circle cx="84" cy="70" r="7.5" fill="${p.cheek}" opacity="0.85"/>
  <path d="M47 64 Q60 55 73 64 L60 86 Z" fill="${p.beak}"/>
  <path d="M47 64 Q60 72 73 64" stroke="#c97f2a" stroke-width="1.6" fill="none"/>
  ${eyes(52, 5)}
  ${collar(p.collar)}`;
}

function sloth(p, uid) {
  return `
  <circle cx="60" cy="62" r="40" fill="${p.base}"/>
  <ellipse cx="60" cy="68" rx="29" ry="25" fill="${p.face}"/>
  <path d="M34 30 Q42 22 50 28 Q56 20 64 26 Q72 20 80 28 Q86 24 90 32 Q74 24 60 30 Q46 24 34 30 Z" fill="${p.stripe}" opacity="0.45"/>
  <ellipse cx="44" cy="58" rx="11" ry="6.5" fill="${p.stripe}" transform="rotate(14 44 58)"/>
  <ellipse cx="76" cy="58" rx="11" ry="6.5" fill="${p.stripe}" transform="rotate(-14 76 58)"/>
  ${eyes(57, 4.4)}
  <ellipse cx="60" cy="72" rx="7" ry="5" fill="${INK}"/>
  <path d="M45 81 Q60 93 75 81" stroke="${INK}" stroke-width="3" stroke-linecap="round" fill="none"/>
  ${collar(p.collar)}`;
}

function hedgehog(p, uid) {
  return `
  <path d="M14 70 L20 34 L30 46 L36 18 L46 38 L54 8 L62 36 L72 12 L78 38 L90 22 L94 46 L102 36 L106 70 Z" fill="${p.spikes}"/>
  <circle cx="60" cy="66" r="36" fill="${p.base}"/>
  ${blush('#f5a8b0', 74)}
  <ellipse cx="60" cy="80" rx="15" ry="11" fill="${p.muzzle}"/>
  <circle cx="60" cy="75" r="5" fill="${INK}"/>
  <path d="M60 80 q-4 5 -8 2 M60 80 q4 5 8 2" stroke="${INK}" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  ${eyes(58, 4.2)}
  ${collar(p.collar)}`;
}

function turtle(p, uid) {
  return `
  <path d="M18 64 A42 40 0 0 1 102 64 L102 70 L18 70 Z" fill="${p.shell}"/>
  <path d="M18 64 A42 40 0 0 1 102 64 L102 70 L18 70 Z" fill="none" stroke="${p.shellRim}" stroke-width="4"/>
  <circle cx="60" cy="34" r="7" fill="${p.shellRim}" opacity="0.5"/>
  <circle cx="38" cy="42" r="6" fill="${p.shellRim}" opacity="0.5"/>
  <circle cx="82" cy="42" r="6" fill="${p.shellRim}" opacity="0.5"/>
  <circle cx="60" cy="72" r="32" fill="${p.base}"/>
  ${blush('#e9908a', 78)}
  ${eyes(64, 4.2)}
  <circle cx="55" cy="76" r="1.8" fill="${INK}"/>
  <circle cx="65" cy="76" r="1.8" fill="${INK}"/>
  <path d="M48 84 Q60 93 72 84" stroke="${INK}" stroke-width="2.6" stroke-linecap="round" fill="none"/>
  ${collar(p.collar)}`;
}

const SPECIES = { cat, rabbit, guinea, bird, sloth, hedgehog, turtle };

export function petSVG(pet, size = 96, accessories = []) {
  const uid = `pt-${pet.id}`;
  const draw = SPECIES[pet.species];
  return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="${pet.name} the ${pet.species === 'guinea' ? 'guinea pig' : pet.species}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="${uid}"><circle cx="60" cy="62" r="40"/></clipPath>
    <clipPath id="${uid}-body"><ellipse cx="60" cy="64" rx="46" ry="40"/></clipPath>
  </defs>
  ${draw(pet, uid)}
  ${collarTag(accessories)}
  ${accessoryOverlays(accessories)}
</svg>`;
}
