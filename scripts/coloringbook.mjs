#!/usr/bin/env node
// Turns the app's SVG animals into a printable colouring book.
//
//   node scripts/coloringbook.mjs --sample   # comparison demo
//   node scripts/coloringbook.mjs            # the whole book (grey marks)
//   node scripts/coloringbook.mjs --black    # ... marks in full black
//   node scripts/coloringbook.mjs --drop     # ... marks removed
//   node scripts/coloringbook.mjs --no-shell # ... grey, but turtle shells bare
//   --png  also write a PNG proof of every page
//   --mm=0.6  printed line weight   --grey=#a9a9a9  colour of a mark's edge
//
// The art is already pure functions returning SVG strings, so the only real
// work is the line-art transform. It runs in the browser (real DOM, real
// selectors) rather than over the strings, because `clip-path` groups and
// <defs> must be left alone and regex can't see that structure.
//
// Fills go WHITE rather than being dropped: drawing order is what hides a
// muzzle's overlap with the head, and a shape with no fill lets every
// construction line behind it show through. White fill also closes each
// region, which is what makes a shape colourable.
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PETS, petSVG } from '../src/art/pets.js';
import { DOGS, dogSVG, gearSVG, GEAR_SLOT } from '../src/art/dogs.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, '../coloringbook');

// Dogs must be drawn clean: dirt is a play state, not a feature of the dog.
const DOG_CLEAN = 0;

// The four species carrying marks that exist ONLY as colour — blush cheeks,
// the turtle's shell spots, the sloth's brow tuft, a bird's cheek patch.
// They are what the two variants disagree about, so the demo shows these.
const MARKED = ['rabbit', 'turtle', 'sloth', 'bird'];

// The turtles' shell plates are the only marks drawn in that turtle's own
// shellRim colour (blush is a different hue at a different opacity), so they
// can be tagged exactly, per pet, without touching the app's art. Book 3
// drops them: an outlined plate reads as a line the artist never drew, but
// unlike a cheek it also cuts the shell into pieces a child may not want.
const petArt = (pet, size, acc = []) => {
  const svg = petSVG(pet, size, acc);
  if (pet.species !== 'turtle' || !pet.shellRim) return svg;
  return svg.replaceAll(
    `fill="${pet.shellRim}" opacity="0.5"`,
    `fill="${pet.shellRim}" opacity="0.5" data-shellmark="1"`
  );
};

const firstOfEach = (species) =>
  species.map((s) => PETS.find((p) => p.species === s)).filter(Boolean);

// ---------------------------------------------------------------- line art

