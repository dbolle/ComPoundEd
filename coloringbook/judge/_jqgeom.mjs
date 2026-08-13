// Judge geometry core: parse an emitted coin SVG into a list of drawn MARKS,
// each with its own polyline (in viewBox units, transforms applied), its fill /
// stroke classification and its bounding box.
//
// Written for the judge, deliberately independent of the _qt*/_rv* families:
// D6, D7 and D8 all read the same parse, so a bug in it shows up in three
// places at once rather than hiding in one.
//
// Supports the subset coins.js actually emits: path (M m L l H h V v C c S s
// Q q T t A a Z), rect, circle, ellipse, and transform="translate(...)
// scale(...) rotate(...)" on groups and on elements.

const NUM = /[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g;

export const mul = (A, B) => [
  A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1],
  A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3],
  A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5],
];
export const apply = (M, p) => ({ x: M[0] * p.x + M[2] * p.y + M[4], y: M[1] * p.x + M[3] * p.y + M[5] });
const I = [1, 0, 0, 1, 0, 0];

export function parseTransform(s) {
  let M = I;
  if (!s) return M;
  for (const m of s.matchAll(/(translate|scale|rotate|matrix)\s*\(([^)]*)\)/g)) {
    const a = (m[2].match(NUM) || []).map(Number);
    if (m[1] === 'translate') M = mul(M, [1, 0, 0, 1, a[0] || 0, a[1] || 0]);
    else if (m[1] === 'scale') M = mul(M, [a[0], 0, 0, a.length > 1 ? a[1] : a[0], 0, 0]);
    else if (m[1] === 'rotate') {
      const t = ((a[0] || 0) * Math.PI) / 180, c = Math.cos(t), s2 = Math.sin(t);
      let R = [c, s2, -s2, c, 0, 0];
      if (a.length >= 3) R = mul(mul([1, 0, 0, 1, a[1], a[2]], R), [1, 0, 0, 1, -a[1], -a[2]]);
      M = mul(M, R);
    } else if (m[1] === 'matrix') M = mul(M, a.slice(0, 6));
  }
  return M;
}

// ── path flattening ────────────────────────────────────────────────────────
const bez3 = (p0, p1, p2, p3, n, out) => {
  for (let i = 1; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push({
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
    });
  }
};
const bez2 = (p0, p1, p2, n, out) => {
  for (let i = 1; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push({ x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x, y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y });
  }
};

// Returns { pts, knots } — knots are the on-curve points as authored (what §4's
// turn-angle gate walks); pts is the dense polyline.
export function flattenPath(d, steps = 24) {
  const toks = d.match(/[MmLlHhVvCcSsQqTtAaZz]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g) || [];
  const pts = [], knots = [];
  let i = 0, cur = { x: 0, y: 0 }, start = { x: 0, y: 0 }, cmd = null, prevC = null, prevQ = null;
  const num = () => Number(toks[i++]);
  const push = (p, isKnot = true) => { pts.push(p); if (isKnot) knots.push({ ...p }); };
  while (i < toks.length) {
    if (/[A-Za-z]/.test(toks[i])) { cmd = toks[i++]; }
    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();
    const ox = rel ? cur.x : 0, oy = rel ? cur.y : 0;
    if (C === 'M') {
      cur = { x: num() + ox, y: num() + oy }; start = { ...cur }; push({ ...cur });
      cmd = rel ? 'l' : 'L';
    } else if (C === 'L') {
      cur = { x: num() + ox, y: num() + oy }; push({ ...cur }); prevC = prevQ = null;
    } else if (C === 'H') { cur = { x: num() + ox, y: cur.y }; push({ ...cur }); prevC = prevQ = null; }
    else if (C === 'V') { cur = { x: cur.x, y: num() + oy }; push({ ...cur }); prevC = prevQ = null; }
    else if (C === 'C' || C === 'S') {
      let c1;
      if (C === 'C') c1 = { x: num() + ox, y: num() + oy };
      else c1 = prevC ? { x: 2 * cur.x - prevC.x, y: 2 * cur.y - prevC.y } : { ...cur };
      const c2 = { x: num() + ox, y: num() + oy };
      const e = { x: num() + ox, y: num() + oy };
      bez3(cur, c1, c2, e, steps, pts); knots.push({ ...e });
      prevC = c2; prevQ = null; cur = e;
    } else if (C === 'Q' || C === 'T') {
      let c1;
      if (C === 'Q') c1 = { x: num() + ox, y: num() + oy };
      else c1 = prevQ ? { x: 2 * cur.x - prevQ.x, y: 2 * cur.y - prevQ.y } : { ...cur };
      const e = { x: num() + ox, y: num() + oy };
      bez2(cur, c1, e, steps, pts); knots.push({ ...e });
      prevQ = c1; prevC = null; cur = e;
    } else if (C === 'A') {
      const rx = Math.abs(num()), ry = Math.abs(num()), xrot = (num() * Math.PI) / 180;
      const laf = num(), sf = num();
      const e = { x: num() + ox, y: num() + oy };
      arcTo(cur, e, rx, ry, xrot, laf, sf, steps, pts);
      knots.push({ ...e }); cur = e; prevC = prevQ = null;
    } else if (C === 'Z') { pts.push({ ...start }); cur = { ...start }; prevC = prevQ = null; }
    else { i++; }
  }
  return { pts, knots };
}

