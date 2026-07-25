// Beta preview: features behind this flag are reachable only by profiles a
// parent explicitly flags in Grown-Ups. Beta surfaces are EXEMPT from the
// preservation guarantee — they may change or lose their data as they
// develop (see CLAUDE.md). The flag itself rides subjects (merge-safe).

// Nothing is route-gated right now (the store released in v1.32.0);
// the flag and this list stay for the next preview feature.
export const BETA_ROUTES = [];

export function isBeta(profile) {
  return profile?.subjects?.beta === true;
}