// Runs in the page. `mode` is 'drop' | 'outline' | 'grey' | 'greyNoShell' and
// decides the fate
// of every mark that has no stroke and no shape of its own — only a tint.
const LINE_ART = `
window.lineArt = function lineArt(root, mode, targetMm, GREY) {
  const INK = '#35281e';           // the art's feature colour: eyes, mouth
  const TONGUE = '#f87171';        // the only path with this fill, on 8 dogs
  const SHAPES = 'path,circle,ellipse,rect,polygon,line,polyline';
  const NS = 'http://www.w3.org/2000/svg';

  // The art is authored in a 120x120 window, but a rabbit's ear ellipse
  // (cy 20, ry 26) reaches y = -7, so all four rabbits print with their ears
  // sliced flat across the top. On screen a filled ear against a white page
  // hides it; an outline does not. Measured extents across every animal and
  // accessory are x 7.2..112.8, y -7.0..113.3, so this window clears them
  // with room for the stroke. Applied to EVERY animal, not just rabbits, so
  // one page never renders at a different scale than the next.
  if ((root.getAttribute('viewBox') || '').trim() === '0 0 120 120') {
    root.setAttribute('viewBox', '-4 -11 128 128');
  }

  // Stroke width is in SVG user units, so a fixed number draws a HEAVIER line
  // on a big animal than a small one — a hero page and a comparison cell would
  // not match, and within one drawing a thick shape reads as a black band.
  // A colouring book wants one weight everywhere, measured on the paper. So
  // convert: how many user units is the target millimetre, at this size?
  const vb = (root.getAttribute('viewBox') || '0 0 120 120').split(/[\\s,]+/);
  const unitsWide = parseFloat(vb[2]) || 120;
  const renderedMm = (root.getBoundingClientRect().width / 96) * 25.4;
  const MIN_W = renderedMm ? (targetMm * unitsWide) / renderedMm : 1.6;

  // Lettering drawn INSIDE the art — only the name tag's monogram today.
  // It is not a shape, so the shape loop never sees it and it would print in
  // engraved gold. A hollow letter matches the names under each animal.
  for (const t of root.querySelectorAll('text')) {
    t.setAttribute('fill', '#fff');
    t.setAttribute('stroke', '#000');
    t.setAttribute('stroke-width', String(MIN_W * 0.6));
    t.setAttribute('paint-order', 'stroke');   // keep the counters open
  }

  // Partial opacity on a GROUP is softening applied to real drawing, not a
  // mark — the cats' whiskers are a stroked <g opacity="0.5">. Left alone
  // they print grey; classified as a mark, the cat loses its whiskers.
  for (const g of root.querySelectorAll('g[opacity]')) {
    if (!g.closest('defs, clipPath, mask')) g.setAttribute('opacity', '1');
  }

  // Built once per drawing, and only if that drawing has a tongue.
  let clipId = null;
  const tongueClip = () => {
    if (clipId) return clipId;
    clipId = 'tongue-' + Math.random().toString(36).slice(2, 9);
    let defs = root.querySelector('defs');
    if (!defs) root.insertBefore((defs = document.createElementNS(NS, 'defs')), root.firstChild);
    const cp = document.createElementNS(NS, 'clipPath');
    cp.setAttribute('id', clipId);
    const path = document.createElementNS(NS, 'path');
    // the mouth's two curves, traced left-to-right, then closed downward
    path.setAttribute('d', 'M50 84 Q55 88 60 82 Q65 88 70 84 L70 130 L50 130 Z');
    cp.appendChild(path);
    defs.appendChild(cp);
    return clipId;
  };

  const dropped = [];
  for (const el of root.querySelectorAll(SHAPES)) {
    // clipPath/defs geometry is machinery, not drawing — never touch it
    if (el.closest('defs, clipPath, mask')) continue;
    const fill = (el.getAttribute('fill') || '').trim().toLowerCase();
    const op = parseFloat(el.getAttribute('opacity') ?? '1');
    const hasStroke = (el.getAttribute('stroke') || 'none') !== 'none';

    // A colour-only mark is FILL at partial opacity with no edge of its own.
    // A translucent *stroke* is already a line; it just needs to go solid.
    if (op < 1 && hasStroke) el.setAttribute('opacity', '1');
    else if (op < 1 && fill && fill !== 'none') {   // ← the disputed marks
      if (mode === 'drop') { dropped.push(el.tagName); el.remove(); continue; }
      // 'greyNoShell': cheeks and tufts still get their soft grey hint, but
      // the turtles' shell plates come out. Tracing them carves the shell
      // into segments; leaving it open lets a child colour the whole shell
      // one colour, or invent their own pattern.
      if (mode === 'greyNoShell' && el.hasAttribute('data-shellmark')) {
        dropped.push(el.tagName);
        el.remove();
        continue;
      }
      el.setAttribute('opacity', '1');
      el.setAttribute('fill', '#fff');
      // Grey makes the mark a SUGGESTION rather than a boundary: the child
      // can colour a cheek separately or straight through it. Black states
      // an edge the original art never drew.
      const grey = mode === 'grey' || mode === 'greyNoShell';
      el.setAttribute('stroke', grey ? GREY : '#000');
      el.setAttribute('stroke-width', String(MIN_W * (grey ? 0.8 : 1)));
      continue;
    }
    if (fill === INK) { el.setAttribute('fill', '#000'); continue; }  // eyes
    if (fill === '#fff' || fill === '#ffffff') {
      // Already white, so the fill needs nothing — but an eye's catchlight and
      // a rabbit's TEETH both land here, and the teeth carry their own brown
      // stroke. Skipping the whole element left them brown and off-weight
      // while every other line was black; normalise the edge, keep the fill.
      if (hasStroke) {
        el.setAttribute('stroke', '#000');
        el.setAttribute('stroke-width', String(MIN_W));
      }
      continue;
    }

    // The tongue is a rounded flap with a STRAIGHT top edge at y=82, drawn
    // before the mouth. In colour that top is red-on-red and invisible; as an
    // outline it becomes a box sitting above the mouth line. The mouth is
    // stroked, and a stroke does not occlude, so nothing hides it — clip the
    // tongue to the area below the mouth curve instead. The clip's upper
    // boundary IS the mouth path reversed, so the two meet exactly: at x=60
    // both sit at y=82, and at the tongue's edges the mouth is at y≈85.6.
    if (fill === TONGUE) {
      el.setAttribute('fill', '#fff');
      el.setAttribute('stroke', '#000');
      el.setAttribute('stroke-width', String(MIN_W));
      el.setAttribute('clip-path', 'url(#' + tongueClip() + ')');
      continue;
    }

    const stroke = el.getAttribute('stroke');
    if (stroke && stroke !== 'none') {
      // one weight for every line, drawn and derived alike — the app's art
      // varies stroke to suggest depth, which colouring lines should not
      el.setAttribute('stroke', '#000');
      el.setAttribute('stroke-width', String(MIN_W));
    }
    if (fill !== 'none') {         // includes fill absent (SVG defaults to black)
      el.setAttribute('fill', '#fff');
      if (!stroke || stroke === 'none') {
        el.setAttribute('stroke', '#000');
        el.setAttribute('stroke-width', String(MIN_W));
      }
    }
  }
  return dropped.length;
};`;

