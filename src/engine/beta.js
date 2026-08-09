// Beta preview: features behind this flag are reachable only by profiles a
// parent explicitly flags in Grown-Ups. Beta surfaces are EXEMPT from the
// preservation guarantee — they may change or lose their data as they
// develop (see CLAUDE.md). The flag itself rides subjects (merge-safe).

// Money Math is in preview (v1.54.0): a parent turns it on per profile so
// the track can be driven with a real child before its 134 identities and
// its payouts are locked. NOTE this list is only half the gate —
// `moneyVisible()` in readiness.js carries the same `isBeta` test, because
// gating the route alone would leave every tile and card still pointing at
// a destination that bounces.
export const BETA_ROUTES = ['/money'];

export function isBeta(profile) {
  return profile?.subjects?.beta === true;
}
