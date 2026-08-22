// SPECIALIST (buck obverse) — dump emitted SVG for a face/tier so the
// portrait group can be read directly rather than described.
//   node coloringbook/judge/_sw2dump.mjs buck obverse 190
const M = await import('../../src/art/coins.js');
const [id = 'buck', side = 'obverse', size = '190'] = process.argv.slice(2);
const svg = M.coinSVG(id, Number(size), { side });
console.log(svg.replace(/></g, '>\n<'));