// ------------------------------------------------------------------- pages

const css = `
  @page { size: letter; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; -webkit-font-smoothing: antialiased; font-family: "Trebuchet MS", "Segoe UI", system-ui, sans-serif; color: #111; }
  .page {
    width: 8.5in; height: 11in; padding: 0.5in 0.55in;
    page-break-after: always; break-after: page;
    display: flex; flex-direction: column;
  }
  .page:last-child { page-break-after: auto; break-after: auto; }
  .sheet-title { font-size: 15pt; font-weight: 700; letter-spacing: .01em; }
  .sheet-note { font-size: 9.5pt; color: #444; margin-top: 3px; line-height: 1.45; }
  .rule { border-top: 1.5px solid #111; margin: 9px 0 4px; }

  /* the outline name a child can colour in too */
  .name {
    text-align: center; font-size: 30pt; font-weight: 800; letter-spacing: .04em;
    color: #fff; -webkit-text-stroke: 1.6px #000; margin-top: 2px;
  }
  .name.sm { font-size: 15pt; -webkit-text-stroke: 1.1px #000; }

  .hero { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .hero svg { width: 6.7in; height: 6.7in; }

  /* the side-by-side comparison */
  .grid { flex: 1; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2px 10px; align-content: start; }
  .colhead { text-align: center; font-size: 10pt; font-weight: 700; padding: 6px 0 2px; }
  .colhead small { display: block; font-weight: 400; color: #555; font-size: 8pt; }
  .cell { display: flex; flex-direction: column; align-items: center; }
  .cell svg { width: 1.55in; height: 1.55in; }
  .rowlab { grid-column: 1 / -1; font-size: 8.5pt; font-weight: 700; color: #555;
            border-top: 1px dashed #bbb; padding-top: 5px; margin-top: 3px; }

  /* the shelf of things to wear */
  .shelf { flex: 1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px 12px; align-content: start; }
  .shelf svg { width: 1.5in; height: 1.5in; }
  .foot { font-size: 8pt; color: #777; text-align: center; padding-top: 6px; }

  /* cover */
  .cover { align-items: center; justify-content: center; text-align: center; }
  .cover-title { font-size: 54pt; font-weight: 800; letter-spacing: .02em;
                 color: #fff; -webkit-text-stroke: 2.4px #000; }
  .cover-sub { font-size: 13pt; color: #444; margin-top: 6px; letter-spacing: .03em; }
  .cover-row { display: flex; gap: 4px; align-items: center; justify-content: center;
               flex-wrap: wrap; margin: 34px 0 30px; }
  .cover-row svg { width: 1.3in; height: 1.3in; }
  .cover-owner { font-size: 11pt; color: #444; letter-spacing: .04em; }
  .cover-line { width: 4.6in; border-bottom: 1.5px solid #111; height: 34px;
                margin-bottom: 26px; }
`;

const svgCell = (svg, label, cls = '') =>
  `<div class="cell">${svg}${label ? `<div class="name sm ${cls}">${label}</div>` : ''}</div>`;

