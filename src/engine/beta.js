// Beta preview: features behind this flag are reachable only by profiles a
// parent explicitly flags in Grown-Ups. Beta surfaces are EXEMPT from the
// preservation guarantee — they may change or lose their data as they
// develop (see CLAUDE.md). The flag itself rides subjects (merge-safe).

export const BETA_ROUTES = ['/store'];

export function isBeta(profile) {
  return profile?.subjects?.beta === true;
}