function arcTo(p0, p1, rx, ry, phi, laf, sf, steps, out) {
  if (rx === 0 || ry === 0) { out.push({ ...p1 }); return; }
  const cosp = Math.cos(phi), sinp = Math.sin(phi);
  const dx2 = (p0.x - p1.x) / 2, dy2 = (p0.y - p1.y) / 2;
  const x1 = cosp * dx2 + sinp * dy2, y1 = -sinp * dx2 + cosp * dy2;
  let l = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry);
  if (l > 1) { rx *= Math.sqrt(l); ry *= Math.sqrt(l); }
  const sign = laf === sf ? -1 : 1;
  let num = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1;
  const den = rx * rx * y1 * y1 + ry * ry * x1 * x1;
  const co = sign * Math.sqrt(Math.max(0, num / den));
  const cx1 = (co * rx * y1) / ry, cy1 = (-co * ry * x1) / rx;
  const cx = cosp * cx1 - sinp * cy1 + (p0.x + p1.x) / 2;
  const cy = sinp * cx1 + cosp * cy1 + (p0.y + p1.y) / 2;
  const ang = (ux, uy, vx, vy) => {
    const s = Math.sign(ux * vy - uy * vx) || 1;
    return s * Math.acos(Math.min(1, Math.max(-1, (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy)))));
  };
  const th0 = ang(1, 0, (x1 - cx1) / rx, (y1 - cy1) / ry);
  let dth = ang((x1 - cx1) / rx, (y1 - cy1) / ry, (-x1 - cx1) / rx, (-y1 - cy1) / ry);
  if (!sf && dth > 0) dth -= 2 * Math.PI;
  if (sf && dth < 0) dth += 2 * Math.PI;
  const n = Math.max(2 * steps, Math.ceil((Math.abs(dth) / Math.PI) * 2 * steps));
  for (let k = 1; k <= n; k++) {
    const t = th0 + (dth * k) / n;
    const x = cosp * rx * Math.cos(t) - sinp * ry * Math.sin(t) + cx;
    const y = sinp * rx * Math.cos(t) + cosp * ry * Math.sin(t) + cy;
    out.push({ x, y });
  }
}

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? m[1] : null;
};