function comparisonPage() {
  const pets = firstOfEach(MARKED);
  const rows = pets
    .map((p) => {
      const art = petArt(p, 300, []);
      const marks = (art.match(/opacity="0?\.\d+"/g) ?? []).length;
      return `
        <div class="rowlab">${p.name} the ${p.species} — ${marks} colour-only mark${marks === 1 ? '' : 's'}</div>
        <div data-variant="drop">${svgCell(art, '')}</div>
        <div data-variant="outline">${svgCell(art, '')}</div>
        <div data-variant="grey">${svgCell(art, '')}</div>`;
    })
    .join('');
  return `
    <section class="page">
      <div class="sheet-title">Three ways to treat a colour-only mark</div>
      <div class="sheet-note">
        Some art carries no outline at all — a blush cheek, the turtle's shell
        spots, the sloth's brow tuft. They exist only as a translucent tint, so
        line art has to either drop them or give them an edge they never had.
        Same animal, same size, three ways. Everything else on the page is
        identical, and all lines print at the same weight.
      </div>
      <div class="rule"></div>
      <div class="grid">
        <div class="colhead">A — dropped<small>marks removed entirely</small></div>
        <div class="colhead">B — black edge<small>a line like every other</small></div>
        <div class="colhead">C — grey edge<small>a hint, not a boundary</small></div>
        ${rows}
      </div>
    </section>`;
}

function heroPage(pet, variant, title, note) {
  return `
    <section class="page">
      <div class="sheet-title">${title}</div>
      <div class="sheet-note">${note}</div>
      <div class="rule"></div>
      <div class="hero" data-variant="${variant}">
        ${petArt(pet, 560, [])}
        <div class="name">${pet.name}</div>
      </div>
      <div class="foot">Compounded · a page from the colouring book</div>
    </section>`;
}

function dressedPage(variant) {
  // A dog and two pets wearing things, plus the shelf of wearables on their own.
  // The cat is here on purpose: its whiskers are a STROKED group at partial
  // opacity, the one case that looks like a colour-only mark and is not.
  const dog = DOGS[6];
  const cat = PETS.find((p) => p.id === 'cat-1');
  const pet = PETS.find((p) => p.id === 'turtle-1');
  return `
    <section class="page" data-variant="${variant}">
      <div class="sheet-title">Dressed up, and the shelf they came from</div>
      <div class="sheet-note">
        Accessories are drawn once and fitted per animal, so they come through
        the same transform. Each item also prints on its own, which is how the
        book can offer a "pick what your friend wears" page. Whiskers stay
        solid black in all three versions — they are drawn lines, not tint.
      </div>
      <div class="rule"></div>
      <div class="grid" style="grid-template-columns:1fr 1fr 1fr;gap:0">
        ${svgCell(dogSVG(dog, 260, ['crown', 'sunglasses', 'bowtie'], DOG_CLEAN), dog.name)}
        ${svgCell(petArt(cat, 260, ['tophat', 'nametag']), cat.name)}
        ${svgCell(petArt(pet, 260, ['flowercrown', 'flowercollar']), pet.name)}
      </div>
      <div class="shelf">
        ${Object.keys(GEAR_SLOT)
          .map((id) => `<div class="cell">${gearSVG(id, 130, { initial: 'B' })}</div>`)
          .join('')}
      </div>
      <div class="foot">Compounded · a page from the colouring book</div>
    </section>`;
}

// ------------------------------------------------------------- the full book

// PETS is append-only so milestone→pet mapping never shifts, which leaves the
// species interleaved (cat-4 sits after turtle-2). A book should walk one
// habitat at a time, so sort for display only — never reorder the array.
const SPECIES_ORDER = ['cat', 'rabbit', 'guinea', 'bird', 'sloth', 'hedgehog', 'turtle'];
const numOf = (id) => Number(id.split('-')[1] ?? 0);
const bookOrder = (pets) =>
  [...pets].sort(
    (a, b) =>
      SPECIES_ORDER.indexOf(a.species) - SPECIES_ORDER.indexOf(b.species) ||
      numOf(a.id) - numOf(b.id)
  );

function coverPage(variant) {
  const cast = ['cat-1', 'rabbit-2', 'bird-1', 'turtle-1']
    .map((id) => PETS.find((p) => p.id === id))
    .filter(Boolean);
  return `
    <section class="page cover" data-variant="${variant}">
      <div class="cover-title">Compounded</div>
      <div class="cover-sub">a colouring book of the whole pack</div>
      <div class="cover-row">
        ${dogSVG(DOGS[0], 190, [], DOG_CLEAN)}
        ${cast.map((p) => petArt(p, 190, [])).join('')}
      </div>
      <div class="cover-owner">This book belongs to</div>
      <div class="cover-line"></div>
      <div class="foot">${DOGS.length} dogs · ${PETS.length} friends · colour them any way you like</div>
    </section>`;
}

