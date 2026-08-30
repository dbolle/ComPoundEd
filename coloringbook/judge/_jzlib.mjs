// SHARED PARTS OF THE C2 ROUND (the `hairFill` sign).
//
// Everything here pulls a mass out of an ALREADY EMITTED SVG string rather than
// importing it, because `HEAD`, `HAIR`, `BEARD` and the head group's transform
// are all module-private in `src/art/coins.js`. Re-rendering the extracted path
// alone, at the same box and the same transform, gives a mask that is
// registered to the drawing EXACTLY rather than fitted to it — which is the
// difference between a boundary statistic that means something and one that is
// a registration error in disguise.
//
// Nothing here writes anything.

// Rec.709 luma on the gamma-encoded sRGB triple. NOT linear light: every tone
// ratio already written into coins.js ("cloth renders at 1.148 of motif") is
// this quantity, and a second convention here would silently disagree with it.
export const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

// The head group is the only element in the emitted string carrying BOTH a
// translate and a scale, so its transform is the first match for this.
const groupTransform = (svg) => {
  const tf = svg.match(/transform="(translate\([^"]*\) scale\([^"]*\))"/);
  if (!tf) throw new Error('_jzlib: could not find the head group transform');
  return tf;
};
const outerBox = (svg) => {
  const m = svg.match(/^<svg viewBox="0 0 100 100" width="([\d.]+)" height="([\d.]+)"/);
  if (!m) throw new Error('_jzlib: could not read the outer svg box');
  return m;
};
const wrap = (box, transform, strokeW, body, w, h) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${w ?? box[1]}" height="${h ?? box[2]}">` +
  `<rect width="100" height="100" fill="#ffffff"/>` +
  `<g transform="${transform}" fill="#000000" stroke="#000000" stroke-width="${strokeW}" stroke-linejoin="round">` +
  `${body}</g></svg>`;

/** The HEAD silhouette alone, stroke included — the stroke is part of what a child sees. */
export function headOnlySVG(svg, w, h) {
  const box = outerBox(svg), tf = groupTransform(svg);
  const sw = svg.slice(0, tf.index).match(/stroke-width="([\d.]+)"[^>]*$/);
  // The FIRST bare `<path d="…"/>` after the transform is `<path d="${HEAD}"/>`:
  // the two bevel copies before it both carry a transform and a fill.
  const head = svg.slice(tf.index).match(/<path d="([^"]+)"\/>/);
  if (!head) throw new Error('_jzlib: could not find the HEAD path');
  return wrap(box, tf[1], sw ? sw[1] : 1, `<path d="${head[1]}"/>`, w, h);
}

/**
 * Repaint the HAIR group's fill in an emitted SVG, leaving every byte else
 * alone. Lets a candidate tone be scored without editing the art, and reaches
 * tones `hairLit` cannot select — which is how "is this about the SIGN or about
 * the MAGNITUDE" gets asked at all. On the cent the beard group has the same
 * shape as the hair group and must NOT be repainted, so only the first match
 * is touched.
 */
export function recolourHair(svg, colour) {
  let done = false;
  const out = svg.replace(/<g fill="([^"]*)" stroke="([^"]*)" stroke-width="([\d.]+)" stroke-linejoin="round"><path d="/,
    (m, f, s, w) => { done = true; return `<g fill="${colour}" stroke="${s}" stroke-width="${w}" stroke-linejoin="round"><path d="`; });
  if (!done) throw new Error('_jzlib: no hair group to repaint');
  return out;
}

/** The palette tones this drawing actually used, read back off the emitted SVG. */
export function tonesOf(svg) {
  const head = svg.match(/<g fill="(#[0-9a-f]{6})" stroke="(#[0-9a-f]{6})" stroke-width="[\d.]+" stroke-linejoin="round"\s*\n\s*transform="translate/);
  const field = svg.match(/<circle cx="50" cy="50" r="[\d.]+" fill="(#[0-9a-f]{6})"\/>/);
  const hair = svg.match(/<g fill="(#[0-9a-f]{6})" stroke="#[0-9a-f]{6}" stroke-width="[\d.]+" stroke-linejoin="round"><path d="/);
  if (!head || !field || !hair) throw new Error('_jzlib: could not read the tones back off the SVG');
  return { motif: head[1], deep: head[2], field: field[1], hairFill: hair[1] };
}

/**
 * A mass group alone. `which` is 0 for the HAIR (plus its queue/ribbon, which
 * bust() emits inside the same group because that is what they are) and 1 for
 * Lincoln's BEARD, which bust() emits in the same shape immediately after.
 * The beard has its own tone (`p.deep`), is NOT controlled by `hairFill`, and
 * is therefore neither hair nor face: it has to be excluded from both or it
 * poisons the cent's face mean. Returns null when the group is absent.
 */
export function massOnlySVG(svg, which, w, h) {
  const box = outerBox(svg), tf = groupTransform(svg);
  // These are the only groups bust() emits with NO whitespace before their
  // first child (`…stroke-linejoin="round"><path d="`); every other group is
  // emitted across a newline or carries a stroke-linecap.
  const re = /<g fill="[^"]*" stroke="[^"]*" stroke-width="([\d.]+)" stroke-linejoin="round">(<path d="[\s\S]*?)<\/g>/g;
  const hits = [...svg.matchAll(re)];
  if (hits.length < 1 || hits.length > 2) throw new Error(`_jzlib: expected 1-2 mass groups, found ${hits.length}`);
  const hit = hits[which];
  return hit ? wrap(box, tf[1], hit[1], hit[2], w, h) : null;
}
