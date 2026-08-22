// _jn14gen — turn the hairline knots READ OFF the photograph (via _jn14zoom's
// labelled local-unit ladder) into the cubic segments HAIR.Jefferson is written
// in. Catmull-Rom -> Bezier, tension 1/6, so every interior join is G1 by
// construction and D7's tangent measure cannot see it.
//
// The two END tangents are matched to the segments this run splices between —
// the queue's front edge below and the head's own forehead knot above — so the
// splices are not corners either.
//
// This is a generator, not a metric: it prints text for a human to paste.
const K = JSON.parse(process.argv[2]);
const T0 = JSON.parse(process.argv[3] || 'null'); // incoming tangent at K[0]
const T1 = JSON.parse(process.argv[4] || 'null'); // outgoing tangent at K[last]
const n2 = (v) => Math.round(v * 100) / 100;
const seg = [];
for (let i = 0; i < K.length - 1; i++) {
  const p0 = i === 0 ? (T0 ? [K[0][0] - T0[0], K[0][1] - T0[1]] : K[0]) : K[i - 1];
  const p1 = K[i], p2 = K[i + 1];
  const p3 = i + 2 < K.length ? K[i + 2] : (T1 ? [p2[0] + T1[0], p2[1] + T1[1]] : p2);
  const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
  const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
  seg.push(`C ${n2(c1[0])} ${n2(c1[1])} ${n2(c2[0])} ${n2(c2[1])} ${n2(p2[0])} ${n2(p2[1])}`);
}
for (const s of seg) console.log(`    '${s}',`);