function fullBook(variant) {
  const pages = [coverPage(variant)];
  for (const dog of DOGS) {
    pages.push(`<section class="page" data-variant="${variant}"><div class="hero">
      ${dogSVG(dog, 560, [], DOG_CLEAN)}<div class="name">${dog.name}</div></div></section>`);
  }
  for (const pet of bookOrder(PETS)) {
    pages.push(`<section class="page" data-variant="${variant}"><div class="hero">
      ${petArt(pet, 560, [])}<div class="name">${pet.name}</div></div></section>`);
  }
  pages.push(dressedPage(variant));
  return pages.join('');
}

// -------------------------------------------------------------------- build

// Printed line weight. Children's colouring books run roughly 0.4-0.8mm;
// heavier suits younger hands and survives a cheap inkjet.
const LINE_MM = Number(process.argv.find((a) => a.startsWith('--mm='))?.slice(5)) || 0.6;

// Grey for the colour-only marks in `grey` mode. Light enough to read as
// secondary, dark enough that a home inkjet still puts ink down — much above
// #c0c0c0 and cheap printers start dropping it out entirely.
const MARK_GREY = process.argv.find((a) => a.startsWith('--grey='))?.slice(7) || '#a9a9a9';

async function render(html, out) {
  const doc = `<!doctype html><meta charset="utf-8"><style>${css}</style>
    <body>${html}</body><script>${LINE_ART}</script>`;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(doc, { waitUntil: 'load' });
  const dropped = await page.evaluate(([mm, grey]) => {
    let n = 0;
    for (const host of document.querySelectorAll('[data-variant]')) {
      const mode = host.getAttribute('data-variant');
      for (const svg of host.querySelectorAll('svg')) n += window.lineArt(svg, mode, mm, grey);
    }
    return n;
  }, [LINE_MM, MARK_GREY]);
  await mkdir(dirname(out), { recursive: true });
  await page.pdf({ path: out, preferCSSPageSize: true, printBackground: false });
  if (process.argv.includes('--png')) {
    // Proof sheets: the PDF is the deliverable, but a page image is what
    // actually gets looked at before printing a book's worth of paper.
    const pages = await page.locator('.page').all();
    for (const [i, el] of pages.entries()) {
      await el.screenshot({ path: out.replace(/\.pdf$/, `-p${i + 1}.png`), scale: 'css' });
    }
  }
  await browser.close();
  return dropped;
}

const sample = process.argv.includes('--sample');
const turtle = PETS.find((p) => p.id === 'turtle-1');

const VARIANT = process.argv.includes('--drop')
  ? 'drop'
  : process.argv.includes('--black')
    ? 'outline'
    : process.argv.includes('--no-shell')
      ? 'greyNoShell'
      : 'grey';
// Each variant writes its own file, so generating one book never silently
// overwrites another that was printed from.
const SUFFIX = {
  drop: 'plain',
  outline: 'black-marks',
  grey: 'grey-marks',
  greyNoShell: 'grey-marks-plain-shells',
}[VARIANT];

const html = sample
  ? comparisonPage() +
    heroPage(
      turtle,
      'drop',
      'Version A — colour-only marks dropped',
      'A real book page at print size. The shell spots and cheek blush are gone; ' +
        'nothing on the page is an edge the original art did not already draw.'
    ) +
    heroPage(
      turtle,
      'outline',
      'Version B — colour-only marks in black',
      'The same page with those marks given a black edge. They become regions a ' +
        'child can colour, at the cost of lines the artist never drew — and a ' +
        'blush cheek reads as a blank disc rather than a cheek.'
    ) +
    heroPage(
      turtle,
      'grey',
      `Version C — colour-only marks in grey (${MARK_GREY})`,
      'The mark is present but subordinate: a child can colour the cheek or the ' +
        'shell plate separately, or run straight through it, and either looks ' +
        'deliberate. Nothing else on the page changes weight.'
    ) +
    dressedPage('grey')
  : fullBook(VARIANT);

const out = resolve(OUT, sample ? 'sample.pdf' : `compounded-coloring-book-${SUFFIX}.pdf`);
const dropped = await render(html, out);
console.log(`wrote ${out}${sample ? '' : ` (${DOGS.length + PETS.length + 2} pages)`}`);
if (dropped) console.log(`  ${dropped} colour-only marks removed in 'drop' sections`);