// ── the parse ──────────────────────────────────────────────────────────────
// Walks the SVG, keeping a transform stack and inherited fill/stroke, and
// returns one entry per drawn primitive.
export function marks(svg) {
  const out = [];
  const stack = [{ M: I, fill: null, stroke: null, sw: null, opacity: 1, tags: [] }];
  const tokens = svg.match(/<[^>]+>/g) || [];
  for (const t of tokens) {
    const name = (t.match(/^<\/?([a-zA-Z]+)/) || [])[1];
    if (!name) continue;
    if (t.startsWith('</')) { if (name === 'g' && stack.length > 1) stack.pop(); continue; }
    const top = stack[stack.length - 1];
    const M = mul(top.M, parseTransform(attr(t, 'transform')));
    const fill = attr(t, 'fill') ?? top.fill;
    const stroke = attr(t, 'stroke') ?? top.stroke;
    const sw = attr(t, 'stroke-width') != null ? Number(attr(t, 'stroke-width')) : top.sw;
    const opacity = (attr(t, 'opacity') != null ? Number(attr(t, 'opacity')) : 1) * top.opacity;
    const selfClose = /\/>$/.test(t);
    if (name === 'svg') continue;
    if (name === 'g') { if (!selfClose) stack.push({ M, fill, stroke, sw, opacity, tags: [] }); continue; }
    let pts = null, knots = [];
    if (name === 'path') {
      const d = attr(t, 'd');
      if (d) { const f = flattenPath(d); pts = f.pts; knots = f.knots; }
    } else if (name === 'rect') {
      const x = Number(attr(t, 'x')), y = Number(attr(t, 'y')), w = Number(attr(t, 'width')), h = Number(attr(t, 'height'));
      pts = [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }, { x, y }];
      knots = pts.slice(0, 4);
    } else if (name === 'circle' || name === 'ellipse') {
      const cx = Number(attr(t, 'cx') || 0), cy = Number(attr(t, 'cy') || 0);
      const rx = Number(attr(t, name === 'circle' ? 'r' : 'rx')), ry = name === 'circle' ? Number(attr(t, 'r')) : Number(attr(t, 'ry'));
      pts = [];
      for (let k = 0; k <= 72; k++) { const a = (k / 72) * 2 * Math.PI; pts.push({ x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) }); }
    }
    if (!pts || !pts.length) continue;
    const P = pts.map((p) => apply(M, p));
    const K = knots.map((p) => apply(M, p));
    const xs = P.map((p) => p.x), ys = P.map((p) => p.y);
    out.push({
      el: name, tag: t.slice(0, 200), fill, stroke, sw, opacity, pts: P, knots: K,
      bbox: { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) },
      isRegion: fill != null && fill !== 'none',
      isStroke: stroke != null && stroke !== 'none' && (fill == null || fill === 'none'),
    });
  }
  return out;
}

export const polyLen = (P) => {
  let L = 0;
  for (let i = 1; i < P.length; i++) L += Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y);
  return L;
};

// fraction of polyline length whose radius from (50,50) exceeds R
export function lenOutside(P, R, cx = 50, cy = 50) {
  let tot = 0, out = 0, maxr = 0;
  const rad = (p) => Math.hypot(p.x - cx, p.y - cy);
  for (let i = 1; i < P.length; i++) {
    const a = P[i - 1], b = P[i];
    const seg = Math.hypot(b.x - a.x, b.y - a.y);
    if (seg === 0) continue;
    const N = 8;
    for (let k = 0; k < N; k++) {
      const t = (k + 0.5) / N;
      const p = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      const r = rad(p);
      if (r > maxr) maxr = r;
      tot += seg / N;
      if (r > R) out += seg / N;
    }
  }
  return { tot, out, frac: tot ? out / tot : 0, maxr };
}

// §4's mechanical curve gate: turn angle at each interior knot.
export function turns(K) {
  const res = [];
  for (let i = 1; i < K.length - 1; i++) {
    const a = K[i - 1], b = K[i], c = K[i + 1];
    if ((a.x === b.x && a.y === b.y) || (b.x === c.x && b.y === c.y)) continue;
    let t = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(b.y - a.y, b.x - a.x);
    while (t > Math.PI) t -= 2 * Math.PI;
    while (t < -Math.PI) t += 2 * Math.PI;
    res.push({ i, deg: Math.abs((t * 180) / Math.PI), at: b });
  }
  return res;
}
